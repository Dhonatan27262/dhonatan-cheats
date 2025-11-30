// ===== [SISTEMA DE TOAST NOTIFICATIONS] ===== //
async function loadToastify() {
    if (typeof Toastify !== 'undefined') return Promise.resolve();

    return new Promise((resolve, reject) => {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css';
        document.head.appendChild(cssLink);

        const jsScript = document.createElement('script');
        jsScript.src = 'https://cdn.jsdelivr.net/npm/toastify-js';
        jsScript.onload = resolve;
        jsScript.onerror = reject;
        document.head.appendChild(jsScript);
    });
}

async function sendToast(text, duration = 5000, gravity = 'bottom') {
    try {
        await loadToastify();
        Toastify({
            text,
            duration,
            gravity,
            position: "center",
            stopOnFocus: true,
            style: { background: "#000000" }
        }).showToast();
    } catch (error) {
        console.error('Erro ao carregar Toastify:', error);
    }
}

function showWelcomeToasts() {
    sendToast("Painel carregado");
}

// ===== [CÓDIGO PRINCIPAL] ===== //
(async function(){
    await loadToastify();
    setTimeout(showWelcomeToasts, 500);

    let fundo, janela, nome, relogio;
    let senhaLiberada = false;
    let abaAtiva = 'textos';
    let posX = localStorage.getItem("dhonatanX") || "20px";
    let posY = localStorage.getItem("dhonatanY") || "20px";
    let corBotao = localStorage.getItem("corBotaoDhonatan") || "#0f0f0f";

    // ---------- INJETAR CSS (ajustes: tamanhos menores + efeito interno mais estável) ----------
    const injectStyles = () => {
        if (document.getElementById('dh-global-styles')) return;
        const style = document.createElement('style');
        style.id = 'dh-global-styles';
        style.textContent = `
        /* base */
        .dh-btn {
            padding: 8px 12px;
            color: #fff;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-weight: 700;
            transition: all .18s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 13px;
            outline: none;
            user-select: none;
        }

        /* header control buttons */
        .dh-header-controls { display:flex; align-items:center; gap:8px; }
        .dh-header-btn { background: transparent; border: 1px solid rgba(255,255,255,0.04); padding:6px 8px; border-radius:8px; cursor:pointer; color:#fff; font-weight:700; }
        .dh-header-btn:hover { background: rgba(255,255,255,0.03); transform: translateY(-2px); }

        /* sidebar nav */
        .sidebar-nav-btn {
            width: 100%;
            text-align: left;
            background: #0f0f0f;
            padding: 10px 12px;
            border-radius: 10px;
            color: #e6e6e6;
            opacity: .95;
            margin-bottom: 8px;
            transition: background .22s ease, transform .12s ease;
            display:block;
            font-size: 14px;
        }
        .sidebar-nav-btn:hover { transform: translateX(6px); background: #151515; }
        .sidebar-nav-btn.active { background: linear-gradient(135deg, #8A2BE2, #4B0082); color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.25); }

        /* main button (Efeito CodePen 24 refeito para não vazar) */
        .main-btn {
    background: linear-gradient(180deg,#36143b,#4b0f5f); /* roxo */
            color:#f0dede;
            padding: 8px 14px;
            border-radius: 10px;
            box-shadow: 0 8px 22px rgba(0,0,0,0.45);
            position: relative;
            overflow: hidden; /* importante: animação ficará dentro do botão */
            display: inline-block;
            font-weight: 800;
            min-width: 130px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.03);
            transition: transform .12s ease;
            font-size: 13px;
        }
        .main-btn:hover{ transform: translateY(-2px); }

        /* quatro spans que animam ao redor do botão (dentro) */
        .main-btn .edge { position:absolute; pointer-events:none; opacity:0.9; border-radius:2px; }
        .main-btn .edge.top {
    left: 0; right: 0; top: 0; height: 2px;
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(168,85,247,0.95), transparent);
    animation: edgeTop 2.2s linear infinite;
}
.main-btn .edge.right {
    top: 0; bottom: 0; right: 0; width: 2px;
    transform: translateY(-100%);
    background: linear-gradient(180deg, transparent, rgba(147,51,234,0.95), transparent);
    animation: edgeRight 2.2s linear .55s infinite;
}
.main-btn .edge.bottom {
    left: 0; right: 0; bottom: 0; height: 2px;
    transform: translateX(100%);
    background: linear-gradient(270deg, transparent, rgba(168,85,247,0.95), transparent);
    animation: edgeBottom 2.2s linear .95s infinite;
}
.main-btn .edge.left {
    top: 0; bottom: 0; left: 0; width: 2px;
    transform: translateY(100%);
    background: linear-gradient(180deg, transparent, rgba(147,51,234,0.95), transparent);
    animation: edgeLeft 2.2s linear 1.5s infinite;
}

        @keyframes edgeTop { 0% { transform: translateX(-100%);} 50% { transform: translateX(0%);} 100% { transform: translateX(100%);} }
        @keyframes edgeRight { 0% { transform: translateY(-100%);} 50% { transform: translateY(0%);} 100% { transform: translateY(100%);} }
        @keyframes edgeBottom { 0% { transform: translateX(100%);} 50% { transform: translateX(0%);} 100% { transform: translateX(-100%);} }
        @keyframes edgeLeft { 0% { transform: translateY(100%);} 50% { transform: translateY(0%);} 100% { transform: translateY(-100%);} }

        .main-btn::before{ content:''; position:absolute; inset:0; background: rgba(255,255,255,0.02); opacity:0; transition: .18s; pointer-events:none; }
        .main-btn:hover::before{ opacity: .05; }

        /* helper small text */
        .dh-small-muted { color: #bdbdbd; font-size: 12px; }

        /* container */
        .dh-container { max-width: 820px; width: 94%; }

        /* botões pequenos e bonitos */
        .small-btn {
            padding: 6px 10px;
            border-radius:14px;
            font-size: 12px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.06);
            color: white;
            cursor: pointer;
            transition: all 0.16s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .small-btn:hover {
            background: rgba(255,255,255,0.12);
            transform: translateY(-2px);
        }

        .small-btn svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
        }

        /* responsive */
        @media (max-width:760px){
            .main-btn { width:100%; box-sizing:border-box; min-width: unset; font-size:14px; }
            .sidebar-nav-btn{ font-size:13px; padding:10px; }
            .dh-btn{ font-size:13px; padding:8px 10px; }
        }
        `;
        document.head.appendChild(style);
    };
    injectStyles();

    // ---------- helpers ----------
    const aplicarEstiloBotao = (elemento, gradiente = false) => {
        elemento.classList.add('dh-btn');
        if (gradiente) elemento.style.background = 'linear-gradient(135deg, #8A2BE2, #4B0082)';
        Object.assign(elemento.style, { outline: 'none' });
    };

    const aplicarEstiloTexto = (elemento, tamanho = '18px') => {
        Object.assign(elemento.style, { color: '#fff', fontSize: tamanho, fontWeight: '700', textAlign: 'center', margin: '8px 0', userSelect: 'none' });
    };

    const aplicarEstiloContainer = (elemento) => {
        Object.assign(elemento.style, {
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.04)',
            maxWidth: '900px',
            width: '94%',
            textAlign: 'center'
        });
    };

    // ---------- funções originais (mantidas INTEIRAS do script que você enviou) ----------
    const mostrarInfoDono = () => {
        if (fundo) try { fundo.remove(); } catch(e){}
        const container = document.createElement('div');
        aplicarEstiloContainer(container);
        container.style.zIndex = '1000001';
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.maxWidth = '420px';

        const titulo = document.createElement('div');
        titulo.textContent = 'Painel Auxilio';
        aplicarEstiloTexto(titulo, '20px');

        const insta = document.createElement('div');
        insta.textContent = 'VERSÃO 3.0';
        aplicarEstiloTexto(insta);

        const info = document.createElement('div');
        info.textContent = 'Mod exclusivo e protegido, feito para poupar seu tempo';
        aplicarEstiloTexto(info);

        const btnFechar = document.createElement('button');
        btnFechar.textContent = 'Fechar';
        aplicarEstiloBotao(btnFechar, true);
        btnFechar.onclick = () => {
            container.remove();
            criarMenu();
        };

        container.append(titulo, insta, info, btnFechar);
        document.body.appendChild(container);
    };

    const trocarCorBotao = () => {
        if (fundo) try { fundo.remove(); } catch(e){}
        let novaCorTemp = corBotao;

        const container = document.createElement('div');
        aplicarEstiloContainer(container);
        container.style.zIndex = '1000001';
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.maxWidth = '420px';

        const titulo = document.createElement('div');
        titulo.textContent = '🎨 Escolha a nova cor do botão flutuante';
        aplicarEstiloTexto(titulo, '18px');

        const seletor = document.createElement("input");
        seletor.type = "color";
        seletor.value = corBotao;
        Object.assign(seletor.style, { width: "100px", height: "100px", border: "none", background: "transparent", cursor: "pointer", margin: '15px 0' });

        seletor.addEventListener("input", (e) => { novaCorTemp = e.target.value; });

        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' });

        const btnAplicar = document.createElement('button');
        btnAplicar.textContent = '✔️ Aplicar';
        aplicarEstiloBotao(btnAplicar, true);
        btnAplicar.onclick = () => {
            if (!novaCorTemp || novaCorTemp === corBotao) return;
            corBotao = novaCorTemp;
            localStorage.setItem("corBotaoDhonatan", corBotao);
            document.querySelectorAll("#dhonatanBotao").forEach(btn => { btn.style.background = corBotao; });
            container.remove();
            sendToast('✔️ Cor alterada com sucesso!', 2000);
            setTimeout(() => criarMenu(), 800);
        };

        const btnCancelar = document.createElement('button');
        btnCancelar.textContent = '❌ Cancelar';
        aplicarEstiloBotao(btnCancelar);
        btnCancelar.onclick = () => { container.remove(); criarMenu(); };

        btnContainer.append(btnAplicar, btnCancelar);
        container.append(titulo, seletor, btnContainer);
        document.body.appendChild(container);
    };

    const coletarPerguntaEAlternativas = () => {
        const perguntaEl = document.querySelector('.question-text, .question-container, [data-qa*="question"]');
        const pergunta = perguntaEl ? perguntaEl.innerText.trim() :
            (document.body.innerText.split('\n').find(t => t.includes('?') && t.length < 200) || '').trim();
        const alternativasEl = Array.from(document.querySelectorAll('[role="option"], .options div, .choice, .answer-text, label, span, p'));
        const alternativasFiltradas = alternativasEl.map(el => el.innerText.trim()).filter(txt =>
            txt.length > 20 && txt.length < 400 && !txt.includes('?') && !txt.toLowerCase().includes(pergunta.toLowerCase())
        );
        const letras = ['a', 'b', 'c', 'd', 'e', 'f'];
        const alternativas = alternativasFiltradas.map((txt, i) => `${letras[i]}) ${txt}`).join('\n');
        return { pergunta, alternativas };
    };

    // ---------- encontrarRespostaColar (OFUSCAÇÃO REMOVIDA; URLs expostas abaixo) ----------
    // OBSERVAÇÃO: deixei abaixo as partes ofuscadas originais como comentário para referência.
    /*
    original primaryParts (ofuscado):
    ['c0RHa','6MH','XYy9yL','2Zuc','NXdiVHa0l','bvNmcl','uQnblRn','1F2Lt92Y',
     'ahBHe','l5W','DMy8Cb','3LwU','VGavMnZlJ','bvMHZh','j9ibpFW','yFGdlx2b',
     'ZyVGc','uV3','mclFGd','GczV','MnauEGdz9','=']
    original fallbackParts (ofuscado):
    ['Hc0RHa','y9yL6M','ZucXY','VHa0l2','lNXdi','nbvNmc','QnblR','a0l2Zu',
     'yajFG','v02bj5','c4VXY','VmbpFG','wIzLs','WbvATN','9ibpF','dlx2bj',
     'GcyFG','uV3ZyV','clFGd','9GczVm','uEGdz','=Mna']
    */
    async function encontrarRespostaColar(options = {}) {
      const debug = !!options.debug;
      sendToast('⌛ Carregando script...', 3000);

      // URLs (ofuscadas removidas; expostas em texto claro)
      const primaryURL = 'https://raw.githubusercontent.com/auxpainel/2050/refs/heads/main/coletarperguntaeresposta.js' + '?' + Date.now();
      const fallbackURL = 'https://raw.githubusercontent.githack.com/auxpainel/2050/main/coletarperguntaeresposta.js' + '?' + Date.now();

      const sleep = ms => new Promise(res => setTimeout(res, ms));

      const looksLikeHtmlError = (txt) => {
        if (!txt || typeof txt !== 'string') return true;
        const t = txt.trim().toLowerCase();
        if (t.length < 40) return true; // muito curto -> provavelmente não é script
        if (t.includes('<!doctype') || t.includes('<html') || t.includes('not found') || t.includes('404') || t.includes('access denied') || t.includes('you have been blocked')) return true;
        return false;
      };

      const fetchWithTimeout = (resource, timeout = 15000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(resource, { signal: controller.signal })
          .finally(() => clearTimeout(id));
      };

      const tryFetchText = async (urls, { attemptsPerUrl = 2, timeout = 15000, backoff = 500 } = {}) => {
        let lastErr = null;
        for (let i = 0; i < urls.length; i++) {
          const u = urls[i];
          for (let attempt = 1; attempt <= attemptsPerUrl; attempt++) {
            try {
              if (debug) console.info(`Tentando fetch (url ${i + 1}/${urls.length}, tentativa ${attempt})...`);
              const res = await fetchWithTimeout(u, timeout);
              if (!res.ok) throw new Error('HTTP ' + res.status);
              const txt = await res.text();
              if (looksLikeHtmlError(txt)) throw new Error('Resposta parece HTML/erro (provável 403/404/CORS)');
              return txt;
            } catch (err) {
              lastErr = err;
              if (debug) console.warn(`Fetch falhou (url ${i + 1}, tentativa ${attempt}):`, err.message);
              // backoff antes da próxima tentativa
              await sleep(backoff * attempt);
            }
          }
          // pequena pausa antes de tentar o próximo URL
          await sleep(200);
        }
        throw lastErr || new Error('Falha ao buscar o script em todas as URLs');
      };

      try {
        const urlsToTry = [primaryURL, fallbackURL];

        const scriptContent = await tryFetchText(urlsToTry, { attemptsPerUrl: 2, timeout: 15000, backoff: 600 });

        if (!scriptContent || scriptContent.length < 50) throw new Error('Conteúdo do script inválido ou vazio');

        try {
          const prev = document.querySelector('script[data-injected-by="encontrarRespostaColar"]');
          if (prev) prev.remove();
        } catch (e) {
          if (debug) console.warn('Não consegui remover script anterior:', e.message);
        }

        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.dataset.injectedBy = 'encontrarRespostaColar';
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);

        sendToast('✔️ Script carregado com sucesso!', 3000);
        if (typeof fundo !== "undefined" && fundo) {
          try { fundo.remove(); } catch(e) { if (debug) console.warn('Erro removendo fundo:', e.message); }
        }
        if (typeof criarBotaoFlutuante === "function") {
          try { criarBotaoFlutuante(); } catch(e) { if (debug) console.warn('Erro executar criarBotaoFlutuante:', e.message); }
        }
        return true;
      } catch (err) {
        console.error('Erro ao carregar script:', err);
        sendToast('❌ Erro ao carregar o script. Veja console para detalhes.', 5000);
        if (debug) {
          console.error('Debug info (não mostra URL):', err);
        }
        return false;
      }
    }

    const encontrarRespostaDigitar = () => {
        const pergunta = prompt("Digite a pergunta:");
        if (!pergunta) return;
        const promptFinal = `Responda de forma direta e clara sem ponto final: ${pergunta}`;
        window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(promptFinal)}`, "_blank");
    };

    const marcarResposta = (resposta) => {
        resposta = resposta.trim().replace(/\.+$/, '').toLowerCase();
        const alternativas = document.querySelectorAll('[role="option"], .options div, .choice, .answer-text, label, span, p');
        let marcada = false;
        alternativas.forEach(el => {
            const txt = el.innerText.trim().toLowerCase();
            if (txt.includes(resposta)) {
                el.style.backgroundColor = '#00ff00';
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                marcada = true;
            }
        });

        if (marcada) {
            sendToast('✔️ Resposta marcada!', 2000);
        } else {
            sendToast('❌ Nenhuma correspondente encontrada.', 2000);
        }
    };
    
    // ---------- modal do Termo de Responsabilidade (chamar antes de criarMenu) ----------
function showTermoResponsabilidade(onAccept, onReject) {
    // cria overlay
    const modal = document.createElement('div');
    Object.assign(modal.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "10000002"
    });

    // caixa interna
    const modalBox = document.createElement('div');
    Object.assign(modalBox.style, {
        background: "#0b0b0b",
        color: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "420px",
        maxWidth: "92%",
        textAlign: "justify",
        boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.04)"
    });

    modalBox.innerHTML = `
      <h2 style="text-align:center; color:#f33; margin:0 0 10px;">📜 Termo de Responsabilidade</h2>
      <div style="max-height:260px; overflow:auto; padding-right:6px; line-height:1.4; color:#ddd;">
        <p>
          Este painel possui sistemas de segurança e proteções internas.
          No entanto, <b>não nos responsabilizamos</b> por qualquer uso
          indevido, danos, prejuízos ou consequências que possam
          resultar da utilização deste software.
        </p>
        <p>
          Ao utilizar este painel, você declara estar ciente e de acordo
          com os termos aqui descritos e se responsabiliza pelo uso que
          fizer das funcionalidades oferecidas.
        </p>
      </div>
      <hr style="border:none; height:1px; background:rgba(255,255,255,0.04); margin:14px 0;">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
        <div style="font-size:12px; color:#aaa;">Copyright © 2025 - MLK MAU</div>
        <div style="display:flex; gap:8px;">
          <button id="btnRecusarTermo" style="
            background:transparent;
            color:#fff;
            border:1px solid rgba(255,255,255,0.12);
            padding:8px 12px;
            border-radius:8px;
            cursor:pointer;
            font-weight:700;
          ">Recusar</button>
          <button id="btnAceitarTermo" style="
            background: linear-gradient(135deg,#8A2BE2,#4B0082);
            color:#fff;
            border:none;
            padding:8px 12px;
            border-radius:8px;
            cursor:pointer;
            font-weight:800;
          ">Eu me responsabilizo</button>
        </div>
      </div>
    `;

    modal.appendChild(modalBox);
    document.body.appendChild(modal);

    // clique fora fecha e trata como recusa
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            if (typeof onReject === 'function') onReject();
        }
    });

    modalBox.querySelector('#btnRecusarTermo').addEventListener('click', () => {
        modal.remove();
        if (typeof onReject === 'function') onReject();
    });

    modalBox.querySelector('#btnAceitarTermo').addEventListener('click', () => {
        modal.remove();
        if (typeof onAccept === 'function') onAccept();
    });
}

    const iniciarMod = () => {
        sendToast("✍️ Toque na área onde deseja digitar o texto.", 3000);
        const handler = (e) => {
            e.preventDefault();
            document.removeEventListener('click', handler, true);
            const el = e.target;
            if (!(el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                sendToast("❌ Esta não é uma área válida para digitação.", 2000);
                criarBotaoFlutuante();
                return;
            }
            const texto = prompt("📋 Cole ou digite o texto:");
            if (!texto) return criarBotaoFlutuante();

            el.focus();
            let i = 0;
            const progresso = document.createElement('div');
            Object.assign(progresso.style, {
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.8)', color: '#fff',
                padding: '10px 20px', borderRadius: '8px',
                zIndex: 9999999, fontSize: '20px'
            });
            document.body.append(progresso);

            const intervalo = setInterval(() => {
                if (i < texto.length) {
                    const c = texto[i++];
                    document.execCommand('insertText', false, c);
                    progresso.textContent = `${Math.round(i / texto.length * 100)}%`;
                } else {
                    clearInterval(intervalo);
                    progresso.remove();
                    el.blur();
                    setTimeout(() => {
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        sendToast("✔️ Texto inserido com sucesso!", 3000);
                        setTimeout(() => criarBotaoFlutuante(), 3000);
                    }, 100);
                }
            }, 40);
        };
        document.addEventListener('click', handler, true);
    };

    const criarTextoComTema = () => {
        const tema = prompt("Qual tema deseja?");
        if (!tema) return;
        const palavras = prompt("Número mínimo de palavras?");
        if (!palavras) return;
        const promptFinal = `Crie um texto com o tema "${tema}" com no mínimo ${palavras} palavras. Seja claro e criativo.`;
        const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(promptFinal)}`;
        window.open(url, "_blank");
    };

    const abrirReescritor = () => {
        window.open(`https://www.reescrevertexto.net`, "_blank");
    };
    
     // Funções adicionais dos botões

    // ===== khanAcademy (OFUSCAÇÃO REMOVIDA; URLs expostas abaixo) =====
    /*
    original primaryChunks/fallbackChunks (ofuscado) foram mantidos como comentário no código original.
    */
    const khanAcademy = async (opts = {}) => {
      const debug = !!opts.debug;
      const toastShort = (msg) => sendToast(msg, 3000);
      const toastLong = (msg) => sendToast(msg, 5000);

      toastShort('⌛ Carregando Script Khan Academy...');

      const primaryURL = 'https://raw.githubusercontent.com/auxpainel/2050/main/script.js' + '?' + Date.now();
      const fallbackURL = 'https://cdn.jsdelivr.net/gh/auxpainel/2050@main/script.js' + '?' + Date.now();

      const sleep = ms => new Promise(res => setTimeout(res, ms));
      const looksLikeHtmlError = txt => {
        if (!txt || typeof txt !== 'string') return true;
        const t = txt.trim().toLowerCase();
        if (t.length < 40) return true;
        return t.includes('<!doctype') || t.includes('<html') || t.includes('not found') || t.includes('404') || t.includes('access denied') || t.includes('you have been blocked');
      };

      const fetchWithTimeout = (resource, timeout = 15000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(resource, { signal: controller.signal }).finally(() => clearTimeout(id));
      };

      const tryFetchText = async (urls, { attemptsPerUrl = 2, timeout = 15000, backoff = 600 } = {}) => {
        let lastErr = null;
        for (let ui = 0; ui < urls.length; ui++) {
          const u = urls[ui];
          for (let attempt = 1; attempt <= attemptsPerUrl; attempt++) {
            try {
              if (debug) console.info(`Tentando (${ui+1}/${urls.length}) tentativa ${attempt}`);
              const res = await fetchWithTimeout(u, timeout);
              if (!res.ok) throw new Error('HTTP ' + res.status);
              const txt = await res.text();
              if (looksLikeHtmlError(txt)) throw new Error('Resposta parece HTML/erro (provável 403/404/CORS)');
              return txt;
            } catch (err) {
              lastErr = err;
              if (debug) console.warn(`Falha (url ${ui+1}, tentativa ${attempt}):`, err.message);
              await sleep(backoff * attempt);
            }
          }
          await sleep(200);
        }
        throw lastErr || new Error('Falha ao buscar o script em todas as URLs');
      };

      try {
        const urlsToTry = [primaryURL, fallbackURL];

        const scriptContent = await tryFetchText(urlsToTry, { attemptsPerUrl: 2, timeout: 15000, backoff: 700 });

        if (!scriptContent || scriptContent.length < 60) throw new Error('Conteúdo do script inválido/curto');

        try {
          const prev = document.querySelector('script[data-injected-by="KhanAcademyScript"]');
          if (prev) prev.remove();
        } catch (e) {
          if (debug) console.warn('Falha ao remover script anterior:', e.message);
        }

        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.dataset.injectedBy = 'KhanAcademyScript';
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);

        // sucesso
        toastShort('✔️ Script Khan Academy carregado!');

        // --- remover overlay/fundo se existir ---
        try {
          if (typeof fundo !== "undefined" && fundo) {
            try { fundo.remove(); } catch (e) { if (debug) console.warn('Erro removendo fundo:', e.message); }
          }
        } catch (e) {
          if (debug) console.warn('Ignorado erro verificando fundo:', e.message);
        }

        // --- criar botão/painel flutuante (se função existir) ---
        try {
          if (typeof criarBotaoFlutuante === "function") {
            try { criarBotaoFlutuante(); } catch (e) { if (debug) console.warn('Erro ao executar criarBotaoFlutuante:', e.message); }
          }
        } catch (e) {
          if (debug) console.warn('Ignorado erro criando botão flutuante:', e.message);
        }

        return true;
      } catch (err) {
        console.error('Erro ao carregar script Khan Academy:', err);
        toastLong('❌ Erro ao carregar script Khan Academy. Veja console.');
        if (debug) console.error('Debug info:', err);
        return false;
      }
    };

    // ===== digitadorV2 (OFUSCAÇÃO REMOVIDA) =====
    const digitadorV2 = async (opts = {}) => {
      const debug = !!opts.debug;
      const toastShort = (m) => sendToast(m, 3000);
      const toastLong = (m) => sendToast(m, 5000);

      try {
        if (typeof fundo !== 'undefined' && fundo) {
          try { fundo.remove(); } catch (e) { if (debug) console.warn('fundo.remove() falhou:', e.message); }
        }
      } catch (e) { if (debug) console.warn('Ignorado erro removendo fundo:', e.message); }

      try {
        if (typeof criarBotaoFlutuante === 'function') {
          try { criarBotaoFlutuante(); } catch (e) { if (debug) console.warn('criarBotaoFlutuante() falhou:', e.message); }
        }
      } catch (e) { if (debug) console.warn('Ignorado erro criando botão flutuante:', e.message); }

      toastShort('⌛ Carregando Digitador v2...');

      // URLs expostas (ofuscacao removida)
      const primaryURL = 'https://raw.githubusercontent.com/auxpainel/2050/main/autodigitador.js?' + Date.now();
      const fallbackURL = 'https://cdn.jsdelivr.net/gh/auxpainel/2050@main/autodigitador.js?' + Date.now();

      const sleep = ms => new Promise(res => setTimeout(res, ms));

      const looksLikeHtmlError = txt => {
        if (!txt || typeof txt !== 'string') return true;
        const t = txt.trim().toLowerCase();
        if (t.length < 40) return true;
        return t.includes('<!doctype') || t.includes('<html') || t.includes('not found') ||
               t.includes('404') || t.includes('access denied') || t.includes('you have been blocked');
      };

      const fetchWithTimeout = (resource, timeout = 15000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(resource, { signal: controller.signal }).finally(() => clearTimeout(id));
      };

      const tryFetchText = async (urls, { attemptsPerUrl = 2, timeout = 15000, backoff = 600 } = {}) => {
        let lastErr = null;
        for (let ui = 0; ui < urls.length; ui++) {
          const u = urls[ui];
          for (let attempt = 1; attempt <= attemptsPerUrl; attempt++) {
            try {
              if (debug) console.info(`Tentando fetch (${ui+1}/${urls.length}) tentativa ${attempt}`);
              const res = await fetchWithTimeout(u, timeout);
              if (!res.ok) throw new Error('HTTP ' + res.status);
              const txt = await res.text();
              if (looksLikeHtmlError(txt)) throw new Error('Resposta parece HTML/erro (provável 403/404/CORS)');
              return txt;
            } catch (err) {
              lastErr = err;
              if (debug) console.warn(`Falha (url ${ui+1}, tentativa ${attempt}):`, err.message);
              await sleep(backoff * attempt);
            }
          }
          await sleep(200);
        }
        throw lastErr || new Error('Falha ao buscar o script em todas as URLs');
      };

      try {
        const urlsToTry = [primaryURL, fallbackURL];

        const scriptContent = await tryFetchText(urlsToTry, { attemptsPerUrl: 2, timeout: 15000, backoff: 700 });

        if (!scriptContent || scriptContent.length < 50) throw new Error('Conteúdo do script inválido ou muito curto');

        try {
          const prev = document.querySelector('script[data-injected-by="DigitadorV2Script"]');
          if (prev) prev.remove();
        } catch (e) { if (debug) console.warn('Não consegui remover script anterior:', e.message); }

        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.dataset.injectedBy = 'DigitadorV2Script';
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);

        toastShort('✔️ Digitador v2 carregado!');
        return true;
      } catch (err) {
        console.error('Erro ao carregar Digitador v2:', err);
        toastLong('❌ Erro ao carregar Digitador v2. Veja console.');
        if (debug) console.error('Debug info:', err);
        return false;
      }
    };

    // ===== jogoDaVelha (OFUSCAÇÃO REMOVIDA) =====
    const jogoDaVelha = async (opts = {}) => {
      const debug = !!opts.debug;
      const toastShort = (m) => sendToast(m, 3000);
      const toastLong = (m) => sendToast(m, 5000);

      toastShort('⌛ Carregando Jogo da Velha...');

      // URLs expostas (raw + cdn)
      const primaryURL = 'https://raw.githubusercontent.com/auxpainel/2050/main/jogodavelha.js?' + Date.now();
      const fallbackURL = 'https://cdn.jsdelivr.net/gh/auxpainel/2050@main/jogodavelha.js?' + Date.now();

      const sleep = ms => new Promise(res => setTimeout(res, ms));

      const looksLikeHtmlError = (txt) => {
        if (!txt || typeof txt !== 'string') return true;
        const t = txt.trim().toLowerCase();
        if (t.length < 40) return true;
        return (
          t.includes('<!doctype') ||
          t.includes('<html') ||
          t.includes('not found') ||
          t.includes('404') ||
          t.includes('access denied') ||
          t.includes('you have been blocked')
        );
      };

      const fetchWithTimeout = (resource, timeout = 15000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(resource, { signal: controller.signal }).finally(() => clearTimeout(id));
      };

      const tryFetchText = async (urls, { attemptsPerUrl = 2, timeout = 15000, backoff = 600 } = {}) => {
        let lastErr = null;
        for (let i = 0; i < urls.length; i++) {
          const u = urls[i];
          for (let attempt = 1; attempt <= attemptsPerUrl; attempt++) {
            try {
              if (debug) console.info(`Tentando fetch (${i+1}/${urls.length}) tentativa ${attempt}`);
              const res = await fetchWithTimeout(u, timeout);
              if (!res.ok) throw new Error('HTTP ' + res.status);
              const txt = await res.text();
              if (looksLikeHtmlError(txt)) throw new Error('Resposta parece HTML/erro (403/404/CORS)');
              return txt;
            } catch (err) {
              lastErr = err;
              if (debug) console.warn(`Falha (url ${i+1}, tentativa ${attempt}):`, err.message);
              await sleep(backoff * attempt);
            }
          }
          await sleep(200);
        }
        throw lastErr || new Error('Falha ao buscar o script em todas as URLs');
      };

      try {
        const urlsToTry = [primaryURL, fallbackURL];

        const scriptContent = await tryFetchText(urlsToTry, { attemptsPerUrl: 2, timeout: 15000, backoff: 700 });

        if (!scriptContent || scriptContent.length < 50) throw new Error('Conteúdo do script inválido ou muito curto');

        try {
          const prev = document.querySelector('script[data-injected-by="JogoDaVelhaScript"]');
          if (prev) prev.remove();
        } catch (e) { if (debug) console.warn('Remover antigo falhou:', e.message); }

        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.dataset.injectedBy = 'JogoDaVelhaScript';
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);

        toastShort('✔️ Carregado!');

        // --- remover fundo/overlay ---
        try {
          if (typeof fundo !== "undefined" && fundo) {
            fundo.remove();
            if (debug) console.log("✅ Fundo removido");
          }
        } catch (e) {
          if (debug) console.warn("Erro removendo fundo:", e.message);
        }

        // --- garantir criação do painel (mesmo que atrase um pouco) ---
        let tentativas = 0;
        const interval = setInterval(() => {
          tentativas++;
          if (typeof criarBotaoFlutuante === "function") {
            try {
              criarBotaoFlutuante();
              if (debug) console.log("✅ Botão flutuante recriado");
            } catch (e) {
              if (debug) console.warn("Erro chamando criarBotaoFlutuante:", e.message);
            }
            clearInterval(interval);
          } else if (tentativas > 10) {
            // para de tentar após ~10 vezes (cerca de 5s se intervalo=500ms)
            clearInterval(interval);
            if (debug) console.warn("⚠️ criarBotaoFlutuante não encontrado após várias tentativas");
          }
        }, 500);

        return true;
      } catch (err) {
        console.error('Erro ao carregar Jogo da Velha:', err);
        toastLong('❌ Erro ao carregar Jogo da Velha. Verifique o console.');
        if (debug) console.error('Debug info:', err);
        return false;
      }
    };

    // ===== Leia PR (OFUSCAÇÃO REMOVIDA; URLs expostas) =====
    const leiaPR = async (opts = {}) => {
      const debug = !!opts.debug;
      const toastShort = (m) => sendToast(m, 3000);
      const toastLong = (m) => sendToast(m, 5000);

      toastShort('⌛ Carregando Leia PR...');

      // URL direta (raw) + fallback (cdn)
      const primaryURL = 'https://raw.githubusercontent.com/auxpainel/2050/main/leiapr.js' + '?' + Date.now();
      const fallbackURL = 'https://cdn.jsdelivr.net/gh/auxpainel/2050@main/leiapr.js' + '?' + Date.now();

      const sleep = ms => new Promise(res => setTimeout(res, ms));

      const looksLikeHtmlError = (txt) => {
        if (!txt || typeof txt !== 'string') return true;
        const t = txt.trim().toLowerCase();
        if (t.length < 40) return true;
        return (
          t.includes('<!doctype') ||
          t.includes('<html') ||
          t.includes('not found') ||
          t.includes('404') ||
          t.includes('access denied') ||
          t.includes('you have been blocked')
        );
      };

      const fetchWithTimeout = (resource, timeout = 15000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(resource, { signal: controller.signal }).finally(() => clearTimeout(id));
      };

      const tryFetchText = async (urls, { attemptsPerUrl = 2, timeout = 15000, backoff = 600 } = {}) => {
        let lastErr = null;
        for (let i = 0; i < urls.length; i++) {
          const u = urls[i];
          for (let attempt = 1; attempt <= attemptsPerUrl; attempt++) {
            try {
              if (debug) console.info(`Tentando fetch (${i+1}/${urls.length}) tentativa ${attempt}`);
              const res = await fetchWithTimeout(u, timeout);
              if (!res.ok) throw new Error('HTTP ' + res.status);
              const txt = await res.text();
              if (looksLikeHtmlError(txt)) throw new Error('Resposta parece HTML/erro (403/404/CORS)');
              return txt;
            } catch (err) {
              lastErr = err;
              if (debug) console.warn(`Falha (url ${i+1}, tentativa ${attempt}):`, err.message);
              await sleep(backoff * attempt);
            }
          }
          await sleep(200);
        }
        throw lastErr || new Error('Falha ao buscar o script em todas as URLs');
      };

      try {
        const urlsToTry = [primaryURL, fallbackURL];

        const scriptContent = await tryFetchText(urlsToTry, { attemptsPerUrl: 2, timeout: 15000, backoff: 700 });

        if (!scriptContent || scriptContent.length < 50) throw new Error('Conteúdo do script inválido ou muito curto');

        try {
          const prev = document.querySelector('script[data-injected-by="LeiaPR"]');
          if (prev) prev.remove();
        } catch (e) { if (debug) console.warn('Remover antigo falhou:', e.message); }

        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.dataset.injectedBy = 'LeiaPR';
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);

        toastShort('✔️ Leia PR carregado!');

        // --- remover fundo/overlay se existir ---
        try {
          if (typeof fundo !== "undefined" && fundo) {
            fundo.remove();
            if (debug) console.log("✅ Fundo removido");
          }
        } catch (e) {
          if (debug) console.warn("Erro removendo fundo:", e.message);
        }

        // --- garantir criação do painel (mesmo que atrase um pouco) ---
        let tentativas = 0;
        const interval = setInterval(() => {
          tentativas++;
          if (typeof criarBotaoFlutuante === "function") {
            try {
              criarBotaoFlutuante();
              if (debug) console.log("✅ Botão flutuante recriado");
            } catch (e) {
              if (debug) console.warn("Erro chamando criarBotaoFlutuante:", e.message);
            }
            clearInterval(interval);
          } else if (tentativas > 10) {
            clearInterval(interval);
            if (debug) console.warn("⚠️ criarBotaoFlutuante não encontrado após várias tentativas");
          }
        }, 500);

        return true;
      } catch (err) {
        console.error('Erro ao carregar Leia PR:', err);
        toastLong('❌ Erro ao carregar Leia PR. Verifique o console.');
        if (debug) console.error('Debug info:', err);
        return false;
      }
    };
    
//semhasaaaa
let senhasCarregadas = false;

const carregarSenhasRemotas = async (opts = {}) => {
  const debug = !!opts.debug;

  // novas partes ofuscadas para https://raw.githubusercontent.com/Dhonatan27262/dhonatan-cheats/main/senhas.js?
const primaryParts = [
  'yL6MHc0RHa',
  '0l2ZucXYy9',
  'mclNXdiVHa',
  'uQnblRnbvN',
  '2boR0Lt92Y',
  'ycjMuFGdh5',
  'mbvhGZvIjN',
  'lh2Yt4WY0F',
  'Wah12LzRXY',
  'FGauV2cv4',
  '==wPzpmLz',
];

// fallback (cdn.jsdelivr) ofuscado para https://cdn.jsdelivr.net/gh/Dhonatan27262/dhonatan-cheats@main/senhas.js?
const fallbackParts = [
  'yL6MHc0RHa',
  'kNnau4GZj9',
  'mbuIndpxWZ',
  'oR0Lod2L0V',
  'jMuFGdh52b',
  'vhGZvIjNyc',
  '2Yt4WY0Fmb',
  'h1GQzRXYlh',
  'GauV2cv4Wa',
  '==wPzpmLzF',
];

  const rebuildFromParts = (parts) => parts.map(p => p.split('').reverse().join('')).join('');

  const sleep = ms => new Promise(res => setTimeout(res, ms));

  const looksLikeHtmlError = (txt) => {
    if (!txt || typeof txt !== 'string') return true;
    const t = txt.trim().toLowerCase();
    if (t.length < 40) return true;
    if (t.includes('<!doctype') || t.includes('<html') || t.includes('not found') ||
        t.includes('404') || t.includes('access denied') || t.includes('you have been blocked')) return true;
    return false;
  };

  const fetchWithTimeout = (resource, timeout = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(resource, { signal: controller.signal }).finally(() => clearTimeout(id));
  };

  const tryFetchText = async (urls, { attemptsPerUrl = 2, timeout = 15000, backoff = 600 } = {}) => {
    let lastErr = null;
    for (let i = 0; i < urls.length; i++) {
      const u = urls[i];
      for (let attempt = 1; attempt <= attemptsPerUrl; attempt++) {
        try {
          if (debug) console.info(`Tentando fetch (url ${i+1}/${urls.length}) tentativa ${attempt}`);
          const res = await fetchWithTimeout(u, timeout);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const txt = await res.text();
          if (looksLikeHtmlError(txt)) throw new Error('Resposta parece HTML/erro (provável 403/404/CORS)');
          return txt;
        } catch (err) {
          lastErr = err;
          if (debug) console.warn(`Falha (url ${i+1}, tentativa ${attempt}):`, err.message);
          await sleep(backoff * attempt);
        }
      }
      await sleep(200);
    }
    throw lastErr || new Error('Falha ao buscar o script em todas as URLs');
  };

  try {
    const primaryBase64 = rebuildFromParts(primaryParts);
    const fallbackBase64 = rebuildFromParts(fallbackParts);

    const primaryURL = atob(primaryBase64) + Date.now();
    const fallbackURL = atob(fallbackBase64) + Date.now();

    const urlsToTry = [primaryURL, fallbackURL];

    const scriptContent = await tryFetchText(urlsToTry, { attemptsPerUrl: 2, timeout: 15000, backoff: 700 });

    if (!scriptContent || scriptContent.length < 50) throw new Error('Conteúdo do script inválido ou muito curto');

    try {
      const prev = document.querySelector('script[data-injected-by="senhasRemotas"]');
      if (prev) prev.remove();
    } catch (e) { if (debug) console.warn('Remover antigo falhou:', e.message); }

    const scriptEl = document.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.dataset.injectedBy = 'senhasRemotas';
    scriptEl.textContent = scriptContent;
    document.head.appendChild(scriptEl);

    if (typeof window.verificarSenha !== 'function') {
      console.warn('Script remoto carregado, mas verificarSenha não foi definida. Usando fallback local.');
      window.verificarSenha = function(senha) {
        const senhasBackup = [
          "Teste24"
        ];
        return senhasBackup.includes(String(senha));
      };
    }

    senhasCarregadas = true;
    if (debug) console.info('Senhas remotas carregadas com sucesso.');
    return true;
  } catch (err) {
    console.error('Falha ao carregar senhas remotas:', err);

    window.verificarSenha = function(senha) {
      const senhasBackup = [
        "Teste24"
      ];
      return senhasBackup.includes(String(senha));
    };
    senhasCarregadas = true;

    sendToast('⚠️ Falha ao carregar senhas remotas — modo offline ativado.', 4000);
    if (debug) console.error('Debug (erro completo):', err);
    return false;
  }
};

        carregarSenhasRemotas();

    // ---------- criarAbasInterface (menu lateral + conteúdo) ----------
    function criarAbasInterface(sidebarEl, mainEl) {
        // definição de botões (mantive funções/existentes)
        const botoes = {
            scripts: [
                { nome: 'Inglês Paraná', func: () => window.open('https://speakify.cupiditys.lol', '_blank') },
                { nome: 'Khan Academy', func: khanAcademy },
                { nome: 'Leia PR', func: leiaPR },
                // === NOVO botão WayGroundX ===
                { nome: 'WayGroundX', func: wayGroundX }
            ],
            textos: [
                { nome: 'Digitador v1', func: () => { if (fundo) try { fundo.remove(); } catch(e){}; iniciarMod(); } },
                { nome: 'Digitador v2', func: digitadorV2 },
                { nome: 'Criar Texto com Tema via IA', func: criarTextoComTema },
                { nome: 'Reescrever Texto (remover plágio)', func: abrirReescritor }
            ],
            respostas: [
                { nome: 'Encontrar Resposta Via Menu', func: encontrarRespostaColar },
                { nome: 'Encontrar Resposta (Digitar)', func: encontrarRespostaDigitar },
                { nome: 'Marcar Resposta (Colar)', func: () => navigator.clipboard.readText().then(r => marcarResposta(r)) },
                { nome: 'Marcar Resposta (Digitar)', func: () => {
                    const r = prompt("Digite a resposta:");
                    if (r) marcarResposta(r);
                }}
            ],
            outros: [
                { nome: 'Extensão libera bloqueio Wifi', func: () => window.open('https://chromewebstore.google.com/detail/x-vpn-free-vpn-chrome-ext/flaeifplnkmoagonpbjmedjcadegiigl', '_blank') },
                { nome: 'Site Jogos Creditos: Everton', func: () => window.open('https://sites.google.com/view/drive-u-7-home/home', '_blank') },
                { nome: 'Jogo da Velha', func: jogoDaVelha }
            ],
            config: [
                { nome: 'Sobre o Mod', func: mostrarInfoDono },
                { nome: 'Alterar cor do Botão Flutuante', func: trocarCorBotao },
                { nome: 'Resetar Painel', func: () => { if (fundo) try { fundo.remove(); } catch(e){}; criarInterface(); } }
]
        };

        // container topo com o texto MENU (restaurado conforme pedido)
        const botoesAbas = document.createElement('div');
        botoesAbas.style.display = 'flex';
        botoesAbas.style.flexDirection = 'column';
        botoesAbas.style.gap = '8px';

        const tituloMenu = document.createElement('div');
        tituloMenu.textContent = 'MENU';
        Object.assign(tituloMenu.style, { fontSize: '12px', color: '#bdbdbd', marginBottom: '6px', fontWeight: '800' });
        botoesAbas.appendChild(tituloMenu);

        ['scripts', 'textos', 'respostas', 'outros', 'config'].forEach((id, idx) => {
            const botaoAba = document.createElement('button');
            botaoAba.textContent = id === 'scripts' ? 'Scripts' : id.charAt(0).toUpperCase() + id.slice(1);
            botaoAba.className = 'sidebar-nav-btn dh-btn';
            if (idx === 0) botaoAba.classList.add('active');
            botaoAba.onclick = () => {
                Array.from(sidebarEl.querySelectorAll('.sidebar-nav-btn')).forEach(b => b.classList.remove('active'));
                botaoAba.classList.add('active');
                renderTabContent(id);
            };
            botoesAbas.appendChild(botaoAba);
        });

        // montar a sidebar: botoesAbas + spacer + footer
        sidebarEl.innerHTML = '';
        sidebarEl.appendChild(botoesAbas);
        const spacer = document.createElement('div');
        spacer.style.flex = '1 1 auto';
        sidebarEl.appendChild(spacer);

        // render inicial
        renderTabContent('scripts');

        function renderTabContent(tabId) {
            mainEl.innerHTML = '';
            const titulo = document.createElement('div');
            titulo.textContent = tabId.toUpperCase();
            Object.assign(titulo.style, { fontSize: '16px', fontWeight: '800', marginBottom: '8px', textAlign: 'left', color: '#ddd' });
            mainEl.appendChild(titulo);

            const separador = document.createElement('div');
            Object.assign(separador.style, { height: '1px', background: 'rgba(255,255,255,0.03)', margin: '6px 0 12px 0' });
            mainEl.appendChild(separador);

            const containerBotoes = document.createElement('div');
            Object.assign(containerBotoes.style, { display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' });

            if (botoes[tabId]) {
                botoes[tabId].forEach(b => {
                    const btn = document.createElement('button');
                    btn.className = 'main-btn dh-btn';
                    btn.textContent = b.nome;

                    // append 4 spans para o efeito (top/right/bottom/left)
                    const sTop = document.createElement('span'); sTop.className = 'edge top';
                    const sRight = document.createElement('span'); sRight.className = 'edge right';
                    const sBottom = document.createElement('span'); sBottom.className = 'edge bottom';
                    const sLeft = document.createElement('span'); sLeft.className = 'edge left';
                    btn.appendChild(sTop); btn.appendChild(sRight); btn.appendChild(sBottom); btn.appendChild(sLeft);

                    btn.onclick = () => {
                        try {
                            const maybe = b.func();
                            if (maybe && typeof maybe.then === 'function') {
                                maybe.catch(err => { console.error(err); sendToast('❌ Erro interno. Veja console.', 3000); });
                            }
                        } catch (err) {
                            console.error('Erro na função:', err);
                            sendToast('❌ Erro interno. Veja console.', 3000);
                        }
                    };
                    containerBotoes.appendChild(btn);
                });
            } else {
                const nada = document.createElement('div');
                nada.textContent = 'Nenhuma função disponível nesta aba.';
                nada.className = 'dh-small-muted';
                containerBotoes.appendChild(nada);
            }

            mainEl.appendChild(containerBotoes);
        }
    }

    // ---------- criarMenu (após login) ----------
const criarMenu = () => {
    if (fundo) try { fundo.remove(); } catch(e){}
    fundo = document.createElement('div');
    Object.assign(fundo.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.82)', zIndex: '999999', display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    janela = document.createElement('div');
    aplicarEstiloContainer(janela);
    janela.style.display = 'flex';
    janela.style.flexDirection = 'column';
    janela.style.width = '92%';
    janela.style.maxWidth = '820px';
    janela.style.height = '56vh';
    janela.style.padding = '0';
    janela.style.overflow = 'hidden';

    // ===== HEADER COMPLETO COM GORRO REPOSICIONADO =====
janela.style.position = "relative"; // permite colocar o gorro por cima do header

const header = document.createElement('div');
Object.assign(header.style, { 
    height: '56px', 
    padding: '12px 16px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottom: '1px solid rgba(255,255,255,0.03)' 
});

// LEFT HEADER
const leftHeader = document.createElement('div');
leftHeader.style.display = 'flex';
leftHeader.style.alignItems = 'center';
leftHeader.style.gap = '12px';

const title = document.createElement('div');
title.textContent = 'PAINEL AUXÍLIO';
Object.assign(title.style, { 
    fontSize: '16px', 
    fontWeight: '900', 
    letterSpacing: '1px', 
    color: '#fff' 
});

leftHeader.appendChild(title);

// Relógio
relogio = document.createElement('div');
relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
Object.assign(relogio.style, { 
    fontSize: '13px', 
    fontFamily: 'monospace', 
    color: '#fff', 
    fontWeight: '700', 
    marginLeft: '8px' 
});
setInterval(() => {
    relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}, 1000);

// RIGHT HEADER (continua existindo, igual ao seu)
const rightHeader = document.createElement('div');
rightHeader.style.display = 'flex';
rightHeader.style.alignItems = 'center';
rightHeader.style.gap = '12px';

// AQUI: O gorro NÃO vai mais dentro do header
// mas vou manter o rightHeader vazio para não quebrar sua estrutura.
header.appendChild(gorro);
header.appendChild(gorro);

// HEADER CONTROLS
const headerControls = document.createElement('div');
headerControls.className = 'dh-header-controls';

const svgClose = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
const svgMin = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

const btnFecharHeader = document.createElement('button');
btnFecharHeader.className = 'dh-header-btn';
btnFecharHeader.innerHTML = svgClose;
btnFecharHeader.title = 'Fechar';
btnFecharHeader.onclick = () => {
    if (fundo) try { fundo.remove(); } catch(e){}
    const botaoFlutuante = document.getElementById('dhonatanBotao');
    if (botaoFlutuante) botaoFlutuante.remove();
};

const btnMinimHeader = document.createElement('button');
btnMinimHeader.className = 'dh-header-btn';
btnMinimHeader.innerHTML = svgMin;
btnMinimHeader.title = 'Minimizar';
btnMinimHeader.onclick = () => {
    if (fundo) try { fundo.remove(); } catch(e){}
    criarBotaoFlutuante();
};

headerControls.appendChild(relogio);
headerControls.appendChild(btnMinimHeader);
headerControls.appendChild(btnFecharHeader);

header.appendChild(headerControls);

// ===== GORRO PENDURADO NA BORDA SUPERIOR =====
const gorroContainer = document.createElement("div");
Object.assign(gorroContainer.style, {
    position: "absolute",
    top: "-28px",         // sobe bastante para ficar pendurado
    right: "-6px",        // encosta na curva da borda
    zIndex: "1000003",
    width: "82px",
    height: "82px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none" // não bloqueia botões
});

const gorroImg = document.createElement("img");
gorroImg.src = "https://raw.githubusercontent.com/auxpainel/2050/refs/heads/main/Natal.png";
gorroImg.alt = "Gorro de Natal";
Object.assign(gorroImg.style, {
    width: "78px",
    height: "78px",
    objectFit: "contain",
    transform: "rotate(-22deg)", // inclinadinho como chapéu pendurado
    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.45))"
});

gorroContainer.appendChild(gorroImg);
janela.appendChild(gorroContainer);

// ===== BODY WRAP (mantido exatamente igual) =====
const bodyWrap = document.createElement('div');
Object.assign(bodyWrap.style, { 
    display: 'flex', 
    flex: '1 1 auto', 
    minHeight: '0', 
    overflow: 'hidden' 
});

    // sidebar
    const sidebar = document.createElement('div');
    Object.assign(sidebar.style, { 
        width: '220px', 
        background: 'linear-gradient(180deg, rgba(18,18,18,0.98), rgba(22,22,22,0.98))', 
        padding: '14px', 
        borderRight: '1px solid rgba(255,255,255,0.03)', 
        display: 'flex', 
        flexDirection: 'column' 
    });

    // texto MENU
    const sidebarTitle = document.createElement('div');
    sidebarTitle.textContent = 'MENU';
    Object.assign(sidebarTitle.style, { 
        fontSize: '12px', 
        color: '#bdbdbd', 
        marginBottom: '8px', 
        fontWeight: '800' 
    });
    sidebar.appendChild(sidebarTitle);

    // main panel
    const mainPanel = document.createElement('div');
    Object.assign(mainPanel.style, { 
        flex: '1 1 auto', 
        padding: '18px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        alignItems: 'stretch' 
    });

    bodyWrap.appendChild(sidebar);
    bodyWrap.appendChild(mainPanel);

    janela.appendChild(header);
    janela.appendChild(bodyWrap);
    fundo.appendChild(janela);
    document.body.appendChild(fundo);

    criarAbasInterface(sidebar, mainPanel);
};

    // ---------- criarInterface (TELA DE LOGIN — restaurada para ORIGINAL) ----------
    const criarInterface = () => {
        if (fundo) try { fundo.remove(); } catch(e){}

        // ---- esta versão foi restaurada para o layout ORIGINAL que você tinha pedido não modificar ----
        fundo = document.createElement('div');
        Object.assign(fundo.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '999999',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        });

        janela = document.createElement('div');
        aplicarEstiloContainer(janela);
        janela.style.maxWidth = '780px';
        janela.style.padding = '28px';
        janela.style.borderRadius = '14px';

        nome = document.createElement('div');
        Object.assign(nome.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
        });

        // Texto SUPERIOR
const textoCima = document.createElement('div');
textoCima.textContent = 'Painel Auxílio';
aplicarEstiloTexto(textoCima, '20px');

// Texto INFERIOR
const textoBaixo = document.createElement('div');
textoBaixo.textContent = 'Tudo para suas atividades de escola aqui!';
aplicarEstiloTexto(textoBaixo, '17px');

// 🔮 Texto de AVISO com fundo roxo gradiente
const textoaviso = document.createElement('div');
textoaviso.textContent = '⚠️ O período de teste gratuito foi encerrado. O acesso agora é exclusivo para usuários pagos. ATENDIMENTO VIA WhatsApp/Discord (COMPRAS DE ACESSO SOMENTE COM MLK MAU) ⚠️';
aplicarEstiloTexto(textoaviso, '19px', 'bold');
textoaviso.style.padding = '8px 12px';
textoaviso.style.margin = '6px 0';
textoaviso.style.border = '2px solid #a85cff';
textoaviso.style.borderRadius = '10px';

// Fundo roxo em degradê suave e moderno
textoaviso.style.background = 'linear-gradient(90deg, #5b00ff, #9b4dff, #5b00ff)';

textoaviso.style.color = 'white';
textoaviso.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.8)';
textoaviso.style.animation = 'brilhoAviso 3s ease-in-out infinite';

// Animação de brilho suave
const estiloAnimacao = document.createElement('style');
estiloAnimacao.textContent = `
@keyframes brilhoAviso {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.15); }
  100% { filter: brightness(1); }
}
`;
document.head.appendChild(estiloAnimacao)

// Adiciona ao container
nome.appendChild(textoCima);
nome.appendChild(textoBaixo);
nome.appendChild(textoaviso);

// ===== Animação colorida do texto INFERIOR =====
let hueBaixo = 0;
setInterval(() => {
  const corAtual = `hsl(${hueBaixo % 360}, 100%, 60%)`;
  textoBaixo.style.color = corAtual;
  hueBaixo++;
}, 30);

        const input = document.createElement('input');
        Object.assign(input.style, {
            padding: '12px',
            width: '80%',
            margin: '15px 0',
            background: '#222',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '30px',
            textAlign: 'center',
            fontSize: '16px'
        });
        input.type = 'password';
        input.placeholder = 'Digite a senha';

        // Botão principal "Acessar"
        let botao = document.createElement('button');
        botao.textContent = 'Acessar';
        aplicarEstiloBotao(botao, true);

        // Botão do Discord
const btnDiscord = document.createElement('button');
btnDiscord.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" style="margin-right:8px"><path fill="currentColor" d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.566-.406.825a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.825.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.05.05 0 0 0-.028.019C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.326a.05.05 0 0 0-.02-.069.07.07 0 0 0-.041-.012 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.043c0-.003.002-.006.005-.009a.05.05 0 0 1 .015-.011c.17-.1.335-.206.495-.32.01-.008.022-.01.033-.003l.006.004c.013.008.02.022.017.035a10.2 10.2 0 0 0 3.172 1.525.05.05 0 0 0 .04-.01 7.96 7.96 0 0 0 3.07-1.525.05.05 0 0 0 .017-.035l.006-.004c.01-.007.022-.005.033.003.16.114.326.22.495.32a.05.05 0 0 1 .015.01c.003.004.005.007.005.01a.05.05 0 0 1-.02.042 8.875 8.875 0 0 1-1.248.595.05.05 0 0 0-.041.012.05.05 0 0 0-.02.07c.236.462.51.905.818 1.325a.05.05 0 0 0 .056.02 13.23 13.23 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.05.05 0 0 0-.028-.019zM5.525 9.992c-.889 0-1.613-.774-1.613-1.727 0-.953.724-1.727 1.613-1.727.89 0 1.613.774 1.613 1.727s-.723 1.727-1.613 1.727zm4.95 0c-.889 0-1.613-.774-1.613-1.727 0-.953.724-1.727 1.613-1.727.89 0 1.613.774 1.613 1.727s-.723 1.727-1.613 1.727z"/></svg> Discord';
aplicarEstiloBotao(btnDiscord);
btnDiscord.style.background = '#5865F2';
btnDiscord.onclick = () => {
    window.open('https://discord.gg/NfVKXRSvYK', '_blank');
};

// Botão do WhatsApp (ao lado do Discord)
const btnWhatsApp = document.createElement('button');
btnWhatsApp.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="18" height="18" viewBox="0 0 24 24" style="margin-right:8px">
        <path d="M12 0C5.372 0 0 5.373 0 12c0 2.116.55 4.148 1.595 5.953L.057 24l6.23-1.59A11.937 11.937 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.936 9.936 0 0 1-5.063-1.373l-.363-.215-3.693.942.985-3.588-.237-.368A9.936 9.936 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm5.207-7.793c-.273-.137-1.613-.797-1.863-.887-.25-.09-.432-.137-.613.137-.182.273-.703.886-.863 1.068-.16.182-.318.205-.59.068-.273-.137-1.154-.425-2.197-1.353-.813-.724-1.363-1.62-1.523-1.893-.16-.273-.017-.42.12-.557.123-.122.273-.318.41-.477.137-.16.182-.273.273-.455.09-.182.045-.34-.022-.477-.068-.137-.613-1.477-.84-2.022-.222-.532-.447-.46-.613-.468-.16-.007-.34-.01-.52-.01s-.477.068-.727.34c-.25.273-.955.933-.955 2.273s.977 2.637 1.113 2.82c.137.182 1.924 2.94 4.662 4.123.652.281 1.16.449 1.555.575.652.208 1.244.178 1.713.108.523-.078 1.613-.66 1.84-1.297.227-.637.227-1.183.16-1.297-.068-.114-.25-.182-.523-.318z"/>
    </svg> WhatsApp
`;
aplicarEstiloBotao(btnWhatsApp);
btnWhatsApp.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';
btnWhatsApp.onclick = () => {
    window.open('https://chat.whatsapp.com/FK6sosUXDZAD1cRhniTu0m?mode=ems_copy_t', '_blank');
};

// Botão do YouTube Manorick
const btnmenor = document.createElement('button');
btnmenor.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="20" height="20" viewBox="0 0 24 24">
        <path d="M19.615 3.184C21.403 3.64 22.76 5.011 23.217 6.799 
        24 9.946 24 12 24 12s0 2.054-.783 5.201c-.457 1.788-1.814 
        3.159-3.602 3.615C17.468 21.6 12 21.6 12 21.6s-5.468 0-8.615-.784C1.597 
        20.36.24 18.989-.217 17.201-.999 14.054-.999 12-.999 
        12s0-2.054.782-5.201C1.24 5.011 2.597 3.64 4.385 
        3.184 7.532 2.4 12 2.4 12 2.4s5.468 0 7.615.784zM9.545 
        8.568v6.864L15.818 12 9.545 8.568z"/>
    </svg> Canal ManoRick
`;
aplicarEstiloBotao(btnmenor);
btnmenor.style.background = 'linear-gradient(135deg, #ff0000, #990000)';
btnmenor.onclick = () => {
    window.open('https://youtube.com/@manorickzin?si=V_71STAk8DLJNhtd', '_blank');
};

// Botão do YouTube Mlk Mau
const btncriadorpainel = document.createElement('button');
btncriadorpainel.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="20" height="20" viewBox="0 0 24 24">
        <path d="M19.615 3.184C21.403 3.64 22.76 5.011 23.217 6.799 
        24 9.946 24 12 24 12s0 2.054-.783 5.201c-.457 1.788-1.814 
        3.159-3.602 3.615C17.468 21.6 12 21.6 12 21.6s-5.468 0-8.615-.784C1.597 
        20.36.24 18.989-.217 17.201-.999 14.054-.999 12-.999 
        12s0-2.054.782-5.201C1.24 5.011 2.597 3.64 4.385 
        3.184 7.532 2.4 12 2.4 12 2.4s5.468 0 7.615.784zM9.545 
        8.568v6.864L15.818 12 9.545 8.568z"/>
    </svg> Canal MlkMau
`;
aplicarEstiloBotao(btncriadorpainel);
btncriadorpainel.style.background = 'linear-gradient(135deg, #ff0000, #990000)';
btncriadorpainel.onclick = () => {
    window.open('https://youtube.com/@mlkmau5960?si=10XFeUjXBoYDa_JQ', '_blank');
};

// Container para os botões
const botoesContainer = document.createElement('div');
Object.assign(botoesContainer.style, {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '10px',
    width: '100%',
    overflowX: 'auto',
    paddingBottom: '5px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#888 #333'
});
botoesContainer.style.msOverflowStyle = 'auto';
botoesContainer.style.overflowY = 'hidden';
botoesContainer.style.flexWrap = 'nowrap';

// Adiciona todos os botões
botoesContainer.append(botao, btnDiscord, btnWhatsApp, btnmenor, btncriadorpainel);

        const erro = document.createElement('div');
        erro.textContent = '❌ Senha incorreta. Clique no botão do Discord/Whatsapp para suporte.';
        Object.assign(erro.style, {
            display: 'none',
            color: '#ff5555',
            marginTop: '15px',
            fontSize: '14px'
        });

        botao.onclick = async () => {
    if (!senhasCarregadas) {
        await carregarSenhasRemotas();
    }

    if (verificarSenha && verificarSenha(input.value)) {
        senhaLiberada = true;

        // remove a tela de login (fundo) e exibe o termo imediatamente
        try { if (fundo) fundo.remove(); } catch(e){}

        showTermoResponsabilidade(
            // onAccept
            () => {
                sendToast("✔️ Obrigado — termo aceito. Entrando no painel...", 3000);
                criarMenu();
            },
            // onReject
            () => {
                sendToast("❌ Acesso cancelado. Você será redirecionado para o login.", 3000);
                // reabrir a interface de login
                setTimeout(() => criarInterface(), 800);
            }
        );

    } else {
        erro.style.display = 'block';
    }
};

        janela.append(nome, input, botoesContainer, erro);
        fundo.append(janela);
        document.body.append(fundo);
    };

    // ---------- criarBotaoFlutuante (mantido) ----------
    const criarBotaoFlutuante = () => {
        const b = document.createElement('div');
        b.id = "dhonatanBotao";
        b.textContent = "Painel";
        Object.assign(b.style, {
            position: 'fixed',
            left: posX,
            top: posY,
            background: corBotao,
            padding: '12px 20px',
            borderRadius: '30px',
            cursor: 'grab',
            zIndex: '999999',
            fontWeight: 'bold',
            userSelect: 'none',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
        });

        aplicarEstiloBotao(b);

        let isDragging = false;
        let startX, startY;
        let initialX, initialY;
        let xOffset = 0, yOffset = 0;
        const DRAG_THRESHOLD = 5;

        b.addEventListener('mousedown', startDrag);
        b.addEventListener('touchstart', startDrag, { passive: false });

        function startDrag(e) {
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;
            initialX = clientX - (parseFloat(b.style.left) || 0);
            initialY = clientY - (parseFloat(b.style.top) || 0);

            isDragging = false;

            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchend', endDrag);
        }

        function handleDragMove(e) {
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

            const dx = clientX - startX;
            const dy = clientY - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (!isDragging && distance > DRAG_THRESHOLD) {
                isDragging = true;
            }

            if (isDragging) {
                const currentX = clientX - initialX;
                const currentY = clientY - initialY;

                b.style.left = `${Math.max(8, Math.min(window.innerWidth - 60, currentX))}px`;
                b.style.top = `${Math.max(8, Math.min(window.innerHeight - 40, currentY))}px`;
                b.style.cursor = 'grabbing';
            }
        }

        function endDrag() {
            if (isDragging) {
                posX = b.style.left;
                posY = b.style.top;
                localStorage.setItem("dhonatanX", posX);
                localStorage.setItem("dhonatanY", posY);
            } else {
                b.remove();
                senhaLiberada ? criarMenu() : criarInterface();
            }

            b.style.cursor = 'grab';
            isDragging = false;

            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchend', endDrag);
        }

        document.body.append(b);
    };

    // ---------- NOVA FUNÇÃO: WayGroundX (puxa quizziz.js) ----------
    async function wayGroundX(opts = {}) {
      const debug = !!opts.debug;
      const toastShort = (m) => sendToast(m, 3000);
      const toastLong = (m) => sendToast(m, 5000);

      toastShort('⌛ Carregando WayGroundX (quizziz.js)...');

      const primaryURL = 'https://raw.githubusercontent.com/auxpainel/2050/main/quizziz.js' + '?' + Date.now();
      const fallbackURL = 'https://cdn.jsdelivr.net/gh/auxpainel/2050@main/quizziz.js' + '?' + Date.now();

      const sleep = ms => new Promise(res => setTimeout(res, ms));

      const looksLikeHtmlError = (txt) => {
        if (!txt || typeof txt !== 'string') return true;
        const t = txt.trim().toLowerCase();
        if (t.length < 40) return true;
        return (
          t.includes('<!doctype') ||
          t.includes('<html') ||
          t.includes('not found') ||
          t.includes('404') ||
          t.includes('access denied') ||
          t.includes('you have been blocked')
        );
      };

      const fetchWithTimeout = (resource, timeout = 15000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(resource, { signal: controller.signal }).finally(() => clearTimeout(id));
      };

      const tryFetchText = async (urls, { attemptsPerUrl = 2, timeout = 15000, backoff = 600 } = {}) => {
        let lastErr = null;
        for (let i = 0; i < urls.length; i++) {
          const u = urls[i];
          for (let attempt = 1; attempt <= attemptsPerUrl; attempt++) {
            try {
              if (debug) console.info(`Tentando fetch (${i+1}/${urls.length}) tentativa ${attempt}`);
              const res = await fetchWithTimeout(u, timeout);
              if (!res.ok) throw new Error('HTTP ' + res.status);
              const txt = await res.text();
              if (looksLikeHtmlError(txt)) throw new Error('Resposta parece HTML/erro (403/404/CORS)');
              return txt;
            } catch (err) {
              lastErr = err;
              if (debug) console.warn(`Falha (url ${i+1}, tentativa ${attempt}):`, err.message);
              await sleep(backoff * attempt);
            }
          }
          await sleep(200);
        }
        throw lastErr || new Error('Falha ao buscar o script em todas as URLs');
      };

      try {
        const urlsToTry = [primaryURL, fallbackURL];

        const scriptContent = await tryFetchText(urlsToTry, { attemptsPerUrl: 2, timeout: 15000, backoff: 700 });

        if (!scriptContent || scriptContent.length < 50) throw new Error('Conteúdo do script inválido ou muito curto');

        try {
          const prev = document.querySelector('script[data-injected-by="WayGroundX"]');
          if (prev) prev.remove();
        } catch (e) { if (debug) console.warn('Falha ao remover script anterior WayGroundX:', e.message); }

        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.dataset.injectedBy = 'WayGroundX';
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);

        toastShort('✔️ WayGroundX carregado!');

        // fechar menu se aberto e recriar botão flutuante
        try { if (fundo) fundo.remove(); } catch(e) {}
        try { if (typeof criarBotaoFlutuante === 'function') criarBotaoFlutuante(); } catch(e) { if (debug) console.warn('Erro criarBotaoFlutuante após WayGroundX:', e.message); }

        return true;
      } catch (err) {
        console.error('Erro ao carregar WayGroundX:', err);
        toastLong('❌ Erro ao carregar WayGroundX. Veja console.');
        if (debug) console.error('Debug info:', err);
        return false;
      }
    }

    // Iniciar o botão flutuante
    criarBotaoFlutuante();
})();
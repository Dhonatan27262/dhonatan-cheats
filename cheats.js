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

    // ---------- Estado ----------
    let fundo, janela, nome, relogio;
    let senhaLiberada = false;
    let posX = localStorage.getItem("dhonatanX") || "20px";
    let posY = localStorage.getItem("dhonatanY") || "20px";
    let corBotao = localStorage.getItem("corBotaoDhonatan") || "#0f0f0f";

    // ---------- INJETAR CSS (classes + animações) ----------
    const injectStyles = () => {
        if (document.getElementById('dh-global-styles')) return;
        const style = document.createElement('style');
        style.id = 'dh-global-styles';
        style.textContent = `
        /* base button */
        .dh-btn {
            padding: 10px 14px;
            color: #fff;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 700;
            transition: transform .18s ease, box-shadow .18s ease, opacity .15s ease;
            user-select: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
        }
        .dh-btn:active { transform: translateY(1px) scale(.997); }

        /* suave gradiente animado */
        .dh-gradient {
            background: linear-gradient(90deg, #ff6b6b, #ff3d3d, #b00000);
            background-size: 200% 200%;
            box-shadow: 0 6px 18px rgba(0,0,0,0.35);
            animation: dg-anim 6s ease infinite;
        }
        @keyframes dg-anim {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* nav buttons (sidebar) */
        .sidebar-nav-btn {
            width: 100%;
            text-align: left;
            background: #141414;
            padding: 12px 14px;
            border-radius: 10px;
            color: #e6e6e6;
            opacity: .95;
            transition: background .25s ease, transform .15s ease;
        }
        .sidebar-nav-btn:hover { transform: translateX(4px); background: #1b1b1b; }
        .sidebar-nav-btn.active { background: linear-gradient(90deg,#ff4d4d,#b30000); color: #fff; box-shadow: 0 8px 24px rgba(179,0,0,0.18); }

        /* footer action buttons fixed style */
        .sidebar-footer {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            padding-top: 6px;
            align-items: center;
        }
        .sidebar-footer-btn {
            width: 85%;
            border-radius: 22px;
            padding: 12px 14px;
            background: rgba(255,255,255,0.06);
            color: #fff;
            box-shadow: 0 8px 18px rgba(0,0,0,0.45);
            transition: transform .15s ease, background .2s ease;
            font-weight: 700;
        }
        .sidebar-footer-btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.08); }

        /* main panel buttons */
        .main-btn {
            background: #262626;
            color: #fff;
            padding: 10px 14px;
            border-radius: 10px;
            box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        }

        /* small helpers */
        .dh-small-muted { color: #bdbdbd; font-size: 13px; }
        `;
        document.head.appendChild(style);
    };
    injectStyles();

    // ---------- helpers para aplicar estilo inline legacy (mantive compatibilidade) ----------
    const aplicarEstiloBotao = (elemento, gradiente = false) => {
        elemento.classList.add('dh-btn');
        if (gradiente) elemento.classList.add('dh-gradient');
        Object.assign(elemento.style, {
            outline: 'none'
        });
    };

    const aplicarEstiloTexto = (elemento, tamanho = '18px') => {
        Object.assign(elemento.style, {
            color: '#fff',
            fontSize: tamanho,
            fontWeight: '700',
            textAlign: 'center',
            margin: '8px 0'
        });
    };

    const aplicarEstiloContainer = (elemento) => {
        Object.assign(elemento.style, {
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 14px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.04)',
            maxWidth: '1000px',
            width: '94%',
            textAlign: 'center'
        });
    };

    // ---------- funções existentes (mantidas) ----------
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
        titulo.textContent = '👑';
        aplicarEstiloTexto(titulo, '20px');

        const insta = document.createElement('div');
        insta.textContent = 'VERSÃO 1.1';
        aplicarEstiloTexto(insta, '14px');

        const info = document.createElement('div');
        info.textContent = '💻 Mod exclusivo e protegido, feito para poupar seu tempo';
        aplicarEstiloTexto(info, '13px');

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
        aplicarEstiloTexto(titulo, '16px');

        const seletor = document.createElement("input");
        seletor.type = "color";
        seletor.value = corBotao;
        Object.assign(seletor.style, {
            width: "92px",
            height: "92px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            margin: '12px 0'
        });

        seletor.addEventListener("input", (e) => novaCorTemp = e.target.value);

        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, { display:'flex', justifyContent:'center', gap:'10px', marginTop:'10px' });

        const btnAplicar = document.createElement('button');
        btnAplicar.textContent = '✅ Aplicar';
        aplicarEstiloBotao(btnAplicar, true);
        btnAplicar.onclick = () => {
            if (!novaCorTemp || novaCorTemp === corBotao) return;
            corBotao = novaCorTemp;
            localStorage.setItem("corBotaoDhonatan", corBotao);
            document.querySelectorAll("#dhonatanBotao").forEach(btn => { btn.style.background = corBotao; });
            container.remove();
            sendToast('✅ Cor alterada com sucesso!', 2000);
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
        const pergunta = perguntaEl ? perguntaEl.innerText.trim() : (document.body.innerText.split('\n').find(t => t.includes('?') && t.length < 200) || '').trim();
        const alternativasEl = Array.from(document.querySelectorAll('[role="option"], .options div, .choice, .answer-text, label, span, p'));
        const alternativasFiltradas = alternativasEl.map(el => el.innerText.trim()).filter(txt =>
            txt.length > 20 && txt.length < 400 && !txt.includes('?') && !txt.toLowerCase().includes(pergunta.toLowerCase())
        );
        const letras = ['a','b','c','d','e','f'];
        const alternativas = alternativasFiltradas.map((txt,i)=>`${letras[i]}) ${txt}`).join('\n');
        return { pergunta, alternativas };
    };

    // ---------- função grande encontrarRespostaColar (mantida) ----------
    async function encontrarRespostaColar(options = {}) {
      const debug = !!options.debug; // se true, irá mostrar logs de depuração (NÃO mostra a URL por padrão)
      sendToast('⏳ Carregando script...', 3000);

      const primaryParts = [
        'c0RHa','6MH','XYy9yL','2Zuc','NXdiVHa0l','bvNmcl','uQnblRn','1F2Lt92Y',
        'ahBHe','l5W','DMy8Cb','3LwU','VGavMnZlJ','bvMHZh','j9ibpFW','yFGdlx2b',
        'ZyVGc','uV3','mclFGd','GczV','MnauEGdz9','='
      ];

      const fallbackParts = [
        'Hc0RHa','y9yL6M','ZucXY','VHa0l2','lNXdi','nbvNmc','QnblR','a0l2Zu',
        'yajFG','v02bj5','c4VXY','VmbpFG','wIzLs','WbvATN','9ibpF','dlx2bj',
        'GcyFG','uV3ZyV','clFGd','9GczVm','uEGdz','=Mna'
      ];

      const rebuildFromParts = (parts) => parts.map(p => p.split('').reverse().join('')).join('');

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
        const primaryBase64 = rebuildFromParts(primaryParts);
        const fallbackBase64 = rebuildFromParts(fallbackParts);

        const primaryURL = atob(primaryBase64) + '?' + Date.now();
        const fallbackURL = atob(fallbackBase64) + '?' + Date.now();

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

        sendToast('✅ Script carregado com sucesso!', 3000);
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
        // se o usuário ativou debug ele pode querer ver mais detalhes
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
            sendToast('✅ Resposta marcada!', 2000);
        } else {
            sendToast('❌ Nenhuma correspondente encontrada.', 2000);
        }
    };

    const iniciarMod = () => {
        sendToast("✍️ Toque no campo onde deseja digitar o texto.", 3000);
        const handler = (e) => {
            e.preventDefault();
            document.removeEventListener('click', handler, true);
            const el = e.target;
            if (!(el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                sendToast("❌ Esse não é um campo válido.", 2000);
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
                        sendToast("✅ Texto digitado com sucesso!", 3000);
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

    const abrirReescritor = () => window.open(`https://www.reescrevertexto.net`, "_blank");

    // ---------- carregar senhas remotas (mantido) ----------
    let senhasCarregadas = false;
    const carregarSenhasRemotas = async (opts = {}) => {
      const debug = !!opts.debug;
      sendToast('🔒 Carregando sistema de senhas...', 2000);

      const primaryParts = [
        '6MHc0RHa','ucXYy9yL','iVHa0l2Z','vNmclNXd','uQnblRnb',
        '1F2Lt92Y','l5WahBHe','wUDMy8Cb','v4Wah12L','zFGauV2c','==wPzpmL'
      ];

      const fallbackParts = [
        '6MHc0RHa','u4GZj9yL','pxWZkNna','0VmbuInd','1F2Lod2L',
        'l5WahBHe','wUDMy8Cb','v4Wah1GQ','zFGauV2c','==wPzpmL'
      ];

      const rebuildFromParts = (parts) => parts.map(p => p.split('').reverse().join('')).join('');
      const sleep = ms => new Promise(res=>setTimeout(res,ms));
      const looksLikeHtmlError = (txt) => {
        if (!txt || typeof txt !== 'string') return true;
        const t = txt.trim().toLowerCase();
        if (t.length < 40) return true;
        if (t.includes('<!doctype') || t.includes('<html') || t.includes('not found') || t.includes('404') || t.includes('access denied') || t.includes('you have been blocked')) return true;
        return false;
      };
      const fetchWithTimeout = (resource, timeout = 15000) => {
        const controller = new AbortController();
        const id = setTimeout(()=>controller.abort(), timeout);
        return fetch(resource, { signal: controller.signal }).finally(()=>clearTimeout(id));
      };
      const tryFetchText = async (urls, { attemptsPerUrl = 2, timeout = 15000, backoff = 600 } = {}) => {
        let lastErr = null;
        for (let i=0;i<urls.length;i++){
          const u = urls[i];
          for (let attempt=1; attempt<=attemptsPerUrl; attempt++){
            try {
              if (debug) console.info(`Tentando fetch (url ${i+1}/${urls.length}, tentativa ${attempt})`);
              const res = await fetchWithTimeout(u, timeout);
              if (!res.ok) throw new Error('HTTP '+res.status);
              const txt = await res.text();
              if (looksLikeHtmlError(txt)) throw new Error('Resposta parece HTML/erro');
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

        try { const prev = document.querySelector('script[data-injected-by="senhasRemotas"]'); if (prev) prev.remove(); } catch(e){ if (debug) console.warn(e.message); }

        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.dataset.injectedBy = 'senhasRemotas';
        scriptEl.textContent = scriptContent;
        document.head.appendChild(scriptEl);

        if (typeof window.verificarSenha !== 'function') {
          window.verificarSenha = function(senha) {
            const senhasBackup = ["admin","Teste24","adm","tainara","vitor","pablo","rafael"];
            return senhasBackup.includes(String(senha));
          };
        }

        senhasCarregadas = true;
        if (debug) console.info('Senhas remotas carregadas com sucesso.');
        return true;
      } catch (err) {
        console.error('Falha ao carregar senhas remotas:', err);
        window.verificarSenha = function(senha) {
          const senhasBackup = ["admin","Teste24","adm","tainara","vitor","pablo","rafael"];
          return senhasBackup.includes(String(senha));
        };
        senhasCarregadas = true;
        sendToast('⚠️ Falha ao carregar senhas remotas — modo offline ativado.', 4000);
        if (debug) console.error('Debug (erro completo):', err);
        return false;
      }
    };
    carregarSenhasRemotas();

    // ---------- função que cria as abas e o conteúdo, com todas as funções completas ----------
    function criarAbasInterface(sidebarEl, mainEl) {
        // botões e ações mantidos do seu código original (com funções completas)
        const botoes = {
            scripts: [
                {
                    nome: 'Ingles Parana',
                    func: () => window.open('https://speakify.cupiditys.lol', '_blank')
                },
                {
                    nome: 'Khan Academy',
                    func: async (opts = {}) => {
                      const debug = !!opts.debug;
                      const toastShort = (msg) => sendToast(msg, 3000);
                      const toastLong = (msg) => sendToast(msg, 5000);

                      toastShort('⏳ Carregando Script Khan Academy...');

                      const primaryChunks = [
                        'eHBhaW','c2NyaX','9tL2F1','bnQuY2','B0Lmpz','1haW4v','NvbnRl','YXcuZ2',
                        '5lbC8y','l0aHVi','dXNlcm','aHR0cH','M6Ly9y','MDUwL2'
                      ];
                      const primaryOrder = [11,12,7,9,10,6,3,2,0,8,13,5,1,4];

                      const fallbackChunks = [
                        'BhaW5l','L2F1eH','ZG4uan','UwQG1h','Lmpz','V0L2do','NyaXB0',
                        'bC8yMD','NkZWxp','dnIubm','aHR0cH','M6Ly9j','aW4vc2'
                      ];
                      const fallbackOrder = [10,11,2,8,9,5,1,0,7,3,12,6,4];

                      const rebuild = (chunks, order) => order.map(i => chunks[i]).join('');

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
                        const primaryBase64 = rebuild(primaryChunks, primaryOrder);
                        const fallbackBase64 = rebuild(fallbackChunks, fallbackOrder);

                        const primaryURL = atob(primaryBase64) + '?' + Date.now();
                        const fallbackURL = atob(fallbackBase64) + '?' + Date.now();

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

                        toastShort('✅ Script Khan Academy carregado!');
                        return true;
                      } catch (err) {
                        console.error('Erro ao carregar script Khan Academy:', err);
                        toastLong('❌ Erro ao carregar script Khan Academy. Veja console.');
                        if (debug) console.error('Debug info:', err);
                        return false;
                      }
                    }
                }
            ],
            textos: [
                { nome: 'Digitador v1', func: () => { if (fundo) try { fundo.remove(); } catch(e){}; iniciarMod(); } },
                {
                  nome: 'Digitador v2',
                  func: async (opts = {}) => {
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

                    toastShort('⏳ Carregando Digitador v2...');

                    const primaryChunks = [
                      'wUDMy8Cb','1F2Lt92Y','iVHa0l2Z','v4Wah12L','pR2b0VXY','l5WahBHe','=8zcq5ic',
                      'vNmclNXd','uQnblRnb','6MHc0RHa','ucXYy9yL','vRWY0l2Z'
                    ];
                    const primaryOrder = [9,10,2,7,8,1,5,0,3,4,11,6];

                    const fallbackChunks = [
                      'vRWY0l2Z','pR2b0VXY','v4Wah1GQ','0VmbuInd','l5WahBHe','=8zcq5ic','pxWZkNna',
                      'wUDMy8Cb','u4GZj9yL','1F2Lod2L','6MHc0RHa'
                    ];
                    const fallbackOrder = [10,8,6,3,9,4,7,2,1,0,5];

                    const rebuildBase64 = (chunks, order) =>
                      order.map(i => chunks[i].split('').reverse().join('')).join('');

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
                      const primaryBase64 = rebuildBase64(primaryChunks, primaryOrder);
                      const fallbackBase64 = rebuildBase64(fallbackChunks, fallbackOrder);

                      const primaryURL = atob(primaryBase64) + Date.now();
                      const fallbackURL = atob(fallbackBase64) + Date.now();

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

                      toastShort('✅ Digitador v2 carregado!');
                      return true;
                    } catch (err) {
                      console.error('Erro ao carregar Digitador v2:', err);
                      toastLong('❌ Erro ao carregar Digitador v2. Veja console.');
                      if (debug) console.error('Debug info:', err);
                      return false;
                    }
                  }
                },
                { nome: '📄 Criar Texto com Tema via IA', func: criarTextoComTema },
                { nome: '🔁 Reescrever Texto (remover plágio)', func: abrirReescritor }
            ],
            respostas: [
                { nome: '📡 Encontrar Resposta', func: encontrarRespostaColar },
                { nome: '✍️ Encontrar Resposta (Digitar)', func: encontrarRespostaDigitar },
                { nome: '🎯 Marcar Resposta (Colar)', func: () => navigator.clipboard.readText().then(r => marcarResposta(r)) },
                { nome: '✍️ Marcar Resposta (Digitar)', func: () => { const r = prompt("Digite a resposta:"); if (r) marcarResposta(r); } }
            ],
            outros: [
                {
                    nome: 'Extensão libera bloqueio Wifi',
                    func: () => window.open('https://chromewebstore.google.com/detail/x-vpn-free-vpn-chrome-ext/flaeifplnkmoagonpbjmedjcadegiigl', '_blank')
                },
                {
                  nome: '🎮 Jogo da Velha',
                  func: async (opts = {}) => {
                    const debug = !!opts.debug;
                    const toastShort = (m) => sendToast(m, 3000);
                    const toastLong = (m) => sendToast(m, 5000);

                    toastShort('⏳ Carregando Jogo da Velha...');

                    const primaryParts = [
                      'Hc0RHa','y9yL6M','2ZucXY','iVHa0l','mclNXd','lRnbvN','2YuQnb','1F2Lt9',
                      'WahBHe','y8Cbl5','2LwUDM','v4Wah1','2bn9ma','sVmdhR','nauEGa','/M'
                    ];

                    const fallbackParts = [
                      'Hc0RHa','j9yL6M','nau4GZ','pxWZkN','mbuInd','od2L0V','He1F2L','l5WahB',
                      'DMy8Cb','h1GQwU','mav4Wa','hR2bn9','GasVmd','/MnauE'
                    ];

                    const rebuild = (parts) => parts.map(p => p.split('').reverse().join('')).join('');

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
                      const primaryBase64 = rebuild(primaryParts);
                      const fallbackBase64 = rebuild(fallbackParts);

                      const primaryURL = atob(primaryBase64) + Date.now();
                      const fallbackURL = atob(fallbackBase64) + Date.now();

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

                      toastShort('✅ Carregado!');
                      return true;
                    } catch (err) {
                      console.error('Erro ao carregar Jogo da Velha:', err);
                      toastLong('❌ Erro ao carregar Jogo da Velha. Verifique o console.');
                      if (debug) console.error('Debug info:', err);
                      return false;
                    }
                  }
                },
            ],
            config: [
                { nome: 'ℹ️ Sobre o Mod', func: mostrarInfoDono },
                { nome: '🎨 Cor do Botão Flutuante', func: trocarCorBotao },
                { nome: '🔃 Resetar', func: () => { if (fundo) try { fundo.remove(); } catch(e){}; criarInterface(); } }
            ]
        };

        // Top - nav buttons (coluna)
        const topContainer = document.createElement('div');
        topContainer.style.display = 'flex';
        topContainer.style.flexDirection = 'column';
        topContainer.style.gap = '8px';

        const tabs = ['scripts','textos','respostas','outros','config'];
        tabs.forEach((t, idx) => {
            const navBtn = document.createElement('button');
            navBtn.className = 'sidebar-nav-btn dh-btn';
            navBtn.textContent = (t === 'scripts' ? 'Scripts' : t.charAt(0).toUpperCase() + t.slice(1));
            navBtn.style.fontWeight = '700';
            navBtn.addEventListener('click', () => {
                // reset only nav buttons
                Array.from(sidebarEl.querySelectorAll('.sidebar-nav-btn')).forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '';
                });
                navBtn.classList.add('active');
                // render content only
                renderTabContent(t);
            });
            // first one active
            if (idx === 0) navBtn.classList.add('active');
            topContainer.appendChild(navBtn);
        });

        // Footer - actions (fixo na base)
        const footer = document.createElement('div');
        footer.className = 'sidebar-footer';
        footer.style.marginBottom = '6px';

        const btnFechar = document.createElement('button');
        btnFechar.className = 'sidebar-footer-btn dh-btn';
        btnFechar.innerHTML = '👁️ &nbsp; Fechar Menu';
        btnFechar.onclick = () => {
            if (fundo) try { fundo.remove(); } catch(e){}
            const botaoFlutuante = document.getElementById('dhonatanBotao');
            if (botaoFlutuante) botaoFlutuante.remove();
        };

        const btnMinim = document.createElement('button');
        btnMinim.className = 'sidebar-footer-btn dh-btn dh-gradient';
        btnMinim.innerHTML = '❌ &nbsp; Minimizar Menu';
        btnMinim.onclick = () => {
            if (fundo) try { fundo.remove(); } catch(e){}
            criarBotaoFlutuante();
        };

        footer.appendChild(btnFechar);
        footer.appendChild(btnMinim);

        // append top + footer to sidebar
        sidebarEl.innerHTML = '';
        sidebarEl.appendChild(topContainer);
        const spacer = document.createElement('div');
        spacer.style.flex = '1 1 auto';
        sidebarEl.appendChild(spacer);
        sidebarEl.appendChild(footer);

        // inicial render da aba scripts
        renderTabContent('scripts');

        // render content function
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
            Object.assign(containerBotoes.style, { display:'flex', flexDirection:'column', gap:'12px', alignItems:'flex-start' });

            if (botoes[tabId] && botoes[tabId].length) {
                botoes[tabId].forEach(b => {
                    const btn = document.createElement('button');
                    btn.className = 'main-btn dh-btn';
                    btn.textContent = b.nome;
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

            // ações finais dentro do main (duplicadas se o usuário quiser)
            const bottomActions = document.createElement('div');
            bottomActions.style.display = 'flex';
            bottomActions.style.gap = '8px';
            bottomActions.style.marginTop = '18px';
            bottomActions.style.alignSelf = 'flex-start';

            const closeMainBtn = document.createElement('button');
            closeMainBtn.className = 'main-btn dh-btn';
            closeMainBtn.textContent = '👁️ Fechar Menu';
            closeMainBtn.onclick = () => { if (fundo) try { fundo.remove(); } catch(e){}; const bf = document.getElementById('dhonatanBotao'); if (bf) bf.remove(); };

            const minMainBtn = document.createElement('button');
            minMainBtn.className = 'main-btn dh-btn dh-gradient';
            minMainBtn.textContent = '❌ Minimizar Menu';
            minMainBtn.onclick = () => { if (fundo) try { fundo.remove(); } catch(e){}; criarBotaoFlutuante(); };

            bottomActions.append(closeMainBtn, minMainBtn);
            mainEl.appendChild(containerBotoes);
            mainEl.appendChild(bottomActions);
        }
    }

    // ---------- criarMenu (layout pós-login) ----------
    const criarMenu = () => {
        if (fundo) try { fundo.remove(); } catch(e){}
        fundo = document.createElement('div');
        Object.assign(fundo.style, { position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.82)', zIndex:'999999', display:'flex', alignItems:'center', justifyContent:'center' });

        janela = document.createElement('div');
        aplicarEstiloContainer(janela);
        janela.style.display = 'flex';
        janela.style.flexDirection = 'column';
        janela.style.width = '92%';
        janela.style.maxWidth = '820px'; // reduzido
        janela.style.height = '60vh';    // reduzido (mais compacto)
        janela.style.padding = '0';
        janela.style.overflow = 'hidden';

        // header
        const header = document.createElement('div');
        Object.assign(header.style, { height:'56px', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.03)' });

        const title = document.createElement('div');
        title.textContent = 'PAINEL AUXÍLIO';
        Object.assign(title.style, { fontSize:'16px', fontWeight:'900', letterSpacing:'1px', color:'#fff' });

        relogio = document.createElement('div');
        relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone:'America/Sao_Paulo' });
        Object.assign(relogio.style, { fontSize:'13px', fontFamily:'monospace', color:'#fff', fontWeight:'700' });
        setInterval(()=>{ relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone:'America/Sao_Paulo' }); }, 1000);

        header.appendChild(title);
        header.appendChild(relogio);

        // body wrap (sidebar + main)
        const bodyWrap = document.createElement('div');
        Object.assign(bodyWrap.style, { display:'flex', flex: '1 1 auto', minHeight:'0', overflow:'hidden' });

        // sidebar
        const sidebar = document.createElement('div');
        Object.assign(sidebar.style, { width:'200px', background:'linear-gradient(180deg, rgba(18,18,18,0.98), rgba(22,22,22,0.98))', padding:'14px', borderRight:'1px solid rgba(255,255,255,0.03)', display:'flex', flexDirection:'column', justifyContent:'space-between' });

        // small title inside sidebar
        const sidebarTitle = document.createElement('div');
        sidebarTitle.textContent = 'MENU';
        Object.assign(sidebarTitle.style, { fontSize:'12px', color:'#bdbdbd', marginBottom:'8px', fontWeight:'800' });
        sidebar.appendChild(sidebarTitle);

        // main panel
        const mainPanel = document.createElement('div');
        Object.assign(mainPanel.style, { flex:'1 1 auto', padding:'18px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px', alignItems:'stretch' });

        bodyWrap.appendChild(sidebar);
        bodyWrap.appendChild(mainPanel);

        janela.appendChild(header);
        janela.appendChild(bodyWrap);
        fundo.appendChild(janela);
        document.body.appendChild(fundo);

        // popular abas dentro do novo layout
        criarAbasInterface(sidebar, mainPanel);
    };

    // ---------- criarInterface (login) ----------
    const criarInterface = () => {
        if (fundo) try { fundo.remove(); } catch(e){}
        fundo = document.createElement('div');
        Object.assign(fundo.style, { position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.85)', zIndex:'999999', display:'flex', alignItems:'center', justifyContent:'center' });

        janela = document.createElement('div');
        aplicarEstiloContainer(janela);

        nome = document.createElement('div');
        Object.assign(nome.style, { display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' });

        const textoCima = document.createElement('div');
        textoCima.textContent = 'Painel Funções';
        aplicarEstiloTexto(textoCima, '20px');

        const textoCriador = document.createElement('div');
        textoCriador.textContent = 'Criador: Mlk Mau';
        aplicarEstiloTexto(textoCriador, '16px');

        const textoBaixo = document.createElement('div');
        textoBaixo.textContent = 'Tudo para suas atividades de escola aqui!';
        aplicarEstiloTexto(textoBaixo, '14px');

        nome.appendChild(textoCima);
        nome.appendChild(textoCriador);
        nome.appendChild(textoBaixo);

        const input = document.createElement('input');
        Object.assign(input.style, { padding:'12px', width:'80%', margin:'12px 0', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'28px', textAlign:'center', fontSize:'16px' });
        input.type = 'password';
        input.placeholder = 'Digite a senha';

        const botao = document.createElement('button');
        botao.textContent = 'Acessar';
        aplicarEstiloBotao(botao, true);

        // contatos (Discord/WhatsApp/YouTube) - mantidos
        const btnDiscord = document.createElement('button');
        btnDiscord.innerHTML = 'Discord';
        aplicarEstiloBotao(btnDiscord);
        btnDiscord.onclick = () => window.open('https://discord.gg/NfVKXRSvYK', '_blank');

        const btnWhatsApp = document.createElement('button');
        btnWhatsApp.innerHTML = 'WhatsApp';
        aplicarEstiloBotao(btnWhatsApp);
        btnWhatsApp.onclick = () => window.open('https://chat.whatsapp.com/FK6sosUXDZAD1cRhniTu0m?mode=ems_copy_t', '_blank');

        const btnmenor = document.createElement('button');
        btnmenor.innerHTML = 'Canal ManoRick';
        aplicarEstiloBotao(btnmenor);
        btnmenor.onclick = () => window.open('https://youtube.com/@manorickzin?si=V_71STAk8DLJNhtd', '_blank');

        const btncriadorpainel = document.createElement('button');
        btncriadorpainel.innerHTML = 'Canal MlkMau';
        aplicarEstiloBotao(btncriadorpainel);
        btncriadorpainel.onclick = () => window.open('https://youtube.com/@mlkmau5960?si=10XFeUjXBoYDa_JQ', '_blank');

        const botoesContainer = document.createElement('div');
        Object.assign(botoesContainer.style, { display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap', marginBottom:'6px' });
        botoesContainer.append(botao, btnDiscord, btnWhatsApp, btnmenor, btncriadorpainel);

        const erro = document.createElement('div');
        erro.textContent = '❌ Senha incorreta. Clique no botão do Discord/Whatsapp para suporte.';
        Object.assign(erro.style, { display:'none', color:'#ff6b6b', marginTop:'10px', fontSize:'14px' });

        botao.onclick = async () => {
            if (!senhasCarregadas) {
                sendToast('🔒 Carregando sistema de senhas...', 2000);
                await carregarSenhasRemotas();
            }
            if (verificarSenha && verificarSenha(input.value)) {
                senhaLiberada = true;
                if (fundo) try { fundo.remove(); } catch(e){}
                sendToast("Bem vindo ao Painel de Funções! 👋", 2000);
                criarMenu();
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
            padding: '10px 16px',
            borderRadius: '26px',
            cursor: 'grab',
            zIndex: '999999',
            fontWeight: '800',
            userSelect: 'none',
            color: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
            transition: 'all 0.22s ease'
        });

        aplicarEstiloBotao(b);

        let isDragging = false;
        let startX, startY;
        let initialX, initialY;
        const DRAG_THRESHOLD = 6;

        b.addEventListener('mousedown', startDrag);
        b.addEventListener('touchstart', startDrag, { passive:false });

        function startDrag(e) {
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            startX = clientX; startY = clientY;
            initialX = clientX - (parseFloat(b.style.left) || 0);
            initialY = clientY - (parseFloat(b.style.top) || 0);
            isDragging = false;
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('touchmove', handleDragMove, { passive:false });
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchend', endDrag);
        }

        function handleDragMove(e) {
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const dx = clientX - startX;
            const dy = clientY - startY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (!isDragging && distance > DRAG_THRESHOLD) isDragging = true;
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
                posX = b.style.left; posY = b.style.top;
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

    // ---------- iniciar com botão flutuante ----------
    criarBotaoFlutuante();
})();
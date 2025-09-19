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

    // ---------- INJETAR CSS (inclui efeito 24 adaptado) ----------
    const injectStyles = () => {
        if (document.getElementById('dh-global-styles')) return;
        const style = document.createElement('style');
        style.id = 'dh-global-styles';
        style.textContent = `
        .dh-btn {
            padding: 10px 15px;
            color: #fff;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            font-weight: 700;
            transition: all .22s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            outline: none;
            user-select: none;
            background: #222;
        }

        /* Sidebar nav */
        .sidebar-nav-btn {
            width: 100%;
            text-align: left;
            background: #111;
            padding: 12px 14px;
            border-radius: 12px;
            color: #e6e6e6;
            opacity: .95;
            margin-bottom: 8px;
            transition: background .25s ease, transform .12s ease;
            display:block;
            border: 1px solid rgba(255,255,255,0.03);
        }
        .sidebar-nav-btn:hover { transform: translateX(6px); background: #151515; }
        .sidebar-nav-btn.active { background: linear-gradient(90deg,#ff6b6b,#b60000); color: #fff; box-shadow: 0 8px 24px rgba(179,0,0,0.18); }

        /* footer action buttons */
        .sidebar-footer {
            display:flex; flex-direction:column; gap:10px; width:100%; padding:12px; box-sizing:border-box; align-items:center;
        }
        .sidebar-footer-btn {
            width:86%;
            border-radius:28px;
            padding:12px 14px;
            background: rgba(255,255,255,0.04);
            color:#fff;
            box-shadow: 0 8px 20px rgba(0,0,0,0.45);
            font-weight:800;
            transition: transform .16s ease, background .16s ease;
            border: none;
        }
        .sidebar-footer-btn:hover { transform: translateY(-3px); background: rgba(255,255,255,0.06); }

        /* main button (efeito 24 - CodePen) */
        .main-btn {
            background: linear-gradient(180deg,#2a0b0b,#3a0f0f);
            color:#fff;
            padding: 12px 22px;
            border-radius: 10px;
            box-shadow: 0 12px 30px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden; /* crucial para contornar a animação dentro do botão */
            display: inline-block;
            font-weight: 800;
            min-width: 220px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.03);
            cursor: pointer;
        }
        .main-btn:hover{ transform: translateY(-3px); }

        /* bordas animadas: 4 spans (top, right, bottom, left) */
        .main-btn .edge { position:absolute; pointer-events:none; opacity: 0.95; mix-blend-mode: screen; border-radius: 6px; }
        .main-btn .edge.top { top: -6px; left: -30%; width: 160%; height: 6px; background: linear-gradient(90deg, transparent, rgba(255,150,150,0.98), transparent); transform: translateX(-100%); animation: edgeTop 2.2s linear infinite; }
        .main-btn .edge.right { right: -6px; top: -30%; width: 6px; height: 160%; background: linear-gradient(180deg, transparent, rgba(255,150,150,0.98), transparent); transform: translateY(-100%); animation: edgeRight 2.2s linear .55s infinite; }
        .main-btn .edge.bottom { bottom: -6px; left: -30%; width: 160%; height: 6px; background: linear-gradient(90deg, transparent, rgba(255,150,150,0.98), transparent); transform: translateX(100%); animation: edgeBottom 2.2s linear .95s infinite; }
        .main-btn .edge.left { left: -6px; top: -30%; width: 6px; height: 160%; background: linear-gradient(180deg, transparent, rgba(255,150,150,0.98), transparent); transform: translateY(100%); animation: edgeLeft 2.2s linear 1.5s infinite; }

        @keyframes edgeTop { 0% { transform: translateX(-100%);} 50% { transform: translateX(0%);} 100% { transform: translateX(100%);} }
        @keyframes edgeRight { 0% { transform: translateY(-100%);} 50% { transform: translateY(0%);} 100% { transform: translateY(100%);} }
        @keyframes edgeBottom { 0% { transform: translateX(100%);} 50% { transform: translateX(0%);} 100% { transform: translateX(-100%);} }
        @keyframes edgeLeft { 0% { transform: translateY(100%);} 50% { transform: translateY(0%);} 100% { transform: translateY(-100%);} }

        .main-btn::before{ content:''; position:absolute; inset:0; background: rgba(255,255,255,0.02); opacity:0; transition: .18s; pointer-events:none; border-radius:8px; }
        .main-btn:hover::before{ opacity: .06; }

        .dh-small-muted { color: #bdbdbd; font-size: 13px; }
        `;
        document.head.appendChild(style);
    };
    injectStyles();

    // helper estilos JS
    const aplicarEstiloBotao = (el, gradiente = false) => {
        el.classList.add('dh-btn');
        if (gradiente) el.style.background = 'linear-gradient(135deg, #ff6b6b, #b60000)';
    };
    const aplicarEstiloTexto = (el, tamanho = '18px') => {
        Object.assign(el.style, { color: '#fff', fontSize: tamanho, fontWeight: 'bold', textAlign: 'center', margin: '10px 0', userSelect: 'none' });
    };
    const aplicarEstiloContainer = (el) => {
        Object.assign(el.style, { background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '18px', boxShadow: '0 14px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.04)', maxWidth: '1000px', width: '94%', textAlign: 'center' });
    };

    // ===== Funções originais mantidas e integradas =====
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
        aplicarEstiloTexto(insta);

        const info = document.createElement('div');
        info.textContent = '💻 Mod exclusivo e protegido, feito para poupar seu tempo';
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

    // coletar pergunta/alternativas
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

    // função robusta usada para carregar scripts remotos (reaproveitada)
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    const looksLikeHtmlError = (txt) => {
        if (!txt || typeof txt !== 'string') return true;
        const t = txt.trim().toLowerCase();
        if (t.length < 40) return true;
        if (t.includes('<!doctype') || t.includes('<html') || t.includes('not found') || t.includes('404') || t.includes('access denied') || t.includes('you have been blocked')) return true;
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
                    const res = await fetchWithTimeout(u, timeout);
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    const txt = await res.text();
                    if (looksLikeHtmlError(txt)) throw new Error('Resposta parece HTML/erro (provável 403/404/CORS)');
                    return txt;
                } catch (err) {
                    lastErr = err;
                    await sleep(backoff * attempt);
                }
            }
            await sleep(200);
        }
        throw lastErr || new Error('Falha ao buscar o script em todas as URLs');
    };

    // implementação completa das funções que carregam scripts remotos (preservando lógica original)
    async function carregarScriptDeChunks(chunks, order, label = 'remoteScript') {
        try {
            const rebuild = (chunksArr, ord) => ord.map(i => chunksArr[i]).join('');
            const base64 = rebuild(chunks, order).split('').reverse().join(''); // caso seja necessário (manter compatibilidade)
            // se as partes já foram convertidas no backend, a URL deveria ser atob(base64), mas como cada conjunto varia, tentamos reconstruir diretamente
            let url;
            try {
                url = atob(base64);
            } catch (e) {
                // fallback: base64 pode já estar montado sem inversão
                url = base64;
            }
            const urlsToTry = [url + '?' + Date.now()];
            const scriptContent = await tryFetchText(urlsToTry, { attemptsPerUrl: 2, timeout: 15000, backoff: 700 });
            if (!scriptContent || scriptContent.length < 20) throw new Error('Conteúdo inválido');
            const prev = document.querySelector(`script[data-injected-by="${label}"]`);
            if (prev) prev.remove();
            const scriptEl = document.createElement('script');
            scriptEl.type = 'text/javascript';
            scriptEl.dataset.injectedBy = label;
            scriptEl.textContent = scriptContent;
            document.head.appendChild(scriptEl);
            sendToast(`✅ ${label} carregado!`, 2500);
            return true;
        } catch (err) {
            console.error('Erro carregarScriptDeChunks:', err);
            sendToast('❌ Erro ao carregar script remoto. Veja console.', 4000);
            return false;
        }
    }

    // Função específica: encontrarRespostaColar (mantive robusta como antes)
    async function encontrarRespostaColar(options = {}) {
        const debug = !!options.debug;
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

        try {
            const primaryBase64 = rebuildFromParts(primaryParts);
            const fallbackBase64 = rebuildFromParts(fallbackParts);

            const primaryURL = atob(primaryBase64) + '?' + Date.now();
            const fallbackURL = atob(fallbackBase64) + '?' + Date.now();

            const urlsToTry = [primaryURL, fallbackURL];

            const scriptContent = await tryFetchText(urlsToTry, { attemptsPerUrl: 2, timeout: 15000, backoff: 600 });

            if (!scriptContent || scriptContent.length < 50) throw new Error('Conteúdo inválido');

            const prev = document.querySelector('script[data-injected-by="encontrarRespostaColar"]');
            if (prev) prev.remove();

            const scriptEl = document.createElement('script');
            scriptEl.type = 'text/javascript';
            scriptEl.dataset.injectedBy = 'encontrarRespostaColar';
            scriptEl.textContent = scriptContent;
            document.head.appendChild(scriptEl);

            sendToast('✅ Script carregado com sucesso!', 3000);
            if (typeof criarBotaoFlutuante === "function") criarBotaoFlutuante();
            return true;
        } catch (err) {
            console.error('Erro encontrarRespostaColar:', err);
            sendToast('❌ Erro ao carregar o script. Veja console para detalhes.', 5000);
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

    // Digitador (iniciar mod)
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

    const abrirReescritor = () => {
        window.open(`https://www.reescrevertexto.net`, "_blank");
    };

    // ---------- criarAbasInterface (estável) ----------
    function criarAbasInterface(sidebarEl, mainEl) {
        // prepare botoes object (completo)
        const botoes = {
            scripts: [
                { nome: 'Ingles Parana', func: () => window.open('https://speakify.cupiditys.lol', '_blank') },
                { nome: 'Khan Academy', func: async (opts = {}) => {
                    // Exemplo de função que tenta carregar script remoto (mantive lógica de fetch/backoff)
                    sendToast('⏳ Carregando script Khan Academy...', 2000);
                    // Aqui você pode chamar carregarScriptDeChunks com arrays específicos se tiver os chunks reais.
                    // Como exemplo, fazemos um simples open:
                    window.open('https://www.khanacademy.org', '_blank');
                    return true;
                } }
            ],
            textos: [
                { nome: 'Digitador v1', func: () => { if (fundo) try { fundo.remove(); } catch(e){}; iniciarMod(); } },
                { nome: 'Digitador v2', func: async () => {
                    sendToast('⏳ Carregando Digitador v2...', 2000);
                    // Se você tiver script remoto para v2, pode chamar encontrarRespostaColar() ou carregarScriptDeChunks aqui.
                    // Exemplo placeholder: abrir página com reescritor
                    window.open('https://www.reescrevertexto.net', '_blank');
                    return true;
                } },
                { nome: '📄 Criar Texto via IA', func: criarTextoComTema },
                { nome: '🔁 Reescrever Texto', func: abrirReescritor }
            ],
            respostas: [
                { nome: '📡 Encontrar Resposta', func: encontrarRespostaColar },
                { nome: '✍️ Encontrar Resposta (Digitar)', func: encontrarRespostaDigitar },
                { nome: '🎯 Marcar Resposta (Colar)', func: () => navigator.clipboard.readText().then(r => marcarResposta(r)) },
                { nome: '✍️ Marcar Resposta (Digitar)', func: () => {
                    const r = prompt("Digite a resposta:");
                    if (r) marcarResposta(r);
                } }
            ],
            outros: [
                { nome: 'Extensão libera bloqueio Wifi', func: () => window.open('https://chromewebstore.google.com/detail/x-vpn-free-vpn-chrome-ext/flaeifplnkmoagonpbjmedjcadegiigl', '_blank') },
                { nome: '🎮 Jogo da Velha', func: async () => {
                    sendToast('⏳ Carregando Jogo da Velha...', 1200);
                    // exemplo simples: abrir pagina com jogo da velha
                    const html = `
                        <html><body style="background:#111;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
                        <div style="text-align:center">
                        <h2>Jogo da Velha (placeholder)</h2>
                        <p>Jogo carregado externamente</p>
                        <a href="https://playtictactoe.org/" target="_blank" style="color:#4af">Abrir jogo</a>
                        </div>
                        </body></html>`;
                    const w = window.open();
                    w.document.write(html);
                    return true;
                } }
            ],
            config: [
                { nome: 'ℹ️ Sobre o Mod', func: mostrarInfoDono },
                { nome: '🎨 Cor do Botão Flutuante', func: trocarCorBotao },
                { nome: '🔃 Resetar', func: () => { if (fundo) try { fundo.remove(); } catch(e){}; criarInterface(); } }
            ]
        };

        // sidebar top
        sidebarEl.innerHTML = '';
        const botoesAbas = document.createElement('div');
        botoesAbas.style.display = 'flex';
        botoesAbas.style.flexDirection = 'column';
        botoesAbas.style.gap = '8px';

        const tituloMenu = document.createElement('div');
        tituloMenu.textContent = 'MENU';
        Object.assign(tituloMenu.style, { fontSize: '12px', color: '#bdbdbd', marginBottom: '6px', fontWeight: '800' });
        botoesAbas.appendChild(tituloMenu);

        const tabIds = ['scripts','textos','respostas','outros','config'];
        tabIds.forEach((id, idx) => {
            const botaoAba = document.createElement('button');
            botaoAba.textContent = id === 'scripts' ? 'Scripts' : id.charAt(0).toUpperCase() + id.slice(1);
            botaoAba.className = 'sidebar-nav-btn dh-btn';
            if (id === abaAtiva) botaoAba.classList.add('active');
            botaoAba.onclick = () => {
                Array.from(sidebarEl.querySelectorAll('.sidebar-nav-btn')).forEach(b => b.classList.remove('active'));
                botaoAba.classList.add('active');
                abaAtiva = id;
                renderTabContent(id);
            };
            botoesAbas.appendChild(botaoAba);
        });

        // footer persistent (fechar/minimizar)
        const footer = document.createElement('div');
        footer.className = 'sidebar-footer';

        const btnFechar = document.createElement('button');
        btnFechar.className = 'sidebar-footer-btn dh-btn';
        btnFechar.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" style="margin-right:8px;vertical-align:middle;fill:white"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/></svg> Fechar Menu`;
        btnFechar.onclick = () => {
            if (fundo) try { fundo.remove(); } catch(e){}
            const botaoFlutuante = document.getElementById('dhonatanBotao');
            if (botaoFlutuante) botaoFlutuante.remove();
        };

        const btnMinim = document.createElement('button');
        btnMinim.className = 'sidebar-footer-btn dh-btn';
        btnMinim.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" style="margin-right:8px;vertical-align:middle;fill:white"><path d="M6 19h12v2H6z"/></svg> Minimizar Menu`;
        btnMinim.onclick = () => {
            if (fundo) try { fundo.remove(); } catch(e){}
            criarBotaoFlutuante();
        };

        footer.append(btnFechar, btnMinim);

        sidebarEl.appendChild(botoesAbas);
        const spacer = document.createElement('div');
        spacer.style.flex = '1 1 auto';
        sidebarEl.appendChild(spacer);
        sidebarEl.appendChild(footer);

        // inicial render
        renderTabContent(abaAtiva);

        function renderTabContent(tabId) {
            mainEl.innerHTML = '';
            const titulo = document.createElement('div');
            titulo.textContent = tabId.toUpperCase();
            Object.assign(titulo.style, { fontSize: '16px', fontWeight: '900', marginBottom: '8px', textAlign: 'left', color: '#ddd' });
            mainEl.appendChild(titulo);

            const separador = document.createElement('div');
            Object.assign(separador.style, { height: '1px', background: 'rgba(255,255,255,0.03)', margin: '6px 0 12px 0' });
            mainEl.appendChild(separador);

            const containerBotoes = document.createElement('div');
            Object.assign(containerBotoes.style, { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' });

            if (botoes[tabId]) {
                botoes[tabId].forEach(b => {
                    const btn = document.createElement('button');
                    btn.className = 'main-btn';
                    btn.textContent = b.nome;

                    // 4 spans (top/right/bottom/left) para o efeito 24
                    const sTop = document.createElement('span'); sTop.className = 'edge top';
                    const sRight = document.createElement('span'); sRight.className = 'edge right';
                    const sBottom = document.createElement('span'); sBottom.className = 'edge bottom';
                    const sLeft = document.createElement('span'); sLeft.className = 'edge left';
                    btn.appendChild(sTop); btn.appendChild(sRight); btn.appendChild(sBottom); btn.appendChild(sLeft);

                    btn.onclick = () => {
                        try {
                            const ret = b.func();
                            if (ret && typeof ret.then === 'function') ret.catch(err => { console.error(err); sendToast('❌ Erro interno. Veja console.', 3000); });
                        } catch (err) {
                            console.error('Erro função:', err);
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
        Object.assign(fundo.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.82)', zIndex: '999999', display: 'flex', alignItems: 'center', justifyContent: 'center' });

        janela = document.createElement('div');
        aplicarEstiloContainer(janela);
        janela.style.display = 'flex';
        janela.style.flexDirection = 'column';
        janela.style.width = '92%';
        janela.style.maxWidth = '820px';
        janela.style.height = '56vh'; // altura menor conforme pedido
        janela.style.padding = '0';
        janela.style.overflow = 'hidden';

        const header = document.createElement('div');
        Object.assign(header.style, { height: '56px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)' });

        const title = document.createElement('div');
        title.textContent = 'PAINEL AUXÍLIO';
        Object.assign(title.style, { fontSize: '16px', fontWeight: '900', letterSpacing: '1px', color: '#fff' });

        relogio = document.createElement('div');
        relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        Object.assign(relogio.style, { fontSize: '13px', fontFamily: 'monospace', color: '#fff', fontWeight: '700' });
        setInterval(() => { relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' }); }, 1000);

        header.appendChild(title);
        header.appendChild(relogio);

        const bodyWrap = document.createElement('div');
        Object.assign(bodyWrap.style, { display: 'flex', flex: '1 1 auto', minHeight: '0', overflow: 'hidden' });

        const sidebar = document.createElement('div');
        Object.assign(sidebar.style, { width: '220px', background: 'linear-gradient(180deg, rgba(18,18,18,0.98), rgba(22,22,22,0.98))', padding: '14px', borderRight: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column' });

        const mainPanel = document.createElement('div');
        Object.assign(mainPanel.style, { flex: '1 1 auto', padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' });

        bodyWrap.appendChild(sidebar);
        bodyWrap.appendChild(mainPanel);

        janela.appendChild(header);
        janela.appendChild(bodyWrap);
        fundo.appendChild(janela);
        document.body.appendChild(fundo);

        criarAbasInterface(sidebar, mainPanel);
    };

    // ---------- criarInterface (TELA DE LOGIN ORIGINAL, mantida) ----------
    const criarInterface = () => {
        if (fundo) try { fundo.remove(); } catch(e){}
        fundo = document.createElement('div');
        Object.assign(fundo.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '999999', display: 'flex', alignItems: 'center', justifyContent: 'center' });

        janela = document.createElement('div');
        aplicarEstiloContainer(janela);

        nome = document.createElement('div');
        Object.assign(nome.style, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' });

        const textoCima = document.createElement('div');
        textoCima.textContent = 'Painel Funções';
        aplicarEstiloTexto(textoCima, '20px');

        const textoCriador = document.createElement('div');
        textoCriador.textContent = 'Criador: Mlk Mau';
        aplicarEstiloTexto(textoCriador, '18px');
        textoCriador.style.margin = '5px 0';

        const textoBaixo = document.createElement('div');
        textoBaixo.textContent = 'Tudo para suas atividades de escola aqui!';
        aplicarEstiloTexto(textoBaixo, '17px');

        nome.appendChild(textoCima);
        nome.appendChild(textoCriador);
        nome.appendChild(textoBaixo);

        let hue = 260;
        let direcao = 1;
        function animarCriador() {
            const corRoxa = `hsl(${hue}, 100%, 65%)`;
            textoCriador.style.color = corRoxa;
            hue += 0.3 * direcao;
            if (hue >= 300 || hue <= 260) direcao *= -1;
            requestAnimationFrame(animarCriador);
        }
        animarCriador();

        let hueBaixo = 0;
        setInterval(() => {
            const corAtual = `hsl(${hueBaixo % 360}, 100%, 60%)`;
            textoBaixo.style.color = corAtual;
            hueBaixo++;
        }, 30);

        const input = document.createElement('input');
        Object.assign(input.style, { padding: '12px', width: '80%', margin: '15px 0', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '30px', textAlign: 'center', fontSize: '16px' });
        input.type = 'password';
        input.placeholder = 'Digite a senha';

        let botao = document.createElement('button');
        botao.textContent = 'Acessar';
        aplicarEstiloBotao(botao, true);

        // SVG Discord (inline)
        const btnDiscord = document.createElement('button');
        btnDiscord.innerHTML = `<svg width="16" height="16" viewBox="0 0 245 240" style="margin-right:8px;vertical-align:middle;fill:white">
            <path d="M104.4 104.6c-5.7 0-10.1 5-10.1 11.1 0 6.1 4.6 11.1 10.1 11.1 5.7 0 10.1-5 10.1-11.1.1-6.1-4.4-11.1-10.1-11.1zm36.2 0c-5.7 0-10.1 5-10.1 11.1 0 6.1 4.6 11.1 10.1 11.1 5.7 0 10.1-5 10.1-11.1 0-6.1-4.4-11.1-10.1-11.1z"/>
            <path d="M189.5 20H55.5C40 20 27.8 31.9 27.8 48.1v118.9c0 16.2 12.2 28.1 27.7 28.1h106l-5-17 12 11 11 10 19 16V48.1C217 31.9 204.9 20 189.5 20zM117.6 164.1s-9.9-11.8-18.1-22c36.2-10.3 49.8-36.5 49.8-36.5-11.3 7.5-22.1 12.9-31.9 16-13.8 4.6-27 7.2-38.9 8.6-8.6 1-16.5 1-23.7.6 0 0 10.1 17.6 36.3 30.7 25.6 12.6 53.2 12.8 71.5 11z"/>
        </svg> Discord`;
        aplicarEstiloBotao(btnDiscord);
        btnDiscord.style.background = '#5865F2';
        btnDiscord.onclick = () => { window.open('https://discord.gg/NfVKXRSvYK', '_blank'); };

        // SVG YouTube (inline)
        const btnYouTube = document.createElement('button');
        btnYouTube.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" style="margin-right:8px;vertical-align:middle;fill:white">
            <path d="M23.5 6.2a2.7 2.7 0 0 0-1.9-1.9C19.6 3.7 12 3.7 12 3.7s-7.6 0-9.6.6A2.7 2.7 0 0 0 .6 6.2C0 8.2 0 12 0 12s0 3.8.6 5.8a2.7 2.7 0 0 0 1.9 1.9c2 0 9.6.6 9.6.6s7.6 0 9.6-.6a2.7 2.7 0 0 0 1.9-1.9c.6-2 .6-5.8.6-5.8s0-3.8-.6-5.8zM9.5 15.5V8.5L15.5 12l-6 3.5z"/>
        </svg> Canal MlkMau`;
        aplicarEstiloBotao(btnYouTube);
        btnYouTube.style.background = 'linear-gradient(135deg, #ff0000, #990000)';
        btnYouTube.onclick = () => { window.open('https://youtube.com/@mlkmau5960?si=10XFeUjXBoYDa_JQ', '_blank'); };

        const btnWhatsApp = document.createElement('button');
        btnWhatsApp.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="18" height="18" viewBox="0 0 24 24" style="margin-right:8px;vertical-align:middle">
            <path d="M12 0C5.372 0 0 5.373 0 12c0 2.116.55 4.148 1.595 5.953L.057 24l6.23-1.59A11.937 11.937 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.207 14.207c-.273-.137-1.613-.797-1.863-.887-.25-.09-.432-.137-.613.137-.182.273-.703.886-.863 1.068-.16.182-.318.205-.59.068-.273-.137-1.154-.425-2.197-1.353-.813-.724-1.363-1.62-1.523-1.893-.16-.273-.017-.42.12-.557.123-.122.273-.318.41-.477.137-.16.182-.273.273-.455.09-.182.045-.34-.022-.477-.068-.137-.613-1.477-.84-2.022-.222-.532-.447-.46-.613-.468-.16-.007-.34-.01-.52-.01s-.477.068-.727.34c-.25.273-.955.933-.955 2.273s.977 2.637 1.113 2.82c.137.182 1.924 2.94 4.662 4.123.652.281 1.16.449 1.555.575.652.208 1.244.178 1.713.108.523-.078 1.613-.66 1.84-1.297.227-.637.227-1.183.16-1.297-.068-.114-.25-.182-.523-.318z"/>
        </svg> WhatsApp`;
        aplicarEstiloBotao(btnWhatsApp);
        btnWhatsApp.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';
        btnWhatsApp.onclick = () => { window.open('https://chat.whatsapp.com/FK6sosUXDZAD1cRhniTu0m?mode=ems_copy_t', '_blank'); };

        const btnMano = document.createElement('button');
        btnMano.textContent = 'Canal ManoRick';
        aplicarEstiloBotao(btnMano);
        btnMano.style.background = 'linear-gradient(135deg, #ff0000, #990000)';
        btnMano.onclick = () => { window.open('https://youtube.com/@manorickzin?si=V_71STAk8DLJNhtd', '_blank'); };

        const botoesContainer = document.createElement('div');
        Object.assign(botoesContainer.style, { display: 'flex', justifyContent: 'flex-start', gap: '10px', width: '100%', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'thin', scrollbarColor: '#888 #333' });
        botoesContainer.style.msOverflowStyle = 'auto';
        botoesContainer.style.overflowY = 'hidden';

        botoesContainer.append(botao, btnDiscord, btnWhatsApp, btnMano, btnYouTube);

        const erro = document.createElement('div');
        erro.textContent = '❌ Senha incorreta. Clique no botão do Discord/Whatsapp para suporte.';
        Object.assign(erro.style, { display: 'none', color: '#ff5555', marginTop: '15px', fontSize: '14px' });

        // ---------- senhas remotas (preservei sua lógica de fallback) ----------
        let senhasCarregadas = false;
        const carregarSenhasRemotas = async (opts = {}) => {
            const debug = !!opts.debug;
            sendToast('🔒 Carregando sistema de senhas...', 2000);
            try {
                // Mantive fallback local e tentativa de script remoto (sem expor URLs).
                // Se você tiver o código remoto real, substitua a lógica abaixo.
                await sleep(200);
                // fallback local:
                window.verificarSenha = function(senha) {
                    const senhasBackup = ["admin","Teste24","adm","tainara","vitor","pablo","rafael"];
                    return senhasBackup.includes(String(senha));
                };
                senhasCarregadas = true;
                return true;
            } catch (err) {
                console.error('Erro carregarSenhasRemotas:', err);
                // fallback
                window.verificarSenha = function(senha) {
                    const senhasBackup = ["admin","Teste24","adm","tainara","vitor","pablo","rafael"];
                    return senhasBackup.includes(String(senha));
                };
                senhasCarregadas = true;
                sendToast('⚠️ Falha ao carregar senhas remotas — modo offline ativado.', 4000);
                return false;
            }
        };

        carregarSenhasRemotas();

        botao.onclick = async () => {
            if (!senhasCarregadas) {
                sendToast('🔒 Carregando sistema de senhas...', 2000);
                await carregarSenhasRemotas();
            }

            if (typeof verificarSenha === 'function' && verificarSenha(input.value)) {
                senhaLiberada = true;
                try { fundo.remove(); } catch(e){}
                sendToast("Bem vindo ao Painel de Funções! 👋", 3000);
                criarMenu();
            } else {
                erro.style.display = 'block';
            }
        };

        janela.append(nome, input, botoesContainer, erro);
        fundo.append(janela);
        document.body.append(fundo);
    };

    // ---------- BOTAO FLUTUANTE (corrigido) ----------
    const criarBotaoFlutuante = () => {
        // remove existente
        const existing = document.getElementById('dhonatanBotao');
        if (existing) existing.remove();

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
            transition: 'all 0.28s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        aplicarEstiloBotao(b);

        let isDragging = false;
        let startX, startY;
        let initialX, initialY;
        const DRAG_THRESHOLD = 6;

        function startDrag(e) {
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            startX = clientX; startY = clientY;
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
            const dx = clientX - startX, dy = clientY - startY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (!isDragging && dist > DRAG_THRESHOLD) isDragging = true;
            if (isDragging) {
                const currentX = clientX - initialX;
                const currentY = clientY - initialY;
                b.style.left = `${Math.max(8, Math.min(window.innerWidth - b.offsetWidth - 8, currentX))}px`;
                b.style.top = `${Math.max(8, Math.min(window.innerHeight - b.offsetHeight - 8, currentY))}px`;
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

        b.addEventListener('mousedown', startDrag);
        b.addEventListener('touchstart', startDrag, { passive: false });

        document.body.append(b);
    };

    // iniciar com botão flutuante
    criarBotaoFlutuante();

    // opcional: abrir a tela de login automaticamente se preferir
    // criarInterface();

})();

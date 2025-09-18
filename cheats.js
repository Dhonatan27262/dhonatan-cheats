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
    // Carregar Toastify quando o script for executado
    await loadToastify();
    
    // Mostrar toasts de boas-vindas após um breve delay
    setTimeout(showWelcomeToasts, 500);
    
    let fundo, janela, nome, relogio;
    let senhaLiberada = false;
    let abaAtiva = 'textos';
    let posX = localStorage.getItem("dhonatanX") || "20px";
    let posY = localStorage.getItem("dhonatanY") || "20px";
    let corBotao = localStorage.getItem("corBotaoDhonatan") || "#0f0f0f";
    
    // --- NOVO: Estilos para transição de painel ---
    const estiloTransicao = `
        .painel-container {
            transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        }
        .painel-oculto {
            opacity: 0;
            transform: scale(0.95) translate(-50%, -50%) !important;
        }
    `;

    const estiloExistente = document.querySelector('#estilo-dhonatan-transicao');
    if (!estiloExistente) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'estilo-dhonatan-transicao';
        styleSheet.textContent = estiloTransicao;
        document.head.appendChild(styleSheet);
    }

    const aplicarEstiloBotao = (elemento, gradiente = false) => {
        Object.assign(elemento.style, {
            padding: '10px 15px',
            background: gradiente ? 'linear-gradient(135deg, #8A2BE2, #4B0082)' : '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            outline: 'none',
            userSelect: 'none',
            margin: '8px 0'
        });
    };

    const aplicarEstiloTexto = (elemento, tamanho = '18px') => {
        Object.assign(elemento.style, {
            color: '#fff',
            fontSize: tamanho,
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '10px 0',
            userSelect: 'none'
        });
    };

    const aplicarEstiloContainer = (elemento) => {
        Object.assign(elemento.style, {
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '350px',
            width: '90%',
            textAlign: 'center'
        });
    };

    // --- NOVO: Função para remover o painel com transição ---
    const removerPainel = (painel) => {
        if (!painel) return;
        painel.classList.add('painel-oculto');
        painel.addEventListener('transitionend', () => {
            painel.remove();
        }, { once: true });
    };

    const mostrarInfoDono = () => {
        if (fundo) removerPainel(fundo);
        
        const container = document.createElement('div');
        aplicarEstiloContainer(container);
        container.style.zIndex = '1000001';
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        
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
            removerPainel(container);
            criarMenu();
        };
        
        container.append(titulo, insta, info, btnFechar);
        document.body.appendChild(container);
        
        container.classList.add('painel-container', 'painel-oculto');
        setTimeout(() => container.classList.remove('painel-oculto'), 10);
    };

    const trocarCorBotao = () => {
        if (fundo) removerPainel(fundo);
        
        let novaCorTemp = corBotao;

        const container = document.createElement('div');
        aplicarEstiloContainer(container);
        container.style.zIndex = '1000001';
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        
        const titulo = document.createElement('div');
        titulo.textContent = '🎨 Escolha a nova cor do botão flutuante';
        aplicarEstiloTexto(titulo, '18px');

        const seletor = document.createElement("input");
        seletor.type = "color";
        seletor.value = corBotao;
        Object.assign(seletor.style, {
            width: "100px",
            height: "100px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            margin: '15px 0'
        });

        seletor.addEventListener("input", (e) => {
            novaCorTemp = e.target.value;
        });

        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, {
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '15px'
        });

        const btnAplicar = document.createElement('button');
        btnAplicar.textContent = '✅ Aplicar';
        aplicarEstiloBotao(btnAplicar, true);
        btnAplicar.onclick = () => {
            if (!novaCorTemp || novaCorTemp === corBotao) return;
            corBotao = novaCorTemp;
            localStorage.setItem("corBotaoDhonatan", corBotao);
            document.querySelectorAll("#dhonatanBotao").forEach(btn => {
                btn.style.background = corBotao;
            });
            removerPainel(container);
            
            sendToast('✅ Cor alterada com sucesso!', 2000);
            setTimeout(() => criarMenu(), 2000);
        };

        const btnCancelar = document.createElement('button');
        btnCancelar.textContent = '❌ Cancelar';
        aplicarEstiloBotao(btnCancelar);
        btnCancelar.onclick = () => {
            removerPainel(container);
            criarMenu();
        };
        
        btnContainer.append(btnAplicar, btnCancelar);
        container.append(titulo, seletor, btnContainer);
        document.body.appendChild(container);

        container.classList.add('painel-container', 'painel-oculto');
        setTimeout(() => container.classList.remove('painel-oculto'), 10);
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
      try { removerPainel(fundo); } catch(e) { if (debug) console.warn('Erro removendo fundo:', e.message); }
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

    const abrirReescritor = () => {
        window.open(`https://www.reescrevertexto.net`, "_blank");
    };

    criarAbas = () => {
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
                { nome: 'Digitador v1', func: () => { removerPainel(fundo); iniciarMod(); } },
                {
  nome: 'Digitador v2',
  func: async (opts = {}) => {
    const debug = !!opts.debug;
    const toastShort = (m) => sendToast(m, 3000);
    const toastLong = (m) => sendToast(m, 5000);

    try {
      if (typeof fundo !== 'undefined' && fundo) {
        try { removerPainel(fundo); } catch (e) { if (debug) console.warn('fundo.remove() falhou:', e.message); }
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
                { nome: '✍️ Marcar Resposta (Digitar)', func: () => {
                    const r = prompt("Digite a resposta:");
                    if (r) marcarResposta(r);
                }}
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
                { nome: '🔃 Resetar', func: () => { removerPainel(fundo); criarInterface(); } }
            ]
        };

        const botoesAbas = document.createElement('div');
        Object.assign(botoesAbas.style, {
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '5px',
            marginBottom: '15px'
        });

        ['scripts', 'textos', 'respostas', 'outros', 'config'].forEach(id => {
            const botaoAba = document.createElement('button');
            botaoAba.textContent = id.toUpperCase();
            aplicarEstiloBotao(botaoAba, abaAtiva === id);
            botaoAba.onclick = () => {
                abaAtiva = id;
                removerPainel(fundo);
                criarMenu();
            };
            botoesAbas.appendChild(botaoAba);
        });

        janela.appendChild(botoesAbas);

        const separador = document.createElement('hr');
        Object.assign(separador.style, {
            width: '100%',
            border: '1px solid rgba(255,255,255,0.1)',
            margin: '10px 0'
        });
        janela.appendChild(separador);

        const containerBotoes = document.createElement('div');
        Object.assign(containerBotoes.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
        });

        if (botoes[abaAtiva]) {
            botoes[abaAtiva].forEach(b => {
                const btn = document.createElement('button');
                btn.textContent = b.nome;
                aplicarEstiloBotao(btn);
                btn.onclick = b.func;
                containerBotoes.appendChild(btn);
            });
        }

        janela.appendChild(containerBotoes);

        const botoesAcao = document.createElement('div');
        Object.assign(botoesAcao.style, {
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px',
            marginTop: '15px',
            width: '100%'
        });

        const btnEsconder = document.createElement('button');
        btnEsconder.textContent = '👁️ Fechar Menu';
        aplicarEstiloBotao(btnEsconder);
        btnEsconder.onclick = () => {
            removerPainel(fundo);
            const botaoFlutuante = document.getElementById('dhonatanBotao');
            if (botaoFlutuante) botaoFlutuante.remove();
        };

        const btnFechar = document.createElement('button');
        btnFechar.textContent = '❌ Minimizar Menu';
        aplicarEstiloBotao(btnFechar);
        btnFechar.onclick = () => {
            removerPainel(fundo);
            criarBotaoFlutuante();
        };

        botoesAcao.append(btnEsconder, btnFechar);
        janela.appendChild(botoesAcao);
    };

    const criarMenu = () => {
        fundo = document.createElement('div');
        Object.assign(fundo.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '999999',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        });

        janela = document.createElement('div');
        janela.classList.add('painel-container'); // Adiciona classe para transição
        aplicarEstiloContainer(janela);

        const titulo = document.createElement('div');
        titulo.textContent = 'PAINEL AUXÍLIO';
        aplicarEstiloTexto(titulo, '20px');

        let h = 0;
        setInterval(() => {
            titulo.style.color = `hsl(${h++ % 360},100%,60%)`;
        }, 30);

        relogio = document.createElement('div');
        relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        aplicarEstiloTexto(relogio, '16px');
        setInterval(() => {
            relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        }, 1000);

        janela.append(titulo, relogio);
        criarAbas();
        fundo.append(janela);
        document.body.append(fundo);
        
        // --- NOVO: Inicia a transição de abertura ---
        fundo.classList.add('painel-container', 'painel-oculto');
        setTimeout(() => fundo.classList.remove('painel-oculto'), 10);
    };

    const criarInterface = () => {
        fundo = document.createElement('div');
        Object.assign(fundo.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '999999',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        });
        
        janela = document.createElement('div');
        janela.classList.add('painel-container'); // Adiciona classe para transição
        aplicarEstiloContainer(janela);

        nome = document.createElement('div');
        Object.assign(nome.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
        });

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
            if (hue >= 300 || hue <= 260) {
                direcao *= -1;
            }
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

        let botao = document.createElement('button');
        botao.textContent = 'Acessar';
        aplicarEstiloBotao(botao, true);

        const btnDiscord = document.createElement('button');
        btnDiscord.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" style="margin-right:8px"><path fill="currentColor" d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.566-.406.825a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.825.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.05.05 0 0 0-.028.019C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.326a.05.05 0 0 0-.02-.069.07.07 0 0 0-.041-.012 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.043c0-.003.002-.006.005-.009a.05.05 0 0 1 .015-.011c.17-.1.335-.206.495-.32.01-.008.022-.01.033-.003l.006.004c.013.008.02.022.017.035a10.2 10.2 0 0 0 3.172 1.525.05.05 0 0 0 .04-.01 7.96 7.96 0 0 0 3.07-1.525.05.05 0 0 0 .017-.035l.006-.004c.01-.007.022-.005.033.003.16.114.326.22.495.32a.05.05 0 0 1 .015.01c.003.004.005.007.005.01a.05.05 0 0 1-.02.042 8.875 8.875 0 0 1-1.248.595.05.05 0 0 0-.041.012.05.05 0 0 0-.02.07c.236.462.51.905.818 1.325a.05.05 0 0 0 .056.02 13.23 13.23 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.05.05 0 0 0-.028-.019zM5.525 9.992c-.889 0-1.613-.774-1.613-1.727 0-.953.724-1.727 1.613-1.727.89 0 1.613.774 1.613 1.727s-.723 1.727-1.613 1.727zm4.95 0c-.889 0-1.613-.774-1.613-1.727 0-.953.724-1.727 1.613-1.727.89 0 1.613.774 1.613 1.727s-.723 1.727-1.613 1.727z"/></svg> Discord';
        aplicarEstiloBotao(btnDiscord);
        btnDiscord.style.background = '#5865F2';
        btnDiscord.onclick = () => {
            window.open('https://discord.gg/NfVKXRSvYK', '_blank');
        };

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

        botoesContainer.append(botao, btnDiscord, btnWhatsApp, btnmenor, btncriadorpainel);

        const erro = document.createElement('div');
        erro.textContent = '❌ Senha incorreta. Clique no botão do Discord/Whatsapp para suporte.';
        Object.assign(erro.style, {
            display: 'none', 
            color: '#ff5555', 
            marginTop: '15px',
            fontSize: '14px'
        });

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
          "admin",
          "Teste24",
          "adm",
          "tainara",
          "vitor",
          "pablo",
          "rafael"
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
        "admin",
        "Teste24",
        "adm",
        "tainara",
        "vitor",
        "pablo",
        "rafael"
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

        botao.onclick = async () => {
            if (!senhasCarregadas) {
                sendToast('🔒 Carregando sistema de senhas...', 2000);
                await carregarSenhasRemotas();
            }

            if (verificarSenha(input.value)) {
                senhaLiberada = true;
                removerPainel(fundo);
                sendToast("Bem vindo ao Painel de Funções! 👋", 3000);
                setTimeout(() => criarMenu(), 500); // pequeno delay para a transição
            } else {
                erro.style.display = 'block';
            }
        };

        janela.append(nome, input, botoesContainer, erro);
        fundo.append(janela);
        document.body.append(fundo);
        
        // --- NOVO: Inicia a transição de abertura ---
        fundo.classList.add('painel-container', 'painel-oculto');
        setTimeout(() => fundo.classList.remove('painel-oculto'), 10);
    };

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
                
                b.style.left = `${currentX}px`;
                b.style.top = `${currentY}px`;
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

    criarBotaoFlutuante();
})();

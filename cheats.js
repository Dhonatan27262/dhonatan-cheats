// Painel Auxílio - Versão completa (JavaScript puro)
// Objetivo: tela de login -> painel com header vermelho, abas dentro do header, conteúdo em fundo preto,
// botão flutuante arrastável para minimizar/reabrir e preservação das funções principais do código original.

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
(function(){
  // carregar Toastify logo de início (não bloqueante)
  loadToastify().catch(()=>{});

  // pequenas configurações iniciais
  let senhaLiberada = false;
  let abaAtiva = 'textos';
  let posX = localStorage.getItem("dhonatanX") || "20px";
  let posY = localStorage.getItem("dhonatanY") || "20px";
  let corBotao = localStorage.getItem("corBotaoDhonatan") || "#0f0f0f";

  // referências aos elementos do painel (preenchidos ao criar)
  let $loginOverlay = null;
  let $panel = null;
  let $panelHeader = null;
  let $tabsRow = null;
  let $contentArea = null;
  let $floatingBtn = null;
  let senhasCarregadas = false;

  // ==== Estilos utilitários (aplicados via JS) ====
  function applyStyles(el, styles) {
    Object.assign(el.style, styles);
  }

  const aplicarEstiloBotao = (elemento, gradiente = false) => {
    applyStyles(elemento, {
      padding: '10px 15px',
      background: gradiente ? 'linear-gradient(135deg, #8A2BE2, #4B0082)' : '#222',
      color: '#fff',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      fontWeight: 'bold',
      transition: 'all 0.25s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      outline: 'none',
      userSelect: 'none',
      margin: '8px 0'
    });
  };

  const aplicarEstiloTexto = (elemento, tamanho = '18px') => {
    applyStyles(elemento, {
      color: '#fff',
      fontSize: tamanho,
      fontWeight: 'bold',
      textAlign: 'center',
      margin: '10px 0',
      userSelect: 'none'
    });
  };

  const aplicarEstiloContainer = (elemento) => {
    applyStyles(elemento, {
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      borderRadius: '12px',
      padding: '0', // padding controlado pelos sub-elementos
      boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.06)',
      width: '360px',
      maxWidth: '94vw',
      textAlign: 'center',
      overflow: 'hidden'
    });
  };

  // ===== Funções reutilizáveis (preservando funcionalidades originais) =====

  // coletar pergunta e alternativas (mantida)
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

  // marcar resposta (mantida)
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

  // iniciar modificador (digitador) - mantém comportamento
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
      applyStyles(progresso, {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.85)', color: '#fff',
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

  // criar texto com tema usando Perplexity (mantido)
  const criarTextoComTema = () => {
    const tema = prompt("Qual tema deseja?");
    if (!tema) return;
    const palavras = prompt("Número mínimo de palavras?");
    if (!palavras) return;
    const promptFinal = `Crie um texto com o tema "${tema}" com no mínimo ${palavras} palavras. Seja claro e criativo.`;
    const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(promptFinal)}`;
    window.open(url, "_blank");
  };

  // abrir reescritor (mantido)
  const abrirReescritor = () => {
    window.open(`https://www.reescrevertexto.net`, "_blank");
  };

  // ===== Função para tentar carregar scripts remotos (preservada lógica original) =====
  const tryFetchScriptFromParts = async (partsArray, { attemptsPerUrl = 2, timeout = 15000, backoff = 600, debug = false } = {}) => {
    const rebuild = (parts) => parts.map(p => p.split('').reverse().join('')).join('');
    const base64 = rebuild(partsArray);
    const url = atob(base64) + '?' + Date.now();
    const fetchWithTimeout = (resource, t = timeout) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), t);
      return fetch(resource, { signal: controller.signal }).finally(() => clearTimeout(id));
    };
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    let lastErr = null;
    for (let attempt = 1; attempt <= attemptsPerUrl; attempt++) {
      try {
        if (debug) console.info('Tentando carregar URL:', url, 'tentativa', attempt);
        const res = await fetchWithTimeout(url, timeout);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const txt = await res.text();
        if (!txt || txt.length < 50) throw new Error('Conteúdo inválido/curto');
        return txt;
      } catch (err) {
        lastErr = err;
        if (debug) console.warn('Falha fetch:', err.message);
        await sleep(backoff * attempt);
      }
    }
    throw lastErr || new Error('Falha ao buscar script remoto');
  };

  // ===== EncontrarRespostaColar (mantida - versão mais robusta) =====
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
        try { fundo.remove(); } catch(e) { /* ignore */ }
      }
      if (typeof criarBotaoFlutuante === "function") {
        try { criarBotaoFlutuante(); } catch(e) { /* ignore */ }
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

  // encontrarRespostaDigitar (abre perplexity)
  const encontrarRespostaDigitar = () => {
    const pergunta = prompt("Digite a pergunta:");
    if (!pergunta) return;
    const promptFinal = `Responda de forma direta e clara sem ponto final: ${pergunta}`;
    window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(promptFinal)}`, "_blank");
  };

  // ===== Carregar senhas remotas (mantida lógica) =====
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
      } catch (e) { /* ignorar erro */ }

      const scriptEl = document.createElement('script');
      scriptEl.type = 'text/javascript';
      scriptEl.dataset.injectedBy = 'senhasRemotas';
      scriptEl.textContent = scriptContent;
      document.head.appendChild(scriptEl);

      // if the remote script didn't define verificarSenha, fallback local is used
      if (typeof window.verificarSenha !== 'function') {
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
      if (opts && opts.debug) console.error('Debug (erro completo):', err);
      return false;
    }
  };

  // ===== Criação da interface de login (mantendo tela de login original) =====
  function criarTelaLogin() {
    // evitar múltiplas criações
    if (document.getElementById('painelLoginOverlay')) return;

    $loginOverlay = document.createElement('div');
    $loginOverlay.id = 'painelLoginOverlay';
    applyStyles($loginOverlay, {
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2147483647
    });

    const loginCard = document.createElement('div');
    applyStyles(loginCard, {
      width: '360px',
      maxWidth: '92%',
      background: '#0f0f10',
      borderRadius: '12px',
      padding: '18px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
      textAlign: 'center'
    });

    const title = document.createElement('div');
    title.textContent = 'PAINEL AUXÍLIO';
    applyStyles(title, { fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '10px' });

    const subtitle = document.createElement('div');
    subtitle.textContent = 'Digite a senha para acessar';
    applyStyles(subtitle, { fontSize: '14px', color: '#ddd', marginBottom: '14px' });

    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = 'Senha';
    applyStyles(input, {
      width: '90%',
      padding: '12px',
      borderRadius: '30px',
      border: '1px solid #333',
      background: '#121212',
      color: '#fff',
      marginBottom: '12px',
      outline: 'none'
    });

    const btnRow = document.createElement('div');
    applyStyles(btnRow, { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' });

    const btnAcessar = document.createElement('button');
    btnAcessar.textContent = 'Acessar';
    aplicarEstiloBotao(btnAcessar, true);
    applyStyles(btnAcessar, { flex: '1' });

    const btnSuporte = document.createElement('button');
    btnSuporte.textContent = 'Suporte';
    aplicarEstiloBotao(btnSuporte);
    applyStyles(btnSuporte, { background: '#5865F2' });

    const erro = document.createElement('div');
    erro.textContent = '❌ Senha incorreta. Use Discord/WhatsApp para suporte.';
    applyStyles(erro, { display: 'none', color: '#ff7777', marginTop: '10px', fontSize: '13px' });

    btnRow.appendChild(btnAcessar);
    btnRow.appendChild(btnSuporte);

    // adicionar aos elementos
    loginCard.appendChild(title);
    loginCard.appendChild(subtitle);
    loginCard.appendChild(input);
    loginCard.appendChild(btnRow);
    loginCard.appendChild(erro);
    $loginOverlay.appendChild(loginCard);
    document.body.appendChild($loginOverlay);

    // eventos
    btnSuporte.onclick = () => {
      window.open('https://chat.whatsapp.com/FK6sosUXDZAD1cRhniTu0m?mode=ems_copy_t', '_blank');
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnAcessar.click();
    });

    btnAcessar.onclick = async () => {
      // carregar senhas se ainda não carregado
      if (!senhasCarregadas) {
        await carregarSenhasRemotas();
      }
      const valor = input.value;
      // usar função global verificarSenha (definida por carregarSenhasRemotas ou fallback)
      try {
        if (typeof window.verificarSenha === 'function' && window.verificarSenha(valor)) {
          senhaLiberada = true;
          sendToast("✅ Acesso concedido!", 2000);
          // remove overlay e abre painel
          try { $loginOverlay.remove(); } catch(e){}
          criarMenu(); // chama painel (corrigido: chama criarMenu imediatamente)
        } else {
          erro.style.display = 'block';
          sendToast("❌ Senha incorreta", 2000);
        }
      } catch (err) {
        console.error('Erro verificar senha:', err);
        erro.style.display = 'block';
        sendToast("❌ Erro ao verificar senha", 3000);
      }
    };
  }

  // ===== Cria as abas + conteúdo (reaproveitável) =====
  function criarAbas(containerHeader, contentArea) {
    // cria linha de abas (se já existir, atualiza)
    if ($tabsRow) $tabsRow.remove();

    $tabsRow = document.createElement('div');
    applyStyles($tabsRow, {
      display: 'flex',
      gap: '6px',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: '6px'
    });

    const abas = ['scripts','textos','respostas','outros','config'];
    abas.forEach((id) => {
      const btn = document.createElement('button');
      btn.textContent = id.toUpperCase();
      applyStyles(btn, {
        padding: '6px 8px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        color: '#fff',
        background: (abaAtiva === id) ? 'rgba(0,0,0,0.35)' : 'transparent',
        fontWeight: '700',
        flex: '1'
      });
      btn.addEventListener('click', () => {
        abaAtiva = id;
        // ao clicar, recria menu (para manter estado das abas)
        if (typeof fundo !== 'undefined' && fundo) {
          try { fundo.remove(); } catch(e){}
        }
        criarMenu();
      });
      $tabsRow.appendChild(btn);
    });

    containerHeader.appendChild($tabsRow);

    // popular conteúdo inicial baseado em abaAtiva
    populateContentByTab(contentArea, abaAtiva);
  }

  // Preencher o contentArea com botões correspondentes à aba
  function populateContentByTab(contentArea, aba) {
    // limpar
    contentArea.innerHTML = '';
    const makeBtn = (label, handler, grad=false) => {
      const b = document.createElement('button');
      b.textContent = label;
      aplicarEstiloBotao(b, grad);
      b.style.width = '100%';
      b.onclick = handler;
      return b;
    };

    const spacing = document.createElement('div');
    applyStyles(spacing, { height: '6px' });

    if (aba === 'scripts') {
      contentArea.appendChild(makeBtn('Ingles Parana', () => window.open('https://speakify.cupiditys.lol', '_blank')));
      contentArea.appendChild(makeBtn('Khan Academy', async () => {
        sendToast('⏳ Carregando Script Khan Academy...', 2000);
        // placeholder: call loader or open link
        try { await encontrarRespostaColar({debug:false}); } catch(e){}
      }));
    } else if (aba === 'textos') {
      contentArea.appendChild(makeBtn('Digitador v1', () => iniciarMod()));
      contentArea.appendChild(makeBtn('Digitador v2', async () => {
        sendToast('⏳ Carregando Digitador v2...', 2000);
        // placeholder para Digitador v2 - aqui você pode chamar a função de injeção remota
        try { await encontrarRespostaColar({debug:false}); } catch(e){}
      }));
      contentArea.appendChild(makeBtn('📄 Criar Texto com Tema via IA', criarTextoComTema));
      contentArea.appendChild(makeBtn('🔁 Reescrever Texto (remover plágio)', abrirReescritor));
    } else if (aba === 'respostas') {
      contentArea.appendChild(makeBtn('📡 Encontrar Resposta', () => encontrarRespostaColar({debug:false})));
      contentArea.appendChild(makeBtn('✍️ Encontrar Resposta (Digitar)', encontrarRespostaDigitar));
      contentArea.appendChild(makeBtn('🎯 Marcar Resposta (Colar)', () => navigator.clipboard.readText().then(r => marcarResposta(r))));
      contentArea.appendChild(makeBtn('✍️ Marcar Resposta (Digitar)', () => {
        const r = prompt("Digite a resposta:");
        if (r) marcarResposta(r);
      }));
    } else if (aba === 'outros') {
      contentArea.appendChild(makeBtn('Extensão libera bloqueio Wifi', () => window.open('https://chromewebstore.google.com/detail/x-vpn-free-vpn-chrome-ext/flaeifplnkmoagonpbjmedjcadegiigl', '_blank')));
      contentArea.appendChild(makeBtn('🎮 Jogo da Velha', async () => {
        sendToast('⏳ Carregando Jogo da Velha...', 2000);
        try { await encontrarRespostaColar({debug:false}); } catch(e){}
      }));
    } else if (aba === 'config') {
      contentArea.appendChild(makeBtn('ℹ️ Sobre o Mod', mostrarInfoDono, true));
      contentArea.appendChild(makeBtn('🎨 Cor do Botão Flutuante', trocarCorBotao));
      contentArea.appendChild(makeBtn('🔃 Resetar', () => { if (fundo) try { fundo.remove(); } catch(e){}; criarInterface(); }));
    }

    contentArea.appendChild(spacing);
  }

  // mostrar informações do dono (janela pequena)
  function mostrarInfoDono() {
    if ($loginOverlay) try { $loginOverlay.remove(); } catch(e){}
    const container = document.createElement('div');
    aplicarEstiloContainer(container);
    applyStyles(container, {
      zIndex: 1000001,
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '320px'
    });

    const titulo = document.createElement('div');
    titulo.textContent = '👑';
    aplicarEstiloTexto(titulo, '20px');

    const insta = document.createElement('div');
    insta.textContent = 'VERSÃO 1.1';
    aplicarEstiloTexto(insta, '16px');

    const info = document.createElement('div');
    info.textContent = '💻 Mod exclusivo e protegido, feito para poupar seu tempo';
    aplicarEstiloTexto(info, '14px');

    const btnFechar = document.createElement('button');
    btnFechar.textContent = 'Fechar';
    aplicarEstiloBotao(btnFechar, true);
    btnFechar.onclick = () => container.remove();

    container.append(titulo, insta, info, btnFechar);
    document.body.appendChild(container);
  }

  // trocar cor do botão flutuante (UI)
  function trocarCorBotao() {
    const container = document.createElement('div');
    aplicarEstiloContainer(container);
    applyStyles(container, {
      zIndex: 1000001,
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '260px'
    });

    const titulo = document.createElement('div');
    titulo.textContent = '🎨 Escolha a cor do botão';
    aplicarEstiloTexto(titulo, '16px');

    const inputColor = document.createElement('input');
    inputColor.type = 'color';
    inputColor.value = corBotao;
    applyStyles(inputColor, { width: '100%', height: '60px', border: 'none', background: 'transparent', cursor: 'pointer', marginBottom: '12px' });

    const btnAplicar = document.createElement('button');
    btnAplicar.textContent = 'Aplicar';
    aplicarEstiloBotao(btnAplicar, true);
    btnAplicar.onclick = () => {
      corBotao = inputColor.value;
      localStorage.setItem("corBotaoDhonatan", corBotao);
      document.querySelectorAll("#dhonatanBotao").forEach(b => b.style.background = corBotao);
      container.remove();
      sendToast('✅ Cor alterada!', 2000);
    };

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    aplicarEstiloBotao(btnCancelar);
    btnCancelar.onclick = () => container.remove();

    container.append(titulo, inputColor, btnAplicar, btnCancelar);
    document.body.appendChild(container);
  }

  // ===== Criação do painel principal com header vermelho e abas dentro do header =====
  let fundo = null;
  function criarMenu() {
    // remover se já existir
    if (fundo) try { fundo.remove(); } catch(e){}

    fundo = document.createElement('div');
    applyStyles(fundo, {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    });

    $panel = document.createElement('div');
    aplicarEstiloContainer($panel);
    applyStyles($panel, { width: '380px', maxWidth: '94vw', borderRadius: '12px', overflow: 'hidden' });

    // Header vermelho (contendo título + relógio + abas abaixo)
    $panelHeader = document.createElement('div');
    applyStyles($panelHeader, {
      background: 'linear-gradient(180deg,#b30000,#990000)',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'stretch'
    });

    // linha título + relógio
    const rowTop = document.createElement('div');
    applyStyles(rowTop, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '10px'
    });

    const titulo = document.createElement('div');
    titulo.textContent = 'PAINEL AUXÍLIO';
    applyStyles(titulo, { fontSize: '18px', fontWeight: '800', color: '#fff', textAlign: 'left' });

    const relogio = document.createElement('div');
    relogio.id = 'painelRelogio';
    applyStyles(relogio, { fontSize: '14px', color: '#fff' });
    // atualiza relógio a cada segundo
    setInterval(() => {
      relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    }, 1000);
    relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    rowTop.appendChild(titulo);
    rowTop.appendChild(relogio);
    $panelHeader.appendChild(rowTop);

    // abas (embaixo, ainda dentro do header vermelho)
    const abasRow = document.createElement('div');
    applyStyles(abasRow, {
      display: 'flex',
      gap: '6px',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%'
    });

    // criarAbas vai colocar os botões e atualizar $tabsRow
    criarAbas($panelHeader, null); // chamar para criar $tabsRow (usará criarMenu novamente para reposicionar)
    // OBS: criarAbas adiciona tabs no header e chama populateContentByTab,
    // mas precisamos um content area para passar. Assim vamos recriar aqui contentArea abaixo e chamar populateContentByTab manualmente.

    // area de conteudo (fundo preto translúcido)
    $contentArea = document.createElement('div');
    applyStyles($contentArea, {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: '#0e0e10',
      maxHeight: '52vh',
      overflowY: 'auto'
    });

    // Botões sociais + ações do login original (mantidos)
    // criar botões: Discord, WhatsApp, YouTube ManoRick, YouTube MlkMau
    const btnDiscord = document.createElement('button');
    btnDiscord.innerHTML = 'Discord';
    aplicarEstiloBotao(btnDiscord);
    btnDiscord.style.background = '#5865F2';
    btnDiscord.onclick = () => window.open('https://discord.gg/NfVKXRSvYK', '_blank');

    const btnWhatsApp = document.createElement('button');
    btnWhatsApp.innerHTML = 'WhatsApp';
    aplicarEstiloBotao(btnWhatsApp);
    btnWhatsApp.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';
    btnWhatsApp.onclick = () => window.open('https://chat.whatsapp.com/FK6sosUXDZAD1cRhniTu0m?mode=ems_copy_t', '_blank');

    const btnMano = document.createElement('button');
    btnMano.innerHTML = 'Canal ManoRick';
    aplicarEstiloBotao(btnMano);
    btnMano.style.background = 'linear-gradient(135deg, #ff0000, #990000)';
    btnMano.onclick = () => window.open('https://youtube.com/@manorickzin?si=V_71STAk8DLJNhtd', '_blank');

    const btnMlk = document.createElement('button');
    btnMlk.innerHTML = 'Canal MlkMau';
    aplicarEstiloBotao(btnMlk);
    btnMlk.style.background = 'linear-gradient(135deg, #ff0000, #990000)';
    btnMlk.onclick = () => window.open('https://youtube.com/@mlkmau5960?si=10XFeUjXBoYDa_JQ', '_blank');

    // container para botões sociais (scroll horiz)
    const socialRow = document.createElement('div');
    applyStyles(socialRow, {
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      width: '100%',
      paddingBottom: '6px'
    });
    socialRow.append(btnDiscord, btnWhatsApp, btnMano, btnMlk);

    // adicionar contéudo default (dependendo da aba ativa)
    populateContentByTab($contentArea, abaAtiva);

    // botões finais (fechar/minimizar)
    const footRow = document.createElement('div');
    applyStyles(footRow, { display: 'flex', gap: '8px', marginTop: '6px' });

    const btnFechar = document.createElement('button');
    btnFechar.textContent = '👁️ Fechar Menu';
    aplicarEstiloBotao(btnFechar);
    btnFechar.onclick = () => {
      if (fundo) try { fundo.remove(); } catch(e){}
      const btnFlutuante = document.getElementById('dhonatanBotao');
      if (btnFlutuante) btnFlutuante.remove();
    };

    const btnMinimizar = document.createElement('button');
    btnMinimizar.textContent = '❌ Minimizar Menu';
    aplicarEstiloBotao(btnMinimizar);
    btnMinimizar.onclick = () => {
      if (fundo) try { fundo.remove(); } catch(e){}
      criarBotaoFlutuante();
    };

    footRow.appendChild(btnFechar);
    footRow.appendChild(btnMinimizar);

    // montar painel
    $panel.appendChild($panelHeader);
    $panel.appendChild($contentArea);
    $panel.appendChild(footRow);

    // preencher conteúdo inicial de acordo com abas (recriar as abas dentro do header)
    // removendo eventuais abas duplicadas geradas por criarAbas anteriormente:
    const existingTabs = $panelHeader.querySelectorAll('div');
    // garantir que $tabsRow exista; se não, chama criarAbas novamente
    if (!$tabsRow) {
      criarAbas($panelHeader, $contentArea);
    } else {
      // $tabsRow já foi criado pela criarAbas chamada anteriormente, então colocamos dentro do header (se ainda não estiver)
      if ($panelHeader && !$panelHeader.contains($tabsRow)) {
        $panelHeader.appendChild($tabsRow);
      }
    }
    // garantir atualização do conteúdo
    populateContentByTab($contentArea, abaAtiva);

    fundo.appendChild($panel);
    document.body.appendChild(fundo);
  }

  // ===== Criar interface (tela de login) quando não logado =====
  function criarInterface() {
    // se já tem fundo, remover
    if (fundo) try { fundo.remove(); } catch(e){}
    criarTelaLogin(); // exibe overlay de login
  }

  // ===== Botão flutuante (arrastável) - cria/reativa o botão =====
  function criarBotaoFlutuante() {
    // remover botão anterior se existir
    const prev = document.getElementById('dhonatanBotao');
    if (prev) prev.remove();

    $floatingBtn = document.createElement('div');
    $floatingBtn.id = 'dhonatanBotao';
    $floatingBtn.textContent = 'Painel';
    applyStyles($floatingBtn, {
      position: 'fixed',
      left: posX,
      top: posY,
      background: corBotao,
      padding: '12px 18px',
      borderRadius: '30px',
      cursor: 'grab',
      zIndex: 9999999,
      fontWeight: '700',
      userSelect: 'none',
      color: '#fff',
      boxShadow: '0 6px 30px rgba(0,0,0,0.3)',
      transition: 'all 0.2s ease'
    });
    $floatingBtn.setAttribute('role','button');
    $floatingBtn.style.display = 'inline-flex';
    $floatingBtn.style.alignItems = 'center';
    $floatingBtn.style.justifyContent = 'center';

    // drag variables
    let isDragging = false;
    let startX = 0, startY = 0, initLeft = 0, initTop = 0;
    const DRAG_THRESHOLD = 6;

    function startDrag(e) {
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      startX = clientX; startY = clientY;
      initLeft = parseFloat($floatingBtn.style.left) || 0;
      initTop = parseFloat($floatingBtn.style.top) || 0;
      isDragging = false;
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('mouseup', endDrag);
      document.addEventListener('touchend', endDrag);
      e.preventDefault();
    }

    function handleDragMove(e) {
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;
      if (!isDragging && Math.sqrt(dx*dx + dy*dy) > DRAG_THRESHOLD) isDragging = true;
      if (isDragging) {
        const newLeft = initLeft + dx;
        const newTop = initTop + dy;
        $floatingBtn.style.left = `${newLeft}px`;
        $floatingBtn.style.top = `${newTop}px`;
      }
    }

    function endDrag(e) {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchend', endDrag);

      if (!isDragging) {
        // click (abre painel)
        if (senhaLiberada) {
          // se painel já aberto, fecha-minimiza e cria flutuante de novo
          if (fundo) { try { fundo.remove(); } catch(e){}; }
          criarMenu();
        } else {
          // abrir tela de login
          criarInterface();
        }
      } else {
        // salvar posição
        posX = $floatingBtn.style.left;
        posY = $floatingBtn.style.top;
        try {
          localStorage.setItem("dhonatanX", posX);
          localStorage.setItem("dhonatanY", posY);
        } catch (e) { /* ignore */ }
      }
      isDragging = false;
    }

    $floatingBtn.addEventListener('mousedown', startDrag);
    $floatingBtn.addEventListener('touchstart', startDrag, { passive: false });

    // clique alterna painel (somente se não arrastado) -> mas já tratado no endDrag
    $floatingBtn.addEventListener('click', (e) => { /* noop - handled in endDrag */ });

    document.body.appendChild($floatingBtn);
  }

  // ===== Iniciar automaticamente: criar botao flutuante; caso deseje show login, chamar criarInterface() =====
  // Se houver senha já liberada (localStorage?) - não implementado, sempre inicia botão flutuante e login ao clicar
  criarBotaoFlutuante();

  // Exibir login logo no começo
  criarInterface();

  // Expor algumas funções globalmente (se necessário)
  window.criarMenuPainelAuxilio = criarMenu;
  window.criarBotaoFlutuante = criarBotaoFlutuante;
  window.carregarSenhasRemotas = carregarSenhasRemotas;
  window.encontrarRespostaColar = encontrarRespostaColar;
  window.iniciarMod = iniciarMod;
  window.marcarResposta = marcarResposta;
  window.criarTextoComTema = criarTextoComTema;
  window.abrirReescritor = abrirReescritor;

  // Mostrar toast de boas-vindas (após carregamento)
  setTimeout(showWelcomeToasts, 700);

})();
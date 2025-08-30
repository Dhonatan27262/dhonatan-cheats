// ==UserScript==
// @name         SANTOS.meczada - Captura Profissional Quizizz v10
// @namespace    http://tampermonkey.net/
// @version      10.0
// @description  Captura cirúrgica de pergunta + alternativas no Quizizz/Wayground. Heurísticas centrais, OCR opcional, filtro de ruído e modo manual. Cole no Tampermonkey como user script (.user.js).
// @match        *://*/*
// @grant        none
// @icon         https://i.imgur.com/7YbX5Jx.png
// ==/UserScript==

(function () {
  'use strict';

  /**
   * SANTOS.meczada v10
   * - Extração cirúrgica do container da pergunta
   * - Separação enunciado/opções
   * - Heurística central (viewport) + seletores específicos
   * - Filtros anti-ruído e sanitização
   * - MutationObserver + polling + modo manual de captura (clique)
   * - OCR opcional (usa Tesseract.js se ativado)
   *
   * Instalação: criar novo userscript no Tampermonkey e colar este arquivo.
   *
   * Observações:
   * - OCR está DESATIVADO por padrão (pode causar CORS / tempo de carregamento).
   * - Se quiser ativar OCR, ajuste CFG.enableOCR = true.
   */

  const CFG = {
    pollInterval: 1200,
    debounceMs: 140,
    maxPerplexityChars: 1800,
    maxPreviewChars: 1400,
    maxInternalChars: 12000,
    useCenterHeuristic: true,
    traverseShadowRoots: true,
    quizSelectors: {
      question: [
        '[data-test="question-text"]', '.question-text', '.qz-question', '.q-text',
        '.question', '.prompt', '[class*="question"]', '[class*="prompt"]',
        '[data-qa*="question"]', '[data-qa*="prompt"]'
      ],
      option: [
        '[data-test="option"]', '.option', '.qz-option', '.answer', '.choice',
        '[class*="option"]', '[class*="answer"]', '[class*="choice"]',
        '[role="option"]', '[role="radio"]', 'button', 'li', 'label'
      ],
      containerHints: [
        '[data-test*="question"]', '.qz-question-container', '.questionContainer',
        '.qz-question-card', '[class*="question"][class*="container"]'
      ]
    },
    noiseWords: [
      'next', 'submit', 'skip', 'pause', 'score', 'timer', 'bônus', 'bonus',
      'your rank', 'progresso', 'opções', 'confirmar', 'responder', 'entrar',
      'sair', 'login', 'multiplayer', 'offline', 'carregando', 'loading'
    ],
    enableOCR: false, // ativar manualmente se desejar (pode aumentar uso de rede e CPU)
    tesseractCDN: 'https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js'
  };

  // -------------------------------------------
  // UTILITÁRIOS
  // -------------------------------------------
  const log = (...args) => console.log('[SANTOS.meczada]', ...args);
  const now = () => new Date().toLocaleTimeString();

  const isQuizizzHost = () => /quizizz|wayground/i.test(location.hostname) || !!document.querySelector('[class*="quizizz"], [class*="qz-"], [data-test*="quizizz"]');

  const sanitizeSpaces = (s) => (s || '').replace(/\s+/g, ' ').trim();

  // Remove palavras duplicadas consecutivas (suporta letras acentuadas)
  const removeDoubleWords = (s) => {
    try {
      return s.replace(/(\p{L}[\p{L}\p{M}'-]*)(\s+\1)+/giu, '$1');
    } catch (e) {
      // fallback se o engine não suportar \p
      return s.replace(/(\b\w+\b)(\s+\1)+/ig, '$1');
    }
  };

  const normalizeText = (s) => {
    if (!s) return '';
    let t = s.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    t = t.replace(/[ \t]+\n/g, '\n');
    t = removeDoubleWords(t);
    t = sanitizeSpaces(t);
    return t;
  };

  const isNodeVisible = (el) => {
    if (!el || !(el instanceof Element)) return false;
    if (el.closest && el.closest('#santos-meczada-ui')) return false; // não pegar nossa UI
    const style = window.getComputedStyle(el);
    if (!style) return false;
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
    if (el.hasAttribute && el.hasAttribute('aria-hidden') && el.getAttribute('aria-hidden') === 'true') return false;
    if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
    if (el.getClientRects().length === 0) return false;
    // evitando elementos completamente fora da viewport
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) {
      if (r.width < 8 || r.height < 8) return false;
    }
    return true;
  };

  const getTextLike = (el) => {
    if (!el) return '';
    // evita inputs vazios
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const p = (el.placeholder || el.value || '').toString().trim();
      return p;
    }
    let t = '';
    try { t = el.innerText || ''; } catch (e) { try { t = el.textContent || ''; } catch (e2) { t = ''; } }
    t = (t || '').trim();
    // complementar com aria-label/title/alt
    try {
      const aria = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) || '';
      const title = el.getAttribute && el.getAttribute('title') || '';
      const alt = el.getAttribute && el.getAttribute('alt') || '';
      [aria, title, alt].forEach(a => { if (a && !t.includes(a)) t += (t ? ' ' : '') + a; });
    } catch (_) {}
    return normalizeText(t);
  };

  // percorre shadowRoots se permitido
  const walkElements = (root = document) => {
    const out = [];
    const stack = [root];
    while (stack.length) {
      const node = stack.pop();
      let children = [];
      if (node instanceof ShadowRoot || node instanceof Document || node instanceof DocumentFragment) {
        children = Array.from(node.children || []);
      } else if (node instanceof Element) {
        out.push(node);
        children = Array.from(node.children || []);
        if (CFG.traverseShadowRoots && node.shadowRoot) stack.push(node.shadowRoot);
      }
      for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
    }
    return out;
  };

  // tentativa de carregar Tesseract dinamicamente (se necessário)
  const loadTesseract = () => {
    return new Promise((resolve, reject) => {
      if (!CFG.enableOCR) return resolve(null);
      if (window.Tesseract) return resolve(window.Tesseract);
      const s = document.createElement('script');
      s.src = CFG.tesseractCDN;
      s.onload = () => setTimeout(() => resolve(window.Tesseract), 200);
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  };

  // -------------------------------------------
  // DETECÇÃO DO CONTAINER ATIVO (PERGUNTA)
  // -------------------------------------------
  const findBySelectors = (selectors) => {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el && isNodeVisible(el) && getTextLike(el).length >= 4) return el;
      } catch (e) { /* ignore invalid selectors */ }
    }
    return null;
  };

  const candidatesFromSelectors = (selectors) => {
    let nodes = [];
    for (const sel of selectors) {
      try {
        const n = Array.from(document.querySelectorAll(sel));
        if (n && n.length) nodes = nodes.concat(n);
      } catch (e) {}
    }
    // filtrar visíveis
    nodes = nodes.filter(isNodeVisible);
    return nodes;
  };

  const centerHeuristicPick = () => {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const candidates = [];
    walkElements().forEach(el => {
      if (!isNodeVisible(el)) return;
      const txt = getTextLike(el);
      if (!txt || txt.length < 6) return;
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width/2, ey = r.top + r.height/2;
      const dist = Math.hypot(cx - ex, cy - ey) + 1;
      const score = (txt.length) / (dist);
      candidates.push({el, score, txt, area: r.width * r.height});
    });
    if (!candidates.length) return null;
    candidates.sort((a,b) => b.score - a.score);
    return candidates[0].el;
  };

  const ascendToQuestionCard = (el) => {
    if (!el) return null;
    let node = el;
    for (let i = 0; i < 6 && node; i++) {
      if (node.matches) {
        const cls = node.className || '';
        if (/(question|card|qz|prompt|container)/i.test(cls)) return node;
      }
      node = node.parentElement;
    }
    // fallback: climb until width > 30% viewport
    node = el.parentElement;
    while (node && node.parentElement) {
      const r = node.getBoundingClientRect();
      if (r.width > innerWidth * 0.28) return node;
      node = node.parentElement;
    }
    return el.parentElement || el;
  };

  // -------------------------------------------
  // EXTRAÇÃO DE PERGUNTA E OPÇÕES
  // -------------------------------------------
  const getOptionsWithin = (root) => {
    if (!root) return [];
    const found = [];
    const pushIf = (el) => {
      if (!el || !isNodeVisible(el)) return;
      const t = getTextLike(el);
      if (!t || t.length < 1) return;
      if (isNoiseText(t)) return;
      // evitar textos idênticos ao container (ex.: titulo repetido)
      if (t.length > 400) return;
      found.push({el, text: t});
    };

    // procurar por roles e seletores comuns primeiro
    const roleCandidates = safeQueryAll(root, '[role="option"], [role="radio"], [role="checkbox"], [data-test="option"]');
    roleCandidates.forEach(pushIf);

    // seletores configurados
    CFG.quizSelectors.option.forEach(sel => {
      safeQueryAll(root, sel).forEach(pushIf);
    });

    // labels/buttons/li como fallback
    safeQueryAll(root, 'li, label, button').forEach(pushIf);

    // ordenar por posição Y (top) para garantir ordem A,B,C...
    const dedup = [];
    const seen = new Set();
    found.sort((a,b) => (a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top));
    found.forEach(it => {
      const key = it.text.trim().toLowerCase();
      if (!seen.has(key)) { seen.add(key); dedup.push(it.text.trim()); }
    });
    // filtrar ruídos curtos e números
    return dedup.filter(t => t && t.length > 1).slice(0, 12);
  };

  // querySelectorAll seguro
  function safeQueryAll(root, selector) {
    try { return Array.from((root || document).querySelectorAll(selector)); } catch (e) { return []; }
  }

  const isNoiseText = (txt) => {
    if (!txt) return true;
    const s = txt.toLowerCase();
    for (const w of CFG.noiseWords) if (s.includes(w)) return true;
    // muitas quebras de linha ou só números -> ruído
    if (/^\d+[:.]?$/.test(s) && s.length < 6) return true;
    if (/^[\W_]+$/.test(s)) return true;
    return false;
  };

  const extractFromContainer = async (container) => {
    if (!container) return { question: '', options: [], context: [] };
    // localizar um sub-elemento que claramente pareça ser o texto da pergunta
    let qEl = findBySelectorsWithin(container, CFG.quizSelectors.question);
    if (!qEl && CFG.useCenterHeuristic) {
      // tentar heurística local dentro do container
      const cand = centerHeuristicPick();
      if (cand && container.contains(cand)) qEl = cand;
    }
    if (!qEl) {
      // fallback: maior texto dentro do container
      const texts = [];
      Array.from(container.querySelectorAll('*')).forEach(el => {
        if (!isNodeVisible(el)) return;
        const t = getTextLike(el);
        if (t && t.length > 8) texts.push({el, t, len: t.length});
      });
      texts.sort((a,b)=>b.len - a.len);
      qEl = texts[0] && texts[0].el;
    }

    let question = qEl ? getTextLike(qEl) : '';
    // se a pergunta parecer pequena, tente imagens + OCR (se habilitado)
    if ((!question || question.length < 8) && CFG.enableOCR) {
      const imgs = Array.from(container.querySelectorAll('img')).filter(isNodeVisible);
      if (imgs.length) {
        try {
          const tesseract = await loadTesseract();
          if (tesseract && window.Tesseract && typeof Tesseract.recognize === 'function') {
            // tentaremos o primeiro img
            const txtOCR = await ocrImage(imgs[0]);
            if (txtOCR && txtOCR.length > 10) question = normalizeText(question + ' ' + txtOCR);
          }
        } catch (e) {
          log('OCR failed', e);
        }
      }
    }

    const options = getOptionsWithin(container);
    // caso não haja opções detectadas, procurar nas proximidades (ancestrais/irmãos)
    if (!options.length) {
      let node = container.parentElement;
      let tries = 0;
      while (node && tries < 4 && !options.length) {
        const o = getOptionsWithin(node);
        if (o.length) { options.push(...o); break; }
        node = node.parentElement; tries++;
      }
    }

    // contexto adjacente (captura instruções/titulos menores)
    const ctx = [];
    const sibs = Array.from((qEl && qEl.parentElement ? qEl.parentElement.children : [])).filter(el => el !== qEl);
    sibs.forEach(s => {
      if (!isNodeVisible(s)) return;
      const t = getTextLike(s);
      if (t && t.length > 6 && !isNoiseText(t)) ctx.push(t);
    });

    return { question: normalizeText(question), options: options.map(normalizeText), context: ctx.slice(0,6) };
  };

  function findBySelectorsWithin(root, selectors) {
    for (const s of selectors) {
      try {
        const el = (root || document).querySelector(s);
        if (el && isNodeVisible(el) && getTextLike(el).length > 3) return el;
      } catch (e) {}
    }
    return null;
  }

  // OCR helper (may fail due to CORS)
  async function ocrImage(imgEl) {
    if (!imgEl) return '';
    try {
      // tentar desenhar a imagem em canvas (pode taint se CORS bloquear)
      const canvas = document.createElement('canvas');
      const w = Math.min(imgEl.naturalWidth || imgEl.width || 800, 1600);
      const h = Math.min(imgEl.naturalHeight || imgEl.height || 600, 1600);
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/png');
      if (!window.Tesseract) await loadTesseract();
      if (!window.Tesseract) return '';
      const res = await Tesseract.recognize(dataUrl, 'por', { logger: m => log('OCR', m) });
      return res && res.data && res.data.text ? normalizeText(res.data.text) : '';
    } catch (e) {
      log('OCR error', e);
      return '';
    }
  }

  // -------------------------------------------
  // CONSTRUÇÃO DO TEXTO FINAL PARA O PREVIEW / PERPLEXITY
  // -------------------------------------------
  const toStructuredString = ({ question, options, context }) => {
    const parts = [];
    parts.push(`# ${document.title || 'Sem título'}`);
    parts.push(`**URL:** ${location.href}`);
    if (question) {
      parts.push('');
      parts.push('## PERGUNTA:');
      parts.push(question);
    }
    if (options && options.length) {
      parts.push('');
      parts.push('## OPÇÕES:');
      options.forEach((o, i) => {
        const label = String.fromCharCode(65 + i);
        parts.push(`${label}) ${o}`);
      });
    }
    if (context && context.length) {
      parts.push('');
      parts.push('## CONTEXTO:');
      context.forEach(c => parts.push(`- ${c}`));
    }
    let out = parts.join('\n');
    if (out.length > CFG.maxInternalChars) out = out.slice(0, CFG.maxInternalChars) + '\n\n… [truncated]';
    return out;
  };

  // -------------------------------------------
  // UI: preview, botões (Enviar Perplexity, copiar, captura manual)
  // -------------------------------------------
  let lastPayload = '';
  let debounceTimer = null;
  let observerHandle = null;
  let pollHandle = null;

  const buildUI = () => {
    if (document.getElementById('santos-meczada-ui')) return;
    const ui = document.createElement('div');
    ui.id = 'santos-meczada-ui';
    Object.assign(ui.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      width: '380px',
      zIndex: 2147483647,
      fontFamily: 'Segoe UI, system-ui, Arial, sans-serif',
      boxShadow: '0 10px 24px rgba(0,0,0,.45)',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,.12)',
      background: 'linear-gradient(180deg,#0b3450,#00a6d6)',
      color: '#fff'
    });

    ui.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(0,0,0,.12)">
        <div style="display:flex;gap:8px;align-items:center;font-weight:700">
          <span>🎯 SANTOS.meczada</span>
          <span id="santos-host" style="font-size:12px;padding:3px 8px;border-radius:8px;background:rgba(255,255,255,.08);color:#fff">${isQuizizzHost() ? 'Quizizz' : 'Auto'}</span>
        </div>
        <div>
          <button id="santos-close" title="Fechar" style="border:none;background:transparent;color:#fff;font-size:16px;cursor:pointer">×</button>
        </div>
      </div>
      <div id="santos-body" style="padding:12px;display:flex;flex-direction:column;gap:10px">
        <div id="santos-preview" style="background:rgba(255,255,255,.06);border-radius:10px;padding:10px;max-height:300px;overflow:auto;font-family:monospace;font-size:13px;white-space:pre-wrap">
          <div style="opacity:.9;text-align:center;padding:20px">Aguardando captura...</div>
        </div>
        <div style="display:flex;gap:8px">
          <button id="santos-perplex" style="flex:1;background:#9c27b0;border:none;border-radius:8px;padding:9px;color:#fff;font-weight:700;cursor:pointer">Enviar Perplexity</button>
          <button id="santos-copy" style="background:#2e7d32;border:none;border-radius:8px;padding:9px;color:#fff;font-weight:700;cursor:pointer">Copiar</button>
          <button id="santos-manual" style="background:#1976d2;border:none;border-radius:8px;padding:9px;color:#fff;font-weight:700;cursor:pointer">Capturar área</button>
        </div>
      </div>
    `;
    document.body.appendChild(ui);
    document.getElementById('santos-close').onclick = () => ui.remove();
    document.getElementById('santos-perplex').onclick = () => {
      if (!lastPayload) return toast('Nada capturado');
      let q = lastPayload;
      if (q.length > CFG.maxPerplexityChars) q = q.slice(0, CFG.maxPerplexityChars) + '…';
      const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`;
      window.open(url, '_blank');
    };
    document.getElementById('santos-copy').onclick = async () => {
      try { await navigator.clipboard.writeText(lastPayload || ''); toast('Copiado!'); } catch { toast('Falha ao copiar'); }
    };
    document.getElementById('santos-manual').onclick = () => enableManualCapture();
  };

  const updatePreviewUI = (text) => {
    const box = document.getElementById('santos-preview');
    if (!box) return;
    let view = text || '';
    if (view.length > CFG.maxPreviewChars) view = view.slice(0, CFG.maxPreviewChars) + '\n…';
    // highlight headings
    view = view.replace(/^# .+$/m, m => `<b style="color:#ffeb3b">${m}</b>`);
    view = view.replace(/^## (PERGUNTA|OPÇÕES|CONTEXTO):$/gm, m => `<b style="color:#80deea">${m}</b>`);
    box.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-weight:700">Conteúdo</span><small style="opacity:.9">${now()}</small></div><div>${escapeHtml(view)}</div>`;
  };

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  const toast = (msg) => {
    const n = document.createElement('div');
    Object.assign(n.style, {position:'fixed',right:'26px',bottom:'120px',zIndex:2147483647,background:'rgba(0,0,0,.85)',color:'#fff',padding:'10px 14px',borderRadius:'8px',fontSize:'13px'});
    n.textContent = msg; document.body.appendChild(n); setTimeout(()=>n.remove(),1600);
  };

  // -------------------------------------------
  // MODO MANUAL: clique num bloco para capturar
  // -------------------------------------------
  let manualActive = false;
  let manualOverlay = null;

  const enableManualCapture = () => {
    if (manualActive) return disableManualCapture();
    manualActive = true;
    toast('Clique no bloco desejado (Esc para cancelar)');
    manualOverlay = document.createElement('div');
    Object.assign(manualOverlay.style, {position:'fixed',inset:0,zIndex:2147483646,cursor:'crosshair',background:'transparent'});
    document.body.appendChild(manualOverlay);
    const hover = document.createElement('div');
    Object.assign(hover.style, {position:'fixed',border:'2px solid #00e5ff',background:'rgba(0,229,255,.06)',pointerEvents:'none',zIndex:2147483647});
    document.body.appendChild(hover);

    const onMove = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || !isNodeVisible(el)) { hover.style.display='none'; return; }
      const r = el.getBoundingClientRect();
      Object.assign(hover.style, {display:'block',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
    };
    const onClick = async (e) => {
      e.preventDefault(); e.stopPropagation();
      const el = document.elementFromPoint(e.clientX, e.clientY);
      disableManualCapture();
      if (!el) return;
      const container = ascendToQuestionCard(el) || el;
      const out = await extractFromContainer(container);
      lastPayload = toStructuredString(out);
      updatePreviewUI(lastPayload);
      toast('Capturado manualmente');
    };
    const onKey = (e) => { if (e.key === 'Escape') { disableManualCapture(); toast('Cancelado'); } };

    manualOverlay.addEventListener('mousemove', onMove);
    manualOverlay.addEventListener('click', onClick, {capture:true});
    window.addEventListener('keydown', onKey, {once:true});

    manualOverlay._cleanup = () => {
      manualOverlay.removeEventListener('mousemove', onMove);
      manualOverlay.removeEventListener('click', onClick, {capture:true});
      window.removeEventListener('keydown', onKey, {once:true});
      hover.remove();
      manualOverlay.remove();
    };
  };

  const disableManualCapture = () => {
    manualActive = false;
    if (manualOverlay && manualOverlay._cleanup) manualOverlay._cleanup();
    manualOverlay = null;
  };

  // -------------------------------------------
  // LOGICA PRINCIPAL: encontrar container ativo e processar
  // -------------------------------------------
  const findActiveQuestionContainer = () => {
    // 1) tenta seletores diretos
    let direct = findBySelectors(CFG.quizSelectors.question);
    if (direct && isNodeVisible(direct)) return ascendToQuestionCard(direct);

    // 2) tenta achar elemento com classe "question" visível e com texto razoável
    const qCandidates = candidatesFromSelectors(CFG.quizSelectors.question);
    if (qCandidates.length) {
      qCandidates.sort((a,b) => getTextLike(b).length - getTextLike(a).length);
      return ascendToQuestionCard(qCandidates[0]);
    }

    // 3) heurística central
    if (CFG.useCenterHeuristic) {
      const c = centerHeuristicPick();
      if (c) return ascendToQuestionCard(c);
    }

    // 4) fallback: maior bloco visível na viewport (com texto)
    const all = walkElements();
    const blocks = [];
    all.forEach(el => {
      if (!isNodeVisible(el)) return;
      const t = getTextLike(el);
      if (!t || t.length < 15) return;
      const r = el.getBoundingClientRect();
      const score = t.length * (r.width * r.height) / (1 + Math.hypot(innerWidth/2 - (r.left+r.width/2), innerHeight/2 - (r.top+r.height/2)));
      blocks.push({el, score, t});
    });
    blocks.sort((a,b)=>b.score - a.score);
    if (blocks.length) return ascendToQuestionCard(blocks[0].el);

    return null;
  };

  // Debounce wrapper
  const debounce = (fn, ms) => {
    return function(...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  const processNow = async () => {
    try {
      const container = findActiveQuestionContainer();
      if (!container) return;
      const out = await extractFromContainer(container);
      const structured = toStructuredString(out);
      if (!structured || structured === lastPayload) return;
      lastPayload = structured;
      updatePreviewUI(structured);
    } catch (e) {
      log('processNow error', e);
    }
  };

  // -------------------------------------------
  // Observers: MutationObserver + polling + resize/scroll
  // -------------------------------------------
  const startObservers = () => {
    stopObservers();
    observerHandle = new MutationObserver(debounce(() => processNow(), CFG.debounceMs));
    observerHandle.observe(document.documentElement || document.body, {childList:true, subtree:true, characterData:true, attributes:true});
    pollHandle = setInterval(processNow, CFG.pollInterval);
    window.addEventListener('resize', debounce(processNow, 200));
    window.addEventListener('scroll', debounce(processNow, 200), {passive:true});
  };

  const stopObservers = () => {
    if (observerHandle) { observerHandle.disconnect(); observerHandle = null; }
    if (pollHandle) { clearInterval(pollHandle); pollHandle = null; }
    window.removeEventListener('resize', debounce(processNow, 200));
    window.removeEventListener('scroll', debounce(processNow, 200));
  };

  // -------------------------------------------
  // START
  // -------------------------------------------
  function init() {
    buildUI();
    startObservers();
    processNow();
    log('SANTOS.meczada v10 inicializado (host:', isQuizizzHost(), ')');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 80);
  } else {
    window.addEventListener('DOMContentLoaded', init, {once:true});
  }

})();

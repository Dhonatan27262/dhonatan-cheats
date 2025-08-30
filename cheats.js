// ==UserScript==
// @name         SANTOS.meczada - Flutuante Arrastável + Detecção Avançada v12
// @namespace    http://tampermonkey.net/
// @version      12.1
// @description  Menu flutuante arrastável/minimizável + detecção aprimorada de pergunta e opções (Quizizz/Wayground). Copiar / Enviar Perplexity / Captura manual.
// @match        *://*/*
// @grant        none
// @icon         https://i.imgur.com/7YbX5Jx.png
// ==/UserScript==

(function () {
  'use strict';

  /**************************************************************************
   * CONFIG
   **************************************************************************/
  const CFG = {
    pollInterval: 1100,
    debounceMs: 120,
    maxPerplexityChars: 1800,
    minTextLen: 5,
    clusterGapPx: 28,
    enableAppearanceDetection: true,
    savePositionKey: 'santos_meczada_pos_v12',
    saveMinimizedKey: 'santos_meczada_min_v12'
  };

  /**************************************************************************
   * UTIL
   **************************************************************************/
  const nowStr = () => new Date().toLocaleTimeString();
  const normalize = s => (s||'').replace(/\s+/g, ' ').trim();
  const clamp = (s, n) => (s.length > n ? s.slice(0,n) + '…' : s);
  const isElement = o => o && o.nodeType === 1;
  const tryQuery = (sel) => { try { return document.querySelector(sel); } catch { return null; } };

  function isVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    if (el.closest && el.closest('#santos-meczada-ui-v12')) return false;
    if (el.hasAttribute && el.getAttribute('aria-hidden') === 'true') return false;
    const st = getComputedStyle(el);
    if (!st) return false;
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return false;
    if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
    const r = el.getBoundingClientRect();
    if (r.bottom < -5 || r.top > (innerHeight + 5) || r.right < -5 || r.left > (innerWidth + 5)) return false;
    return true;
  }

  function getText(el) {
    if (!el) return '';
    try {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return (el.placeholder||el.value||'').trim();
    } catch {}
    let t = '';
    try { t = el.innerText || el.textContent || ''; } catch {}
    t = (t||'').trim();
    try {
      const attrs = [(el.getAttribute && el.getAttribute('aria-label')) || '',
                     (el.getAttribute && el.getAttribute('title')) || '',
                     (el.getAttribute && el.getAttribute('alt')) || ''];
      attrs.forEach(a => { if (a && !t.includes(a)) t += (t? ' ':'')+ a; });
    } catch {}
    return normalize(t);
  }

  // Determina se um elemento parece um botão grande colorido (opção do quiz)
  function looksLikeBigOption(el) {
    if (!isElement(el) || !isVisible(el)) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 36) return false;
    const st = getComputedStyle(el);
    const bg = st.backgroundColor || '';
    if (bg && /rgba?\(.+\)/.test(bg)) {
      if (!bg.includes('0, 0, 0, 0') && !bg.includes('transparent')) {
        const br = parseFloat(st.borderRadius) || 0;
        if (br > 6 || st.border && st.border !== '0px none rgb(0, 0, 0)') return true;
      }
    }
    const role = el.getAttribute && el.getAttribute('role');
    if ((role && /button|option|radio/i.test(role)) || el.tagName === 'BUTTON') return true;
    return false;
  }

  // Função para validar se o texto de opção é válido
  function isOptionValid(optionText) {
    const invalidKeywords = ['zoom', 'image', 'question', 'da imagem', 'imagem da', 'clicar', 'expandir', 'voltar', 'próxima', 'anterior', 'enviar', 'copiar', 'capturar', 'área'];
    const lowerOption = optionText.toLowerCase();
    if (optionText.length < 5) return false;
    for (const kw of invalidKeywords) {
      if (lowerOption.includes(kw)) return false;
    }
    return true;
  }

  function collectVisibleTextNodes(root=document) {
    const nodes = [];
    const all = Array.from(root.querySelectorAll('body *'));
    const ignoreClasses = ['button', 'btn', 'icon', 'zoom', 'image', 'toolbar', 'header', 'footer', 'menu', 'navbar'];
    for (const el of all) {
      if (!isVisible(el)) continue;
      const className = (el.className || '').toLowerCase();
      if (ignoreClasses.some(ig => className.includes(ig))) continue;
      const id = (el.id || '').toLowerCase();
      if (ignoreClasses.some(ig => id.includes(ig))) continue;

      if (el.childElementCount === 0) {
        const t = getText(el);
        if (t && t.length >= CFG.minTextLen) nodes.push({ el, text: t, rect: el.getBoundingClientRect() });
      } else {
        const t = getText(el);
        if (t && t.length >= CFG.minTextLen) nodes.push({ el, text: t, rect: el.getBoundingClientRect() });
      }
    }
    return nodes;
  }

  // Cluster vertical (simples)
  function clusterVertical(nodes) {
    if (!nodes.length) return [];
    nodes.sort((a,b)=> a.rect.top - b.rect.top);
    const clusters = [];
    let cur = { items: [nodes[0]], top: nodes[0].rect.top, bottom: nodes[0].rect.bottom };
    for (let i=1;i<nodes.length;i++) {
      const n = nodes[i];
      if (n.rect.top - cur.bottom <= CFG.clusterGapPx) {
        cur.items.push(n);
        cur.bottom = Math.max(cur.bottom, n.rect.bottom);
      } else {
        clusters.push(cur);
        cur = { items: [n], top: n.rect.top, bottom: n.rect.bottom };
      }
    }
    if (cur.items.length) clusters.push(cur);
    clusters.forEach(c => {
      c.textLength = c.items.reduce((s,i)=> s + (i.text.length || 0), 0);
      c.avgFont = (() => {
        const avg = c.items.reduce((a,b)=> {
          const st = getComputedStyle(b.el);
          return a + (parseFloat(st.fontSize) || 14);
        },0) / c.items.length;
        return avg || 14;
      })();
      c.centerY = (c.top + c.bottom)/2;
      c.score = c.textLength * c.avgFont * (1 + (1/(1 + Math.abs((window.innerHeight/2)-c.centerY)/100)));
    });
    return clusters.sort((a,b)=> b.score - a.score);
  }

  // Heurística: find largest text block in center
  function centerHeuristic() {
    const all = collectVisibleTextNodes();
    if (!all.length) return null;
    let best = null;
    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    for (const n of all) {
      const r = n.rect;
      const midx = r.left + r.width/2;
      const midy = r.top + r.height/2;
      const dist = Math.hypot(cx - midx, cy - midy) + 1;
      const score = (n.text.length) / dist;
      if (!best || score > best.score) best = { node: n, score };
    }
    return best && best.node ? best.node : null;
  }

  // Extração de opções: busca por botões grandes + role/button + seletor conhecido
  function detectOptionsAround(containerEl) {
    const options = [];
    if (!containerEl) return options;
    // 1) Prefer role/button or known selectors inside container
    const selCandidates = Array.from(containerEl.querySelectorAll('button, [role="option"], [role="radio"], [data-test*="option"], [class*="option"], li, label'));
    for (const el of selCandidates) {
      if (!isVisible(el)) continue;
      const t = getText(el);
      if (!t || t.length < 1) continue;
      if (!options.includes(t) && isOptionValid(t)) options.push(t);
    }
    // 2) Appearance-based: find large colorful elements in same vertical band
    if (CFG.enableAppearanceDetection) {
      const all = Array.from(document.querySelectorAll('body *'));
      for (const el of all) {
        if (!isVisible(el)) continue;
        if (!looksLikeBigOption(el)) continue;
        const r = el.getBoundingClientRect();
        const contRect = containerEl.getBoundingClientRect();
        if (Math.abs((r.top + r.bottom)/2 - (contRect.top + contRect.bottom)/2) > Math.max(window.innerHeight*0.5, 300)) continue;
        const t = getText(el);
        if (t && !options.includes(t) && isOptionValid(t)) options.push(t);
      }
    }
    // Order options top->bottom
    options.sort((a,b)=>{
      const aEl = Array.from(document.querySelectorAll('body *')).find(e=> getText(e) === a);
      const bEl = Array.from(document.querySelectorAll('body *')).find(e=> getText(e) === b);
      if (!aEl || !bEl) return 0;
      return aEl.getBoundingClientRect().top - bEl.getBoundingClientRect().top;
    });
    return options.slice(0,12);
  }

  // Find question container
  function findQuestionContainer() {
    const knownQuestionSelectors = [
      '[data-test="question-text"]', '.question-text', '.qz-question', '.q-text',
      '[class*="question"] > p', '[class*="prompt"]', '[data-test="question-card"]', 
      '.qz-question-card', '.questionContainer', '.qz-question-container',
      '.question', '.quiz-question', '.question-content', '.question-body',
      '.wayground-question', '.wg-question'
    ];
    for (const s of knownQuestionSelectors) {
      const el = tryQuery(s);
      if (el && isVisible(el) && getText(el).length >= CFG.minTextLen) {
        return ascendToCard(el);
      }
    }
    // Clustering
    const nodes = collectVisibleTextNodes();
    const clusters = clusterVertical(nodes);
    if (clusters && clusters.length) {
      return ascendToCard(clusters[0].items[0].el);
    }
    // Fallback center heuristic
    const center = centerHeuristic();
    if (center) return ascendToCard(center.el || center);
    return null;
  }

  // Climb up to a "card" parent
  function ascendToCard(el) {
    if (!el) return null;
    let node = el;
    for (let i=0;i<8 && node;i++) {
      const cls = (node.className||'') + '';
      if (/(question|card|qz|prompt|container|quiz)/i.test(cls)) return node;
      node = node.parentElement;
    }
    node = el.parentElement;
    while (node && node.parentElement) {
      const r = node.getBoundingClientRect();
      if (r.width > innerWidth * 0.28) return node;
      node = node.parentElement;
    }
    return el;
  }

  // Build structured payload text
  function buildPayload(question, options) {
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
      options.forEach((o,i) => parts.push(`${String.fromCharCode(65+i)}) ${o}`));
    }
    return parts.join('\n');
  }

  /**************************************************************************
   * UI: flutuante arrastável com minimizar / salvar posição
   **************************************************************************/
  let UI = null;
  let lastPayload = '';
  let uiMinimized = (localStorage.getItem(CFG.saveMinimizedKey) === '1');

  function buildUI() {
    if (document.getElementById('santos-meczada-ui-v12')) return;
    UI = document.createElement('div');
    UI.id = 'santos-meczada-ui-v12';
    Object.assign(UI.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      width: '380px',
      zIndex: 2147483647,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      borderRadius: '12px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(6,44,61,0.95), rgba(3,85,100,0.95))',
      color: '#fff',
      userSelect: 'none',
      touchAction: 'none'
    });

    UI.innerHTML = `
      <div id="santos-header" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:move">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:28px;height:28px;border-radius:6px;background:#fff;color:#023e6f;display:flex;align-items:center;justify-content:center;font-weight:800">🎯</div>
          <div style="font-weight:700">SANTOS.meczada</div>
          <div id="santos-host" style="font-size:12px;padding:3px 8px;border-radius:8px;background:rgba(255,255,255,0.08);margin-left:8px">Quizizz</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button id="santos-min" title="Minimizar" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer">–</button>
          <button id="santos-close" title="Fechar" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer">×</button>
        </div>
      </div>
      <div id="santos-body" style="padding:10px;display:flex;flex-direction:column;gap:10px">
        <div id="santos-preview" style="background:rgba(255,255,255,0.06);border-radius:10px;padding:10px;max-height:300px;overflow:auto;font-family:monospace;font-size:13px;white-space:pre-wrap">Aguardando captura...</div>
        <div style="display:flex;gap:8px">
          <button id="santos-send" style="flex:1;background:#9c27b0;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:700;cursor:pointer">Enviar Perplexity</button>
          <button id="santos-copy" style="background:#2e7d32;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:700;cursor:pointer">Copiar</button>
          <button id="santos-manual" style="background:#1976d2;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:700;cursor:pointer">Capturar área</button>
        </div>
        <div style="font-size:12px;opacity:0.85">Atalhos: Ctrl+Shift+U (mostrar/ocultar), Ctrl+Shift+M (captura manual)</div>
      </div>
    `;
    document.body.appendChild(UI);

    // Load position if saved
    const pos = localStorage.getItem(CFG.savePositionKey);
    if (pos) {
      try {
        const p = JSON.parse(pos);
        UI.style.left = p.left; UI.style.top = p.top; UI.style.right = 'auto'; UI.style.bottom = 'auto';
      } catch {}
    }

    // Minimize state
    if (uiMinimized) {
      document.getElementById('santos-body').style.display = 'none';
      document.getElementById('santos-min').textContent = '+';
    }

    // Button handlers
    document.getElementById('santos-close').onclick = () => UI.remove();
    document.getElementById('santos-min').onclick = toggleMinimize;
    document.getElementById('santos-send').onclick = () => {
      if (!lastPayload) return toast('Nada capturado');
      let q = lastPayload;
      if (q.length > CFG.maxPerplexityChars) q = q.slice(0, CFG.maxPerplexityChars) + '…';
      window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,'_blank');
    };
    document.getElementById('santos-copy').onclick = async () => {
      try { await navigator.clipboard.writeText(lastPayload || ''); toast('Copiado'); } catch { toast('Falha ao copiar'); }
    };
    document.getElementById('santos-manual').onclick = enableManualCapture;

    makeDraggable(UI, document.getElementById('santos-header'));
  }

  function toggleMinimize() {
    const body = document.getElementById('santos-body');
    const btn = document.getElementById('santos-min');
    if (!body) return;
    if (body.style.display === 'none') {
      body.style.display = 'flex';
      btn.textContent = '–';
      uiMinimized = false;
    } else {
      body.style.display = 'none';
      btn.textContent = '+';
      uiMinimized = true;
    }
    localStorage.setItem(CFG.saveMinimizedKey, uiMinimized ? '1': '0');
  }

  function makeDraggable(container, handle) {
    let dragging = false, startX=0, startY=0, origX=0, origY=0;
    const onPointerDown = (ev) => {
      ev.preventDefault();
      dragging = true;
      const rect = container.getBoundingClientRect();
      startX = (ev.clientX || ev.touches && ev.touches[0].clientX);
      startY = (ev.clientY || ev.touches && ev.touches[0].clientY);
      origX = rect.left; origY = rect.top;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp, { once: true });
    };
    const onPointerMove = (ev) => {
      if (!dragging) return;
      const cx = ev.clientX || (ev.touches && ev.touches[0].clientX);
      const cy = ev.clientY || (ev.touches && ev.touches[0].clientY);
      if (typeof cx !== 'number' || typeof cy !== 'number') return;
      const dx = cx - startX, dy = cy - startY;
      container.style.left = (origX + dx) + 'px';
      container.style.top = (origY + dy) + 'px';
      container.style.right = 'auto'; container.style.bottom = 'auto';
    };
    const onPointerUp = (ev) => {
      dragging = false;
      localStorage.setItem(CFG.savePositionKey, JSON.stringify({ left: container.style.left || container.getBoundingClientRect().left + 'px', top: container.style.top || container.getBoundingClientRect().top + 'px' }));
      document.removeEventListener('pointermove', onPointerMove);
    };
    handle.addEventListener('pointerdown', onPointerDown, { passive: false });
  }

  function toast(msg) {
    const n = document.createElement('div');
    Object.assign(n.style, { position:'fixed', right:'26px', bottom:'120px', zIndex:2147483647, background:'rgba(0,0,0,0.85)', color:'#fff', padding:'10px 14px', borderRadius:'8px', fontSize:'13px' });
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(()=>n.remove(), 1600);
  }

  /**************************************************************************
   * Manual capture overlay
   **************************************************************************/
  let manualOverlay = null;
  function enableManualCapture() {
    if (manualOverlay) return disableManualCapture();
    toast('Clique no bloco a ser capturado (Esc para cancelar)');
    manualOverlay = document.createElement('div');
    Object.assign(manualOverlay.style, { position:'fixed', inset:0, zIndex:2147483646, cursor:'crosshair', background:'transparent' });
    document.body.appendChild(manualOverlay);
    const hover = document.createElement('div');
    Object.assign(hover.style, { position:'fixed', border:'2px solid #00e5ff', background:'rgba(0,229,255,0.06)', pointerEvents:'none', zIndex:2147483647, borderRadius:'6px' });
    document.body.appendChild(hover);

    const move = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      const el = document.elementFromPoint(x,y);
      if (!el || !isVisible(el)) { hover.style.display='none'; return; }
      const r = el.getBoundingClientRect();
      Object.assign(hover.style, { display:'block', left:r.left+'px', top:r.top+'px', width:r.width+'px', height:r.height+'px' });
    };
    const click = async (e) => {
      e.preventDefault(); e.stopPropagation();
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      const el = document.elementFromPoint(x,y);
      disableManualCapture();
      if (!el) return;
      const container = ascendToCard(el) || el;
      const q = await extractQuestionAndOptions(container);
      lastPayload = buildPayload(q.question, q.options);
      updatePreview(lastPayload, q.confidence);
      toast('Capturado manualmente');
    };
    const key = (e) => { if (e.key === 'Escape') { disableManualCapture(); toast('Cancelado'); } };
    manualOverlay.addEventListener('mousemove', move);
    manualOverlay.addEventListener('click', click, {capture:true});
    window.addEventListener('keydown', key, { once: true });
    manualOverlay._cleanup = () => {
      manualOverlay.removeEventListener('mousemove', move);
      manualOverlay.removeEventListener('click', click, {capture:true});
      window.removeEventListener('keydown', key);
      hover.remove();
      manualOverlay.remove();
    };
  }

  function disableManualCapture() {
    if (manualOverlay && manualOverlay._cleanup) manualOverlay._cleanup();
    manualOverlay = null;
  }

  /**************************************************************************
   * Main detection: find container, extract question & options
   **************************************************************************/
  async function extractQuestionAndOptions(container) {
    const result = { question: '', options: [], confidence: 0 };
    if (!container) {
      const fallback = findQuestionContainer();
      container = fallback || document.body;
    }
    // Prefer direct known selectors inside container
    const qSelectors = ['[data-test="question-text"]', '.question-text', '.q-text', 'h1', 'h2', 'p'];
    let qEl = null;
    for (const s of qSelectors) {
      try {
        const el = container.querySelector(s);
        if (el && isVisible(el) && getText(el).length >= CFG.minTextLen) { qEl = el; break; }
      } catch {}
    }
    // If not found, try center heuristic inside container
    if (!qEl) {
      const nodes = collectVisibleTextNodes(container);
      if (nodes.length) {
        nodes.sort((a,b)=> b.text.length - a.text.length);
        qEl = nodes[0].el;
      }
    }
    const question = qEl ? normalize(getText(qEl)) : '';
    let options = detectOptionsAround(container);
    // Filter out any option that is the same as the question
    options = options.filter(opt => opt !== question);
    // Confidence: basic rules
    let conf = 0;
    if (question && question.length > 12) conf += 40;
    if (options && options.length >= 2) conf += Math.min(50, options.length*10);
    try {
      const rect = (qEl && qEl.getBoundingClientRect()) || container.getBoundingClientRect();
      const centerDist = Math.abs(((rect.top + rect.bottom)/2) - (window.innerHeight/2));
      conf += Math.max(0, 10 - (centerDist/50));
    } catch {}
    result.question = question;
    result.options = options;
    result.confidence = Math.round(Math.max(0, Math.min(100, conf)));
    return result;
  }

  /**************************************************************************
   * Preview update & loop
   **************************************************************************/
  function updatePreview(text, confidence) {
    const box = document.getElementById('santos-preview');
    if (!box) return;
    const view = clamp(text||'', 1800).replace(/\n/g,'\n');
    box.innerText = view;
    const host = document.getElementById('santos-host');
    if (host) host.innerText = `Quizizz · Conf: ${confidence}%`;
  }

  async function processLoop() {
    try {
      const container = findQuestionContainer();
      if (!container) return;
      const res = await extractQuestionAndOptions(container);
      lastPayload = buildPayload(res.question, res.options);
      updatePreview(lastPayload, res.confidence);
    } catch (e) {
      console.error('SANTOS.v12 process error', e);
    }
  }

  // Debounce / observer
  let mo = null, poll = null;
  function startObservers() {
    stopObservers();
    mo = new MutationObserver(() => { debounceProcess(); });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    poll = setInterval(processLoop, CFG.pollInterval);
    window.addEventListener('resize', debounceProcess);
    window.addEventListener('scroll', debounceProcess, { passive:true });
  }
  function stopObservers() {
    if (mo) { mo.disconnect(); mo = null; }
    if (poll) { clearInterval(poll); poll = null; }
    window.removeEventListener('resize', debounceProcess);
    window.removeEventListener('scroll', debounceProcess);
  }
  let debounceTimer = null;
  function debounceProcess() { clearTimeout(debounceTimer); debounceTimer = setTimeout(()=>processLoop(), CFG.debounceMs); }

  /**************************************************************************
   * Shortcuts
   **************************************************************************/
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
      const ui = document.getElementById('santos-meczada-ui-v12');
      if (ui) ui.style.display = (ui.style.display === 'none' ? 'block' : 'none');
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') enableManualCapture();
  });

  /**************************************************************************
   * INIT
   **************************************************************************/
  function init() {
    buildUI();
    startObservers();
    processLoop();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(init, 60);
  else window.addEventListener('DOMContentLoaded', init, { once: true });

})();
// ==UserScript==
// @name         SANTOS.meczada - Captura Profissional Quizizz v11
// @namespace    http://tampermonkey.net/
// @version      11.0
// @description  Versão avançada: detecção por clusters, pontuação de confiança, destaque visual, ajustes finos e modo manual. Alta precisão para Quizizz/Wayground.
// @match        *://*/*
// @grant        none
// @icon         https://i.imgur.com/7YbX5Jx.png
// ==/UserScript==

(function () {
  'use strict';

  /* CONFIGURAÇÃO PRINCIPAL - ajuste conforme necessário */
  const CFG = {
    pollInterval: 1100,
    debounceMs: 120,
    maxPerplexityChars: 1800,
    maxPreviewChars: 1600,
    traverseShadowRoots: true,
    useCenterHeuristic: true,
    debug: false, // se true exibe logs e overlays persistentes
    clusterGapPx: 28, // gap vertical que separa clusters
    minTextLen: 4, // mínimo de chars para considerar elemento de texto
    minFontPx: 10, // fonte mínima plausível
    noiseWords: ['next','submit','skip','pause','score','timer','bonus','bônus','confirm','progresso','carregando','loading','login','sign','enter','share'],
    quizSelectors: {
      question: ['[data-test="question-text"]', '.question-text', '.qz-question', '.q-text', '.prompt'],
      option: ['[data-test="option"]', '.option', '.qz-option', '.answer', '.choice', '[role="option"]', '[role="radio"]', 'button', 'li', 'label'],
      containerHints: ['.qz-question-container', '.questionContainer', '.qz-question-card', '[data-qa*="question"]']
    }
  };

  /* UTILITÁRIOS */
  const log = (...a) => { if (CFG.debug) console.log('[SANTOS.v11]', ...a); };
  const nowStr = () => new Date().toLocaleTimeString();

  const sanitize = s => (s||'').replace(/\s+/g,' ').trim();
  const normalize = s => {
    if (!s) return '';
    let t = s.replace(/\r/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
    t = t.replace(/[ \t]+\n/g,'\n');
    // remover repetição de palavras consecutivas
    try { t = t.replace(/(\p{L}+)(\s+\1)+/giu, '$1'); } catch(e) { t = t.replace(/(\b\w+\b)(\s+\1)+/ig, '$1'); }
    return sanitize(t);
  };

  function isLikelyUI(el) {
    if (!el) return false;
    const tag = el.tagName || '';
    if (/^(HEADER|NAV|FOOTER|FORM|ASIDE|SCRIPT|STYLE)$/.test(tag)) return true;
    const cls = (el.className||'').toString().toLowerCase();
    if (cls && /nav|header|footer|cookie|modal|toast|popup|controls|timer|score|progress|pagination|tab|tabbar/.test(cls)) return true;
    const role = (el.getAttribute && el.getAttribute('role')) || '';
    if (role && /navigation|banner|complementary|status|progressbar/.test(role)) return true;
    return false;
  }

  function isVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    if (el.closest && el.closest('#santos-meczada-ui')) return false;
    if (el.hasAttribute && el.getAttribute('aria-hidden') === 'true') return false;
    const style = getComputedStyle(el);
    if (!style) return false;
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    // if out of viewport (allow slight overflow)
    if (r.bottom < -5 || r.top > (innerHeight + 5) || r.right < -5 || r.left > (innerWidth + 5)) return false;
    return true;
  }

  function getText(el) {
    if (!el) return '';
    try {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        return sanitize(el.placeholder || el.value || '');
      }
    } catch(e){}
    let t = '';
    try { t = el.innerText || el.textContent || ''; } catch(e) { t = ''; }
    t = (t || '').trim();
    // enrich with attributes
    try {
      const aria = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) || '';
      const title = el.getAttribute && (el.getAttribute('title')||'') || '';
      const alt = el.getAttribute && (el.getAttribute('alt')||'') || '';
      [aria,title,alt].forEach(a => { if (a && !t.includes(a)) t += (t? ' ':'') + a; });
    } catch(e){}
    return normalize(t);
  }

  function safeQueryAll(root, sel) {
    try { return Array.from((root||document).querySelectorAll(sel)); } catch(e) { return []; }
  }

  // traverse elements incl. shadow roots (limited)
  function walk(root=document) {
    const out = [];
    const stack = [root];
    while(stack.length) {
      const node = stack.pop();
      let children = [];
      if (node instanceof ShadowRoot || node instanceof Document || node instanceof DocumentFragment) {
        children = Array.from(node.children || []);
      } else if (node instanceof Element) {
        out.push(node);
        children = Array.from(node.children || []);
        if (CFG.traverseShadowRoots && node.shadowRoot) stack.push(node.shadowRoot);
      }
      for (let i=children.length-1;i>=0;i--) stack.push(children[i]);
    }
    return out;
  }

  // collect candidate text elements filtered by visibility and length
  function collectTextCandidates() {
    const nodes = [];
    // prefer using querySelectorAll to limit (avoid scanning thousands)
    const all = Array.from(document.querySelectorAll('body *'));
    for (const el of all) {
      if (!isVisible(el)) continue;
      if (isLikelyUI(el)) continue;
      const txt = getText(el);
      if (!txt || txt.length < CFG.minTextLen) continue;
      // compute bounding rect & font size
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize) || 14;
      const weight = parseFloat(style.fontWeight) || (style.fontWeight==='bold'?700:400);
      nodes.push({el, text: txt, rect, fontSize, weight, area: rect.width*rect.height});
    }
    return nodes;
  }

  // cluster by vertical proximity
  function clusterByVertical(nodes) {
    if (!nodes.length) return [];
    nodes.sort((a,b)=>a.rect.top - b.rect.top);
    const clusters = [];
    let cur = {items:[], top: nodes[0].rect.top, bottom: nodes[0].rect.bottom};
    for (const n of nodes) {
      if (n.rect.top - cur.bottom <= CFG.clusterGapPx) {
        cur.items.push(n);
        cur.bottom = Math.max(cur.bottom, n.rect.bottom);
        cur.top = Math.min(cur.top, n.rect.top);
      } else {
        clusters.push(cur);
        cur = {items:[n], top:n.rect.top, bottom:n.rect.bottom};
      }
    }
    if (cur.items.length) clusters.push(cur);
    // compute stats
    for (const c of clusters) {
      c.centerY = (c.top + c.bottom)/2;
      c.centerX = c.items.reduce((a,b)=>a + (b.rect.left+b.rect.width/2), 0) / (c.items.length*1.0);
      c.textLength = c.items.reduce((a,b)=>a + b.text.length, 0);
      c.avgFont = c.items.reduce((a,b)=>a + b.fontSize,0)/c.items.length;
      // score: textLength * avgFont * visibility weight (area)
      c.score = c.textLength * Math.max(10, c.avgFont) * (c.items.reduce((a,b)=>a + b.area,0) / 1000);
      // proximity to viewport center
      const dx = Math.abs((window.innerWidth/2) - c.centerX);
      const dy = Math.abs((window.innerHeight/2) - c.centerY);
      const dist = Math.hypot(dx,dy) + 1;
      c.proximity = 1 / dist;
      c.score *= (1 + c.proximity*0.8);
      // reduce score if cluster likely UI (class heavy)
      const combinedClass = c.items.map(i=> (i.el.className||'')).join(' ');
      if (/nav|header|footer|controls|timer|score|progress|pagination|breadcrumb/i.test(combinedClass)) c.score *= 0.3;
    }
    return clusters;
  }

  // pick best cluster
  function pickBestCluster(clusters) {
    if (!clusters.length) return null;
    clusters.sort((a,b)=>b.score - a.score);
    return clusters[0];
  }

  // extract question element within cluster
  function pickQuestionElement(cluster) {
    if (!cluster) return null;
    // prefer element with highest fontSize * textLength and located near top of cluster
    const items = cluster.items.slice();
    items.sort((a,b)=>{
      const va = a.fontSize * a.text.length;
      const vb = b.fontSize * b.text.length;
      // penalize items with very small width (likely labels)
      const wa = (a.rect.width < 60)?0.7:1;
      const wb = (b.rect.width < 60)?0.7:1;
      // prefer those near top
      const pa = 1 + ((cluster.bottom - a.rect.top) / (cluster.bottom - cluster.top + 1));
      const pb = 1 + ((cluster.bottom - b.rect.top) / (cluster.bottom - cluster.top + 1));
      return (vb*wb*pb) - (va*wa*pa);
    });
    // ensure chosen has substantial text
    const q = items[0];
    return q && q.text && q.text.length >= CFG.minTextLen ? q.el : null;
  }

  // extract options near question: elements in cluster that occur below question's top
  function extractOptions(cluster, questionEl) {
    const options = [];
    if (!cluster) return options;
    const qTop = questionEl ? questionEl.getBoundingClientRect().top : cluster.top;
    // candidate elements: those with selector hints or small text blocks below question
    const cand = cluster.items.filter(i => i.rect.top >= qTop - 1);
    // prefer those matching option selectors / roles
    const pref = [];
    for (const i of cand) {
      try {
        if (i.el.matches && CFG.quizSelectors.option.some(sel => {
          try { return i.el.matches(sel); } catch(e){ return false; }
        })) pref.push(i);
      } catch(e){}
    }
    const source = (pref.length? pref : cand);
    // sort by vertical position
    source.sort((a,b)=>a.rect.top - b.rect.top);
    // dedupe by normalized text
    const seen = new Set();
    for (const s of source) {
      const t = normalize(s.text);
      if (!t || t.length < 1) continue;
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      if (isNoise(t)) continue;
      seen.add(key);
      options.push(t);
      if (options.length >= 12) break;
    }
    return options;
  }

  function isNoise(txt) {
    if (!txt) return true;
    const s = txt.toLowerCase();
    for (const w of CFG.noiseWords) if (s.includes(w)) return true;
    // too short or only punctuation
    if (/^[\W_]+$/.test(s)) return true;
    if (s.length <= 1) return true;
    return false;
  }

  // find container using selectors and heuristics
  function findQuestionContainer() {
    // direct selectors first
    for (const sel of CFG.quizSelectors.question) {
      try {
        const el = document.querySelector(sel);
        if (el && isVisible(el) && getText(el).length >= CFG.minTextLen) {
          return ascendToCard(el);
        }
      } catch(e){}
    }
    // find by classes hints
    for (const sel of CFG.quizSelectors.containerHints || []) {
      try {
        const el = document.querySelector(sel);
        if (el && isVisible(el)) return el;
      } catch(e){}
    }
    // center heuristic
    if (CFG.useCenterHeuristic) {
      const clusters = clusterByVertical(collectTextCandidates());
      const best = pickBestCluster(clusters);
      if (best) return ascendToCard(best.items[0].el);
    }
    // fallback: largest cluster among all
    const clusters = clusterByVertical(collectTextCandidates());
    const best = pickBestCluster(clusters);
    if (best) return ascendToCard(best.items[0].el);
    return null;
  }

  function ascendToCard(el) {
    if (!el) return null;
    let node = el;
    for (let i=0;i<8 && node;i++) {
      const cls = (node.className||'').toString();
      if (/(question|card|qz|prompt|container)/i.test(cls)) return node;
      node = node.parentElement;
    }
    // fallback: parent of el that occupies decent width
    node = el.parentElement;
    while (node && node.parentElement) {
      const r = node.getBoundingClientRect();
      if (r.width > innerWidth * 0.28) return node;
      node = node.parentElement;
    }
    return el.parentElement || el;
  }

  // compute confidence score of detection
  function computeConfidence(cluster, questionEl, options) {
    let score = 0;
    if (!cluster) return 0;
    score += Math.min(40, Math.log10(1 + cluster.textLength) * 10); // base from text length
    if (questionEl) score += 30;
    if (options && options.length >= 2) score += Math.min(30, options.length * 6);
    // proximity to viewport center
    const centerY = (cluster.top + cluster.bottom)/2;
    const dy = Math.abs(centerY - window.innerHeight/2);
    score += Math.max(0, 10 - (dy / 50));
    // penalize if many noise words
    if (cluster.items.some(it => isNoise(it.text))) score -= 8;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // visual highlight overlays for debugging/validation
  let overlayEls = [];
  function clearOverlays() {
    overlayEls.forEach(e => e.remove());
    overlayEls = [];
  }
  function showOverlayFor(el, color='rgba(255,0,0,0.25)') {
    if (!el || !isVisible(el)) return;
    const r = el.getBoundingClientRect();
    const d = document.createElement('div');
    Object.assign(d.style, {
      position:'fixed', left: (r.left)+'px', top:(r.top)+'px',
      width: (r.width)+'px', height:(r.height)+'px',
      background: color, zIndex:2147483646, pointerEvents:'none', border:'2px solid rgba(255,255,255,0.6)', borderRadius:'6px'
    });
    document.body.appendChild(d);
    overlayEls.push(d);
    // remove after a while (unless debug true)
    if (!CFG.debug) setTimeout(()=>{ d.remove(); overlayEls = overlayEls.filter(x=>x!==d); }, 1400);
  }

  // main processing
  async function processDetection() {
    try {
      clearOverlays();
      const allCandidates = collectTextCandidates();
      if (!allCandidates.length) return;
      const clusters = clusterByVertical(allCandidates);
      const bestCluster = pickBestCluster(clusters);
      if (!bestCluster) return;
      // show cluster overlay
      showOverlayFor({ getBoundingClientRect: ()=>({left:0,top:bestCluster.top,width:innerWidth,height:bestCluster.bottom-bestCluster.top}) }, 'rgba(0,128,255,0.12)');
      // pick question element
      const qEl = pickQuestionElement(bestCluster);
      if (qEl) showOverlayFor(qEl, 'rgba(255,200,0,0.18)');
      // pick options
      const opts = extractOptions(bestCluster, qEl);
      // overlay options small outline
      opts.forEach((oText) => {
        // try to find element by exact text match in cluster
        const found = bestCluster.items.find(it => it.text.trim() === oText.trim());
        if (found) showOverlayFor(found.el, 'rgba(0,200,100,0.12)');
      });
      const confidence = computeConfidence(bestCluster, qEl, opts);
      const result = {
        question: qEl ? normalize(getText(qEl)) : normalize(bestCluster.items[0] && bestCluster.items[0].text || ''),
        options: opts,
        confidence
      };
      // if low confidence, do fallback: try other clusters
      if (confidence < 58 && clusters.length > 1) {
        // check top 3
        for (let i=1;i<Math.min(3,clusters.length);i++) {
          const alt = clusters[i];
          const altQ = pickQuestionElement(alt);
          const altOpts = extractOptions(alt, altQ);
          const altConf = computeConfidence(alt, altQ, altOpts);
          if (altConf > result.confidence) { result.question = altQ ? normalize(getText(altQ)) : normalize(alt.items[0] && alt.items[0].text || ''); result.options = altOpts; result.confidence = altConf; }
        }
      }
      // final sanitization
      result.question = normalize(result.question);
      result.options = result.options.map(normalize).filter(Boolean);
      // build payload
      const payload = buildPayloadString(result);
      lastPayload = payload;
      updatePreview(payload, result.confidence);
      log('Detection result', result);
      // if confidence low, show hint
      if (result.confidence < 60) {
        showHint('Confiança baixa — clique em "Capturar área" ou ative modo manual.');
      } else {
        clearHint();
      }
    } catch (e) {
      console.error('SANTOS.v11 error', e);
    }
  }

  function buildPayloadString({question, options}) {
    const lines = [];
    lines.push(`# ${document.title || 'Sem título'}`);
    lines.push(`**URL:** ${location.href}`);
    if (question) { lines.push(''); lines.push('## PERGUNTA:'); lines.push(question); }
    if (options && options.length) { lines.push(''); lines.push('## OPÇÕES:'); options.forEach((o,i)=>lines.push(`${String.fromCharCode(65+i)}) ${o}`)); }
    let out = lines.join('\n');
    if (out.length > CFG.maxInternalChars) out = out.slice(0, CFG.maxInternalChars) + '\n\n… [truncated]';
    return out;
  }

  // UI
  let lastPayload = '';
  function buildUI() {
    if (document.getElementById('santos-meczada-ui-v11')) return;
    const ui = document.createElement('div');
    ui.id = 'santos-meczada-ui-v11';
    Object.assign(ui.style, {
      position:'fixed', right:'18px', bottom:'18px', width:'420px', zIndex:2147483647, fontFamily:'Segoe UI,Arial',
      borderRadius:'12px', overflow:'hidden', boxShadow:'0 10px 38px rgba(0,0,0,.45)'
    });
    ui.innerHTML = `
      <div style="background:linear-gradient(90deg,#023e6f,#0ea5b3);color:#fff;padding:10px 12px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;gap:10px;align-items:center">
           <strong>SANTOS.meczada v11</strong>
           <small id="santos-host-v11" style="background:rgba(255,255,255,.08);padding:3px 8px;border-radius:8px">${isQuizizzHost() ? 'Quizizz' : 'Auto'}</small>
           <small id="santos-conf" style="margin-left:8px;color:#fff;opacity:.9">Confiança: —</small>
        </div>
        <div>
           <button id="santos-close-v11" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer">×</button>
        </div>
      </div>
      <div style="background:rgba(255,255,255,.04);padding:12px;display:flex;flex-direction:column;gap:10px">
        <div id="santos-preview-v11" style="background:rgba(0,0,0,.18);border-radius:8px;padding:10px;max-height:320px;overflow:auto;font-family:monospace;font-size:13px;white-space:pre-wrap">Aguardando captura...</div>
        <div style="display:flex;gap:8px">
           <button id="santos-send-v11" style="flex:1;background:#9b59b6;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:700;cursor:pointer">Enviar Perplexity</button>
           <button id="santos-copy-v11" style="background:#2ecc71;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:700;cursor:pointer">Copiar</button>
           <button id="santos-manual-v11" style="background:#3498db;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:700;cursor:pointer">Capturar área</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
          <div style="display:flex;gap:8px;align-items:center">
            <label style="font-size:12px;opacity:.9">Gap:</label>
            <input id="santos-gap" type="range" min="8" max="80" value="${CFG.clusterGapPx}" step="2" />
            <small id="santos-gap-val" style="font-size:12px;opacity:.85">${CFG.clusterGapPx}px</small>
          </div>
          <div>
            <label style="font-size:12px;opacity:.9">Debug</label>
            <input id="santos-debug" type="checkbox" ${CFG.debug ? 'checked' : ''} />
          </div>
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,.85)">Atalhos: Ctrl+Shift+U (mostrar/ocultar), Ctrl+Shift+M (captura manual)</div>
      </div>
    `;
    document.body.appendChild(ui);
    document.getElementById('santos-close-v11').onclick = () => ui.remove();
    document.getElementById('santos-send-v11').onclick = () => {
      if (!lastPayload) return toast('Nada capturado');
      let q = lastPayload;
      if (q.length > CFG.maxPerplexityChars) q = q.slice(0, CFG.maxPerplexityChars) + '…';
      const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`;
      window.open(url, '_blank');
    };
    document.getElementById('santos-copy-v11').onclick = async () => {
      try { await navigator.clipboard.writeText(lastPayload||''); toast('Copiado!'); } catch(e){ toast('Falha ao copiar'); }
    };
    document.getElementById('santos-manual-v11').onclick = enableManualCapture;
    const gap = document.getElementById('santos-gap');
    const gapVal = document.getElementById('santos-gap-val');
    gap.oninput = (e) => { CFG.clusterGapPx = Number(e.target.value); gapVal.textContent = `${CFG.clusterGapPx}px`; debouncedProcess(); };
    const debugBox = document.getElementById('santos-debug');
    debugBox.onchange = (e) => { CFG.debug = e.target.checked; toast('Debug ' + (CFG.debug ? 'ON' : 'OFF')); };

    document.getElementById('santos-conf').textContent = 'Confiança: —';
  }

  function updatePreview(text, confidence) {
    const box = document.getElementById('santos-preview-v11');
    if (!box) return;
    let view = text || '';
    if (view.length > CFG.maxPreviewChars) view = view.slice(0, CFG.maxPreviewChars) + '\n…';
    box.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:6px"><b>Conteúdo</b><small style="opacity:.8">${nowStr()}</small></div><div>${escapeHtml(view)}</div>`;
    const confEl = document.getElementById('santos-conf');
    if (confEl) confEl.textContent = `Confiança: ${confidence||'—'}%`;
  }

  function escapeHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function toast(msg) {
    const d = document.createElement('div');
    Object.assign(d.style, {position:'fixed', right:'26px', bottom:'126px', zIndex:2147483647, background:'rgba(0,0,0,.88)', color:'#fff', padding:'10px 14px', borderRadius:'8px', fontSize:'13px'});
    d.textContent = msg; document.body.appendChild(d); setTimeout(()=>d.remove(), 1600);
  }

  function showHint(msg) {
    const confEl = document.getElementById('santos-conf');
    if (confEl) confEl.title = msg;
  }
  function clearHint() { const confEl = document.getElementById('santos-conf'); if (confEl) confEl.title = ''; }

  // manual capture (click)
  let manualOverlay = null, manualHover = null;
  function enableManualCapture() {
    if (manualOverlay) return disableManualCapture();
    toast('Clique no bloco a ser capturado (Esc para cancelar)');
    manualOverlay = document.createElement('div');
    Object.assign(manualOverlay.style, {position:'fixed',inset:0,zIndex:2147483646,cursor:'crosshair',background:'transparent'});
    document.body.appendChild(manualOverlay);
    manualHover = document.createElement('div');
    Object.assign(manualHover.style, {position:'fixed',border:'2px solid #00e5ff',background:'rgba(0,229,255,0.06)',pointerEvents:'none',zIndex:2147483647,borderRadius:'6px'});
    document.body.appendChild(manualHover);

    const move = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || !isVisible(el)) { manualHover.style.display = 'none'; return; }
      const r = el.getBoundingClientRect();
      Object.assign(manualHover.style, {display:'block',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
    };
    const click = async (e) => {
      e.preventDefault(); e.stopPropagation();
      const el = document.elementFromPoint(e.clientX, e.clientY);
      disableManualCapture();
      if (!el) return;
      const card = ascendToCard(el) || el;
      const data = await extractFromContainer(card);
      lastPayload = buildPayloadString(data);
      updatePreview(lastPayload, data.confidence);
      toast('Capturado manualmente');
    };
    const key = (e) => { if (e.key === 'Escape') { disableManualCapture(); toast('Cancelado'); } };
    manualOverlay.addEventListener('mousemove', move);
    manualOverlay.addEventListener('click', click, {capture:true});
    window.addEventListener('keydown', key, {once:true});
    manualOverlay._cleanup = () => {
      manualOverlay.removeEventListener('mousemove', move);
      manualOverlay.removeEventListener('click', click, {capture:true});
      window.removeEventListener('keydown', key, {once:true});
      manualHover.remove(); manualOverlay.remove();
    };
  }
  function disableManualCapture() { if (manualOverlay && manualOverlay._cleanup) manualOverlay._cleanup(); manualOverlay = null; manualHover = null; }

  // helper to ascend to card
  function ascendToCard(el) {
    if (!el) return null;
    let node = el;
    for (let i=0;i<8 && node;i++) {
      const cls = (node.className||'').toString();
      if (/(question|card|qz|prompt|container)/i.test(cls)) return node;
      node = node.parentElement;
    }
    node = el.parentElement;
    while(node && node.parentElement) {
      const r = node.getBoundingClientRect();
      if (r.width > innerWidth * 0.28) return node;
      node = node.parentElement;
    }
    return el;
  }

  // extractFromContainer: orchestrates extraction and OCR if enabled
  async function extractFromContainer(container) {
    try {
      const all = collectTextCandidates().filter(c=> container.contains(c.el));
      let cluster = clusterByVertical(all)[0] || {items:all, top: container.getBoundingClientRect().top, bottom:container.getBoundingClientRect().bottom, textLength: all.reduce((a,b)=>a+b.text.length,0)};
      const qEl = pickQuestionElement(cluster);
      const options = extractOptions(cluster, qEl);
      const confidence = computeConfidence(cluster, qEl, options);
      return { question: qEl? getText(qEl): (cluster.items[0] && cluster.items[0].text || ''), options, context: [], confidence };
    } catch(e) { log('extractFromContainer error', e); return {question:'',options:[],context:[],confidence:0}; }
  }

  // main processing loop
  async function processNow() {
    try {
      clearOverlays();
      const all = collectTextCandidates();
      if (!all.length) return;
      const clusters = clusterByVertical(all);
      const best = pickBestCluster(clusters);
      if (!best) return;
      // show cluster overlay
      const clusterRect = { left:0, top: best.top, width: innerWidth, height: (best.bottom - best.top) };
      const fakeEl = { getBoundingClientRect: ()=>clusterRect };
      showOverlayFor(fakeEl, 'rgba(0,128,255,0.08)');
      const qEl = pickQuestionElement(best);
      if (qEl) showOverlayFor(qEl, 'rgba(255,200,0,0.12)');
      const options = extractOptions(best, qEl);
      options.forEach(optText => {
        const found = best.items.find(it => it.text.trim() === optText.trim());
        if (found) showOverlayFor(found.el, 'rgba(0,200,100,0.12)');
      });
      const conf = computeConfidence(best, qEl, options);
      const questionText = qEl ? getText(qEl) : (best.items[0] && best.items[0].text || '');
      const payloadObj = { question: normalize(questionText), options: options, context: [], confidence: conf };
      lastPayload = buildPayloadString(payloadObj);
      updatePreview(lastPayload, conf);
      if (conf < 60) showHint('Baixa confiança — use captura manual.');
      else clearHint();
    } catch (e) { console.error('processNow', e); }
  }

  const debouncedProcess = debounce(processNow, CFG.debounceMs);

  function debounce(fn, ms) {
    let t = null;
    return function(...args) { clearTimeout(t); t = setTimeout(()=>fn(...args), ms); };
  }

  // observers
  let mo = null, poll = null;
  function start() {
    stop();
    buildUI();
    debouncedProcess();
    mo = new MutationObserver(debouncedProcess);
    try { mo.observe(document.documentElement||document.body, {childList:true, subtree:true, characterData:true, attributes:true}); } catch(e){ log('observe err', e); }
    poll = setInterval(processNow, CFG.pollInterval);
    window.addEventListener('resize', debouncedProcess);
    window.addEventListener('scroll', debouncedProcess, {passive:true});
    log('SANTOS.v11 started');
  }
  function stop() {
    if (mo) { mo.disconnect(); mo = null; }
    if (poll) { clearInterval(poll); poll = null; }
    window.removeEventListener('resize', debouncedProcess);
    window.removeEventListener('scroll', debouncedProcess);
  }

  // helper: build payload string
  function buildPayloadString(obj) {
    const lines = [];
    lines.push(`# ${document.title||'Sem título'}`);
    lines.push(`**URL:** ${location.href}`);
    if (obj.question) { lines.push(''); lines.push('## PERGUNTA:'); lines.push(obj.question); }
    if (obj.options && obj.options.length) { lines.push(''); lines.push('## OPÇÕES:'); obj.options.forEach((o,i)=>lines.push(`${String.fromCharCode(65+i)}) ${o}`)); }
    if (obj.context && obj.context.length) { lines.push(''); lines.push('## CONTEXTO:'); obj.context.forEach(c=>lines.push(`- ${c}`)); }
    return lines.join('\n');
  }

  // overlay helper for elements or fake rect-like objects
  function showOverlayFor(elOrRect, color='rgba(255,0,0,0.12)') {
    let rect;
    if (elOrRect.getBoundingClientRect) rect = elOrRect.getBoundingClientRect();
    else rect = elOrRect;
    if (!rect) return;
    const div = document.createElement('div');
    Object.assign(div.style, {position:'fixed', left:rect.left+'px', top:rect.top+'px', width:rect.width+'px', height:rect.height+'px', background:color, border:'1px solid rgba(255,255,255,0.5)', zIndex:2147483646, pointerEvents:'none', borderRadius:'6px'});
    document.body.appendChild(div);
    setTimeout(()=>{ div.remove(); }, CFG.debug ? 8000 : 1400);
  }

  // show initial debug info
  function isQuizizzHost() { return /quizizz|wayground/i.test(location.hostname) || !!document.querySelector('[class*="quizizz"], [class*="qz-"], [data-test*="quizizz"]'); }

  // keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
      const ui = document.getElementById('santos-meczada-ui-v11');
      if (ui) ui.style.display = ui.style.display === 'none' ? 'block' : 'none';
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
      enableManualCapture();
    }
  });

  // init
  setTimeout(() => { start(); }, 120);

})();
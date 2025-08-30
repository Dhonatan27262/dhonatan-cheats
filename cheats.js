// ==UserScript==
// @name         SANTOS.meczada - Captura Profissional Quizizz v14 (TOP)
// @namespace    http://tampermonkey.net/
// @version      14.0
// @description  Versão TOP: OCR ativado, treinamento, detecção reforçada, menu flutuante arrastável/minimizável, auto-seleção com limiar de confiança e diagnóstico. (Tampermonkey) 
// @match        *://*/*
// @grant        none
// @icon         https://i.imgur.com/7YbX5Jx.png
// ==/UserScript==

(function () {
  'use strict';

  /* ================= CONFIG ================= */
  const CFG = {
    pollInterval: 900,
    debounceMs: 120,
    minTextLen: 4,
    clusterGapPx: 28,
    savePrefix: 'santos_meczada_v14_',
    appearanceDetection: true,
    maxPerplexityChars: 1800,
    enableOCR: true, // TOP: OCR ativado por padrão
    tesseractCDN: 'https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js',
    autoSelectEnabled: true, // auto clicar alternativa quando confiança alta
    autoSelectThreshold: 82 // % de confiança para auto clicar
  };

  /* ================ UTIL ================ */
  const NOW = () => new Date().toLocaleTimeString();
  const clamp = (s,n) => s && s.length>n ? s.slice(0,n)+'…' : s||'';
  const norm = s => (s||'').replace(/\s+/g,' ').trim();
  const isEl = e => e && e.nodeType === 1;
  const trySel = s => { try { return document.querySelector(s); } catch { return null; } };

  function isVisible(el){
    if(!isEl(el)) return false;
    if (el.closest && el.closest('#santos-meczada-ui-v14')) return false;
    if (el.hasAttribute && el.getAttribute('aria-hidden')==='true') return false;
    const st = getComputedStyle(el); if(!st) return false;
    if (st.display==='none' || st.visibility==='hidden' || parseFloat(st.opacity)===0) return false;
    if (el.offsetWidth<=0 || el.offsetHeight<=0) return false;
    const r = el.getBoundingClientRect();
    if (r.bottom < -5 || r.top > (innerHeight+5) || r.right < -5 || r.left > (innerWidth+5)) return false;
    return true;
  }

  function getText(el){
    if(!el) return '';
    try{ if(el.tagName==='INPUT' || el.tagName==='TEXTAREA') return (el.placeholder||el.value||'').trim(); }catch(e){}
    try{ let t = el.innerText || el.textContent || ''; t = (t||'').trim();
      try{ const attrs = [(el.getAttribute && el.getAttribute('aria-label'))||'', (el.getAttribute && el.getAttribute('title'))||'', (el.getAttribute && el.getAttribute('alt'))||'']; attrs.forEach(a=>{ if(a && !t.includes(a)) t += (t?' ':'')+a; }); }catch{}
      return norm(t);
    }catch(e){ return ''; }
  }

  /* ================ Selector generator & training ================ */
  function generateSelector(el){
    if(!isEl(el)) return null;
    if(el.id) return '#'+CSS.escape(el.id);
    const parts = [];
    let node = el;
    while(node && node.nodeType===1 && node !== document.body && parts.length < 6){
      let part = node.tagName.toLowerCase();
      if(node.className && typeof node.className === 'string'){
        const cls = node.className.split(/\s+/).filter(Boolean)[0];
        if(cls) part += '.'+CSS.escape(cls);
      }
      const parent = node.parentElement;
      if(parent){
        const siblings = Array.from(parent.children).filter(ch=> ch.tagName === node.tagName);
        if(siblings.length>1){
          const idx = siblings.indexOf(node) + 1;
          part += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(part);
      node = node.parentElement;
    }
    return parts.length ? parts.join(' > ') : null;
  }

  function saveTraining(kind, selector){
    try{ localStorage.setItem(CFG.savePrefix + kind, selector || ''); }catch(e){}
  }
  function loadTraining(kind){
    try{ return localStorage.getItem(CFG.savePrefix + kind) || null; }catch(e){ return null; }
  }

  /* ================ Candidates & Clustering ================ */
  function collectCandidates(scope = document){
    const out = [];
    const all = Array.from(scope.querySelectorAll('body *'));
    for(const el of all){
      if(!isVisible(el)) continue;
      const text = getText(el);
      if(!text || text.length < CFG.minTextLen) continue;
      const r = el.getBoundingClientRect();
      out.push({el, text, rect: r, area: r.width * r.height, font: (parseFloat(getComputedStyle(el).fontSize) || 14)});
    }
    return out;
  }

  function clusterVertical(nodes){
    if(!nodes.length) return [];
    nodes.sort((a,b)=> a.rect.top - b.rect.top);
    const clusters = [];
    let cur = {items:[nodes[0]], top: nodes[0].rect.top, bottom: nodes[0].rect.bottom};
    for(let i=1;i<nodes.length;i++){
      const n = nodes[i];
      if(n.rect.top - cur.bottom <= CFG.clusterGapPx){
        cur.items.push(n); cur.bottom = Math.max(cur.bottom, n.rect.bottom);
      } else { clusters.push(cur); cur = {items:[n], top:n.rect.top, bottom:n.rect.bottom}; }
    }
    if(cur.items.length) clusters.push(cur);
    clusters.forEach(c=>{
      c.textLen = c.items.reduce((s,i)=> s + (i.text.length||0), 0);
      c.avgFont = c.items.reduce((s,i)=> s + i.font, 0) / c.items.length;
      c.centerY = (c.top + c.bottom)/2;
      c.score = c.textLen * (c.avgFont || 12) * (1 + (1/(1 + Math.abs(window.innerHeight/2 - c.centerY)/110)));
    });
    return clusters.sort((a,b)=> b.score - a.score);
  }

  /* ================ Option detection ================ */
  function looksLikeOption(el){
    if(!isEl(el) || !isVisible(el)) return false;
    const r = el.getBoundingClientRect();
    if(r.width < 100 || r.height < 30) return false;
    const role = el.getAttribute && el.getAttribute('role');
    if(role && /button|option|radio/i.test(role)) return true;
    if(el.tagName === 'BUTTON') return true;
    const st = getComputedStyle(el);
    const bg = st.backgroundColor || '';
    const br = parseFloat(st.borderRadius) || 0;
    if(bg && /rgba?\(/.test(bg) && !bg.includes('0, 0, 0, 0')){
      if(br>6 || st.backgroundImage !== 'none' || st.boxShadow !== 'none' ) return true;
      if(/rgb\((1?\d?\d|2[0-4]\d|25[0-5]),\s*(1?\d?\d|2[0-4]\d|25[0-5]),\s*(1?\d?\d|2[0-4]\d|25[0-5])\)/.test(bg)) return true;
    }
    return false;
  }

  function detectOptions(container){
    const opts = [];
    if(!container) return opts;
    const selCandidates = Array.from(container.querySelectorAll('button, [role="option"], [role="radio"], [data-test*="option"], [class*="option"], li, label'));
    for(const el of selCandidates){
      if(!isVisible(el)) continue;
      const t = getText(el); if(!t) continue;
      if(!opts.includes(t)) opts.push(t);
    }
    if(CFG.appearanceDetection){
      const contRect = container.getBoundingClientRect();
      const all = Array.from(document.querySelectorAll('body *'));
      for(const el of all){
        if(!isVisible(el) || opts.length >= 12) break;
        if(!looksLikeOption(el)) continue;
        const r = el.getBoundingClientRect();
        if(Math.abs((r.top + r.bottom)/2 - (contRect.top + contRect.bottom)/2) > Math.max(innerHeight*0.6, 350)) continue;
        const t = getText(el);
        if(t && !opts.includes(t)) opts.push(t);
      }
    }
    opts.sort((a,b)=>{
      const aEl = Array.from(document.querySelectorAll('body *')).find(e=> getText(e) === a);
      const bEl = Array.from(document.querySelectorAll('body *')).find(e=> getText(e) === b);
      if(!aEl || !bEl) return 0;
      return aEl.getBoundingClientRect().top - bEl.getBoundingClientRect().top;
    });
    return opts.slice(0,12);
  }

  /* ================ OCR ================ */
  function loadTesseract(){
    return new Promise((resolve, reject) => {
      if(!CFG.enableOCR) return resolve(null);
      if(window.Tesseract) return resolve(window.Tesseract);
      const s = document.createElement('script'); s.src = CFG.tesseractCDN;
      s.onload = () => setTimeout(()=> resolve(window.Tesseract), 200);
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  async function ocrImageElement(imgEl){
    if(!imgEl) return '';
    try{
      const canvas = document.createElement('canvas');
      const w = Math.min(imgEl.naturalWidth || imgEl.width || 1200, 1600);
      const h = Math.min(imgEl.naturalHeight || imgEl.height || 800, 1200);
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/png');
      if(!window.Tesseract) await loadTesseract();
      if(!window.Tesseract) return '';
      const res = await Tesseract.recognize(dataUrl, 'por', { logger: m => console.log('OCR', m) });
      return res && res.data && res.data.text ? norm(res.data.text) : '';
    }catch(e){ console.warn('OCR error', e); return ''; }
  }

  /* ================ Extraction using training + heuristics ================ */
  async function extract(containerHint){
    const trainedQSel = loadTraining('questionSelector');
    const trainedOptSel = loadTraining('optionsSelector');
    let qEl = null; let options = [];
    if(trainedQSel){
      try{ const el = trySel(trainedQSel); if(el && isVisible(el)) qEl = el; }catch{}
    }
    if(!qEl && containerHint){
      const inside = Array.from(containerHint.querySelectorAll('p,div,span'));
      for(const el of inside){ if(isVisible(el) && getText(el).length > 10){ qEl = el; break; } }
    }
    if(!qEl){
      const nodes = collectCandidates();
      const clusters = clusterVertical(nodes);
      if(clusters && clusters.length){
        const best = clusters[0];
        best.items.sort((a,b)=> (b.font * b.text.length) - (a.font * a.text.length));
        qEl = best.items[0] && best.items[0].el;
      } else {
        qEl = centerHeuristicElement();
      }
    }
    // OCR fallback: if qEl empty or very short, try images in container
    let questionText = qEl ? getText(qEl) : '';
    if((!questionText || questionText.length < 8) && CFG.enableOCR){
      const container = qEl ? ascendToCard(qEl) : containerHint || findQuestionContainerDefault();
      const imgs = Array.from(container.querySelectorAll('img')).filter(isVisible);
      if(imgs.length){
        for(const im of imgs){
          const txt = await ocrImageElement(im);
          if(txt && txt.length > questionText.length) questionText = (questionText + ' ' + txt).trim();
        }
      }
    }
    if(!questionText && qEl) questionText = getText(qEl);
    // options
    if(trainedOptSel){
      try{ const els = document.querySelectorAll(trainedOptSel); for(const e of els){ if(isVisible(e)){ const t = getText(e); if(t && !options.includes(t)) options.push(t); } } }catch{}
    }
    if(!options.length){
      const container = qEl ? ascendToCard(qEl) : containerHint || findQuestionContainerDefault();
      options = detectOptions(container);
    }
    const confidence = computeConfidence(questionText, options, qEl);
    return {question: questionText, options, confidence, qEl};
  }

  function computeConfidence(questionText, options, qEl){
    let score = 0;
    if(questionText && questionText.length > 10) score += 40;
    if(options && options.length >= 2) score += Math.min(40, options.length * 8);
    if(qEl){
      const r = qEl.getBoundingClientRect();
      const mid = Math.abs(((r.top + r.bottom)/2) - (window.innerHeight/2));
      score += Math.max(0, 20 - (mid/40));
    }
    // penalize if too long options or weird
    if(options && options.length > 6) score = Math.max(0, score - 8);
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /* ================ helpers ================ */
  function centerHeuristicElement(){
    const cx = innerWidth/2, cy = innerHeight/2;
    const nodes = collectCandidates();
    let best = null;
    for(const n of nodes){
      const midx = n.rect.left + n.rect.width/2, midy = n.rect.top + n.rect.height/2;
      const dist = Math.hypot(cx - midx, cy - midy) + 1;
      const score = n.text.length / dist;
      if(!best || score > best.score) best = {score, node: n};
    }
    return best && best.node ? best.node.el : null;
  }

  function ascendToCard(el){
    if(!el) return null;
    let node = el;
    for(let i=0;i<8 && node;i++){
      const cls = (node.className||'') + '';
      if(/(question|card|qz|prompt|container|quiz)/i.test(cls)) return node;
      node = node.parentElement;
    }
    node = el.parentElement;
    while(node && node.parentElement){
      const r = node.getBoundingClientRect();
      if(r.width > innerWidth * 0.28) return node;
      node = node.parentElement;
    }
    return el;
  }

  function findQuestionContainerDefault(){
    const known = ['[data-test="question-card"]', '.qz-question-card', '.qz-question-container', '.questionContainer', '[data-test="question-text"]'];
    for(const s of known){
      try{ const el = document.querySelector(s); if(el && isVisible(el)) return el; }catch{}
    }
    return document.body;
  }

  /* ================ UI ================ */
  let lastPayload = '';
  function buildUI(){
    if(document.getElementById('santos-meczada-ui-v14')) return;
    const ui = document.createElement('div');
    ui.id = 'santos-meczada-ui-v14';
    Object.assign(ui.style, {
      position:'fixed', right:'16px', bottom:'16px', width:'460px', zIndex:2147483647, fontFamily:'Segoe UI, Arial, sans-serif',
      borderRadius:'12px', overflow:'hidden', boxShadow:'0 12px 40px rgba(0,0,0,.45)', userSelect:'none'
    });
    ui.innerHTML = `
      <div id="santos-hdr" style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:linear-gradient(90deg,#023e6f,#0ea5b3);color:#fff;cursor:move">
        <div style="display:flex;gap:10px;align-items:center">
          <div style="width:36px;height:36;border-radius:8px;background:#fff;color:#023e6f;display:flex;align-items:center;justify-content:center;font-weight:800">🎯</div>
          <strong>SANTOS.meczada</strong>
          <small id="santos-conf" style="margin-left:8px;opacity:.95">· Conf: —</small>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button id="santos-train-q" title="Treinar pergunta" style="background:transparent;border:1px solid rgba(255,255,255,.14);color:#fff;padding:6px;border-radius:6px;cursor:pointer">Treinar Q</button>
          <button id="santos-train-o" title="Treinar opções" style="background:transparent;border:1px solid rgba(255,255,255,.14);color:#fff;padding:6px;border-radius:6px;cursor:pointer">Treinar O</button>
          <button id="santos-auto-toggle" title="Auto selecionar" style="background:transparent;border:1px solid rgba(255,255,255,.14);color:#fff;padding:6px;border-radius:6px;cursor:pointer">Auto: ${CFG.autoSelectEnabled ? 'ON' : 'OFF'}</button>
          <button id="santos-min" title="Minimizar" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer">–</button>
          <button id="santos-close" title="Fechar" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer">×</button>
        </div>
      </div>
      <div id="santos-body" style="background:rgba(0,0,0,.04);padding:12px;display:flex;flex-direction:column;gap:10px;">
        <div id="santos-preview" style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;max-height:340px;overflow:auto;font-family:monospace;font-size:13px;white-space:pre-wrap">Aguardando captura...</div>
        <div style="display:flex;gap:8px">
          <button id="santos-send" style="flex:1;background:#9b59b6;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:700;cursor:pointer">Enviar Perplexity</button>
          <button id="santos-copy" style="background:#2ecc71;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:700;cursor:pointer">Copiar</button>
          <button id="santos-manual" style="background:#3498db;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:700;cursor:pointer">Capturar área</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;font-size:12px;opacity:.9">
          <div>OCR: ${CFG.enableOCR ? 'ON' : 'OFF'}</div>
          <div>Limiar auto-select: ${CFG.autoSelectThreshold}%</div>
        </div>
      </div>
    `;
    document.body.appendChild(ui);

    // restore position/minimized
    try{
      const pos = localStorage.getItem(CFG.savePrefix + 'pos');
      if(pos){ const p = JSON.parse(pos); ui.style.left = p.left; ui.style.top = p.top; ui.style.right = 'auto'; ui.style.bottom = 'auto'; }
      const min = localStorage.getItem(CFG.savePrefix + 'min'); if(min === '1'){ document.getElementById('santos-body').style.display = 'none'; document.getElementById('santos-min').textContent = '+'; }
    }catch(e){}

    document.getElementById('santos-close').onclick = ()=> ui.remove();
    document.getElementById('santos-min').onclick = toggleMin;
    document.getElementById('santos-manual').onclick = enableManualCapture;
    document.getElementById('santos-send').onclick = ()=> { if(!lastPayload) return toast('Nada capturado'); let q = lastPayload; if(q.length > CFG.maxPerplexityChars) q = q.slice(0, CFG.maxPerplexityChars) + '…'; window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,'_blank'); };
    document.getElementById('santos-copy').onclick = async ()=> { try{ await navigator.clipboard.writeText(lastPayload||''); toast('Copiado'); }catch{ toast('Falha ao copiar'); } };
    document.getElementById('santos-train-q').onclick = ()=> enableTraining('questionSelector');
    document.getElementById('santos-train-o').onclick = ()=> enableTraining('optionsSelector');
    document.getElementById('santos-auto-toggle').onclick = ()=> { CFG.autoSelectEnabled = !CFG.autoSelectEnabled; document.getElementById('santos-auto-toggle').textContent = 'Auto: ' + (CFG.autoSelectEnabled ? 'ON' : 'OFF'); toast('Auto-select ' + (CFG.autoSelectEnabled ? 'ON' : 'OFF')); };

    makeDraggable(ui, document.getElementById('santos-hdr'));
  }

  function toggleMin(){
    const body = document.getElementById('santos-body'); const btn = document.getElementById('santos-min');
    if(body.style.display === 'none'){ body.style.display = 'flex'; btn.textContent = '–'; localStorage.setItem(CFG.savePrefix + 'min','0'); } else { body.style.display = 'none'; btn.textContent = '+'; localStorage.setItem(CFG.savePrefix + 'min','1'); }
  }

  function makeDraggable(container, handle){
    let dragging=false, startX=0, startY=0, origX=0, origY=0;
    const onDown = (ev)=>{
      ev.preventDefault();
      dragging = true;
      startX = ev.clientX || (ev.touches && ev.touches[0].clientX);
      startY = ev.clientY || (ev.touches && ev.touches[0].clientY);
      const rect = container.getBoundingClientRect(); origX = rect.left; origY = rect.top;
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp, { once:true });
    };
    const onMove = (ev)=>{
      if(!dragging) return;
      const cx = ev.clientX || (ev.touches && ev.touches[0].clientX); const cy = ev.clientY || (ev.touches && ev.touches[0].clientY);
      const dx = cx - startX, dy = cy - startY;
      container.style.left = (origX + dx) + 'px'; container.style.top = (origY + dy) + 'px'; container.style.right='auto'; container.style.bottom='auto';
    };
    const onUp = ()=>{ dragging = false; localStorage.setItem(CFG.savePrefix + 'pos', JSON.stringify({ left: container.style.left || container.getBoundingClientRect().left + 'px', top: container.style.top || container.getBoundingClientRect().top + 'px' })); document.removeEventListener('pointermove', onMove); };
    handle.addEventListener('pointerdown', onDown, { passive:false });
  }

  function toast(msg){ const n = document.createElement('div'); Object.assign(n.style, {position:'fixed', right:'26px', bottom:'120px', zIndex:2147483647, background:'rgba(0,0,0,0.85)', color:'#fff', padding:'10px 14px', borderRadius:'8px', fontSize:'13px'}); n.textContent = msg; document.body.appendChild(n); setTimeout(()=>n.remove(),1600); }

  /* ================ Training mode ================ */
  let trainingMode = null;
  function enableTraining(kind){
    trainingMode = kind;
    toast(`Modo treinamento: clique no elemento que representa a ${kind} (Esc cancela)`);
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {position:'fixed', inset:0, zIndex:2147483646, cursor:'crosshair', background:'transparent'});
    document.body.appendChild(overlay);
    const hover = document.createElement('div');
    Object.assign(hover.style, {position:'fixed', border:'2px solid #00e5ff', background:'rgba(0,229,255,0.06)', pointerEvents:'none', zIndex:2147483647, borderRadius:'6px'});
    document.body.appendChild(hover);

    function move(e){ const x = e.clientX || (e.touches && e.touches[0].clientX); const y = e.clientY || (e.touches && e.touches[0].clientY); const el = document.elementFromPoint(x,y); if(!el || !isVisible(el)){ hover.style.display='none'; return; } const r = el.getBoundingClientRect(); Object.assign(hover.style, {display:'block', left:r.left+'px', top:r.top+'px', width:r.width+'px', height:r.height+'px'}); }
    function click(e){ e.preventDefault(); e.stopPropagation(); const x = e.clientX || (e.touches && e.touches[0].clientX); const y = e.clientY || (e.touches && e.touches[0].clientY); const el = document.elementFromPoint(x,y); cleanup(); if(!el) { toast('Elemento não detectado'); return; } const selector = generateSelector(el); if(!selector){ toast('Não foi possível gerar selector'); return; } saveTraining(kind, selector); toast(`${kind} treinado — selector salvo`); }
    function key(e){ if(e.key === 'Escape'){ cleanup(); toast('Treinamento cancelado'); } }
    function cleanup(){ overlay.removeEventListener('mousemove', move); overlay.removeEventListener('click', click, {capture:true}); window.removeEventListener('keydown', key); hover.remove(); overlay.remove(); trainingMode = null; }
    overlay.addEventListener('mousemove', move); overlay.addEventListener('click', click, {capture:true}); window.addEventListener('keydown', key, {once:true});
  }

  /* ================ Manual capture ================ */
  let manualOverlay = null;
  function enableManualCapture(){ if(manualOverlay) return disableManualCapture(); toast('Clique no bloco a ser capturado (Esc cancela)'); manualOverlay = document.createElement('div'); Object.assign(manualOverlay.style, {position:'fixed', inset:0, zIndex:2147483646, cursor:'crosshair', background:'transparent'}); document.body.appendChild(manualOverlay); const hover = document.createElement('div'); Object.assign(hover.style, {position:'fixed', border:'2px solid #00e5ff', background:'rgba(0,229,255,0.06)', pointerEvents:'none', zIndex:2147483647, borderRadius:'6px'}); document.body.appendChild(hover); const move = (e)=>{ const x = e.clientX || (e.touches && e.touches[0].clientX); const y = e.clientY || (e.touches && e.touches[0].clientY); const el = document.elementFromPoint(x,y); if(!el || !isVisible(el)){ hover.style.display='none'; return; } const r = el.getBoundingClientRect(); Object.assign(hover.style, {display:'block', left:r.left+'px', top:r.top+'px', width:r.width+'px', height:r.height+'px'}); }; const click = async (e)=>{ e.preventDefault(); e.stopPropagation(); const x = e.clientX || (e.touches && e.touches[0].clientX); const y = e.clientY || (e.touches && e.touches[0].clientY); const el = document.elementFromPoint(x,y); disableManualCapture(); if(!el) return; const container = ascendToCard(el) || el; const res = await extract(container); lastPayload = buildPayload(res.question, res.options); updatePreview(lastPayload, res.confidence); toast('Capturado manualmente'); }; const key = (e)=>{ if(e.key === 'Escape'){ disableManualCapture(); toast('Cancelado'); } }; manualOverlay.addEventListener('mousemove', move); manualOverlay.addEventListener('click', click, {capture:true}); window.addEventListener('keydown', key, {once:true}); manualOverlay._cleanup = ()=>{ manualOverlay.removeEventListener('mousemove', move); manualOverlay.removeEventListener('click', click, {capture:true}); window.removeEventListener('keydown', key); hover.remove(); manualOverlay.remove(); }; }
  function disableManualCapture(){ if(manualOverlay && manualOverlay._cleanup) manualOverlay._cleanup(); manualOverlay = null; }

  /* ================ Core: find container, extract, maybe auto-click ================ */
  async function extract(containerHint){
    const trainedQSel = loadTraining('questionSelector'); const trainedOptSel = loadTraining('optionsSelector');
    let qEl = null; let options = [];
    if(trainedQSel){ try{ const el = trySel(trainedQSel); if(el && isVisible(el)) qEl = el; }catch{} }
    if(!qEl && containerHint){ const inside = Array.from(containerHint.querySelectorAll('p,div,span')); for(const el of inside){ if(isVisible(el) && getText(el).length > 10){ qEl = el; break; } } }
    if(!qEl){
      const nodes = collectCandidates(); const clusters = clusterVertical(nodes);
      if(clusters && clusters.length){ const best = clusters[0]; best.items.sort((a,b)=> (b.font * b.text.length) - (a.font * a.text.length)); qEl = best.items[0] && best.items[0].el; } else qEl = centerHeuristicElement();
    }
    let questionText = qEl ? getText(qEl) : '';
    if((!questionText || questionText.length < 8) && CFG.enableOCR){
      const container = qEl ? ascendToCard(qEl) : containerHint || findQuestionContainerDefault();
      const imgs = Array.from(container.querySelectorAll('img')).filter(isVisible);
      if(imgs.length){
        await loadTesseract();
        for(const im of imgs){
          const txt = await ocrImageElement(im);
          if(txt && txt.length > questionText.length) questionText = (questionText + ' ' + txt).trim();
        }
      }
    }
    if(!questionText && qEl) questionText = getText(qEl);
    if(trainedOptSel){
      try{ const els = document.querySelectorAll(trainedOptSel); for(const e of els){ if(isVisible(e)){ const t = getText(e); if(t && !options.includes(t)) options.push(t); } } }catch{}
    }
    if(!options.length){ const container = qEl ? ascendToCard(qEl) : containerHint || findQuestionContainerDefault(); options = detectOptions(container); }
    const confidence = computeConfidence(questionText, options, qEl);
    return {question: questionText, options, confidence, qEl};
  }

  function computeConfidence(questionText, options, qEl){
    let score = 0;
    if(questionText && questionText.length > 10) score += 40;
    if(options && options.length >= 2) score += Math.min(40, options.length * 8);
    if(qEl){ const r = qEl.getBoundingClientRect(); const mid = Math.abs(((r.top + r.bottom)/2) - (window.innerHeight/2)); score += Math.max(0, 20 - (mid/40)); }
    if(options && options.length > 6) score = Math.max(0, score - 8);
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /* ================ Auto-select logic ================ */
  function findOptionElementByText(optionText){
    // try exact match then fuzzy match by trimmed lowercase inclusion
    const all = Array.from(document.querySelectorAll('body *')).filter(isVisible);
    // exact first
    for(const el of all){
      const t = getText(el);
      if(!t) continue;
      if(t.trim() === optionText.trim()) return el;
    }
    // partial inclusion
    const low = optionText.toLowerCase().slice(0,40).trim();
    for(const el of all){
      const t = getText(el); if(!t) continue;
      if(t.toLowerCase().includes(low) || low.includes(t.toLowerCase().slice(0,40))) return el;
    }
    return null;
  }

  function clickOptionElement(el){
    if(!el) return false;
    try{
      // prefer clicking clickable child (button/input) if exists
      const btn = el.querySelector('button, input[type="button"], input[type="submit"]') || el.closest('button') || el;
      btn.click();
      // also dispatch events for robustness
      btn.dispatchEvent(new MouseEvent('mousedown', {bubbles:true}));
      btn.dispatchEvent(new MouseEvent('mouseup', {bubbles:true}));
      btn.dispatchEvent(new MouseEvent('click', {bubbles:true}));
      return true;
    }catch(e){ console.warn('clickOptionElement', e); return false; }
  }

  async function maybeAutoSelect(options, confidence){
    if(!CFG.autoSelectEnabled) return false;
    if(confidence < CFG.autoSelectThreshold) return false;
    if(!options || !options.length) return false;
    // choose first option (or better: run heuristics later). For now use option order highest confidence -> first
    const top = options[0];
    const el = findOptionElementByText(top);
    if(el){
      clickOptionElement(el);
      toast('Auto-selecionada: ' + (top.length>40 ? top.slice(0,40)+'…' : top));
      return true;
    }
    return false;
  }

  /* ================ Helpers previously defined ================ */
  function centerHeuristicElement(){
    const cx = innerWidth/2, cy = innerHeight/2;
    const nodes = collectCandidates();
    let best = null;
    for(const n of nodes){
      const midx = n.rect.left + n.rect.width/2, midy = n.rect.top + n.rect.height/2;
      const dist = Math.hypot(cx - midx, cy - midy) + 1;
      const score = n.text.length / dist;
      if(!best || score > best.score) best = {score, node: n};
    }
    return best && best.node ? best.node.el : null;
  }
  function collectCandidates(scope = document){
    const out = []; const all = Array.from(scope.querySelectorAll('body *'));
    for(const el of all){ if(!isVisible(el)) continue; const text = getText(el); if(!text || text.length < CFG.minTextLen) continue; const r = el.getBoundingClientRect(); out.push({el, text, rect: r, area: r.width * r.height, font: (parseFloat(getComputedStyle(el).fontSize) || 14)}); }
    return out;
  }
  function ascendToCard(el){
    if(!el) return null;
    let node = el;
    for(let i=0;i<8 && node;i++){ const cls = (node.className||'') + ''; if(/(question|card|qz|prompt|container|quiz)/i.test(cls)) return node; node = node.parentElement; }
    node = el.parentElement; while(node && node.parentElement){ const r = node.getBoundingClientRect(); if(r.width > innerWidth * 0.28) return node; node = node.parentElement; } return el;
  }

  /* ================ findQuestionContainerDefault & detectOptions reused ================ */
  function findQuestionContainerDefault(){
    const known = ['[data-test="question-card"]', '.qz-question-card', '.qz-question-container', '.questionContainer', '[data-test="question-text"]'];
    for(const s of known){ try{ const el = document.querySelector(s); if(el && isVisible(el)) return el; }catch{} }
    const nodes = collectCandidates(); const clusters = clusterVertical(nodes);
    if(clusters && clusters.length) return ascendToCard(clusters[0].items[0].el);
    const center = centerHeuristicElement(); if(center) return ascendToCard(center);
    return document.body;
  }
  function detectOptions(container){ /* code copied from above for consistency */ const opts = []; if(!container) return opts; const selCandidates = Array.from(container.querySelectorAll('button, [role="option"], [role="radio"], [data-test*="option"], [class*="option"], li, label')); for(const el of selCandidates){ if(!isVisible(el)) continue; const t = getText(el); if(!t) continue; if(!opts.includes(t)) opts.push(t); } if(CFG.appearanceDetection){ const contRect = container.getBoundingClientRect(); const all = Array.from(document.querySelectorAll('body *')); for(const el of all){ if(!isVisible(el) || opts.length >= 12) break; try{ if(!looksLikeOption(el)) continue; }catch{} const r = el.getBoundingClientRect(); if(Math.abs((r.top + r.bottom)/2 - (contRect.top + contRect.bottom)/2) > Math.max(innerHeight*0.6, 350)) continue; const t = getText(el); if(t && !opts.includes(t)) opts.push(t); } } opts.sort((a,b)=>{ const aEl = Array.from(document.querySelectorAll('body *')).find(e=> getText(e) === a); const bEl = Array.from(document.querySelectorAll('body *')).find(e=> getText(e) === b); if(!aEl || !bEl) return 0; return aEl.getBoundingClientRect().top - bEl.getBoundingClientRect().top; }); return opts.slice(0,12); }

  /* ================ Overlay & preview ================ */
  function updatePreview(text, confidence){
    const box = document.getElementById('santos-preview');
    if(!box) return;
    box.innerText = clamp(text||'', 3000);
    const confEl = document.getElementById('santos-conf');
    if(confEl) confEl.textContent = `· Conf: ${confidence}%`;
  }

  /* ================ find & process loop ================ */
  let lastPayload = '';
  async function processLoop(){
    try{
      const container = findQuestionContainerDefault();
      const res = await extract(container);
      lastPayload = buildPayload(res.question, res.options);
      updatePreview(lastPayload, res.confidence);
      // auto-select if enabled and confident
      if(res.confidence >= CFG.autoSelectThreshold && CFG.autoSelectEnabled){
        await maybeAutoSelect(res.options, res.confidence);
      }
      // save last container selector for diagnostics
      try{ const sel = generateSelector(res.qEl || container); localStorage.setItem(CFG.savePrefix + 'last_container', sel || ''); }catch{}
    }catch(e){ console.error('SANTOS.v14 process error', e); }
  }
  function buildPayload(question, options){
    const parts = []; parts.push(`# ${document.title || 'Sem título'}`); parts.push(`**URL:** ${location.href}`); if(question){ parts.push(''); parts.push('## PERGUNTA:'); parts.push(question); } if(options && options.length){ parts.push(''); parts.push('## OPÇÕES:'); options.forEach((o,i)=> parts.push(`${String.fromCharCode(65+i)}) ${o}`)); } return parts.join('\n'); }

  /* ================ Observers, shortcuts, init ================ */
  let mo = null, poll = null, debounceTimer = null;
  async function loopProcessDebounced(){ clearTimeout(debounceTimer); debounceTimer = setTimeout(()=>processLoop(), CFG.debounceMs); }
  function start(){
    buildUI();
    processLoop();
    mo = new MutationObserver(loopProcessDebounced);
    try{ mo.observe(document.documentElement||document.body, { childList:true, subtree:true, characterData:true, attributes:true }); }catch(e){}
    poll = setInterval(processLoop, CFG.pollInterval);
    window.addEventListener('resize', loopProcessDebounced);
    window.addEventListener('scroll', loopProcessDebounced, { passive:true });
  }
  function stop(){ if(mo){ mo.disconnect(); mo=null;} if(poll){ clearInterval(poll); poll=null;} window.removeEventListener('resize', loopProcessDebounced); window.removeEventListener('scroll', loopProcessDebounced); }

  window.addEventListener('keydown', (e)=>{ if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u'){ const ui = document.getElementById('santos-meczada-ui-v14'); if(ui) ui.style.display = ui.style.display === 'none' ? 'block' : 'none'; } if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') enableManualCapture(); });

  if(document.readyState === 'complete' || document.readyState === 'interactive'){ setTimeout(start, 80); } else { window.addEventListener('DOMContentLoaded', start, {once:true}); }

})();\n
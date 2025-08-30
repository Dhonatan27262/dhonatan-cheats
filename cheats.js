// ==UserScript==
// @name         SANTOS.meczada - Captura Inteligente (Quizizz/Wayground PRO)
// @namespace    http://tampermonkey.net/
// @version      9.0
// @description  Captura confiável de perguntas/opções no Quizizz (Wayground) e páginas similares, com extração profunda, heurística central e modo manual de seleção.
// @author       SANTOS
// @match        *://*/*
// @grant        none
// @icon         https://i.imgur.com/7YbX5Jx.png
// ==/UserScript==

(function () {
  'use strict';

  /******************************************************************
   * CONFIGURAÇÕES
   ******************************************************************/
  const CFG = {
    // Intervalo de sanity-check (além do MutationObserver) — ms
    pollInterval: 1200,
    // Debounce para reprocessar após mutações — ms
    debounce: 140,
    // Tamanho máximo exibido no preview
    maxPreviewLength: 1200,
    // Tamanho máximo enviado na URL do Perplexity (margem segura < 2000)
    maxPerplexityChars: 1800,
    // Limite “duro” para o buffer interno (evitar crescer demais)
    maxInternalChars: 12000,
    // Habilita heurística de alvo central na viewport
    useCenterHeuristic: true,
    // Se true, tenta varrer Shadow DOMs
    traverseShadowRoots: true,
    // Detectores específicos do Quizizz / Wayground
    quizizzSelectors: {
      question: [
        '.question-text', '[data-test="question-text"]', '.qz-question', '.q-text',
        '.question', '.prompt', '[class*="question"]', '[class*="prompt"]',
        '[data-qa*="question"]', '[data-qa*="prompt"]'
      ],
      options: [
        // ARIA / roles
        '[role="listitem"] [role="button"]',
        '[role="radiogroup"] [role="radio"]',
        '[role="option"]',
        '[role="button"]',
        // Classes comuns
        '.option', '.qz-option', '.answer', '.choice',
        '[class*="option"]', '[class*="answer"]', '[class*="choice"]',
        '[data-test="option"]',
        // Botões de opção
        'button', 'li', '[data-idx]', '[data-option-index]'
      ],
      containerHints: [
        '[data-test*="question"]', '[data-qa*="question"]',
        '.qz-question-container', '.questionContainer', '.qz-question-card',
        '[class*="question"][class*="container"]'
      ]
    },
    // Frases ruído para ignorar (UI, botões de navegação, etc.)
    noisePhrases: [
      'join', 'start', 'next', 'previous', 'skip', 'submit',
      'report', 'feedback', 'settings', 'music', 'sound',
      'login', 'logout', 'sign in', 'sign up', 'profile',
      'terms', 'privacy', 'help', 'support'
    ],
    // Atalhos de teclado
    hotkeys: {
      toggleUI: 'Ctrl+Shift+U',
      captureManual: 'Ctrl+Shift+M'
    }
  };

  /******************************************************************
   * UTILITÁRIOS GERAIS
   ******************************************************************/
  const isQuizizzHost = () =>
    /quizizz|wayground/i.test(location.hostname) ||
    !!document.querySelector('[class*="quizizz"], [class*="qz-"], [data-test*="quizizz"]');

  const nowStr = () => new Date().toLocaleTimeString();

  const clamp = (str, max) => (str.length > max ? str.slice(0, max) + '…' : str);

  const uniqPush = (arr, txt) => {
    const t = txt.trim();
    if (!t) return;
    if (!arr.includes(t)) arr.push(t);
  };

  const isNodeVisible = (el) => {
    if (!el || !(el instanceof Element)) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
    if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
    if (el.getClientRects().length === 0) return false;
    // Evitar capturar elementos fora da viewport (muito distantes)
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight || rect.right < 0 || rect.left > innerWidth) {
      // Ainda permitimos um pouco fora se for container pai
      // mas para elementos pequenos isolados, ignore
      if (rect.height < 5 || rect.width < 5) return false;
    }
    return true;
  };

  const getTextLike = (el) => {
    // Prioriza innerText (texto renderizado) e completa com atributos
    // Útil para botões/ícones com texto acessível
    if (!el) return '';
    let t = '';
    // innerText às vezes força reflow, mas é o mais fiel ao que o usuário vê
    try { t = (el.innerText || '').trim(); } catch {}
    if (!t) {
      // como fallback, textContent
      try { t = (el.textContent || '').trim(); } catch {}
    }
    // enriquecer com acessibilidade/alt/title quando fizer sentido
    const aria = (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'))) || '';
    const title = (el.getAttribute && el.getAttribute('title')) || '';
    const alt = (el.getAttribute && el.getAttribute('alt')) || '';
    // evita duplicar se já contido
    [aria, title, alt].forEach((a) => {
      if (a && !t.toLowerCase().includes(a.trim().toLowerCase())) t += (t ? ' ' : '') + a.trim();
    });
    return t.replace(/\s+/g, ' ').trim();
  };

  const isNoise = (txt) => {
    const s = txt.toLowerCase();
    return CFG.noisePhrases.some((n) => s.includes(n));
  };

  const byTextLengthDesc = (a, b) => (b.text.length - a.text.length);

  const safeQueryAll = (root, sel) => {
    try { return Array.from(root.querySelectorAll(sel)); } catch { return []; }
  };

  // Caminha Shadow DOM de forma controlada
  const walkAllElements = (root = document) => {
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
        // Shadow DOM
        if (CFG.traverseShadowRoots && node.shadowRoot) {
          stack.push(node.shadowRoot);
        }
      }
      for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
    }
    return out;
  };

  // Tenta entrar em iframes do mesmo domínio
  const getSameOriginFrames = () => {
    const frames = [];
    document.querySelectorAll('iframe').forEach((ifr) => {
      try {
        if (ifr.contentDocument && ifr.contentWindow && ifr.contentDocument.location.host === location.host) {
          frames.push(ifr.contentDocument);
        }
      } catch (_) { /* cross-origin - ignorar */ }
    });
    return frames;
  };

  /******************************************************************
   * EXTRAÇÃO — HEURÍSTICA CENTRAL + SELECTORES QUIZIZZ
   ******************************************************************/
  const captureQuizizz = () => {
    const result = { question: '', options: [], context: [] };

    // 1) Primeiro, tente selecionar diretamente pelos seletores conhecidos
    let qEl = null;
    for (const sel of CFG.quizizzSelectors.question) {
      qEl = document.querySelector(sel);
      if (qEl && isNodeVisible(qEl) && getTextLike(qEl).length > 4) break;
      qEl = null;
    }

    // 2) Se não achou pergunta, tente heurística de “bloco central”
    if (!qEl && CFG.useCenterHeuristic) {
      qEl = guessCenterQuestion();
    }

    if (qEl) {
      result.question = getTextLike(qEl);
      // procurar um container pai plausível para achar opções
      const container = findLikelyQuestionContainer(qEl);
      const opts = collectOptionsFrom(container || document);
      if (opts.length) result.options = opts;
      // contexto adicional ao redor (instruções, mídia, dicas)
      const ctx = collectContextAround(qEl, container);
      if (ctx.length) result.context = ctx;
    }

    // 3) Fallback: se não pegou nada, faz varredura mais ampla do DOM visível
    if (!result.question && result.options.length === 0) {
      const broad = broadVisibleSweep();
      result.question = broad.main || '';
      result.options = broad.opts || [];
      result.context = broad.ctx || [];
    }

    return result;
  };

  const guessCenterQuestion = () => {
    // Busca elementos visíveis próximos do centro da viewport, com bastante texto
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const candidates = [];
    walkAllElements().forEach((el) => {
      if (!isNodeVisible(el)) return;
      const txt = getTextLike(el);
      if (txt.length < 8) return;
      const r = el.getBoundingClientRect();
      // distância do centro da viewport ao centro do elemento
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(centerX - cx, centerY - cy);
      // prioriza quem tem texto “grande” e está perto do centro
      const score = (txt.length * 1.0) / Math.max(24, dist);
      candidates.push({ el, text: txt, score });
    });

    candidates.sort((a, b) => b.score - a.score);
    const pick = candidates[0] && candidates[0].score > 0 ? candidates[0].el : null;
    return pick;
  };

  const findLikelyQuestionContainer = (qEl) => {
    // Sobe na árvore para encontrar um container com “cara” de card de questão
    if (!qEl) return null;
    const HINTS = CFG.quizizzSelectors.containerHints;
    let el = qEl;
    for (let i = 0; i < 6 && el; i++) {
      for (const h of HINTS) {
        if (el.matches && el.matches(h)) return el;
      }
      el = el.parentElement;
    }
    // Se não achou, retorna o pai mais próximo com largura decente
    el = qEl.parentElement;
    while (el && el.parentElement && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      if (r.width > innerWidth * 0.3) return el;
      el = el.parentElement;
    }
    return qEl.parentElement || null;
  };

  const collectOptionsFrom = (root) => {
    const found = [];
    if (!root) return found;

    const addOption = (el) => {
      if (!isNodeVisible(el)) return;
      const txt = getTextLike(el);
      if (!txt || txt.length < 1) return;
      if (isNoise(txt)) return;
      // Evita capturar a própria pergunta como opção
      if (/^pergunta[:\s]/i.test(txt)) return;
      uniqPush(found, txt);
    };

    // 1) Roles ARIA comuns em opções
    safeQueryAll(root, '[role="option"], [role="radio"], [role="checkbox"], [role="button"]').forEach(addOption);

    // 2) Classes comuns no Quizizz
    CFG.quizizzSelectors.options.forEach((sel) => {
      safeQueryAll(root, sel).forEach((el) => {
        // Evitar capturar pais grandes; preferir filhos de texto
        if (el.children && el.children.length > 0) {
          // Prioriza nós folha com texto
          const leafTextNodes = Array.from(el.querySelectorAll('*')).filter(isNodeVisible).map(getTextLike).filter(Boolean);
          if (leafTextNodes.length) {
            leafTextNodes.forEach((t) => uniqPush(found, t));
          } else {
            addOption(el);
          }
        } else {
          addOption(el);
        }
      });
    });

    // 3) Itens de listas/labels/botões
    safeQueryAll(root, 'li, label, button').forEach(addOption);

    // 4) Filtro final: remove duplicatas por lowercase normalizado
    const dedup = [];
    const seen = new Set();
    found.forEach((t) => {
      const k = t.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!seen.has(k)) { seen.add(k); dedup.push(t); }
    });

    // Heurística: corta opções muito longas (provável contexto)
    const final = dedup.filter((t) => t.length <= 300);
    return final.slice(0, 12); // segura: dificilmente haverá > 12 opções
  };

  const collectContextAround = (qEl, container) => {
    const ctx = [];
    const scope = container || qEl.parentElement || document.body;
    // elementos irmãos e títulos adjacentes
    const neighbors = [];
    if (qEl && qEl.parentElement) {
      Array.from(qEl.parentElement.children).forEach((sib) => { if (sib !== qEl) neighbors.push(sib); });
    }
    // candidatos: instruções, dicas, subheadings
    const candidates = [
      ...neighbors,
      ...safeQueryAll(scope, 'h1,h2,h3,h4,h5,h6, small, em, i, b, strong, figcaption, caption, [aria-live]'),
    ].filter(isNodeVisible);

    candidates.forEach((el) => {
      const t = getTextLike(el);
      if (t && t.length >= 6 && !isNoise(t)) uniqPush(ctx, t);
    });

    // corta contexto demasiado
    return ctx.slice(0, 10);
  };

  const broadVisibleSweep = () => {
    // Varredura completa do DOM visível (inclui Shadow DOM e frames same-origin)
    const texts = [];
    walkAllElements().forEach((el) => {
      if (!isNodeVisible(el)) return;
      const t = getTextLike(el);
      if (!t || t.length < 2) return;
      if (isNoise(t)) return;
      uniqPush(texts, t);
    });
    // também varre iframes same-origin
    getSameOriginFrames().forEach((doc) => {
      Array.from(doc.querySelectorAll('*')).forEach((el) => {
        if (!isNodeVisible(el)) return;
        const t = getTextLike(el);
        if (t && t.length > 2 && !isNoise(t)) uniqPush(texts, t);
      });
    });

    // montar “pergunta principal” como o maior bloco de texto; opções como strings curtas
    const sorted = texts.map(t => ({ text: t })).sort(byTextLengthDesc);
    const main = (sorted[0] && sorted[0].text) || '';
    const opts = texts.filter(t => t.length > 0 && t.length <= 200).slice(0, 12);
    const ctx  = texts.filter(t => t.length > 200 && t !== main).slice(0, 8);

    return { main, opts, ctx };
    // Obs.: esta é uma última linha de defesa — o ideal é a detecção específica acima.
  };

  /******************************************************************
   * FORMATAÇÃO PARA PREVIEW / PERPLEXITY
   ******************************************************************/
  const toStructuredText = ({ question, options, context }) => {
    let out = [];
    out.push(`# ${document.title || 'Sem título'}`);
    out.push(`**URL:** ${location.href}`);
    if (question) {
      out.push('');
      out.push('## PERGUNTA:');
      out.push(question);
    }
    if (options && options.length) {
      out.push('');
      out.push('## OPÇÕES:');
      options.forEach((opt, i) => out.push(`${String.fromCharCode(65 + i)}. ${opt}`));
    }
    if (context && context.length) {
      out.push('');
      out.push('## CONTEXTO:');
      context.forEach((c) => out.push(`- ${c}`));
    }
    let str = out.join('\n');
    if (str.length > CFG.maxInternalChars) {
      str = str.slice(0, CFG.maxInternalChars) + '\n\n… [Conteúdo truncado]';
    }
    return str;
  };

  /******************************************************************
   * UI — PAINEL FLOANTE + MODO MANUAL
   ******************************************************************/
  let UI = null;
  let lastPayload = '';
  let debTimer = null;

  const buildUI = () => {
    if (document.getElementById('santos-meczada-ui')) return;

    UI = document.createElement('div');
    UI.id = 'santos-meczada-ui';
    Object.assign(UI.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 999999,
      width: '380px',
      maxHeight: '82vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a2980, #26d0ce)',
      color: '#fff',
      borderRadius: '14px',
      boxShadow: '0 12px 38px rgba(0,0,0,.35)',
      border: '1px solid rgba(255,255,255,.25)',
      overflow: 'hidden',
      fontFamily: 'Segoe UI, system-ui, Arial, sans-serif'
    });

    UI.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(0,0,0,.12)">
        <div style="display:flex;align-items:center;gap:8px;font-weight:600">
          <span style="font-size:18px">🎯 SANTOS.meczada</span>
          <span id="smt-platform" style="font-size:12px;background:rgba(255,255,255,.25);padding:2px 8px;border-radius:10px">
            ${isQuizizzHost() ? 'Quizizz' : 'Auto'}
          </span>
          <span id="smt-status" style="font-size:12px;background:rgba(255,255,255,.25);padding:2px 8px;border-radius:10px">
            <span class="spin">⟳</span> Ativo
          </span>
        </div>
        <div>
          <button id="smt-min" title="Minimizar" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer;opacity:.9">–</button>
          <button id="smt-close" title="Fechar" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:.9">×</button>
        </div>
      </div>
      <div id="smt-body" style="display:flex;flex-direction:column;gap:10px;padding:12px">
        <div id="smt-preview" style="flex:1;background:rgba(255,255,255,.12);border-radius:10px;padding:10px 12px;overflow:auto;font-family:Consolas,Monaco,monospace;font-size:13px;white-space:pre-wrap;max-height:300px">
          <div style="opacity:.8;text-align:center;padding:24px 0">Monitorando conteúdo…</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="smt-perp" style="flex:1;padding:10px 12px;border:none;border-radius:8px;background:#9c27b0;color:#fff;font-weight:700;cursor:pointer">Enviar para Perplexity</button>
          <button id="smt-copy" style="padding:10px 12px;border:none;border-radius:8px;background:#2e7d32;color:#fff;font-weight:700;cursor:pointer">Copiar</button>
          <button id="smt-manual" style="padding:10px 12px;border:none;border-radius:8px;background:#0069c0;color:#fff;font-weight:700;cursor:pointer">Capturar área</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12px;opacity:.9">
          <div><b>Atalhos:</b> ${CFG.hotkeys.toggleUI} (UI), ${CFG.hotkeys.captureManual} (Área)</div>
        </div>
      </div>
      <div id="smt-mini" style="display:none;padding:10px;text-align:center">
        <button id="smt-expand" style="width:44px;height:44px;border-radius:50%;border:none;background:rgba(255,255,255,.22);color:#fff;cursor:pointer">⤢</button>
      </div>
    `;
    document.body.appendChild(UI);

    document.getElementById('smt-close').onclick = () => UI.remove();
    document.getElementById('smt-min').onclick = () => {
      document.getElementById('smt-body').style.display = 'none';
      document.getElementById('smt-mini').style.display = 'block';
      UI.style.width = '84px';
    };
    document.getElementById('smt-expand').onclick = () => {
      document.getElementById('smt-mini').style.display = 'none';
      document.getElementById('smt-body').style.display = 'flex';
      UI.style.width = '380px';
      updateNow(); // força atualização
    };

    document.getElementById('smt-perp').onclick = () => {
      let q = lastPayload || '';
      if (!q) { toast('Nada para enviar.'); return; }
      if (q.length > CFG.maxPerplexityChars) q = q.slice(0, CFG.maxPerplexityChars) + '…';
      const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`;
      window.open(url, '_blank');
      toast('Enviado ao Perplexity!');
    };
    document.getElementById('smt-copy').onclick = async () => {
      try {
        await navigator.clipboard.writeText(lastPayload || '');
        toast('Copiado!');
      } catch {
        toast('Falha ao copiar.');
      }
    };
    document.getElementById('smt-manual').onclick = enableManualCapture;

    // mover UI (drag)
    const header = UI.firstElementChild;
    header.style.cursor = 'move';
    let sx=0, sy=0, ox=0, oy=0, dragging=false;
    header.addEventListener('mousedown', (e) => {
      dragging = true; sx = e.clientX; sy = e.clientY;
      const r = UI.getBoundingClientRect(); ox = r.left; oy = r.top;
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onUp);
    });
    const onDrag = (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      UI.style.left = (ox + dx) + 'px';
      UI.style.top  = (oy + dy) + 'px';
      UI.style.right = 'auto'; UI.style.bottom = 'auto';
    };
    const onUp = () => {
      dragging = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onUp);
    };
  };

  const toast = (msg) => {
    const n = document.createElement('div');
    Object.assign(n.style, {
      position: 'fixed', bottom: '90px', right: '26px', zIndex: 1000000,
      background: 'rgba(0,0,0,.85)', color: '#fff', padding: '10px 14px',
      borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,.35)', fontSize: '13px'
    });
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1600);
  };

  const updatePreview = (txt) => {
    const box = document.getElementById('smt-preview');
    if (!box) return;
    let view = txt || '';
    if (view.length > CFG.maxPreviewLength) view = clamp(view, CFG.maxPreviewLength);

    // destacar títulos
    view = view
      .replace(/^# .+$/m, (m)=>`<span style="color:#ffeb3b;font-weight:700">${m}</span>`)
      .replace(/^## (PERGUNTA|OPÇÕES|CONTEXTO):$/gm, (m)=>`<span style="color:#80deea;font-weight:700">${m}</span>`);

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <b style="color:#ffeb3b">Conteúdo:</b>
        <span style="font-size:11px;background:rgba(255,255,255,.22);padding:1px 8px;border-radius:10px">${nowStr()}</span>
      </div>
      <div>${view}</div>
    `;
  };

  /******************************************************************
   * MODO MANUAL — clicar em um bloco para capturar
   ******************************************************************/
  let manualMode = false;
  let manualOverlay = null;

  const enableManualCapture = () => {
    if (manualMode) return disableManualCapture();
    manualMode = true;
    toast('Clique em um bloco para capturar. (Esc para cancelar)');
    manualOverlay = document.createElement('div');
    Object.assign(manualOverlay.style, {
      position: 'fixed', inset: 0, zIndex: 999998, background: 'transparent', cursor: 'crosshair'
    });
    document.body.appendChild(manualOverlay);

    const hoverBox = document.createElement('div');
    Object.assign(hoverBox.style, {
      position: 'fixed', border: '2px solid #00e5ff', background: 'rgba(0,229,255,.08)', pointerEvents: 'none', zIndex: 999999
    });
    document.body.appendChild(hoverBox);

    const move = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || !isNodeVisible(el)) { hoverBox.style.display='none'; return; }
      const r = el.getBoundingClientRect();
      Object.assign(hoverBox.style, {
        display: 'block', left: r.left+'px', top: r.top+'px', width: r.width+'px', height: r.height+'px'
      });
    };
    const click = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) { disableManualCapture(); return; }
      e.preventDefault();
      e.stopPropagation();
      const container = findLikelyQuestionContainer(el) || el;
      const question = getTextLike(el).length >= 6 ? getTextLike(el) : (getTextLike(container) || '');
      const options = collectOptionsFrom(container);
      const context = collectContextAround(el, container);
      const payload = toStructuredText({ question, options, context });

      lastPayload = payload;
      updatePreview(payload);
      toast('Bloco capturado.');

      disableManualCapture();
    };
    const key = (e) => {
      if (e.key === 'Escape') {
        disableManualCapture();
        toast('Cancelado.');
      }
    };

    manualOverlay.addEventListener('mousemove', move);
    manualOverlay.addEventListener('click', click, { capture: true });
    window.addEventListener('keydown', key, { once: true });

    manualOverlay._cleanup = () => {
      manualOverlay.removeEventListener('mousemove', move);
      manualOverlay.removeEventListener('click', click, { capture: true });
      window.removeEventListener('keydown', key, { once: true });
      hoverBox.remove();
      manualOverlay.remove();
    };
  };

  const disableManualCapture = () => {
    manualMode = false;
    if (manualOverlay && manualOverlay._cleanup) manualOverlay._cleanup();
    manualOverlay = null;
  };

  /******************************************************************
   * CICLO DE CAPTURA / OBSERVADORES
   ******************************************************************/
  const computePayload = () => {
    let data;
    if (isQuizizzHost()) data = captureQuizizz();
    else {
      // Fallback genérico: tenta heurística central como “pergunta”
      const qGuess = guessCenterQuestion();
      const question = qGuess ? getTextLike(qGuess) : '';
      const container = qGuess ? findLikelyQuestionContainer(qGuess) : document;
      const options = collectOptionsFrom(container);
      const context = collectContextAround(qGuess, container);
      data = { question, options, context };
    }
    return toStructuredText(data);
  };

  const updateNow = () => {
    const payload = computePayload();
    if (!payload || !payload.trim()) return;
    if (payload === lastPayload) return;
    lastPayload = payload;
    updatePreview(payload);
    const st = document.getElementById('smt-status');
    if (st) st.innerHTML = '✓ Atualizado';
    setTimeout(()=>{ if (st) st.innerHTML = '<span class="spin">⟳</span> Ativo'; }, 800);
  };

  const debouncedUpdate = () => {
    clearTimeout(debTimer);
    debTimer = setTimeout(updateNow, CFG.debounce);
  };

  const startObservers = () => {
    stopObservers();

    // MutationObserver (DOM dinâmico)
    const mo = new MutationObserver(debouncedUpdate);
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true });
    window._santos_mo = mo;

    // Polling de sanity-check
    window._santos_poll = setInterval(updateNow, CFG.pollInterval);

    // Recalcula ao redimensionar/scroll (pois a heurística central considera viewport)
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('scroll', debouncedUpdate, { passive: true });
  };

  const stopObservers = () => {
    if (window._santos_mo) { window._santos_mo.disconnect(); window._santos_mo = null; }
    if (window._santos_poll) { clearInterval(window._santos_poll); window._santos_poll = null; }
    window.removeEventListener('resize', debouncedUpdate);
    window.removeEventListener('scroll', debouncedUpdate);
  };

  /******************************************************************
   * HOTKEYS
   ******************************************************************/
  const parseChord = (s) => s.toLowerCase().split('+').map(x => x.trim());
  const hkToggle = parseChord(CFG.hotkeys.toggleUI);
  const hkManual = parseChord(CFG.hotkeys.captureManual);
  const matchChord = (e, chord) => {
    const needCtrl = chord.includes('ctrl');
    const needShift = chord.includes('shift');
    const needAlt = chord.includes('alt');
    const key = chord.find(k => !['ctrl','shift','alt'].includes(k));
    const kOk = key ? e.key.toLowerCase() === key.toLowerCase() : true;
    return (!!e.ctrlKey === needCtrl) && (!!e.shiftKey === needShift) && (!!e.altKey === needAlt) && kOk;
  };
  window.addEventListener('keydown', (e) => {
    if (matchChord(e, hkToggle)) {
      e.preventDefault();
      const body = document.getElementById('smt-body');
      const mini = document.getElementById('smt-mini');
      if (!body || !mini || !UI) return;
      const compact = body.style.display !== 'none';
      body.style.display = compact ? 'none' : 'flex';
      mini.style.display = compact ? 'block' : 'none';
      UI.style.width = compact ? '84px' : '380px';
    } else if (matchChord(e, hkManual)) {
      e.preventDefault();
      enableManualCapture();
    }
  }, true);

  /******************************************************************
   * INICIALIZAÇÃO
   ******************************************************************/
  const init = () => {
    buildUI();
    startObservers();
    updateNow();
    console.log(`SANTOS.meczada 9.0 — modo ${isQuizizzHost() ? 'Quizizz' : 'Auto'} pronto.`);
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 40);
  } else {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  }

})();
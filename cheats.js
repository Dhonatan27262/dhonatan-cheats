/* =====================================================================
   ffh4x-liquid-menu.js
   Menu flutuante estilo "Free Fire ffh4x" com efeito Liquid Glass (iOS-like)
   - Drag por mouse e toque (touch)
   - Salva posição no localStorage
   - API: createMenu(options), addButton(label, iconHTML, onClick, opts)
   - Contém completion() no final para Atalhos iOS / Safari
   ===================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'ffh4x_liquid_menu_pos_v1';

  /* -------------------------
     Helpers
     ------------------------- */
  const $ = (s, root = document) => root.querySelector(s);
  const create = (tag, attrs = {}, parent = null) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'style') Object.assign(el.style, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    });
    if (parent) parent.appendChild(el);
    return el;
  };

  /* -------------------------
     Inject styles
     ------------------------- */
  const injectStyles = () => {
    if (document.getElementById('ffh4x-liquid-styles')) return;
    const css = `
      /* Container */
      .ffh4x-menu {
        position: fixed;
        z-index: 2147483646;
        width: 170px;
        height: 170px;
        bottom: 90px;
        right: 18px;
        border-radius: 20px;
        padding: 12px;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 10px;
        backdrop-filter: blur(14px) saturate(120%) contrast(105%);
        -webkit-backdrop-filter: blur(14px) saturate(120%) contrast(105%);
        background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02));
        border: 1px solid rgba(255,255,255,0.14);
        box-shadow: 0 8px 28px rgba(0,0,0,0.35), 0 6px 30px rgba(96,98,255,0.06);
        user-select: none;
        touch-action: none;
        transition: transform .16s cubic-bezier(.2,.9,.2,1), opacity .12s;
      }
      .ffh4x-menu.ffh4x-dragging { transform: scale(.985); opacity: .98; }

      /* Button */
      .ffh4x-btn {
        border-radius: 14px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        padding: 8px;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,0.06);
        background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        color: #fff;
        box-shadow: rgba(0,0,0,0.18) 0px 6px 14px;
        -webkit-tap-highlight-color: transparent;
        position: relative;
        overflow: hidden;
      }
      .ffh4x-btn:active { transform: translateY(1px) scale(.997); }

      /* Icon badge */
      .ffh4x-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:700;
        font-size:16px;
        background: linear-gradient(135deg, rgba(255,108,108,0.95), rgba(96,98,255,0.95));
        box-shadow: 0 6px 16px rgba(0,0,0,0.30);
      }

      /* Sheen overlay for liquid-glass brightness */
      .ffh4x-menu::after{
        content: "";
        position: absolute;
        left: -30%;
        top: -30%;
        width: 160%;
        height: 80%;
        pointer-events: none;
        background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.00) 28%, rgba(255,255,255,0.00) 60%);
        transform: rotate(-18deg);
        filter: blur(12px);
        mix-blend-mode: overlay;
      }

      /* Small handle (for visual affordance) */
      .ffh4x-handle{
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: -10px;
        width: 48px;
        height: 6px;
        border-radius: 10px;
        background: linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
        box-shadow: inset 0 1px rgba(255,255,255,0.06);
        pointer-events: none;
      }

      /* Small close button */
      .ffh4x-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display:flex;
        align-items:center;
        justify-content:center;
        cursor: pointer;
        background: rgba(0,0,0,0.14);
        color: rgba(255,255,255,0.9);
        font-size: 14px;
      }

      @media (max-width:420px){
        .ffh4x-menu { width: 150px; height: 150px; bottom: 74px; right: 12px; padding: 10px; }
        .ffh4x-icon { width:34px; height:34px; border-radius:9px; font-size:14px; }
      }
    `;
    const style = document.createElement('style');
    style.id = 'ffh4x-liquid-styles';
    style.innerHTML = css;
    document.head.appendChild(style);
  };

  /* -------------------------
     Menu Factory
     ------------------------- */
  function createMenu(options = {}) {
    injectStyles();

    // Defaults
    const opts = Object.assign({
      initialX: null, // null -> use stored or default
      initialY: null,
      size: 170,
      buttons: [], // { label, iconHTML, onClick }
      onClose: () => { menu.remove(); },
      persistPosition: true
    }, options);

    // Root
    const menu = create('div', { class: 'ffh4x-menu', role: 'dialog', 'aria-label': 'ffh4x menu' }, document.body);
    // handle bar visual
    create('div', { class: 'ffh4x-handle' }, menu);
    // close
    const close = create('div', { class: 'ffh4x-close', html: '✕', title: 'Fechar' }, menu);
    close.addEventListener('click', () => opts.onClose(menu));

    // buttons container: we simply add directly into menu as grid
    // helper to create a button
    function addButton(label, iconHTML, onClick, bopts = {}) {
      const btn = create('button', { class: 'ffh4x-btn', type: 'button', title: label }, menu);
      btn.innerHTML = `<div class="ffh4x-icon">${iconHTML || ''}</div><div style="font-size:12px;opacity:.95;white-space:nowrap;">${label}</div>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { onClick && onClick(e, menu); } catch (err) { console.error('ffh4x btn handler', err); }
      });
      // optional small tooltip style or custom width
      if (bopts.width) btn.style.minWidth = bopts.width;
      return btn;
    }

    // populate default buttons if provided
    (opts.buttons || []).forEach(b => addButton(b.label, b.iconHTML, b.onClick, b.opts));

    // Dragging logic (works for mouse and touch)
    let dragging = false;
    let startX = 0, startY = 0;
    let origX = 0, origY = 0;

    // read stored pos
    const stored = opts.persistPosition ? (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
    })() : null;

    // initial position
    const rect = menu.getBoundingClientRect();
    const initialPos = {
      x: opts.initialX ?? (stored && stored.x != null ? stored.x : window.innerWidth - rect.width - 18),
      y: opts.initialY ?? (stored && stored.y != null ? stored.y : window.innerHeight - rect.height - 90)
    };
    // apply
    menu.style.left = Math.max(8, Math.min(window.innerWidth - rect.width - 8, initialPos.x)) + 'px';
    menu.style.top  = Math.max(8, Math.min(window.innerHeight - rect.height - 8, initialPos.y)) + 'px';
    menu.style.right = 'auto';
    menu.style.bottom = 'auto';

    // Pointer start
    function pointerStart(clientX, clientY) {
      dragging = true;
      menu.classList.add('ffh4x-dragging');
      const rect = menu.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      origX = rect.left;
      origY = rect.top;
    }

    // Pointer move
    function pointerMove(clientX, clientY) {
      if (!dragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      let nx = origX + dx;
      let ny = origY + dy;
      // clamp to viewport
      const mr = menu.getBoundingClientRect();
      nx = Math.max(6, Math.min(window.innerWidth - mr.width - 6, nx));
      ny = Math.max(6, Math.min(window.innerHeight - mr.height - 6, ny));
      menu.style.left = nx + 'px';
      menu.style.top = ny + 'px';
    }

    // Pointer end
    function pointerEnd() {
      if (!dragging) return;
      dragging = false;
      menu.classList.remove('ffh4x-dragging');
      // persist
      if (opts.persistPosition) {
        try {
          const rect = menu.getBoundingClientRect();
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: rect.left, y: rect.top }));
        } catch (e) { /* ignore */ }
      }
    }

    // Mouse events
    menu.addEventListener('mousedown', (ev) => {
      // start drag only if clicked empty space or handle (not on individual buttons)
      if (ev.target.closest('.ffh4x-btn') || ev.target.closest('.ffh4x-close')) return;
      ev.preventDefault();
      pointerStart(ev.clientX, ev.clientY);
      const mm = (e) => { pointerMove(e.clientX, e.clientY); };
      const mu = () => { pointerEnd(); window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
      window.addEventListener('mousemove', mm);
      window.addEventListener('mouseup', mu);
    }, { passive: false });

    // Touch events
    menu.addEventListener('touchstart', (ev) => {
      if (ev.touches.length !== 1) return;
      if (ev.target.closest('.ffh4x-btn') || ev.target.closest('.ffh4x-close')) return;
      const t = ev.touches[0];
      pointerStart(t.clientX, t.clientY);
      const tm = (e) => { const tt = e.touches[0]; pointerMove(tt.clientX, tt.clientY); };
      const te = () => { pointerEnd(); menu.removeEventListener('touchmove', tm); menu.removeEventListener('touchend', te); };
      menu.addEventListener('touchmove', tm, { passive: false });
      menu.addEventListener('touchend', te);
    }, { passive: false });

    // keyboard: allow ESC to close
    function keyHandler(e) {
      if (e.key === 'Escape') opts.onClose(menu);
    }
    document.addEventListener('keydown', keyHandler);

    // expose API
    const api = {
      el: menu,
      addButton,
      close: () => opts.onClose(menu),
      destroy: () => {
        document.removeEventListener('keydown', keyHandler);
        menu.remove();
      }
    };

    // return API
    return api;
  }

  /* -------------------------
     Export / default usage
     ------------------------- */
  // If user includes script and wants auto init, create a demo menu only when not already present
  if (!window.ffh4xLiquidMenuInitialized) {
    window.ffh4xLiquidMenuInitialized = true;

    // create default menu with example buttons
    const menuApi = createMenu({
      buttons: [
        {
          label: 'Encontrar',
          iconHTML: '🔍',
          onClick: (e, menu) => {
            alert('Botão Encontrar clicado — substitua por sua ação.');
          }
        },
        {
          label: 'Marcar',
          iconHTML: '🎯',
          onClick: (e, menu) => {
            alert('Botão Marcar clicado — substitua por sua ação.');
          }
        },
        {
          label: 'Colar',
          iconHTML: '📋',
          onClick: async () => {
            // exemplo de uso do clipboard
            try {
              const txt = await navigator.clipboard.readText();
              alert('Conteúdo do clipboard:\\n' + (txt || '[vazio]'));
            } catch (err) {
              alert('Não foi possível ler o clipboard. (Permissão negada?)');
            }
          }
        },
        {
          label: 'Config',
          iconHTML: '⚙️',
          onClick: (e, menu) => {
            alert('Abrir configurações — implemente o painel aqui.');
          }
        }
      ],
      onClose: (menuEl) => {
        // animação de saída e remoção
        menuEl.style.transition = 'transform .24s ease, opacity .18s ease';
        menuEl.style.transform = 'scale(.94) translateY(12px)';
        menuEl.style.opacity = '0';
        setTimeout(() => menuEl.remove(), 220);
      }
    });

    // expose global helper for adding buttons later
    window.ffh4xLiquidMenu = {
      addButton: menuApi.addButton,
      close: menuApi.close,
      destroy: menuApi.destroy,
      el: menuApi.el
    };
  }

  /* -------------------------
     completion() - para Atalhos iOS / Safari (evita erro de "no return" em alguns contexts)
     ------------------------- */
  function completion() {
    try {
      // some iOS Shortcut environments expect a function named completion()
      // no-op: kept to satisfy the Atalhos expectation
      return true;
    } catch (e) {
      return false;
    }
  }

  // expose completion globally (some iOS Shortcut runtimes call it)
  window.completion = completion;

  // fim do IIFE
})();
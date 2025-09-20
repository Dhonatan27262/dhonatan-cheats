(function () {
  'use strict';

  const NS = '__digitadorV2__';

  // ---- Limpeza de execuções anteriores ----
  if (window[NS]) {
    try {
      if (window[NS].listenerInstalado && window[NS].onDocClick) {
        document.removeEventListener('click', window[NS].onDocClick, true);
      }
      if (window[NS].typingIntervalId) clearInterval(window[NS].typingIntervalId);
    } catch (_) {}
    document.getElementById('digitadorV2-modal')?.remove();
    document.getElementById('digitadorV2-progresso')?.remove();
    document.getElementById('digitadorV2-toast')?.remove();
    document.getElementById('digitadorV2-controls')?.remove();
  }

  // ---- Estado global renovado a cada injeção ----
  window[NS] = {
    aguardandoCampo: false,
    listenerInstalado: false,
    onDocClick: null,
    typingIntervalId: null,
    paused: false,
    currentElement: null,
    currentText: '',
    currentIndex: 0,
    currentSpeed: 40,
    currentShowProgress: true
  };

  // ---- Toast/aviso rápido ----
  function toast(msg, corBorda = '#22c55e') {
    const id = 'digitadorV2-toast';
    document.getElementById(id)?.remove();
    const el = document.createElement('div');
    el.id = id;
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed',
      top: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 20px',
      borderRadius: '10px',
      zIndex: 10000002,
      border: `1px solid ${corBorda}`,
      background: 'rgba(0,0,0,0.9)',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px'
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  // ---- Listener único de clique (reinstalado a cada injeção) ----
  function ensureListenerInstalled() {
    if (window[NS].listenerInstalado && window[NS].onDocClick) {
      document.removeEventListener('click', window[NS].onDocClick, true);
      window[NS].listenerInstalado = false;
    }

    const onDocClick = (e) => {
      if (!window[NS].aguardandoCampo) return;

      // Ignora cliques na nossa própria UI
      const path = e.composedPath ? e.composedPath() : [];
      if (path.some(n => n && n.id && String(n.id).startsWith('digitadorV2-'))) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      window[NS].aguardandoCampo = false;

      const el = e.target;
      if (!(el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'))) {
        alert('❌ Esse não é um campo válido.');
        return;
      }

      const texto = prompt('📋 Cole ou digite o texto:');
      if (texto == null) return; // cancelado

      criarModalConfiguracao(el, texto);
    };

    window[NS].onDocClick = onDocClick;
    document.addEventListener('click', onDocClick, true);
    window[NS].listenerInstalado = true;
  }

  // ---- API pública: chame sempre que quiser iniciar pelo painel ----
  window.iniciarModV2 = function () {
    ensureListenerInstalled();
    window[NS].aguardandoCampo = true;
    alert('✍️ Toque no campo onde deseja digitar o texto.');
  };

  // ===============================
  // Modal de configuração (texto editável)
  // ===============================
  function criarModalConfiguracao(el, textoOriginal) {
    document.getElementById('digitadorV2-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'digitadorV2-modal';
    modal.setAttribute('role', 'dialog');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffffff;
      padding: 22px;
      border-radius: 12px;
      z-index: 10000001;
      box-shadow: 0 0 40px rgba(0,0,0,0.6);
      min-width: 360px;
      max-width: 92%;
      font-family: Arial, sans-serif;
      color: #1f2937;
    `;

    modal.innerHTML = `
      <h2 style="margin:0 0 10px 0; color:#111827; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
        📋 Configurações de Digitação
      </h2>

      <label for="digitadorV2-texto" style="display:block; margin-top:8px; font-weight:600; color:#1f2937;">
        Texto que será digitado (edite aqui):
      </label>
      <textarea id="digitadorV2-texto" style="
        width:100%;
        height:140px;
        margin:8px 0 16px 0;
        padding:12px;
        border:2px solid #3b82f6;
        border-radius:8px;
        background:#f8fafc;
        color:#111827;
        font-size:16px;
        line-height:1.4;
        resize:vertical;
        box-sizing:border-box;
      "></textarea>

      <label for="digitadorV2-velocidade" style="display:block; font-weight:600; color:#1f2937;">
        Velocidade de digitação:
      </label>
      <select id="digitadorV2-velocidade" style="
        width:100%;
        padding:10px;
        margin:8px 0 16px 0;
        border:2px solid #3b82f6;
        border-radius:8px;
        background:white;
        font-size:16px;
        box-sizing:border-box;
      ">
        <option value="100">Muito Devagar (100ms)</option>
        <option value="60" selected>Devagar (60ms)</option>
        <option value="40">Normal (40ms)</option>
        <option value="20">Rápido (20ms)</option>
        <option value="10">Muito Rápido (10ms)</option>
        <option value="humana">Velocidade Humana indetect</option>
      </select>

      <label style="display:flex; align-items:center; gap:8px; margin:16px 0; cursor:pointer;">
        <input type="checkbox" id="digitadorV2-mostrar-porcentagem" checked style="width:18px; height:18px;">
        <span style="font-weight:600; color:#1f2937;">Mostrar porcentagem durante a digitação</span>
      </label>

      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button id="digitadorV2-cancelar" style="
          padding:10px 16px; background:#ef4444; color:white; border:none; border-radius:8px; cursor:pointer; font-size:15px;">
          Cancelar
        </button>
        <button id="digitadorV2-confirmar" style="
          padding:10px 16px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer; font-size:15px; font-weight:700;">
          Iniciar Digitação
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Preenche o textarea com o texto inicial (pode editar livremente)
    const txt = modal.querySelector('#digitadorV2-texto');
    txt.value = textoOriginal;

    // Ações
    modal.querySelector('#digitadorV2-cancelar').addEventListener('click', () => modal.remove());
    modal.querySelector('#digitadorV2-confirmar').addEventListener('click', () => {
      const velocidade = modal.querySelector('#digitadorV2-velocidade').value;
      const mostrarPorcentagem = modal.querySelector('#digitadorV2-mostrar-porcentagem').checked;
      const textoAtual = txt.value;
      modal.remove();
      iniciarDigitacao(el, textoAtual, velocidade, mostrarPorcentagem);
    });

    // Fechar com ESC
    modal.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') modal.remove();
    });

    // Força foco no modal textarea para edição (opcional)
    txt.focus();
  }

  // ===============================
  // Inserção segura por tipo (não abre teclado)
  // ===============================
  function inserirCharEmInput(el, ch) {
    try {
      // posição atual (fallback no final)
      let pos = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;

      if (typeof el.setRangeText === 'function') {
        el.setRangeText(ch, pos, pos, 'end');
        // após setRangeText, a seleção fica após o texto inserido
      } else {
        // fallback
        const v = el.value || '';
        const before = v.slice(0, pos);
        const after = v.slice(pos);
        el.value = before + ch + after;
        const newPos = pos + ch.length;
        try { el.setSelectionRange(newPos, newPos); } catch (_) {}
      }
    } catch (err) {
      // último recurso: concatena
      el.value = (el.value || '') + ch;
    }
  }

  function inserirCharEmContentEditable(el, ch) {
    try {
      // cria um textNode com o caractere e insere ao final do elemento (sem focar)
      const doc = el.ownerDocument || document;
      const sel = doc.getSelection ? doc.getSelection() : null;
      let range;
      if (sel && sel.rangeCount) {
        // tenta usar seleção atual se estiver dentro do elemento
        range = sel.getRangeAt(0).cloneRange();
        // se seleção não estiver dentro do el, substitui pela posição final
        if (!el.contains(range.commonAncestorContainer)) {
          range = null;
        }
      }
      if (!range) {
        range = doc.createRange();
        range.selectNodeContents(el);
        range.collapse(false); // ao final
      }
      // insere nó de texto
      const txtNode = doc.createTextNode(ch);
      range.insertNode(txtNode);
      // move range após o nó inserido
      range.setStartAfter(txtNode);
      range.collapse(true);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch (err) {
      // fallback: concatena diretamente no innerText (pior caso)
      el.innerText = (el.innerText || '') + ch;
    }
  }

  // ===============================
  // Cria controles de UI
  // ===============================
  function criarControles(mostrarPorcentagem) {
    // Remove controles existentes
    document.getElementById('digitadorV2-controls')?.remove();
    
    const controls = document.createElement('div');
    controls.id = 'digitadorV2-controls';
    
    // Estilo base
    Object.assign(controls.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10000002,
      display: 'flex',
      gap: '10px',
      padding: '10px',
      borderRadius: '8px',
      background: 'rgba(0,0,0,0.85)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });
    
    // Se mostrarPorcentagem for true, adicionamos estilos adicionais
    if (mostrarPorcentagem) {
      Object.assign(controls.style, {
        padding: '15px 20px',
        alignItems: 'center'
      });
    }
    
    // Botão Pausar
    const pauseBtn = document.createElement('button');
    pauseBtn.innerHTML = '⏸️';
    pauseBtn.title = 'Pausar';
    pauseBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
    `;
    pauseBtn.addEventListener('mouseover', () => {
      pauseBtn.style.background = 'rgba(255,255,255,0.2)';
    });
    pauseBtn.addEventListener('mouseout', () => {
      pauseBtn.style.background = 'none';
    });
    pauseBtn.addEventListener('click', () => {
      window[NS].paused = true;
      toast('⏸️ Digitação pausada');
    });
    
    // Botão Continuar
    const resumeBtn = document.createElement('button');
    resumeBtn.innerHTML = '▶️';
    resumeBtn.title = 'Continuar';
    resumeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
    `;
    resumeBtn.addEventListener('mouseover', () => {
      resumeBtn.style.background = 'rgba(255,255,255,0.2)';
    });
    resumeBtn.addEventListener('mouseout', () => {
      resumeBtn.style.background = 'none';
    });
    resumeBtn.addEventListener('click', () => {
      if (window[NS].paused) {
        window[NS].paused = false;
        toast('▶️ Digitação continuando');
        // Reinicia a digitação de onde parou
        iniciarDigitacao(
          window[NS].currentElement,
          window[NS].currentText,
          window[NS].currentSpeed,
          window[NS].currentShowProgress,
          window[NS].currentIndex
        );
      }
    });
    
    // Botão Cancelar
    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '❌';
    cancelBtn.title = 'Cancelar';
    cancelBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
    `;
    cancelBtn.addEventListener('mouseover', () => {
      cancelBtn.style.background = 'rgba(255,255,255,0.2)';
    });
    cancelBtn.addEventListener('mouseout', () => {
      cancelBtn.style.background = 'none';
    });
    cancelBtn.addEventListener('click', () => {
      // Limpa o intervalo de digitação
      if (window[NS].typingIntervalId) {
        clearTimeout(window[NS].typingIntervalId);
        window[NS].typingIntervalId = null;
      }
      
      // Remove a UI
      document.getElementById('digitadorV2-progresso')?.remove();
      document.getElementById('digitadorV2-controls')?.remove();
      
      // Restaura estado do elemento
      try {
        if (window[NS].currentElement && 
            (window[NS].currentElement.tagName === 'INPUT' || 
             window[NS].currentElement.tagName === 'TEXTAREA')) {
          window[NS].currentElement.readOnly = false;
          window[NS].currentElement.blur();
        }
      } catch (_) {}
      
      // Reseta estado
      window[NS].paused = false;
      window[NS].currentElement = null;
      window[NS].currentText = '';
      window[NS].currentIndex = 0;
      
      toast('❌ Digitação cancelada', '#ef4444');
    });
    
    // Adiciona botões aos controles
    controls.appendChild(pauseBtn);
    controls.appendChild(resumeBtn);
    controls.appendChild(cancelBtn);
    
    // Adiciona controles ao documento
    document.body.appendChild(controls);
    
    return controls;
  }

  // ===============================
  // Digitação tecla-por-tecla (sem abrir teclado)
  // ===============================
  function iniciarDigitacao(el, texto, velocidade, mostrarPorcentagem, startIndex = 0) {
    // Se estiver pausado, não faz nada (aguarda usuário clicar em continuar)
    if (window[NS].paused && startIndex === 0) {
      return;
    }
    
    // Se já existe um intervalo, limpa
    if (window[NS].typingIntervalId) {
      clearTimeout(window[NS].typingIntervalId);
      window[NS].typingIntervalId = null;
    }
    
    // Remove elementos de UI existentes
    document.getElementById('digitadorV2-progresso')?.remove();
    
    // Salva estado atual para possível retomada
    window[NS].currentElement = el;
    window[NS].currentText = texto;
    window[NS].currentIndex = startIndex;
    window[NS].currentSpeed = velocidade;
    window[NS].currentShowProgress = mostrarPorcentagem;
    
    // Cria controles (sempre visíveis)
    const controls = criarControles(mostrarPorcentagem);
    
    // Detecta tipo do elemento
    const isInputEl = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
    const isContentEditable = !!el.isContentEditable;

    // Preparações para inputs/textarea: evitar teclado usando readOnly
    let prevReadOnly = null;
    try {
      if (isInputEl) {
        prevReadOnly = el.readOnly;
        el.readOnly = true; // crucial: evita que o teclado virtual apareça ao focar
        // foco é necessário em alguns browsers para setRangeText; com readOnly true o teclado normalmente não aparece
        try { el.focus({ preventScroll: true }); } catch (_) { try { el.focus(); } catch (_) {} }
        // posiciona caret no final se possível
        try {
          const len = el.value ? el.value.length : 0;
          el.setSelectionRange(len, len);
        } catch (_) {}
      }
    } catch (_) {}

    let i = startIndex;
    
    // Criar elemento de progresso apenas se for mostrar porcentagem
    let progresso = null;
    if (mostrarPorcentagem) {
      progresso = document.createElement('div');
      progresso.id = 'digitadorV2-progresso';
      Object.assign(progresso.style, {
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        marginRight: '10px'
      });
      
      // Adiciona o elemento de progresso aos controles
      controls.insertBefore(progresso, controls.firstChild);
    }

    // Função para obter o próximo intervalo baseado na velocidade selecionada
    function obterProximoIntervalo() {
      if (velocidade === 'humana') {
        // Velocidade humana: intervalo variável entre 100ms e 300ms com pausas ocasionais
        if (i > 0 && Math.random() < 0.05) {
          // Pausa ocasional (5% de chance após cada caractere)
          return 500 + Math.random() * 1000; // 500ms a 1500ms de pausa
        }
        return 100 + Math.random() * 200; // 100ms a 300ms
      } else {
        return parseInt(velocidade, 10); // Velocidade fixa
      }
    }

    function digitarProximoCaractere() {
      // Se estiver pausado, não faz nada
      if (window[NS].paused) {
        return;
      }
      
      if (i < texto.length) {
        const c = texto[i++];

        // Inserção de acordo com o tipo do elemento
        if (isInputEl) {
          inserirCharEmInput(el, c);
        } else if (isContentEditable) {
          inserirCharEmContentEditable(el, c);
        } else {
          // caso genérico (p.ex. elementos que aceitam innerText)
          try {
            el.innerText = (el.innerText || '') + c;
          } catch (_) {}
        }

        // Atualizar progresso se estiver sendo mostrado
        if (mostrarPorcentagem && progresso) {
          progresso.textContent = `${Math.round((i / texto.length) * 100)}%`;
        }

        // Disparar eventos de input periodicamente e para cada caractere
        try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
        if (i % 25 === 0) {
          try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
        }

        // Atualiza o índice atual
        window[NS].currentIndex = i;
        
        // Agendar próximo caractere
        window[NS].typingIntervalId = setTimeout(digitarProximoCaractere, obterProximoIntervalo());
      } else {
        // Finalização
        window[NS].typingIntervalId = null;

        // remove readonly e desfoca para inputs
        try {
          if (isInputEl) {
            // desfoca primeiro
            try { el.blur(); } catch (_) {}
            // restaura readOnly original
            if (prevReadOnly !== null && typeof prevReadOnly !== 'undefined') {
              try { el.readOnly = prevReadOnly; } catch (_) {}
            } else {
              try { el.readOnly = false; } catch (_) {}
            }
          } else if (isContentEditable) {
            // não forçamos foco; apenas disparamos eventos
          }
        } catch (_) {}

        // Garante que frameworks reajam
        try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
        try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) {}

        // Remove controles após um breve delay
        setTimeout(() => {
          document.getElementById('digitadorV2-controls')?.remove();
        }, 1000);
        
        toast('✅ Texto digitado com sucesso!');
      }
    }

    // Iniciar digitação
    window[NS].typingIntervalId = setTimeout(digitarProximoCaractere, obterProximoIntervalo());
  }

  // ---- Início imediato a cada injeção ----
  window.iniciarModV2();

})();
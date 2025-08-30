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
  }

  // ---- Estado global renovado a cada injeção ----
  window[NS] = {
    aguardandoCampo: false,
    listenerInstalado: false,
    onDocClick: null,
    typingIntervalId: null
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
  }

  // ===============================
  // Digitação tecla-por-tecla (execCommand)
  // ===============================
  function typeChar(char) {
    // Usa sempre execCommand para simular digitação humana
    document.execCommand('insertText', false, char);
  }

  function iniciarDigitacao(el, texto, velocidade, mostrarPorcentagem) {
    if (window[NS].typingIntervalId) {
      clearInterval(window[NS].typingIntervalId);
      window[NS].typingIntervalId = null;
    }
    document.getElementById('digitadorV2-progresso')?.remove();

    el.focus();
    let i = 0;

    // Criar elemento de progresso apenas se for mostrar porcentagem
    let progresso = null;
    if (mostrarPorcentagem) {
      progresso = document.createElement('div');
      progresso.id = 'digitadorV2-progresso';
      Object.assign(progresso.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        zIndex: 10000002,
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif'
      });
      document.body.appendChild(progresso);
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
      if (i < texto.length) {
        const c = texto[i++];
        typeChar(c);
        
        // Atualizar progresso se estiver sendo mostrado
        if (mostrarPorcentagem && progresso) {
          progresso.textContent = `${Math.round((i / texto.length) * 100)}%`;
        }
        
        // Disparar eventos de input periodicamente
        if (i % 25 === 0) el.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Agendar próximo caractere
        window[NS].typingIntervalId = setTimeout(digitarProximoCaractere, obterProximoIntervalo());
      } else {
        // Finalização
        window[NS].typingIntervalId = null;
        if (progresso) progresso.remove();
        el.blur();
        
        // Garante que frameworks reajam
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));

        toast('✅ Texto digitado com sucesso!');
      }
    }

    // Iniciar digitação
    window[NS].typingIntervalId = setTimeout(digitarProximoCaractere, obterProximoIntervalo());
  }

  // ---- Início imediato a cada injeção ----
  window.iniciarModV2();

})();
// ===============================
// Sistema de Digitação Automática V2 (idempotente)
// Arquivo: autodigitador.js
// Funciona toda vez que for injetado pelo seu botão (fetch + script.textContent)
// ===============================
(function () {
  'use strict';

  const NS = '__digitadorV2__';

  // ---- Limpeza de execuções anteriores ----
  if (window[NS]) {
    try {
      // Remover listener antigo, se existir
      if (window[NS].listenerInstalado && window[NS].onDocClick) {
        document.removeEventListener('click', window[NS].onDocClick, true);
      }
      // Cancelar digitação em andamento
      if (window[NS].typingIntervalId) {
        clearInterval(window[NS].typingIntervalId);
      }
    } catch (_) {}
    // Remover UI antiga (se ficou na tela)
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

  // ---- Utilitário: Toast rápido ----
  function toast(msg, corBorda = '#00ff00') {
    const id = 'digitadorV2-toast';
    document.getElementById(id)?.remove();
    const aviso = document.createElement('div');
    aviso.id = id;
    aviso.textContent = msg;
    Object.assign(aviso.style, {
      position: 'fixed',
      top: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 20px',
      borderRadius: '10px',
      zIndex: '9999999',
      border: `1px solid ${corBorda}`,
      background: 'rgba(0,0,0,0.9)',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px'
    });
    document.body.appendChild(aviso);
    setTimeout(() => aviso.remove(), 2200);
  }

  // ---- Listener único de clique (sempre substituído em nova injeção) ----
  function ensureListenerInstalled() {
    // Se tinha um antigo, remove para evitar duplicidade
    if (window[NS].listenerInstalado && window[NS].onDocClick) {
      document.removeEventListener('click', window[NS].onDocClick, true);
      window[NS].listenerInstalado = false;
    }

    const onDocClick = (e) => {
      if (!window[NS].aguardandoCampo) return;

      // Ignora cliques nos elementos da nossa própria UI
      const path = e.composedPath ? e.composedPath() : [];
      if (path.some(n => n && n.id && String(n.id).startsWith('digitadorV2-'))) return;

      // Captura o alvo, evita que outras lógicas da página disparem
      e.preventDefault();
      e.stopPropagation();

      window[NS].aguardandoCampo = false;

      const el = e.target;
      if (!(el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'))) {
        alert('❌ Esse não é um campo válido.');
        return;
      }

      const texto = prompt('📋 Cole ou digite o texto:');
      if (!texto) return;

      criarModalConfiguracao(el, texto);
    };

    window[NS].onDocClick = onDocClick;
    document.addEventListener('click', onDocClick, true);
    window[NS].listenerInstalado = true;
  }

  // ---- API pública para seu painel chamar quando quiser ----
  window.iniciarModV2 = function () {
    ensureListenerInstalled();
    window[NS].aguardandoCampo = true;
    alert('✍️ Toque no campo onde deseja digitar o texto.');
  };

  // ===============================
  // Modal de configuração
  // ===============================
  function criarModalConfiguracao(el, texto) {
    // Garante que só exista um modal
    document.getElementById('digitadorV2-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'digitadorV2-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 25px;
      border-radius: 12px;
      z-index: 10000000;
      box-shadow: 0 0 40px rgba(0,0,0,0.6);
      min-width: 400px;
      max-width: 90%;
      font-family: Arial, sans-serif;
      color: #333;
    `;

    modal.innerHTML = `
      <h2 style="margin-top: 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        📋 Configurações de Digitação
      </h2>
      <p style="margin-bottom: 15px; font-size: 14px; color: #7f8c8d;">
        Texto que será digitado (${texto.length} caracteres):
      </p>
      <div style="
        width: 100%;
        height: 120px;
        margin-bottom: 20px;
        padding: 15px;
        border: 2px solid #3498db;
        border-radius: 8px;
        background: #f8f9fa;
        overflow-y: auto;
        font-family: Arial, sans-serif;
        font-size: 16px;
        white-space: pre-wrap;
      ">${texto.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

      <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #2c3e50;">
        Velocidade de digitação:
      </label>
      <select id="digitadorV2-velocidade" style="
        width: 100%;
        padding: 10px;
        margin-bottom: 20px;
        border: 2px solid #3498db;
        border-radius: 8px;
        background: white;
        font-size: 16px;
      ">
        <option value="100">Muito Devagar (100ms)</option>
        <option value="60" selected>Devagar (60ms)</option>
        <option value="40">Normal (40ms)</option>
        <option value="20">Rápido (20ms)</option>
        <option value="10">Muito Rápido (10ms)</option>
      </select>

      <div style="display: flex; gap: 12px; justify-content: flex-end">
        <button id="digitadorV2-cancelar" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Cancelar
        </button>
        <button id="digitadorV2-confirmar" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold;">
          Iniciar Digitação
        </button>
      </div>
    `;

    modal.querySelector('#digitadorV2-cancelar').addEventListener('click', () => {
      modal.remove();
      // Se quiser, rearmar para escolher outro campo sem chamar iniciarModV2 de novo:
      // window[NS].aguardandoCampo = true;
    });

    modal.querySelector('#digitadorV2-confirmar').addEventListener('click', () => {
      const velocidade = parseInt(modal.querySelector('#digitadorV2-velocidade').value, 10);
      modal.remove();
      iniciarDigitacao(el, texto, velocidade);
    });

    document.body.appendChild(modal);
  }

  // ===============================
  // Digitação automática (com fallback para inputs)
  // ===============================
  function typeChar(el, ch) {
    if (el.isContentEditable) {
      // Conteúdo editável (div[contenteditable])
      document.execCommand('insertText', false, ch);
    } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const v = el.value || '';
      el.value = v.slice(0, start) + ch + v.slice(end);
      const pos = start + ch.length;
      try { el.setSelectionRange(pos, pos); } catch (_) {}
    } else {
      // Fallback genérico
      document.execCommand('insertText', false, ch);
    }
  }

  function iniciarDigitacao(el, texto, velocidade) {
    // Se havia uma digitação anterior, cancela
    if (window[NS].typingIntervalId) {
      clearInterval(window[NS].typingIntervalId);
      window[NS].typingIntervalId = null;
    }

    // Remove qualquer overlay antigo
    document.getElementById('digitadorV2-progresso')?.remove();

    el.focus();
    let i = 0;

    const progresso = document.createElement('div');
    progresso.id = 'digitadorV2-progresso';
    Object.assign(progresso.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.8)',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '8px',
      zIndex: 10000001,
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif'
    });
    document.body.appendChild(progresso);

    const intervalId = setInterval(() => {
      if (i < texto.length) {
        const c = texto[i++];
        typeChar(el, c);
        progresso.textContent = `${Math.round((i / texto.length) * 100)}%`;
        // Dispara "input" de tempos em tempos para frameworks reativos
        if (i % 20 === 0) {
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else {
        clearInterval(intervalId);
        window[NS].typingIntervalId = null;
        progresso.remove();
        el.blur();

        setTimeout(() => {
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));

          toast('✅ Texto digitado com sucesso!');
        }, 80);
      }
    }, velocidade);

    window[NS].typingIntervalId = intervalId;
  }

  // ===============================
  // Início imediato a cada injeção
  // ===============================
  window.iniciarModV2(); // toda vez que o botão do painel injeta, começa de novo

})();
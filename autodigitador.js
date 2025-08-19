const iniciarModV2 = () => {
  alert("✍️ Toque no campo onde deseja digitar o texto.");
  
  const handler = (e) => {
    e.preventDefault();
    document.removeEventListener('click', handler, true);
    
    const el = e.target;
    if (!(el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      alert("❌ Esse não é um campo válido.");
      document.dispatchEvent(new Event('digitacaoCancelada'));
      return;
    }

    // Cria modal personalizado
    const modal = document.createElement('div');
    modal.style = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 999999;
      box-shadow: 0 0 20px rgba(0,0,0,0.3);
      min-width: 300px;
    `;

    modal.innerHTML = `
      <h2 style="margin-top: 0">📋 Digitador Auto V2</h2>
      <textarea 
        id="textoInput" 
        placeholder="Digite ou cole o texto aqui..." 
        style="
          width: 100%;
          height: 150px;
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          resize: vertical;
        "
      ></textarea>
      
      <label>Velocidade de digitação:</label>
      <select id="velocidade" style="
        width: 100%;
        padding: 8px;
        margin-bottom: 15px;
        border: 1px solid #ccc;
        border-radius: 5px;
      ">
        <option value="100">Muito Devagar</option>
        <option value="60" selected>Devagar</option>
        <option value="40">Normal</option>
        <option value="20">Rápido</option>
        <option value="10">Muito Rápido</option>
      </select>
      
      <div style="display: flex; gap: 10px; justify-content: flex-end">
        <button id="cancelarBtn" style="padding: 8px 16px">Cancelar</button>
        <button id="confirmarBtn" style="padding: 8px 16px; background: #007bff; color: white">Iniciar</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners para os botões
    modal.querySelector('#cancelarBtn').onclick = () => {
      modal.remove();
      document.dispatchEvent(new Event('digitacaoCancelada'));
    };

    modal.querySelector('#confirmarBtn').onclick = () => {
      const texto = modal.querySelector('#textoInput').value;
      const velocidade = parseInt(modal.querySelector('#velocidade').value);
      modal.remove();

      if (!texto) {
        document.dispatchEvent(new Event('digitacaoCancelada'));
        return;
      }

      iniciarDigitacao(el, texto, velocidade);
    };
  };

  document.addEventListener('click', handler, true);
};

const iniciarDigitacao = (el, texto, velocidade) => {
  el.focus();
  let i = 0;
  
  const progresso = document.createElement('div');
  Object.assign(progresso.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.8)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '8px',
    zIndex: 9999999,
    fontSize: '20px'
  });
  
  document.body.appendChild(progresso);

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
        
        const msg = document.createElement('div');
        msg.textContent = "✅ Texto digitado com sucesso!";
        Object.assign(msg.style, {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#000',
          color: '#0f0',
          padding: '15px',
          borderRadius: '10px',
          fontSize: '18px',
          zIndex: 9999999,
          fontWeight: 'bold',
          textAlign: 'center'
        });
        
        document.body.appendChild(msg);
        setTimeout(() => {
          msg.remove();
          document.dispatchEvent(new Event('digitacaoConcluida'));
        }, 3000);
      }, 100);
    }
  }, velocidade);
};

// Eventos para comunicação com o script principal
document.addEventListener('digitacaoCancelada', () => {
  console.log('Digitação cancelada');
  // Adicione aqui a lógica para recriar o botão se necessário
});

document.addEventListener('digitacaoConcluida', () => {
  console.log('Digitação concluída');
  // Adicione aqui a lógica para recriar o botão se necessário
});
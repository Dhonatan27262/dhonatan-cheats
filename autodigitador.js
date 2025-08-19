// Sistema de Digitação Automática V2
// Arquivo: digitador-auto.js

// Função principal para iniciar o modo de digitação automática
const iniciarModV2 = () => {
    alert("✍️ Toque no campo onde deseja digitar o texto.");
    
    const handler = (e) => {
        e.preventDefault();
        document.removeEventListener('click', handler, true);
        
        const el = e.target;
        if (!(el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            alert("❌ Esse não é um campo válido.");
            return;
        }

        // Primeiro, usar o prompt tradicional para permitir colagem fácil
        const texto = prompt("📋 Cole ou digite o texto:");
        if (!texto) return;

        // Depois, mostrar a interface com opções de velocidade
        criarModalConfiguracao(el, texto);
    };

    document.addEventListener('click', handler, true);
};

// Função para criar o modal de configuração
const criarModalConfiguracao = (el, texto) => {
    // Criar modal para seleção de velocidade
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 25px;
        border-radius: 12px;
        z-index: 10001;
        box-shadow: 0 0 40px rgba(0,0,0,0.6);
        min-width: 400px;
        max-width: 90%;
        font-family: Arial, sans-serif;
        color: #333;
    `;
    
    // Conteúdo do modal
    modal.innerHTML = `
        <h2 style="margin-top: 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">📋 Configurações de Digitação</h2>
        <p style="margin-bottom: 15px; font-size: 14px; color: #7f8c8d;">Texto que será digitado (${texto.length} caracteres):</p>
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
        
        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #2c3e50;">Velocidade de digitação:</label>
        <select id="velocidade" style="
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
            <button id="cancelarBtn" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">Cancelar</button>
            <button id="confirmarBtn" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold;">Iniciar Digitação</button>
        </div>
    `;
    
    // Adicionar evento para o botão cancelar
    modal.querySelector('#cancelarBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Adicionar evento para o botão confirmar
    modal.querySelector('#confirmarBtn').addEventListener('click', () => {
        const velocidade = parseInt(modal.querySelector('#velocidade').value);
        document.body.removeChild(modal);
        iniciarDigitacao(el, texto, velocidade);
    });
    
    // Adicionar modal ao documento
    document.body.appendChild(modal);
};

// Função para iniciar a digitação automática (baseada no código original)
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
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif'
    });
    
    document.body.appendChild(progresso);

    const intervalo = setInterval(() => {
        if (i < texto.length) {
            const c = texto[i++];
            document.execCommand('insertText', false, c);  // insere texto como se fosse teclado
            progresso.textContent = `${Math.round(i / texto.length * 100)}%`;
        } else {
            clearInterval(intervalo);
            progresso.remove();
            el.blur();  // fechar
            
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
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif'
                });
                
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 3000);
            }, 100);
        }
    }, velocidade);
};

// Iniciar a aplicação quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarModV2);
} else {
    iniciarModV2();
}
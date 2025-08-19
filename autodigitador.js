// Função principal para iniciar o modo de digitação automática
const iniciarModV2 = () => {
    // Criar a interface do usuário
    criarInterface();
    
    // Adicionar evento de clique ao botão iniciar
    document.getElementById('iniciarBtn').addEventListener('click', () => {
        document.getElementById('modalDigitador').style.display = 'block';
        alert("✍️ Toque no campo onde deseja digitar o texto.");
    });
};

// Função para criar a interface do usuário
const criarInterface = () => {
    // Verificar se a interface já existe
    if (document.getElementById('digitadorContainer')) {
        return;
    }
    
    // Criar container principal
    const container = document.createElement('div');
    container.id = 'digitadorContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px;
        border-radius: 10px;
        color: white;
        font-family: Arial, sans-serif;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    // Adicionar título
    const titulo = document.createElement('h3');
    titulo.textContent = 'Digitador Automático V2';
    titulo.style.cssText = `
        margin: 0 0 15px 0;
        color: #4ecdc4;
        text-align: center;
        font-size: 18px;
    `;
    container.appendChild(titulo);
    
    // Adicionar botão de iniciar
    const iniciarBtn = document.createElement('button');
    iniciarBtn.id = 'iniciarBtn';
    iniciarBtn.textContent = '🚀 Iniciar Digitador';
    iniciarBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        background: #2ecc71;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        margin-bottom: 10px;
    `;
    container.appendChild(iniciarBtn);
    
    // Adicionar instruções
    const instrucoes = document.createElement('div');
    instrucoes.innerHTML = `
        <p style="font-size: 12px; margin: 10px 0;">
            <strong>Instruções:</strong> Clique no botão acima, depois toque no campo onde deseja digitar.
        </p>
    `;
    container.appendChild(instrucoes);
    
    // Adicionar container ao documento
    document.body.appendChild(container);
    
    // Criar modal para entrada de texto
    criarModal();
};

// Função para criar o modal de entrada de texto
const criarModal = () => {
    // Verificar se o modal já existe
    if (document.getElementById('modalDigitador')) {
        return;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.id = 'modalDigitador';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10001;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
        min-width: 350px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    // Conteúdo do modal
    modal.innerHTML = `
        <h2 style="margin-top: 0; color: #2c3e50;">📋 Digitador Auto V2</h2>
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
                font-family: Arial, sans-serif;
            "
        ></textarea>
        
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2c3e50;">Velocidade de digitação:</label>
        <select id="velocidade" style="
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background: white;
        ">
            <option value="100">Muito Devagar</option>
            <option value="60" selected>Devagar</option>
            <option value="40">Normal</option>
            <option value="20">Rápido</option>
            <option value="10">Muito Rápido</option>
        </select>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end">
            <button id="cancelarBtn" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancelar</button>
            <button id="confirmarBtn" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Iniciar</button>
        </div>
    `;
    
    // Adicionar evento para o botão cancelar
    modal.querySelector('#cancelarBtn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Adicionar evento para o botão confirmar
    modal.querySelector('#confirmarBtn').addEventListener('click', () => {
        const texto = modal.querySelector('#textoInput').value;
        const velocidade = parseInt(modal.querySelector('#velocidade').value);
        
        if (!texto) {
            alert("❌ Por favor, digite ou cole algum texto.");
            return;
        }
        
        modal.style.display = 'none';
        prepararDigitacao(texto, velocidade);
    });
    
    // Adicionar modal ao documento
    document.body.appendChild(modal);
};

// Função para preparar a digitação
const prepararDigitacao = (texto, velocidade) => {
    alert("✍️ Agora toque no campo onde deseja digitar o texto.");
    
    const handler = (e) => {
        e.preventDefault();
        document.removeEventListener('click', handler, true);
        
        const el = e.target;
        if (!(el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            alert("❌ Esse não é um campo válido.");
            return;
        }

        iniciarDigitacao(el, texto, velocidade);
    };

    document.addEventListener('click', handler, true);
};

// Função para iniciar a digitação automática
const iniciarDigitacao = (el, texto, velocidade) => {
    el.focus();
    let i = 0;
    
    // Criar elemento de progresso
    const progresso = document.createElement('div');
    progresso.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: #fff;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999999;
        font-size: 20px;
        font-family: Arial, sans-serif;
    `;
    
    document.body.appendChild(progresso);

    // Iniciar intervalo de digitação
    const intervalo = setInterval(() => {
        if (i < texto.length) {
            const c = texto[i++];
            
            // Inserir texto de forma simulada
            if (el.isContentEditable) {
                document.execCommand('insertText', false, c);
            } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value += c;
                
                // Disparar eventos de input e change
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            // Atualizar progresso
            progresso.textContent = `${Math.round(i / texto.length * 100)}%`;
        } else {
            // Finalizar digitação
            clearInterval(intervalo);
            progresso.remove();
            el.blur();
            
            // Mostrar mensagem de sucesso
            setTimeout(() => {
                const msg = document.createElement('div');
                msg.textContent = "✅ Texto digitado com sucesso!";
                msg.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #000;
                    color: #0f0;
                    padding: 15px;
                    border-radius: 10px;
                    font-size: 18px;
                    z-index: 9999999;
                    font-weight: bold;
                    text-align: center;
                    font-family: Arial, sans-serif;
                `;
                
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
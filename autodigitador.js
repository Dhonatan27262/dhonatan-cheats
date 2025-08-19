// autodigitador.js
// Função para iniciar o processo de digitação automática
function iniciarDigitador() {
    // Criar o modal para inserir texto
    const modal = document.createElement('div');
    modal.id = 'modal-digitador';
    modal.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            padding: 25px;
            border-radius: 10px;
            width: 90%;
            max-width: 600px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        ">
            <h2 style="margin-top: 0; color: #2c3e50;">Digitador Automático</h2>
            <p style="margin-bottom: 15px; color: #7f8c8d;">Cole o texto que deseja digitar automaticamente:</p>
            <textarea 
                id="texto-digitador" 
                style="
                    width: 100%;
                    height: 200px;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    resize: vertical;
                    font-size: 16px;
                    margin-bottom: 15px;
                "
                placeholder="Cole ou digite o texto aqui..."
            ></textarea>
            
            <div style="margin-bottom: 15px;">
                <p style="margin-bottom: 8px; font-weight: bold; color: #2c3e50;">Velocidade de digitação:</p>
                <label style="display: block; margin: 5px 0;">
                    <input type="radio" name="velocidade" value="100" checked> 
                    Normal (100ms por caractere)
                </label>
                <label style="display: block; margin: 5px 0;">
                    <input type="radio" name="velocidade" value="60"> 
                    Rápido (60ms por caractere)
                </label>
                <label style="display: block; margin: 5px 0;">
                    <input type="radio" name="velocidade" value="30"> 
                    Muito Rápido (30ms por caractere)
                </label>
                <label style="display: block; margin: 5px 0;">
                    <input type="radio" name="velocidade" value="10"> 
                    Máxima velocidade (10ms por caractere)
                </label>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="cancelar-digitador" style="
                    padding: 10px 20px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">Cancelar</button>
                <button id="iniciar-digitador" style="
                    padding: 10px 20px;
                    background: #2ecc71;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">Iniciar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners para os botões
    document.getElementById('cancelar-digitador').addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    document.getElementById('iniciar-digitador').addEventListener('click', function() {
        const texto = document.getElementById('texto-digitador').value.trim();
        if (!texto) {
            alert('Por favor, insira algum texto');
            return;
        }

        const velocidade = parseInt(document.querySelector('input[name="velocidade"]:checked').value);
        document.body.removeChild(modal);
        
        // Solicitar que o usuário selecione o campo de destino
        selecionarCampoTexto(texto, velocidade);
    });
}

// Função para selecionar o campo de texto onde será feita a digitação
function selecionarCampoTexto(texto, velocidade) {
    const overlay = document.createElement('div');
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(41, 128, 185, 0.3);
        z-index: 999998;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    `;
    
    const message = document.createElement('div');
    message.style = `
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        max-width: 80%;
    `;
    message.innerHTML = `
        <h3 style="margin: 0 0 10px 0;">Clique no campo onde deseja digitar o texto</h3>
        <p style="margin: 0; font-size: 14px;">O processo será cancelado automaticamente em 30 segundos</p>
    `;
    
    overlay.appendChild(message);
    document.body.appendChild(overlay);
    
    // Timer para cancelamento automático
    const timeout = setTimeout(() => {
        document.body.removeChild(overlay);
        alert('Tempo esgotado. O processo foi cancelado.');
    }, 30000);
    
    // Event listener para seleção do campo
    const selecionarCampo = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const el = e.target;
        if (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            clearTimeout(timeout);
            document.body.removeChild(overlay);
            document.removeEventListener('click', selecionarCampo, true);
            iniciarDigitacao(el, texto, velocidade);
        } else {
            alert('Por favor, selecione um campo de texto válido (input, textarea ou conteúdo editável)');
        }
    };
    
    document.addEventListener('click', selecionarCampo, true);
}

// Função para iniciar a digitação automática
function iniciarDigitacao(el, texto, velocidade) {
    el.focus();
    
    // Criar overlay de progresso
    const progressOverlay = document.createElement('div');
    progressOverlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    const progressContent = document.createElement('div');
    progressContent.style = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        min-width: 300px;
    `;
    progressContent.innerHTML = `
        <h3 style="margin-top: 0;">Digitando texto...</h3>
        <div style="background: #f0f0f0; border-radius: 5px; height: 20px; margin: 15px 0;">
            <div id="progress-bar" style="background: #3498db; height: 100%; width: 0%; border-radius: 5px;"></div>
        </div>
        <p id="progress-text">0%</p>
        <button id="cancelar-digitacao" style="
            padding: 8px 16px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        ">Cancelar</button>
    `;
    
    progressOverlay.appendChild(progressContent);
    document.body.appendChild(progressOverlay);
    
    let i = 0;
    let digitacaoAtiva = true;
    
    // Event listener para o botão de cancelar
    document.getElementById('cancelar-digitacao').addEventListener('click', function() {
        digitacaoAtiva = false;
        document.body.removeChild(progressOverlay);
    });
    
    // Função para digitar o próximo caractere
    function digitarProximo() {
        if (!digitacaoAtiva) return;
        
        if (i < texto.length) {
            const char = texto.charAt(i);
            
            // Inserir caractere no elemento
            if (el.isContentEditable) {
                document.execCommand('insertText', false, char);
            } else {
                el.value += char;
                
                // Disparar eventos para atualizar qualquer listener
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            i++;
            
            // Atualizar barra de progresso
            const progresso = (i / texto.length) * 100;
            document.getElementById('progress-bar').style.width = progresso + '%';
            document.getElementById('progress-text').textContent = Math.round(progresso) + '%';
            
            // Agendar próximo caractere
            setTimeout(digitarProximo, velocidade);
        } else {
            // Finalizado
            document.body.removeChild(progressOverlay);
            
            // Mostrar mensagem de conclusão
            const conclusao = document.createElement('div');
            conclusao.style = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 20px;
                border-radius: 8px;
                z-index: 999999;
                text-align: center;
            `;
            conclusao.innerHTML = `
                <h3 style="margin: 0 0 10px 0;">✅ Texto digitado com sucesso!</h3>
                <p style="margin: 0;">O texto foi inserido automaticamente no campo selecionado.</p>
            `;
            
            document.body.appendChild(conclusao);
            setTimeout(() => {
                document.body.removeChild(conclusao);
            }, 3000);
        }
    }
    
    // Iniciar o processo de digitação
    digitarProximo();
}

// Inicializar o digitador quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarDigitador);
} else {
    iniciarDigitador();
}
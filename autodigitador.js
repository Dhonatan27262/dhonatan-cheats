// digitador-automatico.js
// Função principal para inicializar o digitador automático
function initAutoDigitador() {
    // Criar o modal principal
    const modal = document.createElement('div');
    modal.id = 'auto-digitador-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100000;
        font-family: Arial, sans-serif;
    `;

    // Conteúdo do modal
    modal.innerHTML = `
        <div style="
            background: white;
            width: 90%;
            max-width: 600px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        ">
            <div style="
                background: #4a6bff;
                color: white;
                padding: 20px;
                text-align: center;
                font-size: 20px;
                font-weight: bold;
            ">
                Digitador Automático
            </div>
            
            <div style="padding: 25px;">
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 16px; margin-bottom: 10px; color: #333; font-weight: bold;">
                        Cole seu texto abaixo:
                    </p>
                    <textarea 
                        id="digitador-texto" 
                        style="
                            width: 100%;
                            height: 200px;
                            padding: 15px;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            font-size: 16px;
                            resize: vertical;
                        "
                        placeholder="Cole ou digite o texto que será digitado automaticamente..."
                    ></textarea>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <p style="font-size: 16px; margin-bottom: 10px; color: #333; font-weight: bold;">
                        Velocidade de digitação:
                    </p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="speed-option" data-speed="100" style="
                            padding: 12px;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            text-align: center;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-weight: bold;">Normal</div>
                            <div style="font-size: 14px; color: #666;">100ms/caractere</div>
                        </div>
                        <div class="speed-option" data-speed="60" style="
                            padding: 12px;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            text-align: center;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-weight: bold;">Rápido</div>
                            <div style="font-size: 14px; color: #666;">60ms/caractere</div>
                        </div>
                        <div class="speed-option" data-speed="40" style="
                            padding: 12px;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            text-align: center;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-weight: bold;">Muito Rápido</div>
                            <div style="font-size: 14px; color: #666;">40ms/caractere</div>
                        </div>
                        <div class="speed-option selected" data-speed="20" style="
                            padding: 12px;
                            border: 2px solid #4a6bff;
                            border-radius: 8px;
                            text-align: center;
                            cursor: pointer;
                            transition: all 0.3s;
                            background-color: #f0f5ff;
                        ">
                            <div style="font-weight: bold;">Máxima</div>
                            <div style="font-size: 14px; color: #666;">20ms/caractere</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between;">
                    <button id="digitador-cancelar" style="
                        padding: 12px 25px;
                        background: #f0f0f0;
                        color: #555;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                    ">
                        Cancelar
                    </button>
                    <button id="digitador-iniciar" style="
                        padding: 12px 25px;
                        background: #4a6bff;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                    ">
                        Iniciar
                    </button>
                </div>
            </div>
        </div>
    `;

    // Adicionar o modal ao documento
    document.body.appendChild(modal);
    
    // Inicializar seleção de velocidade
    const speedOptions = document.querySelectorAll('.speed-option');
    let selectedSpeed = 20;
    
    speedOptions.forEach(option => {
        option.addEventListener('click', function() {
            speedOptions.forEach(opt => {
                opt.style.borderColor = '#e0e0e0';
                opt.style.backgroundColor = '';
            });
            this.style.borderColor = '#4a6bff';
            this.style.backgroundColor = '#f0f5ff';
            selectedSpeed = parseInt(this.getAttribute('data-speed'));
        });
    });
    
    // Event listener para o botão cancelar
    document.getElementById('digitador-cancelar').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Event listener para o botão iniciar
    document.getElementById('digitador-iniciar').addEventListener('click', function() {
        const texto = document.getElementById('digitador-texto').value.trim();
        if (!texto) {
            alert('Por favor, insira algum texto antes de continuar.');
            return;
        }
        
        document.body.removeChild(modal);
        iniciarSelecaoCampo(texto, selectedSpeed);
    });
}

// Função para iniciar a seleção do campo de texto
function iniciarSelecaoCampo(texto, velocidade) {
    // Criar overlay de seleção
    const overlay = document.createElement('div');
    overlay.id = 'digitador-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(41, 128, 185, 0.3);
        z-index: 99999;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    `;
    
    // Mensagem de instrução
    const message = document.createElement('div');
    message.style.cssText = `
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 25px;
        border-radius: 12px;
        text-align: center;
        max-width: 80%;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    `;
    message.innerHTML = `
        <h3 style="margin: 0 0 15px 0; font-size: 20px;">Selecione o campo de texto</h3>
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">
            Clique no campo onde deseja que o texto seja digitado automaticamente.<br>
            Você tem 30 segundos para selecionar.
        </p>
        <div style="margin-top: 20px; background: #333; border-radius: 5px; height: 10px; width: 100%; overflow: hidden;">
            <div id="digitador-tempo-progresso" style="height: 100%; width: 100%; background: #4a6bff;"></div>
        </div>
        <p id="digitador-tempo-texto" style="margin: 10px 0 0 0; font-size: 14px;">Tempo restante: 30s</p>
    `;
    
    overlay.appendChild(message);
    document.body.appendChild(overlay);
    
    // Configurar temporizador
    let tempoRestante = 30;
    const progresso = document.getElementById('digitador-tempo-progresso');
    const textoTempo = document.getElementById('digitador-tempo-texto');
    
    const temporizador = setInterval(() => {
        tempoRestante--;
        progresso.style.width = (tempoRestante / 30 * 100) + '%';
        textoTempo.textContent = `Tempo restante: ${tempoRestante}s`;
        
        if (tempoRestante <= 0) {
            clearInterval(temporizador);
            document.body.removeChild(overlay);
            alert('Tempo esgotado. Por favor, inicie o processo novamente.');
        }
    }, 1000);
    
    // Event listener para seleção de campo
    const selecionarCampo = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const el = e.target;
        if (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            clearInterval(temporizador);
            document.body.removeChild(overlay);
            document.removeEventListener('click', selecionarCampo, true);
            iniciarDigitacao(el, texto, velocidade);
        } else {
            alert('Por favor, selecione um campo de texto válido (input, textarea ou conteúdo editável).');
        }
    };
    
    document.addEventListener('click', selecionarCampo, true);
}

// Função para iniciar a digitação automática
function iniciarDigitacao(elemento, texto, velocidade) {
    // Criar overlay de progresso
    const overlay = document.createElement('div');
    overlay.id = 'digitador-progresso-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 100000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    overlay.innerHTML = `
        <div style="
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        ">
            <h3 style="margin: 0 0 20px 0; color: #333;">Digitando texto...</h3>
            <div style="background: #f0f0f0; border-radius: 5px; height: 12px; overflow: hidden; margin-bottom: 15px;">
                <div id="digitador-progresso-barra" style="height: 100%; width: 0%; background: #4a6bff; transition: width 0.3s;"></div>
            </div>
            <p id="digitador-progresso-texto" style="margin: 0 0 20px 0; color: #666;">0% concluído</p>
            <button id="digitador-cancelar-digitacao" style="
                padding: 10px 20px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
            ">
                Cancelar
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Focar no elemento alvo
    elemento.focus();
    
    let indice = 0;
    let digitacaoAtiva = true;
    
    // Event listener para o botão de cancelar
    document.getElementById('digitador-cancelar-digitacao').addEventListener('click', function() {
        digitacaoAtiva = false;
        document.body.removeChild(overlay);
    });
    
    // Função para realizar a digitação
    function digitar() {
        if (!digitacaoAtiva) return;
        
        if (indice < texto.length) {
            const caractere = texto.charAt(indice);
            
            // Inserir caractere no elemento
            if (elemento.isContentEditable) {
                document.execCommand('insertText', false, caractere);
            } else {
                elemento.value += caractere;
                
                // Disparar eventos para atualizar qualquer listener
                elemento.dispatchEvent(new Event('input', { bubbles: true }));
                elemento.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            indice++;
            
            // Atualizar barra de progresso
            const progresso = (indice / texto.length) * 100;
            document.getElementById('digitador-progresso-barra').style.width = progresso + '%';
            document.getElementById('digitador-progresso-texto').textContent = Math.round(progresso) + '% concluído';
            
            // Agendar próximo caractere
            setTimeout(digitar, velocidade);
        } else {
            // Finalizado
            document.body.removeChild(overlay);
            
            // Mostrar mensagem de conclusão
            const mensagem = document.createElement('div');
            mensagem.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                z-index: 100000;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            `;
            mensagem.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #4a6bff;">✅ Texto digitado com sucesso!</h3>
                <p style="margin: 0;">O texto foi inserido automaticamente no campo selecionado.</p>
            `;
            
            document.body.appendChild(mensagem);
            setTimeout(() => {
                document.body.removeChild(mensagem);
            }, 3000);
        }
    }
    
    // Iniciar o processo de digitação
    digitar();
}

// Inicializar o digitador quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoDigitador);
} else {
    initAutoDigitador();
}
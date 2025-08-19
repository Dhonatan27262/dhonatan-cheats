// digitador-automatico.js
// Função principal para inicializar o digitador automático
function initAutoDigitador() {
    // Primeiro, iniciar a seleção do campo de texto
    iniciarSelecaoCampo();
}

// Função para iniciar a seleção do campo de texto
function iniciarSelecaoCampo() {
    alert("✍️ Toque no campo onde deseja digitar o texto.");
    
    const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.removeEventListener('click', handler, true);
        
        const el = e.target;
        if (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            // Após selecionar o campo, mostrar o modal de texto
            mostrarModalTexto(el);
        } else {
            alert("❌ Esse não é um campo válido.");
            // Não recriar o botão flutuante para tentar novamente
        }
    };
    
    document.addEventListener('click', handler, true);
}

// Função para mostrar o modal de texto
function mostrarModalTexto(elementoAlvo) {
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

    // Conteúdo do modal (mesmo código anterior)
    modal.innerHTML = `
        <div style="
            background: white;
            width: 90%;
            max-width: 600px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        ">
            <!-- Conteúdo do modal igual ao original -->
        </div>
    `;

    // Adicionar o modal ao documento
    document.body.appendChild(modal);
    
    // Event listener para o botão cancelar
    modal.querySelector('#digitador-cancelar').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Event listener para o botão iniciar
    modal.querySelector('#digitador-iniciar').addEventListener('click', function() {
        const texto = modal.querySelector('#digitador-texto').value.trim();
        if (!texto) {
            alert('Por favor, insira algum texto antes de continuar.');
            return;
        }
        
        document.body.removeChild(modal);
        iniciarDigitacao(elementoAlvo, texto, 20); // Velocidade padrão
    });
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
    overlay.querySelector('#digitador-cancelar-digitacao').addEventListener('click', function() {
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
            overlay.querySelector('#digitador-progresso-barra').style.width = progresso + '%';
            overlay.querySelector('#digitador-progresso-texto').textContent = Math.round(progresso) + '% concluído';
            
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
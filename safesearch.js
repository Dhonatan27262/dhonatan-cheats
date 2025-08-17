(function() {
    'use strict';

    // Carrega o html2canvas dinamicamente
    function loadHtml2Canvas(callback) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Cria o botão flutuante inicial
    function createFloatingButton() {
        const button = document.createElement('button');
        button.id = 'captureFloatingButton';
        button.textContent = 'Capturar Tela';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #2E7D32);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1rem;
            border-radius: 50px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            font-weight: 600;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
            button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        });
        
        document.body.appendChild(button);
        return button;
    }

    // Cria a interface completa
    function createFullUI() {
        const container = document.createElement('div');
        container.id = 'captureContainer';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #fff;
        `;
        document.body.appendChild(container);

        const card = document.createElement('div');
        card.style.cssText = `
            width: 100%;
            max-width: 800px;
            background: rgba(25, 25, 35, 0.9);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            text-align: center;
        `;
        container.appendChild(card);

        const title = document.createElement('h1');
        title.style.cssText = `
            font-size: 2.5rem;
            margin-bottom: 20px;
            background: linear-gradient(to right, #4facfe, #00f2fe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        `;
        title.textContent = 'Captura de Tela para Gemini';
        card.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.style.cssText = `
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 30px;
            line-height: 1.6;
        `;
        subtitle.textContent = 'Capture qualquer conteúdo da tela e envie diretamente para o Gemini sem precisar de login ou API';
        card.appendChild(subtitle);

        const previewContainer = document.createElement('div');
        previewContainer.id = 'previewContainer';
        previewContainer.style.cssText = `
            margin: 25px 0;
            border-radius: 15px;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.1);
            position: relative;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.2);
        `;
        card.appendChild(previewContainer);

        const placeholder = document.createElement('div');
        placeholder.id = 'placeholder';
        placeholder.style.cssText = `
            text-align: center;
            padding: 30px;
            color: rgba(255, 255, 255, 0.5);
        `;
        previewContainer.appendChild(placeholder);

        const placeholderIcon = document.createElement('div');
        placeholderIcon.style.fontSize = '4rem';
        placeholderIcon.textContent = '🖼️';
        placeholder.appendChild(placeholderIcon);

        const placeholderText = document.createElement('p');
        placeholderText.textContent = 'A imagem capturada aparecerá aqui';
        placeholder.appendChild(placeholderText);

        const loading = document.createElement('div');
        loading.id = 'loading';
        loading.style.cssText = `
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 30px;
        `;
        previewContainer.appendChild(loading);

        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 5px solid #4facfe;
            animation: spin 1s linear infinite;
        `;
        loading.appendChild(spinner);

        const loadingText = document.createElement('p');
        loadingText.textContent = 'Processando captura de tela...';
        loading.appendChild(loadingText);

        const captureBtn = document.createElement('button');
        captureBtn.id = 'captureBtn';
        captureBtn.style.cssText = `
            background: linear-gradient(135deg, #4CAF50, #2E7D32);
            color: white;
            border: none;
            padding: 18px 50px;
            font-size: 1.3rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin: 15px 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        `;
        captureBtn.textContent = 'Capturar Tela Agora';
        card.appendChild(captureBtn);

        const openGeminiBtn = document.createElement('button');
        openGeminiBtn.id = 'openGeminiBtn';
        openGeminiBtn.style.cssText = `
            background: linear-gradient(135deg, #FF9800, #F57C00);
            color: white;
            border: none;
            padding: 18px 50px;
            font-size: 1.3rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            display: none;
            align-items: center;
            gap: 10px;
            margin: 15px auto;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        `;
        openGeminiBtn.textContent = 'Abrir Gemini para Envio';
        card.appendChild(openGeminiBtn);

        const instructions = document.createElement('div');
        instructions.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            padding: 25px;
            margin-top: 25px;
            text-align: left;
        `;
        card.appendChild(instructions);

        const instructionsTitle = document.createElement('h3');
        instructionsTitle.style.cssText = `
            color: #FF9800;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            justify-content: center;
            font-size: 1.4rem;
        `;
        instructionsTitle.innerHTML = 'ℹ️ Instruções de Envio';
        instructions.appendChild(instructionsTitle);

        const steps = document.createElement('div');
        steps.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 15px;
        `;
        instructions.appendChild(steps);

        const step1 = createStep('1', 'Clique na área de entrada de mensagem');
        steps.appendChild(step1);

        const step2 = createStep('2', 'Cole a imagem usando Ctrl+V (Windows) ou Cmd+V (Mac)');
        steps.appendChild(step2);

        const step3 = createStep('3', 'Adicione sua pergunta sobre a imagem se desejar');
        steps.appendChild(step3);

        const footer = document.createElement('div');
        footer.style.cssText = `
            margin-top: 30px;
            text-align: center;
            opacity: 0.7;
            font-size: 0.9rem;
            padding: 10px;
        `;
        footer.textContent = 'Esta ferramenta não requer login ou chaves de API. Basta capturar e colar no Gemini!';
        card.appendChild(footer);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            button:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }
            button:active {
                transform: translateY(1px);
            }
        `;
        document.head.appendChild(style);

        return {
            container,
            previewContainer,
            placeholder,
            loading,
            captureBtn,
            openGeminiBtn
        };
    }

    // Função auxiliar para criar passos
    function createStep(number, text) {
        const step = document.createElement('div');
        step.style.cssText = `
            display: flex;
            gap: 15px;
            align-items: center;
        `;

        const stepNumber = document.createElement('div');
        stepNumber.style.cssText = `
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-weight: bold;
            font-size: 1.2rem;
        `;
        stepNumber.textContent = number;
        step.appendChild(stepNumber);

        const stepContent = document.createElement('div');
        stepContent.style.cssText = `
            line-height: 1.6;
            font-size: 1.1rem;
        `;
        stepContent.textContent = text;
        step.appendChild(stepContent);

        return step;
    }

    // Função para copiar imagem para área de transferência
    async function copyImageToClipboard(dataUrl) {
        try {
            // Converter data URL para blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            // Copiar para área de transferência
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            return true;
        } catch (err) {
            console.error('Erro ao copiar imagem:', err);
            return false;
        }
    }

    // Função para salvar imagem como arquivo
    function saveImage(dataUrl) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'captura-gemini.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Função principal
    function init() {
        // Cria o botão flutuante inicial
        const floatingButton = createFloatingButton();
        let capturedImageData = null;
        
        floatingButton.addEventListener('click', function() {
            // Remove o botão flutuante
            floatingButton.remove();
            
            // Cria a interface completa
            const ui = createFullUI();
            
            // Evento para capturar a tela
            ui.captureBtn.addEventListener('click', async function() {
                ui.placeholder.style.display = 'none';
                ui.loading.style.display = 'flex';
                
                try {
                    const canvas = await html2canvas(document.body, {
                        scale: 0.8,
                        useCORS: true,
                        logging: false,
                        backgroundColor: null
                    });
                    
                    capturedImageData = canvas.toDataURL('image/png');
                    
                    const previewImage = document.createElement('img');
                    previewImage.src = capturedImageData;
                    previewImage.style.cssText = 'max-width: 100%; max-height: 500px;';
                    
                    ui.previewContainer.innerHTML = '';
                    ui.previewContainer.appendChild(previewImage);
                    ui.openGeminiBtn.style.display = 'block';
                    
                } catch (error) {
                    console.error('Erro na captura:', error);
                    alert('Erro ao capturar tela. Tente novamente.');
                } finally {
                    ui.loading.style.display = 'none';
                }
            });
            
            // Evento para abrir o Gemini
            ui.openGeminiBtn.addEventListener('click', async function() {
                if (!capturedImageData) {
                    alert('Capture uma imagem primeiro!');
                    return;
                }
                
                // Tenta copiar para a área de transferência
                const copySuccess = await copyImageToClipboard(capturedImageData);
                
                if (copySuccess) {
                    alert('Imagem copiada! Cole no Gemini com Ctrl+V.');
                } else {
                    alert('Não foi possível copiar automaticamente. A imagem será salva para você enviar manualmente.');
                    saveImage(capturedImageData);
                }
                
                window.open('https://gemini.google.com/app', '_blank');
            });
        });
    }

    // Inicia quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        loadHtml2Canvas(init);
    });
})();
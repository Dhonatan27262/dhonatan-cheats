(function() {
    'use strict';

    // Carrega o html2canvas dinamicamente
    function loadHtml2Canvas(callback) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Cria a interface do usuário
    function createUI() {
        const container = document.createElement('div');
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

    // Função principal
    function init() {
        const ui = createUI();
        let capturedImageData = null;
        
        ui.captureBtn.addEventListener('click', async function() {
            ui.placeholder.style.display = 'none';
            ui.loading.style.display = 'flex';
            
            try {
                const canvas = await html2canvas(document.body, {
                    scale: 0.8,
                    useCORS: true,
                    logging: false
                });
                
                capturedImageData = canvas.toDataURL('image/jpeg', 0.85);
                
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
        
        ui.openGeminiBtn.addEventListener('click', function() {
            if (!capturedImageData) {
                alert('Capture uma imagem primeiro!');
                return;
            }
            
            copyImageToClipboard(capturedImageData);
            window.open('https://gemini.google.com/app', '_blank');
            alert('Imagem copiada! Cole no Gemini com Ctrl+V.');
        });
        
        async function copyImageToClipboard(dataUrl) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
            } catch (err) {
                console.error('Erro ao copiar:', err);
                alert('Falha ao copiar. Você pode salvar a imagem manualmente.');
            }
        }
    }

    // Inicia quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        loadHtml2Canvas(init);
    });
})();
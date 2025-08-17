// ==UserScript==
// @name         Captura de Tela para Gemini
// @version      1.0
// @description  Captura a tela e envia para o Gemini sem API
// @author       Você
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Função para injetar CSS
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            #geminiCaptureBtn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                padding: 12px 24px;
                background: #4285f4;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            #geminiPreviewContainer {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10000;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            #geminiPreviewImg {
                max-width: 90%;
                max-height: 80%;
                border: 2px solid white;
                box-shadow: 0 0 20px rgba(0,0,0,0.5);
            }
            .geminiActionBtn {
                padding: 10px 20px;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin: 0 10px;
                font-size: 14px;
            }
            #geminiSendBtn {
                background: #34a853;
            }
            #geminiCancelBtn {
                background: #ea4335;
            }
            .geminiBtnContainer {
                margin-top: 20px;
                display: flex;
            }
        `;
        document.head.appendChild(style);
    }

    // Função principal para criar a interface
    function setupScreenCapture() {
        // Injetar CSS
        injectCSS();

        // Criar botão de captura
        const captureBtn = document.createElement('button');
        captureBtn.id = 'geminiCaptureBtn';
        captureBtn.textContent = '📸 Capturar Tela para Gemini';
        document.body.appendChild(captureBtn);

        // Criar container de preview
        const previewContainer = document.createElement('div');
        previewContainer.id = 'geminiPreviewContainer';

        const previewImg = document.createElement('img');
        previewImg.id = 'geminiPreviewImg';

        const btnContainer = document.createElement('div');
        btnContainer.className = 'geminiBtnContainer';

        const sendBtn = document.createElement('button');
        sendBtn.id = 'geminiSendBtn';
        sendBtn.className = 'geminiActionBtn';
        sendBtn.textContent = 'Enviar para Gemini';

        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'geminiCancelBtn';
        cancelBtn.className = 'geminiActionBtn';
        cancelBtn.textContent = 'Cancelar';

        btnContainer.appendChild(sendBtn);
        btnContainer.appendChild(cancelBtn);
        previewContainer.appendChild(previewImg);
        previewContainer.appendChild(btnContainer);
        document.body.appendChild(previewContainer);

        // Event Listeners
        captureBtn.addEventListener('click', captureScreen);
        cancelBtn.addEventListener('click', () => {
            previewContainer.style.display = 'none';
        });

        sendBtn.addEventListener('click', () => {
            const imageData = previewImg.src;
            // Aqui você pode adicionar a lógica para enviar para o Gemini
            // Exemplo: window.open(`https://gemini.google.com?image=${encodeURIComponent(imageData)}`);
            alert('Imagem pronta para envio ao Gemini!\n\nDados da imagem (base64):\n' + imageData.substring(0, 100) + '...');
            previewContainer.style.display = 'none';
        });
    }

    // Função para capturar a tela
    async function captureScreen() {
        try {
            // Usando a API nativa do navegador
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false
            });

            const video = document.createElement('video');
            video.style.display = 'none';
            video.srcObject = stream;
            document.body.appendChild(video);

            video.onloadedmetadata = () => {
                video.play();

                // Criar canvas para captura
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Obter imagem
                const imageData = canvas.toDataURL('image/png');

                // Parar a captura
                stream.getTracks().forEach(track => track.stop());
                video.remove();

                // Mostrar preview
                document.getElementById('geminiPreviewImg').src = imageData;
                document.getElementById('geminiPreviewContainer').style.display = 'flex';
            };
        } catch (error) {
            console.error('Erro na captura:', error);
            alert('Captura cancelada ou falhou: ' + error.message);
        }
    }

    // Iniciar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupScreenCapture);
    } else {
        setupScreenCapture();
    }
})();
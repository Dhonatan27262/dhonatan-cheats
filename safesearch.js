// ==UserScript==
// @name         Captura de Tela para Gemini
// @version      1.2
// @description  Captura a tela usando html2canvas
// @author       Você
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
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

    // Função principal
    function setupScreenCapture() {
        injectCSS();

        // Criar elementos
        const captureBtn = document.createElement('button');
        captureBtn.id = 'geminiCaptureBtn';
        captureBtn.textContent = '📸 Capturar Tela para Gemini';
        document.body.appendChild(captureBtn);

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

        // Eventos
        captureBtn.addEventListener('click', captureScreen);
        cancelBtn.addEventListener('click', () => previewContainer.style.display = 'none');
        sendBtn.addEventListener('click', () => {
            const imageData = previewImg.src;
            // Aqui você pode enviar para o Gemini
            alert('Imagem capturada com sucesso! Cole no Gemini:');
            prompt('Copie os dados da imagem:', imageData);
            previewContainer.style.display = 'none';
        });
    }

    // Função de captura com html2canvas
    async function captureScreen() {
        try {
            const previewImg = document.getElementById('geminiPreviewImg');
            previewImg.src = '';
            
            // Capturar toda a página
            html2canvas(document.body, {
                scale: 0.8,
                useCORS: true,
                allowTaint: true,
                logging: false
            }).then(canvas => {
                const imageData = canvas.toDataURL('image/png');
                previewImg.src = imageData;
                document.getElementById('geminiPreviewContainer').style.display = 'flex';
            });
            
        } catch (error) {
            console.error('Erro na captura:', error);
            alert('Erro na captura: ' + error.message);
        }
    }

    // Iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupScreenCapture);
    } else {
        setupScreenCapture();
    }
})();
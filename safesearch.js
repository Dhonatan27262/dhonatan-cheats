// ==UserScript==
// @name         Captura de Tela para Gemini
// @version      1.4
// @description  Captura a tela usando a API de Clipboard
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
            #geminiClipboardAlert {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #34a853;
                color: white;
                padding: 15px;
                border-radius: 4px;
                z-index: 10000;
                display: none;
                max-width: 90%;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    // Função principal
    function setupScreenCapture() {
        injectCSS();

        // Criar botão de captura
        const captureBtn = document.createElement('button');
        captureBtn.id = 'geminiCaptureBtn';
        captureBtn.textContent = '📸 Capturar para Gemini';
        document.body.appendChild(captureBtn);

        // Criar alerta de clipboard
        const clipboardAlert = document.createElement('div');
        clipboardAlert.id = 'geminiClipboardAlert';
        clipboardAlert.textContent = 'Captura copiada para a área de transferência! Cole no Gemini.';
        document.body.appendChild(clipboardAlert);

        // Evento de captura
        captureBtn.addEventListener('click', async () => {
            try {
                // Solicitar permissão de clipboard
                const permission = await navigator.permissions.query({
                    name: 'clipboard-write'
                });
                
                if (permission.state === 'granted' || permission.state === 'prompt') {
                    // Copiar a URL da página e conteúdo como texto formatado
                    await copyPageToClipboard();
                    showAlert();
                } else {
                    alert('Permissão para área de transferência negada. Por favor, permita o acesso.');
                }
            } catch (error) {
                console.error('Erro na captura:', error);
                alert('Seu navegador não suporta esta função. Tente no Chrome ou Edge.');
            }
        });
    }

    // Função para copiar conteúdo da página para clipboard
    async function copyPageToClipboard() {
        const htmlContent = `
            <div style="border:2px solid #4285f4;padding:20px;border-radius:8px;max-width:800px;margin:0 auto">
                <h1 style="color:#1a73e8">Captura da Página: ${document.title}</h1>
                <p style="color:#5f6368">URL: ${window.location.href}</p>
                <p style="color:#5f6368">Data: ${new Date().toLocaleString()}</p>
                <hr style="margin:20px 0">
                <div style="background:#f8f9fa;padding:20px;border-radius:8px">
                    ${document.body.innerHTML}
                </div>
            </div>
        `;

        // Criar um blob HTML
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({
            'text/html': blob,
            'text/plain': new Blob([`Página: ${document.title}\nURL: ${window.location.href}\nConteúdo:\n${document.body.innerText}`], { type: 'text/plain' })
        });

        // Escrever no clipboard
        await navigator.clipboard.write([clipboardItem]);
    }

    // Mostrar alerta de sucesso
    function showAlert() {
        const alert = document.getElementById('geminiClipboardAlert');
        alert.style.display = 'block';
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }

    // Iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupScreenCapture);
    } else {
        setupScreenCapture();
    }
})();
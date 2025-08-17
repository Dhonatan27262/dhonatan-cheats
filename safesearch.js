// ==UserScript==
// @name         Captura Inteligente para Gemini/Perplexity
// @version      3.0
// @description  Captura conteúdo e envia diretamente para ferramentas de IA
// @author       Você
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Configurações
    const config = {
        maxContentLength: 5000, // Limite de caracteres para envio direto
        perplexityURL: 'https://www.perplexity.ai/search' // URL do Perplexity
    };

    // Função para criar elementos
    function createElement(tag, id, styles, text) {
        const el = document.createElement(tag);
        if (id) el.id = id;
        if (text) el.textContent = text;
        if (styles) Object.assign(el.style, styles);
        return el;
    }

    // Criar botão principal
    function createCaptureButton() {
        return createElement('button', 'smartCaptureBtn', {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '9999',
            padding: '12px 24px',
            background: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            fontFamily: 'Arial, sans-serif'
        }, '📸 Capturar Conteúdo');
    }

    // Criar área de preview
    function createPreviewArea() {
        const previewArea = createElement('div', 'smartPreviewArea', {
            display: 'none',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '800px',
            height: '80%',
            background: 'white',
            zIndex: '10000',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            padding: '20px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            flexDirection: 'column'
        });

        // Área de conteúdo
        const contentArea = createElement('div', 'smartContentArea', {
            flex: '1',
            overflow: 'auto',
            border: '1px solid #ddd',
            padding: '15px',
            marginBottom: '15px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.4',
            backgroundColor: '#f9f9f9'
        });

        // Botões de ação
        const buttonContainer = createElement('div', null, {
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px'
        });

        const copyBtn = createElement('button', null, {
            flex: '1',
            padding: '10px',
            background: '#34a853',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
        }, 'Copiar para Área de Transferência');

        const perplexityBtn = createElement('button', null, {
            flex: '1',
            padding: '10px',
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
        }, 'Enviar para Perplexity');

        const closeBtn = createElement('button', null, {
            padding: '10px',
            background: '#ea4335',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
        }, 'Fechar');

        // Montar estrutura
        buttonContainer.appendChild(copyBtn);
        buttonContainer.appendChild(perplexityBtn);
        previewArea.appendChild(contentArea);
        previewArea.appendChild(buttonContainer);
        previewArea.appendChild(closeBtn);

        return previewArea;
    }

    // Função principal
    function initSmartCapture() {
        // Adicionar elementos ao DOM
        const captureBtn = createCaptureButton();
        const previewArea = createPreviewArea();
        document.body.appendChild(captureBtn);
        document.body.appendChild(previewArea);
        
        // Evento de captura
        captureBtn.addEventListener('click', () => {
            const capturedContent = captureVisibleContent();
            document.getElementById('smartContentArea').textContent = capturedContent;
            document.getElementById('smartPreviewArea').style.display = 'flex';
        });
        
        // Evento de fechar
        previewArea.querySelectorAll('button')[2].addEventListener('click', () => {
            previewArea.style.display = 'none';
        });
        
        // Evento de copiar
        previewArea.querySelectorAll('button')[0].addEventListener('click', () => {
            const content = document.getElementById('smartContentArea').textContent;
            copyToClipboard(content);
            showNotification('✅ Conteúdo copiado para a área de transferência!');
        });
        
        // Evento de enviar para Perplexity
        previewArea.querySelectorAll('button')[1].addEventListener('click', () => {
            const content = document.getElementById('smartContentArea').textContent;
            sendToPerplexity(content);
        });
    }
    
    // Função para capturar conteúdo visível
    function captureVisibleContent() {
        let content = '';
        
        // Capturar título da página
        if (document.title) {
            content += `# ${document.title}\n\n`;
        }
        
        // Capturar URL
        content += `**URL:** ${window.location.href}\n\n`;
        
        // Capturar cabeçalhos
        const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headers.forEach(header => {
            if (isVisible(header)) {
                content += `${'#'.repeat(parseInt(header.tagName[1]))} ${header.textContent}\n\n`;
            }
        });
        
        // Capturar parágrafos
        const paragraphs = document.querySelectorAll('p');
        paragraphs.forEach(p => {
            if (isVisible(p) && p.textContent.trim().length > 20) {
                content += `${p.textContent}\n\n`;
            }
        });
        
        // Capturar listas
        const lists = document.querySelectorAll('ul, ol');
        lists.forEach(list => {
            if (isVisible(list)) {
                const items = list.querySelectorAll('li');
                items.forEach((item, index) => {
                    if (isVisible(item)) {
                        const prefix = list.tagName === 'UL' ? '- ' : `${index + 1}. `;
                        content += `${prefix}${item.textContent}\n`;
                    }
                });
                content += '\n';
            }
        });
        
        // Capturar tabelas
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (isVisible(table)) {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    if (isVisible(row)) {
                        const cols = row.querySelectorAll('td, th');
                        const rowContent = Array.from(cols)
                            .filter(col => isVisible(col))
                            .map(col => col.textContent.trim())
                            .join(' | ');
                        
                        if (rowContent) {
                            content += `| ${rowContent} |\n`;
                        }
                    }
                });
                content += '\n';
            }
        });
        
        // Reduzir conteúdo se for muito longo
        if (content.length > config.maxContentLength) {
            content = content.substring(0, config.maxContentLength) + 
                '\n\n... [Conteúdo truncado devido ao tamanho]';
        }
        
        return content;
    }
    
    // Verificar se elemento é visível
    function isVisible(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || 
            style.visibility === 'hidden' || 
            style.opacity === '0' ||
            element.offsetWidth === 0 ||
            element.offsetHeight === 0) {
            return false;
        }
        
        return true;
    }
    
    // Função para copiar para área de transferência
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (!successful) {
                showNotification('❌ Falha ao copiar. Tente manualmente (Ctrl+C).');
            }
        } catch (err) {
            showNotification('❌ Erro ao copiar: ' + err.message);
        }
        
        document.body.removeChild(textarea);
    }
    
    // Função para enviar para Perplexity
    function sendToPerplexity(content) {
        try {
            // Reduzir conteúdo para caber na URL
            let query = content;
            if (query.length > 1500) {
                query = query.substring(0, 1500) + '...';
            }
            
            // Codificar e criar URL
            const encodedQuery = encodeURIComponent(query);
            const perplexityURL = `${config.perplexityURL}?q=${encodedQuery}`;
            
            // Abrir em nova aba
            window.open(perplexityURL, '_blank');
            showNotification('🚀 Enviando para Perplexity...');
        } catch (error) {
            showNotification(`❌ Erro ao abrir Perplexity: ${error.message}`);
        }
    }
    
    // Mostrar notificação
    function showNotification(message) {
        // Remover notificação anterior se existir
        const oldNotification = document.getElementById('smartNotification');
        if (oldNotification) oldNotification.remove();
        
        // Criar nova notificação
        const notification = createElement('div', 'smartNotification', {
            position: 'fixed',
            bottom: '70px',
            right: '20px',
            zIndex: '10001',
            padding: '12px 24px',
            background: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'default',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontFamily: 'Arial, sans-serif',
            animation: 'fadeInOut 3s forwards'
        }, message);
        
        // Adicionar animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(10px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(10px); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Iniciar quando o documento estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSmartCapture);
    } else {
        initSmartCapture();
    }
})();
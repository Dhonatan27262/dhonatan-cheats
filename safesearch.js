// ==UserScript==
// @name         Captura de Tela para Gemini
// @version      2.0
// @description  Captura conteúdo da tela como texto para Gemini
// @author       Você
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Função para criar botão
    function createCaptureButton() {
        const btn = document.createElement('button');
        btn.id = 'geminiScreenCaptureBtn';
        btn.textContent = '📸 Capturar para Gemini';
        btn.style.cssText = `
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
            font-family: Arial, sans-serif;
        `;
        return btn;
    }

    // Função para criar área de preview
    function createPreviewArea() {
        const preview = document.createElement('div');
        preview.id = 'geminiPreviewArea';
        preview.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            height: 80%;
            background: white;
            z-index: 10000;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            padding: 20px;
            box-sizing: border-box;
            overflow: auto;
        `;
        
        const content = document.createElement('div');
        content.id = 'geminiCapturedContent';
        content.style.cssText = `
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.4;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fechar';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 8px 16px;
            background: #ea4335;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copiar para Área de Transferência';
        copyBtn.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            background: #34a853;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        
        preview.appendChild(closeBtn);
        preview.appendChild(content);
        preview.appendChild(copyBtn);
        
        return preview;
    }

    // Função principal
    function initScreenCapture() {
        // Adicionar elementos ao DOM
        const captureBtn = createCaptureButton();
        const previewArea = createPreviewArea();
        document.body.appendChild(captureBtn);
        document.body.appendChild(previewArea);
        
        // Evento de captura
        captureBtn.addEventListener('click', () => {
            const capturedContent = captureVisibleContent();
            document.getElementById('geminiCapturedContent').textContent = capturedContent;
            document.getElementById('geminiPreviewArea').style.display = 'block';
        });
        
        // Evento de fechar
        previewArea.querySelector('button').addEventListener('click', () => {
            previewArea.style.display = 'none';
        });
        
        // Evento de copiar
        previewArea.querySelectorAll('button')[1].addEventListener('click', () => {
            const content = document.getElementById('geminiCapturedContent').textContent;
            copyToClipboard(content);
            alert('Conteúdo copiado para a área de transferência! Agora cole no Gemini.');
        });
    }
    
    // Função para capturar conteúdo visível
    function captureVisibleContent() {
        let content = '';
        
        // Capturar cabeçalhos
        const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headers.forEach(header => {
            content += `${'#'.repeat(parseInt(header.tagName[1]))} ${header.textContent}\n\n`;
        });
        
        // Capturar parágrafos
        const paragraphs = document.querySelectorAll('p');
        paragraphs.forEach(p => {
            content += `${p.textContent}\n\n`;
        });
        
        // Capturar listas
        const lists = document.querySelectorAll('ul, ol');
        lists.forEach(list => {
            const items = list.querySelectorAll('li');
            items.forEach((item, index) => {
                const prefix = list.tagName === 'UL' ? '- ' : `${index + 1}. `;
                content += `${prefix}${item.textContent}\n`;
            });
            content += '\n';
        });
        
        // Capturar tabelas
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const cols = row.querySelectorAll('td, th');
                const rowContent = Array.from(cols).map(col => col.textContent).join(' | ');
                content += `| ${rowContent} |\n`;
            });
            content += '\n';
        });
        
        // Capturar links importantes
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (link.textContent.trim() && link.href) {
                content += `[${link.textContent}](${link.href})\n`;
            }
        });
        
        return content;
    }
    
    // Função para copiar para área de transferência
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // Iniciar quando o documento estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScreenCapture);
    } else {
        initScreenCapture();
    }
})();
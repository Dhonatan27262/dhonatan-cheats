// ==UserScript==
// @name         SANTOS.meczada - Busca Inteligente Automática
// @namespace    http://tampermonkey.net/
// @version      7.2
// @description  Sistema automático para captura e envio de conteúdo
// @author       SeuNome
// @match        *://*/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
// @icon         https://i.imgur.com/7YbX5Jx.png
// ==/UserScript==

(function() {
    'use strict';

    // =============================
    // CONFIGURAÇÕES
    // =============================
    const config = {
        updateInterval: 2000, // Verificar mudanças a cada 2 segundos
        maxContentLength: 3000,
        maxPreviewLength: 800
    };

    // =============================
    // SISTEMA DE CAPTURA DE CONTEÚDO
    // =============================
    let lastCapturedContent = '';
    let lastDOMState = '';
    let observer = null;

    const capturarConteudoVisivel = () => {
        let content = '';
        
        // 1. Capturar título da página
        if (document.title) {
            content += `# ${document.title}\n\n`;
        }
        
        // 2. Capturar URL
        content += `**URL:** ${window.location.href}\n\n`;
        
        // 3. Capturar cabeçalhos visíveis
        const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headers.forEach(header => {
            if (isVisible(header)) {
                content += `${'#'.repeat(parseInt(header.tagName[1]))} ${header.textContent}\n\n`;
            }
        });
        
        // 4. Capturar parágrafos visíveis
        const paragraphs = document.querySelectorAll('p');
        paragraphs.forEach(p => {
            if (isVisible(p) && p.textContent.trim().length > 20) {
                content += `${p.textContent}\n\n`;
            }
        });
        
        // 5. Capturar listas visíveis
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
        
        // 6. Limitar tamanho do conteúdo
        if (content.length > config.maxContentLength) {
            content = content.substring(0, config.maxContentLength) + 
                '\n\n... [Conteúdo truncado devido ao tamanho]';
        }
        
        return content;
    };

    const isVisible = (element) => {
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
    };

    // Verificar se o conteúdo mudou
    const verificarMudancas = () => {
        const currentDOMState = document.body.innerHTML;
        if (currentDOMState !== lastDOMState) {
            lastDOMState = currentDOMState;
            const newContent = capturarConteudoVisivel();
            
            if (newContent !== lastCapturedContent) {
                lastCapturedContent = newContent;
                atualizarPreview(newContent);
                return true;
            }
        }
        return false;
    };

    // =============================
    // INTERFACE DO USUÁRIO
    // =============================
    const criarInterface = () => {
        // Remover interface existente
        const existingUI = document.getElementById('assistente-enem-ui');
        if (existingUI) existingUI.remove();
        
        // Criar container principal
        const ui = document.createElement('div');
        ui.id = 'assistente-enem-ui';
        ui.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: linear-gradient(135deg, #1a2980, #26d0ce);
            color: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            padding: 15px;
            width: 350px;
            font-family: 'Segoe UI', Arial, sans-serif;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
        `;
        
        // HTML da interface
        ui.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-graduation-cap"></i> SANTOS.meczada
                    <span id="auto-update-indicator" style="font-size: 12px; background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 10px; margin-left: 8px;">
                        <i class="fas fa-sync-alt fa-spin"></i> Auto
                    </span>
                </h3>
                <div>
                    <button id="minimizar-menu" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                        margin-right: 5px;
                    "><i class="fas fa-minus"></i></button>
                    <button id="fechar-menu" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                    ">×</button>
                </div>
            </div>
            
            <div id="conteudo-menu" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <div id="preview-area" style="
                    flex: 1;
                    overflow: auto;
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 12px;
                    font-size: 13px;
                    line-height: 1.5;
                    white-space: pre-wrap;
                    font-family: monospace;
                    max-height: 300px;
                ">
                    <div style="text-align: center; padding: 30px 0; color: rgba(255,255,255,0.7);">
                        <i class="fas fa-sync-alt fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                        <p>Monitorando conteúdo da página...</p>
                    </div>
                </div>
                
                <button id="enviar-perplexity" style="
                    padding: 12px;
                    background: #9c27b0;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                    margin-bottom: 12px;
                ">
                    <i class="fas fa-paper-plane" style="margin-right: 6px;"></i>
                    Enviar para Perplexity
                </button>
                
                <div id="status" style="
                    font-size: 13px;
                    text-align: center;
                    padding: 10px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                    min-height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <i class="fas fa-check-circle" style="margin-right: 5px;"></i>
                    Monitorando alterações na página
                </div>
            </div>
            
            <div id="menu-minimizado" style="display: none; text-align: center; padding: 10px 0;">
                <button id="expandir-menu" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    font-size: 20px;
                ">
                    <i class="fas fa-expand"></i>
                </button>
                <div style="font-size: 10px; margin-top: 5px; opacity: 0.7;">Auto</div>
            </div>
        `;
        
        document.body.appendChild(ui);
        
        // =====================
        // INICIALIZAR SISTEMA
        // =====================
        lastDOMState = document.body.innerHTML;
        lastCapturedContent = capturarConteudoVisivel();
        atualizarPreview(lastCapturedContent);
        
        // Iniciar observador
        iniciarMonitoramento();
        
        // =====================
        // EVENTOS DA INTERFACE
        // =====================
        // Enviar para Perplexity
        document.getElementById('enviar-perplexity').addEventListener('click', () => {
            // Reduzir conteúdo para caber na URL
            let query = lastCapturedContent;
            if (query.length > 1500) {
                query = query.substring(0, 1500) + '...';
            }
            
            // Codificar e criar URL
            const encodedQuery = encodeURIComponent(query);
            const perplexityURL = `https://www.perplexity.ai/search?q=${encodedQuery}`;
            
            // Abrir em nova aba
            window.open(perplexityURL, '_blank');
            mostrarNotificacao('<i class="fas fa-paper-plane"></i> Enviado para Perplexity!');
        });
        
        // Fechar menu
        document.getElementById('fechar-menu').addEventListener('click', () => {
            ui.style.display = 'none';
            pararMonitoramento();
        });
        
        // Minimizar menu
        document.getElementById('minimizar-menu').addEventListener('click', () => {
            document.getElementById('conteudo-menu').style.display = 'none';
            document.getElementById('menu-minimizado').style.display = 'block';
            ui.style.width = '70px';
            ui.style.padding = '10px';
            pararMonitoramento();
        });
        
        // Expandir menu
        document.getElementById('expandir-menu').addEventListener('click', () => {
            document.getElementById('conteudo-menu').style.display = 'flex';
            document.getElementById('menu-minimizado').style.display = 'none';
            ui.style.width = '350px';
            ui.style.padding = '15px';
            iniciarMonitoramento();
            verificarMudancas(); // Forçar atualização imediata
        });
        
        // =====================
        // ARRASTAR A INTERFACE
        // =====================
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const header = ui.querySelector('h3');
        header.style.cursor = 'move';
        
        header.addEventListener('mousedown', dragMouseDown);
        
        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
        }
        
        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            ui.style.top = (ui.offsetTop - pos2) + "px";
            ui.style.left = (ui.offsetLeft - pos1) + "px";
        }
        
        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
        }
    };

    // =============================
    // SISTEMA DE MONITORAMENTO
    // =============================
    const iniciarMonitoramento = () => {
        pararMonitoramento();
        
        // Atualizar indicador de status
        document.getElementById('auto-update-indicator').innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Auto';
        document.getElementById('status').innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Monitorando alterações na página';
        
        // Verificar mudanças periodicamente
        observer = setInterval(() => {
            const mudou = verificarMudancas();
            if (mudou) {
                document.getElementById('status').innerHTML = '<i class="fas fa-check-circle"></i> Conteúdo atualizado!';
            }
        }, config.updateInterval);
    };

    const pararMonitoramento = () => {
        if (observer) {
            clearInterval(observer);
            observer = null;
        }
        document.getElementById('auto-update-indicator').innerHTML = '<i class="fas fa-pause"></i> Pausado';
    };

    // =============================
    // FUNÇÕES AUXILIARES
    // =============================
    const atualizarPreview = (content) => {
        const previewArea = document.getElementById('preview-area');
        
        // Formatar conteúdo para visualização
        let previewContent = content;
        if (previewContent.length > config.maxPreviewLength) {
            previewContent = previewContent.substring(0, config.maxPreviewLength) + '...';
        }
        
        // Destacar elementos importantes
        previewContent = previewContent
            .replace(/(#+\s.+)/g, '<span style="color: #ffcc00; font-weight: bold;">$1</span>')
            .replace(/(\*\*.+?\*\*)/g, '<span style="color: #4fc3f7;">$1</span>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color: #80deea; word-break: break-all;" target="_blank">$1</a>');
        
        previewArea.innerHTML = `
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #ffcc00;">Conteúdo Monitorado:</strong>
                <span style="font-size: 11px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px;">
                    ${new Date().toLocaleTimeString()}
                </span>
            </div>
            <div style="line-height: 1.6; max-height: 250px; overflow: auto;">
                ${previewContent}
            </div>
        `;
    };

    const mostrarNotificacao = (mensagem) => {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            z-index: 1000000;
            padding: 15px 25px;
            background: rgba(0,0,0,0.8);
            color: white;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2);
            animation: fadeInOut 2s ease-in-out;
        `;
        notification.innerHTML = mensagem;
        document.body.appendChild(notification);
        
        // Adicionar animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(20px); }
                20% { opacity: 1; transform: translateY(0); }
                80% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(20px); }
            }
        `;
        document.head.appendChild(style);
        
        // Remover após animação
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 2000);
    };

    // =====================
    // INICIALIZAÇÃO
    // =====================
    const init = () => {
        // Carregar Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(link);
        }
        
        // Criar interface
        criarInterface();
    };

    // Aguardar o carregamento da página
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    console.log('SANTOS.meczada v7.2 - Modo Automático carregado!');
})();
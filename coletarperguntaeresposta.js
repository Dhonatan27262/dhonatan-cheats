// ==UserScript==
// @name         SANTOS.meczada - Busca Inteligente
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Sistema otimizado para captura e envio de conteúdo
// @author       SeuNome
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
// @icon         https://i.imgur.com/7YbX5Jx.png
// ==/UserScript==

(function() {
    'use strict';

    // =============================
    // SISTEMA DE CAPTURA DE CONTEÚDO (APRIMORADO)
    // =============================
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
        
        // 6. Capturar tabelas visíveis
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
        
        // 7. Limitar tamanho do conteúdo
        const maxContentLength = 3000;
        if (content.length > maxContentLength) {
            content = content.substring(0, maxContentLength) + 
                '\n\n... [Conteúdo truncado devido ao tamanho]';
        }
        
        return content;
    };

    // Verificar se elemento é visível
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

    // =============================
    // INTERFACE DO USUÁRIO (APRIMORADA)
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
            width: 300px;
            font-family: 'Segoe UI', Arial, sans-serif;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
        `;
        
        // HTML da interface
        ui.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-graduation-cap"></i> SANTOS.meczada
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
            
            <div id="conteudo-menu">
                <button id="capturar-conteudo" style="
                    width: 100%;
                    padding: 14px;
                    background: white;
                    border: none;
                    border-radius: 10px;
                    color: #1a2980;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    font-size: 16px;
                    transition: all 0.3s;
                    margin-bottom: 12px;
                ">
                    <i class="fas fa-camera" style="margin-right: 10px;"></i>
                    Capturar Conteúdo
                </button>
                
                <div id="botoes-avancados" style="display: none; gap: 8px; margin-bottom: 12px;">
                    <button id="copiar-conteudo" style="
                        flex: 1;
                        padding: 10px;
                        background: #34a853;
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <i class="fas fa-copy" style="margin-right: 6px;"></i>
                        Copiar
                    </button>
                    
                    <button id="enviar-perplexity" style="
                        flex: 1;
                        padding: 10px;
                        background: #9c27b0;
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <i class="fas fa-paper-plane" style="margin-right: 6px;"></i>
                        Perplexity
                    </button>
                </div>
                
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
                    Pronto para usar
                </div>
            </div>
            
            <div id="menu-minimizado" style="display: none; text-align: center;">
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
            </div>
        `;
        
        document.body.appendChild(ui);
        
        // =====================
        // EVENTOS DA INTERFACE
        // =====================
        let capturedContent = '';
        
        // Botão de captura principal
        document.getElementById('capturar-conteudo').addEventListener('click', () => {
            capturedContent = capturarConteudoVisivel();
            
            if (capturedContent.length < 50) {
                atualizarStatus('<i class="fas fa-exclamation-triangle"></i> Conteúdo insuficiente encontrado', 'error');
                return;
            }
            
            document.getElementById('botoes-avancados').style.display = 'flex';
            atualizarStatus('<i class="fas fa-check-circle"></i> Conteúdo capturado com sucesso!');
            
            // Efeito visual
            const btn = document.getElementById('capturar-conteudo');
            btn.style.transform = 'translateY(-3px)';
            btn.style.boxShadow = '0 7px 15px rgba(0,0,0,0.3)';
            setTimeout(() => {
                btn.style.transform = 'none';
                btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }, 300);
        });
        
        // Copiar conteúdo
        document.getElementById('copiar-conteudo').addEventListener('click', () => {
            GM_setClipboard(capturedContent, 'text');
            atualizarStatus('<i class="fas fa-clipboard-check"></i> Conteúdo copiado!', 'success');
        });
        
        // Enviar para Perplexity
        document.getElementById('enviar-perplexity').addEventListener('click', () => {
            // Reduzir conteúdo para caber na URL
            let query = capturedContent;
            if (query.length > 1500) {
                query = query.substring(0, 1500) + '...';
            }
            
            // Codificar e criar URL
            const encodedQuery = encodeURIComponent(query);
            const perplexityURL = `https://www.perplexity.ai/search?q=${encodedQuery}`;
            
            // Abrir em nova aba
            window.open(perplexityURL, '_blank');
            atualizarStatus('<i class="fas fa-paper-plane"></i> Enviado para Perplexity!', 'success');
        });
        
        // Fechar menu
        document.getElementById('fechar-menu').addEventListener('click', () => {
            ui.style.display = 'none';
        });
        
        // Minimizar menu
        document.getElementById('minimizar-menu').addEventListener('click', () => {
            document.getElementById('conteudo-menu').style.display = 'none';
            document.getElementById('menu-minimizado').style.display = 'block';
            ui.style.width = '60px';
            ui.style.padding = '10px';
        });
        
        // Expandir menu
        document.getElementById('expandir-menu').addEventListener('click', () => {
            document.getElementById('conteudo-menu').style.display = 'block';
            document.getElementById('menu-minimizado').style.display = 'none';
            ui.style.width = '300px';
            ui.style.padding = '15px';
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

    // Atualizar status da interface
    const atualizarStatus = (mensagem, tipo = 'info') => {
        const statusElement = document.getElementById('status');
        statusElement.innerHTML = mensagem;
        
        // Resetar estilos
        statusElement.style.background = 'rgba(0,0,0,0.2)';
        statusElement.style.color = 'white';
        
        if (tipo === 'error') {
            statusElement.style.background = 'rgba(217, 48, 37, 0.6)';
        } else if (tipo === 'success') {
            statusElement.style.background = 'rgba(52, 168, 83, 0.6)';
        }
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
        
        // Mensagem inicial
        atualizarStatus('<i class="fas fa-check-circle"></i> Pronto para capturar conteúdo');
    };

    // Aguardar o carregamento da página
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    // Depuração
    console.log('SANTOS.meczada v6.0 carregado com sucesso!');
})();
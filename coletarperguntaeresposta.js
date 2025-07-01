// ==UserScript==
// @name         Assistente ENEM - Toda Matéria (Premium)
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Busca automática de respostas com menu arrastável e botão de fechar
// @author       SeuNome
// @match        *://www.todamateria.com.br/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=todamateria.com.br
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Estilos CSS para o menu
    const css = `
        #assistente-enem-menu {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
            color: white;
            padding: 12px 15px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
            font-family: 'Segoe UI', Arial, sans-serif;
            max-width: 280px;
            min-width: 250px;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.3);
            cursor: move;
            transition: transform 0.3s ease, opacity 0.3s ease;
            transform: scale(0.95);
            opacity: 0.95;
        }
        
        #assistente-enem-menu:hover {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        #assistente-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        
        #assistente-menu-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            font-weight: 600;
        }
        
        #assistente-menu-close {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        
        #assistente-menu-close:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.1);
        }
        
        #assistente-menu-content {
            font-size: 13px;
            line-height: 1.5;
            margin-bottom: 12px;
        }
        
        #buscar-resposta-btn {
            background: white;
            color: #1a2980;
            border: none;
            padding: 8px 15px;
            width: 100%;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 3px 8px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        #buscar-resposta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 12px rgba(0,0,0,0.3);
            background: #f0f8ff;
        }
        
        #assistente-reopen-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
            font-size: 18px;
        }
        
        .drag-handle {
            cursor: move;
            opacity: 0.7;
            font-size: 14px;
            margin-right: 5px;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Função para coletar todo o texto relevante da questão
    const coletarTextoQuestao = () => {
        // Identificar container principal
        const containers = [
            '.article-content', 
            '.entry-content', 
            '.post-content',
            '.question-container',
            '.exercicio',
            '.td-post-content',
            '#content'
        ];
        
        let container = null;
        for (const selector of containers) {
            container = document.querySelector(selector);
            if (container) break;
        }
        
        container = container || document.body;
        
        // Clonar e limpar o conteúdo
        const clone = container.cloneNode(true);
        clone.querySelectorAll('script, style, iframe, img, button, .ads, .comments, .td-post-sharing').forEach(el => el.remove());
        
        // Extrair texto com foco na pergunta
        let texto = clone.innerText
            .replace(/\s+/g, ' ')
            .trim();
        
        // Encontrar o início da pergunta
        const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const heading of headings) {
            const headingText = heading.innerText.trim();
            if (headingText && texto.includes(headingText)) {
                const startIndex = texto.indexOf(headingText);
                texto = texto.substring(startIndex);
                break;
            }
        }
        
        // Limitar tamanho
        return texto.substring(0, 1500);
    };

    const buscarResposta = () => {
        const textoQuestao = coletarTextoQuestao();
        
        if (!textoQuestao || textoQuestao.length < 30) {
            alert('❌ Não foi possível identificar o conteúdo da questão.');
            return;
        }

        const urlPesquisa = `https://www.perplexity.ai/search?q=${encodeURIComponent(textoQuestao)}`;
        window.open(urlPesquisa, '_blank');
    };

    // Variáveis para arrastar
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    const criarMenuFlutuante = () => {
        // Remover menu existente se houver
        const existingMenu = document.getElementById('assistente-enem-menu');
        if (existingMenu) existingMenu.remove();
        
        // Remover botão de reabertura
        const reopenBtn = document.getElementById('assistente-reopen-btn');
        if (reopenBtn) reopenBtn.remove();

        // Criar novo menu
        const menu = document.createElement('div');
        menu.id = 'assistente-enem-menu';
        menu.innerHTML = `
            <div id="assistente-menu-header">
                <div id="assistente-menu-title">
                    <span class="drag-handle">≡</span>
                    <span>Assistente ENEM</span>
                </div>
                <button id="assistente-menu-close">×</button>
            </div>
            <div id="assistente-menu-content">
                Clique para buscar resposta com o texto completo da questão
            </div>
            <button id="buscar-resposta-btn">
                <i class="fas fa-search"></i> Buscar Resposta
            </button>
        `;

        document.body.appendChild(menu);
        
        // Adicionar Font Awesome (se necessário)
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }
        
        // Evento para botão de fechar
        const closeButton = menu.querySelector('#assistente-menu-close');
        closeButton.addEventListener('click', () => {
            menu.style.display = 'none';
            
            // Criar botão para reabrir
            const reopenButton = document.createElement('div');
            reopenButton.id = 'assistente-reopen-btn';
            reopenButton.innerHTML = '<i class="fas fa-question"></i>';
            reopenButton.addEventListener('click', () => {
                menu.style.display = 'block';
                reopenButton.remove();
            });
            
            document.body.appendChild(reopenButton);
        });
        
        // Evento para botão de busca
        menu.querySelector('#buscar-resposta-btn').addEventListener('click', buscarResposta);
        
        // Tornar arrastável
        const header = menu.querySelector("#assistente-menu-header");
        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // Obter posição inicial do mouse
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // Calcular nova posição
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Definir nova posição
            menu.style.top = (menu.offsetTop - pos2) + "px";
            menu.style.left = (menu.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    };

    // Iniciar quando o DOM estiver pronto
    const init = () => {
        criarMenuFlutuante();
        
        // Adicionar efeito de entrada
        const menu = document.getElementById('assistente-enem-menu');
        setTimeout(() => {
            menu.style.transform = 'scale(1)';
            menu.style.opacity = '1';
        }, 100);
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 1500);
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
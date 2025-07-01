// ==UserScript==
// @name         Assistente ENEM - Toda Matéria (Solução Definitiva)
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  Sistema inteligente de detecção de questões
// @author       SeuNome
// @match        *://www.todamateria.com.br/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=todamateria.com.br
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
// ==/UserScript==

(function() {
    'use strict';

    // Estilos CSS otimizados
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
            width: 280px;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.3);
            cursor: move;
            transition: all 0.3s ease;
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
            transition: all 0.2s;
        }
        
        #buscar-resposta-btn {
            background: white;
            color: #1a2980;
            border: none;
            padding: 10px;
            width: 100%;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 3px 8px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 10px;
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
        
        .status-indicator {
            font-size: 12px;
            margin-top: 8px;
            text-align: center;
            opacity: 0.8;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Sistema de detecção de questões
    const detectarQuestao = () => {
        // 1. Tentar encontrar por classe específica do Toda Matéria
        const container = document.querySelector('.td-post-content, .entry-content, .post-content, .question-container') || document.body;
        
        // 2. Detecção de perguntas
        const perguntaSelectors = [
            '.enem-question', 
            '.question-text',
            '.exercicio',
            'h1:has(> ?), h2:has(> ?), h3:has(> ?)',
            'p:has(> ?), div:has(> ?)'
        ];
        
        let pergunta = '';
        for (const selector of perguntaSelectors) {
            const el = container.querySelector(selector);
            if (el && el.textContent.includes('?')) {
                pergunta = el.textContent.trim();
                break;
            }
        }
        
        // 3. Fallback: Busca textual por padrão de questão
        if (!pergunta) {
            const elementos = container.querySelectorAll('p, h1, h2, h3, div');
            for (const el of elementos) {
                const texto = el.textContent.trim();
                if (texto.includes('?') && texto.length > 20 && texto.length < 300) {
                    pergunta = texto;
                    break;
                }
            }
        }
        
        // 4. Detecção de alternativas
        let alternativas = [];
        const alternativaPattern = /^([a-e]\)\s*|•\s*|-\s*)/i;
        
        // Tentar em listas
        const listItems = container.querySelectorAll('li');
        for (const item of listItems) {
            const texto = item.textContent.trim();
            if (alternativaPattern.test(texto) && texto.length > 10 && texto.length < 200) {
                alternativas.push(texto);
            }
        }
        
        // Fallback: tentar em parágrafos e divs
        if (alternativas.length < 2) {
            const elementos = container.querySelectorAll('p, div');
            for (const el of elementos) {
                const texto = el.textContent.trim();
                if (alternativaPattern.test(texto) && !alternativas.includes(texto) && texto.length > 10) {
                    alternativas.push(texto);
                }
            }
        }
        
        // 5. Montar conteúdo final
        if (pergunta && alternativas.length > 1) {
            return `${pergunta}\n\n${alternativas.join('\n')}`;
        } 
        
        if (pergunta) {
            return pergunta;
        }
        
        // 6. Último recurso: conteúdo do container principal
        return container.textContent
            .replace(/\s+/g, ' ')
            .replace(/(Leia também|Veja também|Compartilhe|Comentários).+/i, '')
            .substring(0, 1500);
    };

    const buscarResposta = () => {
        const conteudoQuestao = detectarQuestao();
        
        if (!conteudoQuestao || conteudoQuestao.length < 30) {
            alert('❌ Não foi possível identificar o conteúdo da questão.');
            return;
        }

        // Abrir Perplexity com a questão formatada
        const urlPesquisa = `https://www.perplexity.ai/search?q=${encodeURIComponent(conteudoQuestao)}`;
        window.open(urlPesquisa, '_blank');
        
        // Atualizar status
        const status = document.getElementById('assistente-status');
        if (status) {
            status.textContent = 'Pesquisa enviada!';
            setTimeout(() => {
                status.textContent = 'Pronto para nova pesquisa';
            }, 3000);
        }
    };

    // Variáveis para arrastar
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    const criarMenuFlutuante = () => {
        // Remover menu existente
        const existingMenu = document.getElementById('assistente-enem-menu');
        if (existingMenu) existingMenu.remove();
        
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
            <div>
                <p>Clique para buscar resposta:</p>
                <button id="buscar-resposta-btn">
                    <i class="fas fa-search"></i> Buscar Resposta
                </button>
                <div class="status-indicator" id="assistente-status">Pronto para usar</div>
            </div>
        `;

        document.body.appendChild(menu);
        
        // Carregar Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }
        
        // Evento para botão de fechar
        menu.querySelector('#assistente-menu-close').addEventListener('click', () => {
            menu.style.display = 'none';
            
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
            menu.style.top = (menu.offsetTop - pos2) + "px";
            menu.style.left = (menu.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
        }
    };

    // Iniciar quando o DOM estiver pronto
    const init = () => {
        criarMenuFlutuante();
    };

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    // Depuração avançada
    console.log('Script do Assistente ENEM carregado');
    window.assistenteDebug = {
        detectarQuestao,
        buscarResposta
    };
})();
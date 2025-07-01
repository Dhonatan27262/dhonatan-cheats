// ==UserScript==
// @name         Assistente ENEM - Toda Matéria (Premium Plus)
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Busca automática de respostas com detecção inteligente
// @author       SeuNome
// @match        *://www.todamateria.com.br/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=todamateria.com.br
// @grant        GM_setClipboard
// @grant        GM_notification
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
        
        .mode-selector {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
        }
        
        .mode-btn {
            flex: 1;
            padding: 5px;
            background: rgba(255,255,255,0.1);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            text-align: center;
        }
        
        .mode-btn.active {
            background: rgba(255,255,255,0.3);
            font-weight: bold;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Modos de captura
    let captureMode = 'auto'; // auto, text, question
    const textosIgnorados = [
        'compartilhe', 'comentários', 'publicidade', 'anúncio', 'ads', 
        'leia também', 'veja também', 'relacionados', 'copyright',
        'termos de uso', 'política de privacidade', 'menu', 'buscar'
    ];

    // Função inteligente para coletar conteúdo da questão
    const coletarConteudoQuestao = () => {
        // Tentar encontrar container principal
        const containerSelectors = [
            '.td-post-content', // Toda Matéria
            '.article-content', 
            '.entry-content', 
            '.post-content',
            '.question-container',
            '.exercicio',
            '#content',
            'main'
        ];
        
        let container = null;
        for (const selector of containerSelectors) {
            container = document.querySelector(selector);
            if (container) break;
        }
        
        container = container || document.body;
        
        // Clonar e limpar
        const clone = container.cloneNode(true);
        clone.querySelectorAll('script, style, iframe, img, button, .ads, .comments, .td-post-sharing, .ad, .publicidade').forEach(el => el.remove());
        
        // Encontrar elemento com a pergunta
        let questionElement = null;
        const headingSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        
        for (const selector of headingSelectors) {
            const elements = clone.querySelectorAll(selector);
            for (const el of elements) {
                if (el.textContent.includes('?')) {
                    questionElement = el;
                    break;
                }
            }
            if (questionElement) break;
        }
        
        // Se não encontrou pergunta, pegar o primeiro heading
        if (!questionElement) {
            for (const selector of headingSelectors) {
                const el = clone.querySelector(selector);
                if (el) {
                    questionElement = el;
                    break;
                }
            }
        }
        
        // Determinar modo de captura
        let conteudo = '';
        
        if (captureMode === 'text' || !questionElement) {
            // Modo texto completo (fallback)
            conteudo = clone.innerText;
        } else {
            // Modo focado na questão
            conteudo = questionElement.textContent + '\n';
            
            // Coletar elementos seguintes até o próximo heading
            let nextElement = questionElement.nextElementSibling;
            while (nextElement) {
                if (headingSelectors.includes(nextElement.tagName.toLowerCase())) break;
                conteudo += nextElement.textContent + '\n';
                nextElement = nextElement.nextElementSibling;
            }
        }
        
        // Processar texto
        conteudo = conteudo
            .replace(/\s+/g, ' ')
            .trim();
        
        // Filtrar linhas indesejadas
        conteudo = conteudo.split('\n')
            .filter(line => {
                const lowerLine = line.toLowerCase();
                return !textosIgnorados.some(ignored => lowerLine.includes(ignored)) && 
                       line.length > 5;
            })
            .join('\n');
        
        // Limitar tamanho
        return conteudo.substring(0, 1500);
    };

    const buscarResposta = () => {
        const conteudoQuestao = coletarConteudoQuestao();
        
        if (!conteudoQuestao || conteudoQuestao.length < 30) {
            alert('❌ Não foi possível identificar o conteúdo da questão.');
            return;
        }

        // Copiar para área de transferência como fallback
        GM_setClipboard(conteudoQuestao, 'text');
        
        // Abrir Perplexity
        const urlPesquisa = `https://www.perplexity.ai/search?q=${encodeURIComponent(conteudoQuestao)}`;
        window.open(urlPesquisa, '_blank');
        
        // Notificação
        GM_notification({
            text: 'Conteúdo copiado para área de transferência!',
            title: 'Assistente ENEM',
            timeout: 3000
        });
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
                <p>Selecione o modo de captura:</p>
                <div class="mode-selector">
                    <button class="mode-btn ${captureMode === 'auto' ? 'active' : ''}" data-mode="auto">Auto</button>
                    <button class="mode-btn ${captureMode === 'text' ? 'active' : ''}" data-mode="text">Texto</button>
                    <button class="mode-btn ${captureMode === 'question' ? 'active' : ''}" data-mode="question">Questão</button>
                </div>
                <p>Clique para buscar resposta:</p>
            </div>
            <button id="buscar-resposta-btn">
                <i class="fas fa-search"></i> Buscar Resposta
            </button>
        `;

        document.body.appendChild(menu);
        
        // Adicionar Font Awesome
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
        
        // Eventos para botões de modo
        menu.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                captureMode = btn.dataset.mode;
                menu.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
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
// ==UserScript==
// @name         Kahoot Autoplayer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Responde automaticamente as perguntas no Kahoot
// @author       Santos.Mec996
// @match        https://kahoot.it/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    
    // Configurações
    const config = {
        autoAnswer: true,
        delay: 1500,
        theme: 'dark'
    };
    
    // Elementos da UI
    let floatingMenu;
    let statusIndicator;
    
    // Criar menu flutuante
    function createFloatingMenu() {
        floatingMenu = document.createElement('div');
        floatingMenu.id = 'kahoot-autoplayer-menu';
        floatingMenu.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${config.theme === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)'};
            border: 2px solid #ff5500;
            border-radius: 15px;
            padding: 15px;
            z-index: 9999;
            color: ${config.theme === 'dark' ? 'white' : '#333'};
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            min-width: 200px;
            backdrop-filter: blur(10px);
            transition: transform 0.3s, opacity 0.3s;
        `;
        
        // Título
        const title = document.createElement('div');
        title.textContent = 'Kahoot Autoplayer';
        title.style.cssText = `
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 10px;
            text-align: center;
            color: #ff9900;
        `;
        floatingMenu.appendChild(title);
        
        // Status
        const statusContainer = document.createElement('div');
        statusContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        `;
        
        const statusLabel = document.createElement('span');
        statusLabel.textContent = 'Status: ';
        statusLabel.style.marginRight = '10px';
        
        statusIndicator = document.createElement('span');
        statusIndicator.textContent = config.autoAnswer ? 'Ativo' : 'Inativo';
        statusIndicator.style.color = config.autoAnswer ? '#4CAF50' : '#F44336';
        statusIndicator.style.fontWeight = 'bold';
        
        statusContainer.appendChild(statusLabel);
        statusContainer.appendChild(statusIndicator);
        floatingMenu.appendChild(statusContainer);
        
        // Botão de toggle
        const toggleButton = document.createElement('button');
        toggleButton.textContent = config.autoAnswer ? 'Desativar' : 'Ativar';
        toggleButton.style.cssText = `
            background: ${config.autoAnswer ? '#f44336' : '#4CAF50'};
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
            transition: all 0.3s;
        `;
        toggleButton.addEventListener('click', toggleAutoAnswer);
        floatingMenu.appendChild(toggleButton);
        
        // Configurações avançadas
        const advancedSettings = document.createElement('div');
        advancedSettings.style.marginTop = '15px';
        
        const delayLabel = document.createElement('label');
        delayLabel.textContent = 'Atraso (ms): ';
        delayLabel.style.display = 'block';
        delayLabel.style.marginBottom = '5px';
        
        const delayInput = document.createElement('input');
        delayInput.type = 'number';
        delayInput.value = config.delay;
        delayInput.min = 500;
        delayInput.max = 5000;
        delayInput.style.cssText = `
            width: 100%;
            padding: 5px;
            border-radius: 4px;
            border: 1px solid #ccc;
            background: ${config.theme === 'dark' ? '#333' : '#fff'};
            color: ${config.theme === 'dark' ? 'white' : '#333'};
        `;
        delayInput.addEventListener('change', (e) => {
            config.delay = parseInt(e.target.value);
        });
        
        advancedSettings.appendChild(delayLabel);
        advancedSettings.appendChild(delayInput);
        floatingMenu.appendChild(advancedSettings);
        
        // Créditos
        const credits = document.createElement('div');
        credits.innerHTML = 'Desenvolvido por <b>Santos.Mec996</b>';
        credits.style.cssText = `
            text-align: center;
            margin-top: 15px;
            font-size: 12px;
            opacity: 0.7;
        `;
        floatingMenu.appendChild(credits);
        
        document.body.appendChild(floatingMenu);
        
        // Efeitos de arrastar
        makeDraggable(floatingMenu);
    }
    
    // Função para alternar o modo de resposta automática
    function toggleAutoAnswer() {
        config.autoAnswer = !config.autoAnswer;
        statusIndicator.textContent = config.autoAnswer ? 'Ativo' : 'Inativo';
        statusIndicator.style.color = config.autoAnswer ? '#4CAF50' : '#F44336';
        this.textContent = config.autoAnswer ? 'Desativar' : 'Ativar';
        this.style.background = config.autoAnswer ? '#f44336' : '#4CAF50';
        
        if (config.autoAnswer) {
            // Se ativou, tenta responder a pergunta atual imediatamente
            setTimeout(() => tryAnswerQuestion(), 100);
        }
    }
    
    // Função para detectar e responder perguntas
    function tryAnswerQuestion() {
        if (!config.autoAnswer) return;
        
        // Aguarda um pouco para garantir que a pergunta foi carregada
        setTimeout(() => {
            // Encontra o container das respostas
            const choicesContainer = document.querySelector('main div.choices-container');
            if (!choicesContainer) return;
            
            // Procura pela resposta correta (elemento com a borda verde)
            const choices = choicesContainer.querySelectorAll('button.choice');
            let correctChoice = null;
            
            choices.forEach(choice => {
                // Verifica o estilo (a resposta correta tem uma borda verde)
                if (choice.style.borderColor === 'rgb(79, 227, 74)') {
                    correctChoice = choice;
                }
            });
            
            // Se encontrou, clica
            if (correctChoice) {
                correctChoice.click();
                showSuccessMessage();
            } else {
                // Se não encontrou, tenta novamente depois de um tempo
                setTimeout(tryAnswerQuestion, 500);
            }
        }, config.delay);
    }
    
    // Mostrar mensagem de sucesso
    function showSuccessMessage() {
        const existingMessage = document.querySelector('.kahoot-autoplayer-message');
        if (existingMessage) existingMessage.remove();
        
        const message = document.createElement('div');
        message.textContent = '✓ Resposta selecionada!';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(46, 204, 113, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 30px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            animation: fadeInOut 3s forwards;
        `;
        
        document.body.appendChild(message);
        
        // Remover após 3 segundos
        setTimeout(() => {
            message.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => message.remove(), 500);
        }, 2500);
    }
    
    // Função para tornar elemento arrastável
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        element.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // Obter posição do mouse
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
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
        
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    // Observar mudanças na página
    function setupObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    // Verifica se uma nova pergunta foi carregada
                    const questionScreen = document.querySelector('div.question-header__wrapper');
                    if (questionScreen && config.autoAnswer) {
                        tryAnswerQuestion();
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Adicionar estilos customizados
    GM_addStyle(`
        @keyframes fadeInOut {
            0% { opacity: 0; top: 10px; }
            20% { opacity: 1; top: 20px; }
            80% { opacity: 1; top: 20px; }
            100% { opacity: 0; top: 10px; }
        }
        
        @keyframes fadeOut {
            to { opacity: 0; }
        }
        
        .kahoot-autoplayer-message {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
    `);
    
    // Inicialização
    function init() {
        createFloatingMenu();
        setupObserver();
        
        // Tentar responder a primeira pergunta se já estiver em uma
        setTimeout(() => {
            if (config.autoAnswer) {
                tryAnswerQuestion();
            }
        }, 3000);
    }
    
    // Iniciar quando a página estiver carregada
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 1);
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
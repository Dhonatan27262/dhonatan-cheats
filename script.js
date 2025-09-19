// ==UserScript==
// @name         Wayground (Quizziz) Assistant
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ferramenta de automação para Wayground (antigo Quizziz)
// @author       MLK Mau
// @match        *://*.wayground.com/*
// @match        *://*.quizziz.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.12.0/toastify.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @resource     toastifyCSS https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.12.0/toastify.min.css
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // Configurações e estado
    let config = {
        autoAnswer: GM_getValue('autoAnswer', true),
        autoJoin: GM_getValue('autoJoin', true),
        instantAnswer: GM_getValue('instantAnswer', false),
        showCorrectAnswers: GM_getValue('showCorrectAnswers', true),
        stealthMode: GM_getValue('stealthMode', false),
        answerDelay: GM_getValue('answerDelay', 3) // segundos
    };

    // Carregar CSS do Toastify
    const toastifyCSS = GM_getResourceText('toastifyCSS');
    const style = document.createElement('style');
    style.textContent = toastifyCSS;
    document.head.appendChild(style);

    // Função para mostrar notificações
    function showToast(message, duration = 3000, color = '#000') {
        Toastify({
            text: message,
            duration: duration,
            gravity: "top",
            position: "right",
            backgroundColor: color,
            stopOnFocus: true,
        }).showToast();
    }

    // Função para criar a interface flutuante
    function createFloatingMenu() {
        const menuHtml = `
            <div id="wayground-helper" style="
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 15px;
                border-radius: 10px;
                font-family: Arial, sans-serif;
                min-width: 200px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; font-size: 16px;">Wayground Helper</h3>
                    <button id="wg-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <label style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Resposta Automática</span>
                        <input type="checkbox" id="wg-auto-answer" ${config.autoAnswer ? 'checked' : ''}>
                    </label>
                    <label style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Entrar Automaticamente</span>
                        <input type="checkbox" id="wg-auto-join" ${config.autoJoin ? 'checked' : ''}>
                    </label>
                    <label style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Resposta Instantânea</span>
                        <input type="checkbox" id="wg-instant-answer" ${config.instantAnswer ? 'checked' : ''}>
                    </label>
                    <label style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Mostrar Respostas</span>
                        <input type="checkbox" id="wg-show-answers" ${config.showCorrectAnswers ? 'checked' : ''}>
                    </label>
                    <label style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Modo Furtivo</span>
                        <input type="checkbox" id="wg-stealth-mode" ${config.stealthMode ? 'checked' : ''}>
                    </label>
                    <label style="display: flex; flex-direction: column;">
                        <span>Atraso de Resposta: <span id="wg-delay-value">${config.answerDelay}</span>s</span>
                        <input type="range" id="wg-answer-delay" min="1" max="10" value="${config.answerDelay}" step="0.5">
                    </label>
                    <button id="wg-save-btn" style="background: #4CAF50; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Salvar</button>
                </div>
            </div>
        `;

        $('body').append(menuHtml);

        // Event listeners
        $('#wg-close-btn').click(() => {
            $('#wayground-helper').hide();
        });

        $('#wg-save-btn').click(saveSettings);

        $('#wg-answer-delay').on('input', function() {
            $('#wg-delay-value').text($(this).val());
        });

        // Arrastar o menu
        let isDragging = false;
        let startX, startY, initialX, initialY;

        $('#wayground-helper').on('mousedown', function(e) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = parseInt($(this).css('right'), 10);
            initialY = parseInt($(this).css('top'), 10);
            e.preventDefault();
        });

        $(document).on('mousemove', function(e) {
            if (!isDragging) return;
            const newX = initialX - (e.clientX - startX);
            const newY = initialY + (e.clientY - startY);
            $('#wayground-helper').css({
                right: `${newX}px`,
                top: `${newY}px`
            });
        });

        $(document).on('mouseup', function() {
            isDragging = false;
        });
    }

    function saveSettings() {
        config.autoAnswer = $('#wg-auto-answer').is(':checked');
        config.autoJoin = $('#wg-auto-join').is(':checked');
        config.instantAnswer = $('#wg-instant-answer').is(':checked');
        config.showCorrectAnswers = $('#wg-show-answers').is(':checked');
        config.stealthMode = $('#wg-stealth-mode').is(':checked');
        config.answerDelay = parseFloat($('#wg-answer-delay').val());

        // Salvar configurações
        Object.keys(config).forEach(key => {
            GM_setValue(key, config[key]);
        });

        showToast('Configurações salvas!', 2000, '#4CAF50');
    }

    // Função principal de automação
    function automateWayground() {
        // Verificar se estamos em uma sala de quiz
        if (window.location.pathname.includes('/join') && config.autoJoin) {
            const codeMatch = window.location.href.match(/[A-Za-z0-9]{6}/);
            if (codeMatch) {
                const code = codeMatch[0];
                showToast(`Entrando na sala: ${code}`, 3000);
                
                // Preencher automaticamente o código e entrar
                const codeInput = document.querySelector('input[type="text"]');
                const joinButton = document.querySelector('button');
                
                if (codeInput && joinButton) {
                    codeInput.value = code;
                    setTimeout(() => {
                        joinButton.click();
                    }, 2000);
                }
            }
        }

        // Detectar quando um quiz começa
        if (document.querySelector('.question-header')) {
            showToast('Quiz detectado!', 2000);
            
            // Observar mudanças na página para detectar novas perguntas
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        checkForQuestion();
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Verificar inicialmente
            checkForQuestion();
        }
    }

    function checkForQuestion() {
        if (!config.autoAnswer) return;

        // Verificar se há uma pergunta ativa
        const questionElement = document.querySelector('.question-header');
        if (!questionElement) return;

        // Obter as opções de resposta
        const answerOptions = document.querySelectorAll('.option-container, .answer-option');
        
        if (answerOptions.length > 0) {
            showToast('Pergunta detectada!', 1000);
            
            // Tentar encontrar a resposta correta
            let correctAnswer = null;
            
            // Estratégia 1: Procurar por indicadores visuais de resposta correta
            answerOptions.forEach(option => {
                if (option.classList.contains('correct') || 
                    option.style.backgroundColor.includes('green') ||
                    option.querySelector('.correct-indicator')) {
                    correctAnswer = option;
                }
            });
            
            // Estratégia 2: Analisar o texto para inferir a resposta correta
            if (!correctAnswer && config.showCorrectAnswers) {
                // Esta é uma abordagem simplificada - na prática seria mais complexa
                answerOptions.forEach(option => {
                    const optionText = option.textContent.toLowerCase();
                    if (optionText.includes('verdad') || 
                        optionText.includes('corret') || 
                        optionText.includes('certo') ||
                        optionText.includes('right') ||
                        optionText.includes('true')) {
                        correctAnswer = option;
                    }
                });
            }
            
            // Estratégia 3: Selecionar a primeira opção se não encontrar resposta óbvia
            if (!correctAnswer) {
                correctAnswer = answerOptions[0];
            }
            
            // Responder após um delay
            const delay = config.instantAnswer ? 100 : (config.answerDelay * 1000);
            
            setTimeout(() => {
                if (correctAnswer && config.autoAnswer) {
                    correctAnswer.click();
                    showToast('Resposta selecionada!', 1000, '#4CAF50');
                    
                    // Clicar no botão de confirmar se existir
                    setTimeout(() => {
                        const confirmButton = document.querySelector('.confirm-button, .submit-btn');
                        if (confirmButton) {
                            confirmButton.click();
                        }
                    }, 500);
                }
            }, delay);
        }
    }

    // Inicialização
    function init() {
        // Aguardar o carregamento da página
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initialize, 2000);
            });
        } else {
            setTimeout(initialize, 2000);
        }
    }

    function initialize() {
        createFloatingMenu();
        automateWayground();
        
        // Adicionar botão de toggle para o menu
        const toggleBtn = $(`
            <button id="wg-toggle-btn" style="
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9998;
                background: rgba(0,0,0,0.8);
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                cursor: pointer;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">⚙️</button>
        `);
        
        $('body').append(toggleBtn);
        
        $('#wg-toggle-btn').click(() => {
            $('#wayground-helper').toggle();
        });
        
        showToast('Wayground Helper carregado!', 3000);
    }

    // Iniciar o script
    init();
})();
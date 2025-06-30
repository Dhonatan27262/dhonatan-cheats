// ==UserScript==
// @name         Quizizz Auto Answer (Live)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Mostra respostas corretas do Quizizz em tempo real
// @author       SeuNome
// @match        https://quizizz.com/join/game/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Configurações
    const CHECK_INTERVAL = 500; // Verifica a cada 0.5 segundos
    const ANSWER_STYLE = {
        banner: `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 10px;
            z-index: 99999;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            text-align: center;
            transition: all 0.3s ease;
        `,
        option: `
            border: 3px solid #4CAF50 !important;
            box-shadow: 0 0 15px rgba(76, 175, 80, 0.7) !important;
            transform: scale(1.02);
            transition: all 0.3s ease;
        `
    };

    // Estado do script
    let lastQuestionId = null;

    // Inicia o monitoramento
    function init() {
        // Cria container para a resposta
        const banner = document.createElement('div');
        banner.id = 'quizizz-answer-banner';
        banner.style.cssText = ANSWER_STYLE.banner + 'display: none;';
        document.body.appendChild(banner);

        // Inicia verificador
        setInterval(checkQuestion, CHECK_INTERVAL);
        console.log('[Quizizz Auto Answer] Script ativado!');
    }

    // Verifica a pergunta atual
    function checkQuestion() {
        try {
            // Verifica se o jogo está carregado
            if (!window.Game || !window.Game.room || !window.Game.room.questions) return;

            const game = window.Game.room;
            const currentIndex = game.currentQuestionIndex;
            const currentQuestion = game.questions[currentIndex];
            
            // Verifica se é uma nova pergunta
            if (!currentQuestion || currentQuestion._id === lastQuestionId) return;
            
            lastQuestionId = currentQuestion._id;
            showAnswer(currentQuestion);
        } catch (e) {
            console.error('[Quizizz Auto Answer] Erro:', e);
        }
    }

    // Exibe a resposta
    function showAnswer(question) {
        // Encontra a resposta correta
        const correctOption = question.options.find(opt => opt.correct);
        if (!correctOption) return;

        // Atualiza o banner
        const banner = document.getElementById('quizizz-answer-banner');
        banner.innerHTML = `RESPOSTA CORRETA:<br><strong>${correctOption.text}</strong>`;
        banner.style.display = 'block';

        // Marca a opção correta na tela
        markCorrectOption(correctOption._id);
    }

    // Marca a opção correta no DOM
    function markCorrectOption(optionId) {
        const markOption = () => {
            const options = document.querySelectorAll('.options-container [data-option-id]');
            
            options.forEach(option => {
                // Reseta estilos anteriores
                option.style.border = '';
                option.style.boxShadow = '';
                option.style.transform = '';
                
                // Aplica destaque na resposta correta
                if (option.getAttribute('data-option-id') === optionId) {
                    option.style.cssText += ANSWER_STYLE.option;
                }
            });
        };

        // Tenta marcar imediatamente
        markOption();
        
        // Tenta novamente se o DOM ainda não estiver pronto
        if (!document.querySelector(`[data-option-id="${optionId}"]`)) {
            setTimeout(markOption, 300);
        }
    }

    // Aguarda o carregamento da página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }
})();

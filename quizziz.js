// ==UserScript==
// @name         Quizizz Answer Hacker (Offline Mode)
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Exibe respostas corretas do Quizizz diretamente na tela, com suporte off-line
// @author       DevPro Solutions
// @match        https://quizizz.com/join/game/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Configurações avançadas
    const CACHE_KEY = 'quizizzAnswerCache';
    const CHECK_INTERVAL = 300;
    const OFFLINE_TIMEOUT = 5000;

    // Estilo premium para o banner
    GM_addStyle(`
        #quizizz-answer-hud {
            position: fixed;
            bottom: 25px;
            right: 25px;
            background: linear-gradient(135deg, #2c3e50, #4a235a);
            color: #fff;
            padding: 18px 25px;
            border-radius: 16px;
            z-index: 99999;
            font-weight: 700;
            font-size: 20px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
            text-align: center;
            border: 2px solid #8e44ad;
            font-family: 'Segoe UI', system-ui;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            backdrop-filter: blur(4px);
            max-width: 400px;
            transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        #quizizz-answer-hud:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.5);
        }
        .answer-text {
            font-size: 24px;
            color: #f1c40f;
            margin: 10px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 800;
            text-shadow: 0 0 10px rgba(241, 196, 15, 0.7);
        }
        .offline-badge {
            background: #e74c3c;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
            display: inline-block;
            animation: pulse 1.5s infinite;
        }
        .correct-option {
            border: 3px solid #2ecc71 !important;
            box-shadow: 0 0 20px rgba(46, 204, 113, 0.8) !important;
            transform: scale(1.03);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
    `);

    // Estado do sistema
    let lastQuestionId = null;
    let isOffline = false;
    let connectionTimer = null;
    let gameDataCache = null;

    // Inicialização
    function initSystem() {
        createAnswerHUD();
        loadCache();
        startConnectionMonitor();
        startGameObserver();
        console.log('[Quizizz Hacker] Sistema ativado com sucesso!');
    }

    // Cria o HUD de respostas
    function createAnswerHUD() {
        const hud = document.createElement('div');
        hud.id = 'quizizz-answer-hud';
        hud.innerHTML = `
            <div>RESPOSTA CORRETA:</div>
            <div class="answer-text" id="quizizz-correct-answer">Carregando...</div>
            <div id="quizizz-status">Conectado ao Quizizz</div>
        `;
        document.body.appendChild(hud);
    }

    // Carrega cache off-line
    function loadCache() {
        const cache = GM_getValue(CACHE_KEY);
        if (cache) {
            gameDataCache = cache;
            console.log('[Cache] Dados off-line carregados:', cache);
        }
    }

    // Monitoramento de conexão
    function startConnectionMonitor() {
        window.addEventListener('online', () => {
            isOffline = false;
            updateStatus('Conectado ao Quizizz', '#2ecc71');
        });
        
        window.addEventListener('offline', () => {
            isOffline = true;
            updateStatus('Modo Off-line - Usando cache local', '#e74c3c');
            if (connectionTimer) clearTimeout(connectionTimer);
            connectionTimer = setTimeout(() => {
                if (isOffline) useCachedAnswer();
            }, OFFLINE_TIMEOUT);
        });
    }

    // Observador do jogo
    function startGameObserver() {
        setInterval(() => {
            try {
                if (isGameLoaded()) {
                    processCurrentQuestion();
                }
            } catch (e) {
                console.error('[Observer Error]', e);
            }
        }, CHECK_INTERVAL);
    }

    // Verifica carregamento do jogo
    function isGameLoaded() {
        return !!(
            window.Game && 
            window.Game.room && 
            window.Game.room.questions
        );
    }

    // Processa a pergunta atual
    function processCurrentQuestion() {
        const game = window.Game.room;
        const currentIndex = game.currentQuestionIndex;
        const currentQuestion = game.questions[currentIndex];
        
        if (!currentQuestion || currentQuestion._id === lastQuestionId) return;
        
        lastQuestionId = currentQuestion._id;
        const correctAnswer = extractCorrectAnswer(currentQuestion);
        
        if (correctAnswer) {
            updateAnswerDisplay(correctAnswer);
            highlightCorrectOption(correctAnswer.id);
            saveToCache(game.questions);
        }
    }

    // Extrai a resposta correta
    function extractCorrectAnswer(question) {
        return question.options.find(opt => opt.correct);
    }

    // Atualiza a exibição da resposta
    function updateAnswerDisplay(answer) {
        const answerElement = document.getElementById('quizizz-correct-answer');
        const statusElement = document.getElementById('quizizz-status');
        
        answerElement.textContent = answer.text || answer.caption;
        
        if (isOffline) {
            statusElement.innerHTML = `<span class="offline-badge">Modo Off-line - Resposta do Cache</span>`;
        } else {
            statusElement.textContent = 'Conectado ao Quizizz';
            statusElement.style.color = '#2ecc71';
        }
    }

    // Usa resposta em cache
    function useCachedAnswer() {
        if (!gameDataCache || !lastQuestionId) return;
        
        const cachedQuestion = gameDataCache.find(q => q._id === lastQuestionId);
        if (cachedQuestion) {
            const correctAnswer = extractCorrectAnswer(cachedQuestion);
            if (correctAnswer) {
                updateAnswerDisplay(correctAnswer);
                highlightCorrectOption(correctAnswer.id);
            }
        }
    }

    // Destaca a opção correta
    function highlightCorrectOption(answerId) {
        setTimeout(() => {
            const options = document.querySelectorAll('.options-container [data-option-id]');
            options.forEach(option => {
                option.classList.remove('correct-option');
                if (option.getAttribute('data-option-id') === answerId) {
                    option.classList.add('correct-option');
                }
            });
        }, 300);
    }

    // Salva no cache off-line
    function saveToCache(questions) {
        GM_setValue(CACHE_KEY, questions);
        gameDataCache = questions;
    }

    // Atualiza status
    function updateStatus(text, color) {
        const statusElement = document.getElementById('quizizz-status');
        if (statusElement) {
            statusElement.textContent = text;
            statusElement.style.color = color;
        }
    }

    // Inicialização segura
    if (document.readyState === 'complete') {
        initSystem();
    } else {
        window.addEventListener('load', initSystem);
    }
})();
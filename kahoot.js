// ==UserScript==
// @name         KaHack! (Somente Mostrar Respostas)
// @namespace    https://github.com/jokeri2222
// @description  Mostra as respostas corretas no Kahoot
// @match        https://kahoot.it/*
// @grant        none
// @version      1.0
// ==/UserScript==

var questions = [];
var info = {
    questionNum: -1,
    lastAnsweredQuestion: -1
};
var showAnswers = false;

// Função para obter as perguntas diretamente do jogo
function getGameQuestions() {
    if (window.Kahoot && window.Kahoot.gameSession && window.Kahoot.gameSession._quiz) {
        return window.Kahoot.gameSession._quiz._questions;
    }
    return null;
}

function parseQuestions(questionsJson) {
    let questions = [];
    questionsJson.forEach(function (question) {
        let q = { type: question.type, time: question.time };
        if (['quiz', 'multiple_select_quiz'].includes(question.type)) {
            var i = 0;
            q.answers = [];
            q.incorrectAnswers = [];
            question.choices.forEach(function (choice) {
                if (choice.correct) {
                    q.answers.push(i);
                } else {
                    q.incorrectAnswers.push(i);
                }
                i++;
            });
        }
        questions.push(q);
    });
    return questions;
}

// UI Simplificada
const uiElement = document.createElement('div');
uiElement.style.position = 'fixed';
uiElement.style.top = '20px';
uiElement.style.right = '20px';
uiElement.style.backgroundColor = '#381272';
uiElement.style.borderRadius = '10px';
uiElement.style.padding = '10px';
uiElement.style.zIndex = '9999';
uiElement.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
uiElement.style.fontFamily = 'Arial, sans-serif';
uiElement.style.color = 'white';

const title = document.createElement('div');
title.textContent = 'KaHack! (Somente Respostas)';
title.style.fontWeight = 'bold';
title.style.marginBottom = '10px';
title.style.textAlign = 'center';
uiElement.appendChild(title);

const toggleContainer = document.createElement('div');
toggleContainer.style.display = 'flex';
toggleContainer.style.alignItems = 'center';
toggleContainer.style.justifyContent = 'center';
toggleContainer.style.marginBottom = '10px';

const toggleLabel = document.createElement('span');
toggleLabel.textContent = 'Mostrar Respostas:';
toggleLabel.style.marginRight = '10px';
toggleContainer.appendChild(toggleLabel);

const toggle = document.createElement('input');
toggle.type = 'checkbox';
toggle.addEventListener('change', function() {
    showAnswers = this.checked;
    if (showAnswers && info.questionNum >= 0) {
        const question = questions[info.questionNum];
        if (question) highlightAnswers(question);
    }
});
toggleContainer.appendChild(toggle);
uiElement.appendChild(toggleContainer);

document.body.appendChild(uiElement);

// Função para destacar respostas
function highlightAnswers(question) {
    if (!question) return;
    
    question.answers.forEach(function(answer) {
        const answerBtn = document.querySelector(`button[data-functional-selector="answer-${answer}"]`);
        if (answerBtn) answerBtn.style.backgroundColor = '#00FF00';
    });
    
    question.incorrectAnswers.forEach(function(answer) {
        const answerBtn = document.querySelector(`button[data-functional-selector="answer-${answer}"]`);
        if (answerBtn) answerBtn.style.backgroundColor = '#FF0000';
    });
}

// Monitorar mudanças nas perguntas
setInterval(() => {
    try {
        const gameQuestions = getGameQuestions();
        if (gameQuestions && gameQuestions.length > 0 && questions.length === 0) {
            questions = parseQuestions(gameQuestions);
        }

        const questionCounter = document.querySelector('div[data-functional-selector="question-index-counter"]');
        if (questionCounter) {
            const newQuestionNum = parseInt(questionCounter.textContent) - 1;
            if (newQuestionNum !== info.questionNum) {
                info.questionNum = newQuestionNum;
                if (showAnswers) {
                    setTimeout(() => {
                        const currentQuestion = questions[info.questionNum];
                        if (currentQuestion) highlightAnswers(currentQuestion);
                    }, 500);
                }
            }
        }
    } catch (e) {
        console.error("Erro no KaHack:", e);
    }
}, 100);

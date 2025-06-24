// ==UserScript==
// @name         KaHack! Auto (Corrigido)
// @version      1.0.28
// @namespace    https://github.com/jokeri2222
// @description  Hack para Kahoot online/offline
// @author       jokeri2222
// @match        https://kahoot.it/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

var Version = '1.0.28';
var questions = [];
var info = {
    numQuestions: 0,
    questionNum: -1,
    lastAnsweredQuestion: -1,
    defaultIL: true,
    ILSetQuestion: -1,
};
var PPT = 950;
var Answered_PPT = 950;
var autoAnswer = false;
var showAnswers = false;
var inputLag = 100;

// Função para encontrar elementos por atributo
function FindByAttributeValue(attribute, value, element_type) {
    element_type = element_type || "*";
    var All = document.getElementsByTagName(element_type);
    for (var i = 0; i < All.length; i++) {
        if (All[i].getAttribute(attribute) == value) { 
            return All[i]; 
        }
    }
    return null;
}

// Criação da interface
const uiElement = document.createElement('div');
uiElement.className = 'floating-ui';
uiElement.style.position = 'fixed';
uiElement.style.top = '20px';
uiElement.style.left = '20px';
uiElement.style.width = '300px';
uiElement.style.backgroundColor = '#381272';
uiElement.style.borderRadius = '10px';
uiElement.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.5)';
uiElement.style.zIndex = '9999';
uiElement.style.fontFamily = 'Arial, sans-serif';
uiElement.style.color = 'white';
uiElement.style.padding = '15px';
uiElement.style.boxSizing = 'border-box';

// Cabeçalho
const header = document.createElement('h2');
header.textContent = 'KaHack! Auto ' + Version;
header.style.marginTop = '0';
header.style.textAlign = 'center';
uiElement.appendChild(header);

// Controles de Pontos
const pointsContainer = document.createElement('div');
pointsContainer.style.marginBottom = '15px';

const pointsLabel = document.createElement('label');
pointsLabel.textContent = 'Pontos por pergunta:';
pointsLabel.style.display = 'block';
pointsLabel.style.marginBottom = '5px';
pointsContainer.appendChild(pointsLabel);

const pointsSlider = document.createElement('input');
pointsSlider.type = 'range';
pointsSlider.min = '500';
pointsSlider.max = '1000';
pointsSlider.value = '950';
pointsSlider.style.width = '100%';
pointsSlider.style.marginBottom = '10px';
pointsContainer.appendChild(pointsSlider);

const pointsValue = document.createElement('div');
pointsValue.textContent = 'Valor: 950';
pointsValue.style.textAlign = 'center';
pointsValue.style.fontSize = '14px';
pointsContainer.appendChild(pointsValue);

uiElement.appendChild(pointsContainer);

// Controles de Resposta Automática
const autoContainer = document.createElement('div');
autoContainer.style.marginBottom = '15px';
autoContainer.style.display = 'flex';
autoContainer.style.justifyContent = 'space-between';
autoContainer.style.alignItems = 'center';

const autoLabel = document.createElement('label');
autoLabel.textContent = 'Resposta Automática:';
autoLabel.style.marginRight = '10px';
autoContainer.appendChild(autoLabel);

const autoToggle = document.createElement('input');
autoToggle.type = 'checkbox';
autoToggle.style.transform = 'scale(1.5)';
autoContainer.appendChild(autoToggle);

uiElement.appendChild(autoContainer);

// Controles de Mostrar Respostas
const showContainer = document.createElement('div');
showContainer.style.marginBottom = '15px';
showContainer.style.display = 'flex';
showContainer.style.justifyContent = 'space-between';
showContainer.style.alignItems = 'center';

const showLabel = document.createElement('label');
showLabel.textContent = 'Mostrar Respostas:';
showLabel.style.marginRight = '10px';
showContainer.appendChild(showLabel);

const showToggle = document.createElement('input');
showToggle.type = 'checkbox';
showToggle.style.transform = 'scale(1.5)';
showContainer.appendChild(showToggle);

uiElement.appendChild(showContainer);

// Informações do Quiz
const infoContainer = document.createElement('div');
infoContainer.style.borderTop = '1px solid #555';
infoContainer.style.paddingTop = '15px';

const quizInfo = document.createElement('div');
quizInfo.textContent = 'Quiz: Aguardando...';
quizInfo.style.marginBottom = '10px';
quizInfo.style.color = 'yellow';
infoContainer.appendChild(quizInfo);

const questionInfo = document.createElement('div');
questionInfo.textContent = 'Pergunta: 0/0';
questionInfo.style.marginBottom = '5px';
infoContainer.appendChild(questionInfo);

const lagInfo = document.createElement('div');
lagInfo.textContent = 'Latência: 100ms';
infoContainer.appendChild(lagInfo);

uiElement.appendChild(infoContainer);

// Botão de fechar
const closeBtn = document.createElement('button');
closeBtn.textContent = 'Fechar';
closeBtn.style.display = 'block';
closeBtn.style.margin = '15px auto 0';
closeBtn.style.padding = '5px 15px';
closeBtn.style.backgroundColor = '#ff4444';
closeBtn.style.border = 'none';
closeBtn.style.borderRadius = '5px';
closeBtn.style.color = 'white';
closeBtn.style.cursor = 'pointer';
uiElement.appendChild(closeBtn);

// Adiciona ao documento
document.body.appendChild(uiElement);

// Event Listeners
pointsSlider.addEventListener('input', () => {
    PPT = +pointsSlider.value;
    pointsValue.textContent = `Valor: ${PPT}`;
});

autoToggle.addEventListener('change', () => {
    autoAnswer = autoToggle.checked;
});

showToggle.addEventListener('change', () => {
    showAnswers = showToggle.checked;
});

closeBtn.addEventListener('click', () => {
    document.body.removeChild(uiElement);
});

// Função principal para capturar dados do quiz
function captureQuizData() {
    try {
        // Tenta encontrar os dados em scripts
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const script of scripts) {
            if (script.textContent.includes('window.Kahoot')) {
                const regex = /window\.Kahoot\.startGame\s*\(\s*({.*?})\s*\)/s;
                const match = script.textContent.match(regex);
                if (match && match[1]) {
                    return JSON.parse(match[1]);
                }
            }
        }
        
        // Tenta acessar diretamente o objeto do jogo
        if (window.kahoot?.game?.quiz) {
            return {
                questions: window.kahoot.game.quiz.questions,
                kahootId: window.kahoot.game.quiz.kahootId
            };
        }
        
        // Método alternativo para captura
        const appData = document.getElementById('root')?.__vue_app__;
        if (appData) {
            const vueData = appData._context.provides.$store.state;
            if (vueData?.quiz?.questions) {
                return {
                    questions: vueData.quiz.questions,
                    kahootId: vueData.quiz.kahootId
                };
            }
        }
    } catch (e) {
        console.error('Erro ao capturar dados:', e);
    }
    return null;
}

// Processa as perguntas
function processQuestions(rawQuestions) {
    return rawQuestions.map(question => {
        const processed = {
            type: question.type,
            time: question.time
        };
        
        if (['quiz', 'multiple_select_quiz'].includes(question.type)) {
            processed.answers = [];
            processed.incorrectAnswers = [];
            
            question.choices.forEach((choice, index) => {
                if (choice.correct) {
                    processed.answers.push(index);
                } else {
                    processed.incorrectAnswers.push(index);
                }
            });
        }
        
        return processed;
    });
}

// Destaca respostas na tela
function highlightAnswers(question) {
    if (!question) return;
    
    question.answers.forEach(index => {
        const btn = FindByAttributeValue("data-functional-selector", `answer-${index}`, "button");
        if (btn) btn.style.backgroundColor = '#00ff00';
    });
    
    if (question.incorrectAnswers) {
        question.incorrectAnswers.forEach(index => {
            const btn = FindByAttributeValue("data-functional-selector", `answer-${index}`, "button");
            if (btn) btn.style.backgroundColor = '#ff0000';
        });
    }
}

// Responde automaticamente
function autoAnswerQuestion(question) {
    if (!question || !autoAnswer) return;
    
    const answerTime = Math.max(500, question.time * 0.8 - inputLag);
    
    setTimeout(() => {
        if (question.type === 'quiz' && question.answers.length > 0) {
            const key = (question.answers[0] + 1).toString();
            window.dispatchEvent(new KeyboardEvent('keydown', { key }));
        }
        else if (question.type === 'multiple_select_quiz') {
            question.answers.forEach(answer => {
                const key = (answer + 1).toString();
                window.dispatchEvent(new KeyboardEvent('keydown', { key }));
            });
            
            setTimeout(() => {
                const submitBtn = FindByAttributeValue("data-functional-selector", "multi-select-submit-button", "button");
                if (submitBtn) submitBtn.click();
            }, 100);
        }
    }, answerTime);
}

// Monitoramento do estado do jogo
function monitorGameState() {
    try {
        // Atualiza informações da pergunta
        const counter = FindByAttributeValue("data-functional-selector", "question-index-counter", "div");
        if (counter) {
            const match = counter.textContent.match(/(\d+)\s*\/\s*(\d+)/);
            if (match) {
                info.questionNum = parseInt(match[1]) - 1;
                info.numQuestions = parseInt(match[2]);
                questionInfo.textContent = `Pergunta: ${match[1]}/${match[2]}`;
            }
        }
        
        // Carrega as perguntas se necessário
        if (questions.length === 0) {
            const quizData = captureQuizData();
            if (quizData?.questions) {
                questions = processQuestions(quizData.questions);
                quizInfo.textContent = `Quiz: Carregado (${questions.length} perguntas)`;
                quizInfo.style.color = '#00ff00';
            } else {
                quizInfo.textContent = 'Quiz: Não encontrado';
                quizInfo.style.color = '#ff0000';
            }
        }
        
        // Detecta nova pergunta
        const answerBtn = FindByAttributeValue("data-functional-selector", "answer-0", "button");
        if (answerBtn && info.lastAnsweredQuestion !== info.questionNum) {
            info.lastAnsweredQuestion = info.questionNum;
            
            if (questions.length > info.questionNum) {
                const currentQuestion = questions[info.questionNum];
                
                if (showAnswers) {
                    highlightAnswers(currentQuestion);
                }
                
                autoAnswerQuestion(currentQuestion);
            }
        }
        
        // Atualiza informações de latência
        lagInfo.textContent = `Latência: ${inputLag}ms`;
        
    } catch (e) {
        console.error('Erro no monitoramento:', e);
    }
    
    setTimeout(monitorGameState, 100);
}

// Inicia o monitoramento
setTimeout(monitorGameState, 3000);
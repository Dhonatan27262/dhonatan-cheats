// Script para Quizziz
// Autor: Script (sua mentora de programação)
// Função para ativar o menu flutuante
function criarMenu() {
  const menu = document.createElement('div');
  menu.innerHTML = `
    <button id="ativar-script">Ativar Script</button>
  `;
  menu.style.position = 'fixed';
  menu.style.top = '10px';
  menu.style.right = '10px';
  document.body.appendChild(menu);
  document.getElementById('ativar-script').addEventListener('click', iniciarScript);
}
// Função para iniciar o script
function iniciarScript() {
  // Pega a pergunta atual do Quizziz
  const pergunta = document.querySelector('.question-text').textContent;
  // Busca a resposta correta no sistema do Quizziz
  const respostas = document.querySelectorAll('.answer-choice');
  let respostaCorreta;
  respostas.forEach(resposta => {
    if (resposta.querySelector('.correct-answer')) {
      respostaCorreta = resposta.textContent;
    }
  });
  // Exibe a resposta correta
  alert(`Pergunta: ${pergunta}
Resposta Correta: ${respostaCorreta}`);
}
// Chama a função para criar o menu flutuante
criarMenu();
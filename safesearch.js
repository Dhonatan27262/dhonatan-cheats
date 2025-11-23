// ==UserScript==
// @name         Intro Super Mario - Bookmeet
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tela de abertura do Mario (somente estética)
// @match        https://bookmeet.com/*
// @grant        none
// ==/UserScript==

(function() {
    // Cria o container
    const intro = document.createElement("div");
    intro.id = "marioIntro";
    intro.innerHTML = `
    <div class="mario-run"></div>
    <h1 class="introText">Carregando...</h1>
    `;

    // Estilos
    const estilo = document.createElement("style");
    estilo.innerHTML = `
        #marioIntro {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 999999;
            animation: fadeOut 1s ease-out 4s forwards;
        }
        .mario-run {
            width: 80px;
            height: 80px;
            background-image: url("https://i.imgur.com/Uw0S1nh.gif");
            background-size: cover;
            animation: runAcross 3s linear;
        }
        .introText {
            color: white;
            font-family: "Press Start 2P", sans-serif;
            margin-top: 20px;
            font-size: 20px;
            animation: blink 1s infinite;
        }
        @keyframes runAcross {
            0% { transform: translateX(-300px); }
            100% { transform: translateX(300px); }
        }
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
        }
        @keyframes fadeOut {
            to { opacity: 0; visibility: hidden; }
        }
    `;

    // Adiciona tudo na página
    document.body.appendChild(estilo);
    document.body.appendChild(intro);

    // Remove após 5s
    setTimeout(() => {
        document.getElementById("marioIntro")?.remove();
    }, 5000);
})();
// ==UserScript==
// @name         Quizizz Auto Capture + Perplexity
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Captura todas perguntas/respostas visíveis no Quizizz (Wayground) e envia ao Perplexity automaticamente
// @author       Você
// @match        *://quizizz.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ====== CONFIGURAÇÕES ======
    const config = {
        maxContentLength: 1800, // limite seguro para não estourar URL (~2000 chars)
        perplexityBase: "https://www.perplexity.ai/search?q="
    };

    // ====== FUNÇÃO PARA CHECAR VISIBILIDADE ======
    function isVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }
        if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
        if (el.getClientRects().length === 0) return false;
        return true;
    }

    // ====== EXTRAÇÃO DE TODO TEXTO VISÍVEL ======
    function extractVisibleText() {
        let texts = [];
        const allNodes = document.querySelectorAll('*');
        allNodes.forEach(node => {
            if (node.childNodes.length > 0 && isVisible(node)) {
                node.childNodes.forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        let txt = child.textContent.trim();
                        if (txt.length > 0) texts.push(txt);
                    }
                });
            }
        });
        return texts.join(" ").replace(/\s+/g, " ").trim();
    }

    // ====== FUNÇÃO PRINCIPAL PARA PROCESSAR ======
    function processQuestion() {
        let content = extractVisibleText();
        if (!content) return;

        if (content.length > config.maxContentLength) {
            content = content.substring(0, config.maxContentLength) + "...";
        }

        const query = encodeURIComponent(content);
        const url = config.perplexityBase + query;

        console.log("🔎 Pergunta capturada:", content);
        console.log("🌐 URL Perplexity:", url);

        showFloatingButton(url);
    }

    // ====== BOTÃO FLOTANTE NA TELA ======
    function showFloatingButton(url) {
        let btn = document.getElementById("perplexityBtn");
        if (!btn) {
            btn = document.createElement("button");
            btn.id = "perplexityBtn";
            btn.innerText = "🔎 Abrir no Perplexity";
            btn.style.position = "fixed";
            btn.style.bottom = "20px";
            btn.style.right = "20px";
            btn.style.zIndex = "9999";
            btn.style.padding = "10px 15px";
            btn.style.background = "black";
            btn.style.color = "white";
            btn.style.border = "2px solid white";
            btn.style.borderRadius = "8px";
            btn.style.cursor = "pointer";
            document.body.appendChild(btn);
        }
        btn.onclick = () => window.open(url, "_blank");
    }

    // ====== OBSERVADOR DE MUDANÇAS ======
    const observer = new MutationObserver(() => {
        processQuestion();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // ====== INÍCIO ======
    processQuestion();
})();
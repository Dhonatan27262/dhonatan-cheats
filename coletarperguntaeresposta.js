// ==UserScript==
// @name         Assistente ENEM - Toda Matéria (Modo Texto Completo)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Busca automática de respostas copiando todo o texto da questão
// @author       SeuNome
// @match        *://www.todamateria.com.br/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=todamateria.com.br
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Função para coletar todo o texto visível da questão
    const coletarTextoQuestao = () => {
        // Tenta encontrar o container principal da questão
        const containers = [
            '.article-content', 
            '.entry-content', 
            '.post-content',
            '.question-container',
            '.exercicio',
            '#content'
        ];
        
        let container = null;
        for (const selector of containers) {
            container = document.querySelector(selector);
            if (container) break;
        }
        
        // Fallback: usa o body se não encontrar container específico
        container = container || document.body;
        
        // Clona o container para trabalhar sem afetar o DOM
        const clone = container.cloneNode(true);
        
        // Remove elementos indesejados
        clone.querySelectorAll('script, style, iframe, img, button, .ads, footer, header').forEach(el => {
            el.remove();
        });
        
        // Coleta todo o texto
        return clone.innerText
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 2000); // Limita o tamanho
    };

    const buscarResposta = () => {
        const textoQuestao = coletarTextoQuestao();
        
        if (!textoQuestao || textoQuestao.length < 20) {
            alert('❌ Não foi possível identificar o conteúdo da questão.');
            return;
        }

        // Abre o Perplexity com o texto completo da questão
        const urlPesquisa = `https://www.perplexity.ai/search?q=${encodeURIComponent(textoQuestao)}`;
        window.open(urlPesquisa, '_blank');
    };

    const criarMenuFlutuante = () => {
        if (document.getElementById('assistente-enem-menu')) return;

        const menu = document.createElement('div');
        menu.id = 'assistente-enem-menu';
        menu.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            font-family: 'Segoe UI', Arial, sans-serif;
            max-width: 300px;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.2);
        `;

        menu.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 10px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" fill="white"/>
                </svg>
                <h3 style="margin: 0; font-weight: 600;">Assistente ENEM</h3>
            </div>
            <p style="font-size: 14px; line-height: 1.4; margin-bottom: 15px; opacity: 0.9;">
                Clique para buscar resposta com o texto completo da questão
            </p>
            <button id="buscar-resposta-btn" style="
                background: white;
                color: #2575fc;
                border: none;
                padding: 10px 20px;
                width: 100%;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            ">
                Buscar Resposta Completa
            </button>
        `;

        document.body.appendChild(menu);
        document.getElementById('buscar-resposta-btn').addEventListener('click', buscarResposta);
    };

    // Iniciar quando o DOM estiver pronto
    const init = () => {
        criarMenuFlutuante();
        
        // Adiciona estilo para melhorar a usabilidade
        const css = `
            #assistente-enem-menu {
                animation: fadeIn 0.5s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            #buscar-resposta-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 1000);
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
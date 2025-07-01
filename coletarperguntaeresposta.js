(function() {
    'use strict';

    const coletarPerguntaEAlternativas = () => {
        // 1. Detecção de pergunta
        let pergunta = '';
        
        // Tentar encontrar pelo cabeçalho principal
        const cabecalhos = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
        for (const cabecalho of cabecalhos) {
            const texto = cabecalho.textContent.trim();
            if (texto.includes('?')) {
                pergunta = texto;
                break;
            }
        }

        // Fallback - Buscar em parágrafos
        if (!pergunta) {
            const paragrafos = Array.from(document.querySelectorAll('p'));
            for (const p of paragrafos) {
                const texto = p.textContent.trim();
                if (texto.includes('?') && texto.length > 10 && texto.length < 500) {
                    pergunta = texto;
                    break;
                }
            }
        }

        // 2. Detecção de alternativas
        const alternativas = [];
        
        // Tentar encontrar em listas (estrutura comum)
        const listItems = document.querySelectorAll('li');
        listItems.forEach(li => {
            const texto = li.textContent.trim().replace(/\s+/g, ' ');
            if (texto.length > 10 && texto.length < 300 && /^[a-e]\)\s+/i.test(texto)) {
                alternativas.push(texto.replace(/^[a-e]\)\s+/i, ''));
            }
        });

        // Fallback - Buscar em divs com classes específicas
        if (alternativas.length < 2) {
            const divs = document.querySelectorAll('div');
            divs.forEach(div => {
                const texto = div.textContent.trim().replace(/\s+/g, ' ');
                if (texto.length > 10 && texto.length < 300 && /^[a-e]\)\s+/i.test(texto)) {
                    alternativas.push(texto.replace(/^[a-e]\)\s+/i, ''));
                }
            });
        }

        return { pergunta, alternativas };
    };

    const buscarResposta = () => {
        const { pergunta, alternativas } = coletarPerguntaEAlternativas();
        
        if (!pergunta || alternativas.length < 2) {
            alert('❌ Não foi possível identificar a pergunta ou alternativas suficientes.');
            return;
        }

        // Formatar alternativas para pesquisa
        const alternativasFormatadas = alternativas.map((alt, i) => {
            return `${String.fromCharCode(97 + i)}) ${alt}`;
        }).join('\n');

        const promptPesquisa = `${pergunta}\n\n${alternativasFormatadas}`;
        const urlPesquisa = `https://www.perplexity.ai/search?q=${encodeURIComponent(promptPesquisa)}`;
        
        window.open(urlPesquisa, '_blank');
    };

    const criarMenuFlutuante = () => {
        // Evitar duplicação do menu
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
                Clique no botão abaixo para buscar a resposta para esta questão no Perplexity AI
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
                Buscar Resposta
            </button>
        `;

        document.body.appendChild(menu);
        
        // Adicionar evento de clique
        document.getElementById('buscar-resposta-btn').addEventListener('click', buscarResposta);
    };

    // Iniciar quando o DOM estiver pronto
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(criarMenuFlutuante, 1000);
    } else {
        document.addEventListener('DOMContentLoaded', criarMenuFlutuante);
    }
})();
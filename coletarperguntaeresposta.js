// ==UserScript==
// @name         SANTOS.meczada - Busca de Respostas
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Sistema otimizado para busca de respostas
// @author       SeuNome
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
// @icon         https://i.imgur.com/7YbX5Jx.png
// ==/UserScript==

(function() {
    'use strict';

    // =============================
    // SISTEMA DE CAPTURA DE CONTEÚDO
    // =============================
    const capturarConteudoQuestao = () => {
        // 1. Tentar identificar uma pergunta
        let pergunta = '';
        const elementosTexto = document.querySelectorAll('p, h1, h2, h3, h4, h5, div, span, li');
        
        for (const el of elementosTexto) {
            const texto = el.textContent.trim();
            if (texto.includes('?') && texto.length > 10 && texto.length < 300) {
                pergunta = texto;
                break;
            }
        }
        
        // 2. Capturar alternativas
        let alternativas = [];
        const padraoAlternativa = /^[a-e]\)\s+|^\d+\.\s+|^[-•]\s+/i;
        
        document.querySelectorAll('li, p, div, span, td').forEach(el => {
            const texto = el.textContent.trim();
            if (padraoAlternativa.test(texto) && texto.length > 10 && texto.length < 200) {
                alternativas.push(texto);
            }
        });
        
        // 3. Montar conteúdo
        let conteudo = pergunta;
        
        if (alternativas.length > 0) {
            conteudo += '\n\n' + alternativas.join('\n');
        }
        
        // 4. Fallback: capturar todo o conteúdo visível
        if (!conteudo || conteudo.length < 30) {
            conteudo = document.body.innerText
                .replace(/\s+/g, ' ')
                .replace(/(.{100})/g, '$1\n')
                .substring(0, 1500);
        }
        
        return conteudo;
    };

    // =============================
    // INTERFACE DO USUÁRIO
    // =============================
    const criarInterface = () => {
        // Remover interface existente
        const existingUI = document.getElementById('assistente-enem-ui');
        if (existingUI) existingUI.remove();
        
        // Criar container principal
        const ui = document.createElement('div');
        ui.id = 'assistente-enem-ui';
        ui.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: linear-gradient(135deg, #1a2980, #26d0ce);
            color: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            padding: 15px;
            width: 300px;
            font-family: 'Segoe UI', Arial, sans-serif;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
        `;
        
        // HTML da interface
        ui.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-graduation-cap"></i> SANTOS.meczada
                </h3>
                <div>
                    <button id="minimizar-menu" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                        margin-right: 5px;
                    "><i class="fas fa-minus"></i></button>
                    <button id="fechar-menu" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                    ">×</button>
                </div>
            </div>
            
            <div id="conteudo-menu">
                <button id="buscar-resposta" style="
                    width: 100%;
                    padding: 14px;
                    background: white;
                    border: none;
                    border-radius: 10px;
                    color: #1a2980;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    font-size: 16px;
                    transition: all 0.3s;
                ">
                    <i class="fas fa-search" style="margin-right: 10px;"></i>
                    Buscar Resposta
                </button>
                
                <div id="status" style="
                    font-size: 13px;
                    text-align: center;
                    padding: 10px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                    margin-top: 15px;
                    min-height: 20px;
                ">
                    <i class="fas fa-check-circle" style="margin-right: 5px;"></i>
                    Pronto para usar
                </div>
            </div>
            
            <div id="menu-minimizado" style="display: none; text-align: center;">
                <button id="expandir-menu" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    font-size: 20px;
                ">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(ui);
        
        // =====================
        // EVENTOS DA INTERFACE
        // =====================
        
        // Buscar resposta
        document.getElementById('buscar-resposta').addEventListener('click', () => {
            const conteudo = capturarConteudoQuestao();
            if (conteudo.length < 20) {
                document.getElementById('status').innerHTML = `<i class="fas fa-exclamation-triangle"></i> Não foi possível identificar a questão`;
                return;
            }
            
            document.getElementById('status').innerHTML = `<i class="fas fa-spinner fa-spin"></i> Buscando resposta...`;
            
            // Abrir no Perplexity
            const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(conteudo)}`;
            window.open(url, '_blank');
            
            setTimeout(() => {
                document.getElementById('status').innerHTML = `<i class="fas fa-check-circle"></i> Resposta enviada para pesquisa!`;
            }, 2000);
            
            // Efeito visual
            const btn = document.getElementById('buscar-resposta');
            btn.style.transform = 'translateY(-3px)';
            btn.style.boxShadow = '0 7px 15px rgba(0,0,0,0.3)';
            setTimeout(() => {
                btn.style.transform = 'none';
                btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }, 300);
        });
        
        // Fechar menu
        document.getElementById('fechar-menu').addEventListener('click', () => {
            ui.style.display = 'none';
        });
        
        // Minimizar menu
        document.getElementById('minimizar-menu').addEventListener('click', () => {
            document.getElementById('conteudo-menu').style.display = 'none';
            document.getElementById('menu-minimizado').style.display = 'block';
            ui.style.width = '60px';
            ui.style.padding = '10px';
        });
        
        // Expandir menu
        document.getElementById('expandir-menu').addEventListener('click', () => {
            document.getElementById('conteudo-menu').style.display = 'block';
            document.getElementById('menu-minimizado').style.display = 'none';
            ui.style.width = '300px';
            ui.style.padding = '15px';
        });
        
        // =====================
        // ARRASTAR A INTERFACE
        // =====================
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const header = ui.querySelector('h3');
        header.style.cursor = 'move';
        
        header.addEventListener('mousedown', dragMouseDown);
        
        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
        }
        
        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            ui.style.top = (ui.offsetTop - pos2) + "px";
            ui.style.left = (ui.offsetLeft - pos1) + "px";
        }
        
        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
        }
    };

    // =====================
    // INICIALIZAÇÃO
    // =====================
    const init = () => {
        // Carregar Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(link);
        }
        
        // Criar interface
        criarInterface();
        
        // Mensagem inicial
        document.getElementById('status').innerHTML = `<i class="fas fa-check-circle"></i> Pronto para buscar respostas`;
    };

    // Aguardar o carregamento da página
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    // Depuração
    console.log('SANTOS.meczada carregado com sucesso!');
})();
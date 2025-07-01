// ==UserScript==
// @name         Assistente ENEM - Cópia e Busca
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Habilita cópia de texto e busca de respostas
// @author       SeuNome
// @match        *://*/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
// ==/UserScript==

(function() {
    'use strict';

    // 1. Habilitar cópia de texto em sites bloqueados
    const habilitarCopiaTexto = () => {
        // Remover bloqueadores de seleção
        document.body.style.userSelect = 'text !important';
        document.body.style.webkitUserSelect = 'text !important';
        
        // Remover bloqueadores de menu de contexto
        document.addEventListener('contextmenu', e => {
            e.stopPropagation();
        }, true);
        
        // Remover bloqueadores de eventos de seleção
        const eventosBloqueio = ['selectstart', 'mousedown', 'mouseup', 'dragstart'];
        eventosBloqueio.forEach(evento => {
            document.addEventListener(evento, e => {
                e.stopPropagation();
            }, true);
        });
        
        // Remover elementos bloqueadores
        document.querySelectorAll('*').forEach(el => {
            el.style.userSelect = 'text !important';
            el.style.webkitUserSelect = 'text !important';
            el.style.MozUserSelect = 'text !important';
            el.style.msUserSelect = 'text !important';
            el.style.oUserSelect = 'text !important';
        });
    };

    // 2. Coletar conteúdo da questão
    const coletarConteudoQuestao = () => {
        // Tentar encontrar a pergunta
        let pergunta = '';
        const elementosTexto = document.querySelectorAll('p, h1, h2, h3, h4, div, span');
        
        for (const el of elementosTexto) {
            const texto = el.textContent.trim();
            if (texto.includes('?')) {
                pergunta = texto;
                break;
            }
        }
        
        // Coletar alternativas
        let alternativas = [];
        const padraoAlternativa = /^[a-e]\)\s+/i;
        
        document.querySelectorAll('li, p, div').forEach(el => {
            const texto = el.textContent.trim();
            if (padraoAlternativa.test(texto) && texto.length > 10 && texto.length < 200) {
                alternativas.push(texto);
            }
        });
        
        // Montar conteúdo
        if (pergunta && alternativas.length > 0) {
            return `${pergunta}\n\n${alternativas.join('\n')}`;
        }
        
        if (pergunta) {
            return pergunta;
        }
        
        // Fallback: todo o conteúdo da página
        return document.body.textContent
            .replace(/\s+/g, ' ')
            .substring(0, 1500);
    };

    // 3. Interface do usuário
    const criarInterface = () => {
        // Remover interface existente
        const existingUI = document.getElementById('assistente-enem-ui');
        if (existingUI) existingUI.remove();
        
        // Criar container principal
        const ui = document.createElement('div');
        ui.id = 'assistente-enem-ui';
        ui.style = `
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
        `;
        
        ui.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px;">
                    <i class="fas fa-graduation-cap"></i> Assistente ENEM
                </h3>
                <button id="assistente-close" style="
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
            
            <div style="margin-bottom: 15px;">
                <button id="habilitar-copia" style="
                    width: 100%;
                    padding: 10px;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    margin-bottom: 10px;
                    text-align: left;
                    display: flex;
                    align-items: center;
                ">
                    <i class="fas fa-copy" style="margin-right: 10px;"></i>
                    Habilitar Cópia de Texto
                </button>
                
                <button id="buscar-resposta" style="
                    width: 100%;
                    padding: 10px;
                    background: white;
                    border: none;
                    border-radius: 8px;
                    color: #1a2980;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                ">
                    <i class="fas fa-search" style="margin-right: 10px;"></i>
                    Buscar Resposta
                </button>
            </div>
            
            <div id="status" style="
                font-size: 12px;
                text-align: center;
                padding: 5px;
                background: rgba(0,0,0,0.2);
                border-radius: 5px;
                margin-top: 10px;
            ">Pronto para usar</div>
        `;
        
        document.body.appendChild(ui);
        
        // Adicionar eventos
        document.getElementById('assistente-close').addEventListener('click', () => {
            ui.style.display = 'none';
        });
        
        document.getElementById('habilitar-copia').addEventListener('click', () => {
            habilitarCopiaTexto();
            document.getElementById('status').textContent = 'Cópia habilitada! Agora você pode selecionar texto.';
            setTimeout(() => {
                document.getElementById('status').textContent = 'Modo cópia ativo';
            }, 3000);
        });
        
        document.getElementById('buscar-resposta').addEventListener('click', () => {
            const conteudo = coletarConteudoQuestao();
            if (conteudo.length < 20) {
                document.getElementById('status').textContent = 'Erro: Não foi possível identificar a questão';
                return;
            }
            
            document.getElementById('status').textContent = 'Buscando resposta...';
            
            // Abrir no Perplexity
            const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(conteudo)}`;
            window.open(url, '_blank');
            
            document.getElementById('status').textContent = 'Resposta enviada para pesquisa!';
        });
        
        // Tornar arrastável
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        ui.addEventListener('mousedown', dragMouseDown);
        
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

    // Iniciar
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
        
        // Habilitar cópia por padrão
        setTimeout(habilitarCopiaTexto, 1000);
    };

    // Aguardar o carregamento da página
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
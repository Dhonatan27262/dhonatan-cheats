// ==UserScript==
// @name         Super Copiador - Quebra de Proteções
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Script ultra-potente para quebrar proteções contra cópia de texto
// @author       SeuNome
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // =============================================
    // TÉCNICAS AVANÇADAS PARA QUEBRAR PROTEÇÕES
    // =============================================

    // 1. Remover todos os bloqueadores antes que a página carregue
    const removerBloqueadoresIniciais = () => {
        // Remover scripts de proteção antes que executem
        document.addEventListener('beforescriptexecute', function(e) {
            const script = e.target;
            const scriptContent = script.textContent.toLowerCase();
            
            const termosBloqueio = [
                'disablecopy', 'disabletextselect', 'noselect', 'user-select',
                'preventdefault', 'returnfalse', 'onselectstart', 'oncontextmenu',
                'event.stoppropagation', 'event.stopimmediatepropagation'
            ];
            
            if (termosBloqueio.some(termo => scriptContent.includes(termo))) {
                e.preventDefault();
                e.stopPropagation();
                script.remove();
            }
        });
    };

    // 2. Técnica avançada para remover proteções pós-carregamento
    const quebrarProtecoesAvancadas = () => {
        // Remover todos os estilos de bloqueio
        document.querySelectorAll('*').forEach(el => {
            const estilosBloqueio = [
                'user-select', '-webkit-user-select', '-moz-user-select',
                '-ms-user-select', '-o-user-select', 'pointer-events'
            ];
            
            estilosBloqueio.forEach(prop => {
                if (getComputedStyle(el).getPropertyValue(prop) === 'none') {
                    el.style.setProperty(prop, 'auto !important', 'important');
                }
            });
            
            el.style.setProperty('user-select', 'text !important', 'important');
            el.style.setProperty('-webkit-user-select', 'text !important', 'important');
            el.style.setProperty('pointer-events', 'auto !important', 'important');
        });

        // Remover overlays de proteção
        document.querySelectorAll('div').forEach(el => {
            const styles = getComputedStyle(el);
            if (
                (styles.position === 'fixed' || styles.position === 'absolute') &&
                (styles.top === '0px' || styles.bottom === '0px') &&
                (styles.left === '0px' || styles.right === '0px') &&
                (styles.zIndex > '1000') &&
                (styles.backgroundColor === 'rgba(0, 0, 0, 0)' || styles.backgroundColor === 'transparent')
            ) {
                el.remove();
            }
        });

        // Remover event listeners bloqueadores
        const eventosBloqueio = [
            'selectstart', 'mousedown', 'mouseup', 'dragstart', 
            'contextmenu', 'copy', 'cut', 'paste', 'keydown'
        ];
        
        eventosBloqueio.forEach(evento => {
            document.addEventListener(evento, e => {
                e.stopPropagation();
                e.stopImmediatePropagation();
                return true;
            }, true);
            
            document.querySelectorAll('*').forEach(el => {
                const clone = el.cloneNode(true);
                el.parentNode.replaceChild(clone, el);
            });
        });

        // Remover atributos bloqueadores
        const atributosBloqueio = [
            'oncontextmenu', 'onselectstart', 'ondragstart',
            'onmousedown', 'oncopy', 'oncut', 'onpaste'
        ];
        
        document.querySelectorAll('*').forEach(el => {
            atributosBloqueio.forEach(atributo => {
                el.removeAttribute(atributo);
            });
        });

        // Remover scripts restantes de proteção
        document.querySelectorAll('script').forEach(script => {
            const scriptContent = script.textContent.toLowerCase();
            const termosBloqueio = [
                'disablecopy', 'disabletextselect', 'noselect', 'user-select',
                'preventdefault', 'returnfalse', 'onselectstart', 'oncontextmenu',
                'event.stoppropagation', 'event.stopimmediatepropagation'
            ];
            
            if (termosBloqueio.some(termo => scriptContent.includes(termo))) {
                script.remove();
            }
        });
    };

    // 3. Técnica de força bruta para proteções persistentes
    const forcarHabilitacaoCopia = () => {
        // Criar uma nova área de texto com todo o conteúdo da página
        const textarea = document.createElement('textarea');
        textarea.value = document.body.innerText;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '100vw';
        textarea.style.height = '100vh';
        textarea.style.zIndex = '999999999';
        textarea.style.opacity = '0.01';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        
        // Permitir seleção via JavaScript
        const selecionarTudo = () => {
            textarea.select();
            document.execCommand('copy');
        };
        
        // Adicionar botão de cópia flutuante
        const copiarBtn = document.createElement('button');
        copiarBtn.textContent = 'COPIAR TUDO';
        copiarBtn.style.position = 'fixed';
        copiarBtn.style.bottom = '20px';
        copiarBtn.style.right = '20px';
        copiarBtn.style.zIndex = '999999999';
        copiarBtn.style.padding = '10px 20px';
        copiarBtn.style.background = '#1a2980';
        copiarBtn.style.color = 'white';
        copiarBtn.style.border = 'none';
        copiarBtn.style.borderRadius = '5px';
        copiarBtn.style.cursor = 'pointer';
        copiarBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
        copiarBtn.addEventListener('click', selecionarTudo);
        document.body.appendChild(copiarBtn);
        
        // Selecionar automaticamente após 2 segundos
        setTimeout(selecionarTudo, 2000);
    };

    // 4. Sistema de proteção contra reinicialização de bloqueadores
    const monitorarEReagir = () => {
        // Observar mudanças no DOM
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    quebrarProtecoesAvancadas();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Monitorar eventos de teclado e mouse
        document.addEventListener('keydown', function(e) {
            // Desativar combinações de teclas bloqueadoras (Ctrl+Shift+I, Ctrl+U, etc.)
            if (e.ctrlKey && (e.shiftKey || e.altKey)) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }, true);
    };

    // =============================================
    // INTERFACE DO USUÁRIO
    // =============================================
    const criarInterface = () => {
        // Remover interface existente
        const existingUI = document.getElementById('supercopiador-ui');
        if (existingUI) existingUI.remove();
        
        // Criar container principal
        const ui = document.createElement('div');
        ui.id = 'supercopiador-ui';
        ui.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            background: linear-gradient(135deg, #1a2980, #26d0ce);
            color: white;
            border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.4);
            padding: 15px;
            width: 300px;
            font-family: 'Segoe UI', Arial, sans-serif;
            border: 1px solid rgba(255,255,255,0.3);
            transition: all 0.3s ease;
        `;
        
        // HTML da interface
        ui.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-shield-alt"></i> Super Copiador
                </h3>
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
            
            <div>
                <div style="margin-bottom: 15px; font-size: 14px;">
                    Este site tenta bloquear a cópia de conteúdo. Clique nos botões abaixo para quebrar as proteções.
                </div>
                
                <button id="quebrar-protecoes" style="
                    width: 100%;
                    padding: 12px;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    margin-bottom: 12px;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    font-size: 15px;
                    transition: all 0.2s;
                ">
                    <i class="fas fa-lock-open" style="margin-right: 10px;"></i>
                    Quebrar Proteções
                </button>
                
                <button id="copiar-tudo" style="
                    width: 100%;
                    padding: 12px;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    margin-bottom: 12px;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    font-size: 15px;
                    transition: all 0.2s;
                ">
                    <i class="fas fa-copy" style="margin-right: 10px;"></i>
                    Copiar Todo o Conteúdo
                </button>
                
                <button id="forcar-copia" style="
                    width: 100%;
                    padding: 14px;
                    background: #ff4d4d;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    font-size: 16px;
                    transition: all 0.3s;
                ">
                    <i class="fas fa-bomb" style="margin-right: 10px;"></i>
                    Modo Força Bruta
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
                    Proteções ativas: Aguardando ação
                </div>
            </div>
        `;
        
        document.body.appendChild(ui);
        
        // =====================
        // EVENTOS DA INTERFACE
        // =====================
        
        // Quebrar proteções
        document.getElementById('quebrar-protecoes').addEventListener('click', () => {
            quebrarProtecoesAvancadas();
            document.getElementById('status').innerHTML = `
                <i class="fas fa-check-circle"></i> Proteções quebradas! Tente copiar o texto agora.
            `;
            
            // Efeito visual
            const btn = document.getElementById('quebrar-protecoes');
            btn.style.background = 'rgba(255,255,255,0.3)';
            setTimeout(() => {
                btn.style.background = 'rgba(255,255,255,0.15)';
            }, 300);
        });
        
        // Copiar tudo
        document.getElementById('copiar-tudo').addEventListener('click', () => {
            const textarea = document.createElement('textarea');
            textarea.value = document.body.innerText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            
            document.getElementById('status').innerHTML = `
                <i class="fas fa-check-circle"></i> Todo o conteúdo copiado para área de transferência!
            `;
        });
        
        // Forçar cópia (modo força bruta)
        document.getElementById('forcar-copia').addEventListener('click', () => {
            forcarHabilitacaoCopia();
            document.getElementById('status').innerHTML = `
                <i class="fas fa-check-circle"></i> Modo força bruta ativado! Use o botão "COPIAR TUDO".
            `;
        });
        
        // Fechar menu
        document.getElementById('fechar-menu').addEventListener('click', () => {
            ui.style.display = 'none';
        });
    };

    // =============================================
    // INICIALIZAÇÃO
    // =============================================
    const init = () => {
        // Executar técnicas em diferentes estágios de carregamento
        removerBloqueadoresIniciais();
        
        // Esperar o DOM carregar para o resto das operações
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                quebrarProtecoesAvancadas();
                monitorarEReagir();
                criarInterface();
            });
        } else {
                quebrarProtecoesAvancadas();
                monitorarEReagir();
                criarInterface();
        }
    };

    // Iniciar imediatamente
    init();

    // Depuração
    console.log('Super Copiador carregado com sucesso!');
})();
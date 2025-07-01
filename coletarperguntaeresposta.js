// ==UserScript==
// @name         Copiador Leve para Sites Protegidos
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Script leve para habilitar cópia em sites protegidos sem causar reinicialização
// @author       SeuNome
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 1. Função principal para habilitar cópia
    const habilitarCopiaLeve = () => {
        // Remover estilos de bloqueio
        document.querySelectorAll('*').forEach(el => {
            el.style.userSelect = 'text !important';
            el.style.webkitUserSelect = 'text !important';
            el.style.MozUserSelect = 'text !important';
        });

        // Remover eventos bloqueadores
        const eventosBloqueio = [
            'selectstart', 'mousedown', 'mouseup', 'contextmenu',
            'copy', 'cut', 'paste', 'keydown', 'dragstart'
        ];
        
        eventosBloqueio.forEach(evento => {
            document.addEventListener(evento, e => {
                e.stopPropagation();
                if (evento === 'contextmenu') return true;
            }, true);
        });

        // Remover overlays de proteção
        document.querySelectorAll('div').forEach(el => {
            const estilo = getComputedStyle(el);
            if (
                estilo.position === 'fixed' && 
                estilo.zIndex > '1000' && 
                (estilo.top === '0px' || estilo.bottom === '0px') &&
                (estilo.backgroundColor === 'rgba(0, 0, 0, 0)' || estilo.backgroundColor === 'transparent')
            ) {
                el.remove();
            }
        });

        // Criar notificação flutuante
        const notificacao = document.createElement('div');
        notificacao.textContent = '✓ Cópia habilitada';
        notificacao.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: #2ecc71;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            font-size: 14px;
            animation: fadeInOut 3s forwards;
        `;
        
        document.body.appendChild(notificacao);
        
        // Remover notificação após 3 segundos
        setTimeout(() => {
            notificacao.remove();
        }, 3000);
    };

    // 2. Função para adicionar botão de cópia em elementos específicos
    const adicionarBotoesCopiar = () => {
        // Adicionar botões em elementos de texto
        const elementosTexto = document.querySelectorAll('p, h1, h2, h3, h4, h5, div');
        
        elementosTexto.forEach(el => {
            if (el.textContent.trim().length > 30 && !el.querySelector('.copiar-btn')) {
                const btn = document.createElement('button');
                btn.className = 'copiar-btn';
                btn.textContent = '📋';
                btn.title = 'Copiar texto';
                btn.style.cssText = `
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: rgba(52, 152, 219, 0.8);
                    border: none;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 2px 6px;
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 9999;
                `;
                
                el.style.position = 'relative';
                el.style.paddingRight = '30px';
                
                el.appendChild(btn);
                
                // Mostrar botão ao passar o mouse
                el.addEventListener('mouseenter', () => {
                    btn.style.opacity = '1';
                });
                
                el.addEventListener('mouseleave', () => {
                    btn.style.opacity = '0';
                });
                
                // Copiar texto ao clicar
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const texto = el.textContent.trim();
                    navigator.clipboard.writeText(texto).then(() => {
                        btn.textContent = '✓';
                        setTimeout(() => {
                            btn.textContent = '📋';
                        }, 2000);
                    });
                });
            }
        });
    };

    // 3. Inicialização segura
    const init = () => {
        try {
            // Habilitar cópia imediatamente
            habilitarCopiaLeve();
            
            // Adicionar botões após pequeno delay
            setTimeout(adicionarBotoesCopiar, 1500);
            
            // Reaplicar a cada 5 segundos para novos elementos
            setInterval(adicionarBotoesCopiar, 5000);
            
            // Adicionar estilos de animação
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(20px); }
                }
            `;
            document.head.appendChild(style);
        } catch (e) {
            console.error('Erro no Copiador Leve:', e);
        }
    };

    // Aguardar o carregamento completo da página
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
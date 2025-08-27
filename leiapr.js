// ==UserScript==
// @name         EF Mod Auto
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Mod automático para EF sem interface de token
// @author       You
// @match        https://learn.corporate.ef.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Verifica se estamos no domínio correto
    if (window.location.hostname === "learn.corporate.ef.com") {
        console.log("Domínio correto detectado. Iniciando mod...");
        
        // Obtém os cookies
        const cookies = document.cookie.split("; ");
        const efidToken = cookies.find(cookie => cookie.startsWith("efid_tokens="));
        
        if (efidToken) {
            const tokenValue = decodeURIComponent(efidToken.split("=")[1]);
            
            // Regex para extrair access e account
            const accessRegex = /"access":"(.*?)"/;
            const accountRegex = /"account":"(.*?)"/;
            
            const accessMatch = tokenValue.match(accessRegex);
            const accountMatch = tokenValue.match(accountRegex);

            if (accessMatch && accessMatch[1] && accountMatch && accountMatch[1]) {
                const access = accessMatch[1];
                const token = accountMatch[1];
                // Inicia o mod diretamente com o token
                iniciarMod(`${access}:${token}`);
            } else {
                console.log("Access ou Token não encontrados.");
            }
        } else {
            console.log("Cookie 'efid_tokens' não encontrado.");
        }
    } else {
        console.log("Você não está em learn.corporate.ef.com - Mod não iniciado.");
    }

    function iniciarMod(token) {
        console.log("Mod iniciado com token:", token);
        
        // Adiciona estilos para o mod
        const css = `
            .ef-mod-container {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(40, 40, 40, 0.95);
                border: 2px solid #3bafde;
                border-radius: 8px;
                padding: 15px;
                z-index: 10000;
                color: white;
                font-family: Arial, sans-serif;
                min-width: 250px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
            }
            .ef-mod-header {
                font-weight: bold;
                margin-bottom: 12px;
                text-align: center;
                color: #3bafde;
                font-size: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid #444;
            }
            .ef-mod-button {
                background: #3bafde;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 12px;
                margin: 6px 0;
                cursor: pointer;
                width: 100%;
                font-size: 14px;
                transition: background 0.2s;
            }
            .ef-mod-button:hover {
                background: #2a8fc7;
            }
            .ef-mod-status {
                font-size: 12px;
                text-align: center;
                margin-top: 10px;
                color: #aaa;
            }
            .ef-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #27ae60;
                color: white;
                padding: 12px 20px;
                border-radius: 5px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                z-index: 10001;
                font-family: Arial, sans-serif;
                opacity: 0;
                transition: opacity 0.3s;
            }
            .ef-mod-button.error {
                background: #e74c3c;
            }
            .ef-mod-button.error:hover {
                background: #c0392b;
            }
            .ef-mod-button.success {
                background: #27ae60;
            }
            .ef-mod-button.success:hover {
                background: #229954;
            }
        `;
        
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
        
        // Cria a interface do mod
        const modContainer = document.createElement("div");
        modContainer.className = "ef-mod-container";
        modContainer.innerHTML = `
            <div class="ef-mod-header">EF Mod Ativo</div>
            <div class="ef-mod-content">
                <button class="ef-mod-button" id="auto-answer">Respostas Automáticas</button>
                <button class="ef-mod-button" id="skip-content">Pular Conteúdo</button>
                <button class="ef-mod-button" id="mark-completed">Marcar como Concluído</button>
                <button class="ef-mod-button" id="auto-submit">Enviar Respostas</button>
                <button class="ef-mod-button success" id="find-answers">Buscar Respostas</button>
            </div>
            <div class="ef-mod-status">Token: ${token.substring(0, 10)}...</div>
        `;
        document.body.appendChild(modContainer);
        
        // Adiciona funcionalidades
        document.getElementById('auto-answer').addEventListener('click', function() {
            preencherRespostasAutomaticas();
        });
        
        document.getElementById('skip-content').addEventListener('click', function() {
            pularConteudo();
        });
        
        document.getElementById('mark-completed').addEventListener('click', function() {
            marcarComoConcluido();
        });
        
        document.getElementById('auto-submit').addEventListener('click', function() {
            enviarRespostas();
        });
        
        document.getElementById('find-answers').addEventListener('click', function() {
            buscarRespostas();
        });
        
        // Adiciona hotkeys
        document.addEventListener('keydown', function(e) {
            // Ctrl+Shift+A para respostas automáticas
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                document.getElementById('auto-answer').click();
            }
            
            // Ctrl+Shift+S para pular conteúdo
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                document.getElementById('skip-content').click();
            }
            
            // Ctrl+Shift+E para enviar respostas
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                document.getElementById('auto-submit').click();
            }
        });
        
        console.log("Interface do mod carregada com sucesso!");
        
        // Funções de funcionalidade do mod
        function preencherRespostasAutomaticas() {
            try {
                // Campos de texto
                const textInputs = document.querySelectorAll('input[type="text"], textarea');
                let filledCount = 0;
                
                if (textInputs.length > 0) {
                    textInputs.forEach(input => {
                        if (!input.value.trim()) {
                            input.value = "Resposta automática fornecida pelo EF Mod";
                            filledCount++;
                        }
                    });
                }
                
                // Questões de múltipla escolha
                const radioButtons = document.querySelectorAll('input[type="radio"]');
                let selectedCount = 0;
                
                if (radioButtons.length > 0) {
                    // Seleciona a primeira opção de cada grupo
                    const groups = {};
                    radioButtons.forEach(radio => {
                        const name = radio.getAttribute('name');
                        if (name && !groups[name]) {
                            radio.checked = true;
                            groups[name] = true;
                            selectedCount++;
                        }
                    });
                }
                
                // Checkboxes
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                if (checkboxes.length > 0) {
                    checkboxes.forEach(checkbox => {
                        if (!checkbox.checked) {
                            checkbox.checked = true;
                            selectedCount++;
                        }
                    });
                }
                
                showNotification(`Preenchido: ${filledCount} campos, ${selectedCount} seleções`);
                
            } catch (error) {
                console.error("Erro ao preencher respostas:", error);
                showNotification("Erro ao preencher respostas", true);
            }
        }
        
        function pularConteudo() {
            try {
                const nextButtons = [
                    ...document.querySelectorAll('button'),
                    ...document.querySelectorAll('a'),
                    ...document.querySelectorAll('input[type="button"]')
                ].filter(element => {
                    const text = element.textContent?.toLowerCase() || element.value?.toLowerCase() || '';
                    return text.includes('next') || text.includes('próximo') || 
                           text.includes('continue') || text.includes('continuar') ||
                           text.includes('skip') || text.includes('pular');
                });
                
                if (nextButtons.length > 0) {
                    nextButtons[0].click();
                    showNotification("Conteúdo pulado com sucesso");
                } else {
                    // Tenta encontrar elementos com classes comuns de próximo
                    const commonNextSelectors = [
                        '.next-btn',
                        '.continue-btn',
                        '.nav-next',
                        '.btn-next',
                        '[data-testid="next-button"]'
                    ];
                    
                    for (const selector of commonNextSelectors) {
                        const element = document.querySelector(selector);
                        if (element) {
                            element.click();
                            showNotification("Conteúdo pulado com sucesso");
                            return;
                        }
                    }
                    
                    showNotification("Nenhum botão 'Próximo' encontrado", true);
                }
            } catch (error) {
                console.error("Erro ao pular conteúdo:", error);
                showNotification("Erro ao pular conteúdo", true);
            }
        }
        
        function marcarComoConcluido() {
            try {
                // Checkboxes de conclusão
                const completionCheckboxes = document.querySelectorAll('input[type="checkbox"][id*="complete"], input[type="checkbox"][id*="concluir"]');
                let markedCount = 0;
                
                completionCheckboxes.forEach(checkbox => {
                    if (!checkbox.checked) {
                        checkbox.checked = true;
                        markedCount++;
                    }
                });
                
                // Botões de conclusão
                const completionButtons = [
                    ...document.querySelectorAll('button'),
                    ...document.querySelectorAll('input[type="button"]')
                ].filter(element => {
                    const text = element.textContent?.toLowerCase() || element.value?.toLowerCase() || '';
                    return text.includes('complete') || text.includes('concluir') || 
                           text.includes('finish') || text.includes('finalizar');
                });
                
                if (completionButtons.length > 0) {
                    completionButtons[0].click();
                    markedCount++;
                }
                
                if (markedCount > 0) {
                    showNotification(`Marcado ${markedCount} item(s) como concluído`);
                } else {
                    showNotification("Nenhum item de conclusão encontrado", true);
                }
                
            } catch (error) {
                console.error("Erro ao marcar como concluído:", error);
                showNotification("Erro ao marcar como concluído", true);
            }
        }
        
        function enviarRespostas() {
            try {
                // Botões de envio
                const submitButtons = [
                    ...document.querySelectorAll('button'),
                    ...document.querySelectorAll('input[type="submit"]')
                ].filter(element => {
                    const text = element.textContent?.toLowerCase() || element.value?.toLowerCase() || '';
                    return text.includes('submit') || text.includes('enviar') || 
                           text.includes('send') || text.includes('entregar');
                });
                
                if (submitButtons.length > 0) {
                    submitButtons[0].click();
                    showNotification("Respostas enviadas com sucesso");
                } else {
                    showNotification("Nenhum botão de envio encontrado", true);
                }
            } catch (error) {
                console.error("Erro ao enviar respostas:", error);
                showNotification("Erro ao enviar respostas", true);
            }
        }
        
        function buscarRespostas() {
            try {
                // Tenta encontrar perguntas e respostas
                const questions = document.querySelectorAll('[class*="question"], [class*="pergunta"]');
                
                if (questions.length > 0) {
                    showNotification(`Encontradas ${questions.length} perguntas`);
                    
                    // Simula busca por respostas (em um mod real, aqui viria a lógica de busca)
                    questions.forEach((question, index) => {
                        console.log(`Pergunta ${index + 1}:`, question.textContent?.substring(0, 100));
                    });
                } else {
                    showNotification("Nenhuma pergunta encontrada", true);
                }
            } catch (error) {
                console.error("Erro ao buscar respostas:", error);
                showNotification("Erro ao buscar respostas", true);
            }
        }
    }

    function showNotification(message, isError = false) {
        const notification = document.createElement("div");
        notification.className = "ef-notification";
        notification.style.backgroundColor = isError ? "#e74c3c" : "#27ae60";
        notification.innerText = message;
        document.body.appendChild(notification);
        
        // Mostra a notificação
        setTimeout(() => {
            notification.style.opacity = "1";
        }, 10);
        
        // Esconde após 3 segundos
        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
})();
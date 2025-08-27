(function() {
    if (window.location.hostname === "learn.corporate.ef.com") {
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
        console.log("Você não está em learn.corporate.ef.com");
    }

    function iniciarMod(token) {
        console.log("Mod iniciado com token:", token);
        
        // ===== CÓDIGO DO MOD =====
        
        // 1. Adicionar estilos CSS personalizados
        const css = `
            .mod-container {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(40, 40, 40, 0.9);
                border: 2px solid #3bafde;
                border-radius: 8px;
                padding: 10px;
                z-index: 9999;
                color: white;
                font-family: Arial, sans-serif;
                min-width: 200px;
            }
            .mod-header {
                font-weight: bold;
                margin-bottom: 10px;
                text-align: center;
                color: #3bafde;
            }
            .mod-button {
                background: #3bafde;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                margin: 5px 0;
                cursor: pointer;
                width: 100%;
            }
            .mod-button:hover {
                background: #2a8fc7;
            }
        `;
        
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
        
        // 2. Criar interface do mod
        const modContainer = document.createElement("div");
        modContainer.className = "mod-container";
        modContainer.innerHTML = `
            <div class="mod-header">EF Mod</div>
            <div class="mod-content">
                <button class="mod-button" id="auto-answer">Respostas Automáticas</button>
                <button class="mod-button" id="skip-content">Pular Conteúdo</button>
                <button class="mod-button" id="mark-completed">Marcar como Concluído</button>
            </div>
        `;
        document.body.appendChild(modContainer);
        
        // 3. Funcionalidade de respostas automáticas
        document.getElementById('auto-answer').addEventListener('click', function() {
            const answerInputs = document.querySelectorAll('input[type="text"], textarea');
            answerInputs.forEach(input => {
                input.value = "Resposta automática fornecida pelo mod";
            });
            
            const multipleChoices = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
            if (multipleChoices.length > 0) {
                multipleChoices[0].click();
            }
            
            showNotification("Respostas preenchidas automaticamente");
        });
        
        // 4. Funcionalidade de pular conteúdo
        document.getElementById('skip-content').addEventListener('click', function() {
            const nextButtons = document.querySelectorAll('button:contains("Next"), button:contains("Próximo")');
            if (nextButtons.length > 0) {
                nextButtons[0].click();
                showNotification("Conteúdo pulado");
            } else {
                showNotification("Nenhum botão 'Próximo' encontrado", true);
            }
        });
        
        // 5. Funcionalidade de marcar como concluído
        document.getElementById('mark-completed').addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            
            const completeButtons = document.querySelectorAll('button:contains("Complete"), button:contains("Concluir")');
            if (completeButtons.length > 0) {
                completeButtons[0].click();
            }
            
            showNotification("Atividade marcada como concluída");
        });
        
        // 6. Adicionar hotkeys
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
            
            // Ctrl+Shift+M para marcar como concluído
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                document.getElementById('mark-completed').click();
            }
        });
        
        // ===== FIM DO CÓDIGO DO MOD =====
    }

    // Função de notificação (mantida para feedback do usuário)
    function showNotification(message, isError = false) {
        const notification = document.createElement("div");
        notification.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background-color: ${isError ? "#e74c3c" : "#27ae60"}; color: white;
            padding: 10px 20px; border-radius: 5px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            z-index: 10000; font-family: Arial, sans-serif;
        `;
        notification.innerText = message;
        document.body.appendChild(notification);

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
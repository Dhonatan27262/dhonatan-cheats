// ================= SISTEMA ANTI-DETECÇÃO AVANÇADO =================
let antiDetectionEnabled = true;
let randomBehaviorEnabled = true;
let humanPatternsEnabled = true;
let cleanupTracesEnabled = true;

// Funções de proteção avançada
const AntiDetectionSystem = {
    // Variáveis de estado
    lastActionTime: Date.now(),
    activityPattern: [],
    mouseMovements: [],
    
    // Aleatorização de comportamento
    randomizeTiming: function(baseDelay) {
        if (!randomBehaviorEnabled) return baseDelay;
        
        // Variação de 30% para mais ou para menos
        const variation = baseDelay * 0.3;
        const randomVariation = (Math.random() * variation * 2) - variation;
        return Math.max(0.5, baseDelay + randomVariation);
    },
    
    // Padrões humanos de mouse
    simulateHumanMouseMovement: function(element) {
        if (!humanPatternsEnabled || !element) return;
        
        try {
            const rect = element.getBoundingClientRect();
            const targetX = rect.left + (rect.width / 2);
            const targetY = rect.top + (rect.height / 2);
            
            // Gerar pontos intermediários para movimento curvo
            const points = this.generateCurvedPath(
                Math.random() * window.innerWidth, 
                Math.random() * window.innerHeight,
                targetX,
                targetY,
                3 + Math.floor(Math.random() * 3)
            );
            
            // Mover o mouse através dos pontos
            points.forEach((point, index) => {
                setTimeout(() => {
                    const mouseMoveEvent = new MouseEvent('mousemove', {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        clientX: point.x,
                        clientY: point.y
                    });
                    document.dispatchEvent(mouseMoveEvent);
                    
                    // Registrar movimento para análise de padrão
                    this.mouseMovements.push({
                        x: point.x,
                        y: point.y,
                        t: Date.now()
                    });
                }, index * (50 + Math.random() * 100));
            });
            
            // Limitar o histórico de movimentos
            if (this.mouseMovements.length > 100) {
                this.mouseMovements = this.mouseMovements.slice(-50);
            }
        } catch (e) {
            console.debug("Simulação de mouse falhou silenciosamente");
        }
    },
    
    // Gerar caminho curvo para movimento do mouse
    generateCurvedPath: function(startX, startY, endX, endY, numPoints) {
        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            // Curva de Bézier quadrática com ponto de controle aleatório
            const controlX = (startX + endX) / 2 + (Math.random() - 0.5) * 200;
            const controlY = (startY + endY) / 2 + (Math.random() - 0.5) * 200;
            
            const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
            const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;
            
            points.push({ x, y });
        }
        return points;
    },
    
    // Clicar com comportamento humano
    humanClick: function(element) {
        if (!humanPatternsEnabled || !element) return element?.click();
        
        this.simulateHumanMouseMovement(element);
        
        setTimeout(() => {
            try {
                const rect = element.getBoundingClientRect();
                // Clicar em ponto ligeiramente aleatório dentro do elemento
                const clickX = rect.left + (rect.width * (0.3 + Math.random() * 0.4));
                const clickY = rect.top + (rect.height * (0.3 + Math.random() * 0.4));
                
                // Disparar eventos de mouse completos
                const events = [
                    new MouseEvent('mousedown', { bubbles: true, clientX: clickX, clientY: clickY }),
                    new MouseEvent('mouseup', { bubbles: true, clientX: clickX, clientY: clickY }),
                    new MouseEvent('click', { bubbles: true, clientX: clickX, clientY: clickY })
                ];
                
                events.forEach(event => {
                    setTimeout(() => {
                        element.dispatchEvent(event);
                    }, 50 + Math.random() * 100);
                });
            } catch (e) {
                // Fallback para clique normal se algo der errado
                element.click();
            }
        }, 200 + Math.random() * 300);
    },
    
    // Limpar rastros deixados pelo script
    cleanupTraces: function() {
        if (!cleanupTracesEnabled) return;
        
        try {
            // Limpar assinaturas no DOM
            document.querySelectorAll('[class*="santos"], [id*="santos"]').forEach(el => {
                el.removeAttribute('data-added');
                el.removeAttribute('data-modified');
            });
            
            // Limpar variáveis globais não essenciais
            Object.keys(window).forEach(key => {
                if (key.includes('santos') && key !== 'santosConfig') {
                    try { delete window[key]; } catch (e) {}
                }
            });
            
            // Limpar intervalos e timeouts criados pelo script
            const maxId = setTimeout(() => {}, 0);
            for (let i = 1; i < maxId; i++) {
                try {
                    clearTimeout(i);
                    clearInterval(i);
                } catch (e) {}
            }
        } catch (e) {
            console.debug("Limpeza de rastros falhou silenciosamente");
        }
    },
    
    // Ofuscar assinatura do script
    obfuscateScriptSignature: function() {
        // Renomear funções periodicamente
        setInterval(() => {
            try {
                if (window.santosConfig && Math.random() < 0.3) {
                    const newName = 'cfg_' + Math.random().toString(36).substring(2, 8);
                    window[newName] = window.santosConfig;
                    delete window.santosConfig;
                    window.santosConfig = window[newName];
                    delete window[newName];
                }
            } catch (e) {}
        }, 60000 + Math.random() * 120000);
    },
    
    // Simular comportamento humano de digitação (para campos de texto)
    simulateHumanTyping: function(element, text) {
        if (!element || !text) return;
        
        element.focus();
        let currentText = "";
        
        for (let i = 0; i < text.length; i++) {
            setTimeout(() => {
                currentText += text[i];
                element.value = currentText;
                
                // Disparar eventos de input
                const inputEvent = new Event('input', { bubbles: true });
                const changeEvent = new Event('change', { bubbles: true });
                element.dispatchEvent(inputEvent);
                element.dispatchEvent(changeEvent);
                
                // Pausas aleatórias como um humano faria
            }, 100 + Math.random() * 200 * (i % 3 === 0 ? 2 : 1));
        }
    },
    
    // Gerar padrões de atividade realistas
    generateHumanActivityPattern: function() {
        const now = Date.now();
        const timeSinceLastAction = now - this.lastActionTime;
        
        // Registrar padrão de atividade
        this.activityPattern.push({
            time: now,
            action: 'auto_click',
            delay: timeSinceLastAction
        });
        
        // Manter apenas os últimos 100 registros
        if (this.activityPattern.length > 100) {
            this.activityPattern = this.activityPattern.slice(-100);
        }
        
        this.lastActionTime = now;
        
        // Ocasionalmente simular pausas humanas (5% de chance)
        if (Math.random() < 0.05) {
            return 3000 + Math.random() * 7000; // Pausa de 3-10 segundos
        }
        
        return 0;
    },
    
    // Inicializar sistema anti-detecção
    init: function() {
        if (!antiDetectionEnabled) return;
        
        // Limpar rastros periodicamente
        setInterval(() => this.cleanupTraces(), 30000 + Math.random() * 60000);
        
        // Ofuscar assinatura do script
        this.obfuscateScriptSignature();
        
        // Monitorar eventos de desenvolvedor (F12, Ctrl+Shift+I, etc.)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C'))) {
                // Não fazer nada óbvio, mas registrar o evento
                console.debug("Ferramentas de desenvolvedor acionadas");
                this.activityPattern.push({
                    time: Date.now(),
                    action: 'devtools_opened'
                });
            }
        });
        
        console.debug("Sistema anti-detecção inicializado");
    }
};

// ================= MODIFICAÇÕES NO CÓDIGO EXISTENTE =================

// Adicionar opções anti-detecção no menu flutuante
function addAntiDetectionOptions(optionsMenu) {
    const antiDetectionHeader = document.createElement('div');
    antiDetectionHeader.style.cssText = `
        color: #ff9900;
        font-weight: bold;
        border-top: 1px solid rgba(255,255,255,0.1);
        padding-top: 10px;
        margin-top: 10px;
        user-select: none;
    `;
    antiDetectionHeader.textContent = 'Proteção Anti-Detecção';
    optionsMenu.appendChild(antiDetectionHeader);
    
    // Switch para sistema anti-detecção
    const antiDetectionOption = document.createElement('div');
    antiDetectionOption.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        color: white;
        font-size: 14px;
        user-select: none;
    `;
    antiDetectionOption.innerHTML = `
        <span>Proteção Anti-Detecção</span>
        <div id="anti-detection-toggle-switch" style="
            width: 40px;
            height: 20px;
            background: ${antiDetectionEnabled ? '#4CAF50' : '#ccc'};
            border-radius: 10px;
            position: relative;
            cursor: pointer;
        ">
            <div style="
                position: absolute;
                top: 2px;
                left: ${antiDetectionEnabled ? '22px' : '2px'};
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                transition: left 0.2s;
            "></div>
        </div>
    `;
    optionsMenu.appendChild(antiDetectionOption);
    
    // Switch para comportamento aleatório
    const randomBehaviorOption = document.createElement('div');
    randomBehaviorOption.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        color: white;
        font-size: 14px;
        user-select: none;
    `;
    randomBehaviorOption.innerHTML = `
        <span>Comportamento Aleatório</span>
        <div id="random-behavior-toggle-switch" style="
            width: 40px;
            height: 20px;
            background: ${randomBehaviorEnabled ? '#4CAF50' : '#ccc'};
            border-radius: 10px;
            position: relative;
            cursor: pointer;
        ">
            <div style="
                position: absolute;
                top: 2px;
                left: ${randomBehaviorEnabled ? '22px' : '2px'};
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                transition: left 0.2s;
            "></div>
        </div>
    `;
    optionsMenu.appendChild(randomBehaviorOption);
    
    // Switch para padrões humanos
    const humanPatternsOption = document.createElement('div');
    humanPatternsOption.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        color: white;
        font-size: 14px;
        user-select: none;
    `;
    humanPatternsOption.innerHTML = `
        <span>Padrões Humanos</span>
        <div id="human-patterns-toggle-switch" style="
            width: 40px;
            height: 20px;
            background: ${humanPatternsEnabled ? '#4CAF50' : '#ccc'};
            border-radius: 10px;
            position: relative;
            cursor: pointer;
        ">
            <div style="
                position: absolute;
                top: 2px;
                left: ${humanPatternsEnabled ? '22px' : '2px'};
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                transition: left 0.2s;
            "></div>
        </div>
    `;
    optionsMenu.appendChild(humanPatternsOption);
    
    // Switch para limpeza de rastros
    const cleanupTracesOption = document.createElement('div');
    cleanupTracesOption.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        color: white;
        font-size: 14px;
        user-select: none;
    `;
    cleanupTracesOption.innerHTML = `
        <span>Limpeza de Rastros</span>
        <div id="cleanup-traces-toggle-switch" style="
            width: 40px;
            height: 20px;
            background: ${cleanupTracesEnabled ? '#4CAF50' : '#ccc'};
            border-radius: 10px;
            position: relative;
            cursor: pointer;
        ">
            <div style="
                position: absolute;
                top: 2px;
                left: ${cleanupTracesEnabled ? '22px' : '2px'};
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                transition: left 0.2s;
            "></div>
        </div>
    `;
    optionsMenu.appendChild(cleanupTracesOption);
    
    // Event listeners para as novas opções
    antiDetectionOption.addEventListener('click', () => {
        antiDetectionEnabled = !antiDetectionEnabled;
        const switchEl = antiDetectionOption.querySelector('#anti-detection-toggle-switch');
        const innerEl = switchEl.querySelector('div');
        
        if (antiDetectionEnabled) {
            switchEl.style.background = '#4CAF50';
            innerEl.style.left = '22px';
            AntiDetectionSystem.init();
            sendToast("🛡️｜Proteção anti-detecção ATIVADA", 1500);
        } else {
            switchEl.style.background = '#ccc';
            innerEl.style.left = '2px';
            sendToast("⚠️｜Proteção anti-detecção DESATIVADA", 1500);
        }
    });
    
    randomBehaviorOption.addEventListener('click', () => {
        randomBehaviorEnabled = !randomBehaviorEnabled;
        const switchEl = randomBehaviorOption.querySelector('#random-behavior-toggle-switch');
        const innerEl = switchEl.querySelector('div');
        
        if (randomBehaviorEnabled) {
            switchEl.style.background = '#4CAF50';
            innerEl.style.left = '22px';
            sendToast("🎲｜Comportamento aleatório ATIVADO", 1500);
        } else {
            switchEl.style.background = '#ccc';
            innerEl.style.left = '2px';
            sendToast("⚙️｜Comportamento aleatório DESATIVADO", 1500);
        }
    });
    
    humanPatternsOption.addEventListener('click', () => {
        humanPatternsEnabled = !humanPatternsEnabled;
        const switchEl = humanPatternsOption.querySelector('#human-patterns-toggle-switch');
        const innerEl = switchEl.querySelector('div');
        
        if (humanPatternsEnabled) {
            switchEl.style.background = '#4CAF50';
            innerEl.style.left = '22px';
            sendToast("👤｜Padrões humanos ATIVADOS", 1500);
        } else {
            switchEl.style.background = '#ccc';
            innerEl.style.left = '2px';
            sendToast("🤖｜Padrões humanos DESATIVADOS", 1500);
        }
    });
    
    cleanupTracesOption.addEventListener('click', () => {
        cleanupTracesEnabled = !cleanupTracesEnabled;
        const switchEl = cleanupTracesOption.querySelector('#cleanup-traces-toggle-switch');
        const innerEl = switchEl.querySelector('div');
        
        if (cleanupTracesEnabled) {
            switchEl.style.background = '#4CAF50';
            innerEl.style.left = '22px';
            sendToast("🧹｜Limpeza de rastros ATIVADA", 1500);
        } else {
            switchEl.style.background = '#ccc';
            innerEl.style.left = '2px';
            sendToast("🗑️｜Limpeza de rastros DESATIVADA", 1500);
        }
    });
}

// Modificar a função createFloatingMenu para incluir as opções anti-detecção
// No final da função createFloatingMenu, antes de fechar, adicione:
addAntiDetectionOptions(optionsMenu);

// Modificar o loop de automação para usar o sistema anti-detecção
// Substituir o loop existente por:
(async () => {
    const selectors = [
        `[data-testid="choice-icon__library-choice-icon"]`,
        `[data-testid="exercise-check-answer"]`,
        `[data-testid="exercise-next-question"]`,
        `._1udzurba`,
        `._awve9b`
    ];
    
    window.khanwareDominates = true;
    
    while (window.khanwareDominates) {
        if (!autoClickEnabled || autoClickPaused) {
            await delay(2000);
            continue;
        }
        
        // Verificar se precisa simular uma pausa humana
        const humanPause = AntiDetectionSystem.generateHumanActivityPattern();
        if (humanPause > 0) {
            await delay(humanPause);
            continue;
        }
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                if (antiDetectionEnabled && humanPatternsEnabled) {
                    AntiDetectionSystem.humanClick(element);
                } else {
                    element.click();
                }
                
                const elementWithText = document.querySelector(`${selector}> div`);
                if (elementWithText?.innerText === "Mostrar resumo") {
                    sendToast("🎉｜Exercício concluído!", 3000);
                }
                
                // Delay aleatório entre ações
                const baseSpeed = parseFloat(localStorage.getItem('santosSpeed')) || 1.5;
                const randomizedDelay = AntiDetectionSystem.randomizeTiming(baseSpeed);
                await delay(randomizedDelay * 1000);
            }
        }
        
        // Limpar rastros periodicamente
        if (antiDetectionEnabled && cleanupTracesEnabled && Math.random() < 0.1) {
            AntiDetectionSystem.cleanupTraces();
        }
    }
})();

// Inicializar o sistema anti-detecção após o carregamento
setTimeout(() => {
    if (antiDetectionEnabled) {
        AntiDetectionSystem.init();
    }
}, 5000);
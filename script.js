// ================= CONFIGURAÇÕES PRINCIPAIS =================
let loadedPlugins = [];
let videoExploitEnabled = true;
let autoClickEnabled = true;
let autoClickPaused = false;
let correctAnswerSystemEnabled = true;

// ================= SISTEMA ANTI-DETECÇÃO =================
let antiDetectionEnabled = true;
let randomBehaviorEnabled = true;
let humanPatternsEnabled = true;
let cleanupTracesEnabled = true;

console.clear();
const noop = () => {};
console.warn = console.error = window.debug = noop;

const splashScreen = document.createElement('splashScreen');

class EventEmitter {
  constructor() { this.events = {}; }
  on(t, e) {
    (Array.isArray(t) ? t : [t]).forEach(t => {
      (this.events[t] = this.events[t] || []).push(e);
    });
  }
  off(t, e) {
    (Array.isArray(t) ? t : [t]).forEach(t => {
      this.events[t] && (this.events[t] = this.events[t].filter(h => h !== e));
    });
  }
  emit(t, ...e) {
    this.events[t]?.forEach(h => h(...e));
  }
  once(t, e) {
    const s = (...i) => {
      e(...i);
      this.off(t, s);
    };
    this.on(t, s);
  }
}

const plppdo = new EventEmitter();

new MutationObserver(mutationsList =>
  mutationsList.some(m => m.type === 'childList') && plppdo.emit('domChanged')
).observe(document.body, { childList: true, subtree: true });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ================= SISTEMA ANTI-DETECÇÃO AVANÇADO =================
const AntiDetectionSystem = {
    lastActionTime: Date.now(),
    activityPattern: [],
    mouseMovements: [],
    
    randomizeTiming: function(baseDelay) {
        if (!randomBehaviorEnabled) return baseDelay;
        
        const variation = baseDelay * 0.3;
        const randomVariation = (Math.random() * variation * 2) - variation;
        return Math.max(0.5, baseDelay + randomVariation);
    },
    
    simulateHumanMouseMovement: function(element) {
        if (!humanPatternsEnabled || !element) return;
        
        try {
            const rect = element.getBoundingClientRect();
            const targetX = rect.left + (rect.width / 2);
            const targetY = rect.top + (rect.height / 2);
            
            const points = this.generateCurvedPath(
                Math.random() * window.innerWidth, 
                Math.random() * window.innerHeight,
                targetX,
                targetY,
                3 + Math.floor(Math.random() * 3)
            );
            
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
                    
                    this.mouseMovements.push({
                        x: point.x,
                        y: point.y,
                        t: Date.now()
                    });
                }, index * (50 + Math.random() * 100));
            });
            
            if (this.mouseMovements.length > 100) {
                this.mouseMovements = this.mouseMovements.slice(-50);
            }
        } catch (e) {
            console.debug("Simulação de mouse falhou silenciosamente");
        }
    },
    
    generateCurvedPath: function(startX, startY, endX, endY, numPoints) {
        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const controlX = (startX + endX) / 2 + (Math.random() - 0.5) * 200;
            const controlY = (startY + endY) / 2 + (Math.random() - 0.5) * 200;
            
            const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
            const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;
            
            points.push({ x, y });
        }
        return points;
    },
    
    humanClick: function(element) {
        if (!humanPatternsEnabled || !element) return element?.click();
        
        this.simulateHumanMouseMovement(element);
        
        setTimeout(() => {
            try {
                const rect = element.getBoundingClientRect();
                const clickX = rect.left + (rect.width * (0.3 + Math.random() * 0.4));
                const clickY = rect.top + (rect.height * (0.3 + Math.random() * 0.4));
                
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
                element.click();
            }
        }, 200 + Math.random() * 300);
    },
    
    cleanupTraces: function() {
        if (!cleanupTracesEnabled) return;
        
        try {
            document.querySelectorAll('[class*="santos"], [id*="santos"]').forEach(el => {
                el.removeAttribute('data-added');
                el.removeAttribute('data-modified');
            });
            
            Object.keys(window).forEach(key => {
                if (key.includes('santos') && key !== 'santosConfig') {
                    try { delete window[key]; } catch (e) {}
                }
            });
            
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
    
    obfuscateScriptSignature: function() {
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
    
    generateHumanActivityPattern: function() {
        const now = Date.now();
        const timeSinceLastAction = now - this.lastActionTime;
        
        this.activityPattern.push({
            time: now,
            action: 'auto_click',
            delay: timeSinceLastAction
        });
        
        if (this.activityPattern.length > 100) {
            this.activityPattern = this.activityPattern.slice(-100);
        }
        
        this.lastActionTime = now;
        
        if (Math.random() < 0.05) {
            return 3000 + Math.random() * 7000;
        }
        
        return 0;
    },
    
    init: function() {
        if (!antiDetectionEnabled) return;
        
        setInterval(() => this.cleanupTraces(), 30000 + Math.random() * 60000);
        
        this.obfuscateScriptSignature();
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C'))) {
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

// ================= FUNÇÕES PRINCIPAIS =================
const findAndClickBySelector = selector => {
    const element = document.querySelector(selector);
    if (!element) return;
    
    if (antiDetectionEnabled && humanPatternsEnabled) {
        AntiDetectionSystem.humanClick(element);
    } else {
        element.click();
    }
    
    return element;
};

function sendToast(text, duration = 5000, gravity = 'bottom') {
  Toastify({
    text,
    duration,
    gravity,
    position: "center",
    stopOnFocus: true,
    style: { background: "#000000" }
  }).showToast();
}

async function showSplashScreen() {
  splashScreen.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background-color:#000;display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 0.5s ease;user-select:none;color:white;font-family:MuseoSans,sans-serif;font-size:30px;text-align:center;";
  splashScreen.innerHTML = '<span style="color:white;">MLK</span><span style="color:#ff1717;"> MAU O PROPRIO</span>';
  document.body.appendChild(splashScreen);
  setTimeout(() => splashScreen.style.opacity = '1', 10);
}

async function hideSplashScreen() {
  splashScreen.style.opacity = '0';
  setTimeout(() => splashScreen.remove(), 1000);
}

async function loadScript(url, label) {
  const response = await fetch(url);
  const script = await response.text();
  loadedPlugins.push(label);
  eval(script);
}

async function loadCss(url) {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.onload = resolve;
    document.head.appendChild(link);
  });
}

// ================= MENU FLUTUANTE COM OPÇÕES ANTI-DETECÇÃO =================
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

function createFloatingMenu() {
  const container = document.createElement('div');
  container.id = 'santos-floating-menu';
  container.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    z-index: 10000;
    transition: transform 0.3s ease, opacity 0.3s ease;
    user-select: none;
  `;

  const mainButton = document.createElement('button');
  mainButton.id = 'santos-main-btn';
  mainButton.innerHTML = 'PainelV2';
  
  mainButton.style.cssText = `
    padding: 12px 20px;
    background: linear-gradient(135deg, #ff8a00, #e52e71);
    color: white;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    font-weight: bold;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    min-width: 130px;
    outline: none;
    user-select: none;
  `;
  
  const optionsMenu = document.createElement('div');
  optionsMenu.id = 'santos-options-menu';
  optionsMenu.style.cssText = `
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 15px;
    margin-top: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    display: none;
    flex-direction: column;
    gap: 10px;
    width: 200px;
    border: 1px solid rgba(255,255,255,0.1);
    user-select: none;
  `;
  
  // Opção de tema
  const themeOption = document.createElement('div');
  themeOption.style.cssText = `
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
  themeOption.innerHTML = `
    <span>Tema</span>
    <div id="theme-toggle-switch" style="
      width: 40px;
      height: 20px;
      background: #4CAF50;
      border-radius: 10px;
      position: relative;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        top: 2px;
        left: 22px;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        transition: left 0.2s;
      "></div>
    </div>
  `;
  
  optionsMenu.appendChild(themeOption);
  
  // Switch para exploit de vídeo
  const exploitOption = document.createElement('div');
  exploitOption.style.cssText = `
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
  exploitOption.innerHTML = `
    <span>Exploit Vídeo</span>
    <div id="exploit-toggle-switch" style="
      width: 40px;
      height: 20px;
      background: ${videoExploitEnabled ? '#4CAF50' : '#ccc'};
      border-radius: 10px;
      position: relative;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        top: 2px;
        left: ${videoExploitEnabled ? '22px' : '2px'};
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        transition: left 0.2s;
      "></div>
    </div>
  `;
  optionsMenu.appendChild(exploitOption);
  
  // Switch para automação de cliques
  const autoClickOption = document.createElement('div');
  autoClickOption.style.cssText = `
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
  autoClickOption.innerHTML = `
    <span>Automação Cliques</span>
    <div id="auto-click-toggle-switch" style="
      width: 40px;
      height: 20px;
      background: ${autoClickEnabled ? '#4CAF50' : '#ccc'};
      border-radius: 10px;
      position: relative;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        top: 2px;
        left: ${autoClickEnabled ? '22px' : '2px'};
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        transition: left 0.2s;
      "></div>
    </div>
  `;
  optionsMenu.appendChild(autoClickOption);
  
  // Switch para sistema de respostas corretas
  const correctAnswerOption = document.createElement('div');
  correctAnswerOption.style.cssText = `
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
  correctAnswerOption.innerHTML = `
    <span>Sistema de Respostas</span>
    <div id="correct-answer-toggle-switch" style="
      width: 40px;
      height: 20px;
      background: ${correctAnswerSystemEnabled ? '#4CAF50' : '#ccc'};
      border-radius: 10px;
      position: relative;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        top: 2px;
        left: ${correctAnswerSystemEnabled ? '22px' : '2px'};
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        transition: left 0.2s;
      "></div>
    </div>
  `;
  optionsMenu.appendChild(correctAnswerOption);
  
  // Opção de controle de velocidade
  const speedControl = document.createElement('div');
  speedControl.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    user-select: none;
  `;
  
  const savedSpeed = localStorage.getItem('santosSpeed') || '1.5';
  
  speedControl.innerHTML = `
    <div style="display: flex; justify-content: space-between;">
      <span>Velocidade</span>
      <span id="speed-value">${savedSpeed}s</span>
    </div>
    <input type="range" min="0.5" max="60" step="0.5" value="${savedSpeed}" 
           id="speed-slider" style="width: 100%;" ${autoClickEnabled ? '' : 'disabled'}>
  `;
  
  optionsMenu.appendChild(speedControl);
  
  // Adicionar opções anti-detecção
  addAntiDetectionOptions(optionsMenu);
  
  // Botão para esconder o menu
  const hideMenuOption = document.createElement('div');
  hideMenuOption.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    background: rgba(255, 100, 100, 0.2);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
    color: #ff6b6b;
    font-size: 14px;
    user-select: none;
    margin-top: 5px;
  `;
  hideMenuOption.innerHTML = `<span>Esconder Menu</span>`;
  optionsMenu.appendChild(hideMenuOption);
  
  container.appendChild(mainButton);
  container.appendChild(optionsMenu);
  document.body.appendChild(container);
  
  // Estado do tema (dark mode ativo por padrão)
  let isDarkMode = true;
  
  function updateThemeSwitch() {
    const switchInner = themeOption.querySelector('#theme-toggle-switch > div');
    if (isDarkMode) {
      switchInner.style.left = '22px';
      themeOption.querySelector('#theme-toggle-switch').style.background = '#4CAF50';
    } else {
      switchInner.style.left = '2px';
      themeOption.querySelector('#theme-toggle-switch').style.background = '#ccc';
    }
  }
  
  themeOption.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
      DarkReader.enable();
      sendToast("🌙｜Tema escuro ativado", 1500);
    } else {
      DarkReader.disable();
      sendToast("☀️｜Tema claro ativado", 1500);
    }
    
    updateThemeSwitch();
  });
  
  exploitOption.addEventListener('click', () => {
    videoExploitEnabled = !videoExploitEnabled;
    
    const exploitSwitch = exploitOption.querySelector('#exploit-toggle-switch');
    const exploitSwitchInner = exploitSwitch.querySelector('div');
    
    if (videoExploitEnabled) {
      exploitSwitch.style.background = '#4CAF50';
      exploitSwitchInner.style.left = '22px';
      sendToast("✅｜Exploit de vídeo ATIVADO", 1500);
    } else {
      exploitSwitch.style.background = '#ccc';
      exploitSwitchInner.style.left = '2px';
      sendToast("❌｜Exploit de vídeo DESATIVADO", 1500);
    }
  });
  
  autoClickOption.addEventListener('click', () => {
    autoClickEnabled = !autoClickEnabled;
    
    const autoClickSwitch = autoClickOption.querySelector('#auto-click-toggle-switch');
    const autoClickSwitchInner = autoClickSwitch.querySelector('div');
    const speedSlider = document.getElementById('speed-slider');
    
    if (autoClickEnabled) {
      autoClickSwitch.style.background = '#4CAF50';
      autoClickSwitchInner.style.left = '22px';
      if (speedSlider) speedSlider.disabled = false;
      sendToast("🤖｜Automação de cliques ATIVADA", 1500);
    } else {
      autoClickSwitch.style.background = '#ccc';
      autoClickSwitchInner.style.left = '2px';
      if (speedSlider) speedSlider.disabled = true;
      sendToast("🖱️｜Automação de cliques DESATIVADA", 1500);
    }
  });
  
  correctAnswerOption.addEventListener('click', () => {
    correctAnswerSystemEnabled = !correctAnswerSystemEnabled;
    
    const correctAnswerSwitch = correctAnswerOption.querySelector('#correct-answer-toggle-switch');
    const correctAnswerSwitchInner = correctAnswerSwitch.querySelector('div');
    
    if (correctAnswerSystemEnabled) {
      correctAnswerSwitch.style.background = '#4CAF50';
      correctAnswerSwitchInner.style.left = '22px';
      sendToast("✅｜Sistema de respostas ATIVADO", 1500);
    } else {
      correctAnswerSwitch.style.background = '#ccc';
      correctAnswerSwitchInner.style.left = '2px';
      sendToast("❌｜Sistema de respostas DESATIVADO", 1500);
    }
  });
  
  let isMenuOpen = false;
  
  function closeMenu() {
    if (!isMenuOpen) return;
    
    isMenuOpen = false;
    optionsMenu.style.display = 'none';
    mainButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    
    autoClickPaused = false;
    sendToast("▶️｜Automação retomada", 1000);
  }
  
  function openMenu() {
    if (isMenuOpen) return;
    
    isMenuOpen = true;
    optionsMenu.style.display = 'flex';
    mainButton.style.boxShadow = '0 4px 15px rgba(255, 138, 0, 0.5)';
    
    autoClickPaused = true;
    sendToast("⏸️｜Automação pausada enquanto o menu está aberto", 1500);
  }
  
  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }
  
  mainButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });
  
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && isMenuOpen) {
      closeMenu();
    }
  });
  
  hideMenuOption.addEventListener('click', () => {
    closeMenu();
    
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    
    const reactivateBtn = document.createElement('div');
    reactivateBtn.id = 'santos-reactivate-btn';
    reactivateBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: rgba(255, 138, 0, 0.2);
      border-radius: 50%;
      cursor: pointer;
      z-index: 10000;
      transition: background 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: rgba(255,255,255,0.5);
    `;
    reactivateBtn.innerHTML = '☰';
    document.body.appendChild(reactivateBtn);
    
    reactivateBtn.addEventListener('mouseenter', () => {
      reactivateBtn.style.background = 'rgba(255, 138, 0, 0.5)';
      reactivateBtn.style.color = 'rgba(255,255,255,0.9)';
    });
    
    reactivateBtn.addEventListener('mouseleave', () => {
      reactivateBtn.style.background = 'rgba(255, 138, 0, 0.2)';
      reactivateBtn.style.color = 'rgba(255,255,255,0.5)';
    });
    
    reactivateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.style.opacity = '1';
      container.style.pointerEvents = 'auto';
      reactivateBtn.remove();
    });
  });
  
  let isDragging = false;
  let startX, startY;
  let initialX, initialY;
  let xOffset = 0, yOffset = 0;
  const DRAG_THRESHOLD = 5;
  
  mainButton.addEventListener('mousedown', startDrag);
  mainButton.addEventListener('touchstart', startDrag, { passive: false });
  
  function startDrag(e) {
    e.stopPropagation();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    startX = clientX;
    startY = clientY;
    initialX = clientX - xOffset;
    initialY = clientY - yOffset;
    
    isDragging = false;
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('mouseleave', endDrag);
  }
  
  function handleDragMove(e) {
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - startX;
    const dy = clientY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (!isDragging && distance > DRAG_THRESHOLD) {
      isDragging = true;
      if (isMenuOpen) closeMenu();
    }
    
    if (isDragging) {
      const currentX = clientX - initialX;
      const currentY = clientY - initialY;
      
      xOffset = currentX;
      yOffset = currentY;
      
      setTranslate(currentX, currentY, container);
    }
  }
  
  function endDrag(e) {
    if (isDragging) {
      localStorage.setItem('santosMenuPosition', JSON.stringify({
        x: xOffset,
        y: yOffset
      }));
    }
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('mouseleave', endDrag);
    
    isDragging = false;
  }
  
  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }
  
  const savedPosition = localStorage.getItem('santosMenuPosition');
  if (savedPosition) {
    const { x, y } = JSON.parse(savedPosition);
    xOffset = x;
    yOffset = y;
    setTranslate(x, y, container);
  }
  
  mainButton.addEventListener('mouseenter', () => {
    mainButton.style.transform = 'scale(1.05)';
    mainButton.style.boxShadow = '0 6px 20px rgba(255, 138, 0, 0.4)';
  });
  
  mainButton.addEventListener('mouseleave', () => {
    mainButton.style.transform = 'scale(1)';
    if (!isMenuOpen) {
      mainButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    }
  });
  
  const speedSlider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');
  
  if (speedSlider && speedValue) {
    speedSlider.disabled = !autoClickEnabled;
    
    speedSlider.addEventListener('input', () => {
      const value = speedSlider.value;
      speedValue.textContent = value + 's';
      localStorage.setItem('santosSpeed', value);
      sendToast(`⚡｜Velocidade: ${value}s`, 1500);
    });
  }
  
  updateThemeSwitch();
}

function setupMain() {
  const originalFetch = window.fetch;

  window.fetch = async function(input, init) {
    if (videoExploitEnabled) {
      let body;
      if (input instanceof Request) {
        body = await input.clone().text();
      } else if (init?.body) {
        body = init.body;
      }

      if (body?.includes('"operationName":"updateUserVideoProgress"')) {
        try {
          let bodyObj = JSON.parse(body);
          if (bodyObj.variables?.input) {
            const durationSeconds = bodyObj.variables.input.durationSeconds;
            bodyObj.variables.input.secondsWatched = durationSeconds;
            bodyObj.variables.input.lastSecondWatched = durationSeconds;
            body = JSON.stringify(bodyObj);
            
            if (input instanceof Request) {
              input = new Request(input, { body });
            } else {
              init.body = body;
            }
            sendToast("🔄｜Vídeo exploitado.", 1000);
          }
        } catch (e) {}
      }
    }

    const originalResponse = await originalFetch.apply(this, arguments);

    if (correctAnswerSystemEnabled) {
      try {
        const clonedResponse = originalResponse.clone();
        const responseBody = await clonedResponse.text();
        let responseObj = JSON.parse(responseBody);
        
        if (responseObj?.data?.assessmentItem?.item?.itemData) {
          let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData);
          
          if (itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
            itemData.answerArea = {
              calculator: false,
              chi2Table: false,
              periodicTable: false,
              tTable: false,
              zTable: false
            };
            
            itemData.question.content = "Assinale abaixo Criador: Mlk Mau " + `[[☃ radio 1]]`;
            itemData.question.widgets = {
              "radio 1": {
                type: "radio",
                options: {
                  choices: [{ content: "correta", correct: true }]
                }
              }
            };
            
            responseObj.data.assessmentItem.item.itemData = JSON.stringify(itemData);
            
            return new Response(JSON.stringify(responseObj), {
              status: originalResponse.status,
              statusText: originalResponse.statusText,
              headers: originalResponse.headers
            });
          }
        }
      } catch (e) {}
    }
    
    return originalResponse;
  };

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
      
      const humanPause = AntiDetectionSystem.generateHumanActivityPattern();
      if (humanPause > 0) {
        await delay(humanPause);
        continue;
      }
      
      for (const selector of selectors) {
        const element = findAndClickBySelector(selector);
        if (element) {
          const elementWithText = document.querySelector(`${selector}> div`);
          if (elementWithText?.innerText === "Mostrar resumo") {
            sendToast("🎉｜Exercício concluído!", 3000);
          }
          
          const baseSpeed = parseFloat(localStorage.getItem('santosSpeed')) || 1.5;
          const randomizedDelay = AntiDetectionSystem.randomizeTiming(baseSpeed);
          await delay(randomizedDelay * 1000);
        }
      }
      
      if (antiDetectionEnabled && cleanupTracesEnabled && Math.random() < 0.1) {
        AntiDetectionSystem.cleanupTraces();
      }
    }
  })();
}

if (!/^https?:\/\/([a-z0-9-]+\.)?khanacademy\.org/.test(window.location.href)) {
  window.location.href = "https://pt.khanacademy.org/";
} else {
  (async function init() {
    await showSplashScreen();

    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js', 'darkReaderPlugin').then(() => {
        DarkReader.setFetchMethod(window.fetch);
        DarkReader.enable();
      }),
      loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css'),
      loadScript('https://cdn.jsdelivr.net/npm/toastify-js', 'toastifyPlugin')
    ]);

    await delay(2000);
    await hideSplashScreen();

    createFloatingMenu();
    setupMain();
    
    if (antiDetectionEnabled) {
      AntiDetectionSystem.init();
    }
    
    sendToast("Carregando...!");
    setTimeout(() => {
        sendToast("Carregado", 2500);
    }, 1000);
    setTimeout(() => {
        sendToast("KHAN MENU INICIADO", 2500);
    }, 3500);
    
    console.clear();
  })();
}
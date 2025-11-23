let loadedPlugins = [];
let videoExploitEnabled = true;
let autoClickEnabled = true;
let autoClickPaused = false;
let correctAnswerSystemEnabled = true;

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
const findAndClickBySelector = selector => document.querySelector(selector)?.click();

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
  splashScreen.innerHTML = '<span style="color:white;">MLKKK</span><span style="color:#ff1717;"> MAU O PROPRIO</span>';
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
    background: linear-gradient(135deg, #667eea, #764ba2);
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
    width: 180px;
    border: 1px solid rgba(255,255,255,0.1);
    user-select: none;
  `;
  
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
    <input type="range" min="1" max="60" step="0.5" value="${savedSpeed}" 
           id="speed-slider" style="width: 100%;" ${autoClickEnabled ? '' : 'disabled'}>
  `;
  
  optionsMenu.appendChild(speedControl);
  
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
  
  const futureOptions = document.createElement('div');
  futureOptions.id = 'santos-future-options';
  futureOptions.style.cssText = `
    color: #aaa;
    font-size: 12px;
    text-align: center;
    padding: 10px;
    border-top: 1px solid rgba(255,255,255,0.1);
    margin-top: 10px;
    user-select: none;
  `;
  futureOptions.textContent = 'Mais opções em breve...';
  optionsMenu.appendChild(futureOptions);
  
  container.appendChild(mainButton);
  container.appendChild(optionsMenu);
  document.body.appendChild(container);
  
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
    mainButton.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.5)';
    
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
      background: rgba(102, 126, 234, 0.2);
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
      reactivateBtn.style.background = 'rgba(102, 126, 234, 0.5)';
      reactivateBtn.style.color = 'rgba(255,255,255,0.9)';
    });
    
    reactivateBtn.addEventListener('mouseleave', () => {
      reactivateBtn.style.background = 'rgba(102, 126, 234, 0.2)';
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
    mainButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
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

// ========== PARTE SUBSTITUÍDA: SISTEMA DE RESPOSTAS E AUTOMAÇÃO ==========

function setupMain() {
  const originalFetch = window.fetch;
  const correctAnswers = new Map();

  // Helper para frações
  const toFraction = (d) => {
      if (d === 0 || d === 1) return String(d);
      const decimals = (String(d).split('.')[1] || '').length;
      let num = Math.round(d * Math.pow(10, decimals)), den = Math.pow(10, decimals);
      const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
      const div = gcd(Math.abs(num), Math.abs(den));
      return den / div === 1 ? String(num / div) : `${num / div}/${den / div}`;
  };

  // Funções de automação de cliques
  const tryClick = (sel) => document.querySelector(sel)?.click();

  const clickButtonWithText = (text) => {
    const allButtons = document.querySelectorAll("button");
    for (const button of allButtons) {
      if (button.textContent && button.textContent.trim() === text) {
        button.click();
        sendToast(`🚀｜Botão "${text}" clicado automaticamente!`, 1500);
        return true;
      }
      const spans = button.querySelectorAll("span");
      for (const span of spans) {
        if (span.textContent && span.textContent.trim() === text) {
          button.click();
          sendToast(`🚀｜Botão "${text}" clicado automaticamente!`, 1500);
          return true;
        }
      }
    }
    return false;
  };

  // Interceptação de fetch
  window.fetch = async function (resource, init) {
    let content;
    const url = resource instanceof Request ? resource.url : resource;

    if (resource instanceof Request) {
      content = await resource.clone().text();
    } else if (init?.body) {
      content = init.body;
    }

    // VIDEO EXPLOIT
    if (videoExploitEnabled && content?.includes('"operationName":"updateUserVideoProgress"')) {
      try {
        const parsed = JSON.parse(content);
        const input = parsed.variables?.input;
        if (input) {
          input.secondsWatched = input.durationSeconds;
          input.lastSecondWatched = input.durationSeconds;
          content = JSON.stringify(parsed);
          if (resource instanceof Request) {
            resource = new Request(resource, { body: content });
          } else {
            init.body = content;
          }
          sendToast("🔄｜Vídeo exploitado.", 1000);
        }
      } catch (e) {}
    }

    // SISTEMA DE RESPOSTAS CORRETAS
    if (correctAnswerSystemEnabled && url.includes('attemptProblem') && content) {
        try {
            let bodyObj = JSON.parse(content);
            const itemId = bodyObj.variables?.input?.assessmentItemId;
            const answers = correctAnswers.get(itemId);

            if (answers?.length > 0) {
                const attemptContent = [], userInput = {};
                let attemptState = bodyObj.variables.input.attemptState ? JSON.parse(bodyObj.variables.input.attemptState) : null;

                answers.forEach(a => {
                    if (a.type === 'radio') {
                        attemptContent.push({ selectedChoiceIds: [a.choiceId] });
                        userInput[a.widgetKey] = { selectedChoiceIds: [a.choiceId] };
                    }
                    else if (a.type === 'numeric') {
                        attemptContent.push({ currentValue: a.value });
                        userInput[a.widgetKey] = { currentValue: a.value };
                        if (attemptState?.[a.widgetKey]) attemptState[a.widgetKey].currentValue = a.value;
                    }
                    else if (a.type === 'expression') {
                        attemptContent.push(a.value);
                        userInput[a.widgetKey] = a.value;
                        if (attemptState?.[a.widgetKey]) attemptState[a.widgetKey].value = a.value;
                    }
                    else if (a.type === 'grapher') {
                        const graph = { type: a.graphType, coords: a.coords, asymptote: a.asymptote || null };
                        attemptContent.push(graph);
                        userInput[a.widgetKey] = graph;
                        if (attemptState?.[a.widgetKey]) attemptState[a.widgetKey].plot = graph;
                    }
                });

                bodyObj.variables.input.attemptContent = JSON.stringify([attemptContent, []]);
                bodyObj.variables.input.userInput = JSON.stringify(userInput);
                if (attemptState) bodyObj.variables.input.attemptState = JSON.stringify(attemptState);

                content = JSON.stringify(bodyObj);
                if (resource instanceof Request) resource = new Request(resource, { body: content });
                else init.body = content;

                sendToast(`✨ ${answers.length} resposta(s) aplicada(s).`, 750);
            }
        } catch (e) { console.error(e); }
    }

    const response = await originalFetch.apply(this, arguments);

    // GET ASSESSMENT - MODIFICAÇÃO DE QUESTÕES
    if (correctAnswerSystemEnabled && url.includes('getAssessmentItem')) {
      try {
        const clone = response.clone();
        const text = await clone.text();
        const parsed = JSON.parse(text);

        let item = null;
        if (parsed?.data) {
            for (const key in parsed.data) {
                if (parsed.data[key]?.item) {
                    item = parsed.data[key].item;
                    break;
                }
            }
        }

        const itemDataRaw = item?.itemData;
        if (itemDataRaw) {
            let itemData = JSON.parse(itemDataRaw);
            const answers = [];

            for (const [key, w] of Object.entries(itemData.question.widgets || {})) {
                if (w.type === 'radio' && w.options?.choices) {
                    const choices = w.options.choices.map((c, i) => ({ ...c, id: c.id || `radio-choice-${i}` }));
                    const correct = choices.find(c => c.correct);
                    if (correct) answers.push({ type: 'radio', choiceId: correct.id, widgetKey: key });
                }
                else if (w.type === 'numeric-input' && w.options?.answers) {
                    const correct = w.options.answers.find(a => a.status === 'correct');
                    if (correct) {
                        const val = correct.answerForms?.some(f => f === 'proper' || f === 'improper')
                            ? toFraction(correct.value) : String(correct.value);
                        answers.push({ type: 'numeric', value: val, widgetKey: key });
                    }
                }
                else if (w.type === 'expression' && w.options?.answerForms) {
                    const correct = w.options.answerForms.find(f => f.considered === 'correct' || f.form === true);
                    if (correct) answers.push({ type: 'expression', value: correct.value, widgetKey: key });
                }
                else if (w.type === 'grapher' && w.options?.correct) {
                    const c = w.options.correct;
                    if (c.type && c.coords) answers.push({
                        type: 'grapher', graphType: c.type, coords: c.coords,
                        asymptote: c.asymptote || null, widgetKey: key
                    });
                }
            }

            if (answers.length > 0) {
                correctAnswers.set(item.id, answers);
            }

            // MODIFICAÇÃO VISUAL DA QUESTÃO
            if (itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
                itemData.answerArea = {
                    calculator: false,
                    chi2Table: false,
                    periodicTable: false,
                    tTable: false,
                    zTable: false,
                };

                itemData.question.content = "Assinale abaixo Criador: Mlk Mau " + `[[☃ radio 1]]`;

                itemData.question.widgets = {
                  "radio 1": {
                    type: "radio", alignment: "default", static: false, graded: true,
                    options: {
                        choices: [
                            { content: "correta", correct: true, id: "correct-choice" },
                            { content: "", correct: false, id: "incorrect-choice" }
                        ],
                        randomize: false, multipleSelect: false, displayCount: null, deselectEnabled: false
                    },
                    version: { major: 1, minor: 0 }
                  },
                };

                const modifiedData = { ...parsed };
                if (modifiedData.data) {
                    for (const key in modifiedData.data) {
                        if (modifiedData.data[key]?.item?.itemData) {
                            modifiedData.data[key].item.itemData = JSON.stringify(itemData);
                            break;
                        }
                    }
                }

                sendToast("🔓 Questão exploitada.", 750);
                return new Response(JSON.stringify(modifiedData), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            }
        }
      } catch (e) { console.error(e); }
    }

    return response;
  };

  // LOOP DE AUTOMAÇÃO DE CLIQUES
  (async () => {
    window.khanwareDominates = true;

    while (window.khanwareDominates) {
      if (!autoClickEnabled || autoClickPaused) {
        await delay(2000);
        continue;
      }

      clickButtonWithText("Vamos lá");
      clickButtonWithText("Mostrar resumo");
      tryClick(`button[aria-label^="("]`);
      tryClick(`[data-testid="exercise-check-answer"]`);
      tryClick(`[data-testid="exercise-next-question"]`);

      const speed = parseFloat(localStorage.getItem('santosSpeed')) || 1.5;
      await delay(speed * 1000);
    }
  })();
}

// ========== FIM DA PARTE SUBSTITUÍDA ==========

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
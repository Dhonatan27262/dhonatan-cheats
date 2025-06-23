let loadedPlugins = [];

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
  splashScreen.innerHTML = '<span style="color:white;">SANTOS</span><span style="color:#72ff72;">.MECZADA</span>';
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
  // Contêiner principal arrastável
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

  // Botão principal
  const mainButton = document.createElement('button');
  mainButton.id = 'santos-main-btn';
  mainButton.innerHTML = 'Santos.Mec996';
  
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
  
  // Menu de opções (inicialmente oculto)
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
  
  // Adicionar espaço para futuras opções
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
  
  // Estado do tema (dark mode ativo por padrão)
  let isDarkMode = true;
  
  // Função para atualizar o switch de tema
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
  
  // Alternar tema
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
  
  // Estado do menu
  let isMenuOpen = false;
  
  // Abrir/fechar menu
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    optionsMenu.style.display = isMenuOpen ? 'flex' : 'none';
    mainButton.style.boxShadow = isMenuOpen ? 
      '0 4px 15px rgba(255, 138, 0, 0.5)' : 
      '0 4px 15px rgba(0,0,0,0.2)';
  }
  
  mainButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });
  
  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && isMenuOpen) {
      toggleMenu();
    }
  });
  
  // Implementação do arrastar com threshold
  let isDragging = false;
  let startX, startY;
  let initialX, initialY;
  let xOffset = 0, yOffset = 0;
  const DRAG_THRESHOLD = 5; // pixels de movimento para considerar arrasto
  
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
    
    isDragging = false; // Ainda não é arrasto
    
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
    
    // Verificar se o movimento excedeu o threshold
    if (!isDragging && distance > DRAG_THRESHOLD) {
      isDragging = true;
      // Fechar menu durante o arrasto
      if (isMenuOpen) toggleMenu();
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
    // Se estava arrastando, não faz nada além de limpar
    if (isDragging) {
      // Salvar posição no localStorage
      localStorage.setItem('santosMenuPosition', JSON.stringify({
        x: xOffset,
        y: yOffset
      }));
    }
    
    // Limpar eventos
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('mouseleave', endDrag);
    
    // Resetar estado
    isDragging = false;
  }
  
  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }
  
  // Carregar posição salva
  const savedPosition = localStorage.getItem('santosMenuPosition');
  if (savedPosition) {
    const { x, y } = JSON.parse(savedPosition);
    xOffset = x;
    yOffset = y;
    setTranslate(x, y, container);
  }
  
  // Efeito hover
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
  
  // Atualizar o switch inicial
  updateThemeSwitch();
}

function setupMain() {
  const originalFetch = window.fetch;

  window.fetch = async function(input, init) {
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

    const originalResponse = await originalFetch.apply(this, arguments);

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
          
          itemData.question.content = "Desenvolvido por: ! Dhonatan Modder🔥 " + `[[☃ radio 1]]`;
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
      for (const selector of selectors) {
        findAndClickBySelector(selector);
        const element = document.querySelector(`${selector}> div`);
        if (element?.innerText === "Mostrar resumo") {
          sendToast("🎉｜Exercício concluído!", 3000);
        }
      }
      await delay(1500); 
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
    
    // Frases personalizadas na inicialização
    sendToast("DHONATAN MODDER INICIOU SEU CHEAT NO KHAN🌟 kkk!");
    setTimeout(() => {
        sendToast("Isso mesmo estudar é bom demais", 2500);
    }, 1000);
    setTimeout(() => {
        sendToast("Sou muito estudioso", 2500);
    }, 3500);
    
    console.clear();
  })();
}
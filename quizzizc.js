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

function createFloatingMenu() {
  // [O código do menu flutuante permanece EXATAMENTE igual]
  // ... (todo o código do menu flutuante da primeira script)
}

// SISTEMA DE RESPOSTAS ATUALIZADO (da segunda script)
function setupMain() {
  const originalFetch = window.fetch;
  const correctAnswers = new Map(); // Armazena respostas corretas

  const spoofPhrases = [
    "⚔️ Segue lá no Github [**@mzzvxm**](https://github.com/mzzvxm/).",
    "🌀 Chapa Máxima!",
  ];

  // Helper para frações
  const toFraction = (d) => {
    if (d === 0 || d === 1) return String(d);
    const decimals = (String(d).split('.')[1] || '').length;
    let num = Math.round(d * Math.pow(10, decimals)), den = Math.pow(10, decimals);
    const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
    const div = gcd(Math.abs(num), Math.abs(den));
    return den / div === 1 ? String(num / div) : `${num / div}/${den / div}`;
  };

  window.fetch = async function (resource, init) {
    let content;
    const url = resource instanceof Request ? resource.url : resource;

    if (resource instanceof Request) {
      content = await resource.clone().text();
    } else if (init?.body) {
      content = init.body;
    }

    // VIDEO EXPLOIT (mantido da primeira script)
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

    // SISTEMA DE RESPOSTAS CORRETAS (atualizado da segunda script)
    if (correctAnswerSystemEnabled && url.includes('attemptProblem') && content) {
      try {
        let bodyObj = JSON.parse(content);
        const itemId = bodyObj.variables?.input?.assessmentItemId;
        const answers = correctAnswers.get(itemId);

        if (answers?.length > 0) {
          const attemptContent = [], userInput = {};
          let attemptState = bodyObj.variables.input.attemptState ? 
            JSON.parse(bodyObj.variables.input.attemptState) : null;

          answers.forEach(a => {
            if (a.type === 'radio') {
              attemptContent.push({ selectedChoiceIds: [a.choiceId] });
              userInput[a.widgetKey] = { selectedChoiceIds: [a.choiceId] };
            } else if (a.type === 'numeric') {
              attemptContent.push({ currentValue: a.value });
              userInput[a.widgetKey] = { currentValue: a.value };
              if (attemptState?.[a.widgetKey]) attemptState[a.widgetKey].currentValue = a.value;
            } else if (a.type === 'expression') {
              attemptContent.push(a.value);
              userInput[a.widgetKey] = a.value;
              if (attemptState?.[a.widgetKey]) attemptState[a.widgetKey].value = a.value;
            } else if (a.type === 'grapher') {
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

    // GET ASSESSMENT - Sistema de modificação de questões
    if (correctAnswerSystemEnabled && url.includes('getAssessmentItem')) {
      try {
        const clone = response.clone();
        const text = await clone.text();
        const parsed = JSON.parse(text);

        // Localiza o item dentro da resposta
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

          // Captura as respostas corretas de todos os tipos de widgets
          for (const [key, w] of Object.entries(itemData.question.widgets || {})) {
            if (w.type === 'radio' && w.options?.choices) {
              const choices = w.options.choices.map((c, i) => ({ ...c, id: c.id || `radio-choice-${i}` }));
              const correct = choices.find(c => c.correct);
              if (correct) answers.push({ type: 'radio', choiceId: correct.id, widgetKey: key });
            } else if (w.type === 'numeric-input' && w.options?.answers) {
              const correct = w.options.answers.find(a => a.status === 'correct');
              if (correct) {
                const val = correct.answerForms?.some(f => f === 'proper' || f === 'improper') ?
                  toFraction(correct.value) : String(correct.value);
                answers.push({ type: 'numeric', value: val, widgetKey: key });
              }
            } else if (w.type === 'expression' && w.options?.answerForms) {
              const correct = w.options.answerForms.find(f => f.considered === 'correct' || f.form === true);
              if (correct) answers.push({ type: 'expression', value: correct.value, widgetKey: key });
            } else if (w.type === 'grapher' && w.options?.correct) {
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

          // Modificação visual da questão
          if (itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
            const randomPhrase = spoofPhrases[Math.floor(Math.random() * spoofPhrases.length)];

            itemData.answerArea = {
              calculator: false,
              chi2Table: false,
              periodicTable: false,
              tTable: false,
              zTable: false,
            };

            // Conteúdo da Questão atualizado
            itemData.question.content = randomPhrase + "\n\n**Tenho Outros Scripts também! depois dá uma olhada no [ScriptHub](https://scripthubb.vercel.app/)**" + `[[☃ radio 1]]` + `\n\n**〽️ Segue lá no Instagram! [@mzzvxm](https://instagram.com/mzzvxm)**`;

            // Widgets da Questão
            itemData.question.widgets = {
              "radio 1": {
                type: "radio", alignment: "default", static: false, graded: true,
                options: {
                  choices: [
                    { content: "**〽️**", correct: true, id: "correct-choice" },
                    { content: "", correct: false, id: "incorrect-choice" }
                  ],
                  randomize: false, multipleSelect: false, displayCount: null, deselectEnabled: false
                },
                version: { major: 1, minor: 0 }
              },
            };

            // Salva as alterações no JSON
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

  // Loop de automação de cliques (mantido da primeira script)
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
      
      for (const selector of selectors) {
        findAndClickBySelector(selector);
        const element = document.querySelector(`${selector}> div`);
        if (element?.innerText === "Mostrar resumo") {
          sendToast("🎉｜Exercício concluído!", 3000);
        }
      }
      
      const speed = parseFloat(localStorage.getItem('santosSpeed')) || 1.5;
      await delay(speed * 1000);
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
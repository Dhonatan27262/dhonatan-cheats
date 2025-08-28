// ==UserScript==
// @name         Leia-me Auto OpenAI Cheat (Revisado)
// @namespace    http://tampermonkey.net/
// @version      4.9
// @description  Responde perguntas e avança automaticamente no Leia-me/Odilo usando OpenAI (versão confiável) 😎
// @author       MZ
// @match        *://*odilo*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const API_KEY = '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';
    let autoMode = false;
    let processando = false;

    if (window.top !== window.self) return;

    // Estilo visual
    const style = document.createElement("style");
    style.textContent = `
        .gemini-box {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e1e2f;
            color: #fff;
            font-family: 'Segoe UI', sans-serif;
            padding: 15px 20px;
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 260px;
        }
        .gemini-box h1 {
            font-size: 16px;
            margin: 0;
            font-weight: 600;
            text-align: center;
        }
        .gemini-box h2 {
            font-size: 16px;
            margin: 0;
            font-weight: 600;
            text-align: center;
        }
        .gemini-box button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px;
            font-size: 14px;
            border-radius: 8px;
            cursor: pointer;
        }
        .gemini-box .auto-on { background: #10b981 !important; }
        .gemini-box .auto-off { background: #ef4444 !important; }
    `;
    document.head.appendChild(style);

    const ui = document.createElement("div");
    ui.className = "gemini-box";
    ui.innerHTML = `
        <h1>📘 Leia-me Cheat</h1>
        <h2>🦇 by @mzzvxm</h2>
        <button id="toggleAuto" class="auto-off">⚙️ Auto: OFF</button>
        <div id="status" style="font-size:13px; color:#ccc; text-align:center; margin-top:6px;">Aguardando</div>
    `;
    document.body.appendChild(ui);

    const btnToggle = document.getElementById("toggleAuto");
    const statusDiv = document.getElementById("status");

    btnToggle.onclick = function () {
        autoMode = !autoMode;
        this.textContent = `⚙️ Auto: ${autoMode ? 'ON' : 'OFF'}`;
        this.classList.toggle("auto-on", autoMode);
        this.classList.toggle("auto-off", !autoMode);
        if (autoMode) {
            statusDiv.textContent = "Modo automático ativado";
            iniciarLeituraAutomatica();
        } else {
            statusDiv.textContent = "Modo automático desativado";
        }
    };

    function temPerguntaAtiva() {
        return !!document.querySelector('.question-quiz-text.ng-binding') || !!document.querySelector('.question-text');
    }

    function selecionarResposta(letra) {
        const mapa = { A: 0, B: 1, C: 2, D: 3, E: 4 };
        const index = mapa[letra.toUpperCase()];
        if (index === undefined) return false;

        const radios = document.querySelectorAll('md-radio-button.choice-radio-button');
        const opcoesTexto = document.querySelectorAll('.choice-student.choice-new-styles__answer, .answer-option');

        if (radios[index]) radios[index].click();
        if (opcoesTexto[index]) opcoesTexto[index].click();

        return !!(radios[index] || opcoesTexto[index]);
    }

    function clicarBotaoQuiz() {
        return new Promise((resolve, reject) => {
            const tentarClique = () => {
                const container = document.querySelector('md-dialog-actions.quiz-dialog-buttons');
                if (!container) return false;

                const btnTerminar = container.querySelector('button[ng-click="finish()"]');
                if (btnTerminar && btnTerminar.offsetParent !== null && !btnTerminar.disabled) {
                    btnTerminar.click();

                    const obsEnviar = new MutationObserver((mutations, obs) => {
                        const btnEnviar = container.querySelector('button[ng-click="sendAnswer()"]');
                        if (btnEnviar && btnEnviar.offsetParent !== null && !btnEnviar.disabled) {
                            btnEnviar.click();
                            obs.disconnect();
                            setTimeout(() => {
                                esperarEClicarFechar();
                                resolve(true);
                            }, 500);
                        }
                    });

                    obsEnviar.observe(container, { childList: true, subtree: true });

                    setTimeout(() => {
                        obsEnviar.disconnect();
                        reject("❌ Botão Enviar não apareceu a tempo.");
                    }, 5000);

                    return true;
                }

                const btnProximo = container.querySelector('button[ng-click="next()"]');
                if (btnProximo && btnProximo.offsetParent !== null && !btnProximo.disabled) {
                    btnProximo.click();
                    resolve(true);
                    return true;
                }

                return false;
            };

            if (tentarClique()) return;

            const obsInit = new MutationObserver((mutations, obs) => {
                const container = document.querySelector('md-dialog-actions.quiz-dialog-buttons');
                if (container) {
                    obs.disconnect();
                    clicarBotaoQuiz().then(resolve).catch(reject);
                }
            });
            obsInit.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                obsInit.disconnect();
                reject("❌ Container de botões não apareceu.");
            }, 5000);
        });
    }

    async function avancarPergunta() {
        try {
            const clicou = await clicarBotaoQuiz();
            return clicou;
        } catch (e) {
            console.warn("Erro ao tentar clicar no botão Terminar ou Próximo:", e);
            return false;
        }
    }

    async function avancarPaginaLivro() {
        const esperarBotao = () =>
            new Promise(resolve => {
                const tentar = () => {
                    const btn = document.querySelector('button#right-page-btn');
                    if (btn && !btn.disabled) {
                        btn.click();
                        statusDiv.textContent = "Página avançada";
                        resolve(true);
                    } else {
                        setTimeout(tentar, 1000);
                    }
                };
                tentar();
            });

        const btn = document.querySelector('button#right-page-btn');
        if (btn && !btn.disabled) {
            btn.click();
            statusDiv.textContent = "Avançou página";
            return true;
        } else {
            statusDiv.textContent = "Esperando botão de próxima página...";
            await esperarBotao();
            return true;
        }
    }

    async function chamarOpenAI(pergunta, alternativas) {
        const prompt = `
Responda apenas a letra correta (A, B, C, D ou E) para a seguinte pergunta de múltipla escolha. Sem explicações.

Pergunta: ${pergunta}

Alternativas:
${alternativas.map((alt, i) => `${String.fromCharCode(65 + i)}) ${alt}`).join("\n")}
        `.trim();

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 10,
                    temperature: 0
                })
            });

            const textRaw = await response.text(); // log detalhado
            console.log("📤 OpenAI Raw Response:", textRaw);
            const data = JSON.parse(textRaw);
            const texto = data?.choices?.[0]?.message?.content || "";
            const letra = (texto.match(/\b[A-E]\b/i) || [])[0]?.toUpperCase();

            console.log("💬 Resposta OpenAI:", texto);
            console.log("✅ Letra extraída:", letra);

            return letra || null;

        } catch (error) {
            console.error("Erro na chamada OpenAI:", error);
            statusDiv.textContent = "Erro na API OpenAI";
            return null;
        }
    }

    async function processarPergunta() {
        if (processando) return;
        processando = true;

        try {
            const perguntaEl = document.querySelector('.question-quiz-text.ng-binding') || document.querySelector('.question-text');
            if (!perguntaEl) {
                statusDiv.textContent = "Nenhuma pergunta ativa";
                processando = false;
                return;
            }

            const pergunta = perguntaEl.innerText.trim();
            const opcoes = [...document.querySelectorAll('.choice-student.choice-new-styles__answer, .answer-option')]
                .map(el => el.innerText.trim())
                .filter(text => text.length > 0);

            if (!pergunta || opcoes.length === 0) {
                statusDiv.textContent = "Pergunta ou opções vazias";
                processando = false;
                return;
            }

            statusDiv.textContent = "Pergunta detectada. Chamando OpenAI...";
            console.log("📘 Pergunta:", pergunta);
            console.log("🔢 Opções:", opcoes);

            const letra = await chamarOpenAI(pergunta, opcoes);

            if (letra) {
                statusDiv.textContent = `Resposta OpenAI: ${letra}. Selecionando...`;

                if (selecionarResposta(letra)) {
                    statusDiv.textContent = "Resposta marcada. Avançando...";
                    await new Promise(r => setTimeout(r, 1500));
                    await avancarPergunta();
                    await new Promise(r => setTimeout(r, 3000));
                } else {
                    statusDiv.textContent = "Letra reconhecida, mas não clicável";
                    console.warn("❌ Letra reconhecida mas não clicável:", letra);
                }
            } else {
                statusDiv.textContent = "Resposta OpenAI não obtida";
                console.warn("⚠️ Não foi possível identificar a resposta da IA");
            }
        } finally {
            processando = false;
        }
    }

    async function iniciarLeituraAutomatica() {
        statusDiv.textContent = "Iniciando modo automático...";
        while (autoMode) {
            if (temPerguntaAtiva()) {
                await processarPergunta();
            } else {
                await avancarPaginaLivro();
                const tempoLeitura = Math.floor(Math.random() * (60000 - 40000 + 1)) + 40000;
                await new Promise(r => setTimeout(r, tempoLeitura));
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        statusDiv.textContent = "Modo automático desativado";
    }

    function esperarEClicarFechar() {
        const tentarCliqueFechar = () => {
            const btnFechar = document.querySelector('md-toolbar button.md-icon-button[ng-click="close()"]');
            if (btnFechar && btnFechar.offsetParent !== null && !btnFechar.disabled) {
                btnFechar.click();
                return true;
            }
            return false;
        };

        if (tentarCliqueFechar()) return;

        const obsFechar = new MutationObserver(() => {
            if (tentarCliqueFechar()) {
                obsFechar.disconnect();
            }
        });

        obsFechar.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => obsFechar.disconnect(), 5000);
    }

})();
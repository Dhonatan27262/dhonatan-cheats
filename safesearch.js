(() => {
  "use strict";

  if (window.__KhanStudyAssistantV2) return;
  window.__KhanStudyAssistantV2 = true;

  const KEY = "study_openrouter_key_v2";
  let capturedQuestion = "";
  let capturedOptions = [];
  let resultBox = null;

  // =========================
  // ESTILO
  // =========================

  const style = document.createElement("style");

  style.textContent = `
    #ksa-panel {
      position:fixed;
      right:8px;
      bottom:70px;
      width:245px;
      z-index:2147483647;
      background:#111827;
      color:white;
      border:1px solid #374151;
      border-radius:12px;
      padding:9px;
      font-family:Arial,sans-serif;
      box-shadow:0 6px 25px rgba(0,0,0,.45);
    }

    #ksa-panel input,
    #ksa-panel select {
      width:100%;
      box-sizing:border-box;
      margin-bottom:6px;
      padding:7px;
      border-radius:6px;
      border:1px solid #374151;
      background:#1f2937;
      color:white;
      font-size:10px;
    }

    #ksa-panel button {
      width:100%;
      border:0;
      border-radius:6px;
      padding:8px;
      margin-top:5px;
      color:white;
      font-size:10px;
      font-weight:bold;
    }

    #ksa-capture {
      background:#374151;
    }

    #ksa-analyze {
      background:#4f46e5;
    }

    #ksa-status {
      margin-top:7px;
      color:#9ca3af;
      font-size:9px;
      line-height:1.3;
    }

    #ksa-result {
      position:fixed;
      left:50%;
      bottom:18px;
      transform:translateX(-50%);
      width:min(88vw,430px);
      max-height:50vh;
      overflow:auto;
      z-index:2147483647;
      background:#111827;
      color:white;
      border:1px solid #4b5563;
      border-radius:12px;
      padding:13px;
      box-sizing:border-box;
      font-family:Arial,sans-serif;
      font-size:13px;
      line-height:1.45;
      white-space:pre-wrap;
      box-shadow:0 8px 35px rgba(0,0,0,.6);
    }

    #ksa-floating {
      position:fixed;
      right:8px;
      bottom:15px;
      width:42px;
      height:42px;
      border:0;
      border-radius:50%;
      background:#4f46e5;
      color:white;
      z-index:2147483646;
      font-size:18px;
      box-shadow:0 4px 15px rgba(0,0,0,.4);
    }
  `;

  document.head.appendChild(style);

  // =========================
  // PAINEL
  // =========================

  const panel = document.createElement("div");
  panel.id = "ksa-panel";

  panel.innerHTML = `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:7px;
      font-size:11px;
      font-weight:bold;
    ">
      <span>📚 Assistente V2</span>
      <button id="ksa-close" style="
        width:auto;
        margin:0;
        padding:0 4px;
        background:none;
        color:#9ca3af;
        font-size:17px;
      ">×</button>
    </div>

    <input
      id="ksa-key"
      type="password"
      placeholder="🔑 OpenRouter API Key"
    >

    <select id="ksa-model">
      <option value="openai/gpt-4o-mini">
        GPT-4o Mini
      </option>
      <option value="google/gemini-2.0-flash-001">
        Gemini Flash
      </option>
      <option value="deepseek/deepseek-chat">
        DeepSeek
      </option>
    </select>

    <button id="ksa-capture">
      📋 CAPTURAR QUESTÃO
    </button>

    <button id="ksa-analyze">
      🧠 ANALISAR
    </button>

    <div id="ksa-status">
      Pronto.
    </div>
  `;

  document.body.appendChild(panel);

  const keyInput =
    document.getElementById("ksa-key");

  const modelInput =
    document.getElementById("ksa-model");

  const status =
    document.getElementById("ksa-status");

  keyInput.value =
    localStorage.getItem(KEY) || "";

  // =========================
  // LIMPEZA DE TEXTO
  // =========================

  function cleanText(text) {

    return String(text || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n\s*\n+/g, "\n\n")
      .trim();
  }

  // =========================
  // ELEMENTOS VISÍVEIS
  // =========================

  function isVisible(el) {

    if (!el) return false;

    const rect =
      el.getBoundingClientRect();

    const style =
      window.getComputedStyle(el);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  // =========================
  // CAPTURA
  // =========================

  function captureQuestion() {

    capturedQuestion = "";
    capturedOptions = [];

    /*
     * Primeiro tenta áreas específicas
     * usadas pelo exercício.
     */

    const questionSelectors = [
      '[data-testid*="question"]',
      '[data-testid*="exercise"]',
      '[class*="question"]',
      '[class*="Question"]'
    ];

    let candidates = [];

    for (const selector of questionSelectors) {

      try {

        candidates.push(
          ...document.querySelectorAll(selector)
        );

      } catch {}
    }

    candidates =
      [...new Set(candidates)]
      .filter(isVisible);

    /*
     * Escolhe o menor elemento visível
     * que tenha texto significativo.
     */

    candidates.sort(
      (a, b) =>
        (a.innerText || "").length -
        (b.innerText || "").length
    );

    for (const element of candidates) {

      const text =
        cleanText(element.innerText);

      if (
        text.length >= 20 &&
        text.length < 10000
      ) {

        capturedQuestion = text;
        break;
      }
    }

    /*
     * Fallback.
     */

    if (!capturedQuestion) {

      capturedQuestion =
        cleanText(document.body.innerText)
          .slice(0, 10000);
    }

    // =========================
    // ALTERNATIVAS
    // =========================

    const possibleOptions = [
      ...document.querySelectorAll(
        'input[type="radio"]'
      ),
      ...document.querySelectorAll(
        'input[type="checkbox"]'
      ),
      ...document.querySelectorAll(
        'button'
      )
    ];

    const seen = new Set();

    for (const element of possibleOptions) {

      if (!isVisible(element))
        continue;

      let text = "";

      /*
       * Procura texto associado.
       */

      const parent =
        element.closest("label") ||
        element.parentElement;

      if (parent)
        text = cleanText(parent.innerText);

      if (!text)
        text = cleanText(element.innerText);

      if (
        text &&
        text.length <= 500 &&
        !seen.has(text)
      ) {

        seen.add(text);
        capturedOptions.push(text);
      }
    }

    /*
     * Remove textos obviamente pertencentes
     * à interface.
     */

    const ignored = [
      "capturar questão",
      "analisar",
      "assistente",
      "mostrar resumo",
      "vamos lá",
      "próxima questão",
      "verificar",
      "continuar"
    ];

    capturedOptions =
      capturedOptions.filter(option => {

        const lower =
          option.toLowerCase();

        return !ignored.some(
          word => lower === word
        );
      });

    status.textContent =
      `✅ Questão capturada. ` +
      `${capturedOptions.length} possível(is) alternativa(s).`;

    /*
     * Mostra uma prévia curta.
     */

    let preview =
      "📋 QUESTÃO CAPTURADA\n\n" +
      capturedQuestion;

    if (capturedOptions.length) {

      preview +=
        "\n\n📌 OPÇÕES VISÍVEIS:\n" +
        capturedOptions
          .map((x, i) =>
            `${i + 1}. ${x}`
          )
          .join("\n");
    }

    showResult(preview, 4000);
  }

  // =========================
  // RESULTADO
  // =========================

  function showResult(text, duration = 0) {

    if (!resultBox) {

      resultBox =
        document.createElement("div");

      resultBox.id =
        "ksa-result";

      document.body.appendChild(resultBox);
    }

    resultBox.textContent = text;
    resultBox.style.display = "block";

    if (duration) {

      setTimeout(() => {

        if (resultBox)
          resultBox.style.display = "none";

      }, duration);
    }
  }

  // =========================
  // ANÁLISE
  // =========================

  async function analyzeQuestion() {

    const apiKey =
      keyInput.value.trim();

    if (!apiKey) {

      status.textContent =
        "⚠️ Informe a chave OpenRouter.";

      return;
    }

    if (!capturedQuestion) {

      captureQuestion();

      if (!capturedQuestion)
        return;
    }

    localStorage.setItem(
      KEY,
      apiKey
    );

    status.textContent =
      "🧠 Analisando cuidadosamente...";

    let optionsText = "";

    if (capturedOptions.length) {

      optionsText =
        "\n\nALTERNATIVAS VISÍVEIS:\n" +
        capturedOptions
          .map((x, i) =>
            `${String.fromCharCode(65 + i)}) ${x}`
          )
          .join("\n");
    }

    const prompt = `
Você é um professor extremamente rigoroso.

Analise a questão abaixo usando SOMENTE as informações fornecidas.

QUESTÃO:
${capturedQuestion}

${optionsText}

REGRAS:

1. Resolva a questão antes de responder.
2. Faça os cálculos mentalmente quando necessário.
3. Se houver alternativas, compare-as individualmente.
4. Não escolha uma alternativa apenas por parecer plausível.
5. Se for uma questão matemática, confira o resultado.
6. Se houver dados em tabela, gráfico ou texto, use esses dados.
7. Se a questão pedir associação, ordenação, gráfico ou preenchimento, explique exatamente o que deve ser feito.
8. Não invente alternativas que não foram fornecidas.
9. Se os dados forem insuficientes para determinar uma resposta, diga isso claramente.
10. Seja extremamente objetivo.

FORMATO OBRIGATÓRIO:

RESPOSTA: [resposta final]

JUSTIFICATIVA:
[explicação curta, no máximo 3 frases]

CONFIANÇA: [alta/média/baixa]
`;

    try {

      const response =
        await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Authorization":
                `Bearer ${apiKey}`
            },

            body: JSON.stringify({

              model:
                modelInput.value,

              messages: [

                {
                  role: "system",

                  content:
                    "Você é um tutor especializado em resolver questões acadêmicas com precisão. Seja objetivo e confira sua resposta antes de apresentá-la."
                },

                {
                  role: "user",

                  content: prompt
                }

              ],

              temperature: 0,

              max_tokens: 500
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data?.error?.message ||
          `Erro HTTP ${response.status}`
        );
      }

      const answer =
        data?.choices?.[0]?.message?.content;

      if (!answer) {

        throw new Error(
          "O modelo não retornou uma resposta."
        );
      }

      status.textContent =
        "✅ Análise concluída.";

      showResult(
        "🧠 RESULTADO\n\n" +
        answer,
        0
      );

    } catch (error) {

      console.error(error);

      status.textContent =
        "❌ Falha na análise.";

      showResult(
        "❌ ERRO\n\n" +
        error.message,
        5000
      );
    }
  }

  // =========================
  // BOTÃO FLUTUANTE
  // =========================

  const floating =
    document.createElement("button");

  floating.id =
    "ksa-floating";

  floating.textContent = "📚";

  document.body.appendChild(floating);

  floating.onclick = () => {

    const visible =
      panel.style.display !== "none";

    panel.style.display =
      visible ? "none" : "block";
  };

  // =========================
  // EVENTOS
  // =========================

  document
    .getElementById("ksa-capture")
    .onclick =
      captureQuestion;

  document
    .getElementById("ksa-analyze")
    .onclick =
      analyzeQuestion;

  document
    .getElementById("ksa-close")
    .onclick = () => {

      panel.style.display = "none";
    };

  status.textContent =
    "🟢 Assistente V2 carregado.";

})();
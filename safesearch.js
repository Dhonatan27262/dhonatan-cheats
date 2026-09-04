(() => {
  "use strict";

  if (window.__studyAssistantOpenRouter) return;
  window.__studyAssistantOpenRouter = true;

  const STORAGE_KEY = "study_openrouter_key";

  // =========================
  // ESTADO
  // =========================

  let capturedText = "";
  let resultTimer = null;

  // =========================
  // PAINEL
  // =========================

  const panel = document.createElement("div");

  panel.style.cssText = `
    position:fixed;
    right:10px;
    bottom:80px;
    width:270px;
    z-index:2147483647;
    background:#111;
    color:#fff;
    border:1px solid #444;
    border-radius:12px;
    padding:10px;
    font-family:Arial,sans-serif;
    box-shadow:0 5px 25px rgba(0,0,0,.5);
  `;

  panel.innerHTML = `
    <div style="
      font-size:12px;
      font-weight:bold;
      margin-bottom:8px;
      display:flex;
      justify-content:space-between;
    ">
      <span>📚 Assistente de estudos</span>
      <button id="sa-close" style="
        background:none;
        border:0;
        color:#aaa;
        font-size:18px;
      ">×</button>
    </div>

    <input
      id="sa-api"
      type="password"
      placeholder="🔑 Chave OpenRouter"
      style="
        width:100%;
        box-sizing:border-box;
        padding:8px;
        margin-bottom:7px;
        border-radius:7px;
        border:1px solid #444;
        background:#222;
        color:white;
        font-size:11px;
      "
    >

    <select id="sa-model" style="
      width:100%;
      padding:7px;
      margin-bottom:7px;
      border-radius:7px;
      border:1px solid #444;
      background:#222;
      color:white;
      font-size:11px;
    ">
      <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
      <option value="google/gemini-2.0-flash-001">Gemini Flash</option>
      <option value="deepseek/deepseek-chat">DeepSeek Chat</option>
    </select>

    <button id="sa-capture" style="
      width:100%;
      padding:8px;
      margin-bottom:6px;
      border:0;
      border-radius:7px;
      background:#333;
      color:white;
      font-weight:bold;
      font-size:11px;
    ">
      📋 Capturar questão
    </button>

    <button id="sa-analyze" style="
      width:100%;
      padding:8px;
      border:0;
      border-radius:7px;
      background:#5865f2;
      color:white;
      font-weight:bold;
      font-size:11px;
    ">
      🤖 Analisar questão
    </button>

    <div id="sa-status" style="
      margin-top:7px;
      color:#aaa;
      font-size:10px;
    ">
      Pronto.
    </div>
  `;

  document.body.appendChild(panel);

  const apiInput = panel.querySelector("#sa-api");
  const modelInput = panel.querySelector("#sa-model");
  const status = panel.querySelector("#sa-status");

  apiInput.value =
    localStorage.getItem(STORAGE_KEY) || "";

  // =========================
  // CAPTURAR TEXTO VISÍVEL
  // =========================

  function captureQuestion() {

    const selectors = [
      '[data-testid="exercise-question"]',
      '[data-testid="exercise-content"]',
      '[data-testid="question-content"]',
      '[class*="question"]',
      '[class*="exercise"]'
    ];

    let elements = [];

    for (const selector of selectors) {
      try {
        elements.push(
          ...document.querySelectorAll(selector)
        );
      } catch {}
    }

    // Remove duplicados
    elements = [...new Set(elements)];

    let text = elements
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map(el => el.innerText || "")
      .filter(Boolean)
      .join("\n\n");

    // Fallback: texto visível da página
    if (!text.trim()) {
      text = document.body.innerText || "";
    }

    // Limita o tamanho enviado
    text = text.trim().slice(0, 12000);

    capturedText = text;

    if (!capturedText) {
      status.textContent =
        "⚠️ Nenhum texto visível encontrado.";
      return;
    }

    status.textContent =
      `✅ Capturado: ${capturedText.length} caracteres.`;

    showResult(
      "📋 QUESTÃO CAPTURADA\n\n" +
      capturedText,
      5000
    );
  }

  // =========================
  // CAIXA DE RESULTADO
  // =========================

  function showResult(text, duration = 3000) {

    let box = document.getElementById(
      "study-assistant-result"
    );

    if (!box) {

      box = document.createElement("div");

      box.id =
        "study-assistant-result";

      box.style.cssText = `
        position:fixed;
        left:50%;
        bottom:20px;
        transform:translateX(-50%);
        max-width:85vw;
        max-height:55vh;
        overflow:auto;
        z-index:2147483647;
        background:#111;
        color:white;
        border:1px solid #555;
        border-radius:12px;
        padding:12px;
        font-family:Arial,sans-serif;
        font-size:13px;
        line-height:1.4;
        white-space:pre-wrap;
        box-shadow:0 5px 30px rgba(0,0,0,.6);
      `;

      document.body.appendChild(box);
    }

    box.textContent = text;
    box.style.display = "block";

    clearTimeout(resultTimer);

    if (duration > 0) {
      resultTimer = setTimeout(() => {
        box.style.display = "none";
      }, duration);
    }
  }

  // =========================
  // OPENROUTER
  // =========================

  async function analyzeQuestion() {

    const key =
      apiInput.value.trim();

    if (!key) {
      status.textContent =
        "⚠️ Coloque sua chave OpenRouter.";
      return;
    }

    if (!capturedText) {
      captureQuestion();

      if (!capturedText) return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      key
    );

    status.textContent =
      "⏳ Analisando...";

    try {

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${key}`
          },

          body: JSON.stringify({
            model:
              modelInput.value,

            messages: [
              {
                role: "system",
                content:
                  `Você é um tutor de estudos.
Analise a questão fornecida pelo estudante.
Explique o raciocínio de forma clara.
Se houver alternativas, analise cada uma.
Não invente informações que não estejam presentes.
Apresente a conclusão de forma objetiva.`
              },
              {
                role: "user",
                content:
                  `Resolva/analyse esta questão:

${capturedText}`
              }
            ],

            temperature: 0.1
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
          `HTTP ${response.status}`
        );
      }

      const answer =
        data?.choices?.[0]?.message?.content;

      if (!answer) {
        throw new Error(
          "O modelo não retornou texto."
        );
      }

      status.textContent =
        "✅ Análise concluída.";

      showResult(
        "🤖 ANÁLISE\n\n" +
        answer,
        0
      );

    } catch (error) {

      console.error(error);

      status.textContent =
        "❌ Erro.";

      showResult(
        "❌ ERRO\n\n" +
        error.message,
        5000
      );
    }
  }

  // =========================
  // EVENTOS
  // =========================

  panel.querySelector(
    "#sa-capture"
  ).addEventListener(
    "click",
    captureQuestion
  );

  panel.querySelector(
    "#sa-analyze"
  ).addEventListener(
    "click",
    analyzeQuestion
  );

  panel.querySelector(
    "#sa-close"
  ).addEventListener(
    "click",
    () => {
      panel.remove();
      document
        .getElementById(
          "study-assistant-result"
        )
        ?.remove();

      window.__studyAssistantOpenRouter =
        false;
    }
  );

  // =========================
  // BOTÃO FLUTUANTE
  // =========================

  const floating = document.createElement("button");

  floating.textContent =
    "📚";

  floating.style.cssText = `
    position:fixed;
    right:10px;
    bottom:20px;
    width:44px;
    height:44px;
    border:0;
    border-radius:50%;
    z-index:2147483646;
    background:#5865f2;
    color:white;
    font-size:19px;
    box-shadow:0 4px 15px rgba(0,0,0,.4);
  `;

  document.body.appendChild(floating);

  floating.onclick = () => {

    const visible =
      panel.style.display !== "none";

    panel.style.display =
      visible ? "none" : "block";
  };

  status.textContent =
    "Pronto. Capture uma questão para começar.";

})();
(() => {
  "use strict";

  // ============================================================
  // ASSISTENTE DE ESTUDOS
  // TEXTO + IMAGEM + GPT / GEMINI
  // COMPATÍVEL COM IPHONE
  // ============================================================

  const STORAGE = {
    provider: "study_provider",
    openrouterKey: "study_openrouter_key",
    geminiKey: "study_gemini_key"
  };

  let provider =
    localStorage.getItem(STORAGE.provider) || "openrouter";

  let capturedText = "";
  let capturedImage = null;
  let busy = false;

  // ------------------------------------------------------------
  // MODELOS
  // ------------------------------------------------------------

  const OPENROUTER_MODEL = "openai/gpt-4o-mini";
  const GEMINI_MODEL = "gemini-2.0-flash";

  // ------------------------------------------------------------
  // PROMPT
  // ------------------------------------------------------------

  const AI_INSTRUCTION = `
Você é um assistente de estudos.

Analise cuidadosamente o conteúdo fornecido.

Se houver uma pergunta:
- identifique exatamente o que está sendo perguntado;
- leia todas as alternativas;
- considere números, tabelas, gráficos e imagens;
- faça o raciocínio matemático ou lógico necessário;
- não invente informações;
- se alguma parte estiver ilegível ou faltando, informe isso.

Se houver uma imagem, analise visualmente a imagem inteira.

Forneça:
1. Interpretação da questão
2. Raciocínio
3. Resposta mais provável

Se houver alternativas, indique qual alternativa corresponde à resposta.

Responda em português do Brasil e seja objetivo.
`;

  // ------------------------------------------------------------
  // UTILIDADES
  // ------------------------------------------------------------

  const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

  function escapeHTML(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toast(text, duration = 2200) {

    let el =
      document.getElementById("study-toast");

    if (!el) {

      el = document.createElement("div");

      el.id = "study-toast";

      Object.assign(el.style, {
        position: "fixed",
        left: "50%",
        bottom: "25px",
        transform: "translateX(-50%)",
        background: "#111",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "10px",
        fontFamily: "Arial,sans-serif",
        fontSize: "13px",
        zIndex: "2147483647",
        boxShadow: "0 5px 25px rgba(0,0,0,.4)",
        opacity: "0",
        transition: "opacity .2s",
        pointerEvents: "none"
      });

      document.body.appendChild(el);
    }

    el.textContent = text;
    el.style.opacity = "1";

    clearTimeout(el.timer);

    el.timer = setTimeout(() => {
      el.style.opacity = "0";
    }, duration);
  }

  // ------------------------------------------------------------
  // CSS
  // ------------------------------------------------------------

  const style =
    document.createElement("style");

  style.textContent = `

    #study-panel,
    #study-panel * {
      box-sizing: border-box;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }

    #study-panel {

      position: fixed;

      right: 12px;
      bottom: 80px;

      width: 300px;
      max-width: calc(100vw - 24px);

      background:
        rgba(18,18,22,.98);

      color: white;

      border:
        1px solid rgba(255,255,255,.12);

      border-radius: 15px;

      z-index: 2147483646;

      box-shadow:
        0 12px 40px rgba(0,0,0,.45);

      overflow: hidden;
    }

    #study-header {

      height: 42px;

      display: flex;

      align-items: center;

      justify-content:
        space-between;

      padding:
        0 9px 0 13px;

      background:
        rgba(255,255,255,.06);

      user-select: none;

      cursor: move;
    }

    #study-title {

      font-size: 13px;

      font-weight: 700;
    }

    #study-head-buttons {

      display: flex;

      gap: 4px;
    }

    .study-head-btn {

      width: 27px;
      height: 27px;

      border: 0;

      border-radius: 7px;

      background:
        rgba(255,255,255,.09);

      color: white;

      cursor: pointer;
    }

    .study-head-btn:hover {

      background:
        rgba(255,255,255,.18);
    }

    #study-body {

      padding: 11px;
    }

    .study-label {

      display: block;

      color: #aaa;

      font-size: 11px;

      margin-bottom: 5px;
    }

    #study-provider {

      width: 100%;

      height: 34px;

      background: #24242a;

      color: white;

      border: 1px solid #444;

      border-radius: 8px;

      padding: 0 8px;

      margin-bottom: 9px;

      outline: none;
    }

    #study-key {

      width: 100%;

      height: 34px;

      background: #202025;

      color: white;

      border: 1px solid #444;

      border-radius: 8px;

      padding: 0 9px;

      font-size: 11px;

      margin-bottom: 8px;

      outline: none;
    }

    .study-button {

      width: 100%;

      min-height: 37px;

      border: 0;

      border-radius: 9px;

      color: white;

      font-size: 12px;

      font-weight: 700;

      cursor: pointer;

      margin-top: 6px;
    }

    #study-text-button {

      background: #34353c;
    }

    #study-image-button {

      background: #34353c;
    }

    #study-analyze {

      background: #5b55e8;
    }

    #study-analyze:disabled {

      opacity: .4;

      cursor: not-allowed;
    }

    #study-captured-text {

      width: 100%;

      min-height: 80px;
      max-height: 150px;

      resize: vertical;

      margin-top: 9px;

      padding: 8px;

      background: #151519;

      color: #ddd;

      border: 1px solid #38383e;

      border-radius: 8px;

      font-size: 11px;

      line-height: 1.4;

      outline: none;
    }

    #study-preview {

      display: none;

      width: 100%;

      max-height: 140px;

      object-fit: contain;

      background: #000;

      border-radius: 8px;

      margin-top: 9px;
    }

    #study-result {

      display: none;

      margin-top: 9px;

      padding: 10px;

      max-height: 210px;

      overflow-y: auto;

      background:
        rgba(255,255,255,.055);

      border-radius: 9px;

      color: #ddd;

      font-size: 12px;

      line-height: 1.5;

      white-space: pre-wrap;
    }

    #study-status {

      text-align: center;

      color: #888;

      font-size: 10px;

      margin-top: 7px;
    }

    #study-api-link {

      display: block;

      text-align: center;

      margin-top: 9px;

      color: #999;

      font-size: 10px;

      text-decoration: none;
    }

    #study-api-link:hover {

      color: white;
    }

    #study-minimized {

      display: none;

      position: fixed;

      right: 14px;

      bottom: 80px;

      width: 46px;
      height: 46px;

      border-radius: 50%;

      border: 1px solid
        rgba(255,255,255,.15);

      background: #17171b;

      color: white;

      z-index: 2147483646;

      cursor: pointer;

      box-shadow:
        0 7px 25px rgba(0,0,0,.4);
    }

    #study-file {

      display: none;
    }

  `;

  document.head.appendChild(style);

  // ------------------------------------------------------------
  // HTML
  // ------------------------------------------------------------

  const panel =
    document.createElement("div");

  panel.id = "study-panel";

  panel.innerHTML = `

    <div id="study-header">

      <div id="study-title">
        📚 Assistente de Estudos
      </div>

      <div id="study-head-buttons">

        <button
          class="study-head-btn"
          id="study-minimize"
        >
          −
        </button>

        <button
          class="study-head-btn"
          id="study-close"
        >
          ×
        </button>

      </div>

    </div>

    <div id="study-body">

      <label class="study-label">
        Modelo de IA
      </label>

      <select id="study-provider">

        <option value="openrouter">
          GPT — OpenRouter
        </option>

        <option value="gemini">
          Gemini
        </option>

      </select>

      <label
        class="study-label"
        id="study-key-label"
      >
        Chave OpenRouter
      </label>

      <input
        id="study-key"
        type="password"
        placeholder="Cole sua chave aqui"
      >

      <button
        id="study-text-button"
        class="study-button"
      >
        📝 Puxar pergunta e texto
      </button>

      <input
        id="study-file"
        type="file"
        accept="image/*"
      >

      <button
        id="study-image-button"
        class="study-button"
      >
        🖼️ Escolher imagem
      </button>

      <textarea
        id="study-captured-text"
        placeholder="O texto capturado aparecerá aqui..."
      ></textarea>

      <img
        id="study-preview"
      >

      <button
        id="study-analyze"
        class="study-button"
        disabled
      >
        🤖 Analisar com IA
      </button>

      <div id="study-status">
        Pronto
      </div>

      <div id="study-result"></div>

      <a
        id="study-api-link"
        href="https://openrouter.ai/settings/keys"
        target="_blank"
        rel="noopener noreferrer"
      >
        Obter chave de API
      </a>

    </div>
  `;

  document.body.appendChild(panel);

  const minimized =
    document.createElement("button");

  minimized.id =
    "study-minimized";

  minimized.textContent =
    "📚";

  minimized.title =
    "Abrir assistente";

  document.body.appendChild(
    minimized
  );

  // ------------------------------------------------------------
  // ELEMENTOS
  // ------------------------------------------------------------

  const providerSelect =
    document.getElementById(
      "study-provider"
    );

  const keyInput =
    document.getElementById(
      "study-key"
    );

  const keyLabel =
    document.getElementById(
      "study-key-label"
    );

  const textButton =
    document.getElementById(
      "study-text-button"
    );

  const imageButton =
    document.getElementById(
      "study-image-button"
    );

  const fileInput =
    document.getElementById(
      "study-file"
    );

  const capturedTextBox =
    document.getElementById(
      "study-captured-text"
    );

  const preview =
    document.getElementById(
      "study-preview"
    );

  const analyzeButton =
    document.getElementById(
      "study-analyze"
    );

  const status =
    document.getElementById(
      "study-status"
    );

  const result =
    document.getElementById(
      "study-result"
    );

  const apiLink =
    document.getElementById(
      "study-api-link"
    );

  // ------------------------------------------------------------
  // PROVIDER
  // ------------------------------------------------------------

  function updateProvider() {

    provider =
      providerSelect.value;

    localStorage.setItem(
      STORAGE.provider,
      provider
    );

    if (
      provider === "gemini"
    ) {

      keyLabel.textContent =
        "Chave Gemini";

      keyInput.value =
        localStorage.getItem(
          STORAGE.geminiKey
        ) || "";

      keyInput.placeholder =
        "Cole sua chave Gemini";

      apiLink.href =
        "https://aistudio.google.com/apikey";

    } else {

      keyLabel.textContent =
        "Chave OpenRouter";

      keyInput.value =
        localStorage.getItem(
          STORAGE.openrouterKey
        ) || "";

      keyInput.placeholder =
        "Cole sua chave OpenRouter";

      apiLink.href =
        "https://openrouter.ai/settings/keys";
    }
  }

  providerSelect.value =
    provider;

  updateProvider();

  providerSelect.addEventListener(
    "change",
    updateProvider
  );

  keyInput.addEventListener(
    "input",
    () => {

      const value =
        keyInput.value.trim();

      if (
        provider === "gemini"
      ) {

        localStorage.setItem(
          STORAGE.geminiKey,
          value
        );

      } else {

        localStorage.setItem(
          STORAGE.openrouterKey,
          value
        );
      }
    }
  );

  // ------------------------------------------------------------
  // CAPTURAR TEXTO VISÍVEL
  // ------------------------------------------------------------

  textButton.onclick =
    () => {

      /*
       * Captura somente texto que está
       * atualmente no DOM da página.
       */

      const selection =
        window.getSelection()
          ?.toString()
          ?.trim();

      let text = "";

      if (selection) {

        text = selection;

      } else {

        /*
         * Primeiro tenta encontrar
         * elementos que normalmente
         * representam o conteúdo principal.
         */

        const candidates = [
          "main",
          "[role='main']",
          "article"
        ];

        let container = null;

        for (
          const selector of candidates
        ) {

          const found =
            document.querySelector(
              selector
            );

          if (found) {

            container = found;
            break;
          }
        }

        if (!container) {

          container =
            document.body;
        }

        text =
          container.innerText
            .replace(/\n{3,}/g, "\n\n")
            .trim();
      }

      if (!text) {

        toast(
          "Nenhum texto encontrado."
        );

        return;
      }

      /*
       * Limita o tamanho para evitar
       * enviar páginas inteiras.
       */

      const MAX_TEXT = 12000;

      capturedText =
        text.slice(0, MAX_TEXT);

      capturedTextBox.value =
        capturedText;

      status.textContent =
        "Texto capturado.";

      analyzeButton.disabled =
        false;

      toast(
        "📝 Texto capturado."
      );
    };

  // ------------------------------------------------------------
  // ESCOLHER IMAGEM
  // ------------------------------------------------------------

  imageButton.onclick =
    () => {

      fileInput.click();

    };

  fileInput.addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];

      if (!file) return;

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        toast(
          "Selecione uma imagem."
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        () => {

          capturedImage =
            reader.result;

          preview.src =
            capturedImage;

          preview.style.display =
            "block";

          analyzeButton.disabled =
            false;

          status.textContent =
            "Imagem pronta.";

          toast(
            "🖼️ Imagem carregada."
          );
        };

      reader.onerror =
        () => {

          toast(
            "Erro ao carregar imagem."
          );
        };

      reader.readAsDataURL(file);

    }
  );

  // ------------------------------------------------------------
  // OPENROUTER / GPT
  // ------------------------------------------------------------

  async function analyzeOpenRouter(
    text,
    image,
    apiKey
  ) {

    const content = [];

    content.push({
      type: "text",
      text:
        `${AI_INSTRUCTION}\n\n` +
        `CONTEÚDO TEXTUAL:\n${text || "(nenhum texto fornecido)"}`
    });

    if (image) {

      content.push({

        type: "image_url",

        image_url: {
          url: image
        }

      });
    }

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
              OPENROUTER_MODEL,

            messages: [

              {
                role: "user",
                content
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

    return (
      data?.choices?.[0]
        ?.message?.content ||
      "Sem resposta."
    );
  }

  // ------------------------------------------------------------
  // GEMINI
  // ------------------------------------------------------------

  async function analyzeGemini(
    text,
    image,
    apiKey
  ) {

    const parts = [];

    parts.push({
      text:
        `${AI_INSTRUCTION}\n\n` +
        `CONTEÚDO TEXTUAL:\n${text || "(nenhum texto fornecido)"}`
    });

    if (image) {

      const base64 =
        image.split(",")[1];

      parts.push({

        inline_data: {

          mime_type:
            "image/jpeg",

          data:
            base64
        }

      });
    }

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response =
      await fetch(
        endpoint,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            contents: [

              {
                parts
              }

            ],

            generationConfig: {

              temperature: 0.1

            }

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

    return (
      data?.candidates?.[0]
        ?.content?.parts
        ?.map(part =>
          part.text || ""
        )
        .join("") ||
      "Sem resposta."
    );
  }

  // ------------------------------------------------------------
  // ANALISAR
  // ------------------------------------------------------------

  analyzeButton.onclick =
    async () => {

      if (busy) return;

      const text =
        capturedTextBox.value.trim();

      capturedText =
        text;

      if (
        !text &&
        !capturedImage
      ) {

        toast(
          "Capture um texto ou escolha uma imagem."
        );

        return;
      }

      const apiKey =
        keyInput.value.trim();

      if (!apiKey) {

        toast(
          "Informe a chave da API."
        );

        keyInput.focus();

        return;
      }

      busy = true;

      analyzeButton.disabled =
        true;

      analyzeButton.textContent =
        "⏳ Analisando...";

      result.style.display =
        "block";

      result.textContent =
        "Analisando...";

      status.textContent =
        provider === "gemini"
          ? "Enviando para Gemini..."
          : "Enviando para GPT...";

      try {

        let answer;

        if (
          provider === "gemini"
        ) {

          answer =
            await analyzeGemini(
              text,
              capturedImage,
              apiKey
            );

        } else {

          answer =
            await analyzeOpenRouter(
              text,
              capturedImage,
              apiKey
            );
        }

        result.textContent =
          answer;

        status.textContent =
          "Análise concluída.";

        toast(
          "✅ Análise concluída."
        );

      } catch (error) {

        console.error(error);

        result.textContent =
          "Erro:\n\n" +
          error.message;

        status.textContent =
          "Erro na API.";

        toast(
          "❌ Erro ao consultar a IA."
        );

      } finally {

        busy = false;

        analyzeButton.disabled =
          false;

        analyzeButton.textContent =
          "🤖 Analisar com IA";
      }
    };

  // ------------------------------------------------------------
  // MINIMIZAR
  // ------------------------------------------------------------

  document
    .getElementById(
      "study-minimize"
    )
    .onclick = () => {

      panel.style.display =
        "none";

      minimized.style.display =
        "block";
    };

  minimized.onclick =
    () => {

      minimized.style.display =
        "none";

      panel.style.display =
        "block";
    };

  // ------------------------------------------------------------
  // FECHAR
  // ------------------------------------------------------------

  document
    .getElementById(
      "study-close"
    )
    .onclick = () => {

      panel.remove();
      minimized.remove();
      style.remove();

    };

  // ------------------------------------------------------------
  // ARRASTAR PAINEL
  // ------------------------------------------------------------

  const header =
    document.getElementById(
      "study-header"
    );

  let dragging = false;

  let startX = 0;
  let startY = 0;

  let originalRight = 0;
  let originalBottom = 0;

  header.addEventListener(
    "pointerdown",
    event => {

      if (
        event.target.closest("button")
      ) {
        return;
      }

      dragging = true;

      const rect =
        panel.getBoundingClientRect();

      startX =
        event.clientX;

      startY =
        event.clientY;

      originalRight =
        window.innerWidth -
        rect.right;

      originalBottom =
        window.innerHeight -
        rect.bottom;

      header.setPointerCapture(
        event.pointerId
      );
    }
  );

  header.addEventListener(
    "pointermove",
    event => {

      if (!dragging) return;

      const dx =
        event.clientX -
        startX;

      const dy =
        event.clientY -
        startY;

      panel.style.right =
        `${Math.max(
          5,
          originalRight - dx
        )}px`;

      panel.style.bottom =
        `${Math.max(
          5,
          originalBottom - dy
        )}px`;
    }
  );

  header.addEventListener(
    "pointerup",
    () => {

      dragging = false;

    }
  );

  // ------------------------------------------------------------
  // INÍCIO
  // ------------------------------------------------------------

  status.textContent =
    "Pronto para estudar.";

  toast(
    "📚 Assistente iniciado.",
    1800
  );

})();
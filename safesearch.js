(() => {
  "use strict";

  // ============================================================
  // PAINEL DE ESTUDOS — CAPTURA + GPT / GEMINI
  // ============================================================

  const STORAGE = {
    provider: "study_ai_provider",
    openrouterKey: "study_openrouter_key",
    geminiKey: "study_gemini_key"
  };

  let provider = localStorage.getItem(STORAGE.provider) || "openrouter";
  let lastImageData = null;
  let busy = false;

  // ------------------------------------------------------------
  // CONFIGURAÇÃO
  // ------------------------------------------------------------

  const OPENROUTER_MODEL = "openai/gpt-4o-mini";
  const GEMINI_MODEL = "gemini-2.0-flash";

  const SYSTEM_PROMPT = `
Você é um assistente de estudos.

Analise cuidadosamente a imagem fornecida.

1. Identifique a pergunta.
2. Leia tabelas, gráficos, alternativas, números e textos presentes.
3. Faça o raciocínio necessário.
4. Não invente informações que não estejam visíveis.
5. Se houver alguma informação ilegível, diga exatamente qual.
6. Dê uma resposta objetiva.
7. Explique brevemente como chegou à conclusão.

Responda em português do Brasil.
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

  function toast(message, duration = 2200) {
    let el = document.getElementById("study-ai-toast");

    if (!el) {
      el = document.createElement("div");
      el.id = "study-ai-toast";

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
        boxShadow: "0 5px 25px rgba(0,0,0,.35)",
        opacity: "0",
        transition: "opacity .2s"
      });

      document.body.appendChild(el);
    }

    el.textContent = message;
    el.style.opacity = "1";

    clearTimeout(el._timer);

    el._timer = setTimeout(() => {
      el.style.opacity = "0";
    }, duration);
  }

  // ------------------------------------------------------------
  // CSS
  // ------------------------------------------------------------

  const style = document.createElement("style");

  style.textContent = `
    #study-ai-panel,
    #study-ai-panel * {
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
    }

    #study-ai-panel {
      position: fixed;
      right: 18px;
      bottom: 85px;
      width: 300px;
      background: rgba(18,18,22,.97);
      color: #fff;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 15px;
      z-index: 2147483646;
      box-shadow: 0 12px 40px rgba(0,0,0,.4);
      overflow: hidden;
    }

    #study-ai-header {
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px 0 14px;
      background: rgba(255,255,255,.06);
      cursor: move;
      user-select: none;
    }

    #study-ai-title {
      font-size: 13px;
      font-weight: 700;
    }

    #study-ai-header-buttons {
      display: flex;
      gap: 4px;
    }

    .study-mini-btn {
      width: 27px;
      height: 27px;
      border: 0;
      border-radius: 7px;
      background: rgba(255,255,255,.09);
      color: #fff;
      cursor: pointer;
      font-size: 15px;
    }

    .study-mini-btn:hover {
      background: rgba(255,255,255,.18);
    }

    #study-ai-body {
      padding: 11px;
    }

    .study-label {
      display: block;
      margin-bottom: 5px;
      color: #bbb;
      font-size: 11px;
    }

    #study-provider {
      width: 100%;
      height: 34px;
      border: 1px solid #444;
      border-radius: 8px;
      background: #25252b;
      color: #fff;
      padding: 0 9px;
      outline: none;
      margin-bottom: 9px;
    }

    .study-input {
      width: 100%;
      height: 34px;
      border: 1px solid #444;
      border-radius: 8px;
      background: #202025;
      color: #fff;
      padding: 0 9px;
      outline: none;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .study-input:focus {
      border-color: #777;
    }

    .study-button {
      width: 100%;
      min-height: 37px;
      border: 0;
      border-radius: 9px;
      color: white;
      cursor: pointer;
      font-weight: 700;
      font-size: 12px;
      margin-top: 6px;
    }

    #study-capture {
      background: #33343b;
    }

    #study-analyze {
      background: #5b55e8;
    }

    #study-analyze:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    #study-result {
      margin-top: 10px;
      max-height: 180px;
      overflow-y: auto;
      padding: 10px;
      border-radius: 9px;
      background: rgba(255,255,255,.055);
      color: #ddd;
      font-size: 12px;
      line-height: 1.45;
      white-space: pre-wrap;
      display: none;
    }

    #study-preview {
      width: 100%;
      max-height: 130px;
      object-fit: contain;
      margin-top: 9px;
      border-radius: 8px;
      display: none;
      background: #000;
    }

    #study-api-link {
      display: block;
      text-align: center;
      color: #999;
      font-size: 10px;
      margin-top: 9px;
      text-decoration: none;
    }

    #study-api-link:hover {
      color: #fff;
    }

    #study-status {
      margin-top: 7px;
      text-align: center;
      color: #888;
      font-size: 10px;
    }

    #study-ai-minimized {
      position: fixed;
      right: 18px;
      bottom: 85px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.15);
      background: #17171b;
      color: white;
      z-index: 2147483646;
      cursor: pointer;
      display: none;
      box-shadow: 0 7px 25px rgba(0,0,0,.35);
      font-size: 18px;
    }
  `;

  document.head.appendChild(style);

  // ------------------------------------------------------------
  // INTERFACE
  // ------------------------------------------------------------

  const panel = document.createElement("div");
  panel.id = "study-ai-panel";

  panel.innerHTML = `
    <div id="study-ai-header">
      <div id="study-ai-title">📚 Assistente de Estudos</div>

      <div id="study-ai-header-buttons">
        <button class="study-mini-btn" id="study-minimize">−</button>
        <button class="study-mini-btn" id="study-close">×</button>
      </div>
    </div>

    <div id="study-ai-body">

      <label class="study-label">Modelo</label>

      <select id="study-provider">
        <option value="openrouter">GPT — OpenRouter</option>
        <option value="gemini">Gemini</option>
      </select>

      <label class="study-label" id="study-key-label">
        Chave OpenRouter
      </label>

      <input
        id="study-api-key"
        class="study-input"
        type="password"
        placeholder="Cole sua chave aqui"
      />

      <button id="study-capture" class="study-button">
        📸 Capturar tela
      </button>

      <img id="study-preview">

      <button id="study-analyze" class="study-button" disabled>
        🤖 Analisar imagem
      </button>

      <div id="study-status">
        Nenhuma captura realizada
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

  const minimized = document.createElement("button");
  minimized.id = "study-ai-minimized";
  minimized.textContent = "📚";
  minimized.title = "Abrir assistente";
  document.body.appendChild(minimized);

  const providerSelect =
    document.getElementById("study-provider");

  const keyInput =
    document.getElementById("study-api-key");

  const keyLabel =
    document.getElementById("study-key-label");

  const captureButton =
    document.getElementById("study-capture");

  const analyzeButton =
    document.getElementById("study-analyze");

  const preview =
    document.getElementById("study-preview");

  const result =
    document.getElementById("study-result");

  const status =
    document.getElementById("study-status");

  const apiLink =
    document.getElementById("study-api-link");

  // ------------------------------------------------------------
  // CONFIGURAÇÃO DO PROVIDER
  // ------------------------------------------------------------

  function updateProviderUI() {
    provider = providerSelect.value;

    localStorage.setItem(
      STORAGE.provider,
      provider
    );

    if (provider === "gemini") {

      keyLabel.textContent = "Chave Gemini";

      keyInput.value =
        localStorage.getItem(STORAGE.geminiKey) || "";

      keyInput.placeholder =
        "Cole sua chave Gemini aqui";

      apiLink.href =
        "https://aistudio.google.com/apikey";

    } else {

      keyLabel.textContent =
        "Chave OpenRouter";

      keyInput.value =
        localStorage.getItem(STORAGE.openrouterKey) || "";

      keyInput.placeholder =
        "Cole sua chave OpenRouter aqui";

      apiLink.href =
        "https://openrouter.ai/settings/keys";
    }
  }

  providerSelect.value = provider;

  updateProviderUI();

  providerSelect.addEventListener(
    "change",
    updateProviderUI
  );

  keyInput.addEventListener("input", () => {

    if (provider === "gemini") {
      localStorage.setItem(
        STORAGE.geminiKey,
        keyInput.value.trim()
      );
    } else {
      localStorage.setItem(
        STORAGE.openrouterKey,
        keyInput.value.trim()
      );
    }

  });

  // ------------------------------------------------------------
  // MINIMIZAR
  // ------------------------------------------------------------

  document
    .getElementById("study-minimize")
    .onclick = () => {

      panel.style.display = "none";
      minimized.style.display = "block";

    };

  minimized.onclick = () => {

    minimized.style.display = "none";
    panel.style.display = "block";

  };

  document
    .getElementById("study-close")
    .onclick = () => {

      panel.remove();
      minimized.remove();
      style.remove();

    };

  // ------------------------------------------------------------
  // CAPTURA DE TELA
  // ------------------------------------------------------------

  async function captureScreen() {

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getDisplayMedia) {

      toast(
        "Seu navegador não permite captura de tela."
      );

      return;

    }

    try {

      status.textContent =
        "Aguardando seleção da tela...";

      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "never"
          },
          audio: false
        });

      const video =
        document.createElement("video");

      video.srcObject = stream;

      video.muted = true;

      await video.play();

      await sleep(500);

      const canvas =
        document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      stream
        .getTracks()
        .forEach(track => track.stop());

      lastImageData =
        canvas.toDataURL(
          "image/jpeg",
          0.85
        );

      preview.src = lastImageData;
      preview.style.display = "block";

      analyzeButton.disabled = false;

      status.textContent =
        "Captura pronta para análise.";

      toast("📸 Captura realizada.");

    } catch (error) {

      console.error(error);

      status.textContent =
        "Captura cancelada.";

      toast(
        "Não foi possível capturar a tela."
      );

    }
  }

  captureButton.onclick =
    captureScreen;

  // ------------------------------------------------------------
  // GPT / OPENROUTER
  // ------------------------------------------------------------

  async function analyzeWithOpenRouter(
    imageData,
    apiKey
  ) {

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({

          model: OPENROUTER_MODEL,

          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT
            },

            {
              role: "user",

              content: [
                {
                  type: "text",
                  text:
                    "Analise cuidadosamente esta captura de tela."
                },

                {
                  type: "image_url",

                  image_url: {
                    url: imageData
                  }
                }
              ]
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
        `Erro HTTP ${response.status}`
      );

    }

    return (
      data?.choices?.[0]?.message?.content ||
      "O modelo não retornou uma resposta."
    );
  }

  // ------------------------------------------------------------
  // GEMINI
  // ------------------------------------------------------------

  async function analyzeWithGemini(
    imageData,
    apiKey
  ) {

    const base64 =
      imageData.split(",")[1];

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response =
      await fetch(url, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          systemInstruction: {
            parts: [
              {
                text: SYSTEM_PROMPT
              }
            ]
          },

          contents: [
            {
              parts: [

                {
                  text:
                    "Analise cuidadosamente esta captura de tela."
                },

                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64
                  }
                }

              ]
            }
          ],

          generationConfig: {
            temperature: 0.1
          }

        })
      });

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data?.error?.message ||
        `Erro HTTP ${response.status}`
      );

    }

    return (
      data?.candidates?.[0]
        ?.content?.parts
        ?.map(p => p.text || "")
        .join("") ||
      "O modelo não retornou uma resposta."
    );
  }

  // ------------------------------------------------------------
  // ANALISAR
  // ------------------------------------------------------------

  analyzeButton.onclick =
    async () => {

      if (busy) return;

      if (!lastImageData) {

        toast(
          "Faça uma captura primeiro."
        );

        return;

      }

      const apiKey =
        keyInput.value.trim();

      if (!apiKey) {

        toast(
          "Informe a chave da API primeiro."
        );

        keyInput.focus();

        return;

      }

      busy = true;

      analyzeButton.disabled = true;

      analyzeButton.textContent =
        "⏳ Analisando...";

      result.style.display = "block";

      result.textContent =
        "Analisando a imagem...";

      status.textContent =
        provider === "gemini"
          ? "Enviando para Gemini..."
          : "Enviando para GPT...";

      try {

        let answer;

        if (provider === "gemini") {

          answer =
            await analyzeWithGemini(
              lastImageData,
              apiKey
            );

        } else {

          answer =
            await analyzeWithOpenRouter(
              lastImageData,
              apiKey
            );

        }

        result.textContent =
          answer;

        status.textContent =
          "Análise concluída.";

        toast(
          "✅ Análise concluída.",
          2000
        );

      } catch (error) {

        console.error(error);

        result.textContent =
          "Erro ao analisar:\n\n" +
          error.message;

        status.textContent =
          "Erro na análise.";

        toast(
          "❌ Erro na API.",
          2500
        );

      } finally {

        busy = false;

        analyzeButton.disabled =
          false;

        analyzeButton.textContent =
          "🤖 Analisar imagem";

      }

    };

  // ------------------------------------------------------------
  // ARRASTAR PAINEL
  // ------------------------------------------------------------

  const header =
    document.getElementById(
      "study-ai-header"
    );

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startRight = 0;
  let startBottom = 0;

  header.addEventListener(
    "pointerdown",
    e => {

      if (
        e.target.closest("button")
      ) return;

      dragging = true;

      const rect =
        panel.getBoundingClientRect();

      startX = e.clientX;
      startY = e.clientY;

      startRight =
        window.innerWidth - rect.right;

      startBottom =
        window.innerHeight - rect.bottom;

      header.setPointerCapture(
        e.pointerId
      );

    }
  );

  header.addEventListener(
    "pointermove",
    e => {

      if (!dragging) return;

      const dx =
        e.clientX - startX;

      const dy =
        e.clientY - startY;

      panel.style.right =
        `${Math.max(
          5,
          startRight - dx
        )}px`;

      panel.style.bottom =
        `${Math.max(
          5,
          startBottom - dy
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
  // INICIALIZAÇÃO
  // ------------------------------------------------------------

  status.textContent =
    "Pronto para capturar.";

  toast(
    "📚 Assistente de estudos iniciado.",
    1800
  );

})();
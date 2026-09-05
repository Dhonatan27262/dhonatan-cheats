(() => {
  "use strict";

  // ============================================================
  // ASSISTENTE DE ESTUDOS
  // TEXTO + IMAGEM + GPT / GEMINI
  // IPHONE / USERSCRIPT
  // MENU INTEIRO ARRASTÁVEL
  // ============================================================

  const STORAGE = {
    provider: "study_provider",
    openrouterKey: "study_openrouter_key",
    geminiKey: "study_gemini_key",
    panelLeft: "study_panel_left",
    panelTop: "study_panel_top"
  };

  let provider =
    localStorage.getItem(STORAGE.provider) || "openrouter";

  let capturedText = "";
  let capturedImage = null;
  let busy = false;

  // ============================================================
  // MODELOS
  // ============================================================

  const OPENROUTER_MODEL =
    "openai/gpt-4o-mini";

  const GEMINI_MODEL =
    "gemini-2.0-flash";

  // ============================================================
  // INSTRUÇÃO PARA A IA
  // ============================================================

  const AI_INSTRUCTION = `
Você é um assistente de estudos.

ATENÇÃO:
O conteúdo recebido pode conter elementos extras da página, como
menus, botões, cabeçalhos, rodapés, navegação, textos de interface
e informações que não pertencem à questão.

Sua tarefa é identificar e analisar SOMENTE a questão de estudo.

PRIORIDADE ABSOLUTA:

1. Enunciado da questão.
2. Todas as alternativas/respostas visíveis.
3. Números, expressões matemáticas, tabelas e gráficos.
4. Informações visuais relacionadas diretamente à questão.

IGNORE:

- menus da página;
- cabeçalhos;
- rodapés;
- botões;
- navegação;
- informações administrativas;
- textos que não façam parte da questão.

Se houver texto capturado, organize o conteúdo antes de analisá-lo.

Se houver uma imagem:

- examine a imagem inteira;
- leia textos presentes nela;
- observe gráficos;
- observe tabelas;
- observe diagramas;
- observe valores;
- relacione a imagem ao enunciado.

Se houver alternativas, compare TODAS antes de responder.

Faça o raciocínio matemático ou lógico necessário.

Não invente informações.

Se alguma informação estiver ilegível, ausente ou insuficiente,
informe exatamente o que está faltando.

Responda em português do Brasil.

FORMATO:

QUESTÃO IDENTIFICADA:
[resumo curto]

DADOS IMPORTANTES:
[números, textos, alternativas e informações visuais]

ANÁLISE:
[raciocínio objetivo]

RESPOSTA:
[resposta correspondente, quando for possível determinar]

CONFIANÇA:
[Alta / Média / Baixa]

Se não for possível identificar uma questão válida, responda:

"Não consegui identificar uma questão válida no conteúdo capturado."
`;

  // ============================================================
  // UTILIDADES
  // ============================================================

  function limparTexto(texto) {

    return String(texto || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function elementoVisivel(el) {

    if (!el) return false;

    const style =
      getComputedStyle(el);

    const rect =
      el.getBoundingClientRect();

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      parseFloat(style.opacity || "1") > 0 &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function toast(text, duration = 2200) {

    let el =
      document.getElementById(
        "study-toast"
      );

    if (!el) {

      el =
        document.createElement("div");

      el.id =
        "study-toast";

      Object.assign(
        el.style,
        {
          position: "fixed",
          left: "50%",
          bottom: "25px",
          transform:
            "translateX(-50%)",

          background: "#111",
          color: "#fff",

          padding:
            "10px 16px",

          borderRadius:
            "10px",

          fontFamily:
            "Arial,sans-serif",

          fontSize:
            "13px",

          zIndex:
            "2147483647",

          boxShadow:
            "0 5px 25px rgba(0,0,0,.4)",

          opacity: "0",

          transition:
            "opacity .2s",

          pointerEvents:
            "none"
        }
      );

      document.body.appendChild(el);
    }

    el.textContent =
      text;

    el.style.opacity =
      "1";

    clearTimeout(el.timer);

    el.timer =
      setTimeout(() => {

        el.style.opacity =
          "0";

      }, duration);
  }

  // ============================================================
  // CSS
  // ============================================================

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

      max-width:
        calc(100vw - 24px);

      max-height:
        calc(100vh - 20px);

      background:
        rgba(18,18,22,.98);

      color: white;

      border:
        1px solid
        rgba(255,255,255,.12);

      border-radius:
        15px;

      z-index:
        2147483646;

      box-shadow:
        0 12px 40px
        rgba(0,0,0,.45);

      overflow:
        hidden;

      touch-action:
        none;
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

      user-select:
        none;

      -webkit-user-select:
        none;

      touch-action:
        none;

      cursor:
        move;

      flex-shrink:
        0;
    }

    #study-title {

      font-size:
        13px;

      font-weight:
        700;

      pointer-events:
        none;
    }

    #study-head-buttons {

      display:
        flex;

      gap:
        4px;

      touch-action:
        manipulation;
    }

    .study-head-btn {

      width:
        27px;

      height:
        27px;

      border:
        0;

      border-radius:
        7px;

      background:
        rgba(255,255,255,.09);

      color:
        white;

      cursor:
        pointer;

      font-size:
        15px;

      touch-action:
        manipulation;
    }

    .study-head-btn:hover {

      background:
        rgba(255,255,255,.18);
    }

    #study-body {

      padding:
        11px;

      max-height:
        calc(100vh - 62px);

      overflow-y:
        auto;

      -webkit-overflow-scrolling:
        touch;

      touch-action:
        pan-y;
    }

    .study-label {

      display:
        block;

      color:
        #aaa;

      font-size:
        11px;

      margin-bottom:
        5px;
    }

    #study-provider {

      width:
        100%;

      height:
        34px;

      background:
        #24242a;

      color:
        white;

      border:
        1px solid #444;

      border-radius:
        8px;

      padding:
        0 8px;

      margin-bottom:
        9px;

      outline:
        none;

      touch-action:
        manipulation;
    }

    #study-key {

      width:
        100%;

      height:
        34px;

      background:
        #202025;

      color:
        white;

      border:
        1px solid #444;

      border-radius:
        8px;

      padding:
        0 9px;

      font-size:
        11px;

      margin-bottom:
        8px;

      outline:
        none;

      touch-action:
        manipulation;
    }

    .study-button {

      width:
        100%;

      min-height:
        37px;

      border:
        0;

      border-radius:
        9px;

      color:
        white;

      font-size:
        12px;

      font-weight:
        700;

      cursor:
        pointer;

      margin-top:
        6px;

      touch-action:
        manipulation;
    }

    #study-text-button {

      background:
        #34353c;
    }

    #study-image-button {

      background:
        #34353c;
    }

    #study-analyze {

      background:
        #5b55e8;
    }

    #study-analyze:disabled {

      opacity:
        .4;

      cursor:
        not-allowed;
    }

    #study-captured-text {

      width:
        100%;

      min-height:
        80px;

      max-height:
        150px;

      resize:
        vertical;

      margin-top:
        9px;

      padding:
        8px;

      background:
        #151519;

      color:
        #ddd;

      border:
        1px solid #38383e;

      border-radius:
        8px;

      font-size:
        11px;

      line-height:
        1.4;

      outline:
        none;

      touch-action:
        auto;
    }

    #study-preview {

      display:
        none;

      width:
        100%;

      max-height:
        140px;

      object-fit:
        contain;

      background:
        #000;

      border-radius:
        8px;

      margin-top:
        9px;

      touch-action:
        none;
    }

    #study-result {

      display:
        none;

      margin-top:
        9px;

      padding:
        10px;

      max-height:
        210px;

      overflow-y:
        auto;

      background:
        rgba(255,255,255,.055);

      border-radius:
        9px;

      color:
        #ddd;

      font-size:
        12px;

      line-height:
        1.5;

      white-space:
        pre-wrap;

      -webkit-overflow-scrolling:
        touch;

      touch-action:
        pan-y;
    }

    #study-status {

      text-align:
        center;

      color:
        #888;

      font-size:
        10px;

      margin-top:
        7px;
    }

    #study-api-link {

      display:
        block;

      text-align:
        center;

      margin-top:
        9px;

      color:
        #999;

      font-size:
        10px;

      text-decoration:
        none;

      touch-action:
        manipulation;
    }

    #study-api-link:hover {

      color:
        white;
    }

    #study-minimized {

      display:
        none;

      position:
        fixed;

      right:
        14px;

      bottom:
        80px;

      width:
        46px;

      height:
        46px;

      border-radius:
        50%;

      border:
        1px solid
        rgba(255,255,255,.15);

      background:
        #17171b;

      color:
        white;

      z-index:
        2147483646;

      cursor:
        pointer;

      box-shadow:
        0 7px 25px
        rgba(0,0,0,.4);

      touch-action:
        manipulation;

      user-select:
        none;

      -webkit-user-select:
        none;
    }

    #study-file {

      display:
        none;
    }

  `;

  document.head.appendChild(style);

  // ============================================================
  // HTML
  // ============================================================

  const panel =
    document.createElement("div");

  panel.id =
    "study-panel";

  panel.innerHTML = `

    <div id="study-header">

      <div id="study-title">
        📚 Assistente de Estudos
      </div>

      <div id="study-head-buttons">

        <button
          class="study-head-btn"
          id="study-minimize"
          type="button"
        >
          −
        </button>

        <button
          class="study-head-btn"
          id="study-close"
          type="button"
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
        type="button"
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
        type="button"
      >
        🖼️ Escolher imagem
      </button>

      <textarea
        id="study-captured-text"
        placeholder="O conteúdo capturado aparecerá aqui..."
      ></textarea>

      <img
        id="study-preview"
        alt="Imagem capturada"
      >

      <button
        id="study-analyze"
        class="study-button"
        type="button"
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

  // ============================================================
  // BOTÃO MINIMIZADO
  // ============================================================

  const minimized =
    document.createElement("button");

  minimized.id =
    "study-minimized";

  minimized.textContent =
    "📚";

  minimized.title =
    "Abrir assistente";

  minimized.type =
    "button";

  document.body.appendChild(
    minimized
  );

  // ============================================================
  // ELEMENTOS
  // ============================================================

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

  // ============================================================
  // PROVIDER
  // ============================================================

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

  // ============================================================
  // CAPTURA DA QUESTÃO
  // ============================================================

  function obterCentroDaQuestao() {

    const seletores = [

      "[data-testid*='exercise']",

      "[data-testid*='question']",

      "[data-testid*='problem']",

      "[data-testid*='assessment']",

      "[class*='exercise']",

      "[class*='question']",

      "[class*='problem']",

      "[class*='assessment']",

      "main",

      "[role='main']"
    ];

    const candidatos = [];

    for (
      const seletor of seletores
    ) {

      document
        .querySelectorAll(seletor)
        .forEach(el => {

          if (
            !elementoVisivel(el)
          ) {
            return;
          }

          const rect =
            el.getBoundingClientRect();

          const centroX =
            rect.left +
            rect.width / 2;

          const centroY =
            rect.top +
            rect.height / 2;

          const distanciaX =
            Math.abs(
              centroX -
              window.innerWidth / 2
            );

          const distanciaY =
            Math.abs(
              centroY -
              window.innerHeight / 2
            );

          const area =
            rect.width *
            rect.height;

          candidatos.push({

            el,

            distancia:
              distanciaX +
              distanciaY,

            area
          });

        });
    }

    const unicos = [];

    for (
      const item of candidatos
    ) {

      if (
        !unicos.some(
          x =>
            x.el === item.el
        )
      ) {

        unicos.push(item);
      }
    }

    unicos.sort(
      (a, b) => {

        const scoreA =
          a.distancia -
          Math.min(
            a.area / 5000,
            100
          );

        const scoreB =
          b.distancia -
          Math.min(
            b.area / 5000,
            100
          );

        return scoreA - scoreB;
      }
    );

    for (
      const candidato of unicos
    ) {

      const texto =
        limparTexto(
          candidato.el.innerText
        );

      if (
        texto.length >= 20 &&
        texto.length <= 15000
      ) {

        return candidato.el;
      }
    }

    return null;
  }

  function capturarQuestao() {

    const selecao =
      window.getSelection()
        ?.toString()
        ?.trim();

    if (selecao) {

      return limparTexto(
        selecao
      );
    }

    const container =
      obterCentroDaQuestao();

    if (!container) {

      return "";
    }

    const clone =
      container.cloneNode(
        true
      );

    const remover = [

      "script",
      "style",
      "noscript",
      "button",
      "nav",
      "header",
      "footer",

      "[role='navigation']",

      "[aria-hidden='true']"
    ];

    clone
      .querySelectorAll(
        remover.join(",")
      )
      .forEach(
        el =>
          el.remove()
      );

    let texto =
      limparTexto(
        clone.innerText
      );

    texto =
      texto
        .split("\n")
        .map(
          linha =>
            linha.trim()
        )
        .filter(Boolean)
        .join("\n");

    return texto.slice(
      0,
      15000
    );
  }

  // ============================================================
  // BOTÃO CAPTURAR TEXTO
  // ============================================================

  textButton.onclick =
    () => {

      const texto =
        capturarQuestao();

      if (!texto) {

        toast(
          "Nenhum conteúdo da questão encontrado."
        );

        status.textContent =
          "Não foi possível localizar a questão.";

        return;
      }

      capturedText =
        texto;

      capturedTextBox.value =
        texto;

      analyzeButton.disabled =
        false;

      status.textContent =
        `Questão capturada (${texto.length} caracteres).`;

      toast(
        "📝 Questão capturada."
      );

      console.log(
        "[Assistente] Conteúdo capturado:",
        texto
      );
    };

  // ============================================================
  // IMAGEM
  // ============================================================

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

      reader.readAsDataURL(
        file
      );
    }
  );

  // ============================================================
  // OPENROUTER
  // ============================================================

  async function analyzeOpenRouter(
    text,
    image,
    apiKey
  ) {

    const content = [];

    content.push({

      type: "text",

      text:
        `${AI_INSTRUCTION}

CONTEÚDO TEXTUAL CAPTURADO:

${text ||
"(nenhum texto fornecido)"}

Analise somente o conteúdo relacionado
à questão e ignore elementos de interface.`
    });

    if (image) {

      content.push({

        type:
          "image_url",

        image_url: {

          url:
            image
        }
      });
    }

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${apiKey}`
          },

          body:
            JSON.stringify({

              model:
                OPENROUTER_MODEL,

              messages: [

                {

                  role:
                    "user",

                  content:
                    content
                }
              ],

              temperature:
                0.1
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

  // ============================================================
  // GEMINI
  // ============================================================

  async function analyzeGemini(
    text,
    image,
    apiKey
  ) {

    const parts = [];

    parts.push({

      text:
        `${AI_INSTRUCTION}

CONTEÚDO TEXTUAL CAPTURADO:

${text ||
"(nenhum texto fornecido)"}

Analise somente o conteúdo relacionado
à questão e ignore elementos de interface.`
    });

    if (image) {

      const base64 =
        image.split(",")[1];

      const mime =
        image
          .match(
            /^data:(image\/[^;]+);/
          )
          ?. [1] ||
        "image/jpeg";

      parts.push({

        inline_data: {

          mime_type:
            mime,

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

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              contents: [

                {
                  parts
                }
              ],

              generationConfig: {

                temperature:
                  0.1
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
        ?.map(
          part =>
            part.text || ""
        )
        .join("") ||
      "Sem resposta."
    );
  }

  // ============================================================
  // ANALISAR
  // ============================================================

  analyzeButton.onclick =
    async () => {

      if (busy) return;

      const text =
        capturedTextBox
          .value
          .trim();

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

        console.error(
          error
        );

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

  // ============================================================
  // MINIMIZAR
  // ============================================================

  function minimizarPainel() {

    panel.style.display =
      "none";

    minimized.style.display =
      "block";
  }

  function abrirPainel() {

    minimized.style.display =
      "none";

    panel.style.display =
      "block";

    ajustarPosicaoNaTela();
  }

  document
    .getElementById(
      "study-minimize"
    )
    .onclick =
    minimizarPainel;

  minimized.onclick =
    abrirPainel;

  // ============================================================
  // TOQUE/CLIQUE FORA DO MENU
  // MINIMIZA AUTOMATICAMENTE
  // ============================================================

  function cliqueFora(event) {

    if (
      panel.style.display ===
      "none"
    ) {
      return;
    }

    const alvo =
      event.target;

    if (
      panel.contains(alvo)
    ) {
      return;
    }

    if (
      minimized.contains(alvo)
    ) {
      return;
    }

    minimizarPainel();
  }

  document.addEventListener(
    "pointerdown",
    cliqueFora,
    true
  );

  // ============================================================
  // FECHAR
  // ============================================================

  document
    .getElementById(
      "study-close"
    )
    .onclick =
    () => {

      panel.remove();

      minimized.remove();

      style.remove();

      document.removeEventListener(
        "pointerdown",
        cliqueFora,
        true
      );
    };

  // ============================================================
  // ARRASTAR MENU INTEIRO
  // ============================================================

  let dragging =
    false;

  let dragStartX =
    0;

  let dragStartY =
    0;

  let panelStartLeft =
    0;

  let panelStartTop =
    0;

  function podeArrastar(event) {

    const alvo =
      event.target;

    // Esses elementos continuam funcionando
    // normalmente e não iniciam o arraste.
    const elementoInterativo =
      alvo.closest(
        "button, input, textarea, select, a"
      );

    if (
      elementoInterativo
    ) {
      return false;
    }

    return true;
  }

  panel.addEventListener(
    "pointerdown",
    event => {

      if (
        !podeArrastar(event)
      ) {
        return;
      }

      const rect =
        panel.getBoundingClientRect();

      dragging =
        true;

      dragStartX =
        event.clientX;

      dragStartY =
        event.clientY;

      panelStartLeft =
        rect.left;

      panelStartTop =
        rect.top;

      panel.style.left =
        `${panelStartLeft}px`;

      panel.style.top =
        `${panelStartTop}px`;

      panel.style.right =
        "auto";

      panel.style.bottom =
        "auto";

      try {

        panel.setPointerCapture(
          event.pointerId
        );

      } catch (e) {}

      event.preventDefault();
    },
    {
      passive: false
    }
  );

  panel.addEventListener(
    "pointermove",
    event => {

      if (!dragging) {
        return;
      }

      event.preventDefault();

      const dx =
        event.clientX -
        dragStartX;

      const dy =
        event.clientY -
        dragStartY;

      const panelWidth =
        panel.offsetWidth;

      const panelHeight =
        panel.offsetHeight;

      const maxLeft =
        Math.max(
          5,
          window.innerWidth -
          panelWidth -
          5
        );

      const maxTop =
        Math.max(
          5,
          window.innerHeight -
          panelHeight -
          5
        );

      const newLeft =
        Math.min(
          maxLeft,
          Math.max(
            5,
            panelStartLeft + dx
          )
        );

      const newTop =
        Math.min(
          maxTop,
          Math.max(
            5,
            panelStartTop + dy
          )
        );

      panel.style.left =
        `${newLeft}px`;

      panel.style.top =
        `${newTop}px`;
    },
    {
      passive: false
    }
  );

  function finalizarArraste(event) {

    if (!dragging) {
      return;
    }

    dragging =
      false;

    try {

      if (
        event.pointerId !== undefined &&
        panel.hasPointerCapture(
          event.pointerId
        )
      ) {

        panel.releasePointerCapture(
          event.pointerId
        );
      }

    } catch (e) {}

    localStorage.setItem(
      STORAGE.panelLeft,
      panel.style.left
    );

    localStorage.setItem(
      STORAGE.panelTop,
      panel.style.top
    );
  }

  panel.addEventListener(
    "pointerup",
    finalizarArraste
  );

  panel.addEventListener(
    "pointercancel",
    finalizarArraste
  );

  // ============================================================
  // AJUSTAR POSIÇÃO NA TELA
  // ============================================================

  function ajustarPosicaoNaTela() {

    if (
      panel.style.display ===
      "none"
    ) {
      return;
    }

    const rect =
      panel.getBoundingClientRect();

    const panelWidth =
      panel.offsetWidth;

    const panelHeight =
      panel.offsetHeight;

    const maxLeft =
      Math.max(
        5,
        window.innerWidth -
        panelWidth -
        5
      );

    const maxTop =
      Math.max(
        5,
        window.innerHeight -
        panelHeight -
        5
      );

    const left =
      Math.min(
        maxLeft,
        Math.max(
          5,
          rect.left
        )
      );

    const top =
      Math.min(
        maxTop,
        Math.max(
          5,
          rect.top
        )
      );

    panel.style.left =
      `${left}px`;

    panel.style.top =
      `${top}px`;

    panel.style.right =
      "auto";

    panel.style.bottom =
      "auto";
  }

  // ============================================================
  // RESTAURAR POSIÇÃO SALVA
  // ============================================================

  const savedLeft =
    localStorage.getItem(
      STORAGE.panelLeft
    );

  const savedTop =
    localStorage.getItem(
      STORAGE.panelTop
    );

  if (
    savedLeft &&
    savedTop
  ) {

    panel.style.left =
      savedLeft;

    panel.style.top =
      savedTop;

    panel.style.right =
      "auto";

    panel.style.bottom =
      "auto";

    requestAnimationFrame(
      () => {

        ajustarPosicaoNaTela();

      }
    );
  }

  // ============================================================
  // CORRIGIR POSIÇÃO AO REDIMENSIONAR/GIRAR
  // ============================================================

  window.addEventListener(
    "resize",
    () => {

      ajustarPosicaoNaTela();

    }
  );

  // ============================================================
  // INÍCIO
  // ============================================================

  status.textContent =
    "Pronto para estudar.";

  toast(
    "📚 Assistente iniciado.",
    1800
  );

})();
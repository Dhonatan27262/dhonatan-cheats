// ======================================================
// KHAN DEBUGGER — DIAGNÓSTICO VISUAL
// Mostra a estrutura das respostas de rede na própria tela
// ======================================================

(() => {
  "use strict";

  if (window.__KHAN_DEBUGGER__) {
    alert("Debugger já está ativo.");
    return;
  }

  window.__KHAN_DEBUGGER__ = true;

  // -------------------------------
  // PAINEL
  // -------------------------------

  const panel = document.createElement("div");

  panel.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    z-index: 2147483647;
    background: #111;
    color: #eee;
    border: 2px solid #666;
    border-radius: 12px;
    padding: 12px;
    font-family: monospace;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  `;

  const title = document.createElement("div");

  title.textContent = "🔎 KHAN DEBUGGER";

  title.style.cssText = `
    font-size: 17px;
    font-weight: bold;
    margin-bottom: 10px;
  `;

  const output = document.createElement("textarea");

  output.readOnly = true;

  output.style.cssText = `
    flex: 1;
    width: 100%;
    resize: none;
    box-sizing: border-box;
    background: #000;
    color: #00ff88;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 10px;
    font-family: monospace;
    font-size: 11px;
    line-height: 1.4;
  `;

  const buttons = document.createElement("div");

  buttons.style.cssText = `
    display: flex;
    gap: 8px;
    margin-top: 10px;
  `;

  function makeButton(text) {
    const b = document.createElement("button");

    b.textContent = text;

    b.style.cssText = `
      flex: 1;
      padding: 10px;
      border: 0;
      border-radius: 8px;
      background: #333;
      color: white;
      font-weight: bold;
    `;

    return b;
  }

  const copyButton = makeButton("📋 Copiar");

  const clearButton = makeButton("🗑 Limpar");

  const closeButton = makeButton("✖ Fechar");

  buttons.append(copyButton, clearButton, closeButton);

  panel.append(title, output, buttons);

  document.documentElement.appendChild(panel);

  // -------------------------------
  // LOG
  // -------------------------------

  const logs = [];

  function log(...args) {
    const line = args.map(value => {
      if (typeof value === "string") return value;

      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }).join(" ");

    logs.push(line);

    // Limita o tamanho para não travar o iPhone
    if (logs.length > 2000) {
      logs.splice(0, logs.length - 2000);
    }

    output.value = logs.join("\n\n");

    output.scrollTop = output.scrollHeight;
  }

  log("✅ Debugger iniciado.");
  log("Abra ou recarregue uma questão do Khan Academy.");
  log("Aguardando requisições relacionadas a exercícios...");

  // -------------------------------
  // COPIAR
  // -------------------------------

  copyButton.onclick = async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      copyButton.textContent = "✅ Copiado!";
      setTimeout(() => {
        copyButton.textContent = "📋 Copiar";
      }, 1500);
    } catch {
      output.select();
      document.execCommand("copy");
    }
  };

  clearButton.onclick = () => {
    logs.length = 0;
    log("🧹 Diagnóstico limpo.");
  };

  closeButton.onclick = () => {
    panel.remove();
    window.__KHAN_DEBUGGER__ = false;
  };

  // -------------------------------
  // FUNÇÃO PARA LISTAR CAMINHOS
  // -------------------------------

  function getPaths(obj, maxDepth = 8) {
    const result = [];

    function walk(value, path, depth) {
      if (depth > maxDepth) return;

      if (!value || typeof value !== "object") return;

      for (const key of Object.keys(value)) {
        const current = path
          ? `${path}.${key}`
          : key;

        result.push(current);

        try {
          walk(value[key], current, depth + 1);
        } catch {}
      }
    }

    walk(obj, "", 0);

    return result;
  }

  // -------------------------------
  // ANALISAR JSON
  // -------------------------------

  function inspectJSON(url, data) {
    log("========================================");
    log("📡 REQUISIÇÃO ENCONTRADA");
    log("========================================");

    log("URL:");
    log(url);

    log("Estrutura principal:");

    const paths = getPaths(data);

    log(paths.join("\n"));

    log("========================================");
    log("📦 JSON RECEBIDO");
    log("========================================");

    try {
      log(JSON.stringify(data, null, 2));
    } catch {
      log("Não foi possível converter o JSON.");
    }
  }

  // -------------------------------
  // INTERCEPTAR FETCH
  // -------------------------------

  const originalFetch = window.fetch;

  window.fetch = async function(...args) {

    const response = await originalFetch.apply(this, args);

    try {

      const request = args[0];

      const url =
        request instanceof Request
          ? request.url
          : String(request);

      // Apenas requisições potencialmente relacionadas
      // a exercícios/questões.
      if (
        /assessment/i.test(url) ||
        /problem/i.test(url) ||
        /exercise/i.test(url) ||
        /question/i.test(url)
      ) {

        const clone = response.clone();

        const text = await clone.text();

        try {

          const json = JSON.parse(text);

          inspectJSON(url, json);

        } catch {

          log("========================================");
          log("📡 RESPOSTA NÃO JSON");
          log("========================================");

          log("URL:");
          log(url);

          log("Conteúdo inicial:");
          log(text.slice(0, 5000));
        }
      }

    } catch (error) {

      log("⚠️ Erro ao analisar requisição:");
      log(String(error));

    }

    return response;
  };

  // -------------------------------
  // XMLHttpRequest
  // Algumas páginas usam XHR em vez
  // de fetch.
  // -------------------------------

  const OriginalXHR = XMLHttpRequest;

  XMLHttpRequest.prototype.open =
    function(method, url, ...rest) {

      this.__khanDebugURL = String(url);

      return OriginalXHR.prototype.open.call(
        this,
        method,
        url,
        ...rest
      );
    };

  XMLHttpRequest.prototype.addEventListener;

  const originalSend =
    XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send =
    function(...args) {

      this.addEventListener("load", function() {

        try {

          const url = this.__khanDebugURL || "";

          if (
            /assessment/i.test(url) ||
            /problem/i.test(url) ||
            /exercise/i.test(url) ||
            /question/i.test(url)
          ) {

            const text = this.responseText;

            try {

              const json = JSON.parse(text);

              inspectJSON(url, json);

            } catch {

              log("XHR não JSON:");
              log(url);
              log(text.slice(0, 5000));

            }
          }

        } catch (error) {

          log("Erro XHR:");
          log(String(error));

        }

      });

      return originalSend.apply(this, args);
    };

  log("🟢 Interceptação ativada.");
  log("Agora abra uma questão.");

})();
(() => {
    "use strict";

    // =========================================================
    // KHAN STRUCTURE DEBUGGER
    // Compatível com GitHub -> Atalho -> eval()
    // =========================================================

    const FLAG = "__KHAN_DEBUGGER_V2__";
    const RELOAD_FLAG = "__KHAN_DEBUGGER_RELOADED__";

    if (window[FLAG]) return;
    window[FLAG] = true;

    // ---------------------------------------------------------
    // PAINEL
    // ---------------------------------------------------------

    const panel = document.createElement("div");

    panel.style.cssText = `
        position:fixed;
        inset:8px;
        z-index:2147483647;
        background:#0b0b0b;
        color:#e8e8e8;
        border:2px solid #555;
        border-radius:14px;
        display:flex;
        flex-direction:column;
        overflow:hidden;
        font-family:monospace;
        box-shadow:0 10px 40px rgba(0,0,0,.7);
    `;

    const header = document.createElement("div");

    header.style.cssText = `
        padding:12px;
        background:#181818;
        display:flex;
        align-items:center;
        justify-content:space-between;
        font-family:Arial,sans-serif;
        font-weight:bold;
    `;

    header.innerHTML = `
        <span>🔎 KHAN DEBUGGER V2</span>
        <span id="khan-status" style="color:#00ff88">
            ● ATIVO
        </span>
    `;

    const output = document.createElement("textarea");

    output.readOnly = true;

    output.style.cssText = `
        flex:1;
        width:100%;
        border:0;
        outline:0;
        resize:none;
        box-sizing:border-box;
        padding:12px;
        background:#050505;
        color:#00ff88;
        font-family:monospace;
        font-size:11px;
        line-height:1.45;
    `;

    const footer = document.createElement("div");

    footer.style.cssText = `
        display:flex;
        gap:6px;
        padding:8px;
        background:#181818;
    `;

    function button(text) {
        const b = document.createElement("button");

        b.textContent = text;

        b.style.cssText = `
            flex:1;
            padding:11px 5px;
            border:0;
            border-radius:8px;
            background:#303030;
            color:white;
            font-weight:bold;
            font-size:12px;
        `;

        return b;
    }

    const copyBtn = button("📋 COPIAR");
    const clearBtn = button("🗑 LIMPAR");
    const closeBtn = button("✖ FECHAR");

    footer.append(copyBtn, clearBtn, closeBtn);
    panel.append(header, output, footer);

    document.documentElement.appendChild(panel);

    // ---------------------------------------------------------
    // LOG
    // ---------------------------------------------------------

    let logs = [];

    function log(title, data = "") {

        const time = new Date().toLocaleTimeString();

        let text = "";

        if (typeof data === "string") {
            text = data;
        } else {
            try {
                text = JSON.stringify(data, null, 2);
            } catch {
                text = String(data);
            }
        }

        logs.push(
            `[${time}] ${title}\n${text}`
        );

        // Evita memória excessiva no iPhone
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }

        output.value = logs.join("\n\n");
        output.scrollTop = output.scrollHeight;
    }

    // ---------------------------------------------------------
    // IDENTIFICAR REQUISIÇÕES
    // ---------------------------------------------------------

    function isInteresting(url, body = "") {

        const value = (
            String(url || "") +
            " " +
            String(body || "")
        ).toLowerCase();

        return (
            value.includes("assessment") ||
            value.includes("assessmentitem") ||
            value.includes("getassessmentitem") ||
            value.includes("graphql") ||
            value.includes("exercise") ||
            value.includes("problem")
        );
    }

    // ---------------------------------------------------------
    // LISTAR ESTRUTURA SEM ALTERAR A RESPOSTA
    // ---------------------------------------------------------

    function getStructure(value, maxDepth = 7) {

        const paths = [];

        function walk(obj, path, depth) {

            if (depth > maxDepth) return;

            if (
                obj === null ||
                typeof obj !== "object"
            ) {
                return;
            }

            for (const key of Object.keys(obj)) {

                const current =
                    path
                        ? `${path}.${key}`
                        : key;

                paths.push(current);

                try {
                    walk(
                        obj[key],
                        current,
                        depth + 1
                    );
                } catch {}
            }
        }

        walk(value, "", 0);

        return paths;
    }

    function inspect(url, data) {

        log(
            "📡 REQUISIÇÃO DE QUESTÃO DETECTADA",
            url
        );

        const structure = getStructure(data);

        log(
            "📂 CAMINHOS DA ESTRUTURA",
            structure.join("\n")
        );

        // Mostra somente um resumo das chaves de alto nível
        // para facilitar a leitura no iPhone.

        if (
            data &&
            typeof data === "object"
        ) {

            log(
                "🔑 CHAVES PRINCIPAIS",
                Object.keys(data).join("\n")
            );
        }

        log(
            "✅ JSON RECEBIDO",
            "A estrutura acima foi capturada sem modificar a resposta."
        );
    }

    // ---------------------------------------------------------
    // FETCH
    // ---------------------------------------------------------

    const originalFetch = window.fetch;

    window.fetch = async function(...args) {

        let url = "";

        try {

            const request = args[0];

            if (request instanceof Request) {
                url = request.url;
            } else {
                url = String(request);
            }

        } catch {}

        let body = "";

        try {

            const request = args[0];
            const init = args[1];

            if (request instanceof Request) {
                body = await request.clone().text();
            } else if (init && init.body) {
                body = String(init.body);
            }

        } catch {}

        const response =
            await originalFetch.apply(this, args);

        if (isInteresting(url, body)) {

            try {

                const clone = response.clone();

                const text =
                    await clone.text();

                try {

                    const json =
                        JSON.parse(text);

                    inspect(url, json);

                } catch {

                    log(
                        "📄 RESPOSTA NÃO JSON",
                        text.slice(0, 4000)
                    );
                }

            } catch (error) {

                log(
                    "⚠️ ERRO AO LER FETCH",
                    String(error)
                );
            }
        }

        return response;
    };

    // ---------------------------------------------------------
    // XHR
    // ---------------------------------------------------------

    const OriginalXHR = window.XMLHttpRequest;

    const originalOpen =
        OriginalXHR.prototype.open;

    const originalSend =
        OriginalXHR.prototype.send;

    OriginalXHR.prototype.open =
        function(method, url, ...rest) {

            this.__khanDebugURL =
                String(url);

            this.__khanDebugMethod =
                String(method);

            return originalOpen.call(
                this,
                method,
                url,
                ...rest
            );
        };

    OriginalXHR.prototype.send =
        function(body) {

            const xhr = this;

            xhr.addEventListener(
                "load",
                function() {

                    const url =
                        xhr.__khanDebugURL || "";

                    if (!isInteresting(url, body)) {
                        return;
                    }

                    try {

                        const text =
                            xhr.responseText;

                        try {

                            const json =
                                JSON.parse(text);

                            inspect(url, json);

                        } catch {

                            log(
                                "📄 XHR NÃO JSON",
                                text.slice(0, 4000)
                            );
                        }

                    } catch (error) {

                        log(
                            "⚠️ ERRO XHR",
                            String(error)
                        );
                    }
                }
            );

            return originalSend.call(
                this,
                body
            );
        };

    // ---------------------------------------------------------
    // PERFORMANCE OBSERVER
    // Descobre requisições mesmo quando não conseguimos
    // acessar o corpo da resposta.
    // ---------------------------------------------------------

    try {

        const observer =
            new PerformanceObserver(list => {

                for (const entry of list.getEntries()) {

                    if (
                        entry.name &&
                        isInteresting(entry.name)
                    ) {

                        log(
                            "🌐 RECURSO DETECTADO",
                            entry.name
                        );
                    }
                }
            });

        observer.observe({
            type: "resource",
            buffered: true
        });

    } catch {}

    // ---------------------------------------------------------
    // BOTÕES
    // ---------------------------------------------------------

    copyBtn.onclick = async () => {

        try {

            await navigator.clipboard.writeText(
                output.value
            );

            copyBtn.textContent = "✅ COPIADO";

            setTimeout(() => {
                copyBtn.textContent = "📋 COPIAR";
            }, 1500);

        } catch {

            output.focus();
            output.select();
            document.execCommand("copy");
        }
    };

    clearBtn.onclick = () => {

        logs = [];

        log(
            "🧹 LIMPO",
            "Aguardando nova questão..."
        );
    };

    closeBtn.onclick = () => {

        panel.remove();

        try {
            delete window[FLAG];
        } catch {}
    };

    // ---------------------------------------------------------
    // INICIALIZAÇÃO
    // ---------------------------------------------------------

    log(
        "🚀 DEBUGGER V2 INICIADO",
        "Interceptor instalado."
    );

    log(
        "📱 MODO IPHONE",
        "Monitorando Fetch + XHR + Performance."
    );

    log(
        "⏳ AGUARDANDO",
        "Abra/recarregue uma questão."
    );

})();
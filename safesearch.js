(() => {
    "use strict";

    // =========================================================
    // KHAN ACADEMY — DEBUGGER V2
    // GitHub -> Atalho -> eval()
    // Painel pequeno / arrastável / minimizável
    // =========================================================

    const FLAG = "__KHAN_DEBUGGER_V2__";

    if (window[FLAG]) {
        return;
    }

    window[FLAG] = true;

    // =========================================================
    // CONFIGURAÇÕES
    // =========================================================

    const MAX_LOGS = 100;
    const MAX_RESPONSE_TEXT = 6000;
    const MAX_STRUCTURE_DEPTH = 8;

    // =========================================================
    // PAINEL
    // =========================================================

    const panel = document.createElement("div");

    panel.style.cssText = `
        position: fixed;
        top: 70px;
        right: 10px;
        width: 260px;
        height: 190px;
        z-index: 2147483647;

        background: rgba(15,15,15,.97);
        color: #eee;

        border: 1px solid #555;
        border-radius: 12px;

        display: flex;
        flex-direction: column;

        overflow: hidden;

        font-family: monospace;
        font-size: 10px;

        box-shadow:
            0 5px 25px rgba(0,0,0,.55);

        opacity: .94;

        box-sizing: border-box;
    `;

    // =========================================================
    // CABEÇALHO
    // =========================================================

    const header = document.createElement("div");

    header.style.cssText = `
        height: 34px;
        min-height: 34px;

        padding: 0 7px;

        background: #202020;

        display: flex;
        align-items: center;
        justify-content: space-between;

        font-family: Arial, sans-serif;
        font-size: 11px;
        font-weight: bold;

        touch-action: none;

        user-select: none;
    `;

    const title = document.createElement("span");

    title.textContent = "🔎 DEBUG V2";

    const status = document.createElement("span");

    status.textContent = "●";

    status.style.cssText = `
        color: #00ff88;
        margin-left: 5px;
    `;

    const titleArea = document.createElement("div");

    titleArea.style.cssText = `
        display:flex;
        align-items:center;
        gap:3px;
    `;

    titleArea.append(title, status);

    // =========================================================
    // BOTÕES DO CABEÇALHO
    // =========================================================

    const headerButtons = document.createElement("div");

    headerButtons.style.cssText = `
        display:flex;
        gap:4px;
    `;

    function createHeaderButton(text) {

        const button = document.createElement("button");

        button.textContent = text;

        button.style.cssText = `
            width:25px;
            height:25px;

            border:0;
            border-radius:6px;

            background:#333;
            color:white;

            font-size:16px;
            line-height:20px;

            padding:0;

            touch-action:manipulation;
        `;

        return button;
    }

    const minimizeBtn =
        createHeaderButton("—");

    const closeBtn =
        createHeaderButton("×");

    headerButtons.append(
        minimizeBtn,
        closeBtn
    );

    header.append(
        titleArea,
        headerButtons
    );

    // =========================================================
    // ÁREA DE SAÍDA
    // =========================================================

    const output = document.createElement("textarea");

    output.readOnly = true;

    output.style.cssText = `
        flex:1;

        width:100%;
        min-height:0;

        border:0;
        outline:0;

        resize:none;

        box-sizing:border-box;

        padding:7px;

        background:#050505;
        color:#00ff88;

        font-family:monospace;
        font-size:9px;

        line-height:1.3;
    `;

    // =========================================================
    // RODAPÉ
    // =========================================================

    const footer = document.createElement("div");

    footer.style.cssText = `
        display:flex;
        gap:4px;

        padding:5px;

        background:#181818;
    `;

    function createFooterButton(text) {

        const button = document.createElement("button");

        button.textContent = text;

        button.style.cssText = `
            flex:1;

            padding:6px 3px;

            border:0;
            border-radius:6px;

            background:#303030;
            color:white;

            font-size:10px;
            font-weight:bold;

            touch-action:manipulation;
        `;

        return button;
    }

    const copyBtn =
        createFooterButton("📋 Copiar");

    const clearBtn =
        createFooterButton("🗑 Limpar");

    footer.append(
        copyBtn,
        clearBtn
    );

    // =========================================================
    // MONTAR PAINEL
    // =========================================================

    panel.append(
        header,
        output,
        footer
    );

    document.documentElement.appendChild(panel);

    // =========================================================
    // SISTEMA DE LOG
    // =========================================================

    let logs = [];

    function log(title, data = "") {

        let text;

        if (typeof data === "string") {

            text = data;

        } else {

            try {

                text =
                    JSON.stringify(
                        data,
                        null,
                        2
                    );

            } catch {

                text =
                    String(data);
            }
        }

        const time =
            new Date()
                .toLocaleTimeString();

        logs.push(
            `[${time}] ${title}\n${text}`
        );

        if (logs.length > MAX_LOGS) {

            logs =
                logs.slice(-MAX_LOGS);
        }

        output.value =
            logs.join("\n\n");

        output.scrollTop =
            output.scrollHeight;
    }

    // =========================================================
    // INÍCIO
    // =========================================================

    log(
        "🚀 DEBUGGER INICIADO",
        "Debugger V2 carregado."
    );

    log(
        "📱 MODO IPHONE",
        "Painel visual + Fetch + XHR + Performance."
    );

    log(
        "⏳ AGUARDANDO",
        "Abra ou recarregue uma questão."
    );

    // =========================================================
    // MINIMIZAR
    // =========================================================

    let minimized = false;

    minimizeBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            minimized =
                !minimized;

            if (minimized) {

                output.style.display =
                    "none";

                footer.style.display =
                    "none";

                panel.style.width =
                    "125px";

                panel.style.height =
                    "38px";

                minimizeBtn.textContent =
                    "+";

            } else {

                output.style.display =
                    "block";

                footer.style.display =
                    "flex";

                panel.style.width =
                    "260px";

                panel.style.height =
                    "190px";

                minimizeBtn.textContent =
                    "—";
            }
        }
    );

    // =========================================================
    // ARRASTAR NO IPHONE
    // =========================================================

    let dragging = false;

    let startX = 0;
    let startY = 0;

    let startRight = 10;
    let startTop = 70;

    header.addEventListener(
        "touchstart",
        event => {

            if (
                event.target.tagName ===
                "BUTTON"
            ) {
                return;
            }

            const touch =
                event.touches[0];

            const rect =
                panel.getBoundingClientRect();

            dragging = true;

            startX =
                touch.clientX;

            startY =
                touch.clientY;

            startRight =
                window.innerWidth -
                rect.right;

            startTop =
                rect.top;

        },
        {
            passive: true
        }
    );

    document.addEventListener(
        "touchmove",
        event => {

            if (!dragging) {
                return;
            }

            const touch =
                event.touches[0];

            const dx =
                touch.clientX -
                startX;

            const dy =
                touch.clientY -
                startY;

            const newRight =
                Math.max(
                    5,
                    startRight - dx
                );

            const newTop =
                Math.max(
                    5,
                    startTop + dy
                );

            panel.style.right =
                `${newRight}px`;

            panel.style.top =
                `${newTop}px`;
        },
        {
            passive: true
        }
    );

    document.addEventListener(
        "touchend",
        () => {
            dragging = false;
        }
    );

    // =========================================================
    // COPIAR
    // =========================================================

    copyBtn.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    output.value
                );

                copyBtn.textContent =
                    "✅ Copiado";

                setTimeout(
                    () => {
                        copyBtn.textContent =
                            "📋 Copiar";
                    },
                    1500
                );

            } catch {

                output.focus();
                output.select();

                try {
                    document.execCommand("copy");
                } catch {}

                copyBtn.textContent =
                    "✅ Copiado";

                setTimeout(
                    () => {
                        copyBtn.textContent =
                            "📋 Copiar";
                    },
                    1500
                );
            }
        }
    );

    // =========================================================
    // LIMPAR
    // =========================================================

    clearBtn.addEventListener(
        "click",
        () => {

            logs = [];

            log(
                "🧹 LIMPO",
                "Aguardando nova requisição..."
            );
        }
    );

    // =========================================================
    // FECHAR
    // =========================================================

    closeBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            panel.remove();

            try {
                delete window[FLAG];
            } catch {}
        }
    );

    // =========================================================
    // VERIFICAR URL
    // =========================================================

    function isInteresting(
        url,
        body = ""
    ) {

        const value =
            (
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
            value.includes("problem") ||
            value.includes("question")
        );
    }

    // =========================================================
    // ESTRUTURA DO JSON
    // =========================================================

    function getStructure(
        object,
        maxDepth = MAX_STRUCTURE_DEPTH
    ) {

        const paths = [];

        function walk(
            value,
            path,
            depth
        ) {

            if (
                depth >
                maxDepth
            ) {
                return;
            }

            if (
                value === null ||
                typeof value !== "object"
            ) {
                return;
            }

            let keys;

            try {

                keys =
                    Object.keys(value);

            } catch {

                return;
            }

            for (const key of keys) {

                const current =
                    path
                        ? `${path}.${key}`
                        : key;

                paths.push(current);

                try {

                    walk(
                        value[key],
                        current,
                        depth + 1
                    );

                } catch {}
            }
        }

        walk(
            object,
            "",
            0
        );

        return paths;
    }

    // =========================================================
    // ANALISAR JSON
    // =========================================================

    function inspectJSON(
        url,
        data,
        source
    ) {

        log(
            "========================================",
            ""
        );

        log(
            "📡 REQUISIÇÃO DETECTADA",
            source
        );

        log(
            "🌐 URL",
            url
        );

        // -----------------------------------------------------
        // CHAVES PRINCIPAIS
        // -----------------------------------------------------

        try {

            log(
                "🔑 CHAVES PRINCIPAIS",
                Object.keys(data).join("\n")
            );

        } catch {}

        // -----------------------------------------------------
        // CAMINHOS
        // -----------------------------------------------------

        const paths =
            getStructure(data);

        log(
            "📂 CAMINHOS ENCONTRADOS",
            paths.join("\n")
        );

        // -----------------------------------------------------
        // JSON
        // -----------------------------------------------------

        try {

            let json =
                JSON.stringify(
                    data,
                    null,
                    2
                );

            if (
                json.length >
                MAX_RESPONSE_TEXT
            ) {

                json =
                    json.slice(
                        0,
                        MAX_RESPONSE_TEXT
                    ) +
                    "\n\n...[JSON CORTADO]...";
            }

            log(
                "📦 JSON",
                json
            );

        } catch {

            log(
                "⚠️ JSON",
                "Não foi possível converter."
            );
        }

        log(
            "========================================",
            "Fim da captura."
        );
    }

    // =========================================================
    // FETCH
    // =========================================================

    const originalFetch =
        window.fetch;

    window.fetch =
        async function(...args) {

            let url = "";
            let body = "";

            // -------------------------------------------------
            // URL
            // -------------------------------------------------

            try {

                const request =
                    args[0];

                if (
                    request instanceof Request
                ) {

                    url =
                        request.url;

                } else {

                    url =
                        String(request);
                }

            } catch {}

            // -------------------------------------------------
            // BODY
            // -------------------------------------------------

            try {

                const request =
                    args[0];

                const init =
                    args[1];

                if (
                    request instanceof Request
                ) {

                    body =
                        await request
                            .clone()
                            .text();

                } else if (
                    init &&
                    init.body
                ) {

                    body =
                        String(
                            init.body
                        );
                }

            } catch {}

            // -------------------------------------------------
            // REQUISIÇÃO ORIGINAL
            // -------------------------------------------------

            const response =
                await originalFetch.apply(
                    this,
                    args
                );

            // -------------------------------------------------
            // FILTRO
            // -------------------------------------------------

            if (
                isInteresting(
                    url,
                    body
                )
            ) {

                try {

                    const clone =
                        response.clone();

                    const text =
                        await clone.text();

                    try {

                        const json =
                            JSON.parse(text);

                        inspectJSON(
                            url,
                            json,
                            "FETCH"
                        );

                    } catch {

                        log(
                            "📄 FETCH NÃO JSON",
                            text.slice(
                                0,
                                MAX_RESPONSE_TEXT
                            )
                        );
                    }

                } catch (error) {

                    log(
                        "⚠️ ERRO FETCH",
                        String(error)
                    );
                }
            }

            return response;
        };

    // =========================================================
    // XMLHttpRequest
    // =========================================================

    const XHR =
        window.XMLHttpRequest;

    const originalOpen =
        XHR.prototype.open;

    const originalSend =
        XHR.prototype.send;

    XHR.prototype.open =
        function(
            method,
            url,
            ...rest
        ) {

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

    XHR.prototype.send =
        function(body) {

            const xhr =
                this;

            xhr.addEventListener(
                "load",
                function() {

                    try {

                        const url =
                            xhr.__khanDebugURL ||
                            "";

                        if (
                            !isInteresting(
                                url,
                                body
                            )
                        ) {
                            return;
                        }

                        let text = "";

                        try {

                            text =
                                xhr.responseText;

                        } catch {

                            return;
                        }

                        try {

                            const json =
                                JSON.parse(text);

                            inspectJSON(
                                url,
                                json,
                                "XMLHttpRequest"
                            );

                        } catch {

                            log(
                                "📄 XHR NÃO JSON",
                                text.slice(
                                    0,
                                    MAX_RESPONSE_TEXT
                                )
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

    // =========================================================
    // PERFORMANCE OBSERVER
    // =========================================================

    try {

        const observer =
            new PerformanceObserver(
                list => {

                    for (
                        const entry
                        of list.getEntries()
                    ) {

                        if (
                            entry.name &&
                            isInteresting(
                                entry.name
                            )
                        ) {

                            log(
                                "🌐 RECURSO DETECTADO",
                                entry.name
                            );
                        }
                    }
                }
            );

        observer.observe({
            type: "resource",
            buffered: true
        });

    } catch {}

    // =========================================================
    // FINAL
    // =========================================================

    log(
        "🟢 MONITORAMENTO ATIVO",
        "Agora recarregue a atividade e abra uma questão."
    );

})();
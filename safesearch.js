(() => {
    "use strict";

    const FLAG = "__KHAN_ASSESSMENT_DEBUG_V3__";

    if (window[FLAG]) return;
    window[FLAG] = true;

    // =========================================================
    // PAINEL PEQUENO
    // =========================================================

    const panel = document.createElement("div");

    panel.style.cssText = `
        position:fixed;
        top:70px;
        right:10px;
        width:280px;
        height:220px;
        z-index:2147483647;
        background:#0b0b0b;
        color:white;
        border:1px solid #555;
        border-radius:12px;
        display:flex;
        flex-direction:column;
        overflow:hidden;
        box-shadow:0 5px 25px rgba(0,0,0,.6);
        font-family:monospace;
    `;

    const header = document.createElement("div");

    header.style.cssText = `
        height:34px;
        min-height:34px;
        padding:0 8px;
        background:#202020;
        display:flex;
        align-items:center;
        justify-content:space-between;
        font-family:Arial,sans-serif;
        font-size:11px;
        font-weight:bold;
        touch-action:none;
    `;

    header.innerHTML = `
        <span>🔎 ASSESSMENT DEBUG</span>
        <span style="color:#00ff88">●</span>
    `;

    const controls = document.createElement("div");

    const minimize = document.createElement("button");
    minimize.textContent = "—";

    const close = document.createElement("button");
    close.textContent = "×";

    for (const b of [minimize, close]) {
        b.style.cssText = `
            width:25px;
            height:25px;
            margin-left:4px;
            border:0;
            border-radius:6px;
            background:#333;
            color:white;
            font-size:16px;
        `;
    }

    controls.append(minimize, close);
    header.appendChild(controls);

    const output = document.createElement("textarea");

    output.readOnly = true;

    output.style.cssText = `
        flex:1;
        min-height:0;
        width:100%;
        box-sizing:border-box;
        resize:none;
        border:0;
        outline:0;
        padding:7px;
        background:#050505;
        color:#00ff88;
        font-family:monospace;
        font-size:9px;
        line-height:1.35;
    `;

    const footer = document.createElement("div");

    footer.style.cssText = `
        display:flex;
        gap:4px;
        padding:5px;
        background:#181818;
    `;

    const copy = document.createElement("button");
    copy.textContent = "📋 Copiar";

    const clear = document.createElement("button");
    clear.textContent = "🗑 Limpar";

    for (const b of [copy, clear]) {
        b.style.cssText = `
            flex:1;
            padding:6px;
            border:0;
            border-radius:6px;
            background:#303030;
            color:white;
            font-size:10px;
            font-weight:bold;
        `;
    }

    footer.append(copy, clear);

    panel.append(header, output, footer);

    document.documentElement.appendChild(panel);

    // =========================================================
    // LOG
    // =========================================================

    let logs = [];

    function log(title, value = "") {

        let text;

        try {
            text =
                typeof value === "string"
                    ? value
                    : JSON.stringify(value, null, 2);
        } catch {
            text = String(value);
        }

        logs.push(
            `[${new Date().toLocaleTimeString()}] ${title}\n${text}`
        );

        if (logs.length > 80) {
            logs = logs.slice(-80);
        }

        output.value = logs.join("\n\n");
        output.scrollTop = output.scrollHeight;
    }

    // =========================================================
    // SOMENTE O ENDPOINT DA QUESTÃO
    // =========================================================

    function isTarget(url) {

        return String(url || "")
            .includes("getAssessmentItemById");
    }

    // =========================================================
    // RESUMO DA ESTRUTURA
    // =========================================================

    function inspect(value, path = "", depth = 0) {

        if (depth > 7) return;

        if (
            value === null ||
            typeof value !== "object"
        ) {
            return;
        }

        let keys;

        try {
            keys = Object.keys(value);
        } catch {
            return;
        }

        for (const key of keys) {

            const current =
                path
                    ? `${path}.${key}`
                    : key;

            log(
                "🔑 CAMPO",
                current
            );

            try {
                inspect(
                    value[key],
                    current,
                    depth + 1
                );
            } catch {}
        }
    }

    function processResponse(
        url,
        text,
        source
    ) {

        log(
            "🎯 getAssessmentItemById DETECTADO",
            source
        );

        log(
            "🌐 URL",
            url
        );

        if (!text) {

            log(
                "⚠️ RESPOSTA VAZIA",
                ""
            );

            return;
        }

        try {

            const json =
                JSON.parse(text);

            log(
                "✅ JSON RECEBIDO",
                "A resposta é JSON."
            );

            // Mostra os caminhos encontrados
            inspect(json);

            // Mostra uma versão limitada do JSON
            let raw =
                JSON.stringify(
                    json,
                    null,
                    2
                );

            if (raw.length > 12000) {
                raw =
                    raw.slice(0, 12000) +
                    "\n\n...[CORTE DE SEGURANÇA]...";
            }

            log(
                "📦 RESPOSTA JSON",
                raw
            );

        } catch {

            log(
                "📄 RESPOSTA NÃO JSON",
                text.slice(0, 5000)
            );
        }
    }

    // =========================================================
    // FETCH
    // =========================================================

    const originalFetch =
        window.fetch;

    window.fetch =
        async function(...args) {

            let url = "";
            let requestBody = "";

            try {

                const request = args[0];

                if (
                    request instanceof Request
                ) {

                    url = request.url;

                } else {

                    url = String(request);
                }

            } catch {}

            try {

                const request = args[0];
                const init = args[1];

                if (
                    request instanceof Request
                ) {

                    requestBody =
                        await request
                            .clone()
                            .text();

                } else if (
                    init?.body
                ) {

                    requestBody =
                        String(init.body);
                }

            } catch {}

            const response =
                await originalFetch.apply(
                    this,
                    args
                );

            if (isTarget(url)) {

                try {

                    const clone =
                        response.clone();

                    const text =
                        await clone.text();

                    processResponse(
                        url,
                        text,
                        "FETCH"
                    );

                } catch (error) {

                    log(
                        "❌ ERRO AO LER FETCH",
                        String(error)
                    );
                }
            }

            return response;
        };

    // =========================================================
    // XHR
    // =========================================================

    const OriginalXHR =
        window.XMLHttpRequest;

    const originalOpen =
        OriginalXHR.prototype.open;

    const originalSend =
        OriginalXHR.prototype.send;

    OriginalXHR.prototype.open =
        function(method, url, ...rest) {

            this.__assessmentURL =
                String(url);

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
                        xhr.__assessmentURL || "";

                    if (!isTarget(url)) {
                        return;
                    }

                    try {

                        processResponse(
                            url,
                            xhr.responseText,
                            "XHR"
                        );

                    } catch (error) {

                        log(
                            "❌ ERRO XHR",
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
    // MINIMIZAR
    // =========================================================

    let minimized = false;

    minimize.onclick = () => {

        minimized = !minimized;

        if (minimized) {

            output.style.display = "none";
            footer.style.display = "none";

            panel.style.width = "145px";
            panel.style.height = "38px";

            minimize.textContent = "+";

        } else {

            output.style.display = "block";
            footer.style.display = "flex";

            panel.style.width = "280px";
            panel.style.height = "220px";

            minimize.textContent = "—";
        }
    };

    // =========================================================
    // COPIAR
    // =========================================================

    copy.onclick = async () => {

        try {

            await navigator.clipboard.writeText(
                output.value
            );

            copy.textContent = "✅ Copiado";

            setTimeout(() => {
                copy.textContent = "📋 Copiar";
            }, 1500);

        } catch {

            output.focus();
            output.select();

            try {
                document.execCommand("copy");
            } catch {}
        }
    };

    // =========================================================
    // LIMPAR
    // =========================================================

    clear.onclick = () => {

        logs = [];

        log(
            "🧹 LIMPO",
            "Aguardando getAssessmentItemById..."
        );
    };

    // =========================================================
    // FECHAR
    // =========================================================

    close.onclick = () => {

        panel.remove();

        try {
            delete window[FLAG];
        } catch {}
    };

    // =========================================================
    // ARRASTAR
    // =========================================================

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startTop = 70;
    let startRight = 10;

    header.addEventListener(
        "touchstart",
        e => {

            if (
                e.target.tagName === "BUTTON"
            ) {
                return;
            }

            const touch =
                e.touches[0];

            const rect =
                panel.getBoundingClientRect();

            dragging = true;

            startX =
                touch.clientX;

            startY =
                touch.clientY;

            startTop =
                rect.top;

            startRight =
                window.innerWidth -
                rect.right;

        },
        { passive:true }
    );

    document.addEventListener(
        "touchmove",
        e => {

            if (!dragging) return;

            const touch =
                e.touches[0];

            const dx =
                touch.clientX - startX;

            const dy =
                touch.clientY - startY;

            panel.style.right =
                `${Math.max(
                    5,
                    startRight - dx
                )}px`;

            panel.style.top =
                `${Math.max(
                    5,
                    startTop + dy
                )}px`;
        },
        { passive:true }
    );

    document.addEventListener(
        "touchend",
        () => {
            dragging = false;
        }
    );

    // =========================================================
    // PRONTO
    // =========================================================

    log(
        "🚀 DEBUGGER V3",
        "Monitorando SOMENTE getAssessmentItemById."
    );

    log(
        "📱 IPHONE",
        "Recarregue a atividade depois de executar o script."
    );

})();
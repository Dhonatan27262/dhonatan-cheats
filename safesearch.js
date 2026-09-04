(() => {
    "use strict";

    if (window.__ESTUDOS_AI_V5__) {
        alert("Assistente já está carregado.");
        return;
    }

    window.__ESTUDOS_AI_V5__ = true;

    const ID = "estudos-ai-v5";
    let textoCapturado = "";
    let imagemCapturada = null;

    // =========================================================
    // ESTILO
    // =========================================================

    const style = document.createElement("style");

    style.textContent = `
        #${ID}{
            position:fixed;
            right:10px;
            bottom:90px;
            width:275px;
            max-width:calc(100vw - 20px);
            z-index:2147483647;
            background:#111827;
            color:white;
            border-radius:16px;
            padding:11px;
            box-shadow:0 8px 30px rgba(0,0,0,.45);
            font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        }

        #${ID} *{
            box-sizing:border-box;
        }

        #${ID} .cabecalho{
            display:flex;
            align-items:center;
            justify-content:space-between;
            margin-bottom:8px;
        }

        #${ID} .titulo{
            font-size:14px;
            font-weight:700;
        }

        #${ID} .min{
            border:0;
            background:none;
            color:white;
            font-size:20px;
            cursor:pointer;
        }

        #${ID} input,
        #${ID} select{
            width:100%;
            padding:9px;
            margin-bottom:6px;
            border-radius:8px;
            border:1px solid #374151;
            background:#1f2937;
            color:white;
            font-size:11px;
            outline:none;
        }

        #${ID} button.acao{
            width:100%;
            border:0;
            border-radius:8px;
            padding:9px;
            margin-top:5px;
            background:#374151;
            color:white;
            font-weight:700;
            font-size:11px;
            cursor:pointer;
        }

        #${ID} .ia{
            background:#4f46e5 !important;
        }

        #${ID} .imagem{
            width:100%;
            max-height:110px;
            object-fit:contain;
            margin-top:7px;
            border-radius:8px;
            display:none;
            background:#000;
        }

        #${ID} .status{
            margin-top:7px;
            color:#cbd5e1;
            font-size:10px;
        }

        #${ID} .saida{
            display:none;
            margin-top:8px;
            padding:9px;
            max-height:220px;
            overflow:auto;
            background:#1f2937;
            border-radius:8px;
            white-space:pre-wrap;
            word-break:break-word;
            font-size:11px;
            line-height:1.45;
        }

        #${ID} .link{
            display:block;
            text-align:center;
            margin-top:8px;
            color:#93c5fd;
            font-size:10px;
            text-decoration:none;
        }

        #${ID} .flutuante{
            width:45px;
            height:45px;
            border:0;
            border-radius:50%;
            background:#4f46e5;
            color:white;
            font-size:20px;
            cursor:pointer;
            box-shadow:0 5px 20px rgba(0,0,0,.4);
        }

        #${ID}.mini{
            width:auto;
            padding:0;
            background:transparent;
            box-shadow:none;
        }

        #${ID}.mini .conteudo{
            display:none;
        }

        #${ID}:not(.mini) .flutuante{
            display:none;
        }

        #${ID}.mini .flutuante{
            display:block;
        }
    `;

    document.head.appendChild(style);

    // =========================================================
    // INTERFACE
    // =========================================================

    const painel = document.createElement("div");
    painel.id = ID;

    painel.innerHTML = `
        <div class="conteudo">

            <div class="cabecalho">
                <div class="titulo">📚 Assistente IA</div>
                <button class="min" id="min">−</button>
            </div>

            <select id="provedor">
                <option value="openai">🤖 OpenAI</option>
                <option value="gemini">✨ Gemini</option>
            </select>

            <input
                id="api"
                type="password"
                placeholder="🔑 Cole sua API Key"
                autocomplete="off"
            >

            <button class="acao" id="capturar">
                📋 Capturar questão
            </button>

            <button class="acao" id="imagemBtn">
                📸 Capturar imagem
            </button>

            <input
                id="arquivo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style="display:none"
            >

            <img id="preview" class="imagem">

            <button class="acao ia" id="analisar">
                🧠 Analisar com IA
            </button>

            <div class="status" id="status">
                Pronto.
            </div>

            <div class="saida" id="saida"></div>

            <a
                class="link"
                id="linkApi"
                target="_blank"
                rel="noopener"
            >
                🔗 Criar API Key
            </a>

        </div>

        <button class="flutuante" id="abrir">
            📚
        </button>
    `;

    document.body.appendChild(painel);

    const provedor = painel.querySelector("#provedor");
    const api = painel.querySelector("#api");
    const capturarBtn = painel.querySelector("#capturar");
    const imagemBtn = painel.querySelector("#imagemBtn");
    const arquivo = painel.querySelector("#arquivo");
    const preview = painel.querySelector("#preview");
    const analisarBtn = painel.querySelector("#analisar");
    const status = painel.querySelector("#status");
    const saida = painel.querySelector("#saida");
    const min = painel.querySelector("#min");
    const abrir = painel.querySelector("#abrir");
    const linkApi = painel.querySelector("#linkApi");

    // =========================================================
    // LINKS DAS APIs
    // =========================================================

    function atualizarLink() {

        if (provedor.value === "openai") {
            linkApi.href =
                "https://platform.openai.com/api-keys";

            linkApi.textContent =
                "🔗 Criar API Key da OpenAI";
        } else {

            linkApi.href =
                "https://aistudio.google.com/apikey";

            linkApi.textContent =
                "🔗 Criar API Key do Gemini";
        }
    }

    provedor.addEventListener(
        "change",
        atualizarLink
    );

    atualizarLink();

    // =========================================================
    // MINIMIZAR
    // =========================================================

    min.onclick = () => {
        painel.classList.add("mini");
    };

    abrir.onclick = () => {
        painel.classList.remove("mini");
    };

    // =========================================================
    // LIMPEZA DE TEXTO
    // =========================================================

    function limpar(texto) {

        return (texto || "")
            .replace(/\u00a0/g, " ")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    // =========================================================
    // CAPTURA DE TEXTO
    // =========================================================

    function capturarQuestao() {

        status.textContent =
            "🔎 Procurando conteúdo da questão...";

        const seletores = [
            '[data-testid*="exercise"]',
            '[data-testid*="question"]',
            '[data-testid*="problem"]',
            'main',
            '[role="main"]'
        ];

        let melhor = null;

        for (const seletor of seletores) {

            const elementos =
                document.querySelectorAll(seletor);

            for (const elemento of elementos) {

                if (
                    elemento.closest(`#${ID}`)
                ) continue;

                const rect =
                    elemento.getBoundingClientRect();

                if (
                    rect.width <= 0 ||
                    rect.height <= 0
                ) continue;

                const clone =
                    elemento.cloneNode(true);

                clone
                    .querySelectorAll(
                        "button,input,textarea,select,nav,header,footer"
                    )
                    .forEach(x => x.remove());

                const texto =
                    limpar(clone.innerText);

                if (
                    texto.length >= 30 &&
                    texto.length <= 5000
                ) {
                    melhor = texto;
                    break;
                }
            }

            if (melhor) break;
        }

        if (!melhor) {

            status.textContent =
                "❌ Não encontrei a questão.";

            return;
        }

        textoCapturado = melhor;

        saida.style.display = "block";
        saida.textContent =
            textoCapturado;

        status.textContent =
            "✅ Questão capturada.";
    }

    capturarBtn.onclick =
        capturarQuestao;

    // =========================================================
    // CAPTURA DE IMAGEM
    // =========================================================

    imagemBtn.onclick = () => {
        arquivo.click();
    };

    arquivo.addEventListener(
        "change",
        () => {

            const file =
                arquivo.files?.[0];

            if (!file)
                return;

            if (
                !file.type.startsWith("image/")
            ) {

                status.textContent =
                    "❌ Arquivo não é uma imagem.";

                return;
            }

            const reader =
                new FileReader();

            reader.onload = () => {

                imagemCapturada =
                    reader.result;

                preview.src =
                    imagemCapturada;

                preview.style.display =
                    "block";

                status.textContent =
                    "📸 Imagem capturada.";
            };

            reader.readAsDataURL(file);
        }
    );

    // =========================================================
    // OPENAI
    // =========================================================

    async function consultarOpenAI(chave) {

        const content = [];

        content.push({
            type: "input_text",
            text: `
Você é um tutor de estudos.

Analise cuidadosamente o material recebido.

Explique:
• o que a questão está pedindo;
• quais dados são importantes;
• qual método deve ser usado;
• o raciocínio passo a passo;
• o resultado final e como verificá-lo.

Não invente dados que não estejam disponíveis.

Questão capturada:

${textoCapturado || "(nenhum texto capturado)"}
`
        });

        if (imagemCapturada) {

            content.push({
                type: "input_image",
                image_url: imagemCapturada,
                detail: "high"
            });
        }

        const resposta =
            await fetch(
                "https://api.openai.com/v1/responses",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${chave}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        model: "gpt-5",

                        input: [
                            {
                                role: "user",
                                content
                            }
                        ]
                    })
                }
            );

        const data =
            await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                data?.error?.message ||
                `HTTP ${resposta.status}`
            );
        }

        return (
            data.output_text ||
            extrairOutputOpenAI(data)
        );
    }

    function extrairOutputOpenAI(data) {

        try {

            return data.output
                .flatMap(x => x.content || [])
                .filter(x => x.type === "output_text")
                .map(x => x.text)
                .join("\n");

        } catch {

            return "";
        }
    }

    // =========================================================
    // GEMINI
    // =========================================================

    async function consultarGemini(chave) {

        const partes = [];

        partes.push({
            text: `
Você é um tutor de estudos extremamente cuidadoso.

Analise a questão abaixo.

Explique:
1. O que está sendo perguntado.
2. Os dados relevantes.
3. O método de resolução.
4. O raciocínio passo a passo.
5. O resultado final.
6. Uma verificação para confirmar o resultado.

Não invente informações.

Questão:

${textoCapturado || "(nenhum texto capturado)"}
`
        });

        if (imagemCapturada) {

            const base64 =
                imagemCapturada.split(",")[1];

            const mime =
                imagemCapturada
                    .match(/data:(.*?);base64/)?.[1]
                    || "image/png";

            partes.push({

                inline_data: {
                    mime_type: mime,
                    data: base64
                }

            });
        }

        const modelo =
            "gemini-2.5-flash";

        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${encodeURIComponent(chave)}`;

        const resposta =
            await fetch(
                url,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        contents: [
                            {
                                parts: partes
                            }
                        ],

                        generationConfig: {
                            temperature: 0.1
                        }
                    })
                }
            );

        const data =
            await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                data?.error?.message ||
                `HTTP ${resposta.status}`
            );
        }

        return (
            data?.candidates?.[0]
                ?.content?.parts
                ?.map(x => x.text || "")
                .join("") ||
            "A IA não retornou texto."
        );
    }

    // =========================================================
    // ANALISAR
    // =========================================================

    analisarBtn.onclick =
        async () => {

            const chave =
                api.value.trim();

            if (!chave) {

                status.textContent =
                    "⚠️ Informe sua API Key.";

                api.focus();

                return;
            }

            if (
                !textoCapturado &&
                !imagemCapturada
            ) {

                status.textContent =
                    "⚠️ Capture uma questão ou imagem primeiro.";

                return;
            }

            analisarBtn.disabled = true;

            saida.style.display =
                "block";

            saida.textContent =
                "🧠 Analisando...";

            status.textContent =
                "⏳ Consultando " +
                (provedor.value === "openai"
                    ? "OpenAI..."
                    : "Gemini...");

            try {

                let resultado;

                if (
                    provedor.value === "openai"
                ) {

                    resultado =
                        await consultarOpenAI(
                            chave
                        );

                } else {

                    resultado =
                        await consultarGemini(
                            chave
                        );
                }

                saida.textContent =
                    resultado;

                status.textContent =
                    "✅ Análise concluída.";

            } catch (erro) {

                console.error(erro);

                saida.textContent =
                    "❌ Erro:\n\n" +
                    erro.message;

                status.textContent =
                    "❌ Falha na consulta.";

            } finally {

                analisarBtn.disabled =
                    false;
            }
        };

    console.log(
        "📚 Assistente de Estudos V5 iniciado."
    );

})();
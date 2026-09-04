(() => {
    "use strict";

    if (window.__ASSISTENTE_ESTUDOS_V4__) {
        alert("Assistente já está carregado.");
        return;
    }

    window.__ASSISTENTE_ESTUDOS_V4__ = true;

    const ID = "assistente-estudos-v4";

    // =========================================================
    // CSS
    // =========================================================

    const style = document.createElement("style");

    style.textContent = `
        #${ID} {
            position: fixed;
            right: 12px;
            bottom: 105px;
            width: 260px;
            max-width: calc(100vw - 24px);
            z-index: 2147483647;
            background: #111827;
            color: #fff;
            border-radius: 16px;
            padding: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,.4);
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        }

        #${ID} * {
            box-sizing: border-box;
        }

        #${ID} .cabecalho {
            display:flex;
            align-items:center;
            justify-content:space-between;
            margin-bottom:9px;
        }

        #${ID} .titulo {
            font-weight:700;
            font-size:15px;
        }

        #${ID} .btn-x {
            background:none;
            border:0;
            color:white;
            font-size:21px;
            cursor:pointer;
            padding:0 3px;
        }

        #${ID} input,
        #${ID} select {
            width:100%;
            background:#1f2937;
            color:white;
            border:1px solid #374151;
            border-radius:9px;
            padding:10px;
            margin-bottom:7px;
            font-size:12px;
            outline:none;
        }

        #${ID} button.acao {
            width:100%;
            border:0;
            border-radius:9px;
            padding:10px;
            margin-top:6px;
            color:white;
            background:#374151;
            font-weight:700;
            font-size:12px;
            cursor:pointer;
        }

        #${ID} button.acao:active {
            transform:scale(.98);
        }

        #${ID} .btn-ia {
            background:#4f46e5 !important;
        }

        #${ID} .status {
            margin-top:8px;
            color:#cbd5e1;
            font-size:11px;
            line-height:1.35;
        }

        #${ID} .saida {
            display:none;
            margin-top:9px;
            background:#1f2937;
            border-radius:9px;
            padding:10px;
            max-height:220px;
            overflow-y:auto;
            white-space:pre-wrap;
            word-break:break-word;
            font-size:12px;
            line-height:1.45;
        }

        #${ID} .flutuante {
            width:48px;
            height:48px;
            border-radius:50%;
            border:0;
            background:#4f46e5;
            color:#fff;
            font-size:21px;
            box-shadow:0 5px 20px rgba(0,0,0,.4);
            cursor:pointer;
        }

        #${ID}.minimizado {
            width:auto;
            padding:0;
            background:transparent;
            box-shadow:none;
        }

        #${ID}.minimizado .conteudo {
            display:none;
        }

        #${ID}:not(.minimizado) .flutuante {
            display:none;
        }

        #${ID}.minimizado .flutuante {
            display:block;
        }

        #${ID} .contador {
            font-size:10px;
            color:#94a3b8;
            margin-top:5px;
        }
    `;

    document.head.appendChild(style);

    // =========================================================
    // HTML
    // =========================================================

    const painel = document.createElement("div");

    painel.id = ID;

    painel.innerHTML = `
        <div class="conteudo">

            <div class="cabecalho">
                <div class="titulo">📚 Assistente de Estudos</div>

                <button class="btn-x" id="minimizar">
                    −
                </button>
            </div>

            <input
                id="apiKey"
                type="password"
                placeholder="🔑 Chave OpenRouter"
                autocomplete="off"
            >

            <select id="modelo">

                <option value="openai/gpt-5">
                    GPT-5
                </option>

                <option value="openai/gpt-5.3-chat">
                    GPT-5.3 Chat
                </option>

                <option value="openai/gpt-chat-latest">
                    GPT Chat Latest
                </option>

            </select>

            <button
                class="acao"
                id="capturar"
            >
                📋 CAPTURAR QUESTÃO
            </button>

            <button
                class="acao btn-ia"
                id="analisar"
            >
                🧠 ANALISAR COM IA
            </button>

            <div
                class="status"
                id="status"
            >
                Nenhuma questão capturada.
            </div>

            <div
                class="saida"
                id="saida"
            ></div>

            <div
                class="contador"
                id="contador"
            ></div>

        </div>

        <button
            class="flutuante"
            id="abrir"
        >
            📚
        </button>
    `;

    document.body.appendChild(painel);

    // =========================================================
    // ELEMENTOS
    // =========================================================

    const apiKeyInput =
        painel.querySelector("#apiKey");

    const modelo =
        painel.querySelector("#modelo");

    const btnCapturar =
        painel.querySelector("#capturar");

    const btnAnalisar =
        painel.querySelector("#analisar");

    const btnMinimizar =
        painel.querySelector("#minimizar");

    const btnAbrir =
        painel.querySelector("#abrir");

    const status =
        painel.querySelector("#status");

    const saida =
        painel.querySelector("#saida");

    const contador =
        painel.querySelector("#contador");

    // =========================================================
    // MEMÓRIA
    // =========================================================

    let questaoAtual = "";

    // =========================================================
    // TEXTOS DE INTERFACE PARA IGNORAR
    // =========================================================

    const IGNORAR = new Set([
        "Pular",
        "Verificar",
        "Relatar um problema",
        "Continuar",
        "Tentar novamente",
        "Próximo",
        "Anterior",
        "Enviar",
        "Cancelar",
        "Ajuda",
        "Mostrar dica"
    ]);

    // =========================================================
    // VISIBILIDADE
    // =========================================================

    function visivel(el) {

        if (!el) return false;

        const r =
            el.getBoundingClientRect();

        const s =
            getComputedStyle(el);

        return (
            r.width > 0 &&
            r.height > 0 &&
            s.display !== "none" &&
            s.visibility !== "hidden" &&
            s.opacity !== "0"
        );
    }

    // =========================================================
    // LIMPEZA
    // =========================================================

    function limpar(texto) {

        return (texto || "")
            .replace(/\u00a0/g, " ")
            .replace(/[ \t]+/g, " ")
            .replace(/\n[ \t]+/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    // =========================================================
    // EXTRAI TEXTO
    // =========================================================

    function extrair(container) {

        if (!container) return "";

        const clone =
            container.cloneNode(true);

        // Nosso próprio painel
        clone
            .querySelectorAll(`#${ID}`)
            .forEach(el => el.remove());

        // Interface
        clone
            .querySelectorAll(`
                button,
                input,
                textarea,
                select,
                header,
                nav,
                footer,
                aside,
                [role="button"]
            `)
            .forEach(el => el.remove());

        let texto =
            limpar(clone.innerText);

        const linhas =
            texto
                .split("\n")
                .map(x => limpar(x))
                .filter(Boolean)
                .filter(x => !IGNORAR.has(x));

        return linhas.join("\n");
    }

    // =========================================================
    // ENCONTRA O CONTAINER
    // =========================================================

    function encontrarContainer() {

        const seletores = [
            '[data-testid*="exercise"]',
            '[data-testid*="question"]',
            '[data-testid*="problem"]',
            'main',
            '[role="main"]',
            '[class*="exercise"]',
            '[class*="question"]',
            '[class*="problem"]'
        ];

        const candidatos = [];

        for (const seletor of seletores) {

            let elementos;

            try {
                elementos =
                    document.querySelectorAll(seletor);
            } catch {
                continue;
            }

            for (const el of elementos) {

                if (!visivel(el)) continue;

                if (el.closest(`#${ID}`))
                    continue;

                const texto =
                    extrair(el);

                if (texto.length < 30)
                    continue;

                if (texto.length > 5000)
                    continue;

                candidatos.push({
                    el,
                    texto
                });
            }
        }

        if (!candidatos.length)
            return null;

        // Prioriza conteúdo de tamanho intermediário,
        // evitando body/main gigantes.
        candidatos.sort(
            (a,b) =>
                Math.abs(a.texto.length - 800) -
                Math.abs(b.texto.length - 800)
        );

        return candidatos[0].el;
    }

    // =========================================================
    // FALLBACK
    // =========================================================

    function fallback() {

        const elementos =
            [...document.querySelectorAll(
                "p,h1,h2,h3,h4,div,span"
            )];

        const candidatos = [];

        for (const el of elementos) {

            if (!visivel(el))
                continue;

            if (el.closest(`#${ID}`))
                continue;

            if (
                el.closest("header") ||
                el.closest("nav") ||
                el.closest("footer") ||
                el.closest("aside") ||
                el.closest("button")
            ) {
                continue;
            }

            const texto =
                extrair(el);

            if (
                texto.length >= 30 &&
                texto.length <= 3000
            ) {
                candidatos.push({
                    el,
                    texto
                });
            }
        }

        candidatos.sort(
            (a,b) =>
                a.texto.length - b.texto.length
        );

        return candidatos.length
            ? candidatos[0].el
            : null;
    }

    // =========================================================
    // CAPTURAR
    // =========================================================

    function capturar() {

        status.textContent =
            "🔎 Procurando questão...";

        saida.style.display = "none";

        let container =
            encontrarContainer();

        if (!container)
            container = fallback();

        if (!container) {

            status.textContent =
                "❌ Não encontrei a questão.";

            return;
        }

        let texto =
            extrair(container);

        if (!texto || texto.length < 20) {

            status.textContent =
                "❌ Conteúdo insuficiente.";

            return;
        }

        // Remove linhas duplicadas
        const linhas =
            texto
                .split("\n")
                .map(x => x.trim())
                .filter(Boolean);

        const unicas = [];

        for (const linha of linhas) {

            if (!unicas.includes(linha))
                unicas.push(linha);
        }

        questaoAtual =
            unicas.join("\n");

        if (questaoAtual.length > 5000) {

            questaoAtual =
                questaoAtual.substring(0, 5000);
        }

        saida.textContent =
            questaoAtual;

        saida.style.display =
            "block";

        contador.textContent =
            `${questaoAtual.length} caracteres`;

        status.textContent =
            "✅ Questão capturada.";
    }

    // =========================================================
    // OPENROUTER
    // =========================================================

    async function analisarComIA() {

        if (!questaoAtual) {

            status.textContent =
                "⚠️ Primeiro capture a questão.";

            return;
        }

        const chave =
            apiKeyInput.value.trim();

        if (!chave) {

            status.textContent =
                "⚠️ Coloque sua chave OpenRouter.";

            apiKeyInput.focus();

            return;
        }

        status.textContent =
            "🧠 Analisando...";

        saida.style.display =
            "block";

        saida.textContent =
            "A IA está analisando a questão...";

        btnAnalisar.disabled = true;

        try {

            const prompt = `
Você é um tutor de matemática.

Analise a questão abaixo com atenção.

Não invente informações que não estejam no enunciado.

Explique:
1. O que a questão está pedindo.
2. Quais dados são importantes.
3. Qual fórmula ou método deve ser utilizado.
4. Faça o raciocínio passo a passo.
5. Faça uma verificação final do raciocínio.

Questão:

${questaoAtual}
`;

            const resposta =
                await fetch(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${chave}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            model:
                                modelo.value,

                            messages: [

                                {
                                    role: "system",

                                    content:
                                        "Você é um tutor didático e preciso."
                                },

                                {
                                    role: "user",

                                    content: prompt
                                }

                            ],

                            temperature: 0.1,

                            max_tokens: 1200

                        })
                    }
                );

            const data =
                await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    data?.error?.message ||
                    `Erro HTTP ${resposta.status}`
                );
            }

            const texto =
                data?.choices?.[0]?.message?.content;

            if (!texto) {

                throw new Error(
                    "A IA não retornou conteúdo."
                );
            }

            saida.textContent =
                texto;

            status.textContent =
                "✅ Análise concluída.";

        } catch (erro) {

            console.error(
                "OpenRouter:",
                erro
            );

            saida.textContent =
                "❌ Erro ao consultar a IA.\n\n" +
                erro.message;

            status.textContent =
                "❌ Falha na análise.";

        } finally {

            btnAnalisar.disabled =
                false;
        }
    }

    // =========================================================
    // MINIMIZAR
    // =========================================================

    btnMinimizar.addEventListener(
        "click",
        () => {

            painel.classList.add(
                "minimizado"
            );
        }
    );

    btnAbrir.addEventListener(
        "click",
        () => {

            painel.classList.remove(
                "minimizado"
            );
        }
    );

    // =========================================================
    // EVENTOS
    // =========================================================

    btnCapturar.addEventListener(
        "click",
        capturar
    );

    btnAnalisar.addEventListener(
        "click",
        analisarComIA
    );

    // =========================================================
    // INÍCIO
    // =========================================================

    console.log(
        "📚 Assistente de Estudos V4 iniciado."
    );

    status.textContent =
        "Pronto. Abra uma questão e toque em CAPTURAR.";

})();
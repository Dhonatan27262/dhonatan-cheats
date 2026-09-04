// ============================================================
// 📚 ASSISTENTE V3 — CAPTURA PRECISA DE QUESTÃO
// ============================================================

(() => {
    "use strict";

    // Evita carregar duas vezes
    if (window.__ASSISTENTE_V3__) {
        console.log("Assistente V3 já está carregado.");
        return;
    }

    window.__ASSISTENTE_V3__ = true;

    // =========================================================
    // CONFIGURAÇÃO
    // =========================================================

    const ID = "assistente-v3";

    // =========================================================
    // ESTILO
    // =========================================================

    const style = document.createElement("style");

    style.textContent = `
        #${ID} {
            position: fixed;
            right: 14px;
            bottom: 105px;
            width: 250px;
            max-width: calc(100vw - 28px);
            z-index: 2147483647;
            background: #111827;
            color: white;
            border-radius: 16px;
            padding: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,.35);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
        }

        #${ID} * {
            box-sizing: border-box;
        }

        #${ID} .titulo {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 9px;
            font-weight: 700;
            font-size: 15px;
        }

        #${ID} .fechar {
            border: 0;
            background: transparent;
            color: #fff;
            font-size: 20px;
            padding: 0 3px;
            cursor: pointer;
        }

        #${ID} button.acao {
            width: 100%;
            border: 0;
            border-radius: 10px;
            padding: 11px 8px;
            margin-top: 7px;
            color: white;
            background: #374151;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
        }

        #${ID} button.acao:active {
            transform: scale(.98);
        }

        #${ID} .status {
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.35;
            color: #d1d5db;
        }

        #${ID} .resultado {
            display: none;
            margin-top: 9px;
            max-height: 220px;
            overflow-y: auto;
            background: #1f2937;
            border-radius: 10px;
            padding: 10px;
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.4;
            font-size: 12px;
        }

        #${ID}.minimizado {
            width: auto;
            padding: 0;
            background: transparent;
            box-shadow: none;
        }

        #${ID}.minimizado .conteudo {
            display: none;
        }

        #${ID} .botao-flutuante {
            width: 48px;
            height: 48px;
            border: 0;
            border-radius: 50%;
            background: #4f46e5;
            color: white;
            font-size: 22px;
            box-shadow: 0 5px 20px rgba(0,0,0,.35);
        }
    `;

    document.head.appendChild(style);

    // =========================================================
    // PAINEL
    // =========================================================

    const painel = document.createElement("div");
    painel.id = ID;

    painel.innerHTML = `
        <div class="conteudo">

            <div class="titulo">
                <span>📚 Assistente V3</span>
                <button class="fechar" id="fechar-assistente">×</button>
            </div>

            <button class="acao" id="capturar-questao">
                📋 CAPTURAR QUESTÃO
            </button>

            <div class="status" id="status-assistente">
                Aguardando captura...
            </div>

            <div class="resultado" id="resultado-assistente"></div>

        </div>

        <button
            class="botao-flutuante"
            id="abrir-assistente"
            style="display:none"
        >
            📚
        </button>
    `;

    document.body.appendChild(painel);

    // =========================================================
    // ELEMENTOS
    // =========================================================

    const btnCapturar =
        painel.querySelector("#capturar-questao");

    const btnFechar =
        painel.querySelector("#fechar-assistente");

    const btnAbrir =
        painel.querySelector("#abrir-assistente");

    const status =
        painel.querySelector("#status-assistente");

    const resultado =
        painel.querySelector("#resultado-assistente");

    // =========================================================
    // ELEMENTOS QUE DEVEM SER IGNORADOS
    // =========================================================

    const textosIgnorados = new Set([
        "Pular",
        "Verificar",
        "Relatar um problema",
        "Próximo",
        "Anterior",
        "Continuar",
        "Tentar novamente",
        "Mostrar dica",
        "Ajuda",
        "Enviar",
        "Cancelar"
    ]);

    // =========================================================
    // VERIFICA SE ELEMENTO ESTÁ VISÍVEL
    // =========================================================

    function visivel(el) {

        if (!el) return false;

        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
        );
    }

    // =========================================================
    // LIMPEZA DO TEXTO
    // =========================================================

    function limparTexto(texto) {

        if (!texto) return "";

        return texto
            .replace(/\u00a0/g, " ")
            .replace(/[ \t]+/g, " ")
            .replace(/\n[ \t]+/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    // =========================================================
    // EXTRAI TEXTO DE UM CONTAINER
    // =========================================================

    function extrairTexto(container) {

        if (!container) return "";

        const clone = container.cloneNode(true);

        // Nunca pegar nosso painel
        clone.querySelectorAll(`#${ID}`).forEach(el => {
            el.remove();
        });

        // Elementos de interface
        clone.querySelectorAll(`
            button,
            input,
            textarea,
            select,
            header,
            nav,
            footer,
            aside,
            [role="button"]
        `).forEach(el => {
            el.remove();
        });

        let texto = clone.innerText || "";

        texto = limparTexto(texto);

        const linhas = texto
            .split("\n")
            .map(l => limparTexto(l))
            .filter(Boolean)
            .filter(linha => !textosIgnorados.has(linha));

        return linhas.join("\n");
    }

    // =========================================================
    // ENCONTRA O CONTEÚDO PRINCIPAL
    // =========================================================

    function encontrarContainer() {

        const seletores = [

            // Estruturas específicas
            '[data-testid*="exercise"]',
            '[data-testid*="question"]',
            '[data-testid*="problem"]',

            // Área principal
            'main',
            '[role="main"]',

            // Possíveis containers do exercício
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

                if (el.closest(`#${ID}`)) continue;

                const texto = extrairTexto(el);

                if (texto.length < 30) continue;

                candidatos.push({
                    elemento: el,
                    texto,
                    tamanho: texto.length
                });
            }
        }

        if (!candidatos.length) {
            return null;
        }

        // Preferimos o menor container que ainda contém
        // conteúdo suficiente.
        candidatos.sort((a, b) => {

            const diferenca =
                Math.abs(a.tamanho - 800) -
                Math.abs(b.tamanho - 800);

            return diferenca;
        });

        return candidatos[0].elemento;
    }

    // =========================================================
    // FALLBACK MAIS RESTRITO
    // =========================================================

    function procurarConteudoVisivel() {

        const elementos = [
            ...document.querySelectorAll(
                "p, h1, h2, h3, h4, div, span"
            )
        ];

        const candidatos = [];

        for (const el of elementos) {

            if (!visivel(el)) continue;

            if (el.closest(`#${ID}`)) continue;

            if (
                el.closest("header") ||
                el.closest("nav") ||
                el.closest("footer") ||
                el.closest("aside") ||
                el.closest("button")
            ) {
                continue;
            }

            const texto = limparTexto(el.innerText);

            if (texto.length < 30) continue;
            if (texto.length > 2500) continue;

            candidatos.push({
                elemento: el,
                texto
            });
        }

        // Quanto menor o elemento, melhor,
        // evitando pegar toda a página.
        candidatos.sort((a, b) =>
            a.texto.length - b.texto.length
        );

        return candidatos.length
            ? candidatos[0].elemento
            : null;
    }

    // =========================================================
    // CAPTURA
    // =========================================================

    function capturarQuestao() {

        status.textContent = "🔎 Procurando questão...";

        resultado.style.display = "none";
        resultado.textContent = "";

        let container =
            encontrarContainer();

        if (!container) {
            container =
                procurarConteudoVisivel();
        }

        if (!container) {

            status.textContent =
                "❌ Não encontrei o conteúdo da questão.";

            return;
        }

        let texto =
            extrairTexto(container);

        if (!texto || texto.length < 20) {

            status.textContent =
                "❌ O conteúdo encontrado é insuficiente.";

            return;
        }

        // =====================================================
        // REMOVE REPETIÇÕES
        // =====================================================

        const linhas = texto
            .split("\n")
            .map(l => l.trim())
            .filter(Boolean);

        const unicas = [];

        for (const linha of linhas) {

            if (
                !unicas.some(
                    x => x === linha
                )
            ) {
                unicas.push(linha);
            }
        }

        texto = unicas.join("\n");

        // =====================================================
        // LIMITA PARA EVITAR CAPTURA DA PÁGINA INTEIRA
        // =====================================================

        if (texto.length > 3500) {

            texto =
                texto.substring(0, 3500) +
                "\n\n[… conteúdo excedente removido]";
        }

        // =====================================================
        // MOSTRA RESULTADO
        // =====================================================

        resultado.textContent = texto;
        resultado.style.display = "block";

        status.textContent =
            `✅ Questão capturada (${texto.length} caracteres).`;
    }

    // =========================================================
    // BOTÕES
    // =========================================================

    btnCapturar.addEventListener(
        "click",
        capturarQuestao
    );

    btnFechar.addEventListener(
        "click",
        () => {

            painel.classList.add("minimizado");

            btnAbrir.style.display = "block";
        }
    );

    btnAbrir.addEventListener(
        "click",
        () => {

            painel.classList.remove("minimizado");

            btnAbrir.style.display = "none";
        }
    );

    // =========================================================
    // INICIALIZAÇÃO
    // =========================================================

    console.log(
        "📚 Assistente V3 iniciado."
    );

})();
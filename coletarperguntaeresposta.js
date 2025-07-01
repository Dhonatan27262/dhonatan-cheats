const coletarPerguntaEAlternativas = () => {
    // Detecção melhorada da pergunta
    const perguntaEl = document.querySelector([
        '.question-text', 
        '.question-container', 
        '[data-qa*="question"]',
        '.question-title',
        '.prompt',
        '[role="heading"][aria-level]',
        'h1, h2, h3, h4'
    ].join(','));
    
    let pergunta = perguntaEl?.innerText?.trim() || '';
    
    // Fallback para perguntas
    if (!pergunta.includes('?')) {
        const textos = Array.from(document.querySelectorAll('p, div, span'))
            .map(el => el.innerText.trim())
            .filter(t => t.includes('?') && t.length < 1000);
        
        pergunta = textos[0] || '';
    }

    // Detecção de alternativas
    const alternativasEl = Array.from(document.querySelectorAll([
        '[role="option"]', 
        '[role="radio"]', 
        '.options div', 
        '.choice', 
        '.answer-text',
        '.question-option',
        '.mcq-option',
        'label:has(input[type="radio"])',
        'label:has(input[type="checkbox"])'
    ].join(',')));
    
    // Filtragem de alternativas
    const alternativas = alternativasEl
        .map(el => {
            return el.innerText
                .replace(/\s+/g, ' ')
                .trim()
                .replace(/^[a-z]\)\s*/i, '')
                .substring(0, 300);
        })
        .filter(txt => 
            txt.length > 2 && 
            !txt.includes('?') && 
            !txt.toLowerCase().includes(pergunta.toLowerCase())
        )
        .filter((txt, i, arr) => arr.indexOf(txt) === i); // Remover duplicatas

    return { pergunta, alternativas };
};

const encontrarRespostaColar = () => {
    const { pergunta, alternativas } = coletarPerguntaEAlternativas();
    
    if (!pergunta || alternativas.length === 0) {
        return alert('❌ Não foi possível identificar a pergunta ou alternativas.');
    }
    
    // Formatar alternativas com letras
    const alternativasFormatadas = alternativas.map((alt, index) => {
        const letra = String.fromCharCode(97 + index);
        return `${letra}) ${alt}`;
    }).join('\n');
    
    const prompt = `Responda de forma direta e clara sem ponto final:\n${pergunta}\n\nAlternativas:\n${alternativasFormatadas}`;
    const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
    window.open(url, "_blank");
};

// Menu flutuante simplificado
const criarMenuContexto = () => {
    const menuId = 'quiz-helper-menu';
    if (document.getElementById(menuId)) return;
    
    const menu = document.createElement('div');
    menu.id = menuId;
    menu.style = `position: fixed; bottom: 20px; right: 20px; z-index: 9999;
                  background: #2d3748; color: white; padding: 12px; border-radius: 8px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif;`;
    
    menu.innerHTML = `
        <h3 style="margin-top:0;border-bottom:1px solid #4a5568;padding-bottom:8px;">Assistente de Quiz</h3>
        <button style="background:#4299e1;color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;"
                onclick="encontrarRespostaColar()">
            Buscar Resposta
        </button>
    `;
    
    document.body.appendChild(menu);
};

// Iniciar automaticamente
criarMenuContexto();

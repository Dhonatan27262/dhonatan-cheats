// ia-module.js
(function() {
    // Verifica se a IA já está aberta
    if (document.getElementById('dhonatan-ia-container')) {
        alert('A IA já está aberta!');
        return;
    }

    // Cria o container principal
    const container = document.createElement('div');
    container.id = 'dhonatan-ia-container';
    Object.assign(container.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '500px',
        height: '70vh',
        maxHeight: '600px',
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        zIndex: '1000000',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    });

    // Cabeçalho da janela
    const cabecalho = document.createElement('div');
    Object.assign(cabecalho.style, {
        padding: '15px',
        background: 'rgba(30,30,30,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    });

    const titulo = document.createElement('div');
    titulo.textContent = '🤖 IA do Dhonatan Modder';
    Object.assign(titulo.style, {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '18px'
    });

    const btnFechar = document.createElement('button');
    btnFechar.textContent = '×';
    Object.assign(btnFechar.style, {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '0 10px'
    });
    btnFechar.onclick = () => container.remove();

    cabecalho.appendChild(titulo);
    cabecalho.appendChild(btnFechar);

    // Área de histórico de mensagens
    const historico = document.createElement('div');
    historico.id = 'dhonatan-ia-historico';
    Object.assign(historico.style, {
        flex: '1',
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    });

    // Mensagem inicial da IA
    const msgInicial = document.createElement('div');
    msgInicial.textContent = 'Olá! Sou a IA do Dhonatan Modder. Como posso te ajudar hoje?';
    Object.assign(msgInicial.style, {
        padding: '12px 15px',
        background: 'rgba(60,60,60,0.7)',
        color: '#fff',
        borderRadius: '18px',
        maxWidth: '80%',
        alignSelf: 'flex-start',
        border: '1px solid rgba(255,255,255,0.1)'
    });
    historico.appendChild(msgInicial);

    // Área de entrada
    const entradaContainer = document.createElement('div');
    Object.assign(entradaContainer.style, {
        padding: '15px',
        background: 'rgba(30,30,30,0.9)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: '10px'
    });

    const entrada = document.createElement('textarea');
    entrada.id = 'dhonatan-ia-input';
    entrada.placeholder = 'Digite sua mensagem...';
    Object.assign(entrada.style, {
        flex: '1',
        padding: '12px 15px',
        background: 'rgba(50,50,50,0.5)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '30px',
        resize: 'none',
        minHeight: '50px',
        outline: 'none',
        fontSize: '16px'
    });

    const btnEnviar = document.createElement('button');
    btnEnviar.textContent = '➤';
    Object.assign(btnEnviar.style, {
        background: 'linear-gradient(135deg, #00b4db, #0083b0)',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        cursor: 'pointer',
        alignSelf: 'flex-end',
        fontSize: '20px'
    });
    btnEnviar.onclick = enviarMensagem;

    // Enviar com Enter (sem quebra de linha)
    entrada.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    });

    entradaContainer.appendChild(entrada);
    entradaContainer.appendChild(btnEnviar);

    // Montar a janela
    container.appendChild(cabecalho);
    container.appendChild(historico);
    container.appendChild(entradaContainer);

    // Adicionar ao body
    document.body.appendChild(container);

    // Foco no campo de entrada
    entrada.focus();

    // Função para enviar mensagem
    async function enviarMensagem() {
        const texto = entrada.value.trim();
        if (!texto) return;

        // Limpar entrada
        entrada.value = '';
        entrada.style.height = 'auto';

        // Adicionar mensagem do usuário ao histórico
        adicionarMensagem('user', texto);

        // Adicionar "digitando..." da IA
        const idResposta = adicionarMensagem('ai', 'Digitando...', true);

        try {
            // Obter resposta da IA
            const resposta = await obterRespostaIA(texto);

            // Substituir "Digitando..." pela resposta real
            atualizarMensagem(idResposta, resposta);
        } catch (erro) {
            atualizarMensagem(idResposta, `Erro: ${erro.message}`);
        }
    }

    // Função para adicionar mensagem no histórico
    function adicionarMensagem(remetente, texto, pendente = false) {
        const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        const msgDiv = document.createElement('div');
        msgDiv.id = id;
        Object.assign(msgDiv.style, {
            maxWidth: '80%',
            padding: '12px 15px',
            borderRadius: '18px',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            alignSelf: remetente === 'user' ? 'flex-end' : 'flex-start',
            background: remetente === 'user' 
                ? 'linear-gradient(135deg, #00b4db, #0083b0)' 
                : 'rgba(60,60,60,0.7)',
            color: '#fff',
            border: remetente === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none'
        });

        msgDiv.textContent = texto;
        historico.appendChild(msgDiv);
        historico.scrollTop = historico.scrollHeight;

        return pendente ? id : null;
    }

    // Atualizar mensagem pendente
    function atualizarMensagem(id, novoTexto) {
        const msgDiv = document.getElementById(id);
        if (msgDiv) {
            msgDiv.textContent = novoTexto;
            historico.scrollTop = historico.scrollHeight;
        }
    }

    // Função para obter resposta da IA usando OpenAI
    async function obterRespostaIA(pergunta) {
        const apiKey = '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';
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "Você é um assistente útil e educado." },
                        { role: "user", content: pergunta }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro na API: ${errorData.error?.message || response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('Erro ao obter resposta da IA:', error);
            return `Desculpe, não consegui responder agora. Erro: ${error.message}`;
        }
    }

    // Permite arrastar a janela
    let dragStartX, dragStartY, initialX, initialY;
    cabecalho.addEventListener('mousedown', iniciarArrasto);

    function iniciarArrasto(e) {
        e.preventDefault();
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initialX = container.offsetLeft;
        initialY = container.offsetTop;
        document.addEventListener('mousemove', arrastarJanela);
        document.addEventListener('mouseup', pararArrasto);
    }

    function arrastarJanela(e) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        container.style.left = (initialX + dx) + 'px';
        container.style.top = (initialY + dy) + 'px';
    }

    function pararArrasto() {
        document.removeEventListener('mousemove', arrastarJanela);
        document.removeEventListener('mouseup', pararArrasto);
    }
})();

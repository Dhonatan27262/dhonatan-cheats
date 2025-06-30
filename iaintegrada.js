// ia-module.js
(function() {
    // Configurações
    const OPENAI_API_KEY = "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"; // Obtenha em: https://platform.openai.com
    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    
    // Verifica se a IA já está aberta
    if (document.getElementById('dhonatan-ia-container')) {
        document.getElementById('dhonatan-ia-container').style.display = 'flex';
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
    titulo.textContent = '🤖 IA Premium - ChatGPT';
    Object.assign(titulo.style, {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '18px'
    });

    const btnMinimizar = document.createElement('button');
    btnMinimizar.textContent = '_';
    Object.assign(btnMinimizar.style, {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '0 10px',
        marginRight: '10px'
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

    cabecalho.appendChild(titulo);
    
    const botoesCabecalho = document.createElement('div');
    botoesCabecalho.appendChild(btnMinimizar);
    botoesCabecalho.appendChild(btnFechar);
    cabecalho.appendChild(botoesCabecalho);

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
    msgInicial.innerHTML = '<strong>IA do Dhonatan Modder</strong><br>Olá! Sou uma IA com tecnologia ChatGPT. Posso responder qualquer pergunta em tempo real!';
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

    // Botão minimizar
    btnMinimizar.onclick = () => {
        container.style.display = 'none';
        criarBotaoFlutuante();
    };

    // Botão fechar
    btnFechar.onclick = () => {
        container.style.display = 'none';
        criarBotaoFlutuante();
    };

    // Função para criar botão flutuante para reabrir IA
    function criarBotaoFlutuante() {
        // Remove botão existente se houver
        const botaoExistente = document.getElementById('dhonatan-ia-flutuante');
        if (botaoExistente) botaoExistente.remove();
        
        const botao = document.createElement('div');
        botao.id = 'dhonatan-ia-flutuante';
        botao.innerHTML = '🤖';
        Object.assign(botao.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #00b4db, #0083b0)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: '999999',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            color: '#fff',
            animation: 'pulse 2s infinite'
        });
        
        // Adiciona animação de pulsar
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        botao.onclick = () => {
            container.style.display = 'flex';
            botao.remove();
            style.remove();
        };
        
        document.body.appendChild(botao);
    }

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
            const resposta = await obterRespostaOpenAI(texto);
            
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
            border: remetente === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none',
            animation: remetente === 'user' ? 'slideInRight 0.3s ease' : 'slideInLeft 0.3s ease'
        });

        // Adiciona animações
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(30px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideInLeft {
                from { transform: translateX(-30px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Formata mensagens da IA com título em negrito
        if (remetente === 'ai') {
            msgDiv.innerHTML = `<strong style="color:#00b4db">IA Premium</strong><br>${texto}`;
        } else {
            msgDiv.textContent = texto;
        }
        
        historico.appendChild(msgDiv);
        historico.scrollTop = historico.scrollHeight;

        return pendente ? id : null;
    }

    // Atualizar mensagem pendente
    function atualizarMensagem(id, novoTexto) {
        const msgDiv = document.getElementById(id);
        if (msgDiv) {
            msgDiv.innerHTML = `<strong style="color:#00b4db">IA Premium</strong><br>${novoTexto}`;
            historico.scrollTop = historico.scrollHeight;
        }
    }

    // Função para obter resposta da OpenAI
    async function obterRespostaOpenAI(pergunta) {
        try {
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "Você é um assistente útil que responde perguntas de forma clara e concisa."
                        },
                        {
                            role: "user",
                            content: pergunta
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Erro na API: ${response.status}`);
            }

            const data = await response.json();
            
            // Verifica se a resposta tem a estrutura esperada
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content.trim();
            } else {
                throw new Error('Resposta da API em formato inesperado');
            }
        } catch (erro) {
            console.error('Erro completo:', erro);
            
            // Fallback para respostas locais se a API falhar
            return obterRespostaLocal(pergunta);
        }
    }

    // Fallback para respostas locais
    function obterRespostaLocal(pergunta) {
        const perguntaLower = pergunta.toLowerCase();
        
        // Banco de respostas para perguntas comuns
        const respostas = {
            "olá": "Olá! Como posso te ajudar?",
            "bom dia": "Bom dia! Em que posso ser útil?",
            "boa tarde": "Boa tarde! Como posso ajudar?",
            "boa noite": "Boa noite! Precisa de alguma assistência?",
            "quem é você": "Sou a IA do Dhonatan Modder, criada para ajudar você com qualquer dúvida!",
            "o que você faz": "Posso responder perguntas, explicar conceitos, ajudar com estudos e muito mais!",
            "github é gratuito": "Sim, o GitHub oferece planos gratuitos com repositórios públicos ilimitados.",
            "como criar uma conta github": "1. Acesse github.com\n2. Clique em 'Sign up'\n3. Preencha seus dados\n4. Verifique seu email\n5. Comece a usar!",
            "o que é html": "HTML é a linguagem de marcação padrão para criar páginas web.",
            "o que é css": "CSS é uma linguagem de estilo usada para estilizar elementos HTML.",
            "o que é javascript": "JavaScript é uma linguagem de programação para adicionar interatividade a páginas web.",
            "quanto é 2 mais 2": "2 + 2 = 4",
            "quanto é 5 vezes 3": "5 × 3 = 15",
            "raiz quadrada de 16": "√16 = 4",
            "padrão": `Sua pergunta: "${pergunta}"\n\nEstou sem conexão com a API. Recursos úteis:\n- Documentação oficial\n- Tutoriais online\n- Comunidades de suporte`
        };

        // Busca por correspondência exata
        if (respostas[perguntaLower]) {
            return respostas[perguntaLower];
        }
        
        // Busca por palavras-chave
        const palavrasChave = {
            "github": "GitHub é uma plataforma para hospedagem de código e colaboração.",
            "html": "HTML define a estrutura das páginas web.",
            "css": "CSS controla a aparência visual dos elementos HTML.",
            "javascript": "JavaScript permite criar comportamentos dinâmicos em páginas web.",
            "programação": "Programação envolve escrever instruções para computadores executarem tarefas.",
            "python": "Python é uma linguagem de programação popular para diversos usos.",
            "site": "Para criar um site são necessários HTML, CSS e JavaScript.",
            "aplicativo": "Aplicativos podem ser desenvolvidos para diversas plataformas.",
            "soma": "Para somar números, basta adicioná-los. Exemplo: 2 + 2 = 4",
            "multiplicação": "Multiplicação é uma operação matemática de adição repetida."
        };

        // Verifica por palavras-chave
        for (const [palavra, resposta] of Object.entries(palavrasChave)) {
            if (perguntaLower.includes(palavra)) {
                return resposta;
            }
        }
        
        return respostas["padrão"];
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

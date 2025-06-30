// ia-module.js
(function() {
    // Configurações com SUA CHAVE
    const GEMINI_API_KEY = "AIzaSyCtfm4FlHD8LXWwI3Cvtfjiik2f9Sc5WIs";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
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
    titulo.textContent = '🤖 IA Premium - Gemini Pro';
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
    msgInicial.innerHTML = '<strong>IA do Dhonatan Modder</strong><br>Olá! Sou uma IA premium com tecnologia Google Gemini Pro. Posso responder qualquer pergunta com precisão!';
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
            const resposta = await obterRespostaGemini(texto);
            
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
            const titulo = document.createElement('strong');
            titulo.textContent = 'IA Premium\n';
            titulo.style.color = '#00b4db';
            
            const conteudo = document.createElement('span');
            conteudo.textContent = texto;
            
            msgDiv.innerHTML = '';
            msgDiv.appendChild(titulo);
            msgDiv.appendChild(conteudo);
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
            // Mantém o título e atualiza apenas o conteúdo
            const titulo = msgDiv.querySelector('strong');
            const conteudo = msgDiv.querySelector('span');
            
            if (titulo && conteudo) {
                conteudo.textContent = novoTexto;
            } else {
                msgDiv.innerHTML = `<strong style="color:#00b4db">IA Premium</strong><br>${novoTexto}`;
            }
            
            historico.scrollTop = historico.scrollHeight;
        }
    }

    // Função para obter resposta do Google Gemini (CORRIGIDA)
    async function obterRespostaGemini(pergunta) {
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: pergunta
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1500,
                        topP: 0.9,
                        topK: 40
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Erro detalhado da API:', error);
                throw new Error(error.error?.message || 'Erro na API Gemini');
            }

            const data = await response.json();
            
            // Verifica se a resposta tem a estrutura esperada
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Resposta da API em formato inesperado');
            }
        } catch (erro) {
            console.error('Erro completo:', erro);
            throw new Error(`Falha ao obter resposta: ${erro.message}`);
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
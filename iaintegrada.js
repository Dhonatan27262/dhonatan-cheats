// ia-module.js
(function() {
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
    titulo.textContent = '🤖 IA do Dhonatan Modder';
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
    msgInicial.innerHTML = '<strong>IA do Dhonatan Modder</strong><br>Olá! Sou sua assistente pessoal. Como posso te ajudar hoje?';
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
            color: '#fff'
        });
        
        botao.onclick = () => {
            container.style.display = 'flex';
            botao.remove();
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
            const resposta = await obterRespostaIA(texto);
            
            // Substituir "Digitando..." pela resposta real
            atualizarMensagem(idResposta, resposta);
        } catch (erro) {
            atualizarMensagem(idResposta, `Desculpe, ocorreu um erro: ${erro.message}`);
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

        // Formata mensagens da IA com título em negrito
        if (remetente === 'ai') {
            const titulo = document.createElement('strong');
            titulo.textContent = 'IA do Dhonatan Modder\n';
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
                msgDiv.innerHTML = `<strong style="color:#00b4db">IA do Dhonatan Modder</strong><br>${novoTexto}`;
            }
            
            historico.scrollTop = historico.scrollHeight;
        }
    }

    // Função para obter resposta da IA
    async function obterRespostaIA(pergunta) {
        // Simula tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        // Sistema de respostas inteligentes
        const resposta = gerarRespostaInteligente(pergunta);
        return resposta;
    }

    // Gerador de respostas inteligentes
    function gerarRespostaInteligente(pergunta) {
        pergunta = pergunta.toLowerCase();
        
        // Dicionário de respostas
        const respostas = {
            cumprimentos: ["Olá! Como posso te ajudar?", "Oi! Em que posso ser útil?", "Olá! O que você gostaria de saber?"],
            como_voce_esta: ["Estou ótima, obrigada! E você?", "Funcionando perfeitamente! E com você?", "Tudo bem por aqui! Como você está?"],
            quem_e_voce: ["Sou a IA do Dhonatan Modder, criada para ajudar você!", "Sua assistente pessoal, pronta para ajudar com o que precisar!", "IA especializada em ajudar com dúvidas e tarefas do dia a dia!"],
            o_que_voce_faz: [
                "Posso ajudar com:\n- Respostas a perguntas\n- Explicações de conceitos\n- Sugestões de estudo\n- Resolução de problemas",
                "Minhas habilidades incluem:\n• Responder perguntas\n• Explicar tópicos complexos\n• Sugerir recursos de aprendizado\n• Ajudar com tarefas"
            ],
            matematica: {
                padrao: "Para matemática, posso ajudar com:\n- Cálculos básicos\n- Explicações de conceitos\n- Resolução de problemas passo a passo",
                exemplos: [
                    "Para resolver equações, lembre-se de isolar a variável em um lado da equação.",
                    "Em geometria, a área de um triângulo é (base × altura) / 2.",
                    "Para porcentagem: valor × porcentagem / 100"
                ]
            },
            programacao: {
                padrao: "Posso ajudar com:\n- Explicações de conceitos de programação\n- Solução de erros comuns\n- Exemplos de código",
                linguagens: [
                    "JavaScript: função arrow => (param) => { código }",
                    "Python: loops for item in lista:",
                    "HTML: <tag atributo='valor'>conteúdo</tag>"
                ]
            },
            estudo: [
                "Uma boa técnica de estudo é o Pomodoro: 25 minutos de foco, 5 minutos de descanso.",
                "Para memorização, experimente a técnica de repetição espaçada.",
                "Faça resumos com suas próprias palavras para fixar melhor o conteúdo."
            ],
            despedida: ["Até logo! Estarei aqui se precisar.", "Foi um prazer ajudar! Volte quando quiser.", "Tchau! Não hesite em me chamar novamente."]
        };

        // Identifica o tipo de pergunta
        if (pergunta.includes('oi') || pergunta.includes('olá') || pergunta.includes('bom dia') || pergunta.includes('boa tarde') || pergunta.includes('boa noite')) {
            return randomChoice(respostas.cumprimentos);
        }
        
        if (pergunta.includes('tudo bem') || pergunta.includes('como vai') || pergunta.includes('como está')) {
            return randomChoice(respostas.como_voce_esta);
        }
        
        if (pergunta.includes('quem é você') || pergunta.includes('o que é você')) {
            return randomChoice(respostas.quem_e_voce);
        }
        
        if (pergunta.includes('o que você faz') || pergunta.includes('para que serve')) {
            return randomChoice(respostas.o_que_voce_faz);
        }
        
        if (pergunta.includes('matemática') || pergunta.includes('calcular') || pergunta.includes('equação')) {
            return `${respostas.matematica.padrao}\n\nExemplo: ${randomChoice(respostas.matematica.exemplos)}`;
        }
        
        if (pergunta.includes('programação') || pergunta.includes('código') || pergunta.includes('javascript') || pergunta.includes('python') || pergunta.includes('html')) {
            return `${respostas.programacao.padrao}\n\nExemplo: ${randomChoice(respostas.programacao.linguagens)}`;
        }
        
        if (pergunta.includes('estudar') || pergunta.includes('aprender') || pergunta.includes('técnica')) {
            return randomChoice(respostas.estudo);
        }
        
        if (pergunta.includes('tchau') || pergunta.includes('até logo') || pergunta.includes('adeus')) {
            return randomChoice(respostas.despedida);
        }
        
        // Resposta padrão para perguntas não reconhecidas
        return gerarRespostaGenerica(pergunta);
    }

    // Gera respostas genéricas inteligentes
    function gerarRespostaGenerica(pergunta) {
        const tiposResposta = [
            `Entendi sua pergunta sobre "${pergunta}". Posso te ajudar explicando conceitos relacionados ou dando exemplos práticos.`,
            `Interessante sua dúvida sobre "${pergunta}"! Vamos explorar isso juntos? O que você gostaria de saber especificamente?`,
            `Sobre "${pergunta}", posso oferecer diferentes abordagens:\n1. Explicação simplificada\n2. Exemplos práticos\n3. Passo a passo de solução\nQual você prefere?`,
            `Para responder "${pergunta}", é importante considerar vários aspectos. Vou estruturar uma resposta completa para você.`,
            `"${pergunta}" é um ótimo tópico! Vou organizar as informações de forma clara e objetiva para você.`
        ];
        
        return randomChoice(tiposResposta);
    }

    // Seleciona um item aleatório de um array
    function randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
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
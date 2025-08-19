(function () {
    let fundo, janela, nome, relogio;
    let senhaLiberada = false;
    let abaAtiva = 'textos';
    let posX = localStorage.getItem("dhonatanX") || "20px";
    let posY = localStorage.getItem("dhonatanY") || "20px";
    let corBotao = localStorage.getItem("corBotaoDhonatan") || "#0f0f0f";

    // Estilo moderno para todos os botões
    const aplicarEstiloBotao = (elemento, gradiente = false) => {
        Object.assign(elemento.style, {
            padding: '10px 15px',
            background: gradiente ? 'linear-gradient(135deg, #8A2BE2, #4B0082)' : '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            outline: 'none',
            userSelect: 'none',
            margin: '8px 0'
        });
    };

    // Estilo para elementos de texto
    const aplicarEstiloTexto = (elemento, tamanho = '18px') => {
        Object.assign(elemento.style, {
            color: '#fff',
            fontSize: tamanho,
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '10px 0',
            userSelect: 'none'
        });
    };

    // Estilo para container
    const aplicarEstiloContainer = (elemento) => {
        Object.assign(elemento.style, {
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '350px',
            width: '90%',
            textAlign: 'center'
        });
    };

    const mostrarInfoDono = () => {
        // Fecha o menu atual antes de abrir o novo elemento
        if (fundo) fundo.remove();
        
        const container = document.createElement('div');
        aplicarEstiloContainer(container);
        // Garante que o elemento apareça acima de tudo
        container.style.zIndex = '1000001';
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        
        const titulo = document.createElement('div');
        titulo.textContent = '👑';
        aplicarEstiloTexto(titulo, '20px');
        
        const insta = document.createElement('div');
        insta.textContent = 'VERSÃO 1.0';
        aplicarEstiloTexto(insta);
        
        const info = document.createElement('div');
        info.textContent = '💻 Mod exclusivo e protegido, feito para poupar seu tempo';
        aplicarEstiloTexto(info);
        
        const btnFechar = document.createElement('button');
        btnFechar.textContent = 'Fechar';
        aplicarEstiloBotao(btnFechar, true);
        btnFechar.onclick = () => {
            container.remove();
            criarMenu();
        };
        
        container.append(titulo, insta, info, btnFechar);
        document.body.appendChild(container);
    };

    const trocarCorBotao = () => {
        // Fecha o menu atual antes de abrir o novo elemento
        if (fundo) fundo.remove();
        
        let novaCorTemp = corBotao;

        const container = document.createElement('div');
        aplicarEstiloContainer(container);
        // Garante que o elemento apareça acima de tudo
        container.style.zIndex = '1000001';
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        
        const titulo = document.createElement('div');
        titulo.textContent = '🎨 Escolha a nova cor do botão flutuante';
        aplicarEstiloTexto(titulo, '18px');

        const seletor = document.createElement("input");
        seletor.type = "color";
        seletor.value = corBotao;
        Object.assign(seletor.style, {
            width: "100px",
            height: "100px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            margin: '15px 0'
        });

        // Atualizar a cor temporária quando o seletor muda
        seletor.addEventListener("input", (e) => {
            novaCorTemp = e.target.value;
        });

        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, {
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '15px'
        });

        const btnAplicar = document.createElement('button');
        btnAplicar.textContent = '✅ Aplicar';
        aplicarEstiloBotao(btnAplicar, true);
        btnAplicar.onclick = () => {
            if (!novaCorTemp || novaCorTemp === corBotao) return;
            corBotao = novaCorTemp;
            localStorage.setItem("corBotaoDhonatan", corBotao);
            document.querySelectorAll("#dhonatanBotao").forEach(btn => {
                btn.style.background = corBotao;
            });
            container.remove();
            
            // Adicionar feedback visual
            const aviso = document.createElement('div');
            aviso.textContent = '✅ Cor alterada com sucesso!';
            aplicarEstiloTexto(aviso, '16px');
            Object.assign(aviso.style, {
                position: 'fixed',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 20px',
                borderRadius: '10px',
                zIndex: '1000001',
                border: '1px solid #0f0',
                background: 'rgba(0,0,0,0.9)'
            });
            document.body.appendChild(aviso);
            setTimeout(() => {
                aviso.remove();
                criarMenu();
            }, 2000);
        };

        const btnCancelar = document.createElement('button');
        btnCancelar.textContent = '❌ Cancelar';
        aplicarEstiloBotao(btnCancelar);
        btnCancelar.onclick = () => {
            container.remove();
            criarMenu();
        };
        
        btnContainer.append(btnAplicar, btnCancelar);
        container.append(titulo, seletor, btnContainer);
        document.body.appendChild(container);
    };

        const coletarPerguntaEAlternativas = () => {
        const perguntaEl = document.querySelector('.question-text, .question-container, [data-qa*="question"]');
        const pergunta = perguntaEl ? perguntaEl.innerText.trim() :
            (document.body.innerText.split('\n').find(t => t.includes('?') && t.length < 200) || '').trim();
        const alternativasEl = Array.from(document.querySelectorAll('[role="option"], .options div, .choice, .answer-text, label, span, p'));
        const alternativasFiltradas = alternativasEl.map(el => el.innerText.trim()).filter(txt =>
            txt.length > 20 && txt.length < 400 && !txt.includes('?') && !txt.toLowerCase().includes(pergunta.toLowerCase())
        );
        const letras = ['a', 'b', 'c', 'd', 'e', 'f'];
        const alternativas = alternativasFiltradas.map((txt, i) => `${letras[i]}) ${txt}`).join('\n');
        return { pergunta, alternativas };
    };

    // Função modificada para carregar o script do GitHub
    const encontrarRespostaColar = () => {
        const avisoCarregando = document.createElement('div');
        avisoCarregando.textContent = '⏳ Carregando script...';
        aplicarEstiloTexto(avisoCarregando, '16px');
        Object.assign(avisoCarregando.style, {
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            borderRadius: '10px',
            zIndex: '1000001',
            border: '1px solid #ff0',
            background: 'rgba(0,0,0,0.9)'
        });
        document.body.appendChild(avisoCarregando);

        const scriptURL = "https://raw.githubusercontent.com/Dhonatan27262/dhonatan-cheats/refs/heads/main/coletarperguntaeresposta.js?" + Date.now();

        fetch(scriptURL)
            .then(response => {
                if (!response.ok) throw new Error('Falha ao carregar o script');
                return response.text();
            })
            .then(scriptContent => {
                avisoCarregando.remove();
                
                const script = document.createElement('script');
                script.textContent = scriptContent;
                document.head.appendChild(script);

                const avisoSucesso = document.createElement('div');
                avisoSucesso.textContent = '✅ Script carregado com sucesso!';
                aplicarEstiloTexto(avisoSucesso, '16px');
                Object.assign(avisoSucesso.style, {
                    position: 'fixed',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    zIndex: '1000001',
                    border: '1px solid #0f0',
                    background: 'rgba(0,0,0,0.9)'
                });
                document.body.appendChild(avisoSucesso);
                setTimeout(() => avisoSucesso.remove(), 3000);
            })
            .catch(error => {
                console.error('Erro ao carregar script:', error);
                avisoCarregando.textContent = '❌ Erro ao carregar o script. Verifique o console.';
                avisoCarregando.style.border = '1px solid #f00';
                setTimeout(() => avisoCarregando.remove(), 3000);
            });
    };

    const encontrarRespostaDigitar = () => {
        const pergunta = prompt("Digite a pergunta:");
        if (!pergunta) return;
        const promptFinal = `Responda de forma direta e clara sem ponto final: ${pergunta}`;
        window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(promptFinal)}`, "_blank");
    };

    const marcarResposta = (resposta) => {
        resposta = resposta.trim().replace(/\.+$/, '').toLowerCase();
        const alternativas = document.querySelectorAll('[role="option"], .options div, .choice, .answer-text, label, span, p');
        let marcada = false;
        alternativas.forEach(el => {
            const txt = el.innerText.trim().toLowerCase();
            if (txt.includes(resposta)) {
                el.style.backgroundColor = '#00ff00';
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                marcada = true;
            }
        });
        alert(marcada ? '✅ Resposta marcada!' : '❌ Nenhuma correspondente encontrada.');
    };

    const iniciarMod = () => {
  alert("✍️ Toque no campo onde deseja digitar o texto.");
  const handler = (e) => {
    e.preventDefault();
    document.removeEventListener('click', handler, true);
    const el = e.target;
    if (!(el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      alert("❌ Esse não é um campo válido.");
      criarBotaoFlutuante();
      return;
    }
    const texto = prompt("📋 Cole ou digite o texto:");
    if (!texto) return criarBotaoFlutuante();

    el.focus();
    let i = 0;
    const progresso = document.createElement('div');
    Object.assign(progresso.style, {
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.8)', color: '#fff',
      padding: '10px 20px', borderRadius: '8px',
      zIndex: 9999999, fontSize: '20px'
    });
    document.body.append(progresso);

    const intervalo = setInterval(() => {
      if (i < texto.length) {
        const c = texto[i++];
        document.execCommand('insertText', false, c);  // insere texto como se fosse teclado
        progresso.textContent = `${Math.round(i / texto.length * 100)}%`;
      } else {
        clearInterval(intervalo);
        progresso.remove();
        el.blur();  // fechar
        setTimeout(() => {
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          const msg = document.createElement('div');
          msg.textContent = "✅ Texto digitado com sucesso!";
          Object.assign(msg.style, {
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#000', color: '#0f0',
            padding: '15px', borderRadius: '10px',
            fontSize: '18px', zIndex: 9999999,
            fontWeight: 'bold', textAlign: 'center'
          });
          document.body.append(msg);
          setTimeout(() => { msg.remove(); criarBotaoFlutuante(); }, 3000);
        }, 100);
      }
    }, 40);
  };
  document.addEventListener('click', handler, true);
};

const criarTextoComTema = () => {
    const tema = prompt("Qual tema deseja?");
    if (!tema) return;
    const palavras = prompt("Número mínimo de palavras?");
    if (!palavras) return;
    const promptFinal = `Crie um texto com o tema "${tema}" com no mínimo ${palavras} palavras. Seja claro e criativo.`;
    const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(promptFinal)}`;
    window.open(url, "_blank");
};

const abrirReescritor = () => {
    window.open(`https://www.reescrevertexto.net`, "_blank");
};

criarAbas = () => {
    const botoes = {
        scripts: [
            {
                nome: 'Ingles Parana',
                func: () => window.open('https://speakify.cupiditys.lol', '_blank')
            },
            {
                nome: 'Khan Academy',
                func: () => {
                    const scriptURL = "https://raw.githubusercontent.com/Dhonatan27262/dhonatan-cheats/main/script.js?" + Date.now();
                    fetch(scriptURL)
                        .then(response => response.text())
                        .then(scriptContent => {
                            const script = document.createElement('script');
                            script.textContent = scriptContent;
                            document.head.appendChild(script);

                            const aviso = document.createElement('div');
                            aviso.textContent = '✅ Script Khan Academy carregado!';
                            aplicarEstiloTexto(aviso, '16px');
                            Object.assign(aviso.style, {
                                position: 'fixed',
                                top: '20%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                zIndex: '999999',
                                border: '1px solid #0f0',
                                background: 'rgba(0,0,0,0.9)'
                            });
                            document.body.appendChild(aviso);
                            setTimeout(() => aviso.remove(), 3000);
                        })
                        .catch(error => {
                            console.error('Erro ao carregar script:', error);
                            alert('❌ Erro ao carregar script. Verifique o console.');
                        });
                }
            },
            {
                nome: '❌',
                func: () => {
                    const scriptURL = "https://raw.githubusercontent.com/Dhonatan27262/dhonatan-cheats/refs/heads/main/quizziz.js" + Date.now();
                    fetch(scriptURL)
                        .then(response => response.text())
                        .then(scriptContent => {
                            const script = document.createElement('script');
                            script.textContent = scriptContent;
                            document.head.appendChild(script);

                            const aviso = document.createElement('div');
                            aviso.textContent = '❌nada ativo pois nao exite script neste repositório!';
                            aplicarEstiloTexto(aviso, '16px');
                            Object.assign(aviso.style, {
                                position: 'fixed',
                                top: '20%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                zIndex: '999999',
                                border: '1px solid #0f0',
                                background: 'rgba(0,0,0,0.9)'
                            });
                            document.body.appendChild(aviso);
                            setTimeout(() => aviso.remove(), 3000);
                        })
                        .catch(error => {
                            console.error('Erro ao carregar script:', error);
                            alert('❌ Erro ao carregar script. Verifique o console.');
                        });
                }
            },
            {
                nome: '❌',
                func: () => {
                    const scriptURL = "https://raw.githubusercontent.com/Dhonatan27262/dhonatan-cheats/main/kahoot.js?" + Date.now();
                    fetch(scriptURL)
                        .then(response => response.text())
                        .then(scriptContent => {
                            const script = document.createElement('script');
                            script.textContent = scriptContent;
                            document.head.appendChild(script);

                            const aviso = document.createElement('div');
                            aviso.textContent = 'Nada Carregado!';
                            aplicarEstiloTexto(aviso, '16px');
                            Object.assign(aviso.style, {
                                position: 'fixed',
                                top: '20%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                zIndex: '999999',
                                border: '1px solid #ff1e00',
                                background: 'rgba(0,0,0,0.9)'
                            });
                            document.body.appendChild(aviso);
                            setTimeout(() => aviso.remove(), 3000);
                        })
                        .catch(error => {
                            console.error('Erro ao carregar Kahoot script:', error);
                            alert('❌ Erro ao carregar o Kahoot script. Verifique o console.');
                        });
                }
            }
        ],
        textos: [
            { nome: '😶‍🌫️ Digitador Auto', func: () => { fundo.remove(); iniciarMod(); } },
            {
    nome: 'V2 DIGITAR',
    func: () => {
        fundo.remove();
        const avisoCarregando = document.createElement('div');
        avisoCarregando.textContent = '⏳ Carregando...';
        aplicarEstiloTexto(avisoCarregando, '16px');
        Object.assign(avisoCarregando.style, {
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            borderRadius: '10px',
            zIndex: '1000001',
            border: '1px solid #ff0',
            background: 'rgba(0,0,0,0.9)'
        });
        document.body.appendChild(avisoCarregando);

        const scriptURL = "https://raw.githubusercontent.com/Dhonatan27262/dhonatan-cheats/main/autodigitador.js?" + Date.now();
        
        fetch(scriptURL)
            .then(response => response.text())
            .then(scriptContent => {
                const script = document.createElement('script');
                script.textContent = scriptContent;
                document.head.appendChild(script);

                avisoCarregando.textContent = '✅ Carregado!';
                avisoCarregando.style.border = '1px solid #0f0';
                
                setTimeout(() => {
                    avisoCarregando.remove();
                    criarBotaoFlutuante(); // Recria o botão após carregar
                }, 2000);
            })
            .catch(error => {
                console.error('Erro ao carregar script:', error);
                avisoCarregando.textContent = '❌ Erro ao carregar';
                avisoCarregando.style.border = '1px solid #f00';
                setTimeout(() => {
                    avisoCarregando.remove();
                    criarBotaoFlutuante(); // Recria o botão mesmo em caso de erro
                }, 2000);
            });
    }
},
            { nome: '📄 Criar Texto com Tema', func: criarTextoComTema },
            { nome: '🔁 Reescrever Texto', func: abrirReescritor }
        ],
        respostas: [
            { nome: '📡 Encontrar Resposta', func: encontrarRespostaColar },
            { nome: '✍️ Encontrar Resposta (Digitar)', func: encontrarRespostaDigitar },
            { nome: '🎯 Marcar Resposta (Colar)', func: () => navigator.clipboard.readText().then(r => marcarResposta(r)) },
            { nome: '✍️ Marcar Resposta (Digitar)', func: () => {
                const r = prompt("Digite a resposta:");
                if (r) marcarResposta(r);
            }}
        ],
        outros: [
            { 
  nome: 'Extensão libera bloqueio Wifi', 
  func: () => window.open('https://chromewebstore.google.com/detail/x-vpn-free-vpn-chrome-ext/flaeifplnkmoagonpbjmedjcadegiigl', '_blank') 
},
{ nome: '🎮 Jogo da Velha',
  func: () => {
                    const scriptURL = "https://raw.githubusercontent.com/Dhonatan27262/dhonatan-cheats/main/jogodavelha.js?" + Date.now();
                    fetch(scriptURL)
                        .then(response => response.text())
                        .then(scriptContent => {
                            const script = document.createElement('script');
                            script.textContent = scriptContent;
                            document.head.appendChild(script);

                            const aviso = document.createElement('div');
                            aviso.textContent = 'Carregado!';
                            aplicarEstiloTexto(aviso, '16px');
                            Object.assign(aviso.style, {
                                position: 'fixed',
                                top: '20%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                zIndex: '999999',
                                border: '1px solid #ff1e00',
                                background: 'rgba(0,0,0,0.9)'
                            });
                            document.body.appendChild(aviso);
                            setTimeout(() => aviso.remove(), 3000);
                        })
                        .catch(error => {
                            console.error('Erro ao carregar Kahoot script:', error);
                            alert('❌ Erro ao carregar o Kahoot script. Verifique o console.');
                        });
    }
},
        ],
        config: [
            { nome: 'ℹ️ Sobre o Mod', func: mostrarInfoDono },
            { nome: '🎨 Cor do Botão Flutuante', func: trocarCorBotao },
            { nome: '🔃 Resetar', func: () => { fundo.remove(); criarInterface(); } }
        ]
    };

    const botoesAbas = document.createElement('div');
    Object.assign(botoesAbas.style, {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '5px',
        marginBottom: '15px'
    });

    ['scripts', 'textos', 'respostas', 'outros', 'config'].forEach(id => {
        const botaoAba = document.createElement('button');
        botaoAba.textContent = id.toUpperCase();
        aplicarEstiloBotao(botaoAba, abaAtiva === id);
        botaoAba.onclick = () => {
            abaAtiva = id;
            fundo.remove();
            criarMenu();
        };
        botoesAbas.appendChild(botaoAba);
    });

    janela.appendChild(botoesAbas);

    // Linha de separação entre abas e funções
    const separador = document.createElement('hr');
    Object.assign(separador.style, {
        width: '100%',
        border: '1px solid rgba(255,255,255,0.1)',
        margin: '10px 0'
    });
    janela.appendChild(separador);

    const containerBotoes = document.createElement('div');
    Object.assign(containerBotoes.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
    });

    if (botoes[abaAtiva]) {
        botoes[abaAtiva].forEach(b => {
            const btn = document.createElement('button');
            btn.textContent = b.nome;
            aplicarEstiloBotao(btn);
            btn.onclick = b.func;
            containerBotoes.appendChild(btn);
        });
    }

    janela.appendChild(containerBotoes);

    // Botões de ação no final
    const botoesAcao = document.createElement('div');
    Object.assign(botoesAcao.style, {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        marginTop: '15px',
        width: '100%'
    });

    const btnEsconder = document.createElement('button');
    btnEsconder.textContent = '👁️ Fechar Menu';
    aplicarEstiloBotao(btnEsconder);
    btnEsconder.onclick = () => {
        fundo.remove();
        const botaoFlutuante = document.getElementById('dhonatanBotao');
        if (botaoFlutuante) botaoFlutuante.remove();
    };

    const btnFechar = document.createElement('button');
    btnFechar.textContent = '❌ Minimizar Menu';
    aplicarEstiloBotao(btnFechar);
    btnFechar.onclick = () => {
        fundo.remove();
        criarBotaoFlutuante();
    };

    botoesAcao.append(btnEsconder, btnFechar);
    janela.appendChild(botoesAcao);
};

const criarMenu = () => {
    fundo = document.createElement('div');
    Object.assign(fundo.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '999999',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    janela = document.createElement('div');
    aplicarEstiloContainer(janela);

    const titulo = document.createElement('div');
    titulo.textContent = 'PAINEL AUXÍLIO';
    aplicarEstiloTexto(titulo, '20px');

    let h = 0;
    setInterval(() => {
        titulo.style.color = `hsl(${h++ % 360},100%,60%)`;
    }, 30);

    relogio = document.createElement('div');
relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
aplicarEstiloTexto(relogio, '16px');
setInterval(() => {
    relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}, 1000);

janela.append(titulo, relogio);
    criarAbas();
    fundo.append(janela);
    document.body.append(fundo);
};

const criarInterface = () => {
    fundo = document.createElement('div');
    Object.assign(fundo.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '999999',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    janela = document.createElement('div');
    aplicarEstiloContainer(janela);

// Container principal
nome = document.createElement('div');
Object.assign(nome.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
});

// Texto SUPERIOR
const textoCima = document.createElement('div');
textoCima.textContent = 'Painel Funções';
aplicarEstiloTexto(textoCima, '18px');

// Texto INFERIOR
const textoBaixo = document.createElement('div');
textoBaixo.textContent = 'tudo para suas atividades de escola aqui!';
aplicarEstiloTexto(textoBaixo, '16px');

// Adiciona os textos ao container
nome.appendChild(textoCima);
nome.appendChild(textoBaixo);

// Mantém a animação de cores apenas no texto inferior
let hue = 0;
setInterval(() => {
    textoBaixo.style.color = `hsl(${hue++ % 360},100%,60%)`;
}, 30);

    const input = document.createElement('input');
    Object.assign(input.style, {
        padding: '12px',
        width: '80%',
        margin: '15px 0',
        background: '#222',
        color: '#fff',
        border: '1px solid #444',
        borderRadius: '30px',
        textAlign: 'center',
        fontSize: '16px'
    });
    input.type = 'password';
    input.placeholder = 'Digite a senha';

    const botao = document.createElement('button');
    botao.textContent = 'Acessar';
    aplicarEstiloBotao(botao, true);

    const erro = document.createElement('div');
    erro.textContent = '❌ Senha incorreta. Se não tiver a senha procure um adm.';
    Object.assign(erro.style, {
        display: 'none', 
        color: '#ff5555', 
        marginTop: '15px',
        fontSize: '14px'
    });

    // ===== [SISTEMA DE SENHAS REMOTO CORRIGIDO] ===== //
// 1. Variável global para controle
let senhasCarregadas = false;

// 2. Função para carregar senhas com tratamento de erro
const carregarSenhasRemotas = async () => {
    try {
        const response = await fetch('https://raw.githubusercontent.com/Dhonatan27262/dhonatan-cheats/main/senhas.js?' + Date.now());
        if (!response.ok) throw new Error('Erro HTTP: ' + response.status);
        
        const scriptContent = await response.text();
        const script = document.createElement('script');
        script.textContent = scriptContent;
        document.head.appendChild(script);
        
        senhasCarregadas = true;
    } catch (error) {
        console.error('Falha ao carregar senhas:', error);
        // Fallback com senhas locais (case sensitive)
        window.verificarSenha = function(senha) {
            const senhasBackup = [
                "admin",
                "Teste24",
                "adm",
                "tainara",
                "vitor",
                "pablo",
                "rafael"
            ];
            return senhasBackup.includes(senha);
        };
        senhasCarregadas = true;
    }
};

// 3. Carregar senhas ao iniciar
carregarSenhasRemotas();

// 4. Verificação com espera do carregamento
botao.onclick = async () => {
    // Se ainda não carregou, mostra aviso
    if (!senhasCarregadas) {
        const aviso = document.createElement('div');
        aviso.textContent = '🔒 Carregando sistema de senhas...';
        aviso.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff0;
            color: #000;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 100000;
            font-weight: bold;
        `;
        document.body.appendChild(aviso);
        
        await carregarSenhasRemotas();
        aviso.remove();
    }

    if (verificarSenha(input.value)) {
        senhaLiberada = true;
        fundo.remove();
        criarMenu();
    } else {
        erro.style.display = 'block';
    }
};
// ===== [FIM DO SISTEMA CORRIGIDO] ===== //

    janela.append(nome, input, botao, erro);
    fundo.append(janela);
    document.body.append(fundo);
};

const criarBotaoFlutuante = () => {
    const b = document.createElement('div');
    b.id = "dhonatanBotao";
    b.textContent = "Painel";
    Object.assign(b.style, {
        position: 'fixed',
        left: posX,
        top: posY,
        background: corBotao,
        padding: '12px 20px',
        borderRadius: '30px',
        cursor: 'grab',
        zIndex: '999999',
        fontWeight: 'bold',
        userSelect: 'none',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease'
    });

    let isDragging = false;
    let startX, startY;
    let initialX, initialY;
    let xOffset = 0, yOffset = 0;
    const DRAG_THRESHOLD = 5;

    b.addEventListener('mousedown', startDrag);
    b.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        initialX = clientX - (parseFloat(b.style.left) || 0);
        initialY = clientY - (parseFloat(b.style.top) || 0);
        
        isDragging = false;
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function handleDragMove(e) {
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (!isDragging && distance > DRAG_THRESHOLD) {
            isDragging = true;
        }
        
        if (isDragging) {
            const currentX = clientX - initialX;
            const currentY = clientY - initialY;
            
            b.style.left = `${currentX}px`;
            b.style.top = `${currentY}px`;
            b.style.cursor = 'grabbing';
        }
    }

    function endDrag() {
        if (isDragging) {
            posX = b.style.left;
            posY = b.style.top;
            localStorage.setItem("dhonatanX", posX);
            localStorage.setItem("dhonatanY", posY);
        } else {
            // Se não estava arrastando, é um clique
            b.remove();
            senhaLiberada ? criarMenu() : criarInterface();
        }
        
        b.style.cursor = 'grab';
        isDragging = false;
        
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
    }

    document.body.append(b);
};

// Iniciar o botão flutuante
criarBotaoFlutuante();
})();
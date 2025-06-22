(function () {
  let fundo, janela, nome, relogio;
  let senhaLiberada = false;
  let posX = localStorage.getItem("dhonatanX") || "20px";
  let posY = localStorage.getItem("dhonatanY") || "20px";

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

  const encontrarRespostaColar = () => {
    const { pergunta, alternativas } = coletarPerguntaEAlternativas();
    if (!pergunta || !alternativas) return alert('❌ Não foi possível identificar a pergunta ou alternativas.');
    const prompt = `Responda de forma direta e clara sem ponto final:\n${pergunta}\n\nAlternativas:\n${alternativas}`;
    const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
    window.open(url, "_blank");
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
    alert("✅ Toque onde deseja colar o texto");
    const handler = (e) => {
      e.preventDefault();
      document.removeEventListener('click', handler, true);
      const el = e.target;
      if (!(el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        alert("❌ Esse não é um campo válido.");
        criarBotaoFlutuante();
        return;
      }

      const texto = prompt("Cole ou digite o texto desejado:");
      if (!texto) return criarBotaoFlutuante();

      let i = 0;
      const progresso = document.createElement('div');
      Object.assign(progresso.style, {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', background: 'black',
        color: 'white', padding: '10px', borderRadius: '10px',
        zIndex: '999999', fontSize: '20px'
      });
      document.body.append(progresso);

      const intervalo = setInterval(() => {
        const char = texto[i];
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value += char;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          el.textContent += char;
        }
        progresso.textContent = `${Math.floor((i / texto.length) * 100)}%`;
        i++;
        if (i >= texto.length) {
          clearInterval(intervalo);
          progresso.remove();

          const done = document.createElement('div');
          Object.assign(done.style, {
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', background: '#fff',
            padding: '15px 20px', borderRadius: '8px',
            fontSize: '18px', textAlign: 'center',
            zIndex: '999999'
          });
          done.textContent = '✅ Texto colado! Obrigado por usar o Mod do Dhonatan, aquele gostoso';

          let h = 0;
          setInterval(() => {
            done.style.color = `hsl(${h},100%,60%)`;
            h = (h + 2) % 360;
          }, 30);

          document.body.append(done);
          setTimeout(() => { done.remove(); criarBotaoFlutuante(); }, 3000);
        }
      }, 50);
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

  const criarBotaoFlutuante = () => {
    const b = document.createElement('div');
    b.textContent = "💻 Dhonatan Cheats";
    Object.assign(b.style, {
      position: 'fixed',
      left: posX,
      top: posY,
      background: '#00ffea',
      padding: '10px 15px',
      borderRadius: '8px',
      cursor: 'grab',
      zIndex: '999999',
      fontWeight: 'bold',
      userSelect: 'none',
      color: '#000'
    });

    let offsetX, offsetY, startTime, moved = false, dragging = false;

    b.addEventListener('touchstart', e => {
      dragging = true;
      startTime = Date.now();
      moved = false;
      offsetX = e.touches[0].clientX - b.getBoundingClientRect().left;
      offsetY = e.touches[0].clientY - b.getBoundingClientRect().top;
      e.preventDefault();
    }, { passive: false });

    b.addEventListener('touchmove', e => {
      if (!dragging) return;
      moved = true;
      const x = e.touches[0].clientX - offsetX;
      const y = e.touches[0].clientY - offsetY;
      b.style.left = `${x}px`;
      b.style.top = `${y}px`;
      b.style.bottom = 'unset';
      b.style.right = 'unset';
      e.preventDefault();
    }, { passive: false });

    b.addEventListener('touchend', () => {
      dragging = false;
      posX = b.style.left;
      posY = b.style.top;
      localStorage.setItem("dhonatanX", posX);
      localStorage.setItem("dhonatanY", posY);
      if (Date.now() - startTime < 200 && !moved) {
        b.remove();
        senhaLiberada ? criarMenu() : criarInterface();
      }
    });

    document.body.append(b);
  };

  const criarInterface = () => {
    fundo = document.createElement('div');
    Object.assign(fundo.style, {
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: '999999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    janela = document.createElement('div');
    Object.assign(janela.style, {
      background: '#111',
      padding: '20px',
      borderRadius: '10px',
      width: '90%',
      maxWidth: '350px',
      textAlign: 'center'
    });

    nome = document.createElement('div');
    nome.textContent = 'Bem-vindo(a) ao mod do Dhonatan Modder';
    Object.assign(nome.style, {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px'
    });

    let hue = 0;
    setInterval(() => {
      nome.style.color = `hsl(${hue++ % 360},100%,60%)`;
    }, 30);

    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = 'Digite a senha';
    Object.assign(input.style, {
      padding: '8px', width: '80%', marginBottom: '10px'
    });

    const botao = document.createElement('button');
    botao.textContent = 'Acessar';
    Object.assign(botao.style, {
      padding: '8px 15px',
      background: '#00ffea',
      borderRadius: '5px',
      border: 'none'
    });

    const erro = document.createElement('div');
    erro.textContent = '❌ Senha incorreta. Se não tiver a senha procure um adm.';
    Object.assign(erro.style, {
      display: 'none',
      color: 'red',
      marginTop: '10px'
    });

    botao.onclick = () => {
      if (input.value !== 'admin') return erro.style.display = 'block';
      senhaLiberada = true;
      fundo.remove();
      criarMenu();
    };

    janela.append(nome, input, botao, erro);
    fundo.append(janela);
    document.body.append(fundo);
  };

  const criarMenu = () => {
    fundo = document.createElement('div');
    Object.assign(fundo.style, {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '999999',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    janela = document.createElement('div');
    Object.assign(janela.style, {
      background: '#111', padding: '20px', borderRadius: '10px',
      width: '90%', maxWidth: '350px', textAlign: 'center'
    });

    const titulo = document.createElement('div');
    titulo.textContent = 'DHONATAN MODDER 🔥';
    Object.assign(titulo.style, {
      fontSize: '20px', fontWeight: 'bold', marginBottom: '15px'
    });

    let h = 0;
    setInterval(() => {
      titulo.style.color = `hsl(${h++ % 360},100%,60%)`;
    }, 30);

    relogio = document.createElement('div');
    relogio.style.color = '#ccc';
    setInterval(() => {
      relogio.textContent = '🕒 ' + new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    }, 1000);

    const btn = (txt, cor, func) => {
      const b = document.createElement('button');
      b.textContent = txt;
      Object.assign(b.style, {
        padding: '10px', margin: '5px', width: '90%',
        background: cor, borderRadius: '5px', border: 'none', color: '#000'
      });
      b.onclick = func;
      return b;
    };

    janela.append(
  titulo, relogio,

  // 1. Iniciar Bot de Texto
  btn('✍️ Iniciar Bot de Texto', '#00ffea', () => { fundo.remove(); iniciarMod(); }),

  // 2. Criar Texto com Tema
  btn('📄 Criar Texto com Tema', '#f0f', criarTextoComTema),

  // 3. Reescrever Texto
  btn('🔁 Reescrever Texto', '#90ee90', abrirReescritor),

  // 4. Encontrar Resposta (Colar)
  btn('📡 Encontrar Resposta (Colar)', '#ffd700', encontrarRespostaColar),

  btn('✍️ Encontrar Resposta (Digitar)', '#ffa500', encontrarRespostaDigitar),

  btn('🎯 Marcar Resposta (Colar)', '#00ff90', () => {
    navigator.clipboard.readText().then(r => marcarResposta(r));
  }),

  btn('✍️ Marcar Resposta (Digitar)', '#8ecaff', () => {
    const r = prompt("Digite a resposta:");
    if (r) marcarResposta(r);
  }),

  btn('🔃 Resetar', '#999', () => {
    fundo.remove();
    criarInterface();
  }),

  btn('❌ Fechar Menu', '#ff0033', () => {
    fundo.remove();
    criarBotaoFlutuante();
  })
);

    fundo.append(janela);
    document.body.append(fundo);
  };

  // Inicia o painel ao carregar
  criarInterface();
})();
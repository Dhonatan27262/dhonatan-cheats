(function () {
  let fundo, janela, nome, relogio;
  let senhaLiberada = false;
  let abaAtiva = 'textos';
  let posX = localStorage.getItem("dhonatanX") || "20px";
  let posY = localStorage.getItem("dhonatanY") || "20px";
  let corBotao = localStorage.getItem("corBotaoDhonatan") || "#00ffea";

  const mostrarInfoDono = () => {
    alert("👑 Mod criado por Dhonatan\n📱 Instagram: @santos.mec996\n💻 Mod exclusivo e protegido.");
  };

  const trocarCorBotao = () => {
  let novaCorTemp = corBotao;

  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#111',
    padding: '20px',
    borderRadius: '10px',
    zIndex: '999999',
    textAlign: 'center',
    border: '1px solid #0f0'
  });

  const titulo = document.createElement('div');
  titulo.textContent = '🎨 Escolha a nova cor do botão flutuante';
  Object.assign(titulo.style, {
    color: '#fff',
    marginBottom: '10px',
    fontWeight: 'bold'
  });

  const seletor = document.createElement("input");
  seletor.type = "color";
  seletor.value = corBotao;
  Object.assign(seletor.style, {
    width: "100px",
    height: "100px",
    border: "none",
    background: "transparent",
    cursor: "pointer"
  });

  seletor.addEventListener("input", () => {
    novaCorTemp = seletor.value;
    // (Não aplica ainda)
  });

  seletor.addEventListener("blur", () => {
    // Aplicar só ao fechar o seletor
    aplicarNovaCor(novaCorTemp, container);
  });

  const btnCancelar = document.createElement('button');
  btnCancelar.textContent = '❌ Cancelar';
  Object.assign(btnCancelar.style, {
    marginTop: '15px',
    padding: '8px 16px',
    background: '#900',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  });
  btnCancelar.onclick = () => container.remove();

  container.appendChild(titulo);
  container.appendChild(seletor);
  container.appendChild(btnCancelar);
  document.body.appendChild(container);

  // Força o foco e clique com atraso mínimo para funcionar no iOS
  setTimeout(() => {
    seletor.focus();
    seletor.click();
  }, 50);
};

const aplicarNovaCor = (novaCor, container) => {
  if (!novaCor || novaCor === corBotao) {
    container.remove();
    return;
  }

  corBotao = novaCor;
  localStorage.setItem("corBotaoDhonatan", corBotao);
  document.querySelectorAll("#dhonatanBotao").forEach(btn => {
    btn.style.background = corBotao;
  });

  container.remove();

  const aviso = document.createElement('div');
  aviso.textContent = '✅ Cor alterada com sucesso!';
  Object.assign(aviso.style, {
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#000',
    color: '#0f0',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '16px',
    zIndex: '999999',
    border: '1px solid #0f0',
    fontWeight: 'bold',
    textAlign: 'center'
  });
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 2000);
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

  const iniciarBotDeTexto = () => {
    fundo?.remove();
    alert("✍️ Toque no campo onde deseja digitar o texto.");
    document.addEventListener("click", function handler(e) {
      document.removeEventListener("click", handler, true);
      const el = e.target;

      if (!el.isContentEditable && !(el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
        alert("❌ Esse não é um campo válido.");
        return;
      }

      const texto = prompt("Cole o texto que deseja digitar:");
      if (!texto) return;

      let i = 0;
      const progresso = document.createElement("div");
      Object.assign(progresso.style, {
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#000", color: "#fff", padding: "10px 20px",
        borderRadius: "10px", fontSize: "22px", zIndex: 9999999
      });
      document.body.append(progresso);

      const intervalo = setInterval(() => {
        if (i < texto.length) {
          const c = texto[i++];
          if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.value += c;
            el.dispatchEvent(new Event("input", { bubbles: true }));
          } else {
            el.textContent += c;
          }
          progresso.textContent = `${Math.round((i / texto.length) * 100)}%`;
        } else {
          clearInterval(intervalo);
          progresso.remove();
          el.dispatchEvent(new Event("change", { bubbles: true }));
          el.blur(); // tira o foco

          const msg = document.createElement("div");
          msg.textContent = "✅ Texto digitado com sucesso!";
          Object.assign(msg.style, {
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff", color: "#000", padding: "15px",
            borderRadius: "10px", fontSize: "18px",
            zIndex: 9999999, fontWeight: "bold", textAlign: "center"
          });
          document.body.appendChild(msg);
          setTimeout(() => msg.remove(), 3000);
        }
      }, 80); // ← aqui você controla a velocidade da digitação (mais alto = mais lento)
    }, true);
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

  const criarAbas = () => {
    const botoes = {
      scripts: [
// ✅ BOTÃO 1: abrir uma URL personalizada
  { nome: 'Ingles Pr', func: () => {
  window.open('https://speakify.cupiditys.lol', '_blank');
  }},

{ nome: 'Script Khan Academy', func: () => {
    const texto = `javascript:fetch("https://raw.githubusercontent.com/Niximkk/Khanware/refs/heads/main/Khanware.js").then(t=>t.text()).then(eval); `;
    navigator.clipboard.writeText(texto).then(() => {
      const aviso = document.createElement('div');
      aviso.textContent = '✅ Texto copiado com sucesso!';
      Object.assign(aviso.style, {
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#000',
        color: '#0f0',
        padding: '12px 20px',
        borderRadius: '10px',
        fontSize: '16px',
        zIndex: '999999',
        border: '1px solid #0f0',
        fontWeight: 'bold',
        textAlign: 'center'
      });
      document.body.appendChild(aviso);
      setTimeout(() => aviso.remove(), 2000);
    });
}},

],
      textos: [
        { nome: '✍️ Iniciar Bot de Texto', func: () => { fundo.remove(); iniciarMod(); } },
        { nome: '📄 Criar Texto com Tema', func: criarTextoComTema },
        { nome: '🔁 Reescrever Texto', func: abrirReescritor }
      ],
      respostas: [
        { nome: '📡 Encontrar Resposta (Colar)', func: encontrarRespostaColar },
        { nome: '✍️ Encontrar Resposta (Digitar)', func: encontrarRespostaDigitar },
        { nome: '🎯 Marcar Resposta (Colar)', func: () => {
          navigator.clipboard.readText().then(r => marcarResposta(r));
        }},
        { nome: '✍️ Marcar Resposta (Digitar)', func: () => {
          const r = prompt("Digite a resposta:");
          if (r) marcarResposta(r);
        }}
      ],
      config: [
        { nome: 'ℹ️ Sobre o Mod', func: mostrarInfoDono },
        { nome: '🎨 Cor do Botão Flutuante', func: trocarCorBotao },
        { nome: '🔃 Resetar', func: () => { fundo.remove(); criarInterface(); } }
      ]
    };

    const botoesAbas = document.createElement('div');
    botoesAbas.style.marginBottom = '10px';

    ['scripts', 'textos', 'respostas', 'config'].forEach(id => {
      const botaoAba = document.createElement('button');
      botaoAba.textContent = id.toUpperCase();
      Object.assign(botaoAba.style, {
        padding: '5px 10px', margin: '2px',
        border: '1px solid white', borderRadius: '5px',
        cursor: 'pointer',
        color: abaAtiva === id ? '#000' : '#fff',
        background: abaAtiva === id ? 'linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)' : '#333',
        backgroundSize: '400% 400%',
        animation: abaAtiva === id ? 'rainbowBtn 3s linear infinite' : 'none'
      });
      botaoAba.onclick = () => {
        abaAtiva = id;
        fundo.remove();
        criarMenu();
      };
      botoesAbas.appendChild(botaoAba);
    });

    janela.appendChild(botoesAbas);

    if (botoes[abaAtiva]) {
      botoes[abaAtiva].forEach(b => {
        const btn = document.createElement('button');
        btn.textContent = b.nome;
        Object.assign(btn.style, {
          padding: '10px', margin: '5px', width: '90%',
          background: '#000', color: '#fff',
          border: '1px solid white', borderRadius: '5px'
        });
        btn.onclick = b.func;
        janela.appendChild(btn);
      });
    }

    const btnFechar = document.createElement('button');
    btnFechar.textContent = '❌ Fechar Menu';
    Object.assign(btnFechar.style, {
      marginTop: '15px', padding: '10px', width: '90%',
      background: '#000', color: '#fff',
      border: '1px solid white', borderRadius: '5px'
    });
    btnFechar.onclick = () => {
      fundo.remove();
      criarBotaoFlutuante();
    };
    janela.appendChild(btnFechar);
  };

  const estiloRGB = document.createElement('style');
  estiloRGB.innerHTML = `
  @keyframes rainbowBtn {
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
  }`;
  document.head.appendChild(estiloRGB);

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
    Object.assign(janela.style, {
      background: '#111', padding: '20px', borderRadius: '10px',
      width: '90%', maxWidth: '350px', textAlign: 'center'
    });

    nome = document.createElement('div');
    nome.textContent = 'Bem-vindo(a) ao mod do Dhonatan Modder';
    Object.assign(nome.style, {
      fontSize: '18px', fontWeight: 'bold', marginBottom: '15px'
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
      padding: '8px 15px', background: '#00ffea',
      borderRadius: '5px', border: 'none'
    });

    const erro = document.createElement('div');
    erro.textContent = '❌ Senha incorreta. Se não tiver a senha procure um adm.';
    Object.assign(erro.style, {
      display: 'none', color: 'red', marginTop: '10px'
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

  const criarBotaoFlutuante = () => {
    const b = document.createElement('div');
    b.id = "dhonatanBotao";
    b.textContent = "💻 Dhonatan Cheats";
    Object.assign(b.style, {
      position: 'fixed', left: posX, top: posY,
      background: corBotao, padding: '10px 15px',
      borderRadius: '8px', cursor: 'grab',
      zIndex: '999999', fontWeight: 'bold',
      userSelect: 'none', color: '#000'
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

  criarInterface();
})();
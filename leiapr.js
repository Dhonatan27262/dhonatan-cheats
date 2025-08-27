(async () => {
    // Aguarda que as perguntas estejam na página
    const espera = () => new Promise(res => {
        const interval = setInterval(() => {
            if (document.querySelectorAll('.pergunta').length > 0) {
                clearInterval(interval);
                res();
            }
        }, 500);
    });
    await espera();

    // Pega todas as perguntas disponíveis
    const perguntas = Array.from(document.querySelectorAll('.pergunta')).map(el => el.innerText);

    // Mostra as perguntas no console para escolher
    console.log('Perguntas disponíveis:');
    perguntas.forEach((p, i) => console.log(`${i + 1}: ${p}`));

    // Pede ao usuário para escolher a pergunta e a resposta
    const escolha = parseInt(prompt('Digite o número da pergunta que deseja responder:')) - 1;
    const resposta = prompt('Digite a resposta que deseja enviar:');

    // Seleciona a pergunta e preenche a resposta
    const perguntaSelecionada = document.querySelectorAll('.pergunta')[escolha];
    if (perguntaSelecionada) {
        perguntaSelecionada.click(); // Se necessário para abrir o campo de resposta

        // Aguarda o campo de resposta aparecer
        const campoResposta = document.querySelector('.campo-resposta');
        if (campoResposta) {
            campoResposta.value = resposta;

            // Se houver botão de enviar, clica
            const botaoEnviar = document.querySelector('.botao-enviar');
            if (botaoEnviar) botaoEnviar.click();

            // Mostra alerta dentro da página
            const aviso = document.createElement('div');
            aviso.innerText = `Resposta enviada: ${resposta}`;
            Object.assign(aviso.style, {
                position: 'fixed',
                top: '10px',
                right: '10px',
                backgroundColor: 'green',
                color: 'white',
                padding: '10px',
                zIndex: 999999
            });
            document.body.appendChild(aviso);

            console.log('Resposta enviada com sucesso!');
        } else {
            console.log('Campo de resposta não encontrado.');
        }
    } else {
        console.log('Pergunta inválida.');
    }
})();
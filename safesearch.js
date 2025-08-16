(function() {
    // ================= CONFIGURAÇÕES GLOBAIS ================= //
    const config = {
        corPrimaria: '#4CAF50',
        corSecundaria: '#2196F3',
        corErro: '#f44336',
        corFundo: 'rgba(0, 0, 0, 0.85)',
        corTexto: '#FFFFFF'
    };

    // ================= FUNÇÕES DE UTILIDADE ================= //
    function criarElemento(tag, estilos, texto = '') {
        const elemento = document.createElement(tag);
        Object.assign(elemento.style, estilos);
        if (texto) elemento.textContent = texto;
        return elemento;
    }

    function mostrarMensagem(mensagem, cor = config.corPrimaria, tempo = 3000) {
        const msg = criarElemento('div', {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 30px',
            backgroundColor: cor,
            color: config.corTexto,
            borderRadius: '50px',
            zIndex: '10000000',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            textAlign: 'center',
            fontSize: '16px'
        }, mensagem);

        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), tempo);
    }

    // ================= FUNÇÃO PRINCIPAL ================= //
    async function iniciarSafeSearchPorImagem() {
        // Criar overlay de instruções
        const overlay = criarElemento('div', {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: config.corFundo,
            zIndex: '999999',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.corTexto,
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            backdropFilter: 'blur(5px)'
        });

        const titulo = criarElemento('h1', {
            fontSize: '2.5rem',
            marginBottom: '20px',
            background: `linear-gradient(45deg, ${config.corPrimaria}, ${config.corSecundaria})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
        }, '🔍 SafeSearch por Imagem');

        const instrucao = criarElemento('p', {
            fontSize: '1.2rem',
            maxWidth: '600px',
            marginBottom: '30px',
            lineHeight: '1.6'
        }, 'Capture uma área da tela para analisar texto e pesquisar com segurança no Perplexity AI. O SafeSearch estará ativado automaticamente.');

        const containerBotoes = criarElemento('div', {
            display: 'flex',
            gap: '20px',
            marginTop: '20px'
        });

        const btnIniciar = criarElemento('button', {
            padding: '15px 40px',
            background: `linear-gradient(135deg, ${config.corPrimaria}, #2E7D32)`,
            color: config.corTexto,
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s, box-shadow 0.3s'
        }, 'Iniciar Captura');

        const btnCancelar = criarElemento('button', {
            padding: '15px 40px',
            background: `linear-gradient(135deg, ${config.corErro}, #B71C1C)`,
            color: config.corTexto,
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s, box-shadow 0.3s'
        }, 'Cancelar');

        // Efeitos hover
        btnIniciar.onmouseenter = () => btnIniciar.style.transform = 'scale(1.05)';
        btnIniciar.onmouseleave = () => btnIniciar.style.transform = 'scale(1)';
        btnCancelar.onmouseenter = () => btnCancelar.style.transform = 'scale(1.05)';
        btnCancelar.onmouseleave = () => btnCancelar.style.transform = 'scale(1)';

        // Event listeners
        btnIniciar.onclick = async () => {
            overlay.remove();
            await capturarESelecionarArea();
        };

        btnCancelar.onclick = () => {
            overlay.remove();
        };

        // Montar interface
        containerBotoes.append(btnIniciar, btnCancelar);
        overlay.append(titulo, instrucao, containerBotoes);
        document.body.appendChild(overlay);
    }

    // ================= CAPTURA E SELEÇÃO DE ÁREA ================= //
    async function capturarESelecionarArea() {
        try {
            // Solicitar permissão para capturar tela
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false
            });
            
            const video = document.createElement('video');
            video.srcObject = stream;
            await video.play();
            
            // Criar seletor de área
            const seletor = criarElemento('div', {
                position: 'fixed',
                border: `3px dashed ${config.corPrimaria}`,
                cursor: 'move',
                zIndex: '1000000',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)'
            });
            
            document.body.appendChild(seletor);
            
            // Criar controles
            const controles = criarElemento('div', {
                position: 'fixed',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '15px',
                zIndex: '1000001'
            });
            
            const btnAnalisar = criarElemento('button', {
                padding: '12px 30px',
                background: `linear-gradient(135deg, ${config.corSecundaria}, #0D47A1)`,
                color: config.corTexto,
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
            }, 'Analisar Área');
            
            const btnCancelar = criarElemento('button', {
                padding: '12px 30px',
                background: `linear-gradient(135deg, ${config.corErro}, #B71C1C)`,
                color: config.corTexto,
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
            }, 'Cancelar');
            
            controles.append(btnAnalisar, btnCancelar);
            document.body.appendChild(controles);
            
            // Variáveis de estado
            let startX = 100, startY = 100;
            let width = 400, height = 300;
            let dragging = false;
            let dragStartX, dragStartY;
            let offsetX, offsetY;
            
            // Atualizar posição do seletor
            function atualizarSeletor() {
                seletor.style.left = `${startX}px`;
                seletor.style.top = `${startY}px`;
                seletor.style.width = `${width}px`;
                seletor.style.height = `${height}px`;
            }
            
            // Eventos de mouse
            document.addEventListener('mousedown', iniciarArrasto);
            document.addEventListener('mousemove', arrastar);
            document.addEventListener('mouseup', pararArrasto);
            
            function iniciarArrasto(e) {
                const rect = seletor.getBoundingClientRect();
                const inSeletor = (
                    e.clientX >= rect.left && 
                    e.clientX <= rect.right && 
                    e.clientY >= rect.top && 
                    e.clientY <= rect.bottom
                );
                
                if (inSeletor) {
                    dragging = true;
                    dragStartX = e.clientX;
                    dragStartY = e.clientY;
                    offsetX = dragStartX - startX;
                    offsetY = dragStartY - startY;
                }
            }
            
            function arrastar(e) {
                if (!dragging) return;
                
                startX = e.clientX - offsetX;
                startY = e.clientY - offsetY;
                atualizarSeletor();
            }
            
            function pararArrasto() {
                dragging = false;
            }
            
            // Configurar botões
            btnAnalisar.onclick = async () => {
                // Remover elementos temporários
                seletor.remove();
                controles.remove();
                document.removeEventListener('mousedown', iniciarArrasto);
                document.removeEventListener('mousemove', arrastar);
                document.removeEventListener('mouseup', pararArrasto);
                
                // Parar stream de vídeo
                stream.getTracks().forEach(track => track.stop());
                
                // Processar área selecionada
                processarAreaCapturada(video, startX, startY, width, height);
            };
            
            btnCancelar.onclick = () => {
                seletor.remove();
                controles.remove();
                stream.getTracks().forEach(track => track.stop());
                document.removeEventListener('mousedown', iniciarArrasto);
                document.removeEventListener('mousemove', arrastar);
                document.removeEventListener('mouseup', pararArrasto);
            };
            
            // Posicionamento inicial
            atualizarSeletor();
            
        } catch (erro) {
            console.error('Erro na captura de tela:', erro);
            mostrarMensagem(`❌ Erro: ${erro.message}`, config.corErro);
        }
    }

    // ================= PROCESSAMENTO DA IMAGEM ================= //
    async function processarAreaCapturada(video, x, y, width, height) {
        // Mostrar loading
        const loading = criarElemento('div', {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: config.corFundo,
            color: config.corTexto,
            padding: '30px 50px',
            borderRadius: '15px',
            textAlign: 'center',
            zIndex: '1000000',
            fontSize: '18px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            border: `1px solid ${config.corPrimaria}`
        }, '🔍 Processando imagem com IA...');

        document.body.appendChild(loading);
        
        try {
            // Criar canvas para captura
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, x, y, width, height, 0, 0, width, height);
            
            // Carregar Tesseract.js dinamicamente
            await carregarScript('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
            
            // Executar OCR
            const { data: { text } } = await Tesseract.recognize(
                canvas.toDataURL('image/png'),
                'por+eng' // Idiomas: Português e Inglês
            );
            
            // Remover loading
            loading.remove();
            
            if (!text.trim()) {
                throw new Error('Nenhum texto detectado na área selecionada');
            }
            
            // Mostrar preview do texto
            const preview = criarElemento('div', {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: config.corFundo,
                color: config.corTexto,
                padding: '25px',
                borderRadius: '15px',
                zIndex: '1000000',
                maxWidth: '80%',
                maxHeight: '80%',
                overflow: 'auto',
                border: `1px solid ${config.corSecundaria}`,
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            });
            
            const previewTitulo = criarElemento('h3', {
                marginBottom: '15px',
                color: config.corPrimaria,
                textAlign: 'center'
            }, 'Texto detectado:');
            
            const previewTexto = criarElemento('div', {
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                maxHeight: '300px',
                overflow: 'auto',
                fontSize: '16px',
                lineHeight: '1.5'
            }, text);
            
            const containerBotoes = criarElemento('div', {
                display: 'flex',
                justifyContent: 'center',
                gap: '15px'
            });
            
            const btnPesquisar = criarElemento('button', {
                padding: '12px 30px',
                background: `linear-gradient(135deg, ${config.corPrimaria}, #2E7D32)`,
                color: config.corTexto,
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold'
            }, 'Pesquisar com SafeSearch');
            
            const btnFechar = criarElemento('button', {
                padding: '12px 30px',
                background: `linear-gradient(135deg, #9E9E9E, #616161)`,
                color: config.corTexto,
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold'
            }, 'Fechar');
            
            btnPesquisar.onclick = () => {
                preview.remove();
                pesquisarTextoComSafeSearch(text);
            };
            
            btnFechar.onclick = () => {
                preview.remove();
            };
            
            // Montar preview
            containerBotoes.append(btnPesquisar, btnFechar);
            preview.append(previewTitulo, previewTexto, containerBotoes);
            document.body.appendChild(preview);
            
        } catch (erro) {
            console.error('Erro no processamento:', erro);
            loading.remove();
            mostrarMensagem(`❌ ${erro.message}`, config.corErro);
        }
    }

    // ================= FUNÇÕES AUXILIARES ================= //
    function carregarScript(url) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${url}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function pesquisarTextoComSafeSearch(texto) {
        const textoLimpo = texto.trim().substring(0, 500); // Limitar tamanho
        const query = encodeURIComponent(textoLimpo);
        const url = `https://www.perplexity.ai/search?q=${query}&safe=active`;
        
        window.open(url, '_blank');
        mostrarMensagem('✅ Pesquisa segura iniciada!', config.corPrimaria);
    }

    // ================= INICIALIZAÇÃO ================= //
    // Verificar compatibilidade do navegador
    if (!('mediaDevices' in navigator) {
        mostrarMensagem('❌ Seu navegador não suporta captura de tela', config.corErro);
        return;
    }

    // Iniciar o processo
    iniciarSafeSearchPorImagem();
})();
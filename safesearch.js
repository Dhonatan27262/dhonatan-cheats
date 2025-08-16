// ==UserScript==
// @name         SafeSearch por Imagem
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Captura uma área da tela, reconhece texto e pesquisa com SafeSearch
// @author       Seu Nome
// @match        *://*/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js
// ==/UserScript==

(function() {
    'use strict';
    
    // Configurações
    const config = {
        corPrimaria: '#4CAF50',
        corSecundaria: '#2196F3',
        corErro: '#f44336',
        corFundo: 'rgba(0, 0, 0, 0.85)',
        corTexto: '#FFFFFF'
    };

    // Função para criar elementos com estilos
    function criarElemento(tag, estilos = {}, texto = '') {
        const elemento = document.createElement(tag);
        Object.assign(elemento.style, estilos);
        if (texto) elemento.textContent = texto;
        return elemento;
    }

    // Função para exibir mensagens temporárias
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
            fontSize: '16px',
            opacity: '0',
            transition: 'opacity 0.3s'
        }, mensagem);

        document.body.appendChild(msg);
        
        // Animar entrada
        setTimeout(() => msg.style.opacity = '1', 10);
        
        // Remover após o tempo especificado
        setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 300);
        }, tempo);
    }

    // Função principal para iniciar o SafeSearch por Imagem
    function iniciarSafeSearchPorImagem() {
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
            lineHeight: '1.6',
            padding: '0 20px'
        }, 'Capture uma área da tela para analisar texto e pesquisar com segurança. O SafeSearch estará ativado automaticamente.');

        const containerBotoes = criarElemento('div', {
            display: 'flex',
            gap: '20px',
            marginTop: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
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
            try {
                await capturarESelecionarArea();
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem(`❌ ${error.message}`, config.corErro);
            }
        };

        btnCancelar.onclick = () => {
            overlay.remove();
        };

        // Montar interface
        containerBotoes.append(btnIniciar, btnCancelar);
        overlay.append(titulo, instrucao, containerBotoes);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }

    // Função para capturar e selecionar área
    async function capturarESelecionarArea() {
        // Verificar suporte a getDisplayMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            throw new Error('Seu navegador não suporta captura de tela.');
        }

        let stream;
        try {
            // Solicitar permissão para capturar tela
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false
            });
        } catch (error) {
            throw new Error('Permissão de captura de tela negada.');
        }

        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;

        // Esperar o vídeo estar pronto
        await new Promise((resolve) => {
            video.onloadedmetadata = () => resolve();
        });

        // Criar seletor de área
        const seletor = criarElemento('div', {
            position: 'fixed',
            border: `3px dashed ${config.corPrimaria}`,
            cursor: 'move',
            zIndex: '1000000',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
            pointerEvents: 'none'
        });

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

        // Variáveis de estado
        let startX = 100, startY = 100;
        let width = 400, height = 300;
        let dragging = false;
        let offsetX, offsetY;

        // Atualizar posição do seletor
        function atualizarSeletor() {
            seletor.style.left = `${startX}px`;
            seletor.style.top = `${startY}px`;
            seletor.style.width = `${width}px`;
            seletor.style.height = `${height}px`;
        }

        // Eventos de mouse
        function iniciarArrasto(e) {
            dragging = true;
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
            document.body.style.userSelect = 'none';
        }

        function arrastar(e) {
            if (!dragging) return;
            startX = e.clientX - offsetX;
            startY = e.clientY - offsetY;
            atualizarSeletor();
        }

        function pararArrasto() {
            dragging = false;
            document.body.style.userSelect = '';
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
            try {
                await processarAreaCapturada(video, startX, startY, width, height);
            } catch (error) {
                console.error('Erro no processamento:', error);
                mostrarMensagem(`❌ ${error.message}`, config.corErro);
            }
        };

        btnCancelar.onclick = () => {
            seletor.remove();
            controles.remove();
            stream.getTracks().forEach(track => track.stop());
            document.removeEventListener('mousedown', iniciarArrasto);
            document.removeEventListener('mousemove', arrastar);
            document.removeEventListener('mouseup', pararArrasto);
            document.body.style.overflow = '';
        };

        // Posicionamento inicial
        atualizarSeletor();
        document.body.appendChild(seletor);
        controles.append(btnAnalisar, btnCancelar);
        document.body.appendChild(controles);

        // Adicionar eventos
        document.addEventListener('mousedown', iniciarArrasto);
        document.addEventListener('mousemove', arrastar);
        document.addEventListener('mouseup', pararArrasto);
    }

    // Função para processar a área capturada
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

            // Executar OCR
            const worker = await Tesseract.createWorker('por+eng');
            const { data: { text } } = await worker.recognize(canvas);
            await worker.terminate();

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
                document.body.style.overflow = '';
            };

            btnFechar.onclick = () => {
                preview.remove();
                document.body.style.overflow = '';
            };

            // Montar preview
            containerBotoes.append(btnPesquisar, btnFechar);
            preview.append(previewTitulo, previewTexto, containerBotoes);
            document.body.appendChild(preview);

        } catch (erro) {
            loading.remove();
            throw erro;
        }
    }

    // Função para pesquisar com SafeSearch
    function pesquisarTextoComSafeSearch(texto) {
        const textoLimpo = texto.trim().substring(0, 500); // Limitar tamanho
        const query = encodeURIComponent(textoLimpo);
        const url = `https://www.google.com/search?q=${query}&safe=active`;

        window.open(url, '_blank');
        mostrarMensagem('✅ Pesquisa segura iniciada!', config.corPrimaria);
    }

    // Iniciar o processo
    iniciarSafeSearchPorImagem();
})();
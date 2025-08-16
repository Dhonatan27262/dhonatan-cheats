(function() {
    'use strict';

    // Carregar o html2canvas dinamicamente
    function loadHtml2Canvas(callback) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Criar a interface do usuário
    function createUI() {
        // Criar container principal
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            zIndex: '10000',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            color: '#fff'
        });
        document.body.appendChild(container);

        // Criar card principal
        const card = document.createElement('div');
        Object.assign(card.style, {
            width: '100%',
            maxWidth: '800px',
            background: 'rgba(25, 25, 35, 0.9)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
        });
        container.appendChild(card);

        // Título
        const title = document.createElement('h1');
        Object.assign(title.style, {
            fontSize: '2.5rem',
            marginBottom: '20px',
            background: 'linear-gradient(to right, #4facfe, #00f2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        });
        title.textContent = 'Captura de Tela para Gemini';
        card.appendChild(title);

        // Subtítulo
        const subtitle = document.createElement('p');
        Object.assign(subtitle.style, {
            fontSize: '1.2rem',
            opacity: '0.9',
            marginBottom: '30px',
            lineHeight: '1.6'
        });
        subtitle.textContent = 'Capture qualquer conteúdo da tela e envie diretamente para o Gemini sem precisar de login ou API';
        card.appendChild(subtitle);

        // Container da prévia
        const previewContainer = document.createElement('div');
        Object.assign(previewContainer.style, {
            margin: '25px 0',
            borderRadius: '15px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.2)'
        });
        card.appendChild(previewContainer);

        // Placeholder
        const placeholder = document.createElement('div');
        Object.assign(placeholder.style, {
            textAlign: 'center',
            padding: '30px',
            color: 'rgba(255, 255, 255, 0.5)'
        });
        previewContainer.appendChild(placeholder);

        const placeholderIcon = document.createElement('div');
        placeholderIcon.style.fontSize = '4rem';
        placeholderIcon.textContent = '🖼️';
        placeholder.appendChild(placeholderIcon);

        const placeholderText = document.createElement('p');
        placeholderText.textContent = 'A imagem capturada aparecerá aqui';
        placeholder.appendChild(placeholderText);

        // Loading
        const loading = document.createElement('div');
        Object.assign(loading.style, {
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            padding: '30px'
        });
        previewContainer.appendChild(loading);

        const spinner = document.createElement('div');
        Object.assign(spinner.style, {
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            borderTop: '5px solid #4facfe',
            animation: 'spin 1s linear infinite'
        });
        loading.appendChild(spinner);

        const loadingText = document.createElement('p');
        loadingText.textContent = 'Processando captura de tela...';
        loading.appendChild(loadingText);

        // Botão de captura
        const captureBtn = document.createElement('button');
        Object.assign(captureBtn.style, {
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            color: 'white',
            border: 'none',
            padding: '18px 50px',
            fontSize: '1.3rem',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            margin: '15px 0',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
        });
        captureBtn.textContent = 'Capturar Tela Agora';
        card.appendChild(captureBtn);

        // Botão para abrir Gemini
        const openGeminiBtn = document.createElement('button');
        Object.assign(openGeminiBtn.style, {
            background: 'linear-gradient(135deg, #FF9800, #F57C00)',
            color: 'white',
            border: 'none',
            padding: '18px 50px',
            fontSize: '1.3rem',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            display: 'none',
            alignItems: 'center',
            gap: '10px',
            margin: '15px auto',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
        });
        openGeminiBtn.textContent = 'Abrir Gemini para Envio';
        card.appendChild(openGeminiBtn);

        // Criar estilos para animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            button:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }
            
            button:active {
                transform: translateY(1px);
            }
        `;
        document.head.appendChild(style);

        // Instruções
        const instructions = document.createElement('div');
        Object.assign(instructions.style, {
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '15px',
            padding: '25px',
            marginTop: '25px',
            textAlign: 'left'
        });
        card.appendChild(instructions);

        const instructionsTitle = document.createElement('h3');
        Object.assign(instructionsTitle.style, {
            color: '#FF9800',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center',
            fontSize: '1.4rem'
        });
        instructionsTitle.innerHTML = 'ℹ️ Instruções de Envio';
        instructions.appendChild(instructionsTitle);

        const steps = document.createElement('div');
        Object.assign(steps.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginTop: '15px'
        });
        instructions.appendChild(steps);

        // Passo 1
        const step1 = createStep('1', 'Clique na área de entrada de mensagem');
        steps.appendChild(step1);

        // Passo 2
        const step2 = createStep('2', 'Cole a imagem usando Ctrl+V (Windows) ou Cmd+V (Mac)');
        steps.appendChild(step2);

        // Passo 3
        const step3 = createStep('3', 'Adicione sua pergunta sobre a imagem se desejar');
        steps.appendChild(step3);

        // Footer
        const footer = document.createElement('div');
        Object.assign(footer.style, {
            marginTop: '30px',
            textAlign: 'center',
            opacity: '0.7',
            fontSize: '0.9rem',
            padding: '10px'
        });
        footer.textContent = 'Esta ferramenta não requer login ou chaves de API. Basta capturar e colar no Gemini!';
        card.appendChild(footer);

        // Retornar elementos importantes
        return {
            container,
            previewContainer,
            placeholder,
            loading,
            captureBtn,
            openGeminiBtn
        };

        // Função auxiliar para criar passos
        function createStep(number, text) {
            const step = document.createElement('div');
            step.style.display = 'flex';
            step.style.gap = '15px';
            step.style.alignItems = 'center';

            const stepNumber = document.createElement('div');
            Object.assign(stepNumber.style, {
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: '0',
                fontWeight: 'bold',
                fontSize: '1.2rem'
            });
            stepNumber.textContent = number;
            step.appendChild(stepNumber);

            const stepContent = document.createElement('div');
            stepContent.style.lineHeight = '1.6';
            stepContent.style.fontSize = '1.1rem';
            stepContent.textContent = text;
            step.appendChild(stepContent);

            return step;
        }
    }

    // Função principal
    function init() {
        // Criar a interface
        const ui = createUI();
        
        // Variável para armazenar a imagem capturada
        let capturedImageData = null;
        
        // Adicionar evento ao botão de captura
        ui.captureBtn.addEventListener('click', async function() {
            // Mostrar loading e esconder placeholder
            ui.placeholder.style.display = 'none';
            ui.loading.style.display = 'flex';
            
            try {
                // Capturar a tela com html2canvas
                const canvas = await html2canvas(document.body, {
                    scale: 0.8,
                    useCORS: true,
                    logging: false
                });
                
                // Converter para data URL
                capturedImageData = canvas.toDataURL('image/jpeg', 0.85);
                
                // Criar elemento de imagem para pré-visualização
                const previewImage = document.createElement('img');
                previewImage.src = capturedImageData;
                Object.assign(previewImage.style, {
                    maxWidth: '100%',
                    maxHeight: '500px'
                });
                
                // Limpar container e mostrar a imagem
                ui.previewContainer.innerHTML = '';
                ui.previewContainer.appendChild(previewImage);
                
                // Mostrar botão para abrir Gemini
                ui.openGeminiBtn.style.display = 'block';
                
            } catch (error) {
                console.error('Erro na captura de tela:', error);
                alert('Ocorreu um erro ao capturar a tela. Por favor, tente novamente.');
            } finally {
                // Esconder loading
                ui.loading.style.display = 'none';
            }
        });
        
        // Adicionar evento ao botão para abrir Gemini
        ui.openGeminiBtn.addEventListener('click', function() {
            if (!capturedImageData) {
                alert('Por favor, capture uma imagem primeiro.');
                return;
            }
            
            // Copiar a imagem para a área de transferência
            copyImageToClipboard(capturedImageData);
            
            // Abrir o Gemini em nova aba
            window.open('https://gemini.google.com/app', '_blank');
            
            // Mostrar feedback
            alert('Imagem copiada! Agora vá para o Gemini e cole (Ctrl+V) na área de conversa.');
        });
        
        // Função para copiar imagem para área de transferência
        async function copyImageToClipboard(dataUrl) {
            try {
                // Converter data URL para blob
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                
                // Copiar para área de transferência
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
            } catch (err) {
                console.error('Erro ao copiar imagem:', err);
                alert('Não foi possível copiar a imagem automaticamente. Você pode salvá-la e fazer upload manualmente no Gemini.');
            }
        }
    }

    // Iniciar o processo carregando html2canvas primeiro
    loadHtml2Canvas(init);
})();
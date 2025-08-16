<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Captura de Tela para Gemini</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            color: #fff;
        }
        
        header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            width: 100%;
            max-width: 800px;
        }
        
        h1 {
            font-size: 2.8rem;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            background: linear-gradient(to right, #4facfe, #00f2fe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }
        
        .container {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            justify-content: center;
            width: 100%;
            max-width: 1200px;
        }
        
        .card {
            background: rgba(25, 25, 35, 0.8);
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 550px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .card-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            font-size: 1.5rem;
            color: #4facfe;
        }
        
        .card-title i {
            font-size: 1.8rem;
        }
        
        .btn {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.1rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-top: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        
        .btn:active {
            transform: translateY(1px);
        }
        
        .btn-capture {
            background: linear-gradient(135deg, #4CAF50, #2E7D32);
            width: 100%;
            justify-content: center;
            padding: 18px;
            font-size: 1.2rem;
            margin-top: 0;
        }
        
        .btn-open {
            background: linear-gradient(135deg, #FF9800, #F57C00);
            width: 100%;
            justify-content: center;
            padding: 18px;
            font-size: 1.2rem;
        }
        
        .preview-container {
            margin-top: 20px;
            border-radius: 15px;
            overflow: hidden;
            border: 2px solid rgba(255,255,255,0.1);
            position: relative;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.2);
        }
        
        #previewImage {
            max-width: 100%;
            display: none;
        }
        
        .placeholder {
            text-align: center;
            padding: 30px;
            color: rgba(255,255,255,0.5);
        }
        
        .placeholder i {
            font-size: 4rem;
            margin-bottom: 20px;
            opacity: 0.3;
        }
        
        .instructions {
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            padding: 25px;
            margin-top: 25px;
        }
        
        .instructions h3 {
            color: #FF9800;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .steps {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 15px;
        }
        
        .step {
            display: flex;
            gap: 15px;
        }
        
        .step-number {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-weight: bold;
        }
        
        .step-content {
            line-height: 1.6;
        }
        
        .hidden {
            display: none;
        }
        
        .gemini-preview {
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .gemini-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .gemini-logo {
            font-size: 2rem;
            color: #FF9800;
        }
        
        .gemini-title {
            font-size: 1.4rem;
            font-weight: 600;
        }
        
        .gemini-message {
            background: rgba(255,255,255,0.08);
            border-radius: 15px;
            padding: 15px;
            font-style: italic;
            line-height: 1.6;
            border-left: 3px solid #4facfe;
        }
        
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
                align-items: center;
            }
            
            .card {
                width: 100%;
            }
            
            h1 {
                font-size: 2.2rem;
            }
        }
        
        .loading {
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 30px;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 5px solid #4facfe;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        footer {
            margin-top: 40px;
            text-align: center;
            opacity: 0.7;
            font-size: 0.9rem;
            padding: 20px;
        }
    </style>
</head>
<body>
    <header>
        <h1>Captura de Tela para Gemini</h1>
        <p class="subtitle">Capture qualquer conteúdo da tela e envie diretamente para o Gemini sem precisar de login ou API</p>
    </header>
    
    <div class="container">
        <div class="card">
            <div class="card-title">
                <i>📸</i>
                <h2>Capturar Tela</h2>
            </div>
            
            <p>Clique no botão abaixo para capturar todo o conteúdo visível nesta página.</p>
            
            <button id="captureBtn" class="btn btn-capture">
                <span>Capturar Tela Agora</span>
            </button>
            
            <div class="preview-container">
                <div class="placeholder" id="placeholder">
                    <i>🖼️</i>
                    <p>A imagem capturada aparecerá aqui</p>
                </div>
                <img id="previewImage" alt="Preview da captura de tela">
                
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p>Processando captura de tela...</p>
                </div>
            </div>
            
            <div id="afterCapture" class="hidden">
                <button id="openGeminiBtn" class="btn btn-open">
                    <span>Abrir Gemini para Envio</span>
                </button>
                
                <div class="instructions">
                    <h3><i>ℹ️</i> Instruções de Envio</h3>
                    <p>Após abrir o Gemini, siga estes passos:</p>
                    <div class="steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-content">Clique na área de entrada de mensagem</div>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-content">Cole a imagem usando Ctrl+V (Windows) ou Cmd+V (Mac)</div>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-content">Adicione sua pergunta sobre a imagem se desejar</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">
                <i>🚀</i>
                <h2>Pré-visualização do Gemini</h2>
            </div>
            
            <p>Esta é uma simulação de como será o processo no Gemini após você colar a imagem capturada.</p>
            
            <div class="gemini-preview">
                <div class="gemini-header">
                    <div class="gemini-logo">G</div>
                    <div class="gemini-title">Gemini</div>
                </div>
                
                <div class="gemini-message">
                    <p>Olá! Sou o Gemini, sua IA do Google.</p>
                    <p>Você pode me enviar uma imagem e fazer perguntas sobre ela. Basta colar a imagem nesta área de conversa.</p>
                </div>
                
                <div class="preview-container" style="min-height: 200px; margin-top: 20px;">
                    <div class="placeholder">
                        <i>📎</i>
                        <p>Área para colar imagens</p>
                    </div>
                </div>
            </div>
            
            <div class="instructions">
                <h3><i>💡</i> Dicas Importantes</h3>
                <div class="steps">
                    <div class="step">
                        <div class="step-number">!</div>
                        <div class="step-content">O Gemini é gratuito e não requer login para uso básico</div>
                    </div>
                    <div class="step">
                        <div class="step-number">!</div>
                        <div class="step-content">Você pode fazer perguntas sobre a imagem após colá-la</div>
                    </div>
                    <div class="step">
                        <div class="step-number">!</div>
                        <div class="step-content">A imagem será analisada pela inteligência artificial do Google</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <footer>
        <p>Esta ferramenta não requer login ou chaves de API. Basta capturar e colar no Gemini!</p>
    </footer>
    
    <!-- Incluindo html2canvas de CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const captureBtn = document.getElementById('captureBtn');
            const openGeminiBtn = document.getElementById('openGeminiBtn');
            const previewImage = document.getElementById('previewImage');
            const placeholder = document.getElementById('placeholder');
            const afterCapture = document.getElementById('afterCapture');
            const loading = document.getElementById('loading');
            
            // URL base64 da imagem capturada
            let capturedImageData = null;
            
            // Capturar tela
            captureBtn.addEventListener('click', async function() {
                // Mostrar loading
                placeholder.classList.add('hidden');
                loading.style.display = 'flex';
                
                try {
                    // Capturar a tela com html2canvas
                    const canvas = await html2canvas(document.body, {
                        scale: 0.8,
                        useCORS: true,
                        logging: false
                    });
                    
                    // Converter para data URL
                    capturedImageData = canvas.toDataURL('image/jpeg', 0.85);
                    
                    // Exibir preview
                    previewImage.src = capturedImageData;
                    previewImage.style.display = 'block';
                    loading.style.display = 'none';
                    
                    // Mostrar botão de abrir Gemini
                    afterCapture.classList.remove('hidden');
                    
                    // Scroll para a imagem
                    previewImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                } catch (error) {
                    console.error('Erro na captura de tela:', error);
                    alert('Ocorreu um erro ao capturar a tela. Por favor, tente novamente.');
                    placeholder.classList.remove('hidden');
                    loading.style.display = 'none';
                }
            });
            
            // Abrir o Gemini
            openGeminiBtn.addEventListener('click', function() {
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
        });
    </script>
</body>
</html>
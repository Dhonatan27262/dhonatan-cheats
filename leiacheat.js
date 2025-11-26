<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leia-me Auto Cheat - Bookmarklet Corrigido</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: #1a2a6c;
            color: white;
            line-height: 1.6;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .container {
            max-width: 800px;
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        h1 {
            text-align: center;
            margin-bottom: 20px;
            color: #4cc9f0;
            font-size: 24px;
        }
        
        .instructions {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .step {
            margin-bottom: 15px;
            padding-left: 20px;
            position: relative;
        }
        
        .step:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #4cc9f0;
        }
        
        .bookmarklet-box {
            text-align: center;
            margin: 25px 0;
        }
        
        .bookmarklet-link {
            display: inline-block;
            background: #4cc9f0;
            color: white;
            padding: 12px 25px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            cursor: move;
            margin-bottom: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        }
        
        .bookmarklet-link:hover {
            background: #2a5298;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
        }
        
        .note {
            font-size: 14px;
            color: #a5b4fc;
            text-align: center;
            margin-top: 10px;
        }
        
        .warning {
            background: rgba(247, 37, 133, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f72585;
        }
        
        .code-container {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            overflow-x: auto;
        }
        
        pre {
            white-space: pre-wrap;
            font-size: 12px;
            color: #4cc9f0;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .container {
                padding: 15px;
            }
            
            h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Leia-me Auto Cheat - Bookmarklet Corrigido</h1>
        
        <div class="instructions">
            <h2>Como usar:</h2>
            <div class="step">Arraste o link abaixo para a barra de favoritos do seu navegador</div>
            <div class="step">Acesse a plataforma Leia-me/Odilo</div>
            <div class="step">Clique no favorito salvo para executar o script</div>
            <div class="step">Use a interface que aparecer no canto inferior direito</div>
        </div>
        
        <div class="bookmarklet-box">
            <a id="bookmarklet" href="javascript:(function() { var script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/gh/manorick/LeiaPRBypass@main/script.js'; document.body.appendChild(script); })();" class="bookmarklet-link">
                Leia-me Auto Cheat
            </a>
            <p class="note">Arraste este link para sua barra de favoritos</p>
        </div>
        
        <div class="warning">
            <strong>Importante:</strong> Este script funciona apenas na plataforma Odilo/Leia-me. 
            Use apenas para fins educacionais.
        </div>
        
        <div class="instructions">
            <h2>Instruções alternativas:</h2>
            <div class="step">1. Clique com o botão direito no link acima</div>
            <div class="step">2. Selecione "Adicionar aos favoritos" ou "Bookmark this link"</div>
            <div class="step">3. Quando estiver na plataforma Odilo/Leia-me, clique no favorito</div>
        </div>
        
        <div class="code-container">
            <h3>Código do Bookmarklet Corrigido:</h3>
            <pre>javascript:(function() {
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/gh/manorick/LeiaPRBypass@main/script.js';
  document.body.appendChild(script);
})();</pre>
        </div>
        
        <div class="warning">
            <strong>Nota:</strong> Se você está vendo apenas "📘 Leia-me Cheat 🦇 by @manorick Gemini Ollama ⚙️ Auto: OFF Aguardando" 
            sem botões, é porque o CSS não está carregando corretamente. O código acima foi corrigido para resolver esse problema.
        </div>
    </div>

    <script>
        // Função para facilitar o arrastar do bookmarklet
        document.getElementById('bookmarklet').addEventListener('click', function(e) {
            e.preventDefault();
            alert('Arraste este link para sua barra de favoritos, não clique diretamente.');
        });
    </script>
</body>
</html>
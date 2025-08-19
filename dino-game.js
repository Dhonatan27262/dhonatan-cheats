// dino-game.js
(function() {
    // Detecta se é um dispositivo móvel
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Cria o container principal do jogo
    const gameContainer = document.createElement('div');
    gameContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        touch-action: manipulation;
    `;
    
    // Cria o botão de fechar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar Jogo';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 30px;
        font-size: 16px;
        cursor: pointer;
        z-index: 1000001;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    closeBtn.onclick = () => {
        gameContainer.remove();
    };
    gameContainer.appendChild(closeBtn);
    
    // Cria o canvas do jogo
    const canvas = document.createElement('canvas');
    canvas.id = 'dinoCanvas';
    canvas.width = 800;
    canvas.height = 400;
    canvas.style.cssText = `
        background: #f7f7f7;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        max-width: 95%;
        touch-action: none;
    `;
    gameContainer.appendChild(canvas);
    
    // Cria o contador de pontuação
    const scoreElement = document.createElement('div');
    scoreElement.style.cssText = `
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin-top: 15px;
        background: rgba(0,0,0,0.5);
        padding: 5px 15px;
        border-radius: 20px;
    `;
    scoreElement.textContent = 'Score: 0';
    gameContainer.appendChild(scoreElement);
    
    // Cria o botão de pular para dispositivos móveis
    let jumpButton = null;
    if (isMobile) {
        jumpButton = document.createElement('button');
        jumpButton.textContent = 'pul';
        jumpButton.style.cssText = `
            position: absolute;
            bottom: 40px;
            right: 40px;
            width: 120px;
            height: 120px;
            background: rgba(66, 133, 244, 0.7);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000001;
            box-shadow: 0 6px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        gameContainer.appendChild(jumpButton);
    }
    
    // Adiciona ao documento
    document.body.appendChild(gameContainer);
    
    // Inicia o jogo
    const ctx = canvas.getContext('2d');
    const GAME_WIDTH = canvas.width;
    const GAME_HEIGHT = canvas.height;
    
    // Variáveis do jogo
    let gameRunning = true;
    let score = 0;
    let gameSpeed = 5;
    let gravity = 0.7;
    let obstacles = [];
    let clouds = [];
    let frames = 0;
    
    // Dino
    const dino = {
        x: 50,
        y: GAME_HEIGHT - 80,
        width: 50,
        height: 60,
        jumping: false,
        ducking: false,
        velocityY: 0,
        jumpPower: 15,
        
        draw() {
            ctx.fillStyle = '#202124';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Olhos
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x + 35, this.y + 15, 8, 8);
            
            // Sorriso
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y + 40);
            ctx.lineTo(this.x + 35, this.y + 40);
            ctx.stroke();
        },
        
        update() {
            if (this.jumping) {
                this.y -= this.velocityY;
                this.velocityY -= gravity;
                
                if (this.y >= GAME_HEIGHT - 80) {
                    this.y = GAME_HEIGHT - 80;
                    this.jumping = false;
                    this.velocityY = 0;
                }
            }
            
            if (this.ducking) {
                this.height = 30;
                this.y = GAME_HEIGHT - 50;
            } else {
                this.height = 60;
                this.y = GAME_HEIGHT - 80;
            }
        },
        
        jump() {
            if (!this.jumping) {
                this.jumping = true;
                this.velocityY = this.jumpPower;
                console.log('Dino pulou!'); // Debug
            }
        },
        
        duck() {
            this.ducking = true;
        },
        
        stand() {
            this.ducking = false;
        }
    };
    
    // Classe Obstáculo (Cacto)
    class Obstacle {
        constructor() {
            this.width = 25;
            this.height = 45 + Math.random() * 15;
            this.x = GAME_WIDTH;
            this.y = GAME_HEIGHT - this.height - 30;
            this.passed = false;
        }
        
        draw() {
            ctx.fillStyle = '#0a8043';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Espinhos
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x - 5, this.y + i * 15);
                ctx.lineTo(this.x + this.width + 5, this.y + i * 15);
                ctx.stroke();
            }
        }
        
        update() {
            this.x -= gameSpeed;
            
            // Verificar colisão
            if (
                dino.x < this.x + this.width &&
                dino.x + dino.width > this.x &&
                dino.y < this.y + this.height &&
                dino.y + dino.height > this.y
            ) {
                gameOver();
            }
            
            // Pontuar ao passar
            if (this.x + this.width < dino.x && !this.passed) {
                score++;
                scoreElement.textContent = `Score: ${score}`;
                this.passed = true;
                
                // Aumentar velocidade a cada 100 pontos
                if (score % 100 === 0) {
                    gameSpeed += 0.5;
                }
            }
        }
    }
    
    // Classe Nuvem
    class Cloud {
        constructor() {
            this.width = 60 + Math.random() * 40;
            this.height = 20 + Math.random() * 10;
            this.x = GAME_WIDTH;
            this.y = 50 + Math.random() * 150;
            this.speed = 0.5 + Math.random() * 0.5;
        }
        
        draw() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width/3, 0, Math.PI * 2);
            ctx.arc(this.x + this.width/3, this.y - this.height/2, this.width/4, 0, Math.PI * 2);
            ctx.arc(this.x + this.width/2, this.y, this.width/3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        update() {
            this.x -= this.speed;
        }
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        
        const gameOverElement = document.createElement('div');
        gameOverElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            text-align: center;
            z-index: 1000001;
            width: 80%;
            max-width: 400px;
        `;
        
        gameOverElement.innerHTML = `
            <h2 style="color: #ff5252; margin-bottom: 15px; font-size: 28px;">Game Over!</h2>
            <p>Você bateu em um cacto</p>
            <div style="margin: 20px 0; font-size: 24px;">Pontuação: ${score}</div>
            <button id="restartBtn" style="
                background: #4285F4;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 30px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            ">Jogar Novamente</button>
        `;
        
        gameContainer.appendChild(gameOverElement);
        
        document.getElementById('restartBtn').onclick = () => {
            gameOverElement.remove();
            startGame();
        };
    }
    
    // Funções do jogo
    function startGame() {
        gameRunning = true;
        score = 0;
        gameSpeed = 5;
        obstacles = [];
        clouds = [];
        frames = 0;
        scoreElement.textContent = `Score: ${score}`;
        
        dino.jumping = false;
        dino.ducking = false;
        dino.y = GAME_HEIGHT - 80;
        dino.velocityY = 0;
        
        gameLoop();
    }
    
    function createObstacle() {
        if (frames % 100 === 0) {
            obstacles.push(new Obstacle());
        }
    }
    
    function createCloud() {
        if (frames % 70 === 0) {
            clouds.push(new Cloud());
        }
    }
    
    function drawBackground() {
        // Céu
        ctx.fillStyle = '#a3d9ff';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT - 30);
        
        // Sol
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(700, 70, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Montanhas ao fundo
        ctx.fillStyle = '#8daa9a';
        ctx.beginPath();
        ctx.moveTo(0, GAME_HEIGHT - 100);
        ctx.lineTo(150, GAME_HEIGHT - 200);
        ctx.lineTo(300, GAME_HEIGHT - 100);
        ctx.lineTo(450, GAME_HEIGHT - 220);
        ctx.lineTo(600, GAME_HEIGHT - 100);
        ctx.lineTo(800, GAME_HEIGHT - 180);
        ctx.lineTo(800, GAME_HEIGHT - 30);
        ctx.lineTo(0, GAME_HEIGHT - 30);
        ctx.fill();
        
        // Chão
        ctx.fillStyle = '#5a3921';
        ctx.fillRect(0, GAME_HEIGHT - 30, GAME_WIDTH, 30);
        
        // Textura do chão
        ctx.fillStyle = '#7a5a3b';
        for (let i = 0; i < GAME_WIDTH; i += 20) {
            ctx.fillRect(i, GAME_HEIGHT - 30, 10, 5);
        }
    }
    
    function gameLoop() {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        if (gameRunning) {
            // Desenhar fundo
            drawBackground();
            
            // Atualizar e desenhar nuvens
            createCloud();
            clouds.forEach((cloud, index) => {
                cloud.update();
                cloud.draw();
                
                // Remover nuvens que saíram da tela
                if (cloud.x + cloud.width < 0) {
                    clouds.splice(index, 1);
                }
            });
            
            // Atualizar e desenhar dino
            dino.update();
            dino.draw();
            
            // Criar e atualizar obstáculos
            createObstacle();
            obstacles.forEach((obstacle, index) => {
                obstacle.update();
                obstacle.draw();
                
                // Remover obstáculos que saíram da tela
                if (obstacle.x + obstacle.width < 0) {
                    obstacles.splice(index, 1);
                }
            });
            
            // Incrementar frames
            frames++;
            
            // Continuar o loop
            requestAnimationFrame(gameLoop);
        }
    }
    
    // Controles de teclado
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        if ((e.code === 'Space' || e.key === 'ArrowUp') && !dino.jumping) {
            dino.jump();
        }
        
        if (e.key === 'ArrowDown') {
            dino.duck();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowDown') {
            dino.stand();
        }
    });
    
    // Função simplificada para tratar toques
    function handleJump() {
        if (!gameRunning) return;
        if (!dino.jumping) {
            dino.jump();
        }
    }
    
    // Adiciona os listeners de toque no canvas
    canvas.addEventListener('touchstart', function(e) {
        handleJump();
        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('click', function(e) {
        handleJump();
        e.preventDefault();
    });
    
    // Adiciona evento de toque no botão de pular (se existir)
    if (jumpButton) {
        jumpButton.addEventListener('touchstart', function(e) {
            handleJump();
            e.preventDefault();
        }, { passive: false });
        
        jumpButton.addEventListener('click', function(e) {
            handleJump();
            e.preventDefault();
        });
    }
    
    // Adiciona evento de toque no container (para áreas fora do canvas)
    gameContainer.addEventListener('touchstart', function(e) {
        // Só permite pulo se não for em botões (exceto o botão de pular)
        if (!e.target.closest('button') || e.target === jumpButton) {
            handleJump();
            e.preventDefault();
        }
    }, { passive: false });
    
    // Iniciar o jogo
    startGame();
})();
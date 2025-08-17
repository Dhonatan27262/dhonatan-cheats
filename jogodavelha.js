// jogodavelha.js
(function() {
    // Variáveis globais
    let currentPlayer, gameMode, difficulty, playerSymbol;
    let board = Array(9).fill('');
    let gameActive = false;
    
    // Elementos da interface
    const gameContainer = document.createElement('div');
    const menuContainer = document.createElement('div');
    
    // Estilos gerais
    const applyStyles = () => {
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#fff';
        document.body.style.fontFamily = 'Arial, sans-serif';
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';
        document.body.style.padding = '20px';
        document.body.style.boxSizing = 'border-box';
        
        gameContainer.style.display = 'flex';
        gameContainer.style.flexDirection = 'column';
        gameContainer.style.alignItems = 'center';
        gameContainer.style.gap = '20px';
        
        menuContainer.style.display = 'flex';
        menuContainer.style.flexDirection = 'column';
        menuContainer.style.alignItems = 'center';
        menuContainer.style.gap = '15px';
        menuContainer.style.padding = '30px';
        menuContainer.style.backgroundColor = '#1e1e1e';
        menuContainer.style.borderRadius = '15px';
        menuContainer.style.boxShadow = '0 8px 25px rgba(0,0,0,0.5)';
    };
    
    // Cria botões estilizados
    const createStyledButton = (text, onClick, color = '#4CAF50') => {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.padding = '12px 25px';
        button.style.fontSize = '16px';
        button.style.border = 'none';
        button.style.borderRadius = '30px';
        button.style.cursor = 'pointer';
        button.style.backgroundColor = color;
        button.style.color = 'white';
        button.style.fontWeight = 'bold';
        button.style.transition = 'all 0.3s';
        button.style.width = '220px';
        button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        
        button.onmouseover = () => button.style.transform = 'scale(1.05)';
        button.onmouseout = () => button.style.transform = 'scale(1)';
        button.onclick = onClick;
        
        return button;
    };
    
    // Menu principal
    const showMainMenu = () => {
        menuContainer.innerHTML = '';
        
        const title = document.createElement('h1');
        title.textContent = '🎮 Jogo da Velha';
        title.style.color = '#4CAF50';
        title.style.marginBottom = '30px';
        
        const vsFriendBtn = createStyledButton('Jogar com Amigo', startFriendGame);
        const vsIABtn = createStyledButton('Jogar contra IA', showIAMenu);
        
        menuContainer.appendChild(title);
        menuContainer.appendChild(vsFriendBtn);
        menuContainer.appendChild(vsIABtn);
    };
    
    // Menu IA
    const showIAMenu = () => {
        menuContainer.innerHTML = '';
        
        const title = document.createElement('h1');
        title.textContent = '🔮 Nível de Dificuldade';
        title.style.color = '#FF9800';
        title.style.marginBottom = '20px';
        
        const easyBtn = createStyledButton('Fácil', () => showSymbolSelection('fácil'), '#4CAF50');
        const mediumBtn = createStyledButton('Médio', () => showSymbolSelection('médio'), '#FF9800');
        const hardBtn = createStyledButton('Difícil', () => showSymbolSelection('difícil'), '#F44336');
        const backBtn = createStyledButton('Voltar', showMainMenu, '#9E9E9E');
        
        menuContainer.appendChild(title);
        menuContainer.appendChild(easyBtn);
        menuContainer.appendChild(mediumBtn);
        menuContainer.appendChild(hardBtn);
        menuContainer.appendChild(backBtn);
    };
    
    // Seleção de símbolo
    const showSymbolSelection = (selectedDifficulty) => {
        difficulty = selectedDifficulty;
        menuContainer.innerHTML = '';
        
        const title = document.createElement('h1');
        title.textContent = '❌ ou ⭕';
        title.style.marginBottom = '20px';
        
        const symbolTitle = document.createElement('h2');
        symbolTitle.textContent = 'Escolha seu símbolo:';
        symbolTitle.style.marginBottom = '10px';
        
        const xBtn = createStyledButton('❌ (X)', () => startIAGame('X'), '#2196F3');
        const oBtn = createStyledButton('⭕ (O)', () => startIAGame('O'), '#FF5722');
        const backBtn = createStyledButton('Voltar', showIAMenu, '#9E9E9E');
        
        menuContainer.appendChild(title);
        menuContainer.appendChild(symbolTitle);
        menuContainer.appendChild(xBtn);
        menuContainer.appendChild(oBtn);
        menuContainer.appendChild(backBtn);
    };
    
    // Inicia jogo com amigo
    const startFriendGame = () => {
        gameMode = 'friend';
        playerSymbol = 'X';
        initializeGame();
    };
    
    // Inicia jogo com IA
    const startIAGame = (symbol) => {
        gameMode = 'ai';
        playerSymbol = symbol;
        initializeGame();
    };
    
    // Inicializa o jogo
    const initializeGame = () => {
        // Resetar variáveis
        board = Array(9).fill('');
        currentPlayer = 'X';
        gameActive = true;
        
        // Limpar containers
        menuContainer.style.display = 'none';
        gameContainer.innerHTML = '';
        
        // Criar título do jogo
        const gameTitle = document.createElement('h1');
        gameTitle.textContent = gameMode === 'friend' ? 'Jogo da Velha - 2 Jogadores' : `Jogo da Velha - IA (${difficulty})`;
        gameTitle.style.color = '#4CAF50';
        gameTitle.style.marginBottom = '10px';
        
        // Criar display do jogador atual
        const playerDisplay = document.createElement('div');
        playerDisplay.id = 'playerDisplay';
        playerDisplay.textContent = `Vez do jogador: ${currentPlayer}`;
        playerDisplay.style.fontSize = '18px';
        playerDisplay.style.marginBottom = '20px';
        
        // Criar tabuleiro
        const boardContainer = document.createElement('div');
        boardContainer.style.display = 'grid';
        boardContainer.style.gridTemplateColumns = 'repeat(3, 100px)';
        boardContainer.style.gridGap = '10px';
        boardContainer.style.marginBottom = '20px';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.dataset.index = i;
            cell.style.width = '100px';
            cell.style.height = '100px';
            cell.style.backgroundColor = '#2c2c2c';
            cell.style.borderRadius = '10px';
            cell.style.display = 'flex';
            cell.style.justifyContent = 'center';
            cell.style.alignItems = 'center';
            cell.style.fontSize = '40px';
            cell.style.cursor = 'pointer';
            cell.style.transition = 'all 0.2s';
            
            cell.onmouseover = () => {
                if (gameActive && board[i] === '') {
                    cell.style.backgroundColor = '#3a3a3a';
                }
            };
            
            cell.onmouseout = () => {
                if (board[i] === '') {
                    cell.style.backgroundColor = '#2c2c2c';
                }
            };
            
            cell.onclick = () => handleCellClick(i);
            
            boardContainer.appendChild(cell);
        }
        
        // Botões de controle
        const restartBtn = createStyledButton('Reiniciar Jogo', initializeGame, '#2196F3');
        const menuBtn = createStyledButton('Voltar ao Menu', () => {
            gameContainer.innerHTML = '';
            menuContainer.style.display = 'flex';
            showMainMenu();
        }, '#9E9E9E');
        
        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.gap = '15px';
        controlsContainer.appendChild(restartBtn);
        controlsContainer.appendChild(menuBtn);
        
        // Montar interface
        gameContainer.appendChild(gameTitle);
        gameContainer.appendChild(playerDisplay);
        gameContainer.appendChild(boardContainer);
        gameContainer.appendChild(controlsContainer);
        
        // Se for IA e jogador escolheu O, IA começa
        if (gameMode === 'ai' && playerSymbol === 'O') {
            setTimeout(makeAIMove, 500);
        }
    };
    
    // Manipula clique na célula
    const handleCellClick = (index) => {
        if (!gameActive || board[index] !== '') return;
        
        // Atualizar tabuleiro
        board[index] = currentPlayer;
        document.querySelector(`[data-index="${index}"]`).textContent = currentPlayer;
        
        // Verificar vitória/empate
        const winner = checkWinner();
        if (winner) {
            endGame(winner);
            return;
        }
        
        // Mudar jogador
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('playerDisplay').textContent = `Vez do jogador: ${currentPlayer}`;
        
        // Se for modo IA, fazer jogada da IA
        if (gameActive && gameMode === 'ai' && currentPlayer !== playerSymbol) {
            setTimeout(makeAIMove, 500);
        }
    };
    
    // Faz jogada da IA
    const makeAIMove = () => {
        if (!gameActive) return;
        
        let move;
        switch (difficulty) {
            case 'fácil':
                move = getRandomMove();
                break;
            case 'médio':
                move = getMediumMove();
                break;
            case 'difícil':
                move = getBestMove();
                break;
            default:
                move = getRandomMove();
        }
        
        if (move !== null) {
            board[move] = currentPlayer;
            document.querySelector(`[data-index="${move}"]`).textContent = currentPlayer;
            
            const winner = checkWinner();
            if (winner) {
                endGame(winner);
                return;
            }
            
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            document.getElementById('playerDisplay').textContent = `Vez do jogador: ${currentPlayer}`;
        }
    };
    
    // Movimento aleatório (fácil)
    const getRandomMove = () => {
        const emptyCells = board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);
        
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    };
    
    // Movimento médio (tenta vencer ou bloquear)
    const getMediumMove = () => {
        // Tentar vencer
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = currentPlayer;
                if (checkWinner() === currentPlayer) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        
        // Tentar bloquear o jogador
        const opponent = currentPlayer === 'X' ? 'O' : 'X';
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = opponent;
                if (checkWinner() === opponent) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        
        // Movimento aleatório
        return getRandomMove();
    };
    
    // Movimento perfeito (difícil) - Algoritmo Minimax
    const getBestMove = () => {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = currentPlayer;
                const score = minimax(board, 0, false);
                board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    };
    
    // Algoritmo Minimax
    const minimax = (board, depth, isMaximizing) => {
        const winner = checkWinner();
        if (winner === currentPlayer) return 10 - depth;
        if (winner === (currentPlayer === 'X' ? 'O' : 'X')) return depth - 10;
        if (winner === 'draw') return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = currentPlayer;
                    const score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = currentPlayer === 'X' ? 'O' : 'X';
                    const score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };
    
    // Verifica vencedor
    const checkWinner = () => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
            [0, 4, 8], [2, 4, 6]             // diagonais
        ];
        
        // Verificar vitória
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        // Verificar empate
        if (!board.includes('')) {
            return 'draw';
        }
        
        return null;
    };
    
    // Finaliza o jogo
    const endGame = (winner) => {
        gameActive = false;
        const playerDisplay = document.getElementById('playerDisplay');
        
        if (winner === 'draw') {
            playerDisplay.textContent = 'Empate!';
            playerDisplay.style.color = '#FF9800';
        } else {
            const winnerName = gameMode === 'friend' 
                ? `Jogador ${winner} venceu!` 
                : winner === playerSymbol ? 'Você venceu!' : 'IA venceu!';
            
            playerDisplay.textContent = winnerName;
            playerDisplay.style.color = winner === playerSymbol ? '#4CAF50' : '#F44336';
        }
    };
    
    // Inicializa o jogo
    const init = () => {
        applyStyles();
        showMainMenu();
        
        // Montar containers
        document.body.appendChild(menuContainer);
        document.body.appendChild(gameContainer);
    };
    
    // Iniciar quando o script for carregado
    init();
})();
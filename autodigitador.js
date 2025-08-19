// autodigitador.js
function criarBotaoFlutuante() {
    const btn = document.createElement('button');
    btn.innerHTML = '✍️';
    btn.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #007bff;
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    btn.addEventListener('click', iniciarMod);
    document.body.appendChild(btn);
}

function iniciarMod() {
    alert("✍️ Toque no campo onde deseja digitar o texto.");
    const handler = (e) => {
        e.preventDefault();
        document.removeEventListener('click', handler, true);
        const el = e.target;
        
        if (!(el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            alert("❌ Esse não é um campo válido.");
            criarBotaoFlutuante();
            return;
        }

        // Modal para colar o texto
        const modalTexto = document.createElement('div');
        modalTexto.style = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 9999999;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
            min-width: 300px;
        `;

        modalTexto.innerHTML = `
            <h3 style="margin-top: 0;">📋 Cole seu texto:</h3>
            <textarea 
                id="textoInput" 
                style="
                    width: 100%;
                    height: 150px;
                    margin-bottom: 15px;
                    padding: 10px;
                    box-sizing: border-box;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    resize: vertical;
                "
                placeholder="Cole ou digite o texto aqui..."
            ></textarea>
            <div style="display: flex; justify-content: space-between;">
                <button id="cancelarBtn" style="padding: 8px 16px;">Cancelar</button>
                <button id="confirmarBtn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px;">OK</button>
            </div>
        `;

        document.body.appendChild(modalTexto);

        // Modal para selecionar velocidade
        const criarModalVelocidade = () => {
            const modalVel = document.createElement('div');
            modalVel.style = modalTexto.style;
            modalVel.innerHTML = `
                <h3 style="margin-top: 0;">⏱️ Selecione a velocidade:</h3>
                <div style="margin-bottom: 15px;">
                    <input type="radio" name="velocidade" value="100" id="lento">
                    <label for="lento">Lento (100ms)</label><br>
                    
                    <input type="radio" name="velocidade" value="60" id="medio">
                    <label for="medio">Médio (60ms)</label><br>
                    
                    <input type="radio" name="velocidade" value="40" id="rapido" checked>
                    <label for="rapido">Rápido (40ms)</label><br>
                    
                    <input type="radio" name="velocidade" value="20" id="muitoRapido">
                    <label for="muitoRapido">Muito Rápido (20ms)</label>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button id="iniciarBtn" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 5px;">Iniciar</button>
                </div>
            `;
            document.body.appendChild(modalVel);
            return modalVel;
        };

        // Event listeners para o modal de texto
        document.getElementById('cancelarBtn').addEventListener('click', () => {
            modalTexto.remove();
            criarBotaoFlutuante();
        });

        document.getElementById('confirmarBtn').addEventListener('click', () => {
            const texto = document.getElementById('textoInput').value.trim();
            if (!texto) {
                alert('Por favor, insira algum texto');
                return;
            }
            modalTexto.remove();
            
            const modalVelocidade = criarModalVelocidade();
            
            document.getElementById('iniciarBtn').addEventListener('click', () => {
                const velocidade = parseInt(
                    document.querySelector('input[name="velocidade"]:checked').value
                );
                modalVelocidade.remove();
                iniciarDigitacao(el, texto, velocidade);
            });
        });
    };
    document.addEventListener('click', handler, true);
}

function iniciarDigitacao(el, texto, velocidade) {
    el.focus();
    let i = 0;
    const progresso = document.createElement('div');
    Object.assign(progresso.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        zIndex: 9999999,
        fontSize: '20px'
    });
    document.body.appendChild(progresso);

    const intervalo = setInterval(() => {
        if (i < texto.length) {
            const c = texto[i++];
            document.execCommand('insertText', false, c);
            progresso.textContent = `${Math.round((i / texto.length) * 100)}%`;
        } else {
            clearInterval(intervalo);
            progresso.remove();
            el.blur();
            
            setTimeout(() => {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                
                const msg = document.createElement('div');
                msg.textContent = "✅ Texto digitado com sucesso!";
                Object.assign(msg.style, {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#000',
                    color: '#0f0',
                    padding: '15px',
                    borderRadius: '10px',
                    fontSize: '18px',
                    zIndex: 9999999,
                    fontWeight: 'bold',
                    textAlign: 'center'
                });
                document.body.appendChild(msg);
                setTimeout(() => {
                    msg.remove();
                    criarBotaoFlutuante();
                }, 3000);
            }, 100);
        }
    }, velocidade);
}

// Inicializar o botão quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', criarBotaoFlutuante);
} else {
    criarBotaoFlutuante();
}
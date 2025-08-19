// Função principal para iniciar o modo de digitação automática
const iniciarModV2 = () => {
    alert("✍️ Toque no campo onde deseja digitar o texto.");
    
    const handler = (e) => {
        e.preventDefault();
        document.removeEventListener('click', handler, true);
        
        const el = e.target;
        if (!(el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            alert("❌ Esse não é um campo válido.");
            return;
        }

        // Criar modal para entrada de texto e seleção de velocidade
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10001;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
            min-width: 350px;
            max-width: 90%;
            font-family: Arial, sans-serif;
        `;
        
        // Conteúdo do modal
        modal.innerHTML = `
            <h2 style="margin-top: 0; color: #2c3e50;">📋 Digitador Auto V2</h2>
            <textarea 
                id="textoInput" 
                placeholder="Digite ou cole o texto aqui..." 
                style="
                    width: 100%;
                    height: 150px;
                    margin-bottom: 15px;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    resize: vertical;
                    font-family: Arial, sans-serif;
                "
            ></textarea>
            
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2c3e50;">Velocidade de digitação:</label>
            <select id="velocidade" style="
                width: 100%;
                padding: 8px;
                margin-bottom: 15px;
                border: 1px solid #ccc;
                border-radius: 5px;
                background: white;
            ">
                <option value="100">Muito Devagar</option>
                <option value="60" selected>Devagar</option>
                <option value="40">Normal</option>
                <option value="20">Rápido</option>
                <option value="10">Muito Rápido</option>
            </select>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end">
                <button id="cancelarBtn" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancelar</button>
                <button id="confirmarBtn" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Iniciar</button>
            </div>
        `;
        
        // Adicionar evento para o botão cancelar
        modal.querySelector('#cancelarBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Adicionar evento para o botão confirmar
        modal.querySelector('#confirmarBtn').addEventListener('click', () => {
            const texto = modal.querySelector('#textoInput').value;
            const velocidade = parseInt(modal.querySelector('#velocidade').value);
            
            if (!texto) {
                alert("❌ Por favor, digite ou cole algum texto.");
                return;
            }
            
            document.body.removeChild(modal);
            iniciarDigitacao(el, texto, velocidade);
        });
        
        // Adicionar modal ao documento
        document.body.appendChild(modal);
    };

    document.addEventListener('click', handler, true);
};

// Função para iniciar a digitação automática (baseada no código original)
const iniciarDigitacao = (el, texto, velocidade) => {
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
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif'
    });
    
    document.body.appendChild(progresso);

    const intervalo = setInterval(() => {
        if (i < texto.length) {
            const c = texto[i++];
            document.execCommand('insertText', false, c);  // insere texto como se fosse teclado
            progresso.textContent = `${Math.round(i / texto.length * 100)}%`;
        } else {
            clearInterval(intervalo);
            progresso.remove();
            el.blur();  // fechar
            
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
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif'
                });
                
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 3000);
            }, 100);
        }
    }, velocidade);
};

// Iniciar a aplicação quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarModV2);
} else {
    iniciarModV2();
}
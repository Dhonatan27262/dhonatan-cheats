// senhas.js - Nova versão corrigida
window.verificarSenha = function(senha) {
    const senhasValidas = [
        "admin"
    ];
    // Verifica a senha exatamente como digitada (case sensitive)
    return senhasValidas.includes(senha);
};
// senhas.js - Nova versão corrigida
window.verificarSenha = function(senha) {
    const senhasValidas = [
        "admin",
        "Teste24",
        "adm",
        "tainara",
        "vitor",
        "pablo",
        "rafael",
        "Teste123",
        "Maca1",
        "123",
        "Te",
        "ta"
    ];
    // Verifica a senha exatamente como digitada (case sensitive)
    return senhasValidas.includes(senha);
};
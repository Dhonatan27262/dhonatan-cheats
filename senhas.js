// senhas.js - Nova versão corrigida
window.verificarSenha = function(senha) {
    const senhasValidas = [
        "tainara",
        "013179",
        "mateus4299",//18do12
        "123",
        "1911"//vitalicio
];
    // Verifica a senha exatamente como digitada (case sensitive)
    return senhasValidas.includes(senha);
};
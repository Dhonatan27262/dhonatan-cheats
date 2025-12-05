// senhas.js - Nova versão corrigida
window.verificarSenha = function(senha) {
    const senhasValidas = [
        "tainara",
        "013179",
        "juregps2",//8do12
        "1911",//vitalicio
        "A10121605"//8do12
];
    // Verifica a senha exatamente como digitada (case sensitive)
    return senhasValidas.includes(senha);
};
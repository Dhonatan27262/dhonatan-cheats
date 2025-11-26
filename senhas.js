// senhas.js - Nova versão corrigida
window.verificarSenha = function(senha) {
    const senhasValidas = [
        "tainara",
        "rick",
        "013179",
        "Victor30012010",//03do12
        "lacerda22"//29d11
];
    // Verifica a senha exatamente como digitada (case sensitive)
    return senhasValidas.includes(senha);
};
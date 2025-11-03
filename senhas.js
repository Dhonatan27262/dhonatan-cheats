// senhas.js - Nova versão corrigida
window.verificarSenha = function(senha) {
    const senhasValidas = [
        "tainara",
        "rick",
        "013179",
        "#Neymar10",//0401102025
        "1537",//10do11de2025
        "Mkff0000",//08do11
        "lacerda22"//29d11
];
    // Verifica a senha exatamente como digitada (case sensitive)
    return senhasValidas.includes(senha);
};
// ATENÇÃO: Deve ser EXATAMENTE este formato
window.verificarSenha = function(senha) {
    // Mantenha todas as senhas em minúsculas para evitar problemas
    const senhasValidas = [
        "admin",
        "adm",
        "tainara",
        "vitor",
        "pablo",
        "rafael",
        "Teste123",  
        "ta"// Adicione novas aqui
    ];
    // Converte para minúsculas antes de verificar
    return senhasValidas.includes(senha.toLowerCase());
};
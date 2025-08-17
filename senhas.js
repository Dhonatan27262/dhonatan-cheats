// ATENÇÃO: Deve ser EXATAMENTE este formato
window.verificarSenha = function(senha) {
    // Mantenha todas as senhas em minúsculas para evitar problemas
    const senhasValidas = [
        "admin",
        "tainara",
        "ggg",
        "vitor",
        "pablo",
        "rafael",
        "adm",
        "novasenha",  
        "put"// Adicione novas aqui
    ];
    // Converte para minúsculas antes de verificar
    return senhasValidas.includes(senha.toLowerCase());
};
(function(){
    // Pergunta se o usuário quer ativar o SafeSearch
    let ativar = confirm("Deseja ativar o SafeSearch?");
    
    if (ativar) {
        // Abre o Google com SafeSearch ativado
        window.location.href = "https://www.google.com/?safe=active";
    } else {
        // Abre o Google normal (sem SafeSearch)
        window.location.href = "https://www.google.com/";
    }
})();

(function(){
    // Pega a pesquisa atual (se houver) ou pergunta ao usuário
    let query = prompt("Digite o que deseja pesquisar (SafeSearch ON):", "");
    
    if(query){
        // Redireciona com SafeSearch ativado
        window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(query) + "&safe=active";
    } else {
        // Se não digitar nada, abre só o Google com SafeSearch
        window.location.href = "https://www.google.com/?safe=active";
    }
})();
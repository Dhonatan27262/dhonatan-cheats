(function(){
    // Cria o menu
    let menu = document.createElement("div");
    menu.style.position = "fixed";
    menu.style.top = "20px";
    menu.style.right = "20px";
    menu.style.background = "white";
    menu.style.border = "2px solid #000";
    menu.style.borderRadius = "8px";
    menu.style.padding = "10px";
    menu.style.zIndex = "999999";
    menu.style.fontFamily = "Arial, sans-serif";
    menu.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.3)";
    
    // Título
    let titulo = document.createElement("div");
    titulo.innerText = "📌 Menu";
    titulo.style.fontWeight = "bold";
    titulo.style.marginBottom = "8px";
    menu.appendChild(titulo);

    // Botão SafeSearch
    let btnSafe = document.createElement("button");
    btnSafe.innerText = "🔒 Abrir SafeSearch";
    btnSafe.style.display = "block";
    btnSafe.style.width = "100%";
    btnSafe.style.marginBottom = "6px";
    btnSafe.style.padding = "6px";
    btnSafe.style.cursor = "pointer";
    btnSafe.onclick = function(){
        window.location.href = "https://www.google.com/?safe=active";
    };
    menu.appendChild(btnSafe);

    // Botão fechar menu
    let btnClose = document.createElement("button");
    btnClose.innerText = "❌ Fechar Menu";
    btnClose.style.display = "block";
    btnClose.style.width = "100%";
    btnClose.style.padding = "6px";
    btnClose.style.cursor = "pointer";
    btnClose.onclick = function(){
        document.body.removeChild(menu);
    };
    menu.appendChild(btnClose);

    // Adiciona o menu na página
    document.body.appendChild(menu);
})();

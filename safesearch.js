// === Adiciona html2canvas ao documento ===
(function() {
  if (!window.html2canvas) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.onload = () => initCaptureMenu();
    document.head.appendChild(script);
  } else {
    initCaptureMenu();
  }
})();

// === Função principal para criar menu ===
function initCaptureMenu() {
  const menu = document.createElement('div');
  menu.style.position = 'fixed';
  menu.style.top = '20px';
  menu.style.right = '20px';
  menu.style.background = 'rgba(0,0,0,0.8)';
  menu.style.color = 'white';
  menu.style.padding = '15px';
  menu.style.borderRadius = '10px';
  menu.style.zIndex = 9999;
  menu.style.fontFamily = 'Arial, sans-serif';
  menu.style.boxShadow = '0px 0px 10px black';

  const title = document.createElement('div');
  title.textContent = 'Menu IA';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '10px';
  menu.appendChild(title);

  const btn = document.createElement('button');
  btn.textContent = 'Buscar Resposta';
  btn.style.padding = '10px';
  btn.style.border = 'none';
  btn.style.borderRadius = '5px';
  btn.style.background = '#4CAF50';
  btn.style.color = 'white';
  btn.style.cursor = 'pointer';

  btn.onclick = async () => {
    try {
      // Captura toda a página
      const canvas = await html2canvas(document.body);
      const dataUrl = canvas.toDataURL('image/png');

      // Abre nova aba com a imagem
      const win = window.open();
      win.document.write('<h2>Imagem Capturada:</h2>');
      win.document.write('<img src="' + dataUrl + '" style="max-width:100%;"/>');
      alert('Página capturada! Agora você pode copiar a imagem e enviar para a IA.');
    } catch (e) {
      alert('Erro ao capturar a página: ' + e);
      console.error(e);
    }
  };

  menu.appendChild(btn);
  document.body.appendChild(menu);

  // === Permite arrastar o menu ===
  let isDragging = false, offsetX, offsetY;
  menu.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - menu.offsetLeft;
    offsetY = e.clientY - menu.offsetTop;
  });
  document.addEventListener('mousemove', e => {
    if (isDragging) {
      menu.style.left = e.clientX - offsetX + 'px';
      menu.style.top = e.clientY - offsetY + 'px';
    }
  });
  document.addEventListener('mouseup', () => isDragging = false);
}
function createMenuNoAPI() {
  const menu = document.createElement('div');
  menu.style.position = 'fixed';
  menu.style.top = '20px';
  menu.style.right = '20px';
  menu.style.background = 'rgba(0,0,0,0.8)';
  menu.style.color = 'white';
  menu.style.padding = '15px';
  menu.style.borderRadius = '10px';
  menu.style.zIndex = 9999;

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
      const stream = await navigator.mediaDevices.getDisplayMedia({video: {mediaSource:'screen'}});
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap,0,0);
      const dataUrl = canvas.toDataURL('image/png');
      track.stop();

      // Abrir Perplexity em nova aba
      const win = window.open('https://www.perplexity.ai/', '_blank');
      alert('Captura feita! Cole a imagem ou pergunta no site da IA.');
    } catch(e) {
      alert('Erro ao capturar tela: ' + e);
    }
  };

  menu.appendChild(btn);
  document.body.appendChild(menu);
}

createMenuNoAPI();
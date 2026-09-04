(() => {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    try {
      const url = args[0] instanceof Request ? args[0].url : String(args[0]);

      if (/assessment|problem|exercise|question/i.test(url)) {
        const clone = response.clone();
        const text = await clone.text();

        try {
          const data = JSON.parse(text);

          console.log("========== KHAN REQUEST ==========");
          console.log("URL:", url);
          console.log("Dados recebidos:", data);
          console.log("==================================");
        } catch {
          console.log("Resposta não-JSON:", url, text.slice(0, 2000));
        }
      }
    } catch (e) {
      console.log("Erro ao inspecionar:", e);
    }

    return response;
  };

  console.log("🔎 Monitor de questões ativado.");
})();
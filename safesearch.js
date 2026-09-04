(() => {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    try {
      const url = args[0] instanceof Request ? args[0].url : String(args[0]);

      if (/assessment|problem|exercise/i.test(url)) {
        const clone = response.clone();
        const text = await clone.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.log("Resposta não-JSON:", url, text.slice(0, 2000));
          return response;
        }

        console.group("🔎 KHAN DEBUG");
        console.log("URL:", url);
        console.log("Resposta completa:", data);

        // Mostra todos os caminhos existentes no objeto
        const paths = [];

        function walk(obj, path = "") {
          if (!obj || typeof obj !== "object") return;

          for (const key of Object.keys(obj)) {
            const current = path ? `${path}.${key}` : key;
            paths.push(current);

            if (obj[key] && typeof obj[key] === "object") {
              walk(obj[key], current);
            }
          }
        }

        walk(data);

        console.log("📂 Caminhos encontrados:");
        console.table(paths.map(path => ({ path })));

        console.groupEnd();
      }
    } catch (err) {
      console.error("Erro no debugger:", err);
    }

    return response;
  };

  console.log("✅ Debugger ativado. Abra/recarregue uma questão.");
})();
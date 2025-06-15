document.getElementById("factCheckBtn").addEventListener("click", async () => {
    chrome.tabs.executeScript(
      {
        code: "window.getSelection().toString();"
      },
      async (selection) => {
        const text = selection[0];
        if (!text) {
          document.getElementById("result").textContent = "⚠️ No text highlighted.";
          return;
        }
  
        document.getElementById("result").textContent = "🧠 Checking facts...";
  
        try {
          const response = await fetch("http://127.0.0.1:5000/fact_check", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
          });
  
          const data = await response.json();
  
          if (data && data.result) {
            document.getElementById("result").textContent = "✅ " + data.result;
          } else {
            document.getElementById("result").textContent = "❌ Could not fact check this.";
          }
        } catch (error) {
          document.getElementById("result").textContent = "❌ Error connecting to server.";
        }
      }
    );
  });
  
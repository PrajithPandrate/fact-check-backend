chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "factCheck",
      title: "🧠 Fact Check",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "factCheck") {
      const selectedText = info.selectionText;
  
      fetch('http://127.0.0.1:5000/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: selectedText }),
      })
        .then(async res => {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            const msg = `✅ Fact Check Result: ${data.result}`;
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: alertUser,
              args: [msg]
            });
          } catch (e) {
            throw new Error("Invalid JSON response: " + text);
          }
        })
        .catch(err => {
          console.error("Fact check failed:", err);
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: alertUser,
            args: ["❌ Could not fact check this."]
          });
        });
    }
  });
  
  function alertUser(message) {
    alert(message);
  }
  
document.addEventListener("mouseup", function () {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;
  
    // Remove any existing tooltip
    const oldTooltip = document.getElementById("fact-check-tooltip");
    if (oldTooltip) oldTooltip.remove();
  
    // Create tooltip button
    const tooltip = document.createElement("button");
    tooltip.id = "fact-check-tooltip";
    tooltip.innerText = "🔍 Fact Check";
    tooltip.style.position = "absolute";
    tooltip.style.top = `${window.scrollY + event.pageY}px`;
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.zIndex = "9999";
    tooltip.style.backgroundColor = "#fefefe";
    tooltip.style.border = "1px solid #ccc";
    tooltip.style.padding = "6px";
    tooltip.style.borderRadius = "6px";
    tooltip.style.cursor = "pointer";
  
    tooltip.onclick = () => {
      fetch("http://localhost:5000/fact_check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: selectedText }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert("✅ Fact Check Result:\n" + data.result);
        })
        .catch((err) => {
          alert("❌ Error contacting server:\n" + err.message);
        });
  
      tooltip.remove(); // Remove tooltip after click
    };
  
    document.body.appendChild(tooltip);
  });
  
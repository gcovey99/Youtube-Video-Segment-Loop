const parseTime = (str) => {
  const parts = str.split(':').map(Number);
  return parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts.length === 2
    ? parts[0] * 60 + parts[1]
    : parts[0];
};

const setStatus = (message, type) => {
  const status = document.getElementById("loop-status");
  status.textContent = message;
  status.className = `status-message ${type}`;

  // Auto clear after 3 seconds
  setTimeout(() => {
    status.textContent = '';
    status.className = 'status-message';
  }, 3000);
};

document.getElementById("loop-toggle").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const start = parseTime(document.getElementById("loop-start").value);
  const end = parseTime(document.getElementById("loop-end").value);

  chrome.tabs.sendMessage(tab.id, {
    action: "startLoop",
    start,
    end
  });

  setStatus("Loop Started", "success");
});

document.getElementById("loop-cancel").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: "cancelLoop"
  });

  setStatus("Loop Canceled", "error");
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'resetInputs') {
    document.getElementById('loop-start').value = msg.start;
    document.getElementById('loop-end').value = msg.end;
  }
});

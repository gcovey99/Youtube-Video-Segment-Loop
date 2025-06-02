const setStatus = (message, type) => {
  const status = document.getElementById("loop-status");
  status.textContent = message;
  status.className = `status-message ${type}`;

  setTimeout(() => {
    status.textContent = '';
    status.className = 'status-message';
  }, 3000);
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
};

document.getElementById("loop-toggle").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const selected = document.querySelector('input[name="duration"]:checked');
  let duration = Number(selected.value);
  if (selected.value === "custom") {
    const customInput = document.getElementById("custom-seconds").value;
    duration = Number(customInput) || 3;
  }

  const [{ result: start }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const video = document.querySelector('video');
      return video?.currentTime || 0;
    }
  });

  const end = start + duration;

  chrome.tabs.sendMessage(tab.id, {
    action: "startLoopRemote",
    start,
    end
  });

  setStatus("Loop Started", "success");

  document.getElementById("loop-start-display").textContent =
    `Start Time: ${formatTime(start)}`;
});

document.getElementById("loop-cancel").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: "cancelLoop"
  });

  setStatus("Loop Canceled", "error");

  document.getElementById("loop-start-display").textContent = '';
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'resetInputs') {
    document.getElementById('loop-status').textContent = '';
    document.getElementById('loop-start-display').textContent = '';
  }
});

let loopStart = 0;
let loopEnd = 0;
let looping = false;
let videoAttached = false;

function getVideo() {
  return document.querySelector('video');
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
}

function setupLoopScript() {

  chrome.runtime.onMessage.removeListener(messageHandler);
  chrome.runtime.onMessage.addListener(messageHandler);

  const waitForVideo = setInterval(() => {
    const video = getVideo();
    if (video && !videoAttached) {
      clearInterval(waitForVideo);
      video.addEventListener("timeupdate", timeUpdateHandler);
      videoAttached = true;
    }
  }, 500);
}

function messageHandler(msg) {
  const video = getVideo();
  if (!video) return;

  if (msg.action === 'startLoop' || msg.action === 'startLoopRemote') {
    loopStart = msg.start;
    loopEnd = msg.end;
    looping = true;
    video.currentTime = loopStart;
    video.play().catch((err) => {
    
    });
    
  }

  if (msg.action === 'cancelLoop') {
    looping = false;
   
    chrome.runtime.sendMessage({
      action: 'resetInputs',
      start: '0:00',
      end: formatTime(video.duration)
    });
  }
}

function timeUpdateHandler() {
  const video = getVideo();
  if (looping && video && video.currentTime >= loopEnd) {
    video.currentTime = loopStart;
  }
}


let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;

    videoAttached = false;
    setupLoopScript();
  }
}).observe(document, { subtree: true, childList: true });

setupLoopScript();

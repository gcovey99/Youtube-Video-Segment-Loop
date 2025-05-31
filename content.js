let loopStart = 0;
let loopEnd = 0;
let looping = false;

const getVideo = () => document.querySelector('video');

chrome.runtime.onMessage.addListener((msg) => {
  const video = getVideo();
  if (!video) return;

  if (msg.action === 'startLoop') {
    loopStart = msg.start;
    loopEnd = msg.end;
    looping = true;
    video.currentTime = loopStart;
  }

  if (msg.action === 'cancelLoop') {
    looping = false;

    // Reset time values shown in popup
    chrome.runtime.sendMessage({
      action: 'resetInputs',
      start: '0:00',
      end: formatTime(video.duration)
    });
  }
});

const timeUpdateHandler = () => {
  const video = getVideo();
  if (looping && video && video.currentTime >= loopEnd) {
    video.currentTime = loopStart;
  }
};

const waitForVideo = setInterval(() => {
  const video = getVideo();
  if (video) {
    clearInterval(waitForVideo);
    video.addEventListener("timeupdate", timeUpdateHandler);
  }
}, 500);

// Format seconds
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
}

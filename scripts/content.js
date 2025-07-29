function createOverlayControls(video) {
  const wrapper = document.createElement('div');
  wrapper.className = 'pepper-video-wrapper';
  video.parentNode.insertBefore(wrapper, video);
  wrapper.appendChild(video);

  const leftOverlay = document.createElement('div');
  leftOverlay.className = 'pepper-overlay pepper-left';
  leftOverlay.innerHTML = '<span class="pepper-icon">-</span>';
  
  const rightOverlay = document.createElement('div');
  rightOverlay.className = 'pepper-overlay pepper-right';
  rightOverlay.innerHTML = '<span class="pepper-icon">+</span>';
  
  wrapper.appendChild(leftOverlay);
  wrapper.appendChild(rightOverlay);

  // Add click handlers
  leftOverlay.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newRate = Math.max(0.25, video.playbackRate - 0.25);
    setPlayBackRate(newRate);
    // Save the new rate
    chrome.storage.local.set({ [window.location.hostname]: newRate });
  });

  rightOverlay.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newRate = Math.min(16, video.playbackRate + 0.25);
    setPlayBackRate(newRate);
    // Save the new rate
    chrome.storage.local.set({ [window.location.hostname]: newRate });
  });
}

function addStylesheet() {
  const style = document.createElement('style');
  style.textContent = `
    .pepper-video-wrapper {
      position: relative;
      display: inline-block;
    }
    .pepper-overlay {
      position: absolute;
      top: 0;
      height: 100%;
      width: 15%;
      opacity: 0;
      transition: opacity 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.5);
      color: white;
    }
    .pepper-overlay:hover {
      opacity: 1;
    }
    .pepper-left {
      left: 0;
    }
    .pepper-right {
      right: 0;
    }
    .pepper-icon {
      font-size: 24px;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
}

function setPlayBackRate(rate) {
  const videos = document.getElementsByTagName("video");
  if (videos.length === 0) {
    console.log('No video elements found');
    return false;
  }

  try {
    for (let video of videos) {
      const oldRate = video.playbackRate;
      video.playbackRate = rate;
      
      // Verify if the rate was actually changed
      if (video.playbackRate !== rate) {
        console.log('Failed to set playback rate:', oldRate, '->', rate);
        return false;
      }

      // Ensure video has overlay controls
      if (!video.parentNode.classList.contains('pepper-video-wrapper')) {
        createOverlayControls(video);
      }
    }
    return true;
  } catch (error) {
    console.log('Error setting playback rate:', error);
    return false;
  }
}

// Add the stylesheet when the script loads
addStylesheet();

// Add mutation observer to handle dynamically loaded videos
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.tagName === 'VIDEO') {
        // Apply last known rate to new videos and add controls
        chrome.storage.local.get(window.location.hostname, (result) => {
          const savedRate = result[window.location.hostname] || 1.0;
          setPlayBackRate(savedRate);
        });
      }
    }
  }
});

// Start observing the document for added video elements
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setPlaybackRate') {
    const success = setPlayBackRate(request.rate);
    sendResponse({ success });
  } else if (request.action === 'getCurrentRate') {
    const videos = document.getElementsByTagName("video");
    const rate = videos.length > 0 ? videos[0].playbackRate : 1;
    sendResponse({ rate });
  }
  return true;
});
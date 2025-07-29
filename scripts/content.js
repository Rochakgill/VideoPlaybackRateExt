function createOverlayControls(video) {
  // Check if video is already wrapped
  if (video.parentNode.classList.contains('pepper-video-wrapper')) {
    return;
  }

  // Preserve original video styles
  const originalWidth = video.style.width;
  const originalHeight = video.style.height;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'pepper-video-wrapper';
  // Maintain video dimensions
  wrapper.style.width = originalWidth || video.offsetWidth + 'px';
  wrapper.style.height = originalHeight || video.offsetHeight + 'px';
  
  // Replace video with wrapper
  video.parentNode.insertBefore(wrapper, video);
  wrapper.appendChild(video);
  
  // Ensure video fills wrapper
  video.style.width = '100%';
  video.style.height = '100%';

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
      position: relative !important;
      display: inline-block !important;
      z-index: 2147483647 !important;
    }
    .pepper-video-wrapper video {
      z-index: 1 !important;
    }
    .pepper-overlay {
      position: absolute !important;
      top: 0 !important;
      height: 100% !important;
      width: 15% !important;
      opacity: 0 !important;
      transition: opacity 0.3s !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      background: rgba(0, 0, 0, 0.5) !important;
      color: white !important;
      z-index: 2147483647 !important;
      pointer-events: all !important;
    }
    .pepper-overlay:hover {
      opacity: 0.8 !important;
    }
    .pepper-left {
      left: 0 !important;
    }
    .pepper-right {
      right: 0 !important;
    }
    .pepper-icon {
      font-size: 32px !important;
      font-weight: bold !important;
      text-shadow: 0 0 4px rgba(0,0,0,0.5) !important;
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

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Check if shift key is pressed and it's either '<' or '>'
  if (e.shiftKey) {
    if (e.key === '<' || e.key === ',') {
      e.preventDefault();
      const videos = document.getElementsByTagName("video");
      if (videos.length > 0) {
        const newRate = Math.max(0.25, videos[0].playbackRate - 0.25);
        setPlayBackRate(newRate);
        chrome.storage.local.set({ [window.location.hostname]: newRate });
        showRateIndicator(newRate);
      }
    } else if (e.key === '>' || e.key === '.') {
      e.preventDefault();
      const videos = document.getElementsByTagName("video");
      if (videos.length > 0) {
        const newRate = Math.min(16, videos[0].playbackRate + 0.25);
        setPlayBackRate(newRate);
        chrome.storage.local.set({ [window.location.hostname]: newRate });
        showRateIndicator(newRate);
      }
    }
  }
});

// Show temporary rate indicator
function showRateIndicator(rate) {
  // Remove existing indicator if present
  const existingIndicator = document.querySelector('.pepper-rate-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }

  const indicator = document.createElement('div');
  indicator.className = 'pepper-rate-indicator';
  indicator.textContent = rate.toFixed(2) + 'x';
  document.body.appendChild(indicator);

  // Remove indicator after 1 second
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }, 1000);
}

// Add indicator styles
const indicatorStyle = document.createElement('style');
indicatorStyle.textContent = `
  .pepper-rate-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    z-index: 2147483647;
    transition: opacity 0.3s;
  }
`;
document.head.appendChild(indicatorStyle);

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
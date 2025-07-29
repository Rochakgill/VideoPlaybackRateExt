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
    }
    return true;
  } catch (error) {
    console.log('Error setting playback rate:', error);
    return false;
  }
}

// Add mutation observer to handle dynamically loaded videos
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.tagName === 'VIDEO') {
        // Apply last known rate to new videos
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
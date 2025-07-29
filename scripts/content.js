// Function to save rate if it's not 1
function saveRate(rate) {
  const hostname = window.location.hostname;
  if (rate === 1) {
    // If rate is 1, remove the stored value
    chrome.storage.local.remove(hostname);
  } else {
    // Otherwise save the non-default rate
    chrome.storage.local.set({ [hostname]: rate });
  }
}

function setPlayBackRate(rate) {
  const videos = document.getElementsByTagName("video");
  if (videos.length === 0) {
    console.log('No video elements found');
    return false;
  }

  try {
    for (let video of videos) {
      video.playbackRate = rate;
      
      // Verify if the rate was actually changed
      if (video.playbackRate !== rate) {
        console.log('Failed to set playback rate to:', rate);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.log('Error setting playback rate:', error);
    return false;
  }
}

// Function to apply saved rate or default to 1
function applySavedRate() {
  const hostname = window.location.hostname;
  chrome.storage.local.get(hostname, (result) => {
    const savedRate = result[hostname];
    if (savedRate) {
      setPlayBackRate(savedRate);
    }
  });
}

// Apply saved rate when the script loads
applySavedRate();

// Add mutation observer to handle dynamically loaded videos
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.tagName === 'VIDEO') {
        applySavedRate();
        break;
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
        if (setPlayBackRate(newRate)) {
          saveRate(newRate);
          showRateIndicator(newRate);
        }
      }
    } else if (e.key === '>' || e.key === '.') {
      e.preventDefault();
      const videos = document.getElementsByTagName("video");
      if (videos.length > 0) {
        const newRate = Math.min(16, videos[0].playbackRate + 0.25);
        if (setPlayBackRate(newRate)) {
          saveRate(newRate);
          showRateIndicator(newRate);
        }
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
    if (success) {
      saveRate(request.rate);
    }
    sendResponse({ success });
  } else if (request.action === 'getCurrentRate') {
    const videos = document.getElementsByTagName("video");
    const rate = videos.length > 0 ? videos[0].playbackRate : 1;
    sendResponse({ rate });
  }
  return true;
});
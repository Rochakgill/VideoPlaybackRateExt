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
      setTimeout(() => {
        setPlayBackRate(savedRate);
        showRateIndicator(savedRate);
      }, 1000); // Give the video element time to fully initialize
    }
  });
}

// Apply saved rate when the script loads and periodically check for videos
applySavedRate();
const initInterval = setInterval(() => {
  const videos = document.getElementsByTagName("video");
  if (videos.length > 0) {
    applySavedRate();
    clearInterval(initInterval);
  }
}, 500);

// Add mutation observer to handle dynamically loaded videos
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.tagName === 'VIDEO') {
        setTimeout(() => applySavedRate(), 1000);
        break;
      }
    }
  }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  const videos = document.getElementsByTagName("video");
  if (videos.length === 0) return;

  // Command(Meta) + Shift shortcuts for max and regular speed
  if (e.metaKey && e.shiftKey) {
    if (e.key === '.' || e.key === '>') {
      e.preventDefault();
      if (setPlayBackRate(16)) {
        saveRate(16);
        showRateIndicator(16);
      }
    } else if (e.key === ',' || e.key === '<') {
      e.preventDefault();
      if (setPlayBackRate(1)) {
        saveRate(1);
        showRateIndicator(1);
      }
    }
    return;
  }

  // Regular Shift shortcuts for incremental changes
  if (e.shiftKey && !e.metaKey) {
    const currentRate = videos[0].playbackRate;
    if (e.key === '<' || e.key === ',') {
      e.preventDefault();
      const newRate = Math.max(0.25, currentRate - 0.25);
      if (setPlayBackRate(newRate)) {
        saveRate(newRate);
        showRateIndicator(newRate);
      }
    } else if (e.key === '>' || e.key === '.') {
      e.preventDefault();
      const newRate = Math.min(16, currentRate + 0.25);
      if (setPlayBackRate(newRate)) {
        saveRate(newRate);
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

  // Determine where to append the indicator
  let container = document.body;
  
  // Check for fullscreen element
  const fullscreenElement = 
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  if (fullscreenElement) {
    container = fullscreenElement;
  }

  container.appendChild(indicator);

  // Remove indicator after 1 second
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => {
      if (indicator.parentElement) {
        indicator.remove();
      }
    }, 300);
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
    pointer-events: none;
  }

  /* Ensure the indicator is visible in fullscreen */
  *:fullscreen .pepper-rate-indicator,
  *:-webkit-full-screen .pepper-rate-indicator,
  *:-moz-full-screen .pepper-rate-indicator,
  *:-ms-fullscreen .pepper-rate-indicator {
    position: absolute;
    z-index: 2147483647;
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
      showRateIndicator(request.rate);
    }
    sendResponse({ success });
  } else if (request.action === 'getCurrentRate') {
    const hostname = window.location.hostname;
    chrome.storage.local.get(hostname, (result) => {
      const videos = document.getElementsByTagName("video");
      const currentRate = videos.length > 0 ? videos[0].playbackRate : 1;
      const savedRate = result[hostname] || currentRate;
      sendResponse({ rate: savedRate });
    });
    return true; // Will send response asynchronously
  }
  return true;
});
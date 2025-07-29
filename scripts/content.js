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
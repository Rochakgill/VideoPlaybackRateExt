function setPlayBackRate(rate) {
  const videos = document.getElementsByTagName("video");
  for (let video of videos) {
    video.playbackRate = rate;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setPlaybackRate') {
    setPlayBackRate(request.rate);
    sendResponse({ success: true });
  } else if (request.action === 'getCurrentRate') {
    const videos = document.getElementsByTagName("video");
    const rate = videos.length > 0 ? videos[0].playbackRate : 1;
    sendResponse({ rate });
  }
  return true;
});
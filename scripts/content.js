chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'modifyDOM') {
    modifyDOM(request.sliderValue);
  }
});
document.getElementById('playbackrateSlider').addEventListener('input', () => {
  document.getElementById("sliderValue").innerText = document.getElementById('playbackrateSlider').value + "x"
});


document.getElementById('playbackrateSlider').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: setPlayBackRate,
      args: [document.getElementById('playbackrateSlider').value]
    });
  });
});

function setPlayBackRate(sliderValue) {
  var video = document.getElementsByTagName("video");
  for(var i=0; i<video.length; i++){
  	video[i].playbackRate=sliderValue;
  }
}
let currentTab = null;

// Initialize the UI when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tabs[0];
  
  // Get the stored rate for this domain
  const hostname = new URL(currentTab.url).hostname;
  const result = await chrome.storage.local.get(hostname);
  const savedRate = result[hostname] || 1.0;
  
  // Set initial values
  updateUI(savedRate);
  
  // Update video playback rate
  await setPlaybackRate(savedRate);
});

// Handle slider input
document.getElementById('playbackrateSlider').addEventListener('input', (e) => {
  const rate = parseFloat(e.target.value);
  updateUI(rate);
});

// Handle slider change (when user stops dragging)
document.getElementById('playbackrateSlider').addEventListener('change', async (e) => {
  const rate = parseFloat(e.target.value);
  await saveAndApplyRate(rate);
});

// Handle preset button clicks
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const rate = parseFloat(btn.dataset.rate);
    updateUI(rate);
    await saveAndApplyRate(rate);
  });
});

// Update UI elements
function updateUI(rate) {
  document.getElementById('sliderValue').innerText = rate + 'x';
  document.getElementById('playbackrateSlider').value = rate;
  
  // Update active state of preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.rate) === rate);
  });
}

// Save rate for current domain and apply to video
async function saveAndApplyRate(rate) {
  const hostname = new URL(currentTab.url).hostname;
  await chrome.storage.local.set({ [hostname]: rate });
  await setPlaybackRate(rate);
}

// Apply playback rate to video
async function setPlaybackRate(rate) {
  await chrome.tabs.sendMessage(currentTab.id, {
    action: 'setPlaybackRate',
    rate: rate
  });
}
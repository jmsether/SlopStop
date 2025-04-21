// Threshold values corresponding to slider positions
const thresholdValues = [100, 1000, 10000, 100000, 1000000, 10000000];

document.addEventListener('DOMContentLoaded', function() {
  const thresholdSlider = document.getElementById('threshold');
  const thresholdValueDisplay = document.getElementById('threshold-value');
  const removedCountDisplay = document.getElementById('removed-count');
  const applyButton = document.getElementById('apply');
  const presetButtons = document.querySelectorAll('.preset-buttons button');
  
  let currentThreshold = 1000; // Default
  
  // Format number with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  // Load saved threshold and update UI
  chrome.storage.local.get(['viewThreshold', 'removedCount'], function(result) {
    if (result.viewThreshold) {
      currentThreshold = result.viewThreshold;
      
      // Find closest slider position
      let closestIndex = 0;
      let minDiff = Math.abs(thresholdValues[0] - currentThreshold);
      
      for (let i = 1; i < thresholdValues.length; i++) {
        const diff = Math.abs(thresholdValues[i] - currentThreshold);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }
      
      thresholdSlider.value = closestIndex;
      thresholdValueDisplay.textContent = formatNumber(currentThreshold);
    }
    
    if (result.removedCount) {
      removedCountDisplay.textContent = formatNumber(result.removedCount);
    }
  });
  
  // Get current count from active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0] && tabs[0].url.includes('youtube.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getCount"}, function(response) {
        if (response && response.count !== undefined) {
          removedCountDisplay.textContent = formatNumber(response.count);
        }
      });
    }
  });
  
  // Update threshold display when slider changes
  thresholdSlider.addEventListener('input', function() {
    const value = thresholdValues[this.value];
    thresholdValueDisplay.textContent = formatNumber(value);
    currentThreshold = value;
  });
  
  // Handle preset buttons
  presetButtons.forEach(button => {
    button.addEventListener('click', function() {
      const value = parseInt(this.dataset.value);
      currentThreshold = value;
      thresholdValueDisplay.textContent = formatNumber(value);
      
      // Find closest slider position
      let closestIndex = 0;
      let minDiff = Math.abs(thresholdValues[0] - value);
      
      for (let i = 1; i < thresholdValues.length; i++) {
        const diff = Math.abs(thresholdValues[i] - value);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }
      
      thresholdSlider.value = closestIndex;
    });
  });
  
  // Apply button handler
  applyButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(
          tabs[0].id, 
          {action: "updateThreshold", threshold: currentThreshold}, 
          function(response) {
            if (response && response.count !== undefined) {
              removedCountDisplay.textContent = formatNumber(response.count);
            }
          }
        );
      }
    });
  });
});

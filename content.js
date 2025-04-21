// Global variables
let removedVideosCount = 0;
let viewThreshold = 1000; // Default threshold

// Get the threshold from storage
function loadThreshold() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['viewThreshold'], function(result) {
      if (result.viewThreshold) {
        viewThreshold = parseInt(result.viewThreshold);
      }
    });
  }
}

// Function to hide videos with fewer than the threshold views
function hideVideosWithLowViews() {
  // Reset counter for this run
  let currentRunRemoved = 0;
  
  // Select all video items on the home page
  const videoItems = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');
  
  videoItems.forEach(item => {
    // Skip already processed items
    if (item.dataset.viewsProcessed === 'true') {
      return;
    }
    
    // Find the view count element
    const viewCountElement = item.querySelector('#metadata-line span:nth-child(1)');
    
    if (viewCountElement) {
      const viewText = viewCountElement.textContent.trim();
      
      // Extract the view count number
      let viewCount = 0;
      if (viewText.includes('view')) {
        // Parse the view count
        const viewMatch = viewText.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*([KMB]?)/i);
        
        if (viewMatch) {
          // Remove commas from numbers like "1,234"
          const numStr = viewMatch[1].replace(/,/g, '');
          const num = parseFloat(numStr);
          const multiplier = viewMatch[2].toUpperCase();
          
          // Convert to actual number
          if (multiplier === 'K') {
            viewCount = num * 1000;
          } else if (multiplier === 'M') {
            viewCount = num * 1000000;
          } else if (multiplier === 'B') {
            viewCount = num * 1000000000;
          } else {
            viewCount = num;
          }
          
          // Hide videos with fewer than threshold views
          if (viewCount < viewThreshold) {
            item.style.display = 'none';
            currentRunRemoved++;
            removedVideosCount++;
          }
        }
      }
    }
    
    // Mark as processed
    item.dataset.viewsProcessed = 'true';
  });
  
  // Update the count in storage
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({removedCount: removedVideosCount});
  }
  
  return currentRunRemoved;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "getCount") {
      sendResponse({count: removedVideosCount});
    } else if (request.action === "updateThreshold") {
      viewThreshold = request.threshold;
      // Store the new threshold
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({viewThreshold: viewThreshold});
      }
      // Re-run filtering with new threshold
      document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer').forEach(item => {
        item.dataset.viewsProcessed = 'false';
        item.style.display = ''; // Reset display
      });
      const newlyRemoved = hideVideosWithLowViews();
      sendResponse({count: removedVideosCount, newlyRemoved: newlyRemoved});
    }
    return true;
  }
);

// Load saved threshold
loadThreshold();

// Run the function when the page loads
hideVideosWithLowViews();

// Set up a mutation observer to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      hideVideosWithLowViews();
    }
  }
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Add a small delay to catch videos that load after initial page load
setTimeout(hideVideosWithLowViews, 2000);
setTimeout(hideVideosWithLowViews, 5000);

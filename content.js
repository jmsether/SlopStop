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

// Debug function to help troubleshoot
function debugLog(message, data) {
  if (localStorage.getItem('ytViewFilterDebug') === 'true') {
    console.log(`[YT View Filter] ${message}`, data);
  }
}

// Function to hide videos with fewer than the threshold views
function hideVideosWithLowViews() {
  // Reset counter for this run
  let currentRunRemoved = 0;
  
  // Select all video items on the home page - use more comprehensive selectors
  const videoItems = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer');
  
  debugLog(`Processing ${videoItems.length} video items`);
  
  videoItems.forEach(item => {
    // Skip already processed items
    if (item.dataset.viewsProcessed === 'true') {
      return;
    }
    
    // Find the view count element - try different selectors based on YouTube's layout
    let viewCountElement = item.querySelector('#metadata-line span:nth-child(1)');
    
    // If not found, try alternative selectors
    if (!viewCountElement) {
      // Try other common YouTube selectors
      const possibleSelectors = [
        'span.inline-metadata-item.style-scope.ytd-video-meta-block',
        'span.style-scope.ytd-video-meta-block',
        'div.metadata-snippet-container span',
        'span[aria-label*="view"]',
        '#metadata-line span',
        'span.ytd-video-meta-block'
      ];
      
      for (const selector of possibleSelectors) {
        const elements = item.querySelectorAll(selector);
        for (const el of elements) {
          if (el.textContent.includes('view')) {
            viewCountElement = el;
            break;
          }
        }
        if (viewCountElement) break;
      }
    }
    
    if (viewCountElement) {
      const viewText = viewCountElement.textContent.trim();
      
      // Extract the view count number
      let viewCount = 0;
      if (viewText.includes('view')) {
        // Parse the view count - handle different formats
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
          
          debugLog(`Found video with ${viewCount} views`, {
            text: viewText,
            threshold: viewThreshold
          });
          
          // Hide videos with fewer than threshold views
          if (viewCount < viewThreshold) {
            item.style.display = 'none';
            currentRunRemoved++;
            removedVideosCount++;
            debugLog(`Removed video with ${viewCount} views (below threshold ${viewThreshold})`);
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

// Add debug toggle to window object for easier troubleshooting
window.toggleYTViewFilterDebug = function() {
  const current = localStorage.getItem('ytViewFilterDebug') === 'true';
  localStorage.setItem('ytViewFilterDebug', (!current).toString());
  console.log(`[YT View Filter] Debug mode ${!current ? 'enabled' : 'disabled'}`);
  return `Debug mode ${!current ? 'enabled' : 'disabled'}`;
};

// Run the function when the page loads
setTimeout(() => {
  debugLog('Initial run of hideVideosWithLowViews');
  hideVideosWithLowViews();
}, 1500);

// Set up a mutation observer to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;
  
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      // Check if any added nodes are video items or contain video items
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.querySelector('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer') ||
              node.matches('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer')) {
            shouldProcess = true;
            break;
          }
        }
      }
    }
    
    if (shouldProcess) break;
  }
  
  if (shouldProcess) {
    debugLog('New content detected, running filter');
    hideVideosWithLowViews();
  }
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Add delays to catch videos that load after initial page load
setTimeout(hideVideosWithLowViews, 2000);
setTimeout(hideVideosWithLowViews, 5000);
setTimeout(hideVideosWithLowViews, 10000);

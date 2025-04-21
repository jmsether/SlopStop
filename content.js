// Function to hide videos with fewer than 1000 views
function hideVideosWithLowViews() {
  // Select all video items on the home page
  const videoItems = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');
  
  videoItems.forEach(item => {
    // Find the view count element
    const viewCountElement = item.querySelector('#metadata-line span:nth-child(1)');
    
    if (viewCountElement) {
      const viewText = viewCountElement.textContent.trim();
      
      // Extract the view count number
      let viewCount = 0;
      if (viewText.includes('views')) {
        // Parse the view count
        const viewMatch = viewText.match(/(\d+(?:\.\d+)?)\s*([KMB]?)/i);
        
        if (viewMatch) {
          const num = parseFloat(viewMatch[1]);
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
          
          // Hide videos with fewer than 1000 views
          if (viewCount < 1000) {
            item.style.display = 'none';
          }
        }
      }
    }
  });
}

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

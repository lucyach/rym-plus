// Default to Ratings View Feature
// Automatically switches to the "ratings" tab when visiting user profiles

function handleDefaultToRatings() {
  // Only apply on user profile pages (URLs like /~username or /user/username)
  if (!window.location.pathname.match(/\/(~|user\/)/)) {
    return;
  }
  
  // Get user preference for defaulting to ratings view
  chrome.storage.sync.get(['defaultToRatings'], function(result) {
    if (result.defaultToRatings === true) {
      // Wait a moment for the page to fully load, then click the ratings button
      setTimeout(() => {
        switchToRatingsView();
      }, 500);
    }
  });
}

function switchToRatingsView() {
  const ratingsButton = document.getElementById('btnmusicrating');
  
  if (ratingsButton) {
    ratingsButton.click();
  }
}

// Export functions for use in main content script
window.RYMPlusFeatures = window.RYMPlusFeatures || {};
window.RYMPlusFeatures.ratingsView = {
  handle: handleDefaultToRatings,
  switch: switchToRatingsView
};
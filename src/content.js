// Content script - runs on RateYourMusic pages
// Main entry point that coordinates all features
console.log('RYM Plus extension loaded!');

// Wait for the page to fully load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

function initializeExtension() {
  console.log('Initializing RYM Plus features...');
  
  // Wait for all feature modules to be loaded
  if (typeof window.RYMPlusFeatures === 'undefined') {
    console.log('Feature modules not loaded yet, retrying...');
    setTimeout(initializeExtension, 100);
    return;
  }
  
  // Initialize each feature
  if (window.RYMPlusFeatures.issues) {
    window.RYMPlusFeatures.issues.handle();
  }
  
  if (window.RYMPlusFeatures.ratingsView) {
    window.RYMPlusFeatures.ratingsView.handle();
  }
  
  if (window.RYMPlusFeatures.ratingDescriptions) {
    window.RYMPlusFeatures.ratingDescriptions.handle();
  }
  
  if (window.RYMPlusFeatures.buttonStyling) {
    window.RYMPlusFeatures.buttonStyling.handle();
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleIssues' && window.RYMPlusFeatures.issues) {
    window.RYMPlusFeatures.issues.toggle(request.hideIssues);
    sendResponse({ success: true });
  } else if (request.action === 'toggleRatingDescriptions' && window.RYMPlusFeatures.ratingDescriptions) {
    window.RYMPlusFeatures.ratingDescriptions.toggle(request.showRatingDescriptions);
    sendResponse({ success: true });
  } else if (request.action === 'toggleButtonStyling' && window.RYMPlusFeatures.buttonStyling) {
    window.RYMPlusFeatures.buttonStyling.toggle(request.styleButtons);
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: 'Unknown action or feature not loaded' });
  }
});
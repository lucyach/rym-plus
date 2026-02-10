// Content script - runs on RateYourMusic pages
// Main entry point that coordinates all features

// Suppress console noise from extension only (not third-party errors)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Add global error handler for our extension only
window.addEventListener('error', (event) => {
  // Only handle errors from our extension files
  if (event.filename && event.filename.includes('chrome-extension://')) {
    console.error('RYM Plus Extension Error:', event.error);
    event.preventDefault(); // Prevent error from propagating
  }
});

// Wait for the page to fully load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

function initializeExtension() {
  try {
    // Wait for all feature modules to be loaded
    if (typeof window.RYMPlusFeatures === 'undefined') {
      setTimeout(initializeExtension, 100);
      return;
    }
    
    // Initialize each feature with error handling
    const features = [
      { name: 'issues', feature: window.RYMPlusFeatures.issues },
      { name: 'ratingsView', feature: window.RYMPlusFeatures.ratingsView },
      { name: 'ratingDescriptions', feature: window.RYMPlusFeatures.ratingDescriptions },
      { name: 'adBlocker', feature: window.RYMPlusFeatures.adBlocker },
      { name: 'buttonStyling', feature: window.RYMPlusFeatures.buttonStyling },
      { name: 'userProfileStyling', feature: window.RYMPlusFeatures.userProfileStyling }
    ];
    
    features.forEach(({ name, feature }) => {
      try {
        if (feature && feature.handle) {
          feature.handle();
        } else if (feature && feature.init) {
          feature.init();
        }
      } catch (error) {
      }
    });
    
    // Initialize upcoming releases feature separately (direct function call)
    try {
      if (typeof window.initUpcomingReleasesFilter === 'function') {
        window.initUpcomingReleasesFilter();
      }
    } catch (error) {
    }
    
  } catch (error) {
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleIssues' && window.RYMPlusFeatures?.issues) {
    window.RYMPlusFeatures.issues.toggle(request.hideIssues);
    sendResponse({ success: true });
  } else if (request.action === 'toggleRatingDescriptions' && window.RYMPlusFeatures?.ratingDescriptions) {
    window.RYMPlusFeatures.ratingDescriptions.toggle(request.showRatingDescriptions);
    sendResponse({ success: true });
  } else if (request.action === 'toggleAdBlocking' && window.RYMPlusFeatures?.adBlocker) {
    window.RYMPlusFeatures.adBlocker.toggle(request.blockAds);
    sendResponse({ success: true });
  } else if (request.action === 'toggleProfileStyling' && window.RYMPlusFeatures?.userProfileStyling) {
    window.RYMPlusFeatures.userProfileStyling.toggle(request.fixProfileStyling);
    sendResponse({ success: true });
  } else if (request.action === 'toggleUpcomingReleases') {
    // Handle upcoming releases toggle directly
    try {
      if (typeof window.handleUpcomingReleasesToggle === 'function') {
        window.handleUpcomingReleasesToggle({
          action: 'toggleUpcomingReleases',
          enabled: request.hideUpcomingReleases
        }, sender, sendResponse);
      } else {
        sendResponse({ success: false, error: 'Upcoming releases handler not available' });
      }
    } catch (error) {
      console.error('RYM Plus: Error handling upcoming releases toggle:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else {
    sendResponse({ success: false, error: 'Unknown action or feature not loaded' });
  }
});
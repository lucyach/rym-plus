// Background script - handles extension lifecycle and background tasks
console.log('RYM Plus background script loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('RYM Plus installed!');
    
    // Set default settings
    chrome.storage.sync.set({
      'masterToggle': true,  // Extension enabled by default
      'hideIssues': false,
      'defaultToRatings': false,
      'showRatingDescriptions': false,
      'blockAds': false,
      'fixProfileStyling': true,
      'styleButtons': true,  // Synced with fixProfileStyling
      'performanceMode': false  // Performance mode for slow connections
    });
    
    console.log('RYM Plus initialized with default settings');
  }
});

// Listen for tab updates to show extension is active
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('rateyourmusic.com')) {
    console.log('RateYourMusic page loaded');
    
    // Check if extension is enabled before injecting
    chrome.storage.sync.get(['masterToggle'], (result) => {
      if (result.masterToggle === false) {
        console.log('RYM Plus is disabled, skipping injection');
        return;
      }
      
      // Optional: Inject error recovery script
      try {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => {
            // Add page error recovery
            window.addEventListener('error', (e) => {
              if (e.error && e.error.message && e.error.message.includes('RYM Plus')) {
                console.warn('RYM Plus: Recovered from error:', e.error.message);
              }
            });
          }
        }).catch(() => {
          // Silently fail if script injection not possible
        });
      } catch (error) {
        console.log('RYM Plus: Could not inject error recovery script');
      }
    });
  }
});

// Handle extension icon state based on master toggle
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.masterToggle) {
    const isEnabled = changes.masterToggle.newValue;
    
    // Update extension icon opacity or badge
    chrome.action.setBadgeText({
      text: isEnabled ? '' : 'OFF'
    });
    
    chrome.action.setBadgeBackgroundColor({
      color: isEnabled ? '#4CAF50' : '#f44336'
    });
  }
});
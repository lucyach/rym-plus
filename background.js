// Background script - handles extension lifecycle and background tasks
console.log('RYM Plus background script loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('RYM Plus installed!');
    
    // Set default settings
    chrome.storage.sync.set({
      'hideIssues': false
    });
  }
});

// Listen for tab updates to show extension is active
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('rateyourmusic.com')) {
    console.log('RateYourMusic page loaded');
  }
});
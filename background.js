// Background script - handles extension lifecycle and background tasks
console.log('RYM Plus background script loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('RYM Plus installed!');
    
    // Set default settings
    chrome.storage.sync.set({
      'rymPlusEnabled': true,
      'enhanceRatings': true,
      'customTheme': false
    });
  }
});

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('rateyourmusic.com')) {
    console.log('RateYourMusic page loaded');
    
    // You can perform additional actions when RYM pages load
    chrome.action.setBadgeText({
      text: '✓',
      tabId: tabId
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveRating') {
    // Handle saving rating data
    console.log('Saving rating:', request.data);
    
    chrome.storage.local.get('rymRatings', (result) => {
      const ratings = result.rymRatings || [];
      ratings.push(request.data);
      chrome.storage.local.set({ 'rymRatings': ratings });
    });
    
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});
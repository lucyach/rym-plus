// Popup script - handles the extension popup UI
document.addEventListener('DOMContentLoaded', function() {
  console.log('RYM Plus popup loaded');
  
  // Load saved settings
  loadSettings();
  
  // Add event listener for hide issues toggle
  document.getElementById('hideIssues').addEventListener('change', function() {
    const isChecked = this.checked;
    chrome.storage.sync.set({ 'hideIssues': isChecked });
    
    // Send message to content script to apply changes immediately
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('rateyourmusic.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleIssues',
          hideIssues: isChecked
        });
      }
    });
  });
  
  // Add event listener for default to ratings toggle
  document.getElementById('defaultToRatings').addEventListener('change', function() {
    const isChecked = this.checked;
    chrome.storage.sync.set({ 'defaultToRatings': isChecked });
  });
  
  // Add event listener for show rating descriptions toggle
  document.getElementById('showRatingDescriptions').addEventListener('change', function() {
    const isChecked = this.checked;
    chrome.storage.sync.set({ 'showRatingDescriptions': isChecked });
    
    // Send message to content script to apply changes immediately
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('rateyourmusic.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleRatingDescriptions',
          showRatingDescriptions: isChecked
        });
      }
    });
  });
  
  // Add event listener for block ads toggle
  document.getElementById('blockAds').addEventListener('change', function() {
    const isChecked = this.checked;
    chrome.storage.sync.set({ 'blockAds': isChecked });
    
    // Send message to content script to apply changes immediately
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('rateyourmusic.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleAdBlocking',
          blockAds: isChecked
        });
      }
    });
  });
  
  // Add event listener for fix profile styling toggle
  document.getElementById('fixProfileStyling').addEventListener('change', function() {
    const isChecked = this.checked;
    chrome.storage.sync.set({ 
      'fixProfileStyling': isChecked,
      'styleButtons': isChecked  // Also sync button styling
    });
    
    // Send message to content script to apply changes immediately
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('rateyourmusic.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleProfileStyling',
          fixProfileStyling: isChecked
        });
      }
    });
  });
});

function loadSettings() {
  chrome.storage.sync.get(['hideIssues', 'defaultToRatings', 'showRatingDescriptions', 'blockAds', 'fixProfileStyling'], function(result) {
    document.getElementById('hideIssues').checked = result.hideIssues === true;
    document.getElementById('defaultToRatings').checked = result.defaultToRatings === true;
    document.getElementById('showRatingDescriptions').checked = result.showRatingDescriptions === true;
    document.getElementById('blockAds').checked = result.blockAds === true;
    document.getElementById('fixProfileStyling').checked = result.fixProfileStyling === true;
  });
}
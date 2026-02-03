// Popup script - handles the extension popup UI
document.addEventListener('DOMContentLoaded', function() {
  console.log('RYM Plus popup loaded');
  
  // Load saved settings
  loadSettings();
  loadStats();
  
  // Add event listeners for toggle switches
  document.getElementById('enhanceRatings').addEventListener('change', function() {
    chrome.storage.sync.set({ 'enhanceRatings': this.checked });
    console.log('Enhanced ratings:', this.checked);
  });
  
  document.getElementById('customTheme').addEventListener('change', function() {
    chrome.storage.sync.set({ 'customTheme': this.checked });
    console.log('Custom theme:', this.checked);
  });
  
  document.getElementById('ratingAnalytics').addEventListener('change', function() {
    chrome.storage.sync.set({ 'ratingAnalytics': this.checked });
    console.log('Rating analytics:', this.checked);
  });
  
  document.getElementById('hideIssues').addEventListener('change', function() {
    const isChecked = this.checked;
    chrome.storage.sync.set({ 'hideIssues': isChecked });
    console.log('Hide issues setting saved:', isChecked);
    
    // Send message to content script to apply changes immediately
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('rateyourmusic.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleIssues',
          hideIssues: isChecked
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError.message);
          } else {
            console.log('Message sent successfully:', response);
          }
        });
      }
    });
  });
});

function loadSettings() {
  chrome.storage.sync.get(['enhanceRatings', 'customTheme', 'ratingAnalytics', 'hideIssues'], function(result) {
    console.log('Loaded settings:', result);
    document.getElementById('enhanceRatings').checked = result.enhanceRatings !== false;
    document.getElementById('customTheme').checked = result.customTheme === true;
    document.getElementById('ratingAnalytics').checked = result.ratingAnalytics !== false;
    document.getElementById('hideIssues').checked = result.hideIssues === true;
    console.log('Hide issues checkbox set to:', result.hideIssues === true);
  });
}

function loadStats() {
  // Load rating statistics
  chrome.storage.local.get('rymRatings', function(result) {
    const ratings = result.rymRatings || [];
    
    document.getElementById('albumsRated').textContent = ratings.length;
    
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length;
      document.getElementById('avgRating').textContent = avgRating.toFixed(1);
    } else {
      document.getElementById('avgRating').textContent = '-';
    }
  });
  
  // Check if we're currently on a RYM page
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('rateyourmusic.com')) {
      document.getElementById('extensionStatus').textContent = 'Active';
    } else {
      document.getElementById('extensionStatus').textContent = 'Inactive';
    }
  });
}
// Popup script - handles the extension popup UI
document.addEventListener('DOMContentLoaded', function() {
  console.log('RYM Plus popup loaded');
  
  // Load saved settings
  loadSettings();
  
  // Add event listener for hide issues toggle
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
  
  // Add event listener for default to ratings toggle
  document.getElementById('defaultToRatings').addEventListener('change', function() {
    const isChecked = this.checked;
    chrome.storage.sync.set({ 'defaultToRatings': isChecked });
    console.log('Default to ratings setting saved:', isChecked);
  });
});

function loadSettings() {
  chrome.storage.sync.get(['hideIssues', 'defaultToRatings'], function(result) {
    console.log('Loaded settings:', result);
    document.getElementById('hideIssues').checked = result.hideIssues === true;
    document.getElementById('defaultToRatings').checked = result.defaultToRatings === true;
    console.log('Hide issues checkbox set to:', result.hideIssues === true);
    console.log('Default to ratings checkbox set to:', result.defaultToRatings === true);
  });
}
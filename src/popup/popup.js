// Popup script - handles the extension popup UI
document.addEventListener('DOMContentLoaded', function() {
  console.log('RYM Plus popup loaded');
  
  // Load saved settings
  loadSettings();
  
  // Add master toggle functionality
  setupMasterToggle();
  
  // Setup all feature toggles with error handling
  setupFeatureToggles();
});

// Master toggle functionality
function setupMasterToggle() {
  const masterToggle = document.getElementById('masterToggle');
  const featuresContainer = document.getElementById('features-container');
  
  masterToggle.addEventListener('change', function() {
    const isEnabled = this.checked;
    
    chrome.storage.sync.set({ 'masterToggle': isEnabled }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving master toggle:', chrome.runtime.lastError);
        showStatus('Error saving setting', 'error');
        return;
      }
      
      // Update UI
      if (isEnabled) {
        featuresContainer.classList.remove('disabled');
        showStatus('Extension enabled', 'success');
      } else {
        featuresContainer.classList.add('disabled');
        showStatus('Extension disabled', 'warning');
      }
      
      // Notify content script
      notifyContentScript('masterToggle', isEnabled);
    });
  });
}

// Show status messages to user
function showStatus(message, type = 'info') {
  const statusIndicator = document.getElementById('status-indicator');
  const statusMessage = statusIndicator.querySelector('.status-message');
  
  statusMessage.textContent = message;
  statusIndicator.className = `status-indicator ${type}`;
  statusIndicator.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusIndicator.style.display = 'none';
  }, 3000);
}

// Debounced function to reduce rapid setting changes
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Enhanced notification to content script with retry mechanism
function notifyContentScript(action, value, retries = 3) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (!tabs[0] || !tabs[0].url || !tabs[0].url.includes('rateyourmusic.com')) {
      console.log('RYM Plus: Not on a RateYourMusic page');
      return;
    }
    
    const message = {
      action: action,
      [action]: value
    };
    
    chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
      if (chrome.runtime.lastError) {
        console.log('RYM Plus: Could not communicate with page:', chrome.runtime.lastError.message);
        
        if (retries > 0) {
          console.log(`RYM Plus: Retrying... (${retries} attempts left)`);
          setTimeout(() => {
            notifyContentScript(action, value, retries - 1);
          }, 1000);
        } else {
          showStatus('Page refresh may be needed', 'warning');
        }
        return;
      }
      
      if (response && response.success) {
        console.log('RYM Plus: Setting applied successfully');
      } else {
        console.log('RYM Plus: Setting application failed:', response?.error);
      }
    });
  });
}

// Setup feature toggles with improved error handling
function setupFeatureToggles() {
  const debouncedNotify = debounce(notifyContentScript, 300);
  
  // Add event listener for hide issues toggle
  document.getElementById('hideIssues').addEventListener('change', function() {
    const isChecked = this.checked;
    
    chrome.storage.sync.set({ 'hideIssues': isChecked }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving hideIssues setting:', chrome.runtime.lastError);
        showStatus('Error saving setting', 'error');
        return;
      }
      
      debouncedNotify('toggleIssues', isChecked);
    });
  });
  
  // Add event listener for default to ratings toggle
  document.getElementById('defaultToRatings').addEventListener('change', function() {
    const isChecked = this.checked;
    chrome.storage.sync.set({ 'defaultToRatings': isChecked }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving defaultToRatings setting:', chrome.runtime.lastError);
        showStatus('Error saving setting', 'error');
      }
    });
  });
  
  // Add event listener for show rating descriptions toggle
  document.getElementById('showRatingDescriptions').addEventListener('change', function() {
    const isChecked = this.checked;
    
    chrome.storage.sync.set({ 'showRatingDescriptions': isChecked }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving showRatingDescriptions setting:', chrome.runtime.lastError);
        showStatus('Error saving setting', 'error');
        return;
      }
      
      debouncedNotify('toggleRatingDescriptions', isChecked);
    });
  });
  
  // Add event listener for block ads toggle
  document.getElementById('blockAds').addEventListener('change', function() {
    const isChecked = this.checked;
    
    chrome.storage.sync.set({ 'blockAds': isChecked }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving blockAds setting:', chrome.runtime.lastError);
        showStatus('Error saving setting', 'error');
        return;
      }
      
      debouncedNotify('toggleAdBlocking', isChecked);
    });
  });

  // Add event listener for convert streaming links toggle
  document.getElementById('convertStreamingLinks').addEventListener('change', function() {
    const isChecked = this.checked;
    
    chrome.storage.sync.set({ 'convertStreamingLinks': isChecked }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving convertStreamingLinks setting:', chrome.runtime.lastError);
        showStatus('Error saving setting', 'error');
        return;
      }
      
      debouncedNotify('toggleStreamingLinks', isChecked);
    });
  });
  
  // Add event listener for fix profile styling toggle
  document.getElementById('fixProfileStyling').addEventListener('change', function() {
    const isChecked = this.checked;
    
    chrome.storage.sync.set({ 
      'fixProfileStyling': isChecked,
      'styleButtons': isChecked  // Also sync button styling
    }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving fixProfileStyling setting:', chrome.runtime.lastError);
        showStatus('Error saving setting', 'error');
        return;
      }
      
      debouncedNotify('toggleProfileStyling', isChecked);
    });
  });

  // Add event listener for hide upcoming releases toggle
  document.getElementById('hideUpcomingReleases').addEventListener('change', function() {
    const isChecked = this.checked;
    
    chrome.storage.sync.set({ 'hideUpcomingReleases': isChecked }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving hideUpcomingReleases setting:', chrome.runtime.lastError);
        showStatus('Error saving setting', 'error');
        return;
      }
      
      debouncedNotify('toggleUpcomingReleases', isChecked);
    });
  });
}

function loadSettings() {
  chrome.storage.sync.get([
    'masterToggle', 'hideIssues', 'defaultToRatings', 'showRatingDescriptions', 
    'blockAds', 'fixProfileStyling', 'hideUpcomingReleases', 'convertStreamingLinks'
  ], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Error loading settings:', chrome.runtime.lastError);
      showStatus('Error loading settings', 'error');
      return;
    }
    
    // Set master toggle (defaults to true if not set)
    const masterToggle = document.getElementById('masterToggle');
    const isEnabled = result.masterToggle !== false; // Default to true
    masterToggle.checked = isEnabled;
    
    // Update features container state
    const featuresContainer = document.getElementById('features-container');
    if (!isEnabled) {
      featuresContainer.classList.add('disabled');
    }
    
    // Set other toggles
    document.getElementById('hideIssues').checked = result.hideIssues === true;
    document.getElementById('defaultToRatings').checked = result.defaultToRatings === true;
    document.getElementById('showRatingDescriptions').checked = result.showRatingDescriptions === true;
    document.getElementById('blockAds').checked = result.blockAds === true;
    document.getElementById('fixProfileStyling').checked = result.fixProfileStyling === true;
    document.getElementById('hideUpcomingReleases').checked = result.hideUpcomingReleases === true;
    document.getElementById('convertStreamingLinks').checked = result.convertStreamingLinks !== false; // Default to true
  });
}
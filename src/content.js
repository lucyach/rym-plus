// Content script - runs on RateYourMusic pages
// Main entry point that coordinates all features

let extensionEnabled = true;
let initializationAttempts = 0;
const maxInitAttempts = 5;

// Enhanced error handling for our extension
const originalConsoleError = console.error;
const extensionErrors = [];

// Global error handler with recovery mechanisms
window.addEventListener('error', (event) => {
  // Only handle errors from our extension files or RYM Plus related
  if (event.filename && (event.filename.includes('chrome-extension://') || 
      event.error?.message?.includes('RYM Plus'))) {
    
    const errorInfo = {
      message: event.error?.message || 'Unknown error',
      filename: event.filename,
      lineno: event.lineno,
      timestamp: Date.now()
    };
    
    extensionErrors.push(errorInfo);
    
    // Limit error log size
    if (extensionErrors.length > 10) {
      extensionErrors.shift();
    }
    
    console.warn('RYM Plus: Error caught and logged:', errorInfo);
    
    // Attempt graceful recovery for critical features
    if (event.error?.message?.includes('storage') || 
        event.error?.message?.includes('chrome.')) {
      console.log('RYM Plus: Attempting to recover from Chrome API error');
      setTimeout(() => {
        if (initializationAttempts < maxInitAttempts) {
          initializationAttempts++;
          initializeExtension();
        }
      }, 2000);
    }
    
    event.preventDefault();
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('RYM Plus') || 
      event.reason?.stack?.includes('chrome-extension://')) {
    console.warn('RYM Plus: Unhandled promise rejection:', event.reason);
    event.preventDefault();
  }
});

// Initialize with delay and retry mechanism
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Add small delay to ensure page stability
    setTimeout(checkAndInitialize, 100);
  });
} else {
  setTimeout(checkAndInitialize, 100);
}

// Check if extension is enabled before initialization
function checkAndInitialize() {
  try {
    chrome.storage.sync.get(['masterToggle'], (result) => {
      if (chrome.runtime.lastError) {
        console.log('RYM Plus: Could not check master toggle, proceeding with caution');
        extensionEnabled = true; // Default to enabled if we can't check
      } else {
        extensionEnabled = result.masterToggle !== false; // Default to true
      }
      
      if (extensionEnabled) {
        console.log('RYM Plus: Extension is enabled, initializing...');
        initializeExtension();
      } else {
        console.log('RYM Plus: Extension is disabled by user');
        // Clean up any existing modifications
        cleanupExtensionModifications();
      }
    });
  } catch (error) {
    console.log('RYM Plus: Error checking master toggle, initializing anyway:', error);
    initializeExtension();
  }
}

// Clean up function to remove extension modifications
function cleanupExtensionModifications() {
  try {
    // Remove any RYM Plus added elements
    const rymPlusElements = document.querySelectorAll('[data-rym-plus], .rym-plus-added');
    rymPlusElements.forEach(el => el.remove());
    
    // Remove any RYM Plus added styles
    const rymPlusStyles = document.querySelectorAll('style[data-rym-plus]');
    rymPlusStyles.forEach(style => style.remove());
    
    console.log('RYM Plus: Cleanup completed');
  } catch (error) {
    console.log('RYM Plus: Error during cleanup:', error);
  }
}

// Enhanced initialization with better error handling and performance
function initializeExtension() {
  // Don't initialize if extension is disabled
  if (!extensionEnabled) {
    console.log('RYM Plus: Extension disabled, skipping initialization');
    return;
  }
  
  try {
    // Performance timing
    const startTime = performance.now();
    
    // Wait for feature modules with timeout
    if (typeof window.RYMPlusFeatures === 'undefined') {
      if (initializationAttempts < maxInitAttempts) {
        initializationAttempts++;
        console.log(`RYM Plus: Waiting for features to load... (attempt ${initializationAttempts})`);
        setTimeout(initializeExtension, Math.min(100 * initializationAttempts, 1000));
      } else {
        console.warn('RYM Plus: Features failed to load after maximum attempts');
      }
      return;
    }
    
    // Performance optimization: batch DOM operations
    const initPromises = [];
    
    // Initialize features with promises for better error handling
    const features = [
      { name: 'issues', feature: window.RYMPlusFeatures?.issues },
      { name: 'ratingsView', feature: window.RYMPlusFeatures?.ratingsView },
      { name: 'ratingDescriptions', feature: window.RYMPlusFeatures?.ratingDescriptions },
      { name: 'adBlocker', feature: window.RYMPlusFeatures?.adBlocker },
      { name: 'buttonStyling', feature: window.RYMPlusFeatures?.buttonStyling },
      { name: 'userProfileStyling', feature: window.RYMPlusFeatures?.userProfileStyling }
    ];
    
    features.forEach(({ name, feature }) => {
      const promise = new Promise((resolve) => {
        try {
          if (feature && (feature.handle || feature.init)) {
            const method = feature.handle || feature.init;
            const result = method.call(feature);
            
            // Handle both sync and async features
            if (result && typeof result.then === 'function') {
              result.then(resolve).catch((error) => {
                console.warn(`RYM Plus: Feature '${name}' initialization failed:`, error);
                resolve();
              });
            } else {
              resolve();
            }
          } else {
            console.log(`RYM Plus: Feature '${name}' not available or malformed`);
            resolve();
          }
        } catch (error) {
          console.warn(`RYM Plus: Error initializing feature '${name}':`, error);
          resolve(); // Don't fail the entire initialization
        }
      });
      
      initPromises.push(promise);
    });
    
    // Initialize upcoming releases feature separately
    const upcomingReleasesPromise = new Promise((resolve) => {
      try {
        if (typeof window.initUpcomingReleasesFilter === 'function') {
          const result = window.initUpcomingReleasesFilter();
          if (result && typeof result.then === 'function') {
            result.then(resolve).catch((error) => {
              console.warn('RYM Plus: Upcoming releases initialization failed:', error);
              resolve();
            });
          } else {
            resolve();
          }
        } else {
          console.log('RYM Plus: Upcoming releases feature not available');
          resolve();
        }
      } catch (error) {
        console.warn('RYM Plus: Error initializing upcoming releases:', error);
        resolve();
      }
    });
    
    initPromises.push(upcomingReleasesPromise);
    
    // Wait for all features to initialize with timeout
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.log('RYM Plus: Initialization timeout reached, continuing...');
        resolve();
      }, 5000);
    });
    
    Promise.race([Promise.all(initPromises), timeoutPromise]).then(() => {
      const endTime = performance.now();
      console.log(`RYM Plus: Initialization completed in ${Math.round(endTime - startTime)}ms`);
      
      // Mark page as modified by RYM Plus
      document.documentElement.setAttribute('data-rym-plus-loaded', 'true');
      
      // Reset initialization attempts counter on success
      initializationAttempts = 0;
    });
    
  } catch (error) {
    console.error('RYM Plus: Critical initialization error:', error);
    
    // Attempt recovery
    if (initializationAttempts < maxInitAttempts) {
      initializationAttempts++;
      console.log('RYM Plus: Attempting recovery...');
      setTimeout(initializeExtension, 2000);
    }
  }
}

// Enhanced message handling with better error handling and master toggle support
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle master toggle
  if (request.action === 'masterToggle') {
    extensionEnabled = request.masterToggle;
    
    if (extensionEnabled) {
      console.log('RYM Plus: Extension enabled via popup');
      initializeExtension();
      sendResponse({ success: true, message: 'Extension enabled' });
    } else {
      console.log('RYM Plus: Extension disabled via popup');
      cleanupExtensionModifications();
      sendResponse({ success: true, message: 'Extension disabled' });
    }
    return true; // Keep message channel open
  }
  
  // Don't process feature toggles if extension is disabled
  if (!extensionEnabled) {
    sendResponse({ success: false, error: 'Extension is disabled' });
    return;
  }
  
  // Enhanced feature toggle handling with timeout
  const handleFeatureToggle = (action, featurePath, toggleMethod) => {
    try {
      const feature = featurePath.split('.').reduce((obj, key) => obj?.[key], window);
      
      if (feature && typeof feature[toggleMethod] === 'function') {
        const result = feature[toggleMethod](request[action]);
        
        // Handle async feature toggles
        if (result && typeof result.then === 'function') {
          result.then(
            () => sendResponse({ success: true }),
            (error) => sendResponse({ success: false, error: error.message })
          );
        } else {
          sendResponse({ success: true });
        }
      } else {
        sendResponse({ success: false, error: `Feature '${action}' not available or method '${toggleMethod}' not found` });
      }
    } catch (error) {
      console.warn(`RYM Plus: Error handling ${action}:`, error);
      sendResponse({ success: false, error: error.message });
    }
  };
  
  // Map actions to feature paths and methods
  const featureMap = {
    'toggleIssues': { path: 'RYMPlusFeatures.issues', method: 'toggle' },
    'toggleRatingDescriptions': { path: 'RYMPlusFeatures.ratingDescriptions', method: 'toggle' },
    'toggleAdBlocking': { path: 'RYMPlusFeatures.adBlocker', method: 'toggle' },
    'toggleProfileStyling': { path: 'RYMPlusFeatures.userProfileStyling', method: 'toggle' }
  };
  
  if (featureMap[request.action]) {
    const { path, method } = featureMap[request.action];
    handleFeatureToggle(request.action, path, method);
    return true; // Keep message channel open for async responses
  }
  
  // Special handling for upcoming releases
  if (request.action === 'toggleUpcomingReleases') {
    try {
      if (typeof window.handleUpcomingReleasesToggle === 'function') {
        const result = window.handleUpcomingReleasesToggle({
          action: 'toggleUpcomingReleases',
          enabled: request.hideUpcomingReleases
        }, sender, sendResponse);
        
        // Return true if the handler will call sendResponse asynchronously
        return true;
      } else {
        sendResponse({ success: false, error: 'Upcoming releases handler not available' });
      }
    } catch (error) {
      console.warn('RYM Plus: Error handling upcoming releases toggle:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  // Unknown action
  sendResponse({ success: false, error: 'Unknown action or feature not loaded' });
  return false;
});
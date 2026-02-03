// Content script - runs on RateYourMusic pages
console.log('RYM Plus extension loaded!');

// Wait for the page to fully load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

function initializeExtension() {
  console.log('Initializing RYM Plus features...');
  
  // Handle issues section hiding (only on album/release pages)
  handleIssuesSection();
  
  // Handle default to ratings view (only on user profile pages)
  handleDefaultToRatings();
  
  // Handle rating descriptions (only on album/release pages)
  handleRatingDescriptions();
}

function handleIssuesSection() {
  // Only hide issues on album/release pages, not on user profiles or other pages
  if (!window.location.pathname.includes('/release/') && !window.location.pathname.includes('/album/')) {
    console.log('Not on an album/release page - skipping issues section hiding');
    return;
  }
  
  // Get user preference for hiding issues
  chrome.storage.sync.get(['hideIssues'], function(result) {
    console.log('handleIssuesSection - hideIssues setting:', result.hideIssues);
    toggleIssuesSection(result.hideIssues === true);
  });
}

function toggleIssuesSection(hide) {
  console.log('toggleIssuesSection called with hide =', hide);
  
  // More specific selectors - avoid the broad [class*="issues"] that was causing problems
  const issuesSelectors = [
    '.section_issues.section_outer',
    '.section_issues',
    '.marketplace_section',
    '.purchase_section'
  ];
  
  let removedCount = 0;
  
  // Try each selector and remove ALL matching elements
  for (const selector of issuesSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`Found ${elements.length} elements with selector: ${selector}`);
      
      if (hide) {
        elements.forEach((element, index) => {
          console.log(`Removing element ${index + 1}:`, element.outerHTML.substring(0, 100));
          element.remove();
          removedCount++;
        });
      }
    }
  }
  
  // More careful fallback: only look for sections with specific marketplace/purchase indicators
  if (removedCount === 0) {
    console.log('Trying fallback method to find issues section...');
    const sections = document.querySelectorAll('div[class*="section"]');
    for (const section of sections) {
      const text = section.textContent.toLowerCase();
      // More specific criteria - must contain purchase-specific terms AND have multiple links
      if ((text.includes('marketplace') || text.includes('buy this') || text.includes('purchase')) && 
          section.querySelectorAll('a').length > 3) {
        
        if (hide) {
          console.log('Removing fallback element:', section.outerHTML.substring(0, 100));
          section.remove();
          removedCount++;
        }
      }
    }
  }
  
  if (removedCount > 0) {
    console.log(`RYM Plus: Successfully removed ${removedCount} issues section(s)`);
  } else {
    console.log('RYM Plus: No issues sections found to remove');
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleIssues') {
    toggleIssuesSection(request.hideIssues);
    sendResponse({ success: true });
  } else if (request.action === 'toggleRatingDescriptions') {
    toggleRatingDescriptions(request.showRatingDescriptions);
    sendResponse({ success: true });
  }
});

function handleDefaultToRatings() {
  // Only apply on user profile pages (URLs like /~username or /user/username)
  if (!window.location.pathname.match(/\/(~|user\/)/)) {
    return;
  }
  
  // Get user preference for defaulting to ratings view
  chrome.storage.sync.get(['defaultToRatings'], function(result) {
    if (result.defaultToRatings === true) {
      // Wait a moment for the page to fully load, then click the ratings button
      setTimeout(() => {
        switchToRatingsView();
      }, 500);
    }
  });
}

function switchToRatingsView() {
  const ratingsButton = document.getElementById('btnmusicrating');
  
  if (ratingsButton) {
    ratingsButton.click();
  }
}

function handleRatingDescriptions() {
  // Only apply on album/release pages
  if (!window.location.pathname.match(/\/(release|album)\//)) {
    return;
  }
  
  // Get user preference for showing rating descriptions
  chrome.storage.sync.get(['showRatingDescriptions'], function(result) {
    if (result.showRatingDescriptions === true) {
      addRatingDescriptions();
    }
  });
}

function toggleRatingDescriptions(show) {
  console.log('toggleRatingDescriptions called with:', show);
  
  if (show) {
    addRatingDescriptions();
  } else {
    removeRatingDescriptions();
  }
}

function addRatingDescriptions() {
  // Only apply on album/release pages
  if (!window.location.pathname.match(/\/(release|album)\//)) {
    return;
  }
  
  // Find the rating container in the Rate/Catalog section
  const ratingContainer = document.querySelector('#my_catalog .my_catalog_rating');
  
  if (!ratingContainer) {
    return;
  }
  
  // Remove existing tooltip if present
  removeRatingDescriptions();
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'rym-plus-rating-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 999999;
    display: none;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
  `;
  
  // Add to body instead of relative positioning
  document.body.appendChild(tooltip);
  
  // Get all rating descriptions
  fetchRatingDescriptions(function(descriptions) {
    if (!descriptions || Object.keys(descriptions).length === 0) {
      return;
    }
    
    // Add hover functionality
    const starsContainer = ratingContainer.querySelector('.rating_stars');
    if (starsContainer) {
      // Override the existing mouse events to show our tooltip
      ratingContainer.addEventListener('mousemove', function(e) {
        const rect = starsContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        
        // Calculate which rating based on position (0.5 to 5.0)
        let hoveredRating = Math.ceil((x / width) * 10) * 0.5;
        hoveredRating = Math.max(0.5, Math.min(5.0, hoveredRating));
        
        const ratingKey = getRatingKey(hoveredRating);
        const description = descriptions[ratingKey];
        
        if (description) {
          tooltip.textContent = `${hoveredRating}: ${description}`;
          tooltip.style.display = 'block';
          
          // Position tooltip near mouse cursor
          const containerRect = ratingContainer.getBoundingClientRect();
          tooltip.style.left = (containerRect.left + x) + 'px';
          tooltip.style.top = (containerRect.bottom + 10) + 'px';
        } else {
          tooltip.style.display = 'none';
        }
      });
      
      ratingContainer.addEventListener('mouseout', function() {
        tooltip.style.display = 'none';
      });
    }
  });
}

function removeRatingDescriptions() {
  const existingTooltips = document.querySelectorAll('.rym-plus-rating-tooltip');
  existingTooltips.forEach(tooltip => tooltip.remove());
}

function getRatingDescription(rating, callback) {
  // Convert rating to the key format used in the rating system
  const ratingKey = getRatingKey(rating);
  
  // First check if we have cached descriptions
  chrome.storage.local.get(['ratingDescriptions'], function(result) {
    if (result.ratingDescriptions && result.ratingDescriptions[ratingKey]) {
      callback(result.ratingDescriptions[ratingKey]);
    } else {
      // Fetch from the user's rating system page
      fetchRatingDescriptions(function(descriptions) {
        if (descriptions && descriptions[ratingKey]) {
          callback(descriptions[ratingKey]);
        } else {
          console.log('RYM Plus: No description found for rating:', rating);
          callback(null);
        }
      });
    }
  });
}

function getRatingKey(rating) {
  // Convert numeric rating to the key format (sm1, sm2, etc.)
  const ratingMap = {
    0.5: 'sm1',
    1.0: 'sm2', 
    1.5: 'sm3',
    2.0: 'sm4',
    2.5: 'sm5', 
    3.0: 'sm6',
    3.5: 'sm7',
    4.0: 'sm8',
    4.5: 'sm9',
    5.0: 'sm10'
  };
  
  return ratingMap[rating] || null;
}

function fetchRatingDescriptions(callback) {
  fetch('/account/rating_system_2')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const descriptions = {};
      
      // Parse each rating input field
      for (let i = 1; i <= 10; i++) {
        const input = doc.querySelector(`#sm${i}`);
        if (input && input.value && input.value.trim()) {
          descriptions[`sm${i}`] = input.value.trim();
        }
      }
      
      // Cache the descriptions
      chrome.storage.local.set({ 'ratingDescriptions': descriptions });
      
      callback(descriptions);
    })
    .catch(error => {
      // Try alternative approach - check if user has any rating descriptions in current page
      checkCurrentPageForDescriptions(callback);
    });
}

function checkCurrentPageForDescriptions(callback) {
  // Create some default descriptions for testing
  const testDescriptions = {
    'sm1': '1: terrible',
    'sm2': '2: not for me', 
    'sm3': '3: fine',
    'sm4': '4: decent',
    'sm5': '5: good',
    'sm6': '6: pretty good',
    'sm7': '7: fire',
    'sm8': '8: incredible', 
    'sm9': '9: damn near perfect',
    'sm10': '10: favorites of all time'
  };
  
  // Cache the test descriptions
  chrome.storage.local.set({ 'ratingDescriptions': testDescriptions });
  
  callback(testDescriptions);
}
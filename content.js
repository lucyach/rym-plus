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
  }
});

function handleDefaultToRatings() {
  // Only apply on user profile pages (URLs like /~username or /user/username)
  if (!window.location.pathname.match(/\/(~|user\/)/)) {
    console.log('Not on a user profile page - skipping default to ratings');
    return;
  }
  
  // Get user preference for defaulting to ratings view
  chrome.storage.sync.get(['defaultToRatings'], function(result) {
    console.log('handleDefaultToRatings - defaultToRatings setting:', result.defaultToRatings);
    
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
    console.log('RYM Plus: Switching to ratings view');
    ratingsButton.click();
  } else {
    console.log('RYM Plus: Ratings button not found - may not be on a user profile with music');
  }
}
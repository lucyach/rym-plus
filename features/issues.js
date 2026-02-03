// Issues Section Hiding Feature
// Handles hiding/removing the issues/marketplace section from album pages

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

// Export functions for use in main content script
window.RYMPlusFeatures = window.RYMPlusFeatures || {};
window.RYMPlusFeatures.issues = {
  handle: handleIssuesSection,
  toggle: toggleIssuesSection
};
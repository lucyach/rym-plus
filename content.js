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
  
  // Only handle issues section hiding
  handleIssuesSection();
}

function handleIssuesSection() {
  // Get user preference for hiding issues
  chrome.storage.sync.get(['hideIssues'], function(result) {
    console.log('handleIssuesSection - hideIssues setting:', result.hideIssues);
    toggleIssuesSection(result.hideIssues === true);
  });
}

function toggleIssuesSection(hide) {
  console.log('toggleIssuesSection called with hide =', hide);
  
  // Find ALL issues sections (there might be multiple)
  const issuesSelectors = [
    '.section_issues.section_outer',
    '.section_issues',
    '.album_issues',
    '.release_issues', 
    '.issues_section',
    '[class*="issues"]',
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
  
  // Fallback: look for sections containing purchase-related text
  if (removedCount === 0) {
    console.log('Trying fallback method to find issues section...');
    const sections = document.querySelectorAll('div, section, table');
    for (const section of sections) {
      const text = section.textContent.toLowerCase();
      if ((text.includes('buy') || text.includes('purchase') || text.includes('marketplace') || text.includes('available') || text.includes('format')) && 
          section.querySelectorAll('a').length > 2) {
        
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
    
    // Debug: log all section elements
    const allSections = document.querySelectorAll('[class*="section"]');
    console.log('All elements with "section" in class name:', 
      Array.from(allSections).map(el => ({
        className: el.className,
        text: el.textContent.substring(0, 50)
      }))
    );
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleIssues') {
    toggleIssuesSection(request.hideIssues);
    sendResponse({ success: true });
  }
});
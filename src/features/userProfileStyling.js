// User Profile Styling Feature
// Fixes spacing and styling issues on user profile pages

function handleUserProfileStyling() {
  // Only apply on user profile pages (URLs like /~username)
  if (!window.location.pathname.match(/\/~[^\/]+\/?$/)) {
    return;
  }
  
  // Get user preference for fixing profile styling
  chrome.storage.sync.get(['fixProfileStyling'], function(result) {
    if (result.fixProfileStyling === true) {
      // Apply styling improvements immediately and on potential dynamic updates
      applyProfileStyling();
      
      // Also apply button styling
      if (window.RYMPlusFeatures.buttonStyling) {
        window.RYMPlusFeatures.buttonStyling.apply();
      }
      
      // Also observe for any dynamic content changes
      const mutationObserver = new MutationObserver(function(mutations) {
        let shouldReapply = false;
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE && 
                  (node.classList?.contains('mbgen') || node.querySelector?.('.mbgen'))) {
                shouldReapply = true;
              }
            });
          }
        });
        
        if (shouldReapply) {
          setTimeout(applyProfileStyling, 100);
        }
      });
      
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Store observer for cleanup
      window.rymPlusProfileObserver = mutationObserver;
    }
  });
}

function applyProfileStyling() {
  // Fix compatibility list box sizing - target the specific table structure
  const compatibilityTables = document.querySelectorAll('table.mbgen');
  
  compatibilityTables.forEach(table => {
    const tableText = table.textContent || '';
    
    // Check if this is a compatibility list table by looking for the specific text pattern
    if (tableText.includes('compatibility list:') && tableText.includes('Music')) {
      
      // Make the table fit better within its container
      if (!table.hasAttribute('data-rym-plus-styled')) {
        table.setAttribute('data-rym-plus-styled', 'true');
        
        // Store original styles
        const originalStyle = table.getAttribute('style') || '';
        table.setAttribute('data-rym-plus-original-style', originalStyle);
        
        // Apply better sizing styles
        const newStyle = originalStyle + 
          '; max-width: 100%; width: auto; table-layout: auto; word-wrap: break-word;';
        table.setAttribute('style', newStyle);
        
        // Style the content cell specifically
        const contentCell = table.querySelector('td');
        if (contentCell && !contentCell.hasAttribute('data-rym-plus-styled')) {
          contentCell.setAttribute('data-rym-plus-styled', 'true');
          
          const cellOriginalStyle = contentCell.getAttribute('style') || '';
          contentCell.setAttribute('data-rym-plus-original-style', cellOriginalStyle);
          
          // Apply responsive styling to the cell content
          const cellNewStyle = cellOriginalStyle + 
            '; word-wrap: break-word; overflow-wrap: break-word; max-width: 500px; white-space: normal;';
          contentCell.setAttribute('style', cellNewStyle);
          
          // Also ensure the text content doesn't overflow
          const boldElement = contentCell.querySelector('b');
          if (boldElement && !boldElement.hasAttribute('data-rym-plus-styled')) {
            boldElement.setAttribute('data-rym-plus-styled', 'true');
            
            const boldOriginalStyle = boldElement.getAttribute('style') || '';
            boldElement.setAttribute('data-rym-plus-original-style', boldOriginalStyle);
            
            const boldNewStyle = boldOriginalStyle + 
              '; display: block; max-width: 100%; overflow-wrap: break-word;';
            boldElement.setAttribute('style', boldNewStyle);
          }
        }
      }
    }
  });
  
  // Fix spacing between music toolbar and content tabs
  const friendsTabs = document.querySelectorAll('#ftabfriends, #ftabfavs, #ftabfavd');
  friendsTabs.forEach(tab => {
    if (!tab.hasAttribute('data-rym-plus-spaced')) {
      tab.setAttribute('data-rym-plus-spaced', 'true');
      
      const originalStyle = tab.getAttribute('style') || '';
      tab.setAttribute('data-rym-plus-original-tab-style', originalStyle);
      
      // Add top margin to create space between toolbar and content
      const newStyle = originalStyle + '; margin-top: 10px;';
      tab.setAttribute('style', newStyle);
    }
  });
}

function removeProfileStyling() {
  // Remove styling from compatibility list tables
  const styledTables = document.querySelectorAll('table.mbgen[data-rym-plus-styled]');
  styledTables.forEach(table => {
    const originalStyle = table.getAttribute('data-rym-plus-original-style');
    if (originalStyle) {
      table.setAttribute('style', originalStyle);
    } else {
      table.removeAttribute('style');
    }
    table.removeAttribute('data-rym-plus-styled');
    table.removeAttribute('data-rym-plus-original-style');
  });
  
  // Remove styling from cells
  const styledCells = document.querySelectorAll('td[data-rym-plus-styled]');
  styledCells.forEach(cell => {
    const originalStyle = cell.getAttribute('data-rym-plus-original-style');
    if (originalStyle) {
      cell.setAttribute('style', originalStyle);
    } else {
      cell.removeAttribute('style');
    }
    cell.removeAttribute('data-rym-plus-styled');
    cell.removeAttribute('data-rym-plus-original-style');
  });
  
  // Remove styling from bold elements
  const styledBold = document.querySelectorAll('b[data-rym-plus-styled]');
  styledBold.forEach(bold => {
    const originalStyle = bold.getAttribute('data-rym-plus-original-style');
    if (originalStyle) {
      bold.setAttribute('style', originalStyle);
    } else {
      bold.removeAttribute('style');
    }
    bold.removeAttribute('data-rym-plus-styled');
    bold.removeAttribute('data-rym-plus-original-style');
  });
  
  // Remove spacing from tabs
  const spacedTabs = document.querySelectorAll('#ftabfriends[data-rym-plus-spaced], #ftabfavs[data-rym-plus-spaced], #ftabfavd[data-rym-plus-spaced]');
  spacedTabs.forEach(tab => {
    const originalStyle = tab.getAttribute('data-rym-plus-original-tab-style');
    if (originalStyle) {
      tab.setAttribute('style', originalStyle);
    } else {
      tab.removeAttribute('style');
    }
    tab.removeAttribute('data-rym-plus-spaced');
    tab.removeAttribute('data-rym-plus-original-tab-style');
  });
  
  // Stop observing
  if (window.rymPlusProfileObserver) {
    window.rymPlusProfileObserver.disconnect();
    window.rymPlusProfileObserver = null;
  }
}

function toggleProfileStyling(enable) {
  if (enable) {
    applyProfileStyling();
    // Also enable button styling
    if (window.RYMPlusFeatures.buttonStyling) {
      window.RYMPlusFeatures.buttonStyling.apply();
    }
  } else {
    removeProfileStyling();
    // Also disable button styling
    if (window.RYMPlusFeatures.buttonStyling) {
      window.RYMPlusFeatures.buttonStyling.remove();
    }
  }
}

// Export functions for use in main content script
window.RYMPlusFeatures = window.RYMPlusFeatures || {};
window.RYMPlusFeatures.userProfileStyling = {
  handle: handleUserProfileStyling,
  toggle: toggleProfileStyling,
  apply: applyProfileStyling,
  remove: removeProfileStyling
};
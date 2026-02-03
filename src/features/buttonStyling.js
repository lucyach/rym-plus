// Button Styling Feature
// Applies RYM's native button styling to form buttons for consistency

function handleButtonStyling() {
  // Apply styling to all pages
  chrome.storage.sync.get(['styleButtons'], function(result) {
    if (result.styleButtons === true) {
      applyButtonStyling();
    }
  });
}

function toggleButtonStyling(enable) {
  console.log('toggleButtonStyling called with:', enable);
  
  if (enable) {
    applyButtonStyling();
  } else {
    removeButtonStyling();
  }
}

function applyButtonStyling() {
  console.log('Applying RYM button styling...');
  
  // Target input buttons with navigation symbols (exact matches and those ending with symbols)
  const buttonSelectors = [
    'input[type="submit"][value=">"]',     // Exact ">" 
    'input[type="button"][value=">"]',    // Exact ">"
    'input[type="submit"][value="<"]',     // Exact "<"
    'input[type="button"][value="<"]',    // Exact "<"
    'input[type="submit"][value=">>"]',    // Exact ">>"
    'input[type="button"][value=">>"]',   // Exact ">>"
    'input[type="submit"][value="<<"]',    // Exact "<<"
    'input[type="button"][value="<<"]',   // Exact "<<"
    'input[type="submit"][value$=" >"]',   // Ending with " >"
    'input[type="button"][value$=" >"]',  // Ending with " >"
    'input[type="submit"][value$=" <"]',   // Ending with " <"
    'input[type="button"][value$=" <"]',  // Ending with " <"
    'input[type="submit"][value$=" >>"]',  // Ending with " >>"
    'input[type="button"][value$=" >>"]', // Ending with " >>"
    'input[type="submit"][value$=" <<"]',  // Ending with " <<"
    'input[type="button"][value$=" <<"]', // Ending with " <<"
    'input[type="submit"][value$="&gt;"]',    // Ending with HTML entity &gt;
    'input[type="button"][value$="&gt;"]',   // Ending with HTML entity &gt;
    'input[type="submit"][value$="&lt;"]',    // Ending with HTML entity &lt;
    'input[type="button"][value$="&lt;"]',   // Ending with HTML entity &lt;
    'input[type="submit"][value$="&gt;&gt;"]',  // Ending with &gt;&gt;
    'input[type="button"][value$="&gt;&gt;"]'   // Ending with &gt;&gt;
  ];
  
  let styledCount = 0;
  
  buttonSelectors.forEach(selector => {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(button => {
      // Skip if already styled
      if (button.classList.contains('rym-plus-styled-button')) {
        return;
      }
      
      // Store original classes if any
      const originalClasses = Array.from(button.classList);
      button.setAttribute('data-rym-plus-original-classes', originalClasses.join(' '));
      
      // Clear existing classes and apply RYM's button classes
      button.className = 'btn blue_btn btn_small rym-plus-styled-button';
      
      // Preserve important inline styles but adjust for RYM button styling
      const currentStyle = button.getAttribute('style');
      if (currentStyle) {
        button.setAttribute('data-rym-plus-original-style', currentStyle);
        
        // Keep certain styles but remove conflicting ones
        let newStyle = currentStyle
          .replace(/height\s*:\s*[^;]+;?/gi, '') // Remove height, let RYM classes handle it
          .replace(/background[^;]*;?/gi, '') // Remove background
          .replace(/border[^;]*;?/gi, '') // Remove border
          .replace(/color[^;]*;?/gi, '') // Remove color
          .replace(/padding[^;]*;?/gi, '') // Remove padding
          .replace(/font[^;]*;?/gi, ''); // Remove font styles
        
        button.setAttribute('style', newStyle);
      }
      
      styledCount++;
      console.log('Styled navigation button:', button.outerHTML.substring(0, 100));
    });
  });
  
  // Also handle buttons that might be added dynamically
  observeForNewButtons();
  
  if (styledCount > 0) {
    console.log(`RYM Plus: Successfully styled ${styledCount} navigation button(s)`);
  } else {
    console.log('RYM Plus: No navigation buttons found to style');
  }
}

function removeButtonStyling() {
  console.log('Removing RYM button styling...');
  
  // Remove styling from previously styled buttons
  const styledButtons = document.querySelectorAll('.rym-plus-styled-button');
  styledButtons.forEach(button => {
    // Restore original classes
    const originalClasses = button.getAttribute('data-rym-plus-original-classes');
    if (originalClasses) {
      button.className = originalClasses;
      button.removeAttribute('data-rym-plus-original-classes');
    } else {
      // If no original classes, just remove our classes
      button.classList.remove('btn', 'blue_btn', 'btn_small', 'rym-plus-styled-button');
    }
    
    // Restore original inline styles
    const originalStyle = button.getAttribute('data-rym-plus-original-style');
    if (originalStyle) {
      button.setAttribute('style', originalStyle);
      button.removeAttribute('data-rym-plus-original-style');
    } else {
      button.removeAttribute('style');
    }
  });
  
  // Stop observing for new buttons
  if (window.rymPlusButtonObserver) {
    window.rymPlusButtonObserver.disconnect();
    window.rymPlusButtonObserver = null;
  }
  
  console.log(`RYM Plus: Removed styling from ${styledButtons.length} button(s)`);
}

function observeForNewButtons() {
  // Don't create multiple observers
  if (window.rymPlusButtonObserver) {
    return;
  }
  
  // Create a mutation observer to handle dynamically added buttons
  window.rymPlusButtonObserver = new MutationObserver(function(mutations) {
    let newButtonsFound = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a navigation input button
            const navButtons = [];
            
            // Check for navigation button patterns (exact matches and ending with symbols)
            const navButtonSelectors = [
              'input[type="submit"][value=">"]',
              'input[type="button"][value=">"]',
              'input[type="submit"][value="<"]',
              'input[type="button"][value="<"]',
              'input[type="submit"][value=">>"]',
              'input[type="button"][value=">>"]',
              'input[type="submit"][value="<<"]',
              'input[type="button"][value="<<"]',
              'input[type="submit"][value$=" >"]',
              'input[type="button"][value$=" >"]',
              'input[type="submit"][value$=" <"]',
              'input[type="button"][value$=" <"]',
              'input[type="submit"][value$=" >>"]',
              'input[type="button"][value$=" >>"]',
              'input[type="submit"][value$=" <<"]',
              'input[type="button"][value$=" <<"]',
              'input[type="submit"][value$="&gt;"]',
              'input[type="button"][value$="&gt;"]',
              'input[type="submit"][value$="&lt;"]',
              'input[type="button"][value$="&lt;"]',
              'input[type="submit"][value$="&gt;&gt;"]',
              'input[type="button"][value$="&gt;&gt;"]'
            ];
            
            navButtonSelectors.forEach(selector => {
              if (node.matches && node.matches(selector)) {
                navButtons.push(node);
              }
              
              // Also check children
              if (node.querySelectorAll) {
                const childButtons = node.querySelectorAll(selector);
                navButtons.push(...childButtons);
              }
            });
            
            // Style any new navigation buttons found
            navButtons.forEach(button => {
              if (!button.classList.contains('rym-plus-styled-button')) {
                // Store original classes and styles
                const originalClasses = Array.from(button.classList);
                button.setAttribute('data-rym-plus-original-classes', originalClasses.join(' '));
                
                const currentStyle = button.getAttribute('style');
                if (currentStyle) {
                  button.setAttribute('data-rym-plus-original-style', currentStyle);
                  
                  // Clean up conflicting styles
                  let newStyle = currentStyle
                    .replace(/height\s*:\s*[^;]+;?/gi, '')
                    .replace(/background[^;]*;?/gi, '')
                    .replace(/border[^;]*;?/gi, '')
                    .replace(/color[^;]*;?/gi, '')
                    .replace(/padding[^;]*;?/gi, '')
                    .replace(/font[^;]*;?/gi, '');
                  
                  button.setAttribute('style', newStyle);
                }
                
                // Apply RYM button classes
                button.className = 'btn blue_btn btn_small rym-plus-styled-button';
                newButtonsFound = true;
              }
            });
          }
        });
      }
    });
    
    if (newButtonsFound) {
      console.log('RYM Plus: Styled newly added navigation button(s)');
    }
  });
  
  // Start observing
  window.rymPlusButtonObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Export functions for use in main content script
window.RYMPlusFeatures = window.RYMPlusFeatures || {};
window.RYMPlusFeatures.buttonStyling = {
  handle: handleButtonStyling,
  toggle: toggleButtonStyling,
  apply: applyButtonStyling,
  remove: removeButtonStyling
};
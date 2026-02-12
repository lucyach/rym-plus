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
      
      // Add delay for dynamic content like followers list
      setTimeout(() => {
        applyProfileStyling();
      }, 1000);
      
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
                  (node.classList?.contains('mbgen') || node.querySelector?.('.mbgen') ||
                   node.id === 'ftabfriends' || node.querySelector?.('#users'))) {
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
  
  // Improve followers box styling
  const followersTable = document.querySelector('table#users.mbgen');
  if (followersTable && !followersTable.hasAttribute('data-rym-plus-followers-styled')) {
    followersTable.setAttribute('data-rym-plus-followers-styled', 'true');
    
    // Style all follower cells
    const followerCells = followersTable.querySelectorAll('td');
    followerCells.forEach((cell, index) => {
      if (!cell.hasAttribute('data-rym-plus-follower-styled')) {
        cell.setAttribute('data-rym-plus-follower-styled', 'true');
        
        // Store original styles
        const originalStyle = cell.getAttribute('style') || '';
        cell.setAttribute('data-rym-plus-original-follower-style', originalStyle);
        
        // Apply uniform cell styling with high specificity
        const cellStyle = 
          'min-height: 90px !important; width: 80px !important; height: 90px !important;' +
          ' box-sizing: border-box !important; padding: 8px !important;' +
          ' vertical-align: top !important; position: relative !important;' +
          ' cursor: pointer !important; transition: background-color 0.2s !important;' +
          ' border: 1px solid transparent !important; text-align: center !important;';
        cell.setAttribute('style', cellStyle);
        
        // Make entire cell clickable
        const userLink = cell.querySelector('a.user');
        if (userLink) {
          const href = userLink.getAttribute('href');
          if (href && !cell.hasAttribute('data-rym-plus-clickable')) {
            cell.setAttribute('data-rym-plus-clickable', href);
            
            // Remove pointer events from child links to prevent double-clicking
            const childLinks = cell.querySelectorAll('a');
            childLinks.forEach(link => {
              const linkOriginalStyle = link.getAttribute('style') || '';
              link.setAttribute('data-rym-plus-original-link-style', linkOriginalStyle);
              link.setAttribute('style', linkOriginalStyle + '; pointer-events: none !important;');
            });
            
            // Add click handler to entire cell
            cell.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = href;
            });
            
            // Add hover effect
            cell.addEventListener('mouseenter', function() {
              this.style.backgroundColor = '#f0f0f0';
            });
            
            cell.addEventListener('mouseleave', function() {
              this.style.backgroundColor = 'transparent';
            });
          }
        }
        
        // Standardize profile images
        const profileImg = cell.querySelector('img');
        if (profileImg) {
          const imgOriginalStyle = profileImg.getAttribute('style') || '';
          const imgOriginalWidth = profileImg.getAttribute('width') || '';
          profileImg.setAttribute('data-rym-plus-original-img-style', imgOriginalStyle);
          profileImg.setAttribute('data-rym-plus-original-width', imgOriginalWidth);
          
          // Remove width attribute and apply consistent styling
          profileImg.removeAttribute('width');
          profileImg.setAttribute('style', 
            'width: 70px !important; height: 70px !important; object-fit: cover !important;' +
            ' border-radius: 4px !important; display: block !important; margin: 0 auto 4px auto !important;' +
            ' aspect-ratio: 1 / 1 !important;');
        }
        
        // Style username text while preserving original font size and color
        const usernameLink = cell.querySelector('a.user');
        if (usernameLink) {
          const usernameOriginalStyle = usernameLink.getAttribute('style') || '';
          usernameLink.setAttribute('data-rym-plus-original-username-style', usernameOriginalStyle);
          
          // Extract existing font-size and color if present
          const computedStyle = window.getComputedStyle(usernameLink);
          const originalFontSize = computedStyle.fontSize;
          const originalColor = computedStyle.color;
          
          usernameLink.setAttribute('style', 
            `line-height: 1.2 !important; display: block !important; text-align: center !important;` +
            ` word-wrap: break-word !important; max-width: 64px !important; margin: 0 auto !important;` +
            ` font-size: ${originalFontSize}; color: ${originalColor};`);
        }
        
        // Handle cells without images (profile picture missing)
        if (!profileImg) {
          const boldElement = cell.querySelector('b');
          if (boldElement) {
            const boldOriginalStyle = boldElement.getAttribute('style') || '';
            boldElement.setAttribute('data-rym-plus-original-bold-style', boldOriginalStyle);
            boldElement.setAttribute('style', boldOriginalStyle + 
              '; margin-top: 20px !important; display: block !important;');
          }
        }
      }
    });
  }
  
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
  
  // Remove followers box styling
  const followersTable = document.querySelector('table#users.mbgen[data-rym-plus-followers-styled]');
  if (followersTable) {
    followersTable.removeAttribute('data-rym-plus-followers-styled');
    
    const followerCells = followersTable.querySelectorAll('td[data-rym-plus-follower-styled]');
    followerCells.forEach(cell => {
      // Restore original cell style
      const originalStyle = cell.getAttribute('data-rym-plus-original-follower-style');
      if (originalStyle) {
        cell.setAttribute('style', originalStyle);
      } else {
        cell.removeAttribute('style');
      }
      
      // Remove click handler and attributes
      cell.removeAttribute('data-rym-plus-follower-styled');
      cell.removeAttribute('data-rym-plus-original-follower-style');
      cell.removeAttribute('data-rym-plus-clickable');
      
      // Restore child link styles
      const childLinks = cell.querySelectorAll('a[data-rym-plus-original-link-style]');
      childLinks.forEach(link => {
        const originalLinkStyle = link.getAttribute('data-rym-plus-original-link-style');
        if (originalLinkStyle) {
          link.setAttribute('style', originalLinkStyle);
        } else {
          link.removeAttribute('style');
        }
        link.removeAttribute('data-rym-plus-original-link-style');
      });
      
      // Restore image styles and width attribute
      const profileImg = cell.querySelector('img[data-rym-plus-original-img-style]');
      if (profileImg) {
        const originalImgStyle = profileImg.getAttribute('data-rym-plus-original-img-style');
        const originalWidth = profileImg.getAttribute('data-rym-plus-original-width');
        
        if (originalImgStyle) {
          profileImg.setAttribute('style', originalImgStyle);  
        } else {
          profileImg.removeAttribute('style');
        }
        
        if (originalWidth) {
          profileImg.setAttribute('width', originalWidth);
        }
        
        profileImg.removeAttribute('data-rym-plus-original-img-style');
        profileImg.removeAttribute('data-rym-plus-original-width');
      }
      
      // Restore username styles
      const usernameLink = cell.querySelector('a.user[data-rym-plus-original-username-style]');
      if (usernameLink) {
        const originalUsernameStyle = usernameLink.getAttribute('data-rym-plus-original-username-style');
        if (originalUsernameStyle) {
          usernameLink.setAttribute('style', originalUsernameStyle);
        } else {
          usernameLink.removeAttribute('style');
        }
        usernameLink.removeAttribute('data-rym-plus-original-username-style');
      }
      
      // Restore bold element styles
      const boldElement = cell.querySelector('b[data-rym-plus-original-bold-style]');
      if (boldElement) {
        const originalBoldStyle = boldElement.getAttribute('data-rym-plus-original-bold-style');
        if (originalBoldStyle) {
          boldElement.setAttribute('style', originalBoldStyle);
        } else {
          boldElement.removeAttribute('style');
        }
        boldElement.removeAttribute('data-rym-plus-original-bold-style');
      }
      
      // Clone cell to remove event listeners
      const newCell = cell.cloneNode(true);
      cell.parentNode.replaceChild(newCell, cell);
    });
  }
  
  // Stop observing
  if (window.rymPlusProfileObserver) {
    window.rymPlusProfileObserver.disconnect();
    window.rymPlusProfileObserver = null;
  }
}

function toggleProfileStyling(enable) {
  if (enable) {
    applyProfileStyling();
    // Add delay for dynamic content and force re-apply
    setTimeout(() => {
      applyProfileStyling();
    }, 500);
    
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
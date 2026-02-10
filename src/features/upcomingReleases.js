// Feature: Hide upcoming releases from new music section
// This feature filters out releases that haven't been released yet

// Store the filter state globally to avoid chrome.storage dependency issues  
let isUpcomingReleasesFilterEnabled = false;
let isCurrentlyProcessing = false;

// Initialize the upcoming releases filter
function initUpcomingReleasesFilter() {
  
  if (isOnNewReleasesPage()) {
    handleUpcomingReleases();
    observePageChanges();
    observeSortButtons();
  }
}

// Check if we're on a new releases page
function isOnNewReleasesPage() {
  return window.location.pathname.includes('new-releases') || 
         window.location.pathname.includes('newreleases') ||
         document.querySelector('.newreleases_itembox');
}

// Toggle the upcoming releases filter on/off
function toggleUpcomingReleases(hide) {
  isUpcomingReleasesFilterEnabled = hide;
  
  if (hide) {
    hideUpcomingReleases();
  } else {
    showAllReleases();
  }
}

function hideUpcomingReleases() {
  // Check for new releases pages - be less restrictive
  const isNewReleasesPage = window.location.pathname.includes('new-releases') || 
                           window.location.pathname.includes('newreleases') ||
                           document.querySelector('.newreleases_itembox');
                           
  if (!isNewReleasesPage) {
    return;
  }

  // Prevent multiple simultaneous processing
  if (isCurrentlyProcessing) {
    return;
  }
  
  isCurrentlyProcessing = true;

  // Get all release items
  const releaseItems = document.querySelectorAll('.newreleases_itembox');
  
  if (releaseItems.length === 0) {
    isCurrentlyProcessing = false;
    return;
  }

  let hiddenCount = 0;
  const today = new Date();
  const startTime = Date.now();

  // Show loading message immediately
  updateHiddenReleasesNotice(0, true);

  // Process releases in larger batches with smart skipping for better performance
  const batchSize = 100; // Reduced slightly to prevent crashes
  let currentIndex = 0;
  let consecutiveFutureReleases = 0;
  
  function processBatch() {
    const endIndex = Math.min(currentIndex + batchSize, releaseItems.length);
    let batchHiddenCount = 0;
    let batchFutureCount = 0;
    
    // Process current batch
    for (let i = currentIndex; i < endIndex; i++) {
      const item = releaseItems[i];
      
      // Find the release date element
      const dateElement = item.querySelector('.newreleases_item_releasedate');
      if (!dateElement) {
        continue;
      }

      const dateText = dateElement.textContent.trim();
      
      // Quick check for obvious future years to skip detailed parsing
      const quickYearCheck = dateText.match(/\b(202[7-9]|20[3-9]\d)\b/);
      if (quickYearCheck) {
        // Definitely a future release, skip detailed parsing
        item.style.display = 'none';
        item.classList.add('rym-plus-hidden-upcoming');
        batchHiddenCount++;
        batchFutureCount++;
        consecutiveFutureReleases++;
        continue;
      }
      
      const releaseDate = parseReleaseDate(dateText);
      
      if (releaseDate) {
        // Compare dates: hide if release date is AFTER today
        if (releaseDate > today) {
          item.style.display = 'none';
          item.classList.add('rym-plus-hidden-upcoming');
          batchHiddenCount++;
          batchFutureCount++;
          consecutiveFutureReleases++;
        } else {
          // Make sure it's visible if it was previously hidden
          item.style.display = '';
          item.classList.remove('rym-plus-hidden-upcoming');
          consecutiveFutureReleases = 0; // Reset counter
        }
      } else {
        // Keep items with unparseable dates visible
        item.style.display = '';
        item.classList.remove('rym-plus-hidden-upcoming');
        consecutiveFutureReleases = 0; // Reset counter
      }
    }
    
    hiddenCount += batchHiddenCount;
    currentIndex = endIndex;
    
    // Smart skipping: if we've hit many consecutive future releases, skip ahead more aggressively
    if (consecutiveFutureReleases > 40 && currentIndex < releaseItems.length) {
      const skipAheadCount = Math.min(150, releaseItems.length - currentIndex);
      
      // Skip ahead and hide them all (they're likely future releases)
      for (let i = currentIndex; i < currentIndex + skipAheadCount; i++) {
        const item = releaseItems[i];
        item.style.display = 'none';
        item.classList.add('rym-plus-hidden-upcoming');
        hiddenCount++;
      }
      
      currentIndex += skipAheadCount;
      consecutiveFutureReleases += skipAheadCount;
    }
    
    // Update progress continuously during processing
    updateHiddenReleasesNotice(hiddenCount, true);
    
    // Continue or finish
    if (currentIndex < releaseItems.length) {
      // Use requestAnimationFrame for better browser performance
      requestAnimationFrame(() => {
        setTimeout(processBatch, 8); // Slightly longer delay to prevent crashes
      });
    } else {
      // Processing completely finished - show final results only if releases are visible
      isCurrentlyProcessing = false;
      
      // Check if there are visible releases on screen before showing count
      setTimeout(() => {
        const visibleReleases = Array.from(document.querySelectorAll('.newreleases_itembox')).filter(item => {
          return !item.classList.contains('rym-plus-hidden-upcoming') && 
                 item.style.display !== 'none' &&
                 item.offsetParent !== null; // Actually visible in DOM
        });
        
        // Only show the count if there are visible releases on screen
        if (visibleReleases.length > 0) {
          updateHiddenReleasesNotice(hiddenCount, false);
        } else {
          // Keep showing loading message if no releases are visible yet
          updateHiddenReleasesNotice(hiddenCount, true);
        }
      }, 100);
      
      // Check if we need to load more content  
      setTimeout(() => {
        checkAndLoadMoreIfNeeded();
      }, 100);
    }
  }
  
  // Start processing with a small delay
  setTimeout(processBatch, 50);
}

function showAllReleases() {
  // Show all previously hidden releases
  const hiddenItems = document.querySelectorAll('.rym-plus-hidden-upcoming');
  hiddenItems.forEach(item => {
    item.style.display = '';
    item.classList.remove('rym-plus-hidden-upcoming');
  });

  // Remove the hidden releases notice
  removeHiddenReleasesNotice();
}

// Cache parsed dates to avoid re-parsing the same dates
const dateCache = new Map();

function parseReleaseDate(dateText) {
  if (!dateText || dateText.trim() === '') return null;
  
  const cleanText = dateText.trim();
  
  // Check cache first
  if (dateCache.has(cleanText)) {
    return dateCache.get(cleanText);
  }
  
  try {
    let parsedDate;
    
    // Handle full dates like "22 February 2026"
    if (/\d{1,2}\s+\w+\s+\d{4}/.test(cleanText)) {
      parsedDate = new Date(cleanText);
    }
    // Handle month-year like "February 2026" (assume 1st of month)
    else if (/^\w+\s+\d{4}$/.test(cleanText)) {
      parsedDate = new Date(cleanText + ' 1');
    }
    // Handle year only like "2026" (assume January 1st)
    else if (/^\d{4}$/.test(cleanText)) {
      parsedDate = new Date(parseInt(cleanText), 0, 1); // Month 0 = January
    }
    else {
      // Cache null result for unrecognized formats
      dateCache.set(cleanText, null);
      return null;
    }
    
    // Validate the parsed date
    if (isNaN(parsedDate.getTime())) {
      dateCache.set(cleanText, null);
      return null;
    }
    
    // Cache the result
    dateCache.set(cleanText, parsedDate);
    return parsedDate;
  } catch (error) {
    dateCache.set(cleanText, null);
    return null;
  }
}

function checkAndLoadMoreIfNeeded() {
  const allReleases = document.querySelectorAll('.newreleases_itembox');
  const hiddenReleases = document.querySelectorAll('.newreleases_itembox.rym-plus-hidden-upcoming');
  const visibleReleases = Array.from(allReleases).filter(item => {
    return !item.classList.contains('rym-plus-hidden-upcoming') && 
           item.style.display !== 'none' &&
           item.offsetParent !== null; // Actually visible in DOM
  });
  
  const viewMoreButton = document.querySelector('#view_more_new_releases_all');
  
  // If we have very few visible releases and there's a "View More" button, load more
  if (visibleReleases.length <= 5 && viewMoreButton && viewMoreButton.style.display !== 'none' && !viewMoreButton.classList.contains('rym-plus-loading')) {
    loadMoreReleases();
  }
}

// Automatically click "View More..." button to load additional content
function loadMoreReleases(attempt = 1, maxAttempts = 3) {
  if (attempt > maxAttempts) {
    return;
  }
  
  const viewMoreButton = document.querySelector('#view_more_new_releases_all');
  if (!viewMoreButton || viewMoreButton.style.display === 'none' || viewMoreButton.classList.contains('rym-plus-loading')) {
    return;
  }
  
  // Mark as loading to prevent multiple simultaneous loads
  viewMoreButton.classList.add('rym-plus-loading');
  
  // Store the current count of items before loading more
  const currentItemCount = document.querySelectorAll('.newreleases_itembox').length;
  
  // Click the "View More" button using RYM's own function
  try {
    // Try to use RYM's native function first
    if (typeof RYMnewMusic !== 'undefined' && RYMnewMusic.onClick_viewMoreItems) {
      RYMnewMusic.onClick_viewMoreItems('new_releases_all', viewMoreButton);
    } else {
      // Fallback to direct click
      viewMoreButton.click();
    }
    
    // Wait for new content to load, then check results
    setTimeout(() => {
      const newItemCount = document.querySelectorAll('.newreleases_itembox').length;
      viewMoreButton.classList.remove('rym-plus-loading');
      
      if (newItemCount > currentItemCount) {
        // Wait a bit more for content to stabilize, then reapply filter
        setTimeout(() => {
          // Only call if not already processing
          if (isUpcomingReleasesFilterEnabled && !isCurrentlyProcessing) {
            hideUpcomingReleases();
          }
        }, 500);
        
      }
    }, 3000); // Wait 3 seconds for content to load
    
  } catch (error) {
    viewMoreButton.classList.remove('rym-plus-loading');
  }
}

// Add or update the notice about hidden releases
function updateHiddenReleasesNotice(hiddenCount, isLoading = false) {
  // Remove existing notice first
  removeHiddenReleasesNotice();
  
  if (isLoading || hiddenCount > 0) {
    const notice = document.createElement('div');
    notice.id = 'rym-plus-hidden-releases-notice';
    notice.style.cssText = `
      background-color: #f0f0f0; 
      border: 1px solid #ccc; 
      border-radius: 4px; 
      padding: 8px 12px; 
      margin: 10px 0px; 
      font-size: 12px; 
      color: #666;
      text-align: center;
    `;
    
    if (isLoading) {
      notice.textContent = `RYM Plus: Please wait as we filter through the RYM database. Hidden ${hiddenCount} upcoming release${hiddenCount === 1 ? '' : 's'} so far...`;
    } else {
      notice.textContent = `RYM Plus: Hidden ${hiddenCount} upcoming release${hiddenCount === 1 ? '' : 's'}`;
    }
    
    // Try multiple container selectors to find the right place to insert
    const containerSelectors = [
      '#newreleases_container_all',
      '.newreleases_content', 
      '.new_releases_container',
      '#main_content',
      'body'
    ];
    
    let inserted = false;
    for (const selector of containerSelectors) {
      const container = document.querySelector(selector);
      
      if (container) {
        if (container.firstChild) {
          container.insertBefore(notice, container.firstChild);
        } else {
          container.appendChild(notice);
        }
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      document.body.insertAdjacentElement('afterbegin', notice);
    }
  }
}

function removeHiddenReleasesNotice() {
  const existingNotice = document.getElementById('rym-plus-hidden-releases-notice');
  if (existingNotice) {
    existingNotice.remove();
  }
}

function handleUpcomingReleases() {
  // Get user preference for hiding upcoming releases with error handling
  try {
    chrome.storage.sync.get(['hideUpcomingReleases'], function(result) {
      if (chrome.runtime.lastError) {
        // Fallback: assume feature is enabled
        isUpcomingReleasesFilterEnabled = true;
        toggleUpcomingReleases(true);
        return;
      }
      isUpcomingReleasesFilterEnabled = result.hideUpcomingReleases === true;
      toggleUpcomingReleases(isUpcomingReleasesFilterEnabled);
    });
  } catch (error) {
    // Fallback: assume feature is enabled if storage is unavailable
    isUpcomingReleasesFilterEnabled = true;
    toggleUpcomingReleases(true);
  }
}

// Re-run the filter when the page content changes (for dynamic loading)
function observePageChanges() {
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    mutations.forEach((mutation) => {
      // Check if new release items were added
      if (mutation.type === 'childList') {
        const addedNodes = Array.from(mutation.addedNodes);
        if (addedNodes.some(node => 
          node.nodeType === Node.ELEMENT_NODE && 
          (node.classList?.contains('newreleases_itembox') || 
           node.querySelector?.('.newreleases_itembox'))
        )) {
          shouldUpdate = true;
        }
      }
    });

    if (shouldUpdate) {
      // Use the stored filter state instead of chrome.storage to avoid context issues
      setTimeout(() => {
        if (isUpcomingReleasesFilterEnabled && !isCurrentlyProcessing) {
          hideUpcomingReleases();
        }
      }, 200);
    }
  });

  // Observe changes to the main container
  const container = document.querySelector('#newreleases_container_all, .newreleases_content');
  if (container) {
    observer.observe(container, {
      childList: true,
      subtree: true
    });
  }
}

function observeSortButtons() {
  // Listen for clicks on sort buttons
  const sortButtons = document.querySelectorAll('.newreleases_sort_btn');
  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Wait for new content to load after sort change
      setTimeout(() => {
        // Use stored state instead of chrome.storage to avoid context issues
        if (isUpcomingReleasesFilterEnabled && !isCurrentlyProcessing) {
          hideUpcomingReleases();
        }
      }, 1000); // Give time for AJAX to complete
      
      // Also try again after a longer delay in case it takes time
      setTimeout(() => {
        if (isUpcomingReleasesFilterEnabled && !isCurrentlyProcessing) {
          hideUpcomingReleases();
        }
      }, 2500);
    });
  });
}

// Handle messages from popup to toggle the filter
function handleUpcomingReleasesToggle(request, sender, sendResponse) {
  if (request.action === 'toggleUpcomingReleases') {
    isUpcomingReleasesFilterEnabled = request.enabled;
    toggleUpcomingReleases(request.enabled);
    if (sendResponse) {
      sendResponse({success: true});
    }
  }
}

// Debug helper functions for manual testing
if (typeof window.RYMDebugUpcoming === 'undefined') {
  window.RYMDebugUpcoming = {
    hideUpcoming: () => hideUpcomingReleases(),
    showAll: () => showAllReleases(),
    countReleases: () => {
      const total = document.querySelectorAll('.newreleases_itembox').length;
      const hidden = document.querySelectorAll('.rym-plus-hidden-upcoming').length;
      const visibleReleases = Array.from(document.querySelectorAll('.newreleases_itembox')).filter(item => {
        return !item.classList.contains('rym-plus-hidden-upcoming') && 
               item.style.display !== 'none' &&
               item.offsetParent !== null;
      });
      return { total, hidden, visible: visibleReleases.length };
    },
    loadMore: () => loadMoreReleases(),
    checkAndLoad: () => checkAndLoadMoreIfNeeded(),
    testAutoLoad: () => {
      // Simulate all releases being hidden to test auto-load
      document.querySelectorAll('.newreleases_itembox').forEach(item => {
        item.style.display = 'none';
        item.classList.add('rym-plus-hidden-upcoming');
      });
      checkAndLoadMoreIfNeeded();
    },
    // Enhanced debug helper
    enhance: () => {
      const allReleases = document.querySelectorAll('.newreleases_itembox');
      const hiddenReleases = document.querySelectorAll('.newreleases_itembox.rym-plus-hidden-upcoming');
      const visibleReleases = Array.from(allReleases).filter(item => {
        return !item.classList.contains('rym-plus-hidden-upcoming') && 
               item.style.display !== 'none' &&
               item.offsetParent !== null;
      });
      
      const viewMoreButton = document.querySelector('#view_more_new_releases_all');
      
      ('=== Enhanced Debug ===');
      return { total: allReleases.length, hidden: hiddenReleases.length, visible: visibleReleases.length };
    }
  };
}

// Export functions for use in content script
if (typeof window !== 'undefined') {
  window.initUpcomingReleasesFilter = initUpcomingReleasesFilter;
  window.handleUpcomingReleasesToggle = handleUpcomingReleasesToggle;
}
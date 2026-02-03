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
  
  // Add your RateYourMusic enhancement features here
  addCustomStyles();
  enhanceAlbumPages();
  enhanceRatingInterface();
}

function addCustomStyles() {
  // Add custom CSS classes or modifications
  document.body.classList.add('rym-plus-active');
}

function enhanceAlbumPages() {
  // Check if we're on an album page
  if (window.location.pathname.includes('/release/')) {
    console.log('Album page detected - adding enhancements');
    
    // Example: Add a custom button or feature
    const albumTitle = document.querySelector('.album_title');
    if (albumTitle) {
      const enhanceButton = document.createElement('button');
      enhanceButton.textContent = 'RYM+ Features';
      enhanceButton.className = 'rym-plus-button';
      enhanceButton.onclick = () => {
        alert('RYM Plus features activated!');
      };
      albumTitle.parentNode.insertBefore(enhanceButton, albumTitle.nextSibling);
    }
  }
}

function enhanceRatingInterface() {
  // Find rating elements and enhance them
  const ratingElements = document.querySelectorAll('.ui_rating_button');
  ratingElements.forEach(element => {
    element.addEventListener('click', () => {
      console.log('Rating clicked - RYM Plus can track this');
    });
  });
}

// Listen for dynamic content changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Re-run enhancements when new content is added
      enhanceRatingInterface();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
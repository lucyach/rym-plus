// Main entry point (this file is now replaced by the Chrome extension structure)
// The functionality is now split into:
// - content.js: Runs on RateYourMusic pages
// - background.js: Handles extension lifecycle
// - popup.js: Manages the extension popup
// 
// You can delete this file or use it for additional utility functions

console.log('RYM Plus - Chrome Extension Structure Created');

// Example utility functions that could be used by other scripts
const RYMUtils = {
  // Parse album information from page
  parseAlbumInfo() {
    const albumTitle = document.querySelector('.album_title');
    const artist = document.querySelector('.artist a');
    const releaseDate = document.querySelector('.release_date');
    
    return {
      title: albumTitle?.textContent?.trim(),
      artist: artist?.textContent?.trim(),
      releaseDate: releaseDate?.textContent?.trim()
    };
  },
  
  // Get current user's rating if available
  getCurrentRating() {
    const ratingElement = document.querySelector('.ui_rating_button.selected');
    return ratingElement ? parseInt(ratingElement.textContent) : null;
  },
  
  // Format rating display
  formatRating(rating) {
    return rating ? `${rating}/5` : 'Not Rated';
  }
};
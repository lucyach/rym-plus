// Streaming Links Feature
// Converts web player links to native app deep links for better user experience

// Verify we're on a RateYourMusic domain
function isRateYourMusicDomain() {
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'rateyourmusic.com' || hostname.endsWith('.rateyourmusic.com');
}

function handleStreamingLinks() {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    console.log('RYM Plus: Streaming links feature restricted to RateYourMusic domains only');
    return;
  }
  
  console.log('RYM Plus: Initializing streaming links feature...');
  
  // Get user preference for converting streaming links
  chrome.storage.sync.get(['convertStreamingLinks'], function(result) {
    const shouldConvert = result.convertStreamingLinks !== false; // Default to true
    console.log('RYM Plus: Streaming links conversion enabled:', shouldConvert);
    
    if (shouldConvert) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        convertStreamingLinks();
      }, 500);
    }
  });
}

function convertStreamingLinks() {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    return;
  }
  
  console.log('RYM Plus: Starting streaming links conversion...');
  
  let convertedCount = 0;
  
  try {
    // Find all streaming service links
    const mediaLinks = document.querySelectorAll('.ui_media_links a[href]');
    console.log('RYM Plus: Found', mediaLinks.length, 'media links');
    
    mediaLinks.forEach((link, index) => {
      const originalHref = link.getAttribute('href');
      console.log(`RYM Plus: Processing link ${index + 1}:`, originalHref);
      
      let newHref = null;
      
      // Convert Spotify links
      if (originalHref.includes('open.spotify.com')) {
        newHref = convertSpotifyLink(originalHref);
        console.log('RYM Plus: Spotify conversion result:', newHref);
      }
      // Convert Apple Music links
      else if (originalHref.includes('music.apple.com') || originalHref.includes('geo.music.apple.com')) {
        newHref = convertAppleMusicLink(originalHref);
        if (newHref === null) {
          console.log('RYM Plus: Apple Music conversion skipped (platform not supported)');
        } else {
          console.log('RYM Plus: Apple Music conversion result:', newHref);
        }
      }
      
      // Update the link if conversion was successful
      if (newHref && newHref !== originalHref) {
        // Store original URL for fallback
        link.setAttribute('data-original-href', originalHref);
        link.setAttribute('href', newHref);
        link.setAttribute('data-rym-plus-converted', 'true');
        link.setAttribute('title', link.getAttribute('title') + ' (App)');
        
        // Add click handler for Apple Music fallback
        if (newHref.startsWith('music://')) {
          addAppleMusicFallback(link, originalHref);
        }
        
        convertedCount++;
        
        console.log(`RYM Plus: Converted ${getServiceName(originalHref)} link:`, originalHref, '->', newHref);
      }
    });
    
    if (convertedCount > 0) {
      console.log(`RYM Plus: Converted ${convertedCount} streaming service links to app deep links`);
    } else {
      console.log('RYM Plus: No streaming links were converted');
    }
    
  } catch (error) {
    console.error('RYM Plus: Error converting streaming links:', error);
  }
}

function convertSpotifyLink(url) {
  try {
    // Convert https://open.spotify.com/album/[album_id] to spotify:album:[album_id]
    const albumMatch = url.match(/open\.spotify\.com\/album\/([a-zA-Z0-9]+)/);
    if (albumMatch) {
      return `spotify:album:${albumMatch[1]}`;
    }
    
    // Convert https://open.spotify.com/track/[track_id] to spotify:track:[track_id]
    const trackMatch = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (trackMatch) {
      return `spotify:track:${trackMatch[1]}`;
    }
    
    // Convert https://open.spotify.com/artist/[artist_id] to spotify:artist:[artist_id]
    const artistMatch = url.match(/open\.spotify\.com\/artist\/([a-zA-Z0-9]+)/);
    if (artistMatch) {
      return `spotify:artist:${artistMatch[1]}`;
    }
    
    // Convert https://open.spotify.com/playlist/[playlist_id] to spotify:playlist:[playlist_id]
    const playlistMatch = url.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
    if (playlistMatch) {
      return `spotify:playlist:${playlistMatch[1]}`;
    }
    
  } catch (error) {
    console.warn('RYM Plus: Error converting Spotify link:', url, error);
  }
  
  return null; // Return null if conversion failed
}

function convertAppleMusicLink(url) {
  try {
    // Check if we're on Windows - Apple Music deep links work differently
    const isWindows = navigator.platform.toLowerCase().includes('win');
    
    if (isWindows) {
      // On Windows, Apple Music app uses different protocol or may not support deep links
      // For now, let's not convert Apple Music links on Windows
      console.log('RYM Plus: Skipping Apple Music conversion on Windows (app deep links not reliable)');
      return null;
    }
    
    // Convert Apple Music album links to music:// deep links (macOS/iOS)
    // Pattern: https://geo.music.apple.com/[country]/album/[name]/[album_id]
    // or: https://music.apple.com/[country]/album/[name]/[album_id]
    const albumMatch = url.match(/music\.apple\.com\/[^\/]+\/album\/[^\/]+\/(\d+)/);
    if (albumMatch) {
      return `music://album/${albumMatch[1]}`;
    }
    
    // Convert Apple Music song links
    // Pattern: https://music.apple.com/[country]/album/[album_name]/[album_id]?i=[song_id]
    const songMatch = url.match(/music\.apple\.com\/[^\/]+\/album\/[^\/]+\/(\d+)\?i=(\d+)/);
    if (songMatch) {
      return `music://song/${songMatch[2]}`;
    }
    
    // Convert Apple Music artist links
    const artistMatch = url.match(/music\.apple\.com\/[^\/]+\/artist\/[^\/]+\/(\d+)/);
    if (artistMatch) {
      return `music://artist/${artistMatch[1]}`;
    }
    
    // Convert Apple Music playlist links
    const playlistMatch = url.match(/music\.apple\.com\/[^\/]+\/playlist\/[^\/]+\/pl\.([a-zA-Z0-9]+)/);
    if (playlistMatch) {
      return `music://playlist/${playlistMatch[1]}`;
    }
    
  } catch (error) {
    console.warn('RYM Plus: Error converting Apple Music link:', url, error);
  }
  
  return null; // Return null if conversion failed
}

function getServiceName(url) {
  if (url.includes('spotify.com')) return 'Spotify';
  if (url.includes('music.apple.com')) return 'Apple Music';
  return 'Unknown';
}

function addAppleMusicFallback(link, originalUrl) {
  link.addEventListener('click', function(event) {
    // Let the deep link try to open first
    setTimeout(() => {
      // Check if the page is still focused (app didn't open)
      // If page is still focused after 1 second, the app probably isn't installed
      if (document.hasFocus()) {
        console.log('RYM Plus: Apple Music app not detected, opening web version');
        // Open the web version in a new tab
        window.open(originalUrl, '_blank');
      } else {
        console.log('RYM Plus: Apple Music app opened successfully');
      }
    }, 1000);
  });
}

function toggleStreamingLinks(enabled) {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    console.log('RYM Plus: Streaming links feature restricted to RateYourMusic domains only');
    return;
  }
  
  console.log('RYM Plus: Streaming links toggle called with enabled:', enabled);
  
  if (enabled) {
    console.log('RYM Plus: Streaming links conversion enabled by user');
    convertStreamingLinks();
  } else {
    console.log('RYM Plus: Streaming links conversion disabled by user');
    restoreOriginalLinks();
  }
}

function restoreOriginalLinks() {
  try {
    // Find all converted links and restore them
    const convertedLinks = document.querySelectorAll('a[data-rym-plus-converted="true"]');
    
    convertedLinks.forEach(link => {
      const originalHref = link.getAttribute('data-original-href');
      
      if (originalHref) {
        // Restore original URL
        link.setAttribute('href', originalHref);
      } else {
        // Fallback: try to restore from deep link
        const href = link.getAttribute('href');
        
        // Restore Spotify links
        if (href.startsWith('spotify:')) {
          const spotifyMatch = href.match(/spotify:(album|track|artist|playlist):([a-zA-Z0-9]+)/);
          if (spotifyMatch) {
            const [, type, id] = spotifyMatch;
            link.setAttribute('href', `https://open.spotify.com/${type}/${id}`);
          }
        }
        // Restore Apple Music links
        else if (href.startsWith('music://')) {
          const appleMusicMatch = href.match(/music:\/\/(album|song|artist|playlist)\/([a-zA-Z0-9]+)/);
          if (appleMusicMatch) {
            const [, type, id] = appleMusicMatch;
            if (type === 'album') {
              link.setAttribute('href', `https://music.apple.com/album/${id}`);
            } else if (type === 'song') {
              link.setAttribute('href', `https://music.apple.com/song/${id}`);
            } else if (type === 'artist') {
              link.setAttribute('href', `https://music.apple.com/artist/${id}`);
            } else if (type === 'playlist') {
              link.setAttribute('href', `https://music.apple.com/playlist/${id}`);
            }
          }
        }
      }
      
      // Remove conversion markers
      link.removeAttribute('data-rym-plus-converted');
      link.removeAttribute('data-original-href');
      
      // Restore original title
      const currentTitle = link.getAttribute('title');
      if (currentTitle && currentTitle.endsWith(' (App)')) {
        link.setAttribute('title', currentTitle.replace(' (App)', ''));
      }
    });
    
    console.log('RYM Plus: Restored original streaming links');
    
  } catch (error) {
    console.error('RYM Plus: Error restoring original links:', error);
  }
}

// Monitor for new streaming links on dynamic page updates
function setupStreamingLinksObserver() {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    return;
  }
  
  console.log('RYM Plus: Setting up streaming links observer...');
  
  chrome.storage.sync.get(['convertStreamingLinks'], function(result) {
    const shouldConvert = result.convertStreamingLinks !== false; // Default to true
    console.log('RYM Plus: Observer enabled:', shouldConvert);
    
    if (shouldConvert) {
      const observer = new MutationObserver(function(mutations) {
        let shouldCheck = false;
        
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if new media links were added or if a container with media links was added
                const hasMediaLinks = node.classList && node.classList.contains('ui_media_links');
                const containsMediaLinks = node.querySelectorAll && node.querySelectorAll('.ui_media_links').length > 0;
                
                if (hasMediaLinks || containsMediaLinks) {
                  shouldCheck = true;
                }
              }
            });
          }
        });
        
        if (shouldCheck) {
          console.log('RYM Plus: New streaming links detected, converting...');
          setTimeout(convertStreamingLinks, 100); // Small delay to ensure DOM is ready
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      console.log('RYM Plus: Streaming links observer started');
    }
  });
}

// Initialize observer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupStreamingLinksObserver();
    // Also try to convert any existing links immediately
    setTimeout(() => {
      chrome.storage.sync.get(['convertStreamingLinks'], function(result) {
        const shouldConvert = result.convertStreamingLinks !== false;
        if (shouldConvert && isRateYourMusicDomain()) {
          console.log('RYM Plus: Converting existing streaming links on DOM ready...');
          convertStreamingLinks();
        }
      });
    }, 100);
  });
} else {
  setupStreamingLinksObserver();
  // Also try to convert any existing links immediately
  setTimeout(() => {
    chrome.storage.sync.get(['convertStreamingLinks'], function(result) {
      const shouldConvert = result.convertStreamingLinks !== false;
      if (shouldConvert && isRateYourMusicDomain()) {
        console.log('RYM Plus: Converting existing streaming links immediately...');
        convertStreamingLinks();
      }
    });
  }, 100);
}

// Export functions for use in main content script
window.RYMPlusFeatures = window.RYMPlusFeatures || {};
window.RYMPlusFeatures.streamingLinks = {
  handle: handleStreamingLinks,
  toggle: toggleStreamingLinks
};

// Debug: Log that the feature is loaded
console.log('RYM Plus: Streaming links feature loaded and exported');
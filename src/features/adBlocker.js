// Ad Blocker Feature - PRECISE VERSION
// Handles removing advertisements while preserving essential page content

// Verify we're on a RateYourMusic domain
function isRateYourMusicDomain() {
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'rateyourmusic.com' || hostname.endsWith('.rateyourmusic.com');
}

function handleAdBlocking() {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    console.log('RYM Plus: Ad blocker restricted to RateYourMusic domains only');
    return;
  }
  
  // Get user preference for blocking ads
  chrome.storage.sync.get(['blockAds'], function(result) {
    toggleAdBlocking(result.blockAds === true);
  });
}

function toggleAdBlocking(block) {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    console.log('RYM Plus: Ad blocker restricted to RateYourMusic domains only');
    return;
  }
  
  if (block) {
    // PRECISE: Only inject specific ad blocking CSS
    injectPreciseBlockingCSS();
    
    // PRECISE: Remove only confirmed ad elements
    removePreciseAdElements();
    
    // PRECISE: Block ad network requests
    blockAdRequests();
  } else {
    // Remove our blocking CSS
    removeBlockingCSS();
    restoreBlockedElements();
    
    console.log('RYM Plus: Ad blocking disabled.');
  }
}

function injectPreciseBlockingCSS() {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    return;
  }
  
  // Remove existing blocking CSS first
  removeBlockingCSS();
  
  const css = `
    /* PRECISE AD BLOCKING - Only target confirmed ad containers */
    
    /* Playwire video ads - very specific selectors */
    .pw-corner-ad-video,
    .pw-content-video,
    .pw-ad-scroll-container,
    #pw-oop-bottom_rail,
    .pw-tag[class*="pw-size-"],
    
    /* Google GPT ads - specific ad divs */
    div[id^="frame-div-gpt-ad-"],
    div[id^="div-gpt-ad-"],
    iframe[id^="google_ads_iframe_"],
    
    /* Only remove data-nosnippet divs that specifically say ADVERTISEMENT */
    div[data-nosnippet][style*="ADVERTISEMENT"],
    
    /* Creative containers with specific ad styling */
    .page_creative_frame.big-rectangle,
    .GoogleCreativeContainerClass,
    
    /* Fixed bottom rail ads */
    div[style*="position:fixed"][style*="bottom:0"][id*="pw-"],
    
    /* Ad network iframes */
    iframe[src*="doubleclick.net"],
    iframe[src*="googleads.com"],
    iframe[src*="googlesyndication.com"],
    iframe[src*="imasdk.googleapis.com"],
    iframe[title="Advertisement"],
    iframe[title="3rd party ad content"],
    
    /* Playwire specific elements */
    .pw-ad-container-logo,
    .pw-custom-ima-container,
    
    /* Standard ad sizes - but only if they're iframes */
    iframe[width="728"][height="90"],
    iframe[width="336"][height="280"],
    iframe[width="300"][height="250"],
    iframe[width="320"][height="50"]
    {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
    }
    
    /* Completely remove specific ad containers from layout */
    .pw-corner-ad-video,
    .pw-ad-scroll-container,
    #pw-oop-bottom_rail,
    div[id^="frame-div-gpt-ad-"]:not(.page_content):not(.main_content),
    .GoogleCreativeContainerClass {
        display: none !important;
    }
  `;
  
  const style = document.createElement('style');
  style.id = 'rym-plus-ad-blocker';
  style.textContent = css;
  document.head.appendChild(style);
}

function removeBlockingCSS() {
  const existingStyle = document.getElementById('rym-plus-ad-blocker');
  if (existingStyle) {
    existingStyle.remove();
  }
}

function removePreciseAdElements() {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    return;
  }
  
  // PRECISE: Only target elements that are definitely ads
  const preciseAdSelectors = [
    // Specific Playwire containers
    '.pw-corner-ad-video',
    '.pw-ad-scroll-container', 
    '#pw-oop-bottom_rail',
    '.pw-tag[class*="pw-size-"]',
    
    // Google ad containers with specific patterns
    'div[id^="frame-div-gpt-ad-1465817209349"]', // Specific to RYM's ad IDs
    'div[id^="div-gpt-ad-1465817209349"]',
    
    // Only iframes from ad networks
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googleads.com"]',
    'iframe[src*="googlesyndication.com"]',
    'iframe[src*="imasdk.googleapis.com"]',
    'iframe[title="Advertisement"]',
    'iframe[title="3rd party ad content"]',
    
    // Google Creative containers
    '.GoogleCreativeContainerClass'
  ];
  
  let removedCount = 0;
  
  preciseAdSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Double-check this isn't essential content
        if (!isEssentialRYMContent(element)) {
          element.setAttribute('data-rym-plus-removed', 'true');
          element.style.display = 'none';
          removedCount++;
        }
      });
    } catch (error) {
      console.error('RYM Plus: Error removing ad element:', selector, error);
    }
  });
  
  // PRECISE: Only remove containers with ADVERTISEMENT text that have ad-like characteristics
  removePreciseAdvertisementContainers();
  
  if (removedCount > 0) {
    console.log(`RYM Plus: Removed ${removedCount} ad elements`);
  }
}

function isEssentialRYMContent(element) {
  // Check if element contains essential RYM content
  const essentialSelectors = [
    '.page_content',
    '.main_content', 
    '.album_info',
    '.profile_info',
    '.release_page',
    '.chart_details',
    '.navtop',
    '.navbottom',
    '.breadcrumb'
  ];
  
  // Check if element is inside essential content
  for (const selector of essentialSelectors) {
    if (element.closest(selector)) {
      return true;
    }
  }
  
  // Check if element contains essential content
  return element.querySelector('.album_info, .profile_info, .chart_details, .release_page') !== null;
}

function removePreciseAdvertisementContainers() {
  // Only remove containers that:
  // 1. Contain "ADVERTISEMENT" text AND
  // 2. Have ad-like styling characteristics AND  
  // 3. Are NOT essential RYM content
  
  const textNodes = document.evaluate(
    "//text()[contains(., 'ADVERTISEMENT')]",
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  
  for (let i = 0; i < textNodes.snapshotLength; i++) {
    const textNode = textNodes.snapshotItem(i);
    let parent = textNode.parentElement;
    
    // Walk up to find potential ad container
    let attempts = 0;
    while (parent && parent !== document.body && attempts < 5) {
      const style = parent.getAttribute('style') || '';
      const className = (parent.className && parent.className.toString) ? parent.className.toString() : (parent.className || '');
      
      // Check for ad-like characteristics
      const hasAdSize = (style.includes('300px') && style.includes('250px')) ||
                       (style.includes('728px') && style.includes('90px')) ||
                       (style.includes('336px') && style.includes('280px'));
      
      const hasAdClass = className.includes('creative_frame') || 
                        className.includes('pw-') ||
                        parent.id.includes('gpt-ad');
      
      // Only remove if it has ad characteristics AND is not essential content
      if ((hasAdSize || hasAdClass) && !isEssentialRYMContent(parent)) {
        parent.setAttribute('data-rym-plus-removed', 'true');
        parent.style.display = 'none';
        break;
      }
      
      parent = parent.parentElement;
      attempts++;
    }
  }
}

function restoreBlockedElements() {
  // Restore elements that were hidden (not removed)
  const blockedElements = document.querySelectorAll('[data-rym-plus-removed="true"]');
  blockedElements.forEach(element => {
    element.style.display = '';
    element.removeAttribute('data-rym-plus-removed');
  });
}

function blockAdRequests() {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    return;
  }
  
  // Only block if not already active
  if (window.rymPlusOriginalFetch) return;
  
  window.rymPlusOriginalFetch = window.fetch;
  
  const adDomains = [
    'doubleclick.net',
    'googleads.com',
    'googlesyndication.com',
    'playwire.com',
    '2mdn.net'
  ];
  
  // Block fetch requests to ad networks
  window.fetch = function(...args) {
    const url = args[0] instanceof Request ? args[0].url : args[0];
    if (typeof url === 'string' && adDomains.some(domain => url.includes(domain))) {
      console.log('RYM Plus: Blocked ad request:', url);
      return Promise.reject(new Error('Blocked by RYM Plus'));
    }
    return window.rymPlusOriginalFetch.apply(this, args);
  };
}

// Monitor for new ads - but be more conservative
function setupAdObserver() {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    return;
  }
  
  chrome.storage.sync.get(['blockAds'], function(result) {
    if (result.blockAds === true) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                checkAndRemoveNewAdNode(node);
              }
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });
}

function checkAndRemoveNewAdNode(node) {
  // Only run on RateYourMusic domains
  if (!isRateYourMusicDomain()) {
    return;
  }
  
  const className = (node.className && node.className.toString) ? node.className.toString() : (node.className || '');
  const id = node.id || '';
  
  // Only target very specific ad patterns
  const definiteAdIndicators = [
    'pw-corner-ad-video',
    'pw-ad-scroll-container',
    'GoogleCreativeContainerClass',
    'frame-div-gpt-ad',
    'div-gpt-ad',                 // this and above used on RYM, below are suggested
    'adsbygoogle',            
    'google-auto-placed',     
    'google_ads_iframe_',       
    'id^="google_ads_iframe_"',  
    'safeFrameContainer',          
    'googletag',                 
    'gpt_unit_',                
    'id^="div-gpt-ad-"',      
    'data-google-query-id',    
    'div-gpt-ad-',              
    'gpt-ad',                
    'gam-ad-slot',            
    'pubads'      
  ];
  
  const isDefiniteAd = definiteAdIndicators.some(indicator => 
    className.includes(indicator) || id.includes(indicator)
  );
  
  if (isDefiniteAd && !isEssentialRYMContent(node)) {
    node.setAttribute('data-rym-plus-removed', 'true');
    node.style.display = 'none';
    console.log('RYM Plus: Removed dynamic ad:', className || id);
  }
}

// Initialize observer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAdObserver);
} else {
  setupAdObserver();
}

// Export functions for use in main content script
window.RYMPlusFeatures = window.RYMPlusFeatures || {};
window.RYMPlusFeatures.adBlocker = {
  handle: handleAdBlocking,
  toggle: toggleAdBlocking
};
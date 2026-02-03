# RYM Plus Extension - Changelog

## v1.1.0 - Default to Ratings View

### Features Added

#### 📊 Default to Ratings View
- **Feature**: Toggle to automatically switch to "ratings" tab when visiting user profiles
- **Location**: Extension popup → "Default to Ratings View" toggle
- **What it does**: Instead of showing "recent" albums by default, automatically clicks the "ratings" button on user profile pages
- **Default**: Disabled (users must manually enable it)
- **Page Detection**: Only activates on user profile pages (URLs containing `/~username` or `/user/username`)
- **Auto-switch Timing**: 500ms delay to ensure page elements are fully loaded

**Technical Implementation:**
- **User Profile Detection**: Regex matching for `/~` and `/user/` URL patterns
- **Auto-click Functionality**: Targets `#btnmusicrating` element and simulates click
- **Settings Integration**: Added to Chrome sync storage alongside existing settings
- **Popup Interface**: Added second toggle switch with consistent styling

## v1.0.0 - Initial Release

### Features Added

#### 🚫 Hide Issues Section
- **Feature**: Toggle to hide the issues/purchase section on RateYourMusic album pages
- **Location**: Extension popup → "Hide Issues Section" toggle
- **What it does**: Completely removes the purchase/marketplace section from album pages
- **Default**: Disabled (users must manually enable it)

**Technical Implementation Details:**

The issues section hiding feature went through several iterations to overcome RateYourMusic's dynamic content loading:

1. **Initial Approach - CSS Hiding**: 
   - Tried using `display: none` and other CSS properties
   - **Problem**: RateYourMusic was overriding styles or recreating elements

2. **Enhanced CSS Hiding**:
   - Applied multiple CSS properties simultaneously (`display`, `visibility`, `opacity`, `height`, `overflow`)
   - **Problem**: Still not effective due to site's CSS specificity

3. **Final Solution - DOM Removal**:
   - **Method**: Complete removal from DOM using `.remove()`
   - **Selectors Targeted**: 
     - `.section_issues.section_outer` (primary target)
     - `.section_issues`
     - `.album_issues`
     - `.release_issues`
     - `.issues_section`
     - `[class*="issues"]`
     - `.marketplace_section`
     - `.purchase_section`
   - **Fallback Method**: Searches for elements containing "buy", "purchase", "marketplace", "available", or "format" text with multiple links

**Code Architecture:**
- **Popup Control**: `popup.html` & `popup.js` - Toggle interface
- **Settings Storage**: Chrome sync storage for persistence
- **Content Script**: `content.js` - DOM manipulation on album pages
- **Background Script**: `background.js` - Default settings initialization
- **Real-time Updates**: Messages between popup and content script for immediate changes

**Key Functions:**
- `toggleIssuesSection(hide)` - Main function that removes/handles issues sections
- `handleIssuesSection()` - Loads user preference and applies setting
- Message passing system for instant toggle response

### Technical Notes
- Uses Chrome Extension Manifest V3
- Content script runs on `*://*.rateyourmusic.com/*`
- Settings persist across browser sessions
- Extension loads on album pages and automatically applies user preferences

### Permissions Required
- `activeTab` - Access to current tab for content injection
- `storage` - Save user preferences
- `host_permissions` - Access to rateyourmusic.com domains

---

*This extension enhances the RateYourMusic browsing experience by providing users control over page content visibility.*
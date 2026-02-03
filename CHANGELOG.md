# RYM Plus Extension - Changelog

## v1.1.0 - Default to Ratings View

### Features Added

#### � Show Rating Descriptions
- **Feature**: Toggle to display custom rating descriptions as tooltips when hovering over star ratings
- **Location**: Extension popup → "Show Rating Descriptions" toggle
- **What it does**: Shows your personalized rating descriptions from your rating system when you hover over star ratings on album/release pages
- **Default**: Disabled (users must manually enable it)
- **Page Detection**: Only activates on album/release pages (URLs containing `/release/` or `/album/`)
- **Tooltip Display**: Real-time tooltip positioning that follows mouse movement across rating stars

**Technical Implementation:**
- **Rating System Integration**: Fetches user's custom rating descriptions from `/account/rating_system_2` page
- **Dynamic Tooltip Creation**: Creates positioned tooltips with smooth hover interactions
- **Rating Calculation**: Converts mouse position to corresponding rating value (0.5 to 5.0 scale)
- **Caching System**: Stores fetched descriptions in Chrome local storage for performance
- **Fallback Descriptions**: Provides default rating descriptions if custom ones aren't available
- **DOM Manipulation**: Adds/removes tooltip elements without interfering with site functionality

**How Rating Descriptions Feature Was Created:**

1. **Initial Analysis**: 
   - Studied RateYourMusic's rating interface structure (`#my_catalog .my_catalog_rating`)
   - Identified the rating stars container (`.rating_stars`) for hover detection
   - Analyzed the user's rating system page format (`/account/rating_system_2`)

2. **Rating System Discovery**:
   - Found that RYM stores custom descriptions in input fields with IDs `#sm1` through `#sm10`
   - Mapped numeric ratings (0.5-5.0) to RYM's internal keys (`sm1`-`sm10`)
   - Created conversion system: 0.5★ = sm1, 1.0★ = sm2, ..., 5.0★ = sm10

3. **Tooltip Implementation Process**:
   - **Positioning Challenge**: Initially tried relative positioning, but RYM's CSS interfered
   - **Solution**: Used fixed positioning with `getBoundingClientRect()` for accurate placement
   - **Mouse Tracking**: Implemented real-time mouse position calculation within star container
   - **Rating Detection**: Created algorithm to convert mouse X position to rating value

4. **Data Fetching Strategy**:
   - **Primary Method**: Fetch user's rating system page via GET request to `/account/rating_system_2`
   - **HTML Parsing**: Used `DOMParser` to extract custom descriptions from input fields
   - **Error Handling**: Implemented fallback system with predefined descriptions
   - **Caching**: Store descriptions in Chrome local storage to avoid repeated API calls

5. **Integration Challenges Overcome**:
   - **Event Conflicts**: Ensured extension tooltips don't interfere with RYM's existing rating UI
   - **CSS Isolation**: Used high z-index (999999) and specific styling to prevent conflicts
   - **Performance**: Implemented efficient hover detection without impacting site performance
   - **Memory Management**: Proper cleanup of tooltip elements when feature is disabled

#### �📊 Default to Ratings View
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
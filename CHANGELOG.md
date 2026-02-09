# RYM Plus Extension - Changelog

## v1.3.0 - Spacing and Styling Improvements

### Features Added

#### 🎨 Comprehensive Spacing and Styling
- **Feature**: Combined toggle for spacing fixes and button styling across RateYourMusic
- **Location**: Extension popup → "Spacing and Styling" toggle  
- **What it does**: 
  - **User Profile Fixes**: Resizes compatibility list boxes to prevent overflow
  - **Tab Spacing**: Adds proper spacing between music toolbar buttons and content tabs
  - **Button Styling**: Applies RYM's native styling to navigation buttons
  - **Comment Button Styling**: Makes "Write a Comment" buttons blue with hover effects
- **Default**: Enabled (improves visual consistency by default)
- **Page Detection**: Works on user profile pages and across all RYM pages

**Technical Implementation:**
- **Profile Styling**: 
  - Targets compatibility list tables with `max-width: 500px` and proper text wrapping
  - Adds 10px spacing between music toolbar and tab content
  - Uses mutation observer for dynamic content
- **Button Enhancements**: 
  - Navigation buttons get full RYM styling (`btn blue_btn btn_small`)
  - Comment buttons get blue background with centered text and hover effects
  - Excludes comment buttons from navigation styling to prevent width conflicts
  - CSS overrides ensure proper button sizing
- **Combined Control**: Single toggle manages both profile and button styling features
- **Architecture**: New `userProfileStyling.js` feature coordinates with existing `buttonStyling.js`

### UI Improvements
- **Popup Redesign**: Separated CSS into dedicated `popup.css` file for better maintainability
- **Simplified Interface**: Reduced from 5 toggles to 4 by combining related features
- **Clear Descriptions**: Updated toggle descriptions to reflect comprehensive functionality

### Architecture Enhancements  
- **File Organization**: Added `src/popup/popup.css` for cleaner separation of concerns
- **Feature Integration**: Cross-feature communication between styling modules
- **Storage Sync**: Unified settings management for related features

## v1.2.0 - Button Styling & Modular Architecture

### Features Added

#### 🎨 Form Button Styling
- **Feature**: Toggle to apply RYM's native button styling to form buttons for visual consistency
- **Location**: Extension popup → "Style Form Buttons" toggle
- **What it does**: Applies RYM's standard button classes (`btn blue_btn btn_small`) to navigation and action buttons throughout the site
- **Default**: Disabled (users must manually enable it)
- **Page Detection**: Works on all RYM pages where applicable buttons are found
- **Dynamic Monitoring**: Automatically styles newly added buttons via AJAX/dynamic content loading

**Technical Implementation:**
- **Smart Button Detection**: Uses CSS selectors to target specific button patterns:
  - Exact matches: `value=">"`, `value="<"`, `value=">>"`, `value="<<"`
  - Ending patterns: `value$=" >"`, `value$=" <"`, `value$=" >>"`
  - HTML entities: `value$="&gt;"`, `value$="&gt;&gt;"`, `value$="&lt;"`
- **Non-Destructive Styling**: Preserves original classes and inline styles with data attributes
- **Conflict Prevention**: Removes conflicting CSS properties (height, background, border, color, padding, font) while preserving functional styles like width
- **Mutation Observer**: Monitors DOM changes to style dynamically loaded buttons
- **Reversible Changes**: Clean restoration to original state when toggled off

**Button Patterns Styled:**
- Navigation buttons: `<input type="submit" value=">">`
- Action buttons: `<input type="button" value="Create list &gt;&gt;">`
- Pagination controls: `<input type="button" value="<< Previous">`
- Submit actions ending with navigation symbols

**Architecture Improvements:**
- **Modular Structure**: Refactored extension into `/features/` folder organization:
  - `features/issues.js` - Issues section hiding
  - `features/ratingsView.js` - Default to ratings view
  - `features/ratingDescriptions.js` - Rating descriptions tooltips  
  - `features/buttonStyling.js` - Form button styling
- **Scalable Design**: Easy to add new features by creating new files in `/features/`
- **Clean Coordination**: Main `content.js` acts as feature coordinator and message router
- **Load Order Management**: Features load before main script to ensure proper initialization

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
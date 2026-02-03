# RYM Plus Extension

Enhanced features for RateYourMusic.com to improve your browsing experience.

## Features

- **Hide Issues Section**: Remove marketplace/purchase sections from album pages
- **Default to Ratings View**: Automatically switch to ratings tab on user profiles
- **Rating Descriptions**: Show custom tooltips for rating meanings
- **Button Styling**: Apply RYM's native styling to navigation buttons

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" 
4. Click "Load unpacked" and select the extension folder
5. The RYM Plus icon will appear in your extensions toolbar

## Usage

Click the RYM Plus extension icon while on any RateYourMusic page to toggle features on/off. Settings are automatically saved and persist across browser sessions.

## Project Structure

```
rym-plus/
├── manifest.json          # Extension configuration
├── src/                   # Source files
│   ├── content.js         # Main coordinator script
│   ├── background.js      # Service worker
│   ├── styles.css         # Global styles
│   ├── features/          # Modular feature files
│   │   ├── issues.js
│   │   ├── ratingsView.js
│   │   ├── ratingDescriptions.js
│   │   └── buttonStyling.js
│   └── popup/             # Extension popup
│       ├── popup.html
│       └── popup.js
├── icons/                 # Extension icons
└── CHANGELOG.md          # Version history
```

## Development

The extension uses a modular architecture with individual feature files in `/src/features/` for easy maintenance and expansion. Each feature exports to the `window.RYMPlusFeatures` namespace and provides `handle()` and `toggle()` methods.

---

*Created by Lucy Acheson © 2026*
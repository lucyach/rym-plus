# RYM Plus Extension

## Features

- **Hide Issues Section**: Remove marketplace/purchase sections from album pages
- **Default to Ratings View**: Automatically switch to the ratings tab on user profiles
- **Rating Descriptions**: Show custom tooltips for rating meanings
- **Spacing and Styling**: Fix spacing issues and apply RYM's native styling across pages

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
│   │   ├── buttonStyling.js
│   │   └── userProfileStyling.js
│   └── popup/             # Extension popup
│       ├── popup.html
│       ├── popup.js
│       └── popup.css
├── icons/                 # Extension icons
└── CHANGELOG.md          # Version history
```

---

*Created by Lucy Acheson © 2026*

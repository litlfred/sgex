# Bookmark System

The SGEX Workbench includes a comprehensive bookmark system that allows users to save and organize their favorite pages with context-aware titles and easy navigation.

## Overview

The bookmark system provides:
- **Context-aware bookmarks**: Automatically generates meaningful titles based on page type and context
- **Organized display**: Groups bookmarks by page type alphabetically
- **Easy management**: Add/remove bookmarks directly from the header
- **Local storage**: Bookmarks are saved in browser localStorage
- **Import/Export**: Full backup and restore functionality

## Features

### Automatic Title Generation

Bookmarks are automatically titled based on the page context:

- **Asset pages**: `{asset} in DAK: {user}/{repo}/{branch}`
  - Example: `ValueSet-anc-care-codes.json in DAK: WHO/smart-tb/main`

- **DAK pages with branch**: `DAK: {user}/{repo}/{branch}`
  - Example: `DAK: litlfred/anc-dak/develop`

- **DAK pages (main branch)**: `DAK: {user}/{repo}`
  - Example: `DAK: WorldHealthOrganization/smart-tb`

- **User pages**: `{pageName}: {user}`
  - Example: `repositories: litlfred`

- **Top-level pages**: `{pageName}`
  - Example: `documentation`

### User Interface

#### Accessing Bookmarks
1. Click on your user avatar in the header
2. Navigate to the "📖 Bookmarks" section in the dropdown
3. The bookmarks section shows:
   - Add/Remove bookmark button for current page
   - List of existing bookmarks grouped by page type
   - Remove buttons (×) for individual bookmarks

#### Adding Bookmarks
- Click the "☆ Add Bookmark" button when viewing any page
- The bookmark is automatically saved with a context-aware title
- If the page is already bookmarked, the button shows "⭐ Remove Bookmark"

#### Navigating to Bookmarks
- Click on any bookmark title to navigate to that page
- Bookmarks are organized alphabetically by page name
- Each group shows the page name followed by bookmarks for that page

#### Managing Bookmarks
- Remove individual bookmarks using the "×" button
- The current page bookmark status is always visible in the dropdown
- Empty bookmark sections are automatically hidden

### Bookmark Organization

Bookmarks are automatically organized:

1. **Grouped by page name**: All bookmarks for the same page type are grouped together
2. **Alphabetical ordering**: Both page groups and bookmarks within groups are sorted alphabetically
3. **Dynamic sections**: Only page types with bookmarks are shown
4. **Context preservation**: Full page context is maintained for accurate navigation

## Technical Implementation

### Services

#### BookmarkService
Located at `src/services/bookmarkService.js`, provides:

- `addBookmark(pageName, url, context)`: Add or update a bookmark
- `removeBookmark(bookmarkId)`: Remove a specific bookmark
- `getBookmarks()`: Get all bookmarks
- `getBookmarksGroupedByPage()`: Get bookmarks organized by page
- `isBookmarked(url)`: Check if a URL is bookmarked
- `generateBookmarkTitle(pageName, context)`: Generate context-aware titles

#### Storage Format
```json
[
  {
    "id": "1643723400000",
    "title": "DAK: WHO/smart-tb/main",
    "url": "/dashboard/WHO/smart-tb/main",
    "pageName": "dashboard",
    "context": {
      "user": "WHO",
      "repository": {
        "name": "smart-tb",
        "full_name": "WHO/smart-tb"
      },
      "branch": "main"
    },
    "createdAt": "2024-01-01T12:00:00.000Z",
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  }
]
```

### Integration Points

#### PageHeader Component
- Integrates bookmark functionality into user dropdown
- Provides add/remove bookmark actions
- Displays organized bookmark list with navigation

#### Page Framework
- All pages using `PageLayout` automatically support bookmarks
- Context information is automatically captured
- URL parameters are preserved for accurate navigation

### Import/Export Functionality

#### Export Bookmarks
```javascript
const exported = bookmarkService.exportBookmarks();
// Save exported JSON string to file
```

#### Import Bookmarks
```javascript
// From JSON string
const success = bookmarkService.importBookmarks(jsonString, merge = false);

// Merge with existing bookmarks
const success = bookmarkService.importBookmarks(jsonString, true);
```

## Usage Examples

### For Developers

#### Check if Current Page is Bookmarked
```javascript
import bookmarkService from '../services/bookmarkService';

const isCurrentPageBookmarked = bookmarkService.isBookmarked(window.location.pathname);
```

#### Add Custom Bookmark
```javascript
const context = {
  user: 'WHO',
  repository: { name: 'smart-tb' },
  branch: 'main',
  asset: 'input/vocabulary/ValueSet-tb-codes.json'
};

bookmarkService.addBookmark('editor', '/editor/WHO/smart-tb/main/input/vocabulary/ValueSet-tb-codes.json', context);
```

#### Get Organized Bookmarks
```javascript
const groupedBookmarks = bookmarkService.getBookmarksGroupedByPage();
// Returns: [{ pageName: 'dashboard', bookmarks: [...] }, ...]
```

### For Users

#### Bookmark a Dashboard
1. Navigate to any DAK dashboard (e.g., `/dashboard/WHO/smart-tb/main`)
2. Click your avatar in the header
3. Click "☆ Add Bookmark" in the bookmarks section
4. Bookmark is saved as "DAK: WHO/smart-tb/main"

#### Bookmark an Asset Editor
1. Open any asset in the editor (e.g., a BPMN diagram or ValueSet)
2. Use the bookmark button in the user dropdown
3. Bookmark is saved with full context (e.g., "Client.json in DAK: WHO/smart-tb/main")

#### Navigate Using Bookmarks
1. Click your avatar to open the user dropdown
2. Expand the bookmarks section
3. Click on any bookmark title to navigate instantly
4. Bookmarks are organized by page type for easy browsing

## Best Practices

### For Page Developers
- Ensure pages use the `PageLayout` component for automatic bookmark support
- Provide meaningful `pageName` values for better organization
- Test bookmark functionality across different page types

### For Users
- Use descriptive contexts when possible (specific branches, meaningful asset names)
- Regularly review and clean up unused bookmarks
- Export bookmarks before major browser changes or system updates

## Accessibility

The bookmark system includes:
- Keyboard navigation support
- Screen reader friendly labels
- High contrast colors for bookmark states
- Clear visual indicators for bookmark status

## Browser Compatibility

- Uses localStorage for persistence (supported in all modern browsers)
- Graceful degradation when localStorage is unavailable
- Error handling for quota exceeded scenarios
- Automatic cleanup of corrupted bookmark data

## Limitations

- Bookmarks are browser-specific (not synced across devices)
- Limited by browser localStorage quota (~10MB typically)
- No server-side backup (relies on user export/import)
- Context information depends on accurate page implementation

## Troubleshooting

### Bookmarks Not Saving
1. Check browser localStorage quota
2. Verify page is using PageLayout framework
3. Ensure JavaScript is enabled
4. Clear corrupted localStorage if necessary

### Missing Context Information
1. Verify page provides complete context to PageProvider
2. Check that URL parameters are correctly structured
3. Ensure repository and user information is available

### Performance Issues
1. Export and re-import bookmarks to clean up data
2. Remove unused bookmarks regularly
3. Check for localStorage quota issues in browser console
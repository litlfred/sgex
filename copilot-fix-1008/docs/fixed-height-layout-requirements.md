# Fixed Height Layout Requirements for SGEX Workbench

## Overview

This document defines the fixed height layout requirements for BPMN and DMN viewer components, ensuring optimal use of display space and improved user experience.

## Core Requirements

### 1. Fixed Height Display

**Requirement**: All viewer components must use fixed height layout constraining to the display size (100vh).

**Implementation**:
- Main viewer container: `height: 100vh`
- Flex layout: `display: flex; flex-direction: column`
- No scrolling of main container - content scrolls within sections

**Benefits**:
- Consistent viewport usage across different screen sizes
- Better responsive design
- More predictable layout behavior

### 2. Condensed Footer Design

**Requirement**: Edit/view artifact footer must be squished to the bottom with condensed information.

**Implementation**:
- Fixed height footer: `height: 60px`
- Single row layout with key information
- Horizontal information display
- Positioned at bottom of screen

**Footer Information Includes**:
- File type icon and name
- File size or metadata
- Branch information  
- Access level (read/edit)
- Current view mode

### 3. Header Badges System

**Requirement**: Artifact and DAK component type badges must appear in page headers, not footers.

#### Artifact Type Badges

Support for the following artifact types:

| Artifact Type | Badge | Color | Description |
|---------------|-------|-------|-------------|
| BPMN | 📊 BPMN | Green (#4caf50) | Business Process Model files |
| DMN | 📊 DMN | Orange (#ff9800) | Decision Model files |
| FHIR | 🔷 FHIR | Purple (#9c27b0) | FHIR Resource files |
| CQL | 📜 CQL | Blue (#2196f3) | Clinical Quality Language files |
| JSON | 📄 JSON | Gray (#666) | Generic JSON files |

#### DAK Component Type Badges

Support for the 9 core DAK components:

| Component | Badge | Description |
|-----------|-------|-------------|
| Business Process | 🔄 Business Process | BPMN workflows and processes |
| Decision Logic | 🧠 Decision Logic | DMN decision tables and logic |
| Data Elements | 📊 Data Elements | Core data definitions |
| Personas | 👥 Personas | User roles and actors |
| Scenarios | 📋 Scenarios | Use case narratives |
| Requirements | 📝 Requirements | Functional requirements |
| Indicators | 📈 Indicators | Performance metrics |
| Publications | 📚 Publications | Health interventions |

### 4. Layout Structure

#### BPMN Viewer Layout

```
┌─────────────────────────────────────────────────────────┐
│ Toolbar [File + Badges + Actions]          [100vh]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│             Diagram Container                           │
│               (flex: 1)                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Condensed Footer [Info] [Access] [Mode]    [60px]      │
└─────────────────────────────────────────────────────────┘
```

#### DMN Viewer Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header [Title + Badges]                    [auto]      │
├─────────────────────────────────────────────────────────┤
│ Section Tabs [Variables] [Tables] [Controls]  [auto]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│             Content Section                             │
│               (flex: 1)                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Condensed Footer [Info] [Stats] [Mode]     [60px]      │
└─────────────────────────────────────────────────────────┘
```

## Auto-Hide Mode Enhancements

### Behavior with Fixed Height

- **Toolbar/Header**: Slides up to `-70px` (completely hidden)
- **Footer**: Slides down to `-70px` (completely hidden)  
- **Content**: Expands to full viewport minus footer space (60px)
- **Hover Triggers**: 80px zones at top and bottom for revealing hidden elements

### Hover Areas

- **Top Zone**: 80px from top of screen
- **Bottom Zone**: 80px from bottom of screen
- **Activation**: Mouse presence in zone reveals hidden elements
- **Smooth Transitions**: 0.3s ease-in-out animations

## Enhanced Fullwidth Mode

### Full Container Takeover

- **Position**: `position: fixed; top: 0; left: 0; right: 0; bottom: 0`
- **Z-index**: `z-index: 1000` (above page layout)
- **Page Header**: Hidden via CSS or body class
- **Full Viewport**: True 100vw × 100vh usage

## CSS Implementation Standards

### Required CSS Classes

```css
/* Fixed height container */
.viewer-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Flexible content area */
.content-section {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* Fixed condensed footer */
.condensed-footer {
  height: 60px;
  flex-shrink: 0;
  border-top: 1px solid #dee2e6;
}
```

### Badge Styling

```css
.artifact-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.dak-component-badge {
  padding: 0.2rem 0.8rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
}
```

## Testing Requirements

### Viewport Testing

- Test on common screen sizes: 1920×1080, 1366×768, 1024×768
- Verify no vertical scrolling on main container
- Confirm footer always at screen bottom
- Validate content scrolling within sections

### Auto-Hide Testing

- Verify complete hiding of header/footer elements
- Test hover zone activation and deactivation
- Confirm smooth transitions
- Test with different content heights

### Badge Testing

- Verify correct badge display for each artifact type
- Test badge positioning in headers
- Confirm color coding matches specification
- Validate badge text readability

## Browser Compatibility

- **Chrome/Edge**: Full support including :has() selectors
- **Firefox**: Full support with fallback classes
- **Safari**: Full support with webkit prefixes
- **Fallbacks**: Body classes for browsers without :has() support

## Accessibility Considerations

- **Focus Management**: Ensure keyboard navigation works with hidden elements
- **Screen Readers**: Provide ARIA labels for mode toggle buttons
- **Color Contrast**: All badge colors meet WCAG AA standards
- **Hover Alternatives**: Keyboard shortcuts for revealing hidden elements

## Migration Notes

### Existing Components

Components should be updated to:
1. Replace min-height with fixed height
2. Add flex layout to main containers  
3. Convert detailed footers to condensed format
4. Add header badge support
5. Update auto-hide positioning for condensed footer

### Breaking Changes

- Footer height changed from variable to fixed 60px
- Main container height changed from min-height to fixed height
- Badge information moved from footer to header

## Future Enhancements

- **Smart Badge Detection**: Automatic badge assignment based on file extension
- **Custom Badge Colors**: User-configurable badge themes
- **Badge Tooltips**: Detailed information on hover
- **Badge Groups**: Grouping related artifact types
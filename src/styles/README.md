# CSS Loading Architecture

## Overview

The SGEX Workbench uses a centralized CSS loading system to ensure consistent stylesheet ordering and prevent mini-css-extract-plugin conflicts during build.

## Architecture

### Central CSS Loader
- **Location**: `src/styles/index.css`
- **Purpose**: Single entry point for all CSS imports with predictable dependency order
- **Module Wrapper**: `src/styles/index.js` allows importing as `import './styles'`

### Import Hierarchy

1. **Base Styles** (Foundation)
   - `src/index.css` - Global application styles
   - `src/App.css` - Root application component styles

2. **Framework Styles** (Infrastructure)
   - Framework components loaded in dependency order
   - Core layout and navigation components first
   - Support components (badges, dialogs) after

3. **Component Styles** (Features)
   - All component CSS files in alphabetical order
   - Ensures predictable loading sequence
   - Prevents circular dependencies

### Component Style Ownership

Components still "own" their CSS files:
- Each component has its corresponding `.css` file in the same directory
- CSS files follow component naming convention (e.g., `HelpModal.js` → `HelpModal.css`)
- Component-specific styles remain isolated and maintainable

### Loading Method

CSS is loaded centrally through:
```javascript
// src/index.js
import './styles';  // Central CSS loader
```

Individual components **do not** import their CSS files directly.

## Benefits

1. **Build Reliability**: Eliminates mini-css-extract-plugin ordering conflicts
2. **Predictable Loading**: Consistent CSS import order across all builds
3. **Dependency Management**: Clear hierarchy for style dependencies
4. **Maintainability**: Components still own their styles, only loading is centralized
5. **Performance**: Single CSS bundle with optimal ordering

## Maintenance

### Adding New Components

1. Create component CSS file: `src/components/NewComponent.css`
2. Add import to `src/styles/index.css` in alphabetical order:
   ```css
   @import '../components/NewComponent.css';
   ```
3. **Do not** import CSS directly in component JavaScript

### Framework Components

Framework components should be added to the framework section in dependency order, not alphabetically.

### Troubleshooting

If build errors occur:
1. Verify no components directly import CSS files
2. Check CSS import paths in `src/styles/index.css`
3. Ensure new CSS files are added to central loader
4. Run `npm run build` to test for conflicts

## Migration Notes

This system was implemented to resolve mini-css-extract-plugin conflicts where CSS modules were loaded in inconsistent orders, causing build failures. The previous approach of individual CSS imports per component was replaced with this centralized system while maintaining the same file structure and component ownership model.
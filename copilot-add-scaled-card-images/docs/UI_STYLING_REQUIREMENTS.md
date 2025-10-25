# UI Styling Requirements for SGEX Workbench

## Background Color Standards

All pages in SGEX Workbench **MUST** use the consistent blue gradient background to maintain visual cohesion and brand consistency:

### Required Background Gradient
```css
background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
```

### Required Header Styling
```css
background: rgba(0, 0, 0, 0.2);
backdrop-filter: blur(10px);
border-bottom: 1px solid rgba(255, 255, 255, 0.3);
```

### Required Title/Branding Colors
```css
.who-branding h1 {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.who-branding .subtitle {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
```

## Fixed Height Layout Standards

All viewer components **MUST** implement fixed height layout for optimal display usage:

### Required Layout Implementation
- **Main Container**: `height: 100vh` with `display: flex; flex-direction: column`
- **Content Sections**: Use `flex: 1` and `min-height: 0` for proper scrolling
- **Footer**: Fixed `height: 60px` with condensed information layout

For detailed requirements, see [Fixed Height Layout Requirements](fixed-height-layout-requirements.md).

## Header Badge Standards

All pages **MUST** display artifact and DAK component type badges in headers, not footers:

### Required Badge Implementation
- **Artifact Type Badges**: File type identification (BPMN, DMN, FHIR, etc.)
- **DAK Component Badges**: Component classification (Business Process, Decision Logic, etc.)
- **Header Positioning**: Badges must appear in page headers alongside titles
- **Color Coding**: Consistent color scheme as defined in layout requirements

## Breadcrumb Standards

All pages **MUST** use the consistent breadcrumb system provided by the page framework:

### Required Breadcrumb Implementation
- **Use PageLayout Framework**: All pages must wrap content with `<PageLayout pageName="...">`
- **Automatic Breadcrumbs**: Framework automatically generates contextual breadcrumbs based on page type
- **Consistent Styling**: All breadcrumbs use standardized WHO design system colors and typography
- **Accessibility**: Built-in ARIA labels and semantic navigation structure

### Breadcrumb Styling Standards
```css
.page-breadcrumbs {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: var(--who-blue, #006cbe);
  text-decoration: underline;
  transition: color 0.2s ease;
}

.breadcrumb-separator {
  color: var(--who-text-muted, #6c757d);
  margin: 0 0.5rem;
}

.breadcrumb-current {
  color: var(--who-text-primary, #333);
  font-weight: 500;
}
```

### Custom Breadcrumbs (When Needed)
For special cases, custom breadcrumbs can be provided:
```jsx
<PageLayout 
  pageName="special-page"
  customBreadcrumbs={[
    { label: 'Home', path: '/' },
    { label: 'Special Section', path: '/special' },
    { label: 'Current Page' } // Current page has no path
  ]}
>
```

## Pages Following Standard (✅ Compliant)

### Background Styling Compliance
- **LandingPage** (`LandingPage.css`)
- **DAKDashboard** (`DAKDashboard.css`)
- **DAKSelection** (`DAKSelection.css`)
- **DAKConfiguration** (`DAKConfiguration.css`)
- **OrganizationSelection** (`OrganizationSelection.css`)
- **BusinessProcessSelection** (`BusinessProcessSelection.css`)
- **DAKActionSelection** (`DAKActionSelection.css`)
- **BPMNViewer** (`BPMNViewer.css`) - ✅ Fixed in PR #XX
- **BPMNSource** (`BPMNSource.css`) - ✅ Fixed in PR #XX
- **TestDashboard** (`TestDashboard.css`) - ✅ Fixed in PR #XX

### Breadcrumb Compliance
- **ActorEditor** - ✅ Uses framework breadcrumbs (Fixed in PR #308)
- **ComponentEditor** - ✅ Uses framework breadcrumbs (Fixed in PR #308)
- **DecisionSupportLogicView** - ✅ Uses framework breadcrumbs (Fixed in PR #308)
- **DAKDashboard** - ✅ Uses framework breadcrumbs (Fixed in PR #308)
- **PagesManager** - ✅ Uses framework breadcrumbs (Fixed in PR #308)
- **BPMNViewer** - ✅ Uses framework breadcrumbs (Fixed in PR #308)
- **BPMNEditor** - ✅ Uses framework breadcrumbs (Fixed in PR #308)

## Components Requiring Migration

### Not Using PageLayout Framework
These components need to be migrated to use the page framework for consistent breadcrumbs:
- **CoreDataDictionaryViewer** - ❌ Uses custom header and breadcrumbs
- **DAKSelection** - ❌ Uses custom header and breadcrumbs
- **BPMNViewerEnhanced** - ❌ Uses custom header and breadcrumbs (if applicable)

## Exceptions (Allowed Different Backgrounds)

### Modal Dialogs and Overlays
Modal dialogs and popup overlays are **allowed** to have white or alternative backgrounds as they overlay the main page:

- **HelpModal** (`HelpModal.css`) - White background appropriate for modal content
- **ContextualHelpMascot** (`ContextualHelpMascot.css`) - White background for help tooltips
- **PATLogin** (`PATLogin.css`) - May contain white input forms within the blue gradient page
- **PATSetupInstructions** (`PATSetupInstructions.css`) - May contain white content areas

### Modal Dialogs and Overlays
Modal dialogs and popup overlays are **allowed** to have white or alternative backgrounds as they overlay the main page:

- **HelpModal** (`HelpModal.css`) - White background appropriate for modal content
- **ContextualHelpMascot** (`ContextualHelpMascot.css`) - White background for help tooltips
- **PATLogin** (`PATLogin.css`) - May contain white input forms within the blue gradient page
- **PATSetupInstructions** (`PATSetupInstructions.css`) - May contain white content areas

## Development Guidelines

### For New Pages
When creating new page components:

1. **Always start with the standard blue gradient background**
2. **Use the standard header styling pattern**
3. **Ensure text colors provide adequate contrast against the blue background**
4. **Test on multiple screen sizes to ensure the gradient renders correctly**

### For Existing Pages
When modifying existing pages:

1. **Verify the page uses the standard background gradient**
2. **If using a different background, document the reason in this file**
3. **Ensure consistency with other pages in the application**

## Dark/Light Mode Requirements

All components **MUST** support both light and dark themes using CSS variables defined in `src/App.css`.

### Required Implementation Pattern

Components must use CSS variables and theme-specific overrides:

```css
.component {
  /* Base styles using CSS variables */
  background: var(--who-primary-bg);
  color: var(--who-text-primary);
  border: 1px solid var(--who-border-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Dark mode specific overrides (optional) */
body.theme-dark .component {
  background: linear-gradient(135deg, var(--who-navy) 0%, var(--who-secondary-bg) 100%);
}

/* Light mode specific overrides (optional) */
body.theme-light .component {
  background: linear-gradient(135deg, var(--who-light-blue) 0%, var(--who-blue-light) 100%);
}
```

### CSS Variables Reference

**Background Variables:**
- `--who-primary-bg` - Main page background (light: #ffffff, dark: #040B76)
- `--who-secondary-bg` - Secondary sections, headers (light: #c0dcf2, dark: #1a2380)
- `--who-card-bg` - Card and panel backgrounds
- `--who-hover-bg` - Hover state background
- `--who-selected-bg` - Selected item background

**Text Variables:**
- `--who-text-primary` - Primary text color (light: #333333, dark: #ffffff)
- `--who-text-secondary` - Secondary/muted text (light: #666666, dark: rgba(255,255,255,0.8))
- `--who-text-muted` - Tertiary/hint text (light: #999999, dark: rgba(255,255,255,0.6))
- `--who-text-on-primary` - Text on primary color backgrounds (always #ffffff)

**Color Variables:**
- `--who-blue` - Primary brand color (#006cbe)
- `--who-blue-light` - Light variant (#338dd6)
- `--who-blue-dark` - Dark variant (#004a99)
- `--who-navy` - Dark navy for gradients (#040B76)
- `--who-light-blue` - Light blue for gradients (#c0dcf2)

**Utility Variables:**
- `--who-border-color` - Default border color (theme-aware)
- `--who-shadow-light`, `--who-shadow-medium`, `--who-shadow-heavy` - Shadow effects (theme-aware)
- `--who-overlay-bg` - Modal overlay background (theme-aware)

**Status Variables:**
- `--who-error-bg`, `--who-error-text`, `--who-error-border` - Error states (theme-aware)

### Anti-Patterns to Avoid

**❌ DO NOT use hardcoded colors:**
```css
/* WRONG - hardcoded colors don't adapt to themes */
.bad-example {
  color: #333;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}
```

**✅ DO use CSS variables:**
```css
/* CORRECT - theme-aware using variables */
.good-example {
  color: var(--who-text-primary);
  background: var(--who-card-bg);
  border: 1px solid var(--who-border-color);
}
```

**❌ DO NOT use media queries for theme detection:**
```css
/* WRONG - deprecated pattern */
@media (prefers-color-scheme: dark) {
  .component {
    background: #1a2380;
  }
}
```

**✅ DO use theme classes:**
```css
/* CORRECT - uses body theme classes */
body.theme-dark .component {
  background: var(--who-secondary-bg);
}
```

### Theme Manager

Theme switching is handled by `src/utils/themeManager.js`:
- Automatically detects system preference on first visit
- Persists user selection in localStorage
- Applies `theme-dark` or `theme-light` class to `<body>` element
- All CSS variables update automatically based on body class

### Testing Dark/Light Mode

Before submitting changes:

1. **Test both themes** - Verify component appearance in light and dark mode
2. **Check contrast ratios** - Ensure text meets WCAG 2.1 AA (4.5:1 for normal text)
3. **Verify transitions** - Theme switching should be smooth with 0.3s ease
4. **Test interactive states** - Hover, focus, active states work in both themes

## Color Palette

### Primary Colors
- **Primary Blue**: `#0078d4` or `var(--who-blue)`
- **Dark Blue**: `#005a9e` or `var(--who-blue-dark)`
- **Text on Blue**: `white` or `rgba(255, 255, 255, 0.95)`

### Accent Colors
- **Success**: `#28a745`
- **Warning**: `#ffc107`
- **Error**: `#dc3545`
- **Info**: `#17a2b8`

**Note:** For theme-aware colors, always prefer CSS variables over hardcoded values.

## Testing Requirements

Before releasing new pages or modifications:

1. **Visual Consistency Check**: Compare with LandingPage and DAKDashboard
2. **Cross-Browser Testing**: Verify gradient renders correctly in Chrome, Firefox, Safari
3. **Mobile Responsiveness**: Ensure gradient scales properly on mobile devices
4. **Accessibility Testing**: 
   - Run `npm run lint:a11y` to check for accessibility issues
   - Verify text contrast ratios meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
   - Test keyboard navigation (Tab, Enter, Escape keys work properly)
   - Verify focus indicators are visible on all interactive elements
   - Check screen reader compatibility (basic testing)
5. **Theme Testing**:
   - Test component in both light and dark mode
   - Verify smooth transitions when switching themes
   - Ensure all colors use CSS variables
   - Check that interactive states (hover, focus, active) work in both themes

## Issue Resolution

If you discover pages with inconsistent backgrounds:

1. **Create an issue** documenting the inconsistency
2. **Follow the patterns** established in this document
3. **Update this documentation** if new exceptions are needed
4. **Test thoroughly** before submitting changes

---

*Last Updated: January 2025*
*Related Issues: #96, #975 (Dark/Light Mode & Accessibility Review)*
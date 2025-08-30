# UI Styling Requirements for SGEX Workbench

## Background Color Standards

All pages in SGEX Workbench **MUST** use the consistent blue gradient background to maintain visual cohesion and brand consistency:

### Required Background Gradient
```css
background: linear-gradient(135deg, #d63384 0%, #b02a5b 100%);
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
  color: var(--who-blue, #d63384);
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

## Color Palette

### Primary Colors
- **Primary Pink**: `#d63384`
- **Dark Pink**: `#b02a5b`
- **Text on Pink**: `white` or `rgba(255, 255, 255, 0.95)`

### Accent Colors
- **Success**: `#28a745`
- **Warning**: `#ffc107`
- **Error**: `#dc3545`
- **Info**: `#17a2b8`

## Testing Requirements

Before releasing new pages or modifications:

1. **Visual Consistency Check**: Compare with LandingPage and DAKDashboard
2. **Cross-Browser Testing**: Verify gradient renders correctly in Chrome, Firefox, Safari
3. **Mobile Responsiveness**: Ensure gradient scales properly on mobile devices
4. **Accessibility**: Verify text contrast ratios meet WCAG guidelines

## Issue Resolution

If you discover pages with inconsistent backgrounds:

1. **Create an issue** documenting the inconsistency
2. **Follow the patterns** established in this document
3. **Update this documentation** if new exceptions are needed
4. **Test thoroughly** before submitting changes

---

*Last Updated: January 2024*
*Related Issues: #96*
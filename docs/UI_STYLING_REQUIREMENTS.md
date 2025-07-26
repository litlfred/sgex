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

## Pages Following Standard (✅ Compliant)

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

## Exceptions (Allowed Different Backgrounds)

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
- **Primary Blue**: `#0078d4`
- **Dark Blue**: `#005a9e`
- **Text on Blue**: `white` or `rgba(255, 255, 255, 0.95)`

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
# CSS Accessibility and Dark/Light Mode Review Workplan

## Overview
Comprehensive review of CSS implementation across SGEX Workbench for accessibility compliance, light/dark mode consistency, and CSS variable usage according to project requirements.

## Review Summary
- **1,486 instances** of proper `var(--who-*)` usage across components ✅
- **54 components** still using hardcoded hex colors instead of CSS variables ⚠️
- **397 theme-specific CSS rules** found across components
- **ESLint configuration conflicts** preventing accessibility auditing from running

## Workplan Table

| Issue | File(s) | Proposal |
|-------|---------|----------|
| **ESLint TypeScript Plugin Conflict** | [.eslintrc.js](src/.eslintrc.js) | Remove duplicate `@typescript-eslint` plugin from overrides section since it's already loaded by `react-app` config. This will enable accessibility linting to run properly. |
| **Hardcoded gradients in BPMN components** | [BPMNEditor.css](src/components/BPMNEditor/BPMNEditor.css)<br/>[BPMNSource.css](src/components/BPMNSource/BPMNSource.css) | Replace hardcoded gradient values with CSS variables `var(--who-blue-gradient)` and add dark mode variants using `body.theme-dark` selectors. |
| **Missing dark mode coverage** | [ContextualHelpMascot.css](src/components/ContextualHelpMascot/ContextualHelpMascot.css)<br/>[DataElementViewer.css](src/components/DataElementViewer/DataElementViewer.css)<br/>[IndicatorViewer.css](src/components/IndicatorViewer/IndicatorViewer.css) | Add `body.theme-dark` and `body.theme-light` specific styling rules for consistent theme support across all components. |
| **Hardcoded hex colors instead of CSS variables** | 54 component files using colors like `#0078d4`, `#ffffff`, `#f8f9fa` | Systematically replace hardcoded colors with appropriate CSS variables from the WHO theme system (`var(--who-primary-blue)`, `var(--who-background-light)`, etc.). |
| **Inconsistent gradient implementation** | [LandingPage.css](src/components/LandingPage/LandingPage.css)<br/>[DAKDashboard.css](src/components/DAKDashboard/DAKDashboard.css) | Standardize gradient usage - some use variables correctly, others use hardcoded values. Ensure all gradients use CSS variables for theme consistency. |
| **Documentation gaps** | [src/styles/README.md](src/styles/README.md)<br/>[public/docs/requirements.md](public/docs/requirements.md) | Update CSS documentation to clearly specify requirements for CSS variable usage, dark/light mode implementation patterns, and accessibility compliance standards. |
| **Accessibility testing strategy** | Build system configuration | Once ESLint config is fixed, establish automated accessibility testing pipeline using `npm run lint:a11y` in CI/CD workflows to catch violations early. |
| **Color contrast analysis** | All component CSS files | Conduct comprehensive WCAG AA compliance testing for color contrast ratios across light and dark themes. Current primary blue (#0078d4) meets standards (4.53:1 ratio). |

## Implementation Priorities

### Phase 1: Fix Build System Issues ⚠️ **CRITICAL**
- [ ] Resolve ESLint TypeScript plugin conflicts
- [ ] Enable accessibility linting pipeline
- [ ] Validate current accessibility compliance

### Phase 2: CSS Variable Migration 🔧 **HIGH PRIORITY**  
- [ ] Replace hardcoded colors in 54 identified components
- [ ] Standardize gradient implementations
- [ ] Ensure consistent WHO theme variable usage

### Phase 3: Dark Mode Completion 🌙 **MEDIUM PRIORITY**
- [ ] Add missing dark mode styles to remaining components
- [ ] Test theme switching functionality
- [ ] Validate color contrast in both themes

### Phase 4: Documentation & Standards 📚 **LOW PRIORITY**
- [ ] Update CSS requirements documentation
- [ ] Create component styling guidelines
- [ ] Establish accessibility testing procedures

## Accessibility Standards Compliance
- **WCAG AA**: Target compliance level for color contrast and interaction patterns
- **jsx-a11y**: ESLint plugin for automated accessibility rule checking
- **WHO Branding**: Maintain official color palette and visual identity requirements

## Next Steps
1. **Address ESLint configuration conflicts** to enable accessibility auditing
2. **Create detailed file-by-file migration plan** for CSS variable adoption
3. **Establish automated testing pipeline** for ongoing compliance monitoring
4. **Document implementation patterns** for consistent future development
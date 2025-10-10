# CSS Accessibility & Dark/Light Mode Review Workplan

**Issue**: Accessibility + CSS dark mode / light mode review  
**Date**: January 2025  
**Status**: Analysis Complete - No Changes Made

## Executive Summary

This document provides a comprehensive code review of CSS styling across the SGEX Workbench project with focus on:
1. Light/dark mode implementation
2. Accessibility compliance
3. Use of site-wide CSS variables
4. Documentation clarity

**Key Findings:**
- ✅ Strong foundation with CSS variables and theme management
- ⚠️ Inconsistent usage of variables (many hardcoded colors remain)
- ❌ Accessibility linting blocked by ESLint configuration issue
- ⚠️ Documentation incomplete for dark/light mode requirements

---

## Workplan Table

| Issue | File(s) | Proposal |
|-------|---------|----------|
| **❌ ESLint plugin conflict** | `.eslintrc.js` | Fix TypeScript ESLint plugin duplicate declaration preventing accessibility linting from running |
| **⚠️ Hardcoded colors in ActorEditor** | `src/components/ActorEditor.css` | Replace ~50+ hardcoded color values (#333, #666, #0078d4, etc.) with CSS variables for proper theme support |
| **⚠️ Hardcoded colors in BPMNEditor** | `src/components/BPMNEditor.css` | Replace hardcoded colors (#0078d4, #f8f9fa, rgb(4, 11, 118)) with CSS variables |
| **⚠️ Hardcoded colors in DecisionSupportLogicView** | `src/components/DecisionSupportLogicView.css` | Replace hardcoded colors (#f8f9fa, #e9ecef, #495057, #6c757d) with CSS variables |
| **⚠️ Hardcoded backgrounds in multiple files** | ~10+ component CSS files | Replace hardcoded background colors with theme-aware variables |
| **⚠️ Deprecated media query usage** | `src/components/PersonaViewer.css` | Replace `@media (prefers-color-scheme: dark)` with theme class selectors |
| **✅ CSS variables well-defined** | `src/App.css` | Variables are comprehensive - includes light/dark themes with proper naming conventions |
| **✅ Theme management implemented** | `src/utils/themeManager.js` | Theme switching works with localStorage and system preference detection |
| **✅ Many components theme-aware** | 35+ CSS files | Components like WelcomePage, DAKDashboard, LandingPage properly use theme classes |
| **📋 Accessibility testing blocked** | ESLint configuration | Cannot run `npm run lint:a11y` due to plugin conflict - needs fix to assess accessibility issues |
| **📋 Contrast ratio verification needed** | All components | Need to verify WCAG 2.1 AA contrast ratios (4.5:1 for text) once colors are standardized |
| **📋 Focus state consistency check** | Multiple components | Verify focus indicators meet WCAG 2.1 requirements across all interactive elements |
| **📋 Documentation update required** | `public/docs/UI_STYLING_REQUIREMENTS.md` | Document dark/light mode requirements and CSS variable usage standards |

---

## Detailed Analysis

### 1. Theme System Architecture ✅

**Current Implementation:**
```css
/* src/App.css - Lines 6-94 */
:root {
  --who-blue: #006cbe;
  --who-navy: #040B76;
  /* ... more variables */
}

body.theme-light {
  --who-primary-bg: #ffffff;
  --who-text-primary: #333333;
  /* ... light theme variables */
}

body.theme-dark {
  --who-primary-bg: #040B76;
  --who-text-primary: #ffffff;
  /* ... dark theme variables */
}
```

**Strengths:**
- ✅ Comprehensive CSS variable system
- ✅ Proper theme class scoping (`body.theme-light`, `body.theme-dark`)
- ✅ Theme manager utility with localStorage persistence
- ✅ System preference detection as fallback
- ✅ Smooth transitions defined

**Theme Manager (`src/utils/themeManager.js`):**
```javascript
export const getSavedTheme = () => {
  const savedTheme = localStorage.getItem('sgex-theme');
  if (savedTheme) return savedTheme;
  
  // Fallback to system preference
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'light' : 'dark';
};
```

### 2. CSS Variable Coverage Analysis

**Available Theme Variables:**

| Category | Light Theme | Dark Theme | Coverage |
|----------|-------------|------------|----------|
| **Backgrounds** | `--who-primary-bg`, `--who-secondary-bg`, `--who-card-bg` | ✅ Defined | Good |
| **Text Colors** | `--who-text-primary`, `--who-text-secondary`, `--who-text-muted` | ✅ Defined | Good |
| **Borders** | `--who-border-color` | ✅ Defined | Good |
| **Interactive States** | `--who-hover-bg`, `--who-selected-bg` | ✅ Defined | Good |
| **Status Colors** | `--who-error-bg`, `--who-error-text`, `--who-error-border` | ✅ Defined | Good |
| **Shadows** | `--who-shadow-light`, `--who-shadow-medium`, `--who-shadow-heavy` | ✅ Defined | Good |

**Example of Proper Usage:**
```css
/* WelcomePage.css */
.welcome-page-content {
  background: var(--who-primary-bg);
  color: var(--who-text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

body.theme-dark .welcome-page-content {
  background: linear-gradient(135deg, var(--who-navy) 0%, var(--who-secondary-bg) 100%);
}

body.theme-light .welcome-page-content {
  background: linear-gradient(135deg, var(--who-light-blue) 0%, var(--who-blue-light) 100%);
}
```

### 3. Problem Areas - Hardcoded Colors

#### ActorEditor.css - 50+ Violations
**Examples:**
```css
/* Line ~50 - Should use var(--who-text-primary) */
color: #333;

/* Line ~80 - Should use var(--who-text-secondary) */
color: #666;

/* Line ~100 - Should use var(--who-blue) */
color: #0078d4;
border-color: #0078d4;

/* Line ~120 - Should use var(--who-error-text) */
color: #c62828;

/* Line ~150 - Should use var(--who-card-bg) or similar */
background: #f5f5f5;
background: #fafafa;
background: #f8f9fa;
```

**Impact:** These hardcoded values don't adapt to theme changes, causing poor contrast and broken appearance in dark mode.

#### BPMNEditor.css - Multiple Violations
```css
/* Hardcoded gradient - should use theme classes */
background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);

/* Hardcoded header - should use var(--who-secondary-bg) */
background: rgb(4, 11, 118);

/* Hardcoded neutral colors */
background: #f8f9fa;
background: #f0f0f0;
```

#### DecisionSupportLogicView.css - No Dark Mode Support
```css
/* All hardcoded - no theme awareness */
.variables-table th {
  background: #f8f9fa;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
}

.search-input:focus {
  border-color: #0078d4; /* Should use var(--who-blue) */
}

.results-count {
  color: #6c757d; /* Should use var(--who-text-muted) */
}
```

### 4. Theme-Aware Components ✅

**Excellent Examples (35+ files):**

1. **WelcomePage.css** - Fully theme-aware
2. **DAKDashboard.css** - Proper gradient overlays
3. **LandingPage.css** - Complete theme support
4. **ActorEditor.css** - Structure is correct (but hardcoded colors within)
5. **App.css** - Bug report form has dark theme adjustments

**Pattern to Follow:**
```css
.component {
  background: var(--who-primary-bg);
  color: var(--who-text-primary);
}

body.theme-dark .component {
  background: linear-gradient(135deg, var(--who-navy) 0%, var(--who-secondary-bg) 100%);
}

body.theme-light .component {
  background: linear-gradient(135deg, var(--who-light-blue) 0%, var(--who-blue-light) 100%);
}
```

### 5. Accessibility Analysis

#### ESLint Configuration Issue ❌
**Current Error:**
```
ESLint couldn't determine the plugin "@typescript-eslint" uniquely.
- node_modules/@typescript-eslint/eslint-plugin/dist/index.js
- node_modules/eslint-config-react-app/node_modules/@typescript-eslint/eslint-plugin/dist/index.js
```

**Impact:** Cannot run `npm run lint:a11y` to detect accessibility issues.

**Solution:**
```javascript
// .eslintrc.js - Remove duplicate plugin declaration
module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:jsx-a11y/recommended'
  ],
  // Remove 'plugins' for TypeScript - already in extends
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      // Remove plugins declaration here
      extends: [
        'react-app',
        'react-app/jest',
        'plugin:jsx-a11y/recommended'
      ]
    }
  ]
}
```

#### Accessibility Features Present ✅
```css
/* App.css - Lines 149-154 */
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--who-blue, #006cbe);
  outline-offset: 2px;
}
```

#### Contrast Ratio Requirements (WCAG 2.1 AA)
**Standards:**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Need to Verify:**
- Light mode text on backgrounds
- Dark mode text on backgrounds
- Button states (normal, hover, focus, disabled)
- Error messages and warnings
- Link colors

**Testing Tools Needed:**
- Chrome DevTools Lighthouse
- axe DevTools browser extension
- WebAIM Contrast Checker
- Manual keyboard navigation testing

### 6. Documentation Review

#### Current Documentation (UI_STYLING_REQUIREMENTS.md)

**What's Covered:**
- ✅ Background gradient standards
- ✅ Fixed height layout requirements
- ✅ Header badge standards
- ✅ Breadcrumb standards
- ✅ Color palette (primary colors)
- ✅ Testing requirements (mentions WCAG)

**What's Missing:**
- ❌ Dark/light mode requirements
- ❌ CSS variable reference and usage
- ❌ Theme switching guidelines
- ❌ Accessibility testing procedures
- ❌ Contrast ratio specifications
- ❌ Focus state requirements
- ❌ Examples of proper theme-aware CSS

**Proposed Addition:**
```markdown
## Dark/Light Mode Requirements

All components **MUST** support both light and dark themes using CSS variables:

### Required Implementation Pattern
```css
.component {
  /* Base styles using CSS variables */
  background: var(--who-primary-bg);
  color: var(--who-text-primary);
  border: 1px solid var(--who-border-color);
}

/* Optional theme-specific overrides */
body.theme-dark .component {
  /* Dark mode specific styles */
}

body.theme-light .component {
  /* Light mode specific styles */
}
```

### CSS Variables Reference
| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--who-primary-bg` | #ffffff | #040B76 | Main background |
| `--who-text-primary` | #333333 | #ffffff | Primary text |
| `--who-blue` | #006cbe | #006cbe | Brand color |

### Testing Requirements
1. Test component in both light and dark modes
2. Verify contrast ratios meet WCAG 2.1 AA (4.5:1)
3. Test theme switching during runtime
4. Verify all interactive elements have visible focus states
```

---

## Proposed Implementation Plan

### Phase 1: Foundation Fixes (High Priority)

**1.1 Fix ESLint Configuration**
- File: `.eslintrc.js`
- Change: Remove duplicate TypeScript plugin declaration
- Test: Run `npm run lint:a11y` successfully
- Time: 30 minutes

**1.2 Document Dark/Light Mode Requirements**
- File: `public/docs/UI_STYLING_REQUIREMENTS.md`
- Add: CSS variable reference section
- Add: Dark/light mode implementation guide
- Add: Accessibility testing procedures
- Time: 2 hours

**1.3 Create CSS Variable Reference**
- File: `public/docs/CSS_VARIABLES_REFERENCE.md` (new)
- Content: Complete variable catalog with examples
- Include: Usage patterns and anti-patterns
- Time: 1 hour

### Phase 2: Component Refactoring (Medium Priority)

**2.1 ActorEditor.css Refactoring**
- Replace 50+ hardcoded colors with CSS variables
- Add dark mode support for all sections
- Test: Visual regression testing
- Time: 3 hours

**2.2 BPMNEditor.css Refactoring**
- Replace hardcoded gradients with theme classes
- Use CSS variables throughout
- Test: Both themes in all states
- Time: 2 hours

**2.3 DecisionSupportLogicView.css Refactoring**
- Add complete dark mode support
- Replace all hardcoded colors
- Verify table readability in both themes
- Time: 2 hours

**2.4 PersonaViewer.css Update**
- Remove `@media (prefers-color-scheme)` query
- Use theme class selectors instead
- Time: 30 minutes

### Phase 3: Accessibility Verification (Medium Priority)

**3.1 Run Accessibility Linting**
- Execute: `npm run lint:a11y`
- Document: All warnings and errors
- Prioritize: Critical issues
- Time: 1 hour

**3.2 Contrast Ratio Testing**
- Test: All color combinations in both themes
- Tool: WebAIM Contrast Checker + Chrome DevTools
- Document: Any failures
- Fix: Colors not meeting WCAG 2.1 AA
- Time: 3 hours

**3.3 Focus State Audit**
- Test: Keyboard navigation on all pages
- Verify: Visible focus indicators
- Check: Tab order is logical
- Fix: Missing or invisible focus states
- Time: 2 hours

### Phase 4: Additional Improvements (Low Priority)

**4.1 Theme Switching Tests**
- Add: Automated tests for theme switching
- Test: Component appearance in both themes
- Time: 2 hours

**4.2 Accessibility CI/CD Integration**
- Add: Accessibility checks to CI pipeline
- Prevent: Regressions in accessibility
- Time: 1 hour

**4.3 Developer Guidelines**
- Document: Best practices for theme-aware CSS
- Create: Component CSS template
- Add: Code review checklist
- Time: 2 hours

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing layouts | High | Low | Thorough visual testing in both themes |
| Performance impact from CSS | Low | Low | CSS variables are highly performant |
| Browser compatibility | Medium | Low | CSS variables supported in all modern browsers |
| Developer adoption | Medium | Medium | Clear documentation and examples |

---

## Success Criteria

### Must Have ✅
- [ ] ESLint accessibility linting runs without errors
- [ ] All components use CSS variables (no hardcoded colors)
- [ ] Both light and dark modes work properly
- [ ] WCAG 2.1 AA contrast ratios met
- [ ] Documentation updated with dark/light mode requirements

### Should Have 📋
- [ ] All accessibility warnings addressed
- [ ] Focus states visible and consistent
- [ ] Keyboard navigation works everywhere
- [ ] Theme switching tests added

### Nice to Have ⭐
- [ ] Accessibility CI/CD checks
- [ ] Developer guidelines and templates
- [ ] Automated contrast ratio testing

---

## Testing Checklist

### Visual Testing
- [ ] All pages in light mode (Chrome)
- [ ] All pages in dark mode (Chrome)
- [ ] All pages in light mode (Firefox)
- [ ] All pages in dark mode (Firefox)
- [ ] Mobile viewport (both themes)
- [ ] Theme switching transitions smooth

### Accessibility Testing
- [ ] Run `npm run lint:a11y` - no errors
- [ ] Chrome Lighthouse accessibility audit
- [ ] axe DevTools browser extension scan
- [ ] Manual keyboard navigation
- [ ] Screen reader testing (basic)
- [ ] Contrast ratio verification (all colors)

### Functional Testing
- [ ] Theme persists after page reload
- [ ] Theme applies immediately on selection
- [ ] System preference detected correctly
- [ ] All interactive elements remain functional
- [ ] No visual regressions

---

## Appendix A: CSS Variable Reference

### Background Variables
```css
--who-primary-bg      /* Main page background */
--who-secondary-bg    /* Secondary sections, headers */
--who-card-bg         /* Card and panel backgrounds */
--who-hover-bg        /* Hover state background */
--who-selected-bg     /* Selected item background */
```

### Text Variables
```css
--who-text-primary    /* Primary text color */
--who-text-secondary  /* Secondary/muted text */
--who-text-muted      /* Tertiary/hint text */
--who-text-on-primary /* Text on primary color backgrounds */
```

### Color Variables
```css
--who-blue            /* Primary brand color */
--who-blue-light      /* Light variant */
--who-blue-dark       /* Dark variant */
--who-navy            /* Dark navy for gradients */
--who-light-blue      /* Light blue for gradients */
```

### Utility Variables
```css
--who-border-color    /* Default border color */
--who-shadow-light    /* Light shadow */
--who-shadow-medium   /* Medium shadow */
--who-shadow-heavy    /* Heavy shadow */
--who-overlay-bg      /* Modal overlay background */
```

### Status Variables
```css
--who-error-bg        /* Error state background */
--who-error-text      /* Error text color */
--who-error-border    /* Error border color */
```

---

## Appendix B: Files Requiring Changes

### High Priority (Broken in Dark Mode)
1. `src/components/ActorEditor.css` - 50+ hardcoded colors
2. `src/components/BPMNEditor.css` - Hardcoded gradients and colors
3. `src/components/DecisionSupportLogicView.css` - No dark mode support
4. `.eslintrc.js` - Blocking accessibility linting

### Medium Priority (Partial Support)
5. `src/components/PersonaViewer.css` - Uses media query instead of theme classes
6. `src/components/BPMNViewerEnhanced.css` - Some hardcoded colors
7. `src/components/QuestionnaireEditor.css` - Limited theme support
8. Multiple other component CSS files with occasional hardcoded values

### Documentation
9. `public/docs/UI_STYLING_REQUIREMENTS.md` - Add dark/light mode section
10. `public/docs/CSS_VARIABLES_REFERENCE.md` - New file needed

---

**Document Status**: ✅ Complete - Ready for Review  
**Next Action**: Fix ESLint configuration and run accessibility audit  
**Estimated Total Effort**: 20-25 hours across all phases

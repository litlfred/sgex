# CSS Variables Reference for SGEX Workbench

**Version**: 1.0  
**Last Updated**: January 2025  
**Related**: [UI Styling Requirements](UI_STYLING_REQUIREMENTS.md)

## Overview

This document provides a complete reference for all CSS variables used in SGEX Workbench. All variables are defined in `src/App.css` and automatically adapt to light/dark themes based on the `body.theme-light` or `body.theme-dark` class.

## Quick Start

### Using CSS Variables

```css
.my-component {
  /* Always use var() with CSS variables */
  background: var(--who-primary-bg);
  color: var(--who-text-primary);
  border: 1px solid var(--who-border-color);
  
  /* Provide fallback values for safety */
  color: var(--who-blue, #006cbe);
}
```

### Theme-Specific Overrides

```css
/* Base styles */
.my-component {
  background: var(--who-card-bg);
}

/* Dark mode override (optional) */
body.theme-dark .my-component {
  box-shadow: 0 4px 12px var(--who-shadow-heavy);
}

/* Light mode override (optional) */
body.theme-light .my-component {
  box-shadow: 0 2px 8px var(--who-shadow-light);
}
```

---

## Background Variables

### `--who-primary-bg`
**Purpose**: Main page/component background  
**Light Mode**: `#ffffff` (white)  
**Dark Mode**: `#040B76` (WHO navy)  
**Usage**: Primary background for all pages and components

```css
.page-container {
  background: var(--who-primary-bg);
}
```

### `--who-secondary-bg`
**Purpose**: Secondary sections, headers, sidebars  
**Light Mode**: `#c0dcf2` (light blue)  
**Dark Mode**: `#1a2380` (medium navy)  
**Usage**: Header backgrounds, secondary panels

```css
.header {
  background: var(--who-secondary-bg);
}
```

### `--who-card-bg`
**Purpose**: Card and panel backgrounds  
**Light Mode**: `#ffffff` (white)  
**Dark Mode**: `rgba(255, 255, 255, 0.1)` (translucent white)  
**Usage**: Cards, modals, elevated surfaces

```css
.card {
  background: var(--who-card-bg);
  border: 1px solid var(--who-border-color);
}
```

### `--who-hover-bg`
**Purpose**: Hover state background  
**Light Mode**: `#e0ebf7` (very light blue)  
**Dark Mode**: `rgba(255, 255, 255, 0.1)` (translucent white)  
**Usage**: Interactive elements on hover

```css
.button:hover {
  background: var(--who-hover-bg);
}
```

### `--who-selected-bg`
**Purpose**: Selected item background  
**Light Mode**: `rgba(0, 108, 190, 0.1)` (translucent blue)  
**Dark Mode**: `rgba(0, 108, 190, 0.3)` (more opaque translucent blue)  
**Usage**: Selected items in lists, active navigation

```css
.list-item.selected {
  background: var(--who-selected-bg);
}
```

### `--who-bg-light`
**Purpose**: Very subtle background tint  
**Light Mode**: Not defined (use `--who-hover-bg`)  
**Dark Mode**: `rgba(255, 255, 255, 0.05)` (very subtle white)  
**Usage**: Subtle background variations in dark mode

---

## Text Variables

### `--who-text-primary`
**Purpose**: Primary text color  
**Light Mode**: `#333333` (dark gray)  
**Dark Mode**: `#ffffff` (white)  
**Usage**: Body text, headings, primary content

```css
.text {
  color: var(--who-text-primary);
}
```

### `--who-text-secondary`
**Purpose**: Secondary/supporting text  
**Light Mode**: `#666666` (medium gray)  
**Dark Mode**: `rgba(255, 255, 255, 0.8)` (translucent white)  
**Usage**: Subtitles, descriptions, meta information

```css
.subtitle {
  color: var(--who-text-secondary);
}
```

### `--who-text-muted`
**Purpose**: Tertiary/hint text  
**Light Mode**: `#999999` (light gray)  
**Dark Mode**: `rgba(255, 255, 255, 0.6)` (more translucent white)  
**Usage**: Hints, placeholders, disabled text

```css
.hint {
  color: var(--who-text-muted);
}
```

### `--who-text-on-primary`
**Purpose**: Text on primary colored backgrounds  
**Light Mode**: `#ffffff` (white)  
**Dark Mode**: `#ffffff` (white)  
**Usage**: Text on blue buttons, colored badges

```css
.primary-button {
  background: var(--who-blue);
  color: var(--who-text-on-primary);
}
```

---

## Color Variables

### `--who-blue`
**Purpose**: Primary brand color  
**Both Modes**: `#006cbe` (WHO blue)  
**Usage**: Primary buttons, links, brand elements

```css
.link {
  color: var(--who-blue);
}

.primary-button {
  background: var(--who-blue);
}
```

### `--who-blue-light`
**Purpose**: Light blue variant  
**Both Modes**: `#338dd6` (lighter blue)  
**Usage**: Hover states, light accents

```css
.button:hover {
  background: var(--who-blue-light);
}
```

### `--who-blue-dark`
**Purpose**: Dark blue variant  
**Both Modes**: `#004a99` (darker blue)  
**Usage**: Active states, emphasis

```css
.button:active {
  background: var(--who-blue-dark);
}
```

### `--who-navy`
**Purpose**: Dark navy for backgrounds  
**Both Modes**: `#040B76` (WHO navy)  
**Usage**: Dark mode backgrounds, gradients

```css
body.theme-dark .page {
  background: linear-gradient(135deg, var(--who-navy) 0%, var(--who-secondary-bg) 100%);
}
```

### `--who-light-blue`
**Purpose**: Light blue for backgrounds  
**Both Modes**: `#c0dcf2` (light blue)  
**Usage**: Light mode backgrounds, gradients

```css
body.theme-light .page {
  background: linear-gradient(135deg, var(--who-light-blue) 0%, var(--who-blue-light) 100%);
}
```

### `--who-light-blue-light`
**Purpose**: Very light blue  
**Both Modes**: `#e0ebf7` (very light blue)  
**Usage**: Subtle backgrounds, hover states

### `--who-light-blue-dark`
**Purpose**: Darker light blue  
**Both Modes**: `#a0c8e8` (medium light blue)  
**Usage**: Borders, dividers in light mode

---

## Border Variables

### `--who-border-color`
**Purpose**: Default border color  
**Light Mode**: `#a0c8e8` (light blue-gray)  
**Dark Mode**: `rgba(255, 255, 255, 0.2)` (translucent white)  
**Usage**: All borders, dividers, outlines

```css
.card {
  border: 1px solid var(--who-border-color);
}

.divider {
  border-top: 1px solid var(--who-border-color);
}
```

---

## Shadow Variables

### `--who-shadow-light`
**Purpose**: Subtle shadow effect  
**Light Mode**: `rgba(0, 0, 0, 0.1)` (translucent black)  
**Dark Mode**: `rgba(4, 11, 118, 0.2)` (translucent navy)  
**Usage**: Subtle elevation, hover states

```css
.card {
  box-shadow: 0 2px 4px var(--who-shadow-light);
}
```

### `--who-shadow-medium`
**Purpose**: Medium shadow effect  
**Light Mode**: `rgba(0, 0, 0, 0.2)` (translucent black)  
**Dark Mode**: `rgba(4, 11, 118, 0.4)` (translucent navy)  
**Usage**: Card elevation, dropdowns

```css
.dropdown {
  box-shadow: 0 4px 8px var(--who-shadow-medium);
}
```

### `--who-shadow-heavy`
**Purpose**: Strong shadow effect  
**Light Mode**: `rgba(0, 0, 0, 0.3)` (translucent black)  
**Dark Mode**: `rgba(4, 11, 118, 0.6)` (translucent navy)  
**Usage**: Modals, popovers, high elevation

```css
.modal {
  box-shadow: 0 12px 24px var(--who-shadow-heavy);
}
```

### `--who-overlay-bg`
**Purpose**: Modal overlay/backdrop  
**Light Mode**: `rgba(0, 0, 0, 0.7)` (translucent black)  
**Dark Mode**: `rgba(4, 11, 118, 0.8)` (translucent navy)  
**Usage**: Modal backgrounds, overlays

```css
.modal-backdrop {
  background: var(--who-overlay-bg);
}
```

---

## Error/Status Variables

### `--who-error-bg`
**Purpose**: Error state background  
**Light Mode**: `#ffeef0` (light red)  
**Dark Mode**: `rgba(220, 53, 69, 0.1)` (translucent red)  
**Usage**: Error messages, validation errors

```css
.error-message {
  background: var(--who-error-bg);
  color: var(--who-error-text);
  border: 1px solid var(--who-error-border);
}
```

### `--who-error-text`
**Purpose**: Error text color  
**Light Mode**: `#d1242f` (red)  
**Dark Mode**: `#ff6b7a` (light red)  
**Usage**: Error text, validation messages

### `--who-error-border`
**Purpose**: Error border color  
**Light Mode**: `#fdaeb7` (light red)  
**Dark Mode**: `rgba(220, 53, 69, 0.3)` (translucent red)  
**Usage**: Error borders, outlines

---

## Sizing Variables

### `--card-size-default`
**Purpose**: Default card size  
**Value**: `18em`  
**Usage**: Standard card height

### `--card-icon-size`
**Purpose**: Icon size in cards  
**Value**: `12em`  
**Usage**: Icon/image dimensions in cards

### `--icon-size-default`
**Purpose**: Default icon size  
**Value**: `24px`  
**Usage**: Standard icon size

### `--icon-size-large`
**Purpose**: Large icon size  
**Value**: `3em`  
**Usage**: Feature icons, emphasis

### `--icon-size-max`
**Purpose**: Maximum icon size  
**Value**: `12em`  
**Usage**: Hero images, large illustrations

---

## Spacing Variables

### `--component-padding-default`
**Purpose**: Default component padding  
**Value**: `1.5rem`  
**Usage**: Standard padding for components

### `--component-height-default`
**Purpose**: Default component height  
**Value**: `200px`  
**Usage**: Standard component height

### `--component-width-default`
**Purpose**: Default component width  
**Value**: `280px`  
**Usage**: Standard component width

### `--component-border-radius-default`
**Purpose**: Default border radius  
**Value**: `16px`  
**Usage**: Rounded corners on cards, buttons

```css
.card {
  padding: var(--component-padding-default);
  border-radius: var(--component-border-radius-default);
}
```

---

## Dark Mode Specific Variables

These variables are only defined in dark mode (`body.theme-dark`):

### `--who-dropdown-bg`
**Purpose**: Dropdown background in dark mode  
**Value**: `#1a2380`  
**Usage**: Dropdown menus, selects in dark mode

### `--who-dropdown-hover-bg`
**Purpose**: Dropdown hover state in dark mode  
**Value**: `rgba(255, 255, 255, 0.15)`  
**Usage**: Dropdown item hover in dark mode

---

## Usage Patterns

### ✅ Good Examples

```css
/* Component with theme support */
.component {
  background: var(--who-card-bg);
  color: var(--who-text-primary);
  border: 1px solid var(--who-border-color);
  padding: var(--component-padding-default);
  border-radius: var(--component-border-radius-default);
  box-shadow: 0 2px 8px var(--who-shadow-light);
  transition: all 0.3s ease;
}

/* Interactive states */
.button {
  background: var(--who-blue);
  color: var(--who-text-on-primary);
  border: none;
  padding: 0.5rem 1rem;
}

.button:hover {
  background: var(--who-blue-light);
}

.button:active {
  background: var(--who-blue-dark);
}

/* Theme-specific overrides */
body.theme-dark .special-card {
  background: linear-gradient(135deg, var(--who-navy) 0%, var(--who-secondary-bg) 100%);
}
```

### ❌ Bad Examples (Anti-Patterns)

```css
/* WRONG: Hardcoded colors */
.bad-component {
  background: #ffffff;  /* Should be var(--who-card-bg) */
  color: #333333;       /* Should be var(--who-text-primary) */
  border: 1px solid #e0e0e0;  /* Should be var(--who-border-color) */
}

/* WRONG: Using @media for theme detection */
@media (prefers-color-scheme: dark) {
  .bad-component {
    background: #1a2380;  /* Should use body.theme-dark selector */
  }
}

/* WRONG: Not using variables for spacing */
.bad-spacing {
  padding: 1.5rem;  /* Should be var(--component-padding-default) */
}
```

---

## Migration Guide

### Converting Hardcoded Colors to Variables

**Before:**
```css
.old-component {
  background: #ffffff;
  color: #333333;
  border: 1px solid #e0e0e0;
}
```

**After:**
```css
.new-component {
  background: var(--who-card-bg);
  color: var(--who-text-primary);
  border: 1px solid var(--who-border-color);
}
```

### Common Replacements

| Hardcoded Value | CSS Variable |
|-----------------|--------------|
| `#ffffff` (white background) | `var(--who-primary-bg)` or `var(--who-card-bg)` |
| `#333333`, `#333` (dark text) | `var(--who-text-primary)` |
| `#666666`, `#666` (gray text) | `var(--who-text-secondary)` |
| `#999999`, `#999` (light gray) | `var(--who-text-muted)` |
| `#0078d4` (blue) | `var(--who-blue)` |
| `#f5f5f5`, `#f8f9fa` (light bg) | `var(--who-card-bg)` or `var(--who-hover-bg)` |
| `rgba(0, 0, 0, 0.1)` (shadow) | `var(--who-shadow-light)` |

---

## Testing Your CSS

### Checklist

- [ ] All colors use CSS variables (no hardcoded hex/rgb values)
- [ ] Component looks correct in light mode
- [ ] Component looks correct in dark mode
- [ ] Hover states work in both themes
- [ ] Focus states are visible in both themes
- [ ] Text contrast meets WCAG 2.1 AA (4.5:1 minimum)
- [ ] Transitions are smooth (0.3s ease recommended)

### Testing Commands

```bash
# Check for accessibility issues
npm run lint:a11y

# Start development server to test themes
npm start
```

---

## Reference Implementation

See these components for excellent examples:
- `src/components/WelcomePage.css` - Full theme support with gradients
- `src/components/DAKDashboard.css` - Proper theme overrides
- `src/components/LandingPage.css` - Good use of variables throughout
- `src/App.css` - Variable definitions and theme classes

---

## Additional Resources

- [UI Styling Requirements](UI_STYLING_REQUIREMENTS.md) - Overall styling guidelines
- [Theme Manager](../../src/utils/themeManager.js) - Theme switching logic
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

*Last Updated: January 2025*  
*Maintained by: SGEX Development Team*

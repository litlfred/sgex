# Accessibility Linting with eslint-plugin-jsx-a11y

This project uses `eslint-plugin-jsx-a11y` to enforce accessibility best practices in React components.

## What is eslint-plugin-jsx-a11y?

The `eslint-plugin-jsx-a11y` plugin is a static AST checker for accessibility rules on JSX elements. It helps identify potential accessibility issues during development, making it easier to build accessible web applications.

## Configuration

The accessibility linting is configured in `.eslintrc.js` with the following settings:

- Extends `plugin:jsx-a11y/recommended` for comprehensive accessibility rules
- Additional custom rules for enhanced accessibility checking
- All rules are set to "warn" level to provide feedback without breaking builds

## Available Scripts

### `npm run lint`
Runs ESLint on all JavaScript/JSX files in the src directory.

### `npm run lint:a11y`
Runs ESLint and filters output to show only accessibility (jsx-a11y) warnings.

### `npm run lint:fix`
Automatically fixes linting issues where possible.

## Common Accessibility Rules

The configuration includes rules for:

### Interactive Elements
- `jsx-a11y/click-events-have-key-events`: Click handlers must have keyboard equivalents
- `jsx-a11y/interactive-supports-focus`: Interactive elements must be focusable
- `jsx-a11y/no-static-element-interactions`: Avoid non-semantic interactive elements

### Form Accessibility
- `jsx-a11y/label-has-associated-control`: Form labels must be associated with controls
- `jsx-a11y/no-autofocus`: Avoid autofocus for better user experience

### ARIA and Semantic HTML
- `jsx-a11y/aria-props`: Validate ARIA properties
- `jsx-a11y/aria-role`: Validate ARIA roles
- `jsx-a11y/alt-text`: Images must have alt text
- `jsx-a11y/heading-has-content`: Headings must have content

## Current Status

As of implementation, the project has 172 accessibility warnings that provide opportunities for improvement. These are flagged as warnings rather than errors to allow continued development while highlighting areas for enhancement.

## Best Practices

When developing new components:

1. Use semantic HTML elements when possible
2. Provide proper ARIA labels and roles for custom interactive elements
3. Ensure keyboard navigation support for all interactive elements
4. Associate form labels with their controls
5. Provide alternative text for images
6. Avoid positive tabindex values

## Fixing Accessibility Issues

Many accessibility issues can be resolved by:

- Adding `onKeyDown` handlers alongside `onClick` handlers
- Using `role` and `tabIndex` attributes for custom interactive elements
- Properly associating labels with form controls using `htmlFor` or nesting
- Adding `aria-label` attributes for screen reader support

## Resources

- [jsx-a11y Plugin Documentation](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
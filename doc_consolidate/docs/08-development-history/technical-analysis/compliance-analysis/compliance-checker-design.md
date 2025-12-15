# Framework Compliance Checker Design Principles

## Core Design Principle: NO HEURISTICS

**CRITICAL**: The compliance checker MUST NOT use heuristics to determine which pages should be checked. Heuristics indicate poor design and make the system unpredictable.

## Explicit Exclusion Approach

All pages are checked for compliance by default. Only pages that explicitly handle browser routing errors are excluded from LOW PRIORITY checks.

### Explicit Exclusion List

The compliance checker maintains an explicit list of pages that handle browser routing errors:

```javascript
const ROUTING_ERROR_PAGES = [
  'NotFound',        // 404 error page
  'DashboardRedirect' // Redirect utility page
];
```

### Why These Pages Are Excluded

These pages handle browser routing errors and should not be flagged for optional service integrations because:

1. **NotFound** - The 404 error page handles invalid routes and should remain simple
2. **DashboardRedirect** - A simple redirect utility that forwards users to the correct page

## Compliance Check Categories

### HIGH PRIORITY Checks
- PageLayout wrapper
- Unique pageName prop
- Framework hooks usage
- No manual ContextualHelpMascot imports
- No custom headers
- No nested layouts
- Profile creation compliance

These checks apply to ALL pages without exception.

### MEDIUM PRIORITY Checks
- User access integration
- Background styling
- Staging ground integration (for asset editors)
- Data access layer usage
- Branch context awareness (for DAK components)

These checks apply to ALL pages without exception.

### LOW PRIORITY Checks
- Issue tracking service integration (Check 13)
- Bookmark service integration (Check 14)
- Help content registration (Check 15)
- Tutorial integration (Check 16)

These checks apply to ALL pages EXCEPT those in the `ROUTING_ERROR_PAGES` list.

## Adding New Exclusions

To add a new page to the exclusion list:

1. **Verify the page handles browser routing errors** - Only pages that deal with routing errors (404, redirects, etc.) should be excluded
2. **Add to the ROUTING_ERROR_PAGES list** - Add the exact component name
3. **Document why** - Add a comment explaining why this page handles routing errors

**DO NOT** add pages to the exclusion list for any other reason. If a page doesn't need certain integrations, that indicates a design issue with either the page or the compliance requirements themselves.

## Example: Correct vs Incorrect Exclusions

### ✅ CORRECT Exclusions
```javascript
const ROUTING_ERROR_PAGES = [
  'NotFound',        // Handles 404 errors
  'DashboardRedirect', // Handles redirects for missing context
  'ErrorBoundary'    // Handles runtime errors (if such a page exists)
];
```

### ❌ INCORRECT Exclusions (DO NOT DO THIS)
```javascript
// WRONG - Using heuristics
const ROUTING_ERROR_PAGES = componentName.includes('Viewer') ? [] : ['NotFound'];

// WRONG - Excluding based on page complexity
const ROUTING_ERROR_PAGES = fileSize < 1000 ? ['NotFound', 'SimplePages'] : ['NotFound'];

// WRONG - Excluding selection pages
const ROUTING_ERROR_PAGES = ['NotFound', 'OrganizationSelection', 'DAKSelection'];
```

## Implementation Requirements

1. **Explicit Lists Only** - All exclusions must be in the `ROUTING_ERROR_PAGES` constant
2. **No Pattern Matching** - Do not use regex or string matching to determine exclusions
3. **No Content Analysis** - Do not analyze file size, imports, or content to determine exclusions
4. **No Conditional Logic** - Do not use if/else logic to build exclusion lists dynamically
5. **Clear Documentation** - Every excluded page must have a comment explaining why

## Rationale

This design ensures:

1. **Predictability** - Developers know exactly which pages are excluded and why
2. **Maintainability** - Easy to understand and modify the exclusion list
3. **No Surprises** - No hidden logic that might exclude pages unexpectedly
4. **Clear Intent** - The exclusion list documents the design decision explicitly

## Enforcement

This design principle is **MANDATORY** for all contributors. Pull requests that introduce heuristics will be rejected.

If you find yourself wanting to add heuristics, it's a sign that either:
1. The compliance requirements need to be reconsidered
2. The page design needs to be improved
3. The page actually does handle routing errors and should be explicitly added to the list

Do not work around the issue with heuristics - address the root cause instead.

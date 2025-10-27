# Developer Guide: Page Framework Compliance

This guide helps developers create and migrate pages to be compliant with the SGEX Page Framework.

## Quick Start Checklist

When creating a new page or migrating an existing one:

- [ ] **Import PageLayout**: `import { PageLayout } from './framework';`
- [ ] **Wrap content**: `<PageLayout pageName="unique-name">...</PageLayout>`
- [ ] **Remove custom headers**: Delete any manual header implementations
- [ ] **Remove ContextualHelpMascot**: Delete manual imports and usage (PageLayout provides it)
- [ ] **Use framework hooks**: Replace `useParams()` with `usePageParams()` or `useDAKParams()`
- [ ] **Remove unused functions**: Clean up navigation handlers that PageLayout now provides
- [ ] **Test both modes**: Verify page works in authenticated and demo modes
- [ ] **Run compliance check**: `npm run check-framework-compliance`

## Framework Components Overview

### PageLayout
The main wrapper that provides:
- Consistent header with appropriate elements for page type
- Error boundaries with automatic bug reporting
- Contextual help mascot in bottom-right corner
- Loading states and URL validation

```jsx
<PageLayout pageName="unique-page-name">
  <div>Your page content</div>
</PageLayout>
```

### Framework Hooks
Replace direct parameter access with framework hooks:

```jsx
// Instead of this:
const { user, repo, branch } = useParams();

// Use this for DAK pages:
const { profile, repository, branch } = useDAKParams();

// Or this for general pages:
const { type, navigate } = usePageParams();
```

## Page Type Guidelines

### Top-Level Pages (`/sgex/{page_name}`)
- No additional context from URL
- Examples: Landing page, documentation, admin tools
- Header shows: SGEX logo, documentation button, login controls

### User Pages (`/sgex/{page_name}/{user}`)
- Context: GitHub user or organization
- Examples: Repository selection, DAK action selection
- Header shows: User breadcrumb, GitHub user button

### DAK Pages (`/sgex/{page_name}/{user}/{repo}[/{branch}]`)
- Context: GitHub user, repository, optional branch
- Examples: Dashboard, data dictionary viewer, editors
- Header shows: User/repo breadcrumbs, branch selector, repository button

### Asset Pages (`/sgex/{page_name}/{user}/{repo}/{branch}/{asset}`)
- Context: Specific file being edited/viewed
- Examples: Component editor, file viewers
- Header shows: Full breadcrumb path, file context

## Migration Examples

### Before (Non-Compliant)
```jsx
import React from 'react';
import ContextualHelpMascot from './ContextualHelpMascot';

const MyPage = () => {
  const handleHomeNavigation = () => navigate('/');

  return (
    <div className="my-page">
      <div className="page-header">
        <h1 onClick={handleHomeNavigation}>SGEX Workbench</h1>
        <div className="user-info">...</div>
      </div>
      <div className="page-content">
        <h2>My Page Content</h2>
      </div>
      <ContextualHelpMascot pageId="my-page" />
    </div>
  );
};
```

### After (Framework Compliant)
```jsx
import React from 'react';
import { PageLayout } from './framework';

const MyPage = () => {
  return (
    <PageLayout pageName="my-page">
      <div className="page-content">
        <h2>My Page Content</h2>
      </div>
    </PageLayout>
  );
};
```

## Common Patterns

### Loading States
Let PageLayout handle loading - don't create custom loading screens in early returns:

```jsx
// Good - wrap loading state with PageLayout
if (loading) {
  return (
    <PageLayout pageName="my-page-loading">
      <div>Loading...</div>
    </PageLayout>
  );
}

// Better - let PageLayout handle loading automatically
// (if using framework hooks like useDAKParams)
```

### Error States
Wrap error states with PageLayout or let framework error boundaries handle them:

```jsx
if (error) {
  return (
    <PageLayout pageName="my-page-error">
      <div className="error-content">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    </PageLayout>
  );
}
```

### Breadcrumb Navigation
Keep page-specific breadcrumbs - they're not part of the header:

```jsx
<PageLayout pageName="my-page">
  <div className="breadcrumb">
    <button onClick={() => navigate('/')}>Home</button>
    <span>›</span>
    <span>Current Page</span>
  </div>
  <div className="page-content">...</div>
</PageLayout>
```

## Validation and Testing

### Automated Compliance Check
```bash
npm run check-framework-compliance
```

This will:
- ✅ Check PageLayout usage
- ✅ Verify pageName props
- ✅ Detect framework hook usage
- ✅ Find manual ContextualHelpMascot imports
- ✅ Identify custom header implementations

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] Header shows appropriate elements for page type
- [ ] Help mascot appears in bottom-right corner
- [ ] Error states display properly
- [ ] URL parameters work correctly
- [ ] Navigation functions work
- [ ] Page works in both authenticated and demo modes
- [ ] Responsive design is maintained

### GitHub Actions
The framework compliance check runs automatically on PRs that modify:
- `src/components/**/*.js`
- `src/components/**/*.jsx`
- `src/App.js`
- `scripts/check-framework-compliance.js`

## Troubleshooting

### Common Issues

**Build Error: "ContextualHelpMascot is not defined"**
- Remove the import and usage - PageLayout provides it automatically

**Build Error: "handleHomeNavigation is assigned but never used"**
- Remove navigation functions - PageLayout handles header navigation

**Compliance Check: "Missing PageLayout wrapper"**
- Ensure your component is wrapped with `<PageLayout pageName="...">`

**Compliance Check: "PageLayout missing pageName prop"**
- Add a unique `pageName` prop: `<PageLayout pageName="unique-name">`

**Header not showing expected elements**
- Check that your page follows the correct URL pattern for its type
- Verify you're using the right framework hooks for parameter access

### Getting Help

1. Check the [Page Framework Documentation](page-framework.md)
2. Look at existing compliant pages for examples:
   - `LandingPage.js` - Top-level page
   - `DAKActionSelection.js` - User page  
   - `RepositorySelection.js` - User page
   - `TestDocumentationPage.js` - Simple top-level page
3. Run the compliance checker for specific feedback
4. Review your page against this developer guide

## Performance Considerations

- PageLayout is lightweight and adds minimal overhead
- Framework hooks are optimized for common use cases
- Error boundaries prevent crashes from propagating
- Help system is loaded on-demand

## Framework Updates

When the Page Framework is updated:
1. Framework-compliant pages benefit automatically
2. No code changes needed in compliant pages
3. Compliance checker may be updated with new rules
4. Migration guides will be provided for breaking changes
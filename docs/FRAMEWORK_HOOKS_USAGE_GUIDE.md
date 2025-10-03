# SGEX Framework Hooks Usage Guide

## Overview

This guide provides comprehensive instructions for using SGEX framework hooks correctly to avoid common deployment errors and ensure robust component behavior.

## Page Framework Hooks

### 1. `usePage()` - For DAK Viewer Components

**Use Case**: Components that display/view DAK content in read-only mode
**Examples**: PersonaViewer, CoreDataDictionaryViewer, TestingViewer

```javascript
import { PageLayout, usePage } from './framework';

const YourViewerComponent = () => {
  return (
    <PageLayout pageName="your-viewer">
      <YourViewerContent />
    </PageLayout>
  );
};

const YourViewerContent = () => {
  const pageContext = usePage();
  
  // ALWAYS handle null context for deployment robustness
  if (!pageContext) {
    return (
      <div className="your-viewer">
        <div className="loading-message">
          <h2>Loading</h2>
          <p>Initializing page context...</p>
        </div>
      </div>
    );
  }
  
  // Handle unsuitable page context types
  if (pageContext.type === 'top-level' || pageContext.type === 'unknown') {
    return (
      <div className="your-viewer">
        <div className="error-message">
          <h2>Repository Context Required</h2>
          <p>This component requires a DAK repository context.</p>
          <code>/your-viewer/:user/:repo/:branch</code>
        </div>
      </div>
    );
  }
  
  const { profile, repository, branch } = pageContext;
  
  // Your component logic here...
};
```

### 2. `useDAKParams()` - For DAK Editor/Asset Components

**Use Case**: Components that edit/modify DAK content and require strict DAK context
**Examples**: ActorEditor, QuestionnaireEditor, AssetEditor components

```javascript
import { PageLayout, useDAKParams } from './framework';

const YourEditorComponent = () => {
  const pageParams = useDAKParams();
  
  // ALWAYS handle error state first
  if (pageParams.error) {
    return (
      <PageLayout pageName="your-editor">
        <div className="your-editor-container">
          <div className="error-message">
            <h2>Page Context Error</h2>
            <p>{pageParams.error}</p>
            <p>This component requires a DAK repository context to function properly.</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  // Handle loading state
  if (pageParams.loading) {
    return (
      <PageLayout pageName="your-editor">
        <div className="your-editor-container">
          <div className="loading-message">
            <h2>Loading...</h2>
            <p>Initializing page context...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  const { profile, repository, branch } = pageParams;
  
  // Your editor logic here...
};
```

### 3. `useUserParams()` - For User-Level Components

**Use Case**: Components that operate at user/organization level
**Examples**: UserDashboard, OrganizationSettings

```javascript
import { useUserParams } from './framework';

const YourUserComponent = () => {
  const { user, profile, loading, error } = useUserParams();
  
  if (loading) return <div>Loading user context...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // Your user-level logic here...
};
```

## Hook Selection Decision Tree

```
Does your component need to:
├── Edit/modify DAK content?
│   └── Use useDAKParams() with error/loading handling
├── View/display DAK content?
│   └── Use usePage() with null/type checking
├── Work with user/org data?
│   └── Use useUserParams()
└── Access raw page parameters?
    └── Use usePageParams() (advanced use only)
```

## Error Handling Patterns

### Pattern 1: Graceful Degradation (Recommended for Viewers)

```javascript
const { profile, repository, branch } = usePage();

// Show limited functionality if context is missing
if (!profile || !repository) {
  return (
    <div className="limited-view">
      <h2>Repository Information Not Available</h2>
      <p>Some features may be limited without repository context.</p>
      {/* Show what you can without full context */}
    </div>
  );
}
```

### Pattern 2: Strict Requirements (Recommended for Editors)

```javascript
const pageParams = useDAKParams();

if (pageParams.error || !pageParams.repository) {
  return (
    <div className="error-state">
      <h2>Repository Context Required</h2>
      <p>This editor requires full DAK repository access.</p>
    </div>
  );
}
```

## Common Deployment Issues and Solutions

### Issue 1: `useDAKParams can only be used on DAK or Asset pages`

**Cause**: Component using `useDAKParams()` loaded in wrong context
**Solution**: Use the defensive pattern above with error handling

### Issue 2: `PageContext is null - component not wrapped in PageProvider`

**Cause**: PageProvider not initialized in deployment environment
**Solution**: Always check for null context in components

### Issue 3: Component crashes on direct URL access

**Cause**: Missing defensive handling for various page states
**Solution**: Implement complete error/loading/null checking

## Framework Architecture Compliance Checklist

### For DAK Viewer Components (`usePage`)
- [ ] Uses `PageLayout` wrapper with correct `pageName`
- [ ] Handles null `pageContext`
- [ ] Handles unsuitable page types (`top-level`, `unknown`)
- [ ] Provides user feedback for missing context
- [ ] Uses `githubService` for API calls
- [ ] Follows standard URL pattern: `/:component/:user/:repo/:branch`

### For DAK Editor Components (`useDAKParams`)
- [ ] Uses `PageLayout` or `AssetEditorLayout` wrapper
- [ ] Handles `pageParams.error` state first
- [ ] Handles `pageParams.loading` state
- [ ] Provides clear error messages for context issues
- [ ] Uses proper save/commit workflows
- [ ] Implements proper authentication checks

### General Requirements
- [ ] Component is lazy-loaded in `componentRouteService.js`
- [ ] Route is configured in `routes-config.json`
- [ ] Component follows WHO branding guidelines
- [ ] Includes contextual help topics in `helpContentService.js`
- [ ] Has proper CSS classes and responsive design

## Testing Your Components

### Manual Testing Checklist
1. **Direct URL Access**: Navigate directly to component URL
2. **Unauthenticated Access**: Test without GitHub authentication
3. **Invalid Repository**: Test with non-existent repository
4. **Page Refresh**: Refresh page while on component
5. **Network Issues**: Test with intermittent connectivity

### Deployment Testing
1. **Feature Branch Deployment**: Test on deployed feature branch
2. **Cache Issues**: Test after deployment cache clears
3. **Different Browsers**: Test cross-browser compatibility
4. **Mobile Devices**: Test responsive behavior

## Framework Hooks Reference

### Return Values

#### `usePage()` Returns:
```javascript
{
  pageName: string,
  user: string | null,
  profile: object | null,
  repository: object | null, 
  branch: string | null,
  asset: string | null,
  type: 'top-level' | 'user' | 'dak' | 'asset',
  loading: boolean,
  error: string | null,
  isAuthenticated: boolean,
  navigate: function,
  params: object,
  location: object
}
```

#### `useDAKParams()` Returns:
```javascript
{
  user: string | null,
  profile: object | null,
  repository: object | null,
  branch: string | null,  
  asset: string | null,
  updateBranch: function,
  navigate: function,
  loading: boolean,
  error: string | null  // NEW: Error message for graceful degradation
}
```

## Migration Guide

### Migrating from Throwing `useDAKParams()` to Graceful Version

**Old Pattern (Error-Prone):**
```javascript
const { profile, repository } = useDAKParams(); // Could throw error
```

**New Pattern (Robust):**
```javascript
const pageParams = useDAKParams();

if (pageParams.error) {
  return <ErrorComponent message={pageParams.error} />;
}

if (pageParams.loading) {
  return <LoadingComponent />;
}

const { profile, repository } = pageParams;
```

## Best Practices Summary

1. **Always handle error states first** before accessing data
2. **Provide meaningful error messages** to users
3. **Use loading states** for better UX during initialization
4. **Choose the right hook** for your component's purpose
5. **Test in deployment environments** not just local development
6. **Follow the component architecture patterns** consistently
7. **Include proper error boundaries** around framework hook usage

## Support and Troubleshooting

If you encounter issues with framework hooks:

1. Check this guide for the correct usage pattern
2. Verify your component follows the architecture checklist
3. Test your component with direct URL access
4. Review browser console for specific error messages
5. Ensure PageProvider is properly configured in your app structure

For deployment-specific issues, ensure your deployment correctly serves the static files and has proper routing configuration.
# Page Framework

The SGEX Workbench uses a consistent page framework to provide unified URL patterns, header components, error handling, and help functionality across all pages.

## Overview

The page framework consists of several key components that work together to provide a consistent user experience:

- **PageLayout**: Main wrapper that provides layout, error handling, and help integration
- **PageHeader**: Consistent header with navigation, user controls, and context information  
- **ErrorHandler**: Automatic error handling with bug reporting functionality
- **PageProvider**: Context provider that manages page state and URL parameters

## Page Types

The framework supports four types of pages with specific URL patterns:

### 1. Top-Level Pages
**URL Pattern**: `/sgex/{page_name}`
**Examples**: 
- `/sgex/` (landing page)
- `/sgex/docs/overview` (documentation)

**Context**: No additional context inferred from URL path.

**Header Components**:
- SGEX logo (always present)
- Documentation button (except on documentation page)
- Login/user controls

### 2. User Pages  
**URL Pattern**: `/sgex/{page_name}/{user}`
**Examples**:
- `/sgex/dak-action/litlfred` (DAK action selection for user)
- `/sgex/repositories/WorldHealthOrganization` (repository selection)

**Context**: GitHub user or organization is set.

**Header Components**:
- SGEX logo
- User context breadcrumb
- Documentation button  
- GitHub user button
- Login/user controls

### 3. DAK Pages
**URL Pattern**: `/sgex/{page_name}/{user}/{repo}[/{branch}]`
**Examples**:
- `/sgex/dashboard/litlfred/anc-dak` (DAK dashboard, main branch)  
- `/sgex/dashboard/litlfred/anc-dak/feature-branch` (specific branch)
- `/sgex/core-data-dictionary-viewer/WHO/smart-tb/main`

**Context**: GitHub user, repository, and optional branch (defaults to "main").

**Header Components**:
- SGEX logo  
- User/repo context breadcrumbs
- Documentation button
- GitHub repository button  
- Branch selector
- Login/user controls

### 4. Asset Pages
**URL Pattern**: `/sgex/{page_name}/{user}/{repo}/{branch}/{asset}`
**Examples**:
- `/sgex/editor/litlfred/anc-dak/main/input/vocabulary/ValueSet-anc-care-codes.json`
- `/sgex/bpmn-viewer/WHO/smart-tb/main/input/actors/Client.json`

**Context**: GitHub user, repository, branch, and specific asset being edited/viewed.

**Header Components**:
- SGEX logo
- User/repo/branch context breadcrumbs  
- Documentation button
- GitHub repository button
- Branch selector  
- Login/user controls

## Using the Framework

### Basic Usage

Wrap your page component with `PageLayout`:

```jsx
import React from 'react';
import { PageLayout } from '../components/framework';

const MyPage = () => {
  return (
    <PageLayout pageName="my-page">
      <div>
        <h1>My Page Content</h1>
        <p>This page uses the framework!</p>
      </div>
    </PageLayout>
  );
};

export default MyPage;
```

### Accessing Page Context

Use the page hooks to access URL parameters and context:

```jsx
import React from 'react';
import { PageLayout, usePageParams, useDAKParams } from '../components/framework';

const DAKComponentPage = () => {
  // For any page type
  const { type, navigate } = usePageParams();
  
  // For DAK/Asset pages specifically  
  const { user, profile, repository, branch, updateBranch } = useDAKParams();

  const handleBranchChange = (newBranch) => {
    updateBranch(newBranch);
  };

  return (
    <PageLayout pageName="dak-component">
      <div>
        <h1>DAK Component for {repository?.name}</h1>
        <p>User: {profile?.login}</p>
        <p>Branch: {branch}</p>
        <button onClick={() => handleBranchChange('develop')}>
          Switch to develop
        </button>
      </div>
    </PageLayout>
  );
};

export default DAKComponentPage;
```

### Custom Header Configuration

You can customize the header display:

```jsx
<PageLayout 
  pageName="custom-page" 
  showHeader={false}  // Hide header completely
  showMascot={false}  // Hide help mascot
>
  <div>Custom page content</div>
</PageLayout>
```

## Error Handling

The framework provides automatic error handling:

### Automatic Bug Reports
When an error occurs, users are presented with:
- Large help mascot saying "I'm sorry!"
- Error message and retry options
- Automatic bug report form that pre-fills:
  - Page URL and context
  - Error details
  - Browser information
  - User explanation field

### Error Boundaries
The framework includes React error boundaries that catch:
- Component rendering errors
- Hook usage errors  
- Network request failures
- URL parameter validation errors

### Custom Error Handling
Pages can also throw errors that will be caught by the framework:

```jsx
const MyPage = () => {
  const { profile } = useDAKParams();
  
  if (!profile) {
    throw new Error('Profile is required for this page');
  }
  
  return <div>Page content</div>;
};
```

## Help Integration

All pages automatically include the contextual help mascot:

### Automatic Integration
- Help mascot appears in bottom-right corner
- Provides page-specific help topics
- Maintains consistent styling and behavior

### Custom Help Content
Pages can provide custom help context:

```jsx
<PageLayout 
  pageName="my-page"
  helpContext={{
    user: profile?.login,
    repository: repository?.name,
    customData: 'value'
  }}
>
  <div>Page content</div>
</PageLayout>
```

## URL Pattern Validation

The framework automatically validates URL patterns:

- **User validation**: Checks if GitHub user/org exists
- **Repository validation**: Validates repository access and DAK compatibility  
- **Branch validation**: Ensures branch exists in repository
- **Asset validation**: Confirms asset file exists (when authenticated or public repo)

Invalid URLs automatically redirect to the landing page with appropriate error messages.

## Implementation Examples

### Example 1: Simple User Page
```jsx
// src/components/RepositorySelection.js
import React from 'react';
import { PageLayout, useUserParams } from './framework';

const RepositorySelection = () => {
  const { user, profile, navigateToDAK } = useUserParams();
  
  const handleRepositorySelect = (repo) => {
    navigateToDAK(user, repo.name);
  };

  return (
    <PageLayout pageName="repositories">
      <div className="repository-selection">
        <h1>Repositories for {profile?.name}</h1>
        {/* Repository list */}
      </div>
    </PageLayout>
  );
};

export default RepositorySelection;
```

### Example 2: DAK Dashboard Page
```jsx  
// src/components/DAKDashboard.js
import React from 'react';
import { PageLayout, useDAKParams } from './framework';

const DAKDashboard = () => {
  const { profile, repository, branch } = useDAKParams();

  return (
    <PageLayout pageName="dashboard">
      <div className="dak-dashboard">
        <h1>{repository?.name} Dashboard</h1>
        <p>Branch: {branch}</p>
        {/* Dashboard content */}
      </div>
    </PageLayout>
  );
};

export default DAKDashboard;
```

### Example 3: Asset Editor Page
```jsx
// src/components/AssetEditor.js  
import React from 'react';
import { PageLayout, usePageParams } from './framework';

const AssetEditor = () => {
  const { repository, branch, asset } = usePageParams();

  return (
    <PageLayout pageName="asset-editor">
      <div className="asset-editor">
        <h1>Editing {asset}</h1>
        <p>Repository: {repository?.full_name}</p>
        <p>Branch: {branch}</p>
        {/* Editor content */}
      </div>
    </PageLayout>
  );
};

export default AssetEditor;
```

## Developer Requirements

When creating new pages, developers **MUST**:

1. **Use PageLayout**: All pages must be wrapped with `PageLayout`
2. **Specify pageName**: Provide a unique page name for help and analytics
3. **Follow URL patterns**: Use the established URL patterns for consistency
4. **Handle errors gracefully**: Let the framework handle errors, don't suppress them
5. **Test all page types**: Ensure pages work in authenticated and demo modes
6. **Ensure Help Mascot Presence**: The PageLayout framework automatically provides the contextual help mascot with "Report a bug" functionality on ALL pages

### Help System Requirements

**MANDATORY**: Every page in the SGEX Workbench **MUST** have:
- ✅ **Get Help mascot** visible in bottom-right corner (provided automatically by PageLayout)
- ✅ **"Report a SGeX bug" functionality** accessible through the help mascot menu
- ✅ **Universal help topics** including bug reporting, available on all pages
- ✅ **Contextual help content** specific to the page when available

The PageLayout framework ensures compliance with these requirements automatically. Pages that do not use PageLayout will be non-compliant and may be flagged during code review.

### Code Review Checklist

- [ ] Page wrapped with `PageLayout`
- [ ] Appropriate page type and URL pattern used
- [ ] Page name specified for help integration
- [ ] Error handling follows framework patterns
- [ ] Header components display correctly
- [ ] **Help mascot is present and functional with bug report access**
- [ ] Works in both authenticated and demo modes
- [ ] Responsive design maintained

## Migration Guide

To migrate existing pages to the framework:

1. **Import framework components**: Add `import { PageLayout, usePageParams } from './framework';`
2. **Wrap with PageLayout**: Replace existing layout with `<PageLayout pageName="...">`
3. **Remove custom headers**: Let the framework handle header rendering
4. **Update parameter access**: Use framework hooks instead of direct `useParams()`
5. **Remove error handling**: Let the framework handle errors automatically
6. **Test thoroughly**: Verify all functionality works with the framework

The framework is designed to minimize changes to existing page logic while providing consistent behavior across the application.
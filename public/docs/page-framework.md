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

### Asset Editor Usage

For asset editors (BPMN, CQL, DMN, Feature Files, etc.), use the enhanced `AssetEditorLayout`:

```jsx
import React, { useState } from 'react';
import { AssetEditorLayout, useAssetSave } from '../components/framework';

const MyAssetEditor = ({ file, repository, branch }) => {
  const [content, setContent] = useState('');
  const [originalContent] = useState('');
  
  const {
    hasChanges,
    isSavingLocal,
    isSavingGitHub,
    saveError,
    saveLocal,
    saveToGitHub,
    clearError
  } = useAssetSave({
    file,
    repository,
    branch,
    content,
    originalContent,
    onSave: (savedContent, saveType) => {
      console.log(`Saved to ${saveType}:`, savedContent);
    }
  });

  return (
    <AssetEditorLayout
      pageName="my-asset-editor"
      file={file}
      repository={repository}
      branch={branch}
      content={content}
      originalContent={originalContent}
      hasChanges={hasChanges}
      onSave={(content, saveType) => console.log('Save callback:', saveType)}
    >
      <div className="editor-content">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Edit your asset content here..."
        />
      </div>
    </AssetEditorLayout>
  );
};

export default MyAssetEditor;
```

## Enhanced Asset Editor Framework

The framework provides a specialized layout for asset editors with consistent save functionality:

### Key Features

- **Independent Save States**: "Save Local" and "Save GitHub" buttons maintain separate disabled/loading states
- **Confirmation Messages**: Success feedback with auto-dismiss after save operations
- **Commit Message Dialog**: GitHub saves prompt for commit message with validation
- **Error Handling**: Consistent error display with dismissible messages
- **Local Storage Integration**: Automatic detection and management of local file versions
- **Demo Mode Support**: Graceful handling of demo/unauthenticated states

### Save Button Behavior

#### Save Local Button
- Saves content to browser localStorage
- Shows confirmation message on success
- Automatically disables after successful save
- Re-enables when content changes again
- Independent of GitHub save state

#### Save to GitHub Button  
- Only visible when user is authenticated and not in demo mode
- Opens commit message dialog when clicked
- Validates commit message before proceeding
- Shows progress indicator during GitHub API calls
- Automatically disables after successful commit
- Re-enables when content changes again

### AssetEditorLayout Props

```jsx
<AssetEditorLayout
  // Required props
  pageName="editor-name"           // Unique identifier for the editor
  file={{ name: 'file.ext', path: 'path/to/file' }}  // File information
  repository={repositoryObject}    // GitHub repository object
  branch="main"                    // Current branch name
  content="current content"        // Current editor content
  originalContent="original"       // Original file content for change detection
  
  // State props
  hasChanges={true}               // Whether content has changed
  isDemo={false}                  // Whether in demo mode
  
  // Callbacks
  onSave={(content, saveType) => {}}  // Called after successful save
  onContentChange={(content) => {}}   // Called when content changes
  
  // UI customization
  showSaveButtons={true}          // Whether to show save buttons
  saveButtonsPosition="top"       // "top", "bottom", or "both"
  
  // PageLayout props can also be passed through
  showHeader={true}
  showMascot={true}
>
  {/* Your editor content goes here */}
</AssetEditorLayout>
```

### Breadcrumb Configuration

The framework automatically generates contextual breadcrumbs based on the page type and URL structure:

#### Automatic Breadcrumbs
```jsx
// Framework automatically generates breadcrumbs based on URL and page context
<PageLayout pageName="actor-editor">
  <div>Page content</div>
</PageLayout>
// Results in: "Select Profile › Select Repository › DAK Components › Actor Definitions"
```

#### Custom Breadcrumbs
For special navigation flows, you can override with custom breadcrumbs:

```jsx
<PageLayout 
  pageName="special-page"
  customBreadcrumbs={[
    { label: 'Home', path: '/', onClick: () => navigate('/') },
    { label: 'Special Section', path: '/special' },
    { label: 'Current Page' } // No path = current page
  ]}
>
  <div>Page content</div>
</PageLayout>
```

#### Disabling Breadcrumbs
For pages that shouldn't show breadcrumbs (like modals or landing pages):

```jsx
<PageLayout 
  pageName="modal-page"
  showBreadcrumbs={false}
>
  <div>Modal content</div>
</PageLayout>
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

### Using the Asset Save Hook

For custom asset editors, you can use the `useAssetSave` hook independently:

```jsx
import React, { useState } from 'react';
import { useAssetSave, SaveButtonsContainer, CommitMessageDialog } from '../components/framework';

const CustomAssetEditor = ({ file, repository, branch }) => {
  const [content, setContent] = useState('');
  const [originalContent] = useState('');
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  
  const {
    hasChanges,
    isSavingLocal,
    isSavingGitHub,
    saveError,
    localSaveSuccess,
    githubSaveSuccess,
    canSaveToGitHub,
    saveLocal,
    saveToGitHub,
    clearError
  } = useAssetSave({
    file,
    repository,
    branch,
    content,
    originalContent,
    onSave: (savedContent, saveType) => {
      console.log(`Content saved to ${saveType}`);
    }
  });

  const handleSaveGitHub = () => setShowCommitDialog(true);
  
  const handleCommit = async (message) => {
    const success = await saveToGitHub(message);
    if (success) {
      setShowCommitDialog(false);
      setCommitMessage('');
    }
  };

  return (
    <div className="custom-editor">
      <SaveButtonsContainer
        hasChanges={hasChanges}
        isSavingLocal={isSavingLocal}
        isSavingGitHub={isSavingGitHub}
        canSaveToGitHub={canSaveToGitHub}
        localSaveSuccess={localSaveSuccess}
        githubSaveSuccess={githubSaveSuccess}
        onSaveLocal={saveLocal}
        onSaveGitHub={handleSaveGitHub}
      />
      
      {saveError && (
        <div className="error-message">
          {saveError}
          <button onClick={clearError}>✕</button>
        </div>
      )}
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      
      <CommitMessageDialog
        isOpen={showCommitDialog}
        commitMessage={commitMessage}
        setCommitMessage={setCommitMessage}
        onCommit={handleCommit}
        onCancel={() => setShowCommitDialog(false)}
        isSaving={isSavingGitHub}
        fileName={file?.name}
      />
    </div>
  );
};
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
6. **Use framework breadcrumbs**: Do not implement custom breadcrumb HTML/CSS

### Breadcrumb Requirements

**❌ DO NOT:**
```jsx
// Don't implement custom breadcrumb HTML
<div className="breadcrumb">
  <button className="breadcrumb-link">Home</button>
  <span className="breadcrumb-separator">›</span>
  <span className="breadcrumb-current">Current Page</span>
</div>
```

**✅ DO:**
```jsx
// Let the framework handle breadcrumbs automatically
<PageLayout pageName="my-page">
  <div>Page content without custom breadcrumbs</div>
</PageLayout>

// Or provide custom breadcrumbs if needed
<PageLayout 
  pageName="special-page"
  customBreadcrumbs={[
    { label: 'Home', path: '/' },
    { label: 'Current Page' }
  ]}
>
  <div>Page content</div>
</PageLayout>
```

### Additional Requirements for Asset Editors

When creating asset editors, developers **MUST**:

1. **Use AssetEditorLayout**: All asset editors must use `AssetEditorLayout` for consistent save functionality
2. **Implement Independent Save States**: Local and GitHub save operations must maintain independent disabled states
3. **Provide Content Change Detection**: Must accurately track `hasChanges` state
4. **Handle Save Callbacks**: Implement `onSave` callback to handle post-save operations
5. **Support Demo Mode**: Asset editors must work in both authenticated and demo modes
6. **Validate File Information**: Ensure proper file path and metadata for save operations

### Code Review Checklist

- [ ] Page wrapped with `PageLayout` or `AssetEditorLayout`
- [ ] Appropriate page type and URL pattern used
- [ ] Page name specified for help integration
- [ ] Error handling follows framework patterns
- [ ] Header components display correctly
- [ ] Help mascot is present and functional
- [ ] **Breadcrumbs use framework implementation (no custom breadcrumb HTML/CSS)**
- [ ] Works in both authenticated and demo modes
- [ ] Responsive design maintained
- [ ] **Asset editors only**: Independent save button states implemented
- [ ] **Asset editors only**: Content change detection working correctly
- [ ] **Asset editors only**: Both local and GitHub save operations tested
- [ ] **Asset editors only**: Commit message dialog functions properly

## Migration Guide

To migrate existing pages to the framework:

1. **Import framework components**: Add `import { PageLayout, usePageParams } from './framework';`
2. **Wrap with PageLayout**: Replace existing layout with `<PageLayout pageName="...">`
3. **Remove custom headers**: Let the framework handle header rendering
4. **Update parameter access**: Use framework hooks instead of direct `useParams()`
5. **Remove error handling**: Let the framework handle errors automatically
6. **Test thoroughly**: Verify all functionality works with the framework

The framework is designed to minimize changes to existing page logic while providing consistent behavior across the application.
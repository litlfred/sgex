# Page Framework

The SGEX Workbench uses a consistent page framework to provide unified URL patterns, header components, error handling, help functionality, and comprehensive user access management across all pages.

## Overview

The page framework consists of several key components that work together to provide a consistent user experience:

- **PageLayout**: Main wrapper that provides layout, error handling, and help integration
- **PageHeader**: Consistent header with navigation, user controls, access badges, and context information  
- **ErrorHandler**: Automatic error handling with bug reporting functionality
- **PageProvider**: Context provider that manages page state and URL parameters
- **UserAccessService**: Manages user types and access levels
- **DataAccessLayer**: Comprehensive data management with local storage and GitHub integration
- **AccessBadge**: Dynamic access level indicators in the title bar
- **ToolDefinition**: Framework for easily creating new tools

## User Types and Access Control

The framework supports three distinct user types with different access levels:

### 1. Authenticated Users
- **Authentication**: GitHub Personal Access Token (PAT)
- **Demo Data**: Never supplied demo data or DAKs
- **GitHub Access**: Full read/write access based on repository permissions
- **Local Storage**: Full access to staging ground
- **UI Behavior**: All features enabled, write access dependent on repository permissions

### 2. Unauthenticated Users  
- **Authentication**: No authentication required
- **Demo Data**: Never supplied demo data or DAKs
- **GitHub Access**: Read-only access to public repositories only
- **Local Storage**: No access to save functionality
- **UI Behavior**: Edit features disabled, save buttons hidden

### 3. Demo Users
- **Authentication**: Authenticated user with demo mode enabled
- **Demo Data**: Supplied with demo DAKs and sample assets
- **GitHub Access**: Read access to demo repositories, no write access to GitHub
- **Local Storage**: Full access to staging ground
- **UI Behavior**: Edit features enabled, GitHub save blocked at confirmation with appropriate messaging

### Access Principles
- **Universal URL Access**: All users have access to every URL by default
- **Page-Level Restrictions**: Individual pages implement access restrictions based on user type
- **Dynamic UI**: Interface adapts based on user type and permissions
- **Permission Transparency**: Access badges clearly show current permissions

## Access Badges

Dynamic access badges appear in the title bar for DAK and Asset pages, showing current user permissions:

### Badge Types
- **Write Access**: Green badge with ✏️ icon - User can edit and save changes
- **Read Only**: Blue badge with 👁️ icon - User can view but not save changes  
- **No Access**: Red badge with 🚫 icon - User cannot access the repository

### Badge Integration
```jsx
import { AccessBadge } from '../components/framework';

<AccessBadge 
  owner={repository.owner.login}
  repo={repository.name}
  branch={branch}
  className="header-access-badge"
/>
```

## Data Access Layer

The framework provides a comprehensive data access layer that integrates user access, staging ground, and GitHub operations:

### Core Features
- **Unified Asset Management**: Single API for loading and saving assets
- **User-Aware Operations**: Automatic handling of user type restrictions
- **Local Storage Integration**: Staging ground for preparing commits
- **GitHub Integration**: Direct repository operations for authenticated users
- **Demo Mode Support**: Provides demo content for demo users
- **Confirmation Dialogs**: Required confirmations before save operations

### Usage Example
```jsx
import dataAccessLayer from '../../services/dataAccessLayer';

// Initialize for repository context
await dataAccessLayer.initialize(repository, branch);

// Load asset with user access checking
const asset = await dataAccessLayer.getAsset(owner, repo, branch, assetPath);

// Save locally (available to all user types)
const localResult = await dataAccessLayer.saveAssetLocal(assetPath, content);

// Save to GitHub (authenticated users only, with proper permissions)
const githubResult = await dataAccessLayer.saveAssetGitHub(
  owner, repo, branch, assetPath, content, commitMessage
);

// Get user-specific save options
const saveOptions = await dataAccessLayer.getSaveOptions(owner, repo, branch);
```

## Tool Definition Framework

The framework provides a simple API for creating new tools with minimal boilerplate:

### Basic Tool Creation
```jsx
import { createTool, TOOL_TYPES } from '../components/framework';

const MyTool = createTool({
  id: 'my-tool',
  name: 'My Tool',
  title: 'My Awesome Tool',
  description: 'A tool that does awesome things',
  type: TOOL_TYPES.UTILITY,
  viewerComponent: MyToolComponent,
  requiresAuth: true,
  supportsDemo: true
});
```

### Asset Editor Tool
```jsx
import { createAssetEditor } from '../components/framework';

const MyAssetEditor = createAssetEditor({
  id: 'my-asset-editor',
  name: 'My Asset Editor',
  title: 'Asset Editor',
  description: 'Edit specific asset types',
  assetTypes: ['json', 'yaml'],
  editorComponent: MyEditorComponent,
  onAssetSave: (context) => {
    console.log('Asset saved:', context);
  }
});
```

### Tool Component Interface
Tool components receive standardized props:
```jsx
const MyToolComponent = ({ 
  toolDefinition,
  pageParams,
  toolState,
  onAssetSave,
  onGitHubSave 
}) => {
  // Tool implementation
  return (
    <div>
      <h1>{toolDefinition.title}</h1>
      {/* Tool content */}
    </div>
  );
};
```

## Page Types

The framework supports four types of pages with specific URL patterns and automatic access control:

### 1. Top-Level Pages
**URL Pattern**: `/sgex/{page_name}`
**Examples**: 
- `/sgex/` (landing page)
- `/sgex/docs/overview` (documentation)

**Context**: No additional context inferred from URL path.
**Access**: Available to all user types.

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
**Access**: Available to all user types, content varies by user type.

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
**Access**: Repository access validated, demo users see demo content.

**Header Components**:
- SGEX logo  
- User/repo context breadcrumbs
- Access badge showing current permissions
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
**Access**: Asset access validated, demo users see demo content.

**Header Components**:
- SGEX logo
- User/repo/branch context breadcrumbs
- Access badge showing current permissions
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
import { AssetEditorLayout } from '../components/framework';

const MyAssetEditor = ({ file, repository, branch }) => {
  const [content, setContent] = useState('');
  const [originalContent] = useState('');
  
  return (
    <AssetEditorLayout
      pageName="my-asset-editor"
      file={file}
      repository={repository}
      branch={branch}
      content={content}
      originalContent={originalContent}
      hasChanges={content !== originalContent}
      onSave={(savedContent, saveType) => {
        console.log(`Saved to ${saveType}:`, savedContent);
      }}
      onContentChange={setContent}
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

The framework provides a specialized layout for asset editors with consistent save functionality and user access integration:

### Key Features

- **User-Aware Save Options**: Save functionality adapts to user type and permissions
- **Independent Save States**: "Save Local" and "Save GitHub" buttons maintain separate disabled/loading states
- **Access-Based UI**: UI elements show/hide based on user permissions
- **Confirmation Messages**: Success feedback with auto-dismiss after save operations
- **Commit Message Dialog**: GitHub saves prompt for commit message with validation
- **Error Handling**: Consistent error display with user-type-specific messaging
- **Demo Mode Support**: Graceful handling with appropriate user feedback
- **Staging Ground Integration**: Automatic integration with local storage

### Save Button Behavior by User Type

#### Authenticated Users (Non-Demo)
- **Save Local**: Always available, saves to staging ground
- **Save GitHub**: Available based on repository write permissions
- **UI**: Both buttons shown, access badge indicates write level

#### Demo Users  
- **Save Local**: Always available, saves to staging ground
- **Save GitHub**: Button shown but blocked at confirmation with educational message
- **UI**: GitHub save shows as available until user attempts to save

#### Unauthenticated Users
- **Save Local**: Not available
- **Save GitHub**: Not available  
- **UI**: Save buttons hidden, edit features disabled

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

### Accessing Page Context

Use the page hooks to access URL parameters and user context:

```jsx
import React from 'react';
import { PageLayout, usePageParams, useDAKParams } from '../components/framework';
import userAccessService from '../services/userAccessService';

const DAKComponentPage = () => {
  // For any page type
  const { type, navigate } = usePageParams();
  
  // For DAK/Asset pages specifically  
  const { user, profile, repository, branch, updateBranch } = useDAKParams();

  // Get current user type and permissions
  const userType = userAccessService.getUserType();
  const isDemo = userAccessService.isDemoUser();

  const handleBranchChange = (newBranch) => {
    updateBranch(newBranch);
  };

  return (
    <PageLayout pageName="dak-component">
      <div>
        <h1>DAK Component for {repository?.name}</h1>
        <p>User: {profile?.login} (Type: {userType})</p>
        <p>Branch: {branch}</p>
        {isDemo && (
          <div className="demo-notice">
            You are in demo mode. Changes can be saved locally but not to GitHub.
          </div>
        )}
        <button onClick={() => handleBranchChange('develop')}>
          Switch to develop
        </button>
      </div>
    </PageLayout>
  );
};

export default DAKComponentPage;
```

## Developer Requirements

When creating new pages, developers **MUST**:

1. **Use PageLayout or AssetEditorLayout**: All pages must be wrapped with framework layouts
2. **Respect User Access**: Implement appropriate restrictions based on user type
3. **Handle All User Types**: Ensure pages work for authenticated, unauthenticated, and demo users
4. **Use Access Services**: Integrate with userAccessService and dataAccessLayer
5. **Follow URL patterns**: Use the established URL patterns for consistency
6. **Test User Types**: Verify functionality across all user types and permission levels
7. **Provide Clear Feedback**: Show appropriate messages for access restrictions

### User Type Testing Checklist

- [ ] **Authenticated users**: Full functionality with appropriate repository permissions
- [ ] **Demo users**: Edit functionality with GitHub save blocked and clear messaging
- [ ] **Unauthenticated users**: View-only functionality with edit features disabled
- [ ] **Access badges**: Correctly show read/write permissions
- [ ] **Error handling**: Appropriate error messages for access restrictions
- [ ] **Save operations**: Correct behavior for local and GitHub saves by user type

### Access Integration Requirements

```jsx
// ❌ DON'T: Check authentication directly
if (githubService.isAuth()) {
  // Show save button
}

// ✅ DO: Use access services
const saveOptions = await dataAccessLayer.getSaveOptions(owner, repo, branch);
if (saveOptions.showSaveGitHub) {
  // Show GitHub save button
}

// ❌ DON'T: Handle user types manually  
if (isDemo) {
  // Block GitHub save
}

// ✅ DO: Use data access layer
const result = await dataAccessLayer.saveAssetGitHub(owner, repo, branch, path, content, message);
if (result.result === 'demo_mode_blocked') {
  // Show appropriate message
}
```

## Error Handling

The framework provides automatic error handling with user access awareness:

### User Access Errors
- **Permission Denied**: Clear messaging about access requirements
- **Demo Mode Restrictions**: Educational messaging about demo limitations
- **Authentication Required**: Guidance for unauthenticated users

### Automatic Bug Reports
When an error occurs, users are presented with:
- Large help mascot saying "I'm sorry!"
- User-type-aware error messages
- Context-specific retry options
- Automatic bug report form with user context

## Migration Guide

To migrate existing pages to the enhanced framework:

1. **Update imports**: Add user access services and data access layer
2. **Replace authentication checks**: Use access services instead of direct GitHub checks
3. **Update save operations**: Use data access layer for consistent behavior
4. **Add user type handling**: Ensure pages work for all user types
5. **Test thoroughly**: Verify functionality across user types and permission levels

The framework is designed to minimize changes to existing page logic while providing comprehensive user access management and consistent behavior across the application.
# Page Framework

The SGEX Workbench uses a consistent page framework to provide unified URL patterns, header components, error handling, help functionality, and comprehensive user access management across all pages.

## Overview

The page framework consists of several key components that work together to provide a consistent user experience:

- **PageLayout**: Main wrapper that provides layout, error handling, help integration, and tutorial system
- **PageHeader**: Consistent header with navigation, user controls, access badges, and context information  
- **ErrorHandler**: Automatic error handling with bug reporting functionality
- **PageProvider**: Context provider that manages page state and URL parameters
- **UserAccessService**: Manages user types and access levels
- **DataAccessLayer**: Comprehensive data management with local storage and GitHub integration
- **AccessBadge**: Dynamic access level indicators in the title bar
- **ToolDefinition**: Framework for easily creating new tools
- **TutorialFramework**: Interactive tutorial system with branching logic and context awareness

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
8. **Correct Profile Creation**: Follow the profile creation compliance requirements
9. **Tutorial Integration**: Consider adding page-specific tutorials for complex features

### Profile Creation Compliance Requirements

When creating user profiles in components, developers **MUST** follow these rules:

#### ✅ CORRECT Profile Creation Patterns:

1. **Demo Users Only**: Set `isDemo: true` ONLY for explicit demo mode (`user === 'demo-user'`)
   ```javascript
   // CORRECT: Only for demo-user
   if (user === 'demo-user') {
     setProfile({
       login: user,
       name: 'Demo User',
       avatar_url: `https://github.com/${user}.png`,
       type: 'User',
       isDemo: true  // ✅ CORRECT - only for demo-user
     });
   }
   ```

2. **Unauthenticated Users**: Create profiles WITHOUT `isDemo` flag for real user access
   ```javascript
   // CORRECT: Unauthenticated access to real public repositories
   if (!githubService.isAuth() && user !== 'demo-user') {
     setProfile({
       login: user,
       name: user.charAt(0).toUpperCase() + user.slice(1),
       avatar_url: `https://github.com/${user}.png`,
       type: 'User'
       // ✅ CORRECT - NO isDemo flag for real public repositories
     });
   }
   ```

3. **Authenticated Users**: Never set `isDemo` flag
   ```javascript
   // CORRECT: Authenticated users get real profile data
   const profile = await githubService.getUser(user);
   // ✅ CORRECT - GitHub API returns real profile without isDemo
   setProfile(profile);
   ```

#### ❌ INCORRECT Profile Creation Patterns:

```javascript
// ❌ WRONG: Setting isDemo for all unauthenticated users
if (!githubService.isAuth()) {
  setProfile({
    login: user,
    isDemo: true  // ❌ WRONG - unauthenticated ≠ demo
  });
}

// ❌ WRONG: Setting isDemo based on authentication alone
setProfile({
  login: user,
  isDemo: !githubService.isAuth()  // ❌ WRONG - conflates concepts
});

// ❌ WRONG: Setting isDemo for authenticated users
const profile = await githubService.getUser(user);
profile.isDemo = true;  // ❌ WRONG - authenticated users are never demo
setProfile(profile);
```

#### Profile Creation Compliance Rules:

1. **Only `demo-user` gets `isDemo: true`**: The `isDemo` flag should ONLY be set when `user === 'demo-user'`
2. **Unauthenticated ≠ Demo**: Unauthenticated users accessing real repositories should NOT have `isDemo` flag
3. **Authentication State Independence**: The `isDemo` flag is independent of authentication status
4. **Real Repository Access**: Unauthenticated users should access real public repositories, not demo content

### User Type Testing Checklist

- [ ] **Authenticated users**: Full functionality with appropriate repository permissions
- [ ] **Demo users**: Edit functionality with GitHub save blocked and clear messaging
- [ ] **Unauthenticated users**: View-only functionality with edit features disabled
- [ ] **Access badges**: Correctly show read/write permissions
- [ ] **Error handling**: Appropriate error messages for access restrictions
- [ ] **Save operations**: Correct behavior for local and GitHub saves by user type
- [ ] **Tutorial integration**: Context-appropriate tutorials appear for each user type
- [ ] **Help functionality**: Tutorial framework works correctly across user types

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

## Tutorial Framework Integration

The page framework includes full integration with the enhanced tutorial system, providing interactive learning experiences across all pages. The tutorial framework is automatically available on any page that uses `PageLayout`.

### Automatic Tutorial Integration

Every page that uses the page framework automatically includes:

- **ContextualHelpMascot**: Help mascot with integrated tutorial menu
- **Tutorial Service**: Context-aware tutorial filtering and management
- **Progress Tracking**: Automatic tutorial progress persistence
- **Legacy Compatibility**: Seamless support for existing help topics

```jsx
import { PageLayout } from '../components/framework';

const MyPage = () => {
  return (
    <PageLayout pageName="my-page">
      {/* Tutorial system is automatically available */}
      <div>Page content</div>
    </PageLayout>
  );
};
```

### Page-Specific Tutorial Registration

Pages can register their own tutorials using the tutorial service:

```jsx
import React, { useEffect } from 'react';
import { PageLayout } from '../components/framework';
import tutorialService from '../services/tutorialService';

const MyPage = () => {
  useEffect(() => {
    // Register page-specific tutorial
    tutorialService.registerTutorial('my-page-tutorial', {
      id: 'my-page-tutorial',
      title: 'My Page Tutorial',
      description: 'Learn how to use this page',
      category: 'getting-started',
      pages: ['my-page'],
      requirements: {
        userType: 'any'  // Available to all user types
      },
      steps: [
        {
          title: 'Welcome',
          content: '<p>Welcome to this page tutorial!</p>'
        }
      ]
    });
  }, []);

  return (
    <PageLayout pageName="my-page">
      <div>Page content</div>
    </PageLayout>
  );
};
```

### Advanced Tutorial Integration

For pages that need more control over tutorial functionality:

```jsx
import React from 'react';
import { PageLayout } from '../components/framework';
import { TutorialManager, TutorialLauncher } from '../components';

const AdvancedPage = () => {
  const contextData = {
    userType: userAccessService.getUserType(),
    hasRepository: !!repository
  };

  const pageTutorials = [
    {
      id: 'advanced-tutorial',
      title: 'Advanced Features',
      description: 'Learn advanced page features',
      category: 'content-editing',
      requirements: {
        userType: 'authenticated',
        context: { hasRepository: true }
      },
      steps: [
        {
          title: 'Choose Your Path',
          content: '<p>Select your experience level:</p>',
          branches: [
            {
              choice: 'beginner',
              label: 'I\'m new to this',
              targetStep: 1
            },
            {
              choice: 'advanced',
              label: 'I\'m experienced',
              targetStep: 2
            }
          ]
        }
      ]
    }
  ];

  return (
    <PageLayout pageName="advanced-page">
      <TutorialManager 
        pageId="advanced-page"
        tutorials={pageTutorials}
        contextData={contextData}
      >
        {({ launchTutorial, availableTutorials }) => (
          <div>
            <h1>Advanced Page</h1>
            
            <div className="help-section">
              <TutorialLauncher 
                tutorialId="advanced-tutorial"
                variant="primary"
                contextData={contextData}
              >
                Take Tutorial
              </TutorialLauncher>
            </div>

            <div className="page-content">
              {/* Page content */}
            </div>
          </div>
        )}
      </TutorialManager>
    </PageLayout>
  );
};
```

### Tutorial Framework Features

The integrated tutorial framework provides:

#### Context-Aware Tutorials
- **User Type Filtering**: Tutorials can be shown/hidden based on user type (authenticated, unauthenticated, demo)
- **Page Context**: Tutorials are filtered based on current page and available context data
- **Repository Context**: DAK and asset page tutorials can access repository and branch information

#### Interactive Learning Paths
- **Branching Logic**: Tutorials can include branching choices for personalized learning paths
- **Progress Tracking**: User progress is automatically saved and restored across sessions
- **Accessibility**: Full keyboard navigation and screen reader support

#### Seamless Integration
- **Legacy Compatibility**: Existing help topics continue to work alongside new tutorials
- **Theme Awareness**: Tutorials automatically adapt to light/dark themes
- **Responsive Design**: Tutorials work on desktop and mobile devices

### Tutorial Categories

The framework organizes tutorials into categories for better user experience:

- **`getting-started`** - Introduction and basic concepts
- **`authentication`** - GitHub setup and authentication
- **`dak-management`** - DAK repository management
- **`content-editing`** - Content creation and editing
- **`collaboration`** - Team collaboration features
- **`troubleshooting`** - Problem resolution guides

### Built-in Tutorials

The page framework includes several built-in tutorials:

- **GitHub PAT Setup**: Interactive setup for GitHub Personal Access Tokens
- **DAK Components Overview**: Understanding the 8 core DAK components
- **Tutorial Framework Demo**: Showcasing branching tutorial capabilities

For complete tutorial framework documentation, see [Tutorial Framework](tutorial-framework.md).

## Component Architecture Patterns

### Wrapper + Content Pattern for PageLayout Components

**CRITICAL REQUIREMENT**: All DAK components that use `PageLayout` MUST follow the wrapper + content component pattern to ensure proper PageProvider context initialization.

#### The Problem

When a component uses `PageLayout` and calls page context hooks (like `usePage()` or `useDAKParams()`) at the top level, it creates a chicken-and-egg problem:

```javascript
// ❌ ANTI-PATTERN - DO NOT USE
const MyComponent = () => {
  const { profile, repository } = usePage();  // ← ERROR: Context doesn't exist yet!
  
  return (
    <PageLayout pageName="my-component">  // ← PageProvider created here
      <div>Content</div>
    </PageLayout>
  );
};
```

**Why this fails**:
1. React components execute from top to bottom
2. `usePage()` tries to access PageProvider context during component initialization
3. But `PageLayout` (which provides `PageProvider`) is in the return statement
4. The context doesn't exist when the hook is called
5. Result: `PageContext is null - component not wrapped in PageProvider`

#### The Solution: Wrapper + Content Pattern

Split your component into two parts:

```javascript
// ✅ CORRECT PATTERN - ALWAYS USE THIS
const MyComponent = () => {
  return (
    <PageLayout pageName="my-component">
      <MyComponentContent />
    </PageLayout>
  );
};

const MyComponentContent = () => {
  const { profile, repository, branch, loading, error } = usePage();
  
  // All component logic and state here
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Effects can safely use page context
    if (profile && repository) {
      // Load data...
    }
  }, [profile, repository]);
  
  return (
    <div>
      {/* Component UI */}
    </div>
  );
};

export default MyComponent;
```

**Why this works**:
1. `MyComponent` renders and returns `<PageLayout>`
2. `PageLayout` renders and provides `PageProvider`
3. `MyComponentContent` starts rendering (now inside PageProvider)
4. `usePage()` is called, context exists ✅

### Required Pattern for Different Page Types

#### DAK/Asset Pages (using PageLayout)

**REQUIRED**: Use wrapper + content pattern

```javascript
import { PageLayout, usePage } from './framework';

const DAKComponent = () => {
  return (
    <PageLayout pageName="dak-component">
      <DAKComponentContent />
    </PageLayout>
  );
};

const DAKComponentContent = () => {
  const { profile, repository, branch, loading, error } = usePage();
  
  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Handle error state
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  // Main content
  return (
    <div>
      <h1>{repository?.name}</h1>
      {/* Component implementation */}
    </div>
  );
};

export default DAKComponent;
```

#### Asset Editor Pages (using AssetEditorLayout)

**NOT REQUIRED**: AssetEditorLayout handles context internally

```javascript
import { AssetEditorLayout, usePage } from './framework';

const AssetEditor = () => {
  // ✅ OK: AssetEditorLayout provides context internally
  const { profile, repository, branch } = usePage();
  
  return (
    <AssetEditorLayout
      pageName="asset-editor"
      file={file}
      repository={repository}
      branch={branch}
      content={content}
      onSave={handleSave}
    >
      {/* Editor content */}
    </AssetEditorLayout>
  );
};

export default AssetEditor;
```

### Hook Usage Guidelines

#### usePage() vs useDAKParams()

**usePage()**: 
- Returns page context regardless of page type
- More flexible, suitable for most components
- **RECOMMENDED** for components using wrapper + content pattern

**useDAKParams()**:
- Validates page type is DAK or ASSET
- Returns error if used on wrong page type
- Less flexible but provides validation
- Can be used in content component after PageProvider exists

```javascript
// ✅ Recommended approach
const MyComponentContent = () => {
  const { profile, repository, branch } = usePage();
  // ...
};

// ✅ Also acceptable (if validation needed)
const MyComponentContent = () => {
  const { profile, repository, branch } = useDAKParams();
  // Note: This will show warnings if used on non-DAK pages
  // ...
};
```

### Component Checklist

Before deploying a new DAK component, verify:

- [ ] Component uses wrapper + content pattern
- [ ] Wrapper component only wraps `PageLayout` (no hooks)
- [ ] Content component uses `usePage()` or `useDAKParams()`
- [ ] All hooks are called in content component (after PageProvider)
- [ ] Loading and error states are handled
- [ ] Component exports the wrapper (not content)

### Examples from Codebase

#### Correct Implementations ✅

1. **ActorEditor** (src/components/ActorEditor.js)
```javascript
const ActorEditor = () => {
  return (
    <PageLayout pageName="actor-editor">
      <ActorEditorContent />
    </PageLayout>
  );
};

const ActorEditorContent = () => {
  const { profile, repository, branch } = usePage();
  // ... component logic
};
```

2. **CoreDataDictionaryViewer** (src/components/CoreDataDictionaryViewer.js)
```javascript
const CoreDataDictionaryViewer = () => {
  return (
    <PageLayout pageName="core-data-dictionary-viewer">
      <CoreDataDictionaryViewerContent />
    </PageLayout>
  );
};

const CoreDataDictionaryViewerContent = () => {
  const { profile, repository, branch } = usePage();
  // ... component logic
};
```

3. **ComponentEditor** (src/components/ComponentEditor.js)
```javascript
const ComponentEditor = () => {
  return (
    <PageLayout pageName="component-editor">
      <ComponentEditorContent />
    </PageLayout>
  );
};
```

4. **PersonaViewer** (src/components/PersonaViewer.js)
```javascript
const PersonaViewer = () => {
  return (
    <PageLayout pageName="persona-viewer">
      <PersonaViewerContent />
    </PageLayout>
  );
};
```

5. **DAKDashboard** (src/components/DAKDashboard.js)
```javascript
const DAKDashboard = () => {
  return (
    <PageLayout pageName="dak-dashboard">
      <DAKDashboardContent />
    </PageLayout>
  );
};
```

#### Components Needing Attention ⚠️

The following components may need review or updates:

1. **BusinessProcessSelection** - Uses `useDAKUrlParams` instead of page framework hooks
2. **DecisionSupportLogicView** - Uses `useDAKParams` in content (should use `usePage`)

### Common Mistakes to Avoid

1. **❌ Calling hooks before PageProvider**
```javascript
const MyComponent = () => {
  const { profile } = usePage();  // ERROR!
  return <PageLayout>...</PageLayout>;
};
```

2. **❌ Not handling loading/error states**
```javascript
const MyComponentContent = () => {
  const { profile, repository } = usePage();
  // Missing: if (!profile || !repository) return loading...
  return <div>{repository.name}</div>;  // Can crash!
};
```

3. **❌ Using useDAKParams without wrapper pattern**
```javascript
const MyComponent = () => {
  const params = useDAKParams();  // ERROR!
  return <PageLayout>...</PageLayout>;
};
```

4. **❌ Mixing patterns**
```javascript
const MyComponent = () => {
  return (
    <PageLayout>
      <div>
        {/* Direct content instead of separate component */}
      </div>
    </PageLayout>
  );
};
// Missing: MyComponentContent that uses hooks
```

### Testing Your Component

Verify your component works correctly:

1. **URL Pattern Test**: Navigate to `/{component}/{user}/{repo}/{branch}`
2. **Console Check**: No "PageContext is null" errors
3. **Loading States**: Component handles loading gracefully
4. **Error States**: Component handles missing context
5. **Branch Switching**: Component updates when branch changes

## Migration Guide

To migrate existing pages to the enhanced framework:

1. **Update imports**: Add user access services and data access layer
2. **Replace authentication checks**: Use access services instead of direct GitHub checks
3. **Update save operations**: Use data access layer for consistent behavior
4. **Add user type handling**: Ensure pages work for all user types
5. **Apply wrapper + content pattern**: Split components that use PageLayout and page hooks
6. **Test thoroughly**: Verify functionality across user types and permission levels

The framework is designed to minimize changes to existing page logic while providing comprehensive user access management and consistent behavior across the application.
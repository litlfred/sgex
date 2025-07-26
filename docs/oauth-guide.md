# OAuth Authentication Guide

This guide explains how to use the new OAuth authentication system in SGEX Workbench for secure, granular access to GitHub repositories containing WHO SMART Guidelines DAK components.

## Overview

SGEX Workbench now supports OAuth authentication through GitHub Apps, providing enhanced security and granular permissions compared to Personal Access Tokens (PATs). This system allows users to authorize specific access levels for different repositories and DAK components.

## Access Levels

The system supports three access levels:

### 🎭 Unauthenticated (Demo Mode)
- **Purpose**: Explore the application without authentication
- **Capabilities**: 
  - View public repositories
  - Read public DAK content  
  - Use demo features
- **Use Case**: Learning and evaluation

### 👁️ Read Access
- **Purpose**: Read access to authorized repositories
- **Capabilities**:
  - Read private repositories (if authorized)
  - View all DAK components
  - Access detailed repository information
  - View user profile information
- **GitHub Scopes**: `read:user`, `public_repo`

### ✏️ Write Access  
- **Purpose**: Full read and write access to authorized repositories
- **Capabilities**:
  - All read access capabilities
  - Edit DAK components
  - Create and modify files
  - Create pull requests
  - Manage repository content
- **GitHub Scopes**: `read:user`, `public_repo`, `repo`

## DAK Components

The system recognizes 8 WHO SMART Guidelines DAK components:

### Level 2: Business Logic & Processes
1. **Business Processes** - BPMN workflows and business process definitions
2. **Decision Support Logic** - DMN decision tables and clinical decision support
3. **Indicators & Measures** - Performance indicators and measurement definitions  
4. **Data Entry Forms** - Structured data collection forms and questionnaires

### Level 3: Technical Implementation
5. **Terminology** - Code systems, value sets, and concept maps
6. **FHIR Profiles** - FHIR resource profiles and structure definitions
7. **FHIR Extensions** - Custom FHIR extensions and data elements
8. **Test Data & Examples** - Sample data and test cases for validation

## Authorization Process

### 1. OAuth Device Flow
The system uses GitHub's OAuth Device Flow for secure, client-side authentication:

1. User clicks "Authorize [Access Level]"
2. System generates a device code and user code
3. User visits GitHub's device authorization page
4. User enters the provided code on GitHub
5. User grants requested permissions
6. System automatically receives the access token

### 2. Permission Management
- **Granular Scope**: Tokens can be scoped to specific repositories or organizations
- **Component-Level**: Access is checked per DAK component
- **Upgradeable**: Users can upgrade permissions as needed
- **Revocable**: Access can be revoked through GitHub's OAuth settings

## Using the OAuth System

### For End Users

#### Getting Started
1. Visit the SGEX Workbench
2. Choose your desired access level (Read or Write)
3. Follow the OAuth authorization flow
4. Start working with DAK repositories

#### Managing Tokens
- Click the "⚙️ Settings" button in the user menu
- View all active authorizations
- Remove specific tokens
- Add new authorizations for different repositories

#### Switching Between PAT and OAuth
- OAuth is the default and recommended method
- Click "Use Personal Access Token Instead" for legacy PAT mode
- Click "← Use OAuth Instead (Recommended)" to return to OAuth

### For Developers

#### Using the Client Library
```javascript
import sgexOAuthClient from './lib/sgexOAuthClient';

// Initialize the client
await sgexOAuthClient.initialize();

// Check component access
const access = await sgexOAuthClient.checkComponentAccess(
  'business-processes',
  'WorldHealthOrganization', 
  'smart-anc',
  'read'
);

if (!access.hasAccess) {
  // Request authorization
  const authFlow = await sgexOAuthClient.requestComponentAuthorization(
    'business-processes',
    'WorldHealthOrganization',
    'smart-anc', 
    'read'
  );
  // Handle OAuth flow...
}

// Make authenticated API request
const octokit = sgexOAuthClient.getOctokitForComponent(
  'business-processes',
  'WorldHealthOrganization',
  'smart-anc',
  'read'
);
```

#### Key Services
- **`oauthService`**: Manages OAuth tokens and authentication
- **`tokenManagerService`**: Handles component-level permissions
- **`githubService`**: Updated to support both OAuth and PAT modes

## Security Features

### Enhanced Security
- **No Token Exposure**: Tokens never need to be copied/pasted by users
- **Scoped Access**: Each token has minimal required permissions
- **Audit Trail**: GitHub tracks which app accesses what
- **Easy Revocation**: Tokens can be revoked through GitHub's UI

### Data Storage
- **IndexedDB**: Primary storage for better security (falls back to localStorage)
- **Encrypted**: Tokens are stored securely in the browser
- **Ephemeral**: Tokens are session-based by default

### Permission Checking
- **Component-Level**: Checks are done per DAK component
- **Repository-Level**: Tokens can be scoped to specific repositories
- **Fallback**: Graceful degradation to less privileged access

## Migration from PATs

### Automatic Detection
- System detects existing PAT tokens on startup
- OAuth is preferred when both are available
- Users can switch between modes seamlessly

### Backward Compatibility
- Existing PAT functionality remains intact
- All existing workflows continue to work
- Migration is optional and user-initiated

## Troubleshooting

### Common Issues

#### "Authorization denied" error
- **Cause**: User denied permission on GitHub
- **Solution**: Try authorization again and approve permissions

#### "Authorization expired" error  
- **Cause**: Device code expired (15 minutes)
- **Solution**: Start the authorization process again

#### "Pop-up blocked" error
- **Cause**: Browser blocked GitHub authorization page
- **Solution**: Allow pop-ups or manually visit the authorization URL

### Getting Help
- Check the built-in help system (❓ button)
- Review the authorization slideshow
- Consult the [main documentation](/sgex/docs/overview)
- Report issues on [GitHub](https://github.com/litlfred/sgex/issues)

## Implementation Details

### Architecture
- **Client-Side Only**: No server required
- **Standards Compliant**: Uses OAuth 2.0 Device Flow
- **Progressive Enhancement**: Works with or without authentication
- **Responsive Design**: Mobile-friendly interface

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **IndexedDB Support**: Primary storage mechanism
- **Fallback Support**: localStorage for older browsers
- **CORS Ready**: GitHub API supports CORS for OAuth requests

### Performance
- **Token Caching**: Reduces redundant authorization requests
- **Lazy Loading**: Components load only when needed
- **Concurrent Requests**: Efficient API usage with rate limiting
- **Offline Capable**: Works with cached tokens when offline

## Future Enhancements

### Planned Features
- **Token Refresh**: Automatic token renewal
- **Multi-Org Support**: Enhanced organization management
- **Permission Templates**: Pre-configured permission sets
- **Advanced Scoping**: File-level permissions

### Contributing
To contribute to the OAuth implementation:
1. Review the codebase structure
2. Check existing issues and feature requests
3. Follow the contribution guidelines
4. Submit pull requests with tests

---

*This OAuth system provides a secure, user-friendly way to access WHO SMART Guidelines DAK repositories while maintaining the highest security standards and providing granular permission control.*
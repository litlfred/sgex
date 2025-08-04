# OAuth Device Flow Authentication Requirements

## Overview

SGEX Workbench has implemented GitHub OAuth device flow authentication to replace the previous Personal Access Token (PAT) system. This provides a more secure, user-friendly, and granular approach to GitHub authentication while supporting least-privilege access control.

## Authentication Flow

### 1. Welcome Page Authentication Options

The welcome page now provides three authentication options:

- **OAuth Device Flow Sign-In**: Primary authentication method using GitHub's OAuth device flow
- **Guest Browsing**: Read-only access to public repositories without authentication  
- **Demo Mode**: Mock data demonstration of SGEX features

### 2. OAuth Device Flow Process

1. User clicks "Sign in with GitHub"
2. System requests initial scopes: `public_repo` and `workflow`
3. GitHub provides a device code and verification URL
4. User visits GitHub and enters the device code
5. System polls for authorization completion
6. Upon success, user is authenticated with requested scopes

### 3. Per-Repository Token Management

- Tokens are stored per repository in memory only (never persisted to disk)
- Each repository can have different permission levels based on granted scopes
- Users can revoke access for specific repositories
- System automatically falls back to guest mode for repositories without tokens

## Scope Management

### Initial Scopes

| Scope | Purpose |
|-------|---------|
| `public_repo` | Access to public repositories for commenting and basic interactions |
| `workflow` | Manage GitHub Actions workflows (view logs, restart runs) |

### Dynamic Scope Requests

Additional scopes are requested only when needed:

- **Comment Access**: Requires `public_repo` (or `repo` for private repositories)
- **Workflow Management**: Requires `workflow` scope
- **Private Repository Access**: Requires `repo` scope instead of `public_repo`

### Scope Descriptions

The system provides clear explanations of what each scope enables:

- `public_repo`: Access to public repositories (for commenting and basic interactions)
- `repo`: Access to private repositories  
- `workflow`: Manage GitHub Actions workflows (view logs, restart runs)
- `read:org`: Read organization membership and team information
- `read:user`: Read user profile information

## Repository Access Levels

### Access Level Badge

Each repository context displays an access level badge:

- **Read-Only (Guest)**: No authentication, public API access only
- **Read-Only**: Authenticated but limited permissions
- **Read/Write Enabled**: Full access with comment and workflow permissions

### Permission Indicators

The badge shows specific capabilities:
- 💬 Comment: Whether user can comment on issues/PRs
- ⚙️ Workflows: Whether user can manage workflow runs

## Security Features

### Token Security

- **Memory-Only Storage**: Tokens are never persisted to disk or localStorage
- **Session-Based**: Tokens are stored in sessionStorage and cleared on browser close
- **Per-Repository Isolation**: Each repository has its own token scope
- **Revocation Support**: Users can revoke access for any repository

### Least Privilege

- **Minimal Initial Scopes**: Only request essential permissions initially
- **On-Demand Escalation**: Request additional permissions only when needed
- **Action-Based Requirements**: Different actions require different permission levels
- **Clear Explanations**: Users understand why each permission is needed

## User Experience

### Authentication States

1. **Unauthenticated**: Shows OAuth sign-in, guest browsing, and demo options
2. **Authenticated**: Shows user avatar, name, and sign-out option
3. **Repository Context**: Shows access level badge with current permissions

### Permission Escalation Flow

When a user attempts an action requiring additional permissions:

1. System detects insufficient permissions
2. Modal appears explaining the required access
3. OAuth device flow initiates for specific scopes
4. User grants permissions on GitHub
5. System updates repository token and allows action

### Guest Mode Features

- **Read-Only Access**: Browse public repositories without authentication
- **No Limitations**: View all public content, documentation, and code
- **Upgrade Path**: Clear options to authenticate for write access when needed

## Implementation Details

### Core Components

- **OAuthDeviceFlow**: Handles the device flow authentication process
- **RepositoryAccessBadge**: Displays access level and manages permission requests
- **githubService**: Enhanced with per-repository token management
- **GITHUB_CONFIG**: Centralized configuration for scopes and client settings

### Configuration

```javascript
GITHUB_CONFIG = {
  CLIENT_ID: 'Ov23liAfEK9eDPXV4vBj', // Public GitHub OAuth app
  DEFAULT_SCOPES: ['public_repo', 'workflow'],
  ACTION_SCOPES: {
    'comment': ['public_repo'],
    'workflow': ['workflow'], 
    'write': ['public_repo']
  }
}
```

### API Integration

- Uses GitHub's OAuth Device Flow endpoints
- Integrates with @octokit/rest for API calls
- Maintains backward compatibility with existing PAT tokens (if needed)

## Migration from PAT System

### Changes Made

- ✅ Removed PAT input form from welcome page
- ✅ Added OAuth device flow component
- ✅ Implemented per-repository token management
- ✅ Added guest browsing mode
- ✅ Created repository access level badge
- ✅ Enhanced githubService with OAuth support

### Backward Compatibility

- Existing sessionStorage tokens are still supported during transition
- githubService maintains compatibility with both OAuth and PAT tokens
- No breaking changes to existing API usage patterns

## Future Enhancements

### Planned Features

- **Fine-Grained Tokens**: Support for GitHub's fine-grained personal access tokens
- **Organization Management**: Enhanced support for organization-level permissions
- **Token Refresh**: Automatic token refresh for long-running sessions
- **Audit Logging**: Track permission grants and usage patterns

### Security Improvements

- **CSP Integration**: Content Security Policy headers for enhanced security
- **Token Rotation**: Periodic token rotation for enhanced security
- **Permission Monitoring**: Alert users to permission changes or suspicious activity

## Testing and Validation

### Manual Testing Checklist

- ✅ OAuth device flow initiation
- ✅ Device code display and verification
- ✅ Token polling and completion
- ✅ Per-repository token storage
- ✅ Guest mode functionality
- ✅ Access level badge display
- ✅ Permission escalation flow
- ✅ Token revocation

### Browser Compatibility

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Configuration Requirements

### GitHub OAuth App Setup

The OAuth app must be configured with:
- **Application name**: SGEX Workbench
- **Homepage URL**: https://worldhealthorganization.github.io/sgex/
- **Authorization callback URL**: Not required for device flow
- **Device flow**: Enabled

### Environment Variables

Optional environment variables for customization:
- `REACT_APP_GITHUB_CLIENT_ID`: Override default GitHub OAuth client ID

## Documentation Updates

This document should be maintained alongside:
- `/public/docs/requirements.md`: Updated with OAuth authentication requirements
- `/public/docs/solution-architecture.md`: Updated with new authentication architecture
- Component documentation for OAuthDeviceFlow and RepositoryAccessBadge
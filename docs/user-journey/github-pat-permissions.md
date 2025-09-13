# GitHub Personal Access Token (PAT) Permissions for SGEX Tutorial Features

This document outlines the minimal GitHub Personal Access Token permissions required for the three tutorial features in SGEX Workbench.

## Overview

The three tutorial features covered in SGEX screen recordings require different levels of GitHub repository access:

1. **User PAT Login Process** - Authentication and basic profile access
2. **Profile Selection and DAK Repository Scanning** - Repository listing and content reading
3. **Help Mascot and Documentation Browsing** - Documentation access (no GitHub API required)

## Minimal Classic PAT Permissions

For **Classic Personal Access Tokens**, you need the following minimal permissions:

### Required Permissions:

#### `repo` (Full control of private repositories)
- **Why needed**: Enables reading repository content, including `sushi-config.yaml` files for DAK detection
- **Features enabled**: 
  - Repository listing and scanning
  - DAK detection and validation
  - File content reading for documentation
  - Branch listing and navigation

#### `read:org` (Read org and team membership)
- **Why needed**: Allows scanning repositories within organizations like WorldHealthOrganization
- **Features enabled**:
  - Organization profile access
  - Organization repository listing
  - Team membership visibility (for permission checking)

### Optional Permissions (not required for tutorials):

#### `read:user` (Read user profile data)
- **Purpose**: Enhanced user profile display
- **Impact**: Better user experience but not functionally required

## Fine-Grained PAT Permissions

For **Fine-grained Personal Access Tokens**, you need these repository permissions:

### Repository Permissions:
- **Contents**: Read
- **Metadata**: Read
- **Pull requests**: Read (optional, for enhanced features)

### Account Permissions:
- **Organization permissions**: Read (for organization scanning)

## Feature-Specific Requirements

### 1. User PAT Login Process
**Minimal permissions**: None (authentication only)
- No repository access required for basic login
- Token validation through GitHub API user endpoint
- Profile information retrieval

### 2. Profile Selection and DAK Repository Scanning
**Required permissions**:
- `repo` (Classic) OR `Contents: Read, Metadata: Read` (Fine-grained)
- `read:org` (Classic) OR `Organization permissions: Read` (Fine-grained)

**API endpoints used**:
- `/user/repos` - List user repositories
- `/orgs/{org}/repos` - List organization repositories  
- `/repos/{owner}/{repo}/contents/sushi-config.yaml` - DAK detection
- `/repos/{owner}/{repo}/branches` - Branch listing

### 3. Help Mascot and Documentation Browsing
**Required permissions**: None
- No GitHub API calls required
- Pure client-side documentation browsing
- Help system works without authentication

## Token Scope Recommendations

### For Tutorial Recording (Recommended)
```
Classic PAT with:
✅ repo
✅ read:org
```

### For Basic Tutorial Viewing (Minimal)
```
Classic PAT with:
✅ repo
```

### For Public Repository Only (Absolute Minimal)
```
No authentication required for:
- Public repository DAK scanning
- Public documentation browsing
- Help system access
```

## Security Considerations

1. **Token Storage**: Tokens are stored securely in browser local storage with encryption
2. **Token Validation**: Format validation before GitHub API calls
3. **Rate Limiting**: Built-in rate limiting and retry logic
4. **Scope Validation**: Runtime validation of token permissions
5. **Error Handling**: Graceful degradation when permissions are insufficient

## Testing Your PAT

To verify your PAT has sufficient permissions:

1. **Authentication Test**: Can you log in to SGEX?
2. **Repository Access Test**: Can you see your repositories in the profile selection?
3. **DAK Scanning Test**: Can you scan organizations like WorldHealthOrganization?

If any test fails, check that your PAT includes the required permissions listed above.

## Common Issues

### "Access Denied" during repository scanning
- **Cause**: Missing `repo` permission
- **Solution**: Add `repo` scope to your classic PAT

### "Cannot access organization repositories"
- **Cause**: Missing `read:org` permission  
- **Solution**: Add `read:org` scope to your classic PAT

### "Rate limit exceeded"
- **Cause**: Too many API calls in short time
- **Solution**: Wait for rate limit reset (usually 1 hour)

## References

- [GitHub PAT Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub API Scopes](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)
- [Fine-grained PAT Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-fine-grained-personal-access-token)
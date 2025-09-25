# @sgex/vcs-services

Version control and GitHub repository operations for SGEX DAK management.

## Overview

This package provides TypeScript services for interacting with GitHub repositories, specifically optimized for WHO SMART Guidelines Digital Adaptation Kits (DAKs). It splits the complex operations from the original `githubService.js` into focused, testable services.

## Services

### GitHubAuthenticationService
Handles GitHub token authentication, permissions, and session management.

**Features:**
- Personal Access Token (classic/fine-grained) support
- OAuth token support  
- Secure token storage integration
- Token validation and permission checking

**Usage:**
```typescript
import { GitHubAuthenticationService } from '@sgex/vcs-services';

const authService = new GitHubAuthenticationService(secureTokenStorage);
const result = await authService.authenticate('your-token');
```

### GitHubRepositoryService
Manages repository operations including DAK validation, file operations, and branch management.

**Features:**
- Repository metadata and permissions
- DAK repository validation using @sgex/dak-core
- File and directory operations
- Branch creation and management
- Fork operations

**Usage:**
```typescript
import { GitHubRepositoryService } from '@sgex/vcs-services';

const repoService = new GitHubRepositoryService(dakService);
const isDAK = await repoService.isDAKRepository(octokit, 'owner', 'repo');
```

### GitHubUserService
Handles user and organization operations, rate limiting, and public data access.

**Features:**
- User and organization information
- Rate limit monitoring and management
- Repository listing for users/organizations
- Organization membership checking

**Usage:**
```typescript
import { GitHubUserService } from '@sgex/vcs-services';

const userService = new GitHubUserService();
const rateLimit = await userService.checkRateLimit(octokit);
```

### GitHubIssueService
Manages issue and pull request operations including comments and timeline events.

**Features:**
- Issue and pull request CRUD operations
- Comment management
- Branch-specific pull request queries
- Timeline events and merge operations

**Usage:**
```typescript
import { GitHubIssueService } from '@sgex/vcs-services';

const issueService = new GitHubIssueService();
const prs = await issueService.getPullRequestsForBranch(octokit, 'owner', 'repo', 'branch');
```

## Architecture

This package demonstrates the DAK-centric architecture approach:

- **Pure Business Logic**: No web framework dependencies
- **DAK Integration**: Uses @sgex/dak-core for repository validation
- **Utility Integration**: Uses @sgex/utils for lazy loading
- **Storage Integration**: Compatible with @sgex/storage-services for caching

## Dependencies

- `@sgex/dak-core`: DAK business logic and validation
- `@sgex/utils`: Lazy loading and factory utilities  
- `@sgex/storage-services`: Caching and storage services

## Peer Dependencies

- `@octokit/rest`: GitHub API client

## Development

```bash
npm install
npm run build
npm test
npm run dev    # Watch mode
```

## Testing

The package includes comprehensive tests for all services with mocked GitHub API responses.

```bash
npm test
npm run test:watch
```

## Migration from githubService.js

This package extracts and modernizes key operations from the original `githubService.js`:

- **25+ methods** migrated to TypeScript
- **Error handling** improvements
- **Type safety** with complete interfaces
- **Testability** with proper dependency injection
- **Performance** through lazy loading integration

The remaining methods in `githubService.js` will be migrated in subsequent phases of the refactoring plan.
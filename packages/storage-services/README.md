# @sgex/storage-services

Storage and caching services for SGEX with DAK-aware functionality.

## Overview

This package provides comprehensive storage, caching, and data persistence services with DAK (Digital Adaptation Kit) integration. It handles bookmarks, repository caching, and application state management with browser storage APIs.

## Features

- 🔖 **DAK-Aware Bookmarks**: Context-aware bookmark management with DAK component support
- 📦 **Repository Caching**: Intelligent caching of GitHub repository data with expiration
- 🗂️ **Cache Management**: Centralized cache control with DAK-specific cleanup
- 💾 **Browser Storage**: Efficient use of localStorage and sessionStorage
- 🔄 **Expiration Handling**: Automatic cleanup of stale cache entries
- 📊 **Statistics**: Detailed cache usage and performance metrics

## Installation

```bash
npm install @sgex/storage-services
```

## Usage

### Bookmark Management

```typescript
import { BookmarkService, DAKComponentType } from '@sgex/storage-services';

const bookmarkService = new BookmarkService();

// Add a DAK component bookmark
const bookmark = bookmarkService.addBookmark(
  '/business-processes/WHO/smart-immunizations',
  'Business Processes',
  {
    dakRepository: { 
      owner: 'WHO', 
      repo: 'smart-immunizations',
      branch: 'main'
    },
    componentType: DAKComponentType.BUSINESS_PROCESSES
  }
);

// Search bookmarks
const whoBookmarks = bookmarkService.searchBookmarks('WHO');

// Get bookmarks grouped by type
const groups = bookmarkService.getBookmarksGroupedByPage();

// Check if URL is bookmarked
const isBookmarked = bookmarkService.isBookmarked('/some-url', context);
```

### Repository Caching

```typescript
import { RepositoryCacheService } from '@sgex/storage-services';

const repoCache = new RepositoryCacheService();

// Cache repositories for an organization
const repos = await fetchRepositoriesFromGitHub('WHO');
repoCache.setCachedRepositories('WHO', repos, 'org');

// Retrieve cached repositories
const cachedRepos = repoCache.getCachedRepositories('WHO', 'org');

// Cache DAK-specific data
repoCache.cacheDAKData('WHO', 'smart-base', {
  isDak: true,
  validation: validationResult,
  metadata: dakMetadata
});

// Get cache statistics
const stats = repoCache.getCacheStatistics();
console.log(`Cached ${stats.dakRepositories} DAK repositories`);
```

### Cache Management

```typescript
import { CacheManagementService } from '@sgex/storage-services';

const cacheManager = new CacheManagementService();

// Get comprehensive cache information
const cacheInfo = cacheManager.getCacheInfo();
console.log('LocalStorage usage:', cacheInfo.localStorage.used);

// Clear all SGEX-related cache
cacheManager.clearAllCache();

// Get DAK-specific cache statistics
const dakStats = cacheManager.getDAKCacheStats();
console.log('DAK repositories:', dakStats.repositories);
console.log('Staging grounds:', dakStats.stagingGrounds);

// Clear expired cache entries
cacheManager.clearExpiredCache();

// Check for uncommitted work
const uncommitted = cacheManager.getUncommittedWork();
if (uncommitted.count > 0) {
  console.log(`${uncommitted.count} repositories have uncommitted changes`);
}
```

## API Reference

### BookmarkService

Manages user bookmarks with DAK-aware context.

#### Methods

- `getBookmarks(): Bookmark[]` - Get all bookmarks
- `addBookmark(url: string, pageName: string, context?: BookmarkContext): Bookmark` - Add bookmark
- `removeBookmark(id: string): boolean` - Remove bookmark
- `isBookmarked(url: string, context?: BookmarkContext): boolean` - Check if bookmarked
- `searchBookmarks(query: string): Bookmark[]` - Search bookmarks
- `getBookmarksGroupedByPage(): BookmarkGroup[]` - Group bookmarks by type
- `getDAKBookmarksĎ(dakRepository: DAKRepository): Bookmark[]` - Get DAK-specific bookmarks
- `exportBookmarks(): string` - Export as JSON
- `importBookmarks(jsonData: string, merge?: boolean): void` - Import from JSON

### RepositoryCacheService

Manages caching of GitHub repositories with DAK validation.

#### Methods

- `getCachedRepositories(owner: string, type?: string): CachedRepository[] | null` - Get cached repos
- `setCachedRepositories(owner: string, repositories: CachedRepository[], type?: string): void` - Cache repos
- `cacheDAKData(owner: string, repo: string, dakData: any, branch?: string): void` - Cache DAK data
- `getCachedDAKData(owner: string, repo: string, branch?: string): any | null` - Get DAK data
- `clearCacheForOwner(owner: string): boolean` - Clear owner's cache
- `getCacheStatistics(): CacheStatistics` - Get cache stats
- `refreshExpiredCaches(): number` - Remove expired entries
- `toDAKRepository(repo: CachedRepository, branch?: string): DAKRepository` - Convert format

### CacheManagementService

Centralized cache management across the application.

#### Methods

- `clearAllCache(): void` - Clear all SGEX cache
- `getCacheInfo(): CacheInfo` - Get comprehensive cache info
- `getUncommittedWork(): UncommittedWork` - Check for uncommitted changes
- `clearDAKRepositoryCache(dakRepository: DAKRepository): void` - Clear DAK-specific cache
- `getDAKCacheStats(): Object` - Get DAK cache statistics
- `clearExpiredCache(): void` - Remove expired entries

## Types

### DAKRepository
```typescript
interface DAKRepository {
  owner: string;
  repo: string;
  branch?: string;
  dakMetadata?: any;
  isValidDAK?: boolean;
  lastValidated?: Date;
}
```

### BookmarkContext
```typescript
interface BookmarkContext {
  user?: string;
  repository?: string;
  branch?: string;
  asset?: string;
  title?: string;
  path?: string;
  dakRepository?: DAKRepository;
  componentType?: DAKComponentType;
}
```

### CacheStatistics
```typescript
interface CacheStatistics {
  totalCaches: number;
  totalRepositories: number;
  dakRepositories: number;
  cacheSize: number;
  oldestCache: Date | null;
  newestCache: Date | null;
}
```

## DAK Component Types

The package supports all 9 WHO SMART Guidelines DAK components:

- `HEALTH_INTERVENTIONS` - Health interventions and recommendations
- `PERSONAS` - Generic personas (human and system actors)
- `USER_SCENARIOS` - User interaction scenarios
- `BUSINESS_PROCESSES` - Business processes and workflows
- `DATA_ELEMENTS` - Core data elements
- `DECISION_LOGIC` - Decision support logic
- `INDICATORS` - Program indicators
- `REQUIREMENTS` - Functional and non-functional requirements
- `TEST_SCENARIOS` - Test scenarios

## Cache Strategy

### Repository Cache
- **Expiry**: 24 hours
- **Storage**: localStorage
- **Keys**: `sgex_repo_cache_{type}_{owner}`
- **DAK Data**: Separate cache for DAK validation results

### Bookmark Storage
- **Storage**: localStorage
- **Key**: `sgex-bookmarks`
- **Format**: JSON array of bookmark objects
- **Import/Export**: Full JSON support

### Cache Management
- **Automatic Cleanup**: Expired entries removed on access
- **Manual Cleanup**: Clear all or specific owner/repository
- **Statistics**: Detailed usage metrics

## Performance Considerations

1. **Lazy Loading**: Cache entries loaded only when accessed
2. **Expiration**: Automatic cleanup of stale data
3. **Size Monitoring**: Track storage usage to prevent quota issues
4. **Batch Operations**: Efficient bulk cache operations

## Error Handling

All storage operations include comprehensive error handling:

```typescript
try {
  const bookmarks = bookmarkService.getBookmarks();
} catch (error) {
  console.error('Failed to load bookmarks:', error);
  // Fallback to empty array
}
```

## Browser Compatibility

- **localStorage**: All modern browsers
- **sessionStorage**: All modern browsers  
- **JSON**: Native support required
- **ES6+**: Modern JavaScript features used

## License

Apache 2.0 - See LICENSE file for details.
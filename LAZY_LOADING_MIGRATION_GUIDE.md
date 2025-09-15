# Lazy Loading Migration Guide

This guide explains how to migrate existing SGEX components and services to use the new lazy loading infrastructure.

## Migration Benefits

The lazy loading implementation provides:

- **~200KB initial bundle reduction** - Heavy libraries loaded on demand
- **15-20% Time to Interactive improvement** - Faster initial page loads
- **Better memory management** - Components loaded when needed
- **Improved code splitting** - Better webpack chunk optimization

## Service Migration

### Before (Eager Loading)
```javascript
import githubService from '../services/githubService';
import dakValidationService from '../services/dakValidationService';
import whoDigitalLibraryService from '../services/whoDigitalLibraryService';
```

### After (Lazy Loading)
```javascript
import { 
  githubService, 
  dakValidationService, 
  whoDigitalLibraryService 
} from '../services/lazyServices';
```

### Usage Patterns

#### Async/Await Pattern (Recommended)
```javascript
// For methods that return promises
const handleLoadData = async () => {
  try {
    const data = await githubService.getRepository(owner, repo);
    setData(data);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};
```

#### Promise Pattern
```javascript
// For immediate promise usage
githubService.getRepository(owner, repo)
  .then(data => setData(data))
  .catch(error => console.error(error));
```

#### Conditional Loading
```javascript
// Load service only when needed
const handleAdvancedFeature = async () => {
  if (showAdvancedFeature) {
    const result = await whoDigitalLibraryService.search(query);
    return result;
  }
};
```

## Component Migration

### Modal Components

#### Before
```javascript
import HelpModal from './HelpModal';
import CommitDiffModal from './CommitDiffModal';
```

#### After
```javascript
import { LazyHelpModal, LazyCommitDiffModal } from './lazyModals';
```

### Framework Components

#### Before
```javascript
import CoreDataDictionaryViewer from './CoreDataDictionaryViewer';
import DocumentationViewer from './DocumentationViewer';
```

#### After
```javascript
import { 
  LazyCoreDataDictionaryViewer, 
  LazyDocumentationViewer 
} from './lazyFramework';
```

## Library Migration

### Before
```javascript
import { Octokit } from '@octokit/rest';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import yaml from 'js-yaml';
```

### After
```javascript
import { 
  lazyLoadOctokit, 
  lazyLoadBpmnModeler, 
  lazyLoadYaml 
} from '../services/libraryLoaderService';

// Usage
const loadGitHubData = async () => {
  const Octokit = await lazyLoadOctokit();
  const octokit = new Octokit({ auth: token });
  return await octokit.rest.repos.get({ owner, repo });
};
```

## Performance Monitoring

Access performance metrics via the browser console:

```javascript
// Get comprehensive performance report
window.sgexPerformance.getPerformanceReport();

// Get optimization recommendations
window.sgexPerformance.getOptimizationRecommendations();

// Print summary
window.sgexPerformance.printPerformanceSummary();
```

## Preloading Strategies

### Critical Services (Auto-preloaded)
- dataAccessLayer
- bookmarkService
- localStorageService
- branchContextService

### Library Preloading
```javascript
import LibraryLoaderService from './services/libraryLoaderService';

// Preload commonly used libraries
LibraryLoaderService.preloadCriticalLibraries();

// Preload editor libraries when editing is likely
LibraryLoaderService.preloadEditorLibraries();
```

### Component Preloading
```javascript
import { preloadFrameworkComponents } from './components/lazyFramework';

// Preload framework components after user interaction
preloadFrameworkComponents();
```

## Error Handling

### Service Loading Errors
```javascript
try {
  const result = await githubService.getRepository(owner, repo);
  return result;
} catch (error) {
  if (error.message.includes('Failed to load service')) {
    // Handle service loading failure
    console.error('Service failed to load:', error);
    return null;
  }
  throw error; // Re-throw other errors
}
```

### Component Loading Errors
Lazy components automatically include error boundaries with loading fallbacks.

## Testing with Lazy Loading

### Mock Lazy Services
```javascript
// In test files
import { lazyServiceFactory } from '../services/lazyServices';

beforeEach(() => {
  // Clear lazy loading cache for consistent tests
  lazyServiceFactory.clearCache();
});
```

### Mock Lazy Components
```javascript
// Mock lazy components for faster tests
jest.mock('../components/lazyModals', () => ({
  LazyHelpModal: ({ children }) => <div data-testid="help-modal">{children}</div>
}));
```

## Bundle Analysis

### Check Bundle Impact
```javascript
// In browser console after page load
const bundleStats = window.sgexPerformance.estimateBundleSizeReduction();
console.log('Bundle reduction:', bundleStats);
```

### Library Cache Status
```javascript
import LibraryLoaderService from './services/libraryLoaderService';

const cacheStatus = LibraryLoaderService.getCacheStatus();
console.log('Loaded libraries:', cacheStatus.cached);
console.log('Memory usage:', cacheStatus.memoryUsage, 'KB');
```

## Migration Checklist

- [ ] Replace eager service imports with lazy service imports
- [ ] Update heavy components to use lazy modal/framework variants
- [ ] Replace direct library imports with lazy library loaders
- [ ] Add error handling for service loading
- [ ] Test component functionality with lazy loading
- [ ] Verify performance improvements with browser dev tools
- [ ] Update tests to work with lazy loading
- [ ] Add preloading for critical user workflows

## Common Pitfalls

1. **Calling lazy services synchronously** - Always use await or .then()
2. **Not handling loading errors** - Add proper error boundaries
3. **Over-eager preloading** - Only preload what's likely to be used
4. **Testing without mocks** - Mock lazy components for faster tests
5. **Forgetting error handling** - Services can fail to load

## Performance Targets

With full lazy loading implementation:

- Initial bundle size: **< 300KB** (down from ~500KB)
- Time to Interactive: **< 2.5s** (down from 3.0s+)  
- First Contentful Paint: **< 1.5s** (down from 2.0s+)
- Lazy loaded components: **15+** major components
- Deferred libraries: **8+** heavy libraries (150KB+ each)

Monitor these metrics using `window.sgexPerformance.getPerformanceReport()`.
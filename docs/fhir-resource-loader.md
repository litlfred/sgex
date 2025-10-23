# FHIR Resource Loader Service

## Overview

The FHIR Resource Loader Service provides dynamic loading of FHIR resources (ValueSets, CodeSystems, ConceptMaps, etc.) from external sources instead of bundling them in the application. This significantly reduces bundle size and improves initial load performance.

## Features

- **Dynamic Loading**: Loads FHIR resources on-demand from external URLs
- **Fallback Strategy**: Tries published URLs first, falls back to CI/draft builds
- **Caching**: In-memory caching to avoid redundant network requests
- **Parallel Loading**: Load multiple resources concurrently
- **Framework Agnostic**: Works with any FHIR Implementation Guide (IG), not just DAKs
- **Configurable**: Control timeout, caching, and URL resolution behavior

## Bundle Size Impact

**Before**: FHIR profiles bundled in application
- `fhir/profiles/valuesets.json`: 2.01 MB
- `fhir/profiles/types.json`: 1.07 MB
- **Total**: ~3 MB bundled

**After**: FHIR resources loaded dynamically
- Main bundle reduction: **~3 MB** (29% of current bundle size)
- Resources loaded only when needed
- Cached for repeat access

## Usage

### Basic Loading

```typescript
import { loadFHIRResource } from './services/fhirResourceLoaderService';

// Load a ValueSet
const valueSet = await loadFHIRResource(
  'http://hl7.org/fhir/ValueSet/administrative-gender'
);

if (valueSet) {
  console.log('Loaded ValueSet:', valueSet.name);
}
```

### With Options

```typescript
// Load with custom options
const codeSystem = await loadFHIRResource(
  'https://myprofile.github.io/myrepo/CodeSystem/my-codes',
  {
    allowCIBuild: true,      // Try CI build if published fails
    allowPublished: true,    // Try published URL first
    timeout: 5000,          // 5 second timeout
    cache: true             // Cache the result
  }
);
```

### Loading Multiple Resources

```typescript
import { loadMultipleFHIRResources } from './services/fhirResourceLoaderService';

const resources = await loadMultipleFHIRResources([
  'http://hl7.org/fhir/ValueSet/administrative-gender',
  'http://hl7.org/fhir/CodeSystem/observation-category',
  'https://myprofile.github.io/myrepo/ConceptMap/my-map'
]);

// Handle results (nulls for failed loads)
resources.forEach((resource, index) => {
  if (resource) {
    console.log(`Loaded resource ${index}:`, resource.resourceType);
  }
});
```

### Preloading

```typescript
import { preloadFHIRResources } from './services/fhirResourceLoaderService';

// Preload commonly used resources during app startup
await preloadFHIRResources([
  'http://hl7.org/fhir/ValueSet/administrative-gender',
  'http://hl7.org/fhir/ValueSet/marital-status',
  // ... more resources
]);
```

## URL Resolution Strategy

The service resolves FHIR resources using a two-step fallback strategy:

### 1. Published URL (if `allowPublished` is true)

Canonical URL + `.json` extension:
```
http://hl7.org/fhir/ValueSet/administrative-gender
  → http://hl7.org/fhir/ValueSet/administrative-gender.json
```

### 2. CI/Draft Build URL (if `allowCIBuild` is true and URL is GitHub)

Extract profile and repo from GitHub URL, construct CI build path:
```
https://myprofile.github.io/myrepo/ValueSet/my-valueset
  → https://myprofile.github.io/myrepo/my-valueset.json
```

**Note**: CI build URLs only work for resources hosted on GitHub Pages.

## Cache Management

```typescript
import {
  clearResourceCache,
  getCacheSize,
  isResourceCached
} from './services/fhirResourceLoaderService';

// Check if resource is cached
if (isResourceCached('http://hl7.org/fhir/ValueSet/administrative-gender')) {
  console.log('Resource is in cache');
}

// Get cache statistics
console.log(`Cache size: ${getCacheSize()} resources`);

// Clear specific resource
clearResourceCache('http://hl7.org/fhir/ValueSet/administrative-gender');

// Clear entire cache
clearResourceCache();
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowCIBuild` | boolean | `true` | Allow loading from CI/draft builds |
| `allowPublished` | boolean | `true` | Allow loading from published URLs |
| `timeout` | number | `10000` | Request timeout in milliseconds |
| `cache` | boolean | `true` | Enable in-memory caching |

## Integration Examples

### Loading ValueSets for Questionnaire

```typescript
async function loadQuestionnaireValueSets(questionnaire) {
  const valueSetUrls = questionnaire.item
    .filter(item => item.answerValueSet)
    .map(item => item.answerValueSet);
  
  const valueSets = await loadMultipleFHIRResources(valueSetUrls);
  
  return valueSets.filter(vs => vs !== null);
}
```

### Loading CodeSystems for Validation

```typescript
async function validateCode(codeSystemUrl, code) {
  const codeSystem = await loadFHIRResource(codeSystemUrl);
  
  if (!codeSystem) {
    throw new Error(`CodeSystem not found: ${codeSystemUrl}`);
  }
  
  const concept = codeSystem.concept?.find(c => c.code === code);
  return !!concept;
}
```

### Preloading Common Resources

```typescript
// In app initialization
import { preloadFHIRResources } from './services/fhirResourceLoaderService';

const COMMON_RESOURCES = [
  'http://hl7.org/fhir/ValueSet/administrative-gender',
  'http://hl7.org/fhir/ValueSet/marital-status',
  'http://hl7.org/fhir/ValueSet/languages',
  // ... add more commonly used resources
];

export async function initializeApp() {
  // Preload resources in background
  preloadFHIRResources(COMMON_RESOURCES).catch(err => {
    console.warn('Failed to preload some FHIR resources:', err);
  });
  
  // Continue with app initialization
}
```

## Error Handling

The service handles errors gracefully:

```typescript
const resource = await loadFHIRResource('http://example.org/invalid-url');

if (resource === null) {
  // Resource not found or failed to load
  console.error('Failed to load resource');
} else {
  // Resource loaded successfully
  console.log('Loaded:', resource.resourceType);
}
```

For multiple resources, check each result:

```typescript
const results = await loadMultipleFHIRResources(urls);

results.forEach((resource, index) => {
  if (resource === null) {
    console.error(`Failed to load resource at index ${index}`);
  }
});
```

## Performance Considerations

1. **Caching**: Enable caching (default) to avoid redundant network requests
2. **Preloading**: Preload commonly used resources during app startup
3. **Parallel Loading**: Use `loadMultipleFHIRResources` for concurrent requests
4. **Timeout**: Adjust timeout based on network conditions
5. **Selective Loading**: Only load resources when actually needed

## Testing

The service includes comprehensive tests covering:

- URL resolution (published and CI build)
- Fallback behavior
- Caching functionality
- Parallel loading
- Error handling
- Option handling

Run tests:
```bash
npm test -- fhirResourceLoaderService.test.ts
```

## Future Enhancements

Potential improvements for future versions:

1. **IndexedDB Storage**: Persist cache across sessions
2. **Service Worker**: Enable offline access to cached resources
3. **Automatic Retry**: Retry failed requests with exponential backoff
4. **Version Management**: Support loading specific versions of resources
5. **Batch Loading**: Optimize network requests for multiple resources
6. **Progress Tracking**: Report loading progress for multiple resources

## Related Documentation

- [Bundle Analysis Report](../BUNDLE_ANALYSIS_REPORT.md) - Performance impact analysis
- [Bundle Analysis Guide](bundle-analysis-guide.md) - Bundle optimization strategies
- [FHIR Specification](http://hl7.org/fhir/) - FHIR resource definitions

## Support

For issues or questions:
1. Check the service tests for usage examples
2. Review the inline documentation in the source code
3. Open an issue in the repository

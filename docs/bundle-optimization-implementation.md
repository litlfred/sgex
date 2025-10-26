# Bundle Optimization Implementation Guide

This document tracks the bundle size optimization implementations for SGEX Workbench to achieve REQ-PERF-001 performance requirements.

## Status: Phase 1 Complete

### Implemented Optimizations

#### 1. ✅ PageEditModal Lazy Loading (Priority: CRITICAL)
**Impact**: ~2.4 MB reduction in initial bundle

**Implementation**:
- File: `src/components/PagesManager.js`
- Changed from direct import to `React.lazy()`
- Added Suspense boundary with loading fallback
- Markdown editor (@uiw/react-md-editor) now loaded on-demand

**Code Changes**:
```javascript
// Before:
import PageEditModal from './PageEditModal';

// After:
const PageEditModal = lazy(() => import('./PageEditModal'));

// Usage with Suspense:
{editModalPage && (
  <Suspense fallback={<LoadingIndicator />}>
    <PageEditModal ... />
  </Suspense>
)}
```

**Result**: PageEditModal (including MDEditor) is now loaded only when user clicks edit button, not during initial page load.

#### 2. ✅ html2canvas Already Optimized
**Status**: Already implemented in `src/services/bugReportService.ts`

**Implementation**:
```typescript
// Dynamic import when screenshot is needed
const module = await import('html2canvas');
const html2canvas = module.default;
```

**Result**: html2canvas (370 KB) only loaded when user takes a screenshot for bug report.

#### 3. ✅ FHIR Resource Loader Service
**Impact**: ~3 MB reduction potential (pending component integration)

**Implementation**:
- Service: `src/services/fhirResourceLoaderService.ts`
- Integration helpers: `src/utils/fhirResourceIntegration.tsx`
- Documentation: `docs/fhir-resource-loader.md`
- Migration guide: `docs/fhir-resource-integration-guide.md`

**Status**: Infrastructure complete, ready for component integration.

#### 4. ✅ Bundle Analysis Infrastructure
**Tools Added**:
- webpack-bundle-analyzer integration
- Bundle size checker script
- Size budget enforcement (main: 300KB, chunks: 1MB, total: 10MB)

**Commands**:
```bash
npm run analyze          # Generate interactive bundle report
npm run check-bundle-size  # Check against size budgets
npm run build:check      # Build and check in one command
```

### Optimization Results Summary

| Optimization | Status | Expected Impact | Implementation |
|-------------|--------|-----------------|----------------|
| PageEditModal Lazy Load | ✅ Complete | -2.4 MB | PagesManager.js |
| html2canvas Lazy Load | ✅ Already Done | -370 KB | bugReportService.ts |
| FHIR Resource Loader | ✅ Infrastructure | -3.0 MB | Service ready, needs integration |
| Bundle Analyzer | ✅ Complete | Monitoring | craco.config.js |
| Bundle Size Checker | ✅ Complete | Prevention | scripts/check-bundle-size.js |

**Total Immediate Impact**: ~2.4 MB reduction  
**Total Potential Impact**: ~5.8 MB reduction (with FHIR integration)

## Phase 2: Recommended Next Steps

### High Priority Optimizations

#### 1. Split Chunk 3415 (5.7 MB)
**Current State**: Contains FHIR profiles + FSH SUSHI compiler

**Action Plan**:
1. Identify components using FSH/SUSHI
2. Lazy load FSH editor components
3. Consider server-side FSH compilation
4. Move FHIR static data to external loading

**Expected Result**: Break into 3-4 chunks <1 MB each

#### 2. Optimize Lodash Usage
**Current State**: Entire lodash library bundled (520 KB)

**Action Plan**:
```javascript
// Replace in dependencies:
// Instead of importing whole lodash
import _ from 'lodash';

// Use targeted imports:
import debounce from 'lodash-es/debounce';
import merge from 'lodash-es/merge';
```

**Expected Impact**: ~400 KB reduction through tree-shaking

#### 3. Additional Modal Lazy Loading
**Candidates**:
- HelpModal (used in multiple components)
- SAMLAuthModal (authentication)
- CollaborationModal
- CommitDiffModal
- EnhancedTutorialModal

**Pattern**:
```javascript
const HelpModal = lazy(() => import('./HelpModal'));
const SAMLAuthModal = lazy(() => import('./SAMLAuthModal'));
// ... wrap usage with <Suspense>
```

**Expected Impact**: ~200-300 KB per modal

#### 4. Route-Based Code Splitting
**Implementation**: Use React Router lazy loading for routes

```javascript
const CoreDataDictionaryViewer = lazy(() => 
  import('./components/CoreDataDictionaryViewer')
);
const BusinessProcessSelection = lazy(() => 
  import('./components/BusinessProcessSelection')
);
// ... apply to all major routes
```

**Expected Impact**: Reduce initial bundle by 30-40%

### Medium Priority Optimizations

#### 5. Implement Progressive Web App Features
- Service worker for caching large chunks
- Background chunk loading
- Cache-first strategy for static assets

#### 6. Webpack Configuration Tweaks
- Further splitChunks optimization
- Module concatenation improvements
- Verify tree-shaking effectiveness

## Testing Checklist

After implementing optimizations:

- [ ] Run `npm run build` - build completes successfully
- [ ] Run `npm run check-bundle-size` - verify size improvements
- [ ] Run `npm run analyze` - review bundle composition
- [ ] Test lazy-loaded components load correctly
- [ ] Verify Suspense fallbacks display properly
- [ ] Check network tab shows chunks loaded on-demand
- [ ] Test on slow network connection
- [ ] Verify no console errors related to dynamic imports
- [ ] Run existing test suite - all tests pass
- [ ] Test in production build mode

## Monitoring & Maintenance

### Continuous Monitoring
1. Run bundle analyzer after major changes
2. Check bundle sizes in CI/CD pipeline
3. Review lighthouse performance scores
4. Monitor actual user load times

### Size Budget Enforcement
Current budgets (enforced by `npm run check-bundle-size`):
- Main bundle: 300 KB max
- Individual chunks: 1 MB max  
- Total JavaScript: 10 MB max

### Performance Metrics to Track
- Initial page load time
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total bundle size over time

## References

- [Bundle Analysis Report](../BUNDLE_ANALYSIS_REPORT.md)
- [Bundle Analyzer Quickstart](../BUNDLE_ANALYZER_QUICKSTART.md)
- [Bundle Analysis Guide](./bundle-analysis-guide.md)
- [FHIR Resource Loader](./fhir-resource-loader.md)
- [FHIR Integration Guide](./fhir-resource-integration-guide.md)

## Version History

- **Phase 1** (2025-10-24): Bundle analysis infrastructure, PageEditModal lazy loading, FHIR Resource Loader service
- **Phase 2** (Planned): Additional modal lazy loading, Lodash optimization, FSH/SUSHI splitting
- **Phase 3** (Planned): Route-based splitting, PWA features, Webpack optimization

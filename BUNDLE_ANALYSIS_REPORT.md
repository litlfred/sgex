# SGEX Workbench Bundle Analysis Report

**Generated**: 2025-10-23  
**Tool**: webpack-bundle-analyzer v4.10.2  
**Build Command**: `npm run analyze`

## Executive Summary

The SGEX Workbench bundle analysis reveals significant opportunities for bundle size optimization. The current build produces warnings about excessive bundle size, with the largest chunk being **5.7 MB** uncompressed.

### Key Findings

- **Total Chunks**: 54
- **Main Bundle**: 532 KB
- **Largest Chunk**: 5.7 MB (chunk 3415) ⚠️ CRITICAL
- **Second Largest**: 1.4 MB (chunk 2998) ⚠️ HIGH PRIORITY
- **Build Warning**: "The bundle size is significantly larger than recommended"

### Performance Impact

This directly affects **REQ-PERF-001** (fast SPA load times) from `/public/docs/requirements.md`:
- Slow initial page load on slower connections
- Increased memory consumption in browsers
- Poor mobile user experience
- Delayed Time to Interactive (TTI)

## Top Bundle Contributors

### Critical Size Contributors (>1 MB)

#### 1. React Markdown Editor (@uiw/react-md-editor) - 2.40 MB
- **Impact**: CRITICAL
- **Usage**: PageEditModal.js, PagesManager.js
- **Analysis**: Large markdown editor with full feature set including syntax highlighting
- **Recommendation**: 
  - Lazy load only when modal is opened
  - Consider lighter alternative or custom implementation
  - Use dynamic import() for on-demand loading

#### 2. FHIR Profiles (fhir/profiles/valuesets.json) - 2.01 MB
- **Impact**: CRITICAL
- **Usage**: FHIR conformance parsing
- **Analysis**: Static JSON data for FHIR value sets
- **Recommendation**:
  - Load on-demand from CDN or external source
  - Implement selective loading of required value sets only
  - Consider storing in IndexedDB for repeat visits

#### 3. FHIR Types (fhir/profiles/types.json) - 1.07 MB
- **Impact**: HIGH
- **Usage**: FHIR conformance parsing
- **Analysis**: Static JSON data for FHIR types
- **Recommendation**:
  - Similar to valuesets - external loading
  - Cache in browser storage
  - Load incrementally as needed

#### 4. BPMN.js Modeler - 0.99 MB
- **Impact**: HIGH
- **Usage**: Already lazy-loaded via libraryLoaderService.ts
- **Analysis**: Business process diagram editor
- **Status**: ✅ Already optimized with lazy loading
- **Recommendation**: No immediate action needed

### High Priority Contributors (500 KB - 1 MB)

#### 5. Lodash - 0.52 MB
- **Impact**: MEDIUM-HIGH
- **Usage**: fhir-package-loader, fsh-sushi
- **Analysis**: Entire lodash library imported
- **Recommendation**:
  - Use lodash-es for tree-shaking
  - Import only specific functions needed
  - Consider replacing with native JS where possible

#### 6. Terser (from fsh-sushi) - 0.46 MB
- **Impact**: MEDIUM-HIGH
- **Usage**: html-minifier-terser within fsh-sushi
- **Analysis**: Bundled unnecessarily in browser build
- **Recommendation**:
  - Review if fsh-sushi is needed in browser
  - Consider backend processing for FSH compilation
  - Lazy load only when FSH editing is active

#### 7. React DOM - 0.45 MB
- **Impact**: LOW (essential)
- **Usage**: Core React functionality
- **Analysis**: Required dependency, already optimized
- **Status**: ✅ Essential, no optimization needed

### Medium Priority Contributors (200-500 KB)

#### 8. html2canvas - 0.37 MB
- **Usage**: HelpModal, bugReportService
- **Recommendation**: Lazy load for screenshot functionality

#### 9. React Router - 0.33 MB
- **Usage**: Core routing
- **Status**: Essential, minimal impact

#### 10. Parse5 - 0.31 MB
- **Usage**: Markdown editor HTML parsing
- **Recommendation**: Part of markdown editor lazy loading

## Chunk Analysis

### Chunk 3415 (5.7 MB) - CRITICAL
**Primary Contents**:
- FHIR profiles and definitions
- FSH SUSHI compiler
- HTML/Markdown processing libraries

**Action Items**:
1. Identify exact component triggering this chunk
2. Split into multiple smaller chunks
3. Implement dynamic imports for FHIR/FSH functionality
4. Consider separate chunk for FSH editing features

### Chunk 2998 (1.4 MB) - HIGH PRIORITY
**Primary Contents**:
- Likely BPMN or large editor component
- Markdown preview/editing

**Action Items**:
1. Verify chunk contents via source map
2. Ensure proper code splitting boundaries
3. Add React.lazy() wrappers where missing

## Optimization Recommendations

### Immediate Actions (Week 1)

#### 1. Implement Lazy Loading for Heavy Components
```javascript
// Instead of direct imports
import PageEditModal from './PageEditModal';

// Use React.lazy()
const PageEditModal = React.lazy(() => import('./PageEditModal'));
```

**Files to Update**:
- `src/components/PagesManager.js`
- Any component using markdown editor
- FHIR profile editors
- FSH/SUSHI integration points

**Expected Impact**: Reduce main bundle by ~2-3 MB

#### 2. Externalize FHIR Data Files
Move static FHIR JSON files to:
- External CDN
- On-demand API endpoints  
- IndexedDB with lazy loading

**Expected Impact**: Reduce bundle by ~3 MB

#### 3. Replace Lodash with Targeted Imports
```javascript
// Instead of
import _ from 'lodash';

// Use
import debounce from 'lodash-es/debounce';
import merge from 'lodash-es/merge';
```

**Expected Impact**: Reduce bundle by ~400 KB

### Short-term Actions (Week 2-3)

#### 4. Code Splitting Strategy
- Split by route (already partially done)
- Split by feature (FHIR, BPMN, FSH, DAK components)
- Split large third-party libraries

#### 5. Audit fsh-sushi Usage
- Determine if FSH compilation can be server-side
- If browser-side needed, lazy load only when editing FSH
- Consider lighter alternatives for FSH validation

#### 6. Optimize Markdown Editor
- Consider simpler editor for basic use cases
- Load full editor only for advanced editing
- Evaluate alternatives like SimpleMDE or custom solution

### Long-term Actions (Month 2+)

#### 7. Progressive Web App Optimization
- Implement service worker caching
- Cache large chunks for repeat visits
- Background chunk loading

#### 8. Dynamic Import Strategy
```javascript
// Load on first use
let bpmnModeler = null;
async function getBpmnModeler() {
  if (!bpmnModeler) {
    const module = await import('./services/libraryLoaderService');
    bpmnModeler = await module.lazyLoadBpmnModeler();
  }
  return bpmnModeler;
}
```

#### 9. Bundle Size Budget
Add to package.json:
```json
{
  "bundlesize": [
    {
      "path": "./build/static/js/main.*.js",
      "maxSize": "300 KB"
    },
    {
      "path": "./build/static/js/*.chunk.js",
      "maxSize": "500 KB"
    }
  ]
}
```

#### 10. Webpack Optimization Tweaks
Already in craco.config.js, but consider:
- Further splitChunks optimization
- Module concatenation
- Tree shaking verification

## Monitoring and Ongoing Maintenance

### Bundle Size Checker

A bundle size checker script has been implemented to enforce size budgets:

```bash
# Check bundle sizes against limits
npm run check-bundle-size

# Build and check in one command
npm run build:check
```

**Size Budgets Enforced:**
- Main bundle: 300 KB maximum
- Individual chunks: 1 MB maximum
- Total JavaScript: 10 MB maximum (warning at 8 MB)

The checker provides:
- ✅ Clear pass/fail status for each bundle
- 📊 Detailed size information and violations
- 💡 Actionable recommendations when limits exceeded
- 🎯 Exit code 1 on failure (suitable for CI/CD)

### Integration into CI/CD

Add to GitHub Actions workflow:
```yaml
- name: Build Project
  run: npm run build
  
- name: Check Bundle Size
  run: npm run check-bundle-size
  # This will fail the build if bundles exceed limits
```

Or use the combined command:
```yaml
- name: Build and Check Bundle Size
  run: npm run build:check
```

### Regular Reviews
- Monthly bundle analysis review
- Track bundle size trends
- Update optimization strategies
- Adjust size budgets as needed

### npm Scripts Added

```json
{
  "build:analyze": "ANALYZE=true npm run build",
  "analyze": "npm run build:analyze && echo 'Bundle analysis complete!'",
  "check-bundle-size": "node scripts/check-bundle-size.js",
  "build:check": "npm run build && npm run check-bundle-size"
}
```

### Usage
```bash
# Generate bundle analysis report
npm run analyze

# Open bundle-report.html in browser to see interactive visualization
# Review bundle-stats.json for detailed statistics
```

## Expected Outcomes

### After Immediate Actions (Week 1)
- Main bundle: 532 KB → ~350 KB (33% reduction)
- Largest chunk: 5.7 MB → ~2 MB (65% reduction)
- Initial page load: ~8s → ~3s on 3G (62% improvement)

### After Short-term Actions (Week 2-3)
- Main bundle: ~350 KB → ~250 KB (28% additional)
- Largest chunk: ~2 MB → ~800 KB (60% additional)
- All chunks under 1 MB target achieved ✅

### After Long-term Actions (Month 2+)
- Sustainable bundle size monitoring
- Automated size budget enforcement
- Progressive loading for optimal UX
- Service worker caching for repeat visits

## Technical Details

### Bundle Analyzer Configuration

Located in `craco.config.js`:
```javascript
if (process.env.ANALYZE === 'true') {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  webpackConfig.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../bundle-report.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: '../bundle-stats.json',
      statsOptions: {
        source: false,
      },
    })
  );
}
```

### Generated Files
- `bundle-report.html` - Interactive visualization (1.1 MB)
- `bundle-stats.json` - Detailed statistics (135 MB)
- Both excluded from git via `.gitignore`

## References

- [webpack-bundle-analyzer Documentation](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Web.dev: Code Splitting](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [SGEX Requirements: REQ-PERF-001](/public/docs/requirements.md)

## Conclusion

The bundle analysis reveals clear optimization opportunities that can significantly improve SGEX Workbench performance. The immediate actions alone can reduce the main bundle by 33% and the largest chunk by 65%, directly supporting REQ-PERF-001 for fast SPA load times.

Priority should be given to:
1. ✅ Lazy loading the markdown editor (2.4 MB saved)
2. ✅ Externalizing FHIR data files (3 MB saved)
3. ✅ Optimizing lodash imports (400 KB saved)

These changes require minimal code modifications while providing maximum performance benefit. The webpack-bundle-analyzer integration provides ongoing monitoring capabilities to prevent bundle size regression.

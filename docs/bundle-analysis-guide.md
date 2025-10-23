# Bundle Analysis Guide

## Overview

SGEX Workbench includes webpack-bundle-analyzer integration for ongoing bundle size monitoring and optimization. This guide explains how to generate and interpret bundle analysis reports.

## Quick Start

### Generate Bundle Report

```bash
npm run analyze
```

This will:
1. Build the production bundle with analysis enabled
2. Generate `bundle-report.html` - interactive visualization
3. Generate `bundle-stats.json` - detailed statistics
4. Display completion message

### View Results

Open `bundle-report.html` in your browser to see an interactive treemap visualization of your bundle composition.

## Understanding the Report

### Interactive Treemap

The bundle report shows a treemap where:
- **Box size** = module size
- **Color** = module type or chunk
- **Hover** = see detailed size information
- **Click** = drill down into module contents

### Size Metrics

Three size metrics are shown:
- **Stat**: Original uncompressed size
- **Parsed**: Size after webpack processing
- **Gzipped**: Size after compression (closest to network transfer)

Focus on **Parsed** size for optimization targets.

## npm Scripts

### analyze
```bash
npm run analyze
```
Complete analysis: builds with analyzer and displays completion message.

### build:analyze
```bash
npm run build:analyze
```
Just the build step with analysis enabled (used internally by `analyze`).

## Configuration

### Location
Bundle analyzer configuration is in `craco.config.js`.

### Settings
```javascript
{
  analyzerMode: 'static',           // Generate HTML file
  reportFilename: '../bundle-report.html',
  openAnalyzer: false,              // Don't auto-open browser
  generateStatsFile: true,          // Generate JSON stats
  statsFilename: '../bundle-stats.json',
  statsOptions: {
    source: false                   // Exclude source for smaller JSON
  }
}
```

### Activation
Analysis runs when `ANALYZE=true` environment variable is set.

## Reading the Report

### Identifying Large Modules

1. **Look for large boxes** in the treemap
2. **Check module paths** - are they in node_modules?
3. **Verify usage** - is this module actually needed?
4. **Consider alternatives** - are there lighter options?

### Common Culprits

- **Entire libraries imported** instead of specific functions
- **Development code** included in production build
- **Duplicate dependencies** from different packages
- **Large data files** that could be loaded externally
- **Unused exports** that aren't tree-shaken

### Red Flags

- Single module > 500 KB
- Multiple copies of same library
- Development tools in production
- Entire icon libraries for a few icons
- Large JSON/data files in bundle

## Optimization Strategies

### 1. Lazy Loading

Use React.lazy() for components not needed immediately:

```javascript
// Before
import HeavyComponent from './HeavyComponent';

// After
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// In render
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### 2. Targeted Imports

Import only what you need:

```javascript
// Before (imports entire lodash - 500 KB)
import _ from 'lodash';

// After (imports only needed function)
import debounce from 'lodash-es/debounce';
```

### 3. Code Splitting

Split large features into separate chunks:

```javascript
// Dynamic import creates separate chunk
const loadEditor = () => import('./MarkdownEditor');
```

### 4. External Resources

Move large static data to external sources:

```javascript
// Instead of importing 2 MB JSON
import data from './huge-data.json';

// Fetch on demand
const data = await fetch('/api/data').then(r => r.json());
```

## Integration with CI/CD

### GitHub Actions

Add bundle size checking to CI:

```yaml
- name: Analyze Bundle
  run: npm run analyze
  
- name: Check Bundle Size
  run: |
    MAIN_SIZE=$(stat -f%z build/static/js/main.*.js 2>/dev/null || stat -c%s build/static/js/main.*.js)
    MAX_SIZE=307200  # 300 KB in bytes
    if [ $MAIN_SIZE -gt $MAX_SIZE ]; then
      echo "❌ Main bundle too large: $MAIN_SIZE bytes (max: $MAX_SIZE)"
      exit 1
    fi
    echo "✅ Bundle size OK: $MAIN_SIZE bytes"
```

### Bundle Size Budgets

Consider adding `bundlesize` package for automated checks:

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

## Troubleshooting

### Report Not Generated

Check that:
- `npm run analyze` completed successfully
- `bundle-report.html` exists in project root
- No webpack compilation errors occurred

### Can't Open HTML File

Some browsers block local file access. Try:
- Using a local web server: `python3 -m http.server`
- Opening from file:// directly
- Checking browser console for errors

### Stats File Too Large

The `bundle-stats.json` can be 100+ MB. This is normal as it contains detailed module information. It's excluded from git via `.gitignore`.

To reduce size, modify in `craco.config.js`:
```javascript
statsOptions: {
  source: false,        // Exclude source code
  modules: false,       // Exclude module details (less useful)
}
```

## Best Practices

### Regular Analysis

Run bundle analysis:
- **Before major releases** - catch size regressions
- **After adding dependencies** - verify impact
- **Monthly** - track trends over time
- **When build warnings appear** - investigate immediately

### Size Targets

Recommended maximum sizes:
- Main bundle: **300 KB** (compressed: ~100 KB)
- Feature chunks: **500 KB** (compressed: ~150 KB)
- Lazy-loaded: **1 MB** (compressed: ~300 KB)

### Documentation

When adding large dependencies:
1. Check size impact with bundle analyzer
2. Document justification
3. Explore lighter alternatives
4. Plan optimization strategy

## Advanced Usage

### Programmatic Access

Use bundle-stats.json for custom analysis:

```javascript
const stats = require('./bundle-stats.json');

// Find largest modules
const modules = stats.modules
  .map(m => ({ name: m.name, size: m.size }))
  .sort((a, b) => b.size - a.size)
  .slice(0, 10);

console.log('Top 10 largest modules:', modules);
```

### Custom Reports

Generate custom reports from stats:

```javascript
const stats = require('./bundle-stats.json');

// Analyze by package
const byPackage = {};
stats.modules.forEach(mod => {
  const match = mod.name.match(/node_modules\/([^/]+)/);
  if (match) {
    const pkg = match[1];
    byPackage[pkg] = (byPackage[pkg] || 0) + mod.size;
  }
});

// Sort and display
Object.entries(byPackage)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([pkg, size]) => {
    console.log(`${pkg}: ${(size / 1024).toFixed(0)} KB`);
  });
```

### Webpack Analyze Mode

For deeper webpack analysis, set:
```javascript
analyzerMode: 'server'  // Opens interactive server
```

Then access at `http://127.0.0.1:8888`

## References

- [webpack-bundle-analyzer GitHub](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [SGEX Bundle Analysis Report](../BUNDLE_ANALYSIS_REPORT.md)

## Support

For questions or issues:
1. Check [BUNDLE_ANALYSIS_REPORT.md](../BUNDLE_ANALYSIS_REPORT.md) for optimization recommendations
2. Review [webpack-bundle-analyzer docs](https://github.com/webpack-contrib/webpack-bundle-analyzer)
3. Open an issue in the SGEX repository

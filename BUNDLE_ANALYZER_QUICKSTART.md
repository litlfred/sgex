# Bundle Analyzer Quick Start

## What is it?

The bundle analyzer generates an interactive HTML report showing exactly what's in your JavaScript bundle. It visualizes the size of each module and helps identify optimization opportunities.

## Quick Usage

```bash
# Generate the report
npm run analyze

# Open bundle-report.html in your browser
# (The file will be in the project root)
```

## What you'll see

The report shows an interactive treemap where:
- **Box size** = how much space that code takes
- **Color** = different chunks/modules  
- **Hover** = see exact sizes
- **Click** = drill down into details

## Key Numbers

Current bundle analysis shows:

| Metric | Size | Status |
|--------|------|--------|
| Main bundle | 532 KB | ⚠️ Could be smaller |
| Largest chunk | 5.7 MB | ❌ Too large! |
| Second largest | 1.4 MB | ⚠️ Should split |
| Total chunks | 54 | ✅ Good splitting |

## Top 5 Opportunities

1. **React Markdown Editor** (2.4 MB)
   - Lazy load when modal opens
   - Expected savings: ~2 MB

2. **FHIR Value Sets** (2.0 MB)
   - Load from external source
   - Expected savings: ~2 MB

3. **FHIR Types** (1.1 MB)
   - Load from external source
   - Expected savings: ~1 MB

4. **Lodash** (520 KB)
   - Use targeted imports
   - Expected savings: ~400 KB

5. **Terser from fsh-sushi** (460 KB)
   - Review if needed in browser
   - Expected savings: ~400 KB

**Total potential savings**: ~6 MB (reducing largest chunk from 5.7 MB to < 1 MB)

## How to Fix

See [BUNDLE_ANALYSIS_REPORT.md](BUNDLE_ANALYSIS_REPORT.md) for detailed recommendations and implementation steps.

Quick wins:
1. Add React.lazy() to markdown editor imports
2. Move FHIR data to external loading
3. Replace `import _ from 'lodash'` with specific imports

## Monitoring

Run `npm run analyze` regularly to:
- ✅ Check impact of new dependencies before merging
- ✅ Verify optimization results
- ✅ Track bundle size trends over time
- ✅ Prevent size regressions

## Files Generated

- `bundle-report.html` (1.1 MB) - Interactive visualization
- `bundle-stats.json` (135 MB) - Raw statistics

Both files are git-ignored and safe to delete.

## More Information

- [Bundle Analysis Guide](docs/bundle-analysis-guide.md) - Complete usage guide
- [Bundle Analysis Report](BUNDLE_ANALYSIS_REPORT.md) - Detailed findings
- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) - Tool documentation

## Questions?

- Check the documentation above
- Open an issue in the repository
- Review the interactive report for visual insights

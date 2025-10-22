# Build Analysis and Logging Guide

This guide explains how to use the enhanced build analysis workflow to troubleshoot build issues, analyze bundle sizes, and optimize the SGEX Workbench production builds.

## Overview

The Build Analysis workflow provides:
- **Detailed build logs** with verbose output and debug information
- **Webpack bundle statistics** for analyzing module sizes and dependencies
- **Build size analysis** showing file-by-file breakdown
- **Artifact archiving** for historical reference and troubleshooting

## Running the Build Analysis Workflow

### Option 1: Manual Trigger (Recommended for Analysis)

1. Navigate to the [Actions tab](https://github.com/litlfred/sgex/actions) in the GitHub repository
2. Select "Build Analysis and Logging" from the workflows list
3. Click "Run workflow" button
4. Configure options:
   - **Branch**: Select the branch to analyze (default: main)
   - **Generate source maps**: Enable for detailed debugging (increases build size)
5. Click "Run workflow" to start the analysis

### Option 2: Automatic Trigger (Optional)

The workflow can be configured to run automatically on:
- Pushes to main branch
- Pull requests
- Scheduled intervals

To enable automatic triggers, uncomment the relevant sections in `.github/workflows/build-analysis.yml`.

## Accessing Build Artifacts

### From GitHub Actions UI

1. Go to [Actions tab](https://github.com/litlfred/sgex/actions)
2. Click on the specific "Build Analysis and Logging" workflow run
3. Scroll down to the **Artifacts** section at the bottom of the page
4. Click on the artifact name (e.g., `build-logs-and-stats-2024-01-15_10-30-00_UTC`) to download
5. Extract the downloaded ZIP file to access all logs and statistics

### Available Artifacts

Each build analysis run generates the following artifacts:

#### Log Files
- **`npm-install.log`** - Complete dependency installation log with verbose output
  - Use this to troubleshoot dependency resolution issues
  - Shows all packages being installed and their versions
  
- **`build.log`** - Full webpack build log including warnings and errors
  - Contains all build output with detailed error messages
  - Search for "ERROR" or "WARNING" to quickly find issues
  
- **`build-analysis.txt`** - Human-readable build size analysis
  - Quick overview of largest files and bundles
  - Size breakdown by file type
  - Top 20 largest files with percentages

#### Statistics Files
- **`webpack-stats.json`** - Complete webpack bundle statistics (if generated)
  - Use with visualization tools for detailed analysis
  - Contains module dependency graphs
  - Shows chunk splitting and code splitting effectiveness
  
- **`build-analysis.json`** - Detailed build size analysis in JSON format
  - Programmatic access to build statistics
  - File-by-file size breakdown
  - Percentage calculations for easy comparison

#### Metadata
- **`build-metadata.json`** - Build environment and configuration metadata
  - Workflow run information
  - Git commit and branch details
  - Build configuration settings
  
- **`README.md`** - Guide to using the artifacts
  - Quick reference for artifact contents
  - Instructions for accessing from GitHub

## Analyzing Build Output

### Quick Size Analysis

1. Download and extract the build artifacts
2. Open `build-analysis.txt` for a human-readable summary
3. Review the "Top 20 Largest Files" section to identify optimization targets

Example output:
```
📊 Build Size Summary:
Total Files: 245
Total Size: 8.45 MB

📂 Size by File Type:
  .js            5.23 MB      (61.9%) - 180 files
  .css           1.45 MB      (17.2%) - 45 files
  .map           1.12 MB      (13.3%) - 180 files
  ...

🔍 Top 20 Largest Files:
   1. 512.34 KB   ( 6.1%) - static/js/main.a1b2c3d4.chunk.js
   2. 345.67 KB   ( 4.1%) - static/js/2.e5f6g7h8.chunk.js
   ...
```

### Detailed Bundle Analysis

For more detailed analysis, use the `webpack-stats.json` file with visualization tools:

#### Using webpack-bundle-analyzer

```bash
# Install the tool
npm install -g webpack-bundle-analyzer

# Analyze the stats file
webpack-bundle-analyzer path/to/webpack-stats.json
```

This opens an interactive treemap visualization showing:
- Module sizes and dependencies
- Chunk composition
- Duplicate modules across chunks

#### Using webpack-visualizer

1. Visit https://chrisbateman.github.io/webpack-visualizer/
2. Upload your `webpack-stats.json` file
3. Explore the interactive pie chart visualization

#### Using source-map-explorer

```bash
# Install the tool
npm install -g source-map-explorer

# Analyze a specific bundle (requires source maps)
source-map-explorer path/to/build/static/js/main.*.js
```

### Finding and Fixing Build Issues

#### Common Issues and Solutions

**Build Failures:**
1. Check `build.log` for error messages
2. Search for "ERROR" to quickly locate failures
3. Review `npm-install.log` if errors occur during dependency installation

**Bundle Size Too Large:**
1. Review `build-analysis.json` to identify large modules
2. Consider code splitting for large third-party libraries
3. Use dynamic imports for routes and components
4. Enable gzip compression on your web server

**Missing Dependencies:**
1. Check `npm-install.log` for peer dependency warnings
2. Verify all required packages are in `package.json`
3. Review dependency version conflicts

**Webpack Configuration Issues:**
1. Review `build.log` for webpack warnings
2. Check `craco.config.js` for custom webpack configuration
3. Verify all webpack plugins are compatible

## Retention and Storage

### Artifact Retention Policy
- **Default retention:** 90 days
- **Storage limit:** Varies by GitHub plan
- **Automatic cleanup:** GitHub automatically deletes expired artifacts

### Customizing Retention
To change the retention period, modify the workflow file:

```yaml
- name: Upload build logs and stats
  uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # Change this value (1-90 days)
```

## Best Practices

### When to Run Build Analysis

**Run analysis when:**
- ✅ Investigating build failures or warnings
- ✅ Optimizing bundle size
- ✅ Before major releases
- ✅ After adding new dependencies
- ✅ Troubleshooting performance issues

**Skip analysis for:**
- ❌ Every single commit (generates lots of artifacts)
- ❌ Documentation-only changes
- ❌ Minor text updates

### Optimizing Build Performance

1. **Reduce Bundle Size:**
   - Use dynamic imports for large components
   - Enable tree shaking for unused code
   - Consider lighter alternatives for heavy dependencies
   - Use production builds with minification

2. **Improve Build Speed:**
   - Use webpack caching (already configured)
   - Parallelize builds when possible
   - Minimize the number of babel transforms

3. **Monitor Trends:**
   - Compare build statistics over time
   - Set up alerts for significant size increases
   - Track the impact of dependency updates

## Integration with CI/CD

### Triggering from Other Workflows

The build analysis workflow can be called from other workflows:

```yaml
jobs:
  my-job:
    runs-on: ubuntu-latest
    steps:
      # Your build steps here
      
      - name: Trigger build analysis
        if: failure()  # Run only if build fails
        uses: ./.github/workflows/build-analysis.yml
        with:
          branch: ${{ github.ref_name }}
          generate_sourcemaps: true
```

### Automated Monitoring

Set up scheduled builds to monitor bundle size trends:

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday at midnight UTC
```

## Troubleshooting

### Artifact Not Found
- Verify the workflow completed successfully
- Check the workflow run logs for upload errors
- Ensure artifacts haven't expired (90-day retention)

### Large Artifact Size
- Disable source map generation if not needed
- Reduce retention period for old artifacts
- Consider storing only essential logs

### Analysis Script Failures
- Check Node.js version compatibility
- Verify all build dependencies are installed
- Review script output in workflow logs

## Additional Resources

- [GitHub Actions Artifacts Documentation](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Webpack Bundle Analysis](https://webpack.js.org/guides/code-splitting/)
- [Create React App Build Optimization](https://create-react-app.dev/docs/production-build/)
- [Analyzing Bundle Size](https://create-react-app.dev/docs/analyzing-the-bundle-size/)

## Support

For issues with the build analysis workflow:
1. Check the workflow logs in GitHub Actions
2. Review this documentation for common solutions
3. Create an issue with the workflow run URL and error details
4. Include relevant log excerpts from the artifacts

---

**Last Updated:** 2025-01-15  
**Maintained By:** SGEX Workbench Team

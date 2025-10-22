# How to Download Build Artifacts from GitHub Actions

This quick guide shows you how to download build logs and statistics from any GitHub Actions workflow run.

## Steps to Download Artifacts

### 1. Navigate to GitHub Actions

Go to the GitHub repository and click on the **Actions** tab at the top.

URL: `https://github.com/litlfred/sgex/actions`

### 2. Find Your Workflow Run

You can access artifacts from any workflow run:

- **Build Analysis and Logging** - Dedicated build analysis runs
- **Deploy Feature Branch** - Branch deployment workflows  
- **Deploy Landing Page** - Landing page deployments
- Any other workflow that generates build outputs

Click on the specific workflow run you want to analyze.

### 3. Locate the Artifacts Section

Scroll down to the bottom of the workflow run page. You'll find an **Artifacts** section that lists all available artifacts for that run.

### 4. Download the Artifact

Click on the artifact name (e.g., `build-logs-and-stats-2024-01-15_10-30-00_UTC`) to download it as a ZIP file.

### 5. Extract and Analyze

Extract the downloaded ZIP file. Inside you'll find:

```
build-logs-and-stats-2024-01-15_10-30-00_UTC/
├── README.md                    # Guide to using the artifacts
├── build.log                    # Complete build output
├── npm-install.log              # Dependency installation log
├── build-analysis.txt           # Human-readable size analysis
├── build-analysis.json          # Detailed size data (JSON)
├── webpack-stats.json           # Webpack bundle statistics
└── build-metadata.json          # Build environment metadata
```

## Quick Troubleshooting

### Finding Build Errors

```bash
# Search for errors in build log
grep -i "error" build.log

# Search for warnings
grep -i "warning" build.log
```

### Analyzing Bundle Size

```bash
# View human-readable summary
cat build-analysis.txt

# Parse JSON for programmatic analysis
cat build-analysis.json | jq '.largestFiles[:10]'
```

### Using Webpack Stats

```bash
# Install webpack-bundle-analyzer globally
npm install -g webpack-bundle-analyzer

# Analyze the stats file
webpack-bundle-analyzer webpack-stats.json
```

This opens an interactive visualization in your browser showing:
- Module sizes and dependencies
- Chunk composition
- Duplicate modules

## Visual Guide

Here's what the GitHub Actions UI looks like:

```
┌─────────────────────────────────────────────────────┐
│ GitHub Actions > Build Analysis and Logging #123    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ✓ Checkout repository                               │
│ ✓ Setup Node.js                                     │
│ ✓ Install dependencies                              │
│ ✓ Build with webpack stats                          │
│ ✓ Analyze build output                              │
│ ✓ Upload build logs and stats                       │
│                                                      │
├─────────────────────────────────────────────────────┤
│ Artifacts                                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📦 build-logs-and-stats-2024-01-15_10-30-00_UTC │ │
│ │    Size: 25.4 MB                                │ │
│ │    Expires in 90 days                           │ │
│ │    [Download ↓]                                 │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Common Use Cases

### Investigating Build Failures

1. Download the artifacts from the failed workflow run
2. Open `build.log` and search for "ERROR"
3. Review the error context and stack traces
4. Check `npm-install.log` if the error occurs during dependency installation

### Optimizing Bundle Size

1. Download artifacts from a successful build
2. Open `build-analysis.txt` to see largest files
3. Use `webpack-stats.json` with bundle analyzer for visual analysis
4. Identify optimization opportunities (code splitting, lazy loading, etc.)

### Comparing Builds Over Time

1. Download artifacts from different workflow runs
2. Compare `build-analysis.json` files to track size changes
3. Identify which files or modules are growing
4. Monitor the impact of dependency updates

## Retention Policy

- **Retention period:** 90 days (configurable)
- **Storage:** Varies by GitHub plan
- **Cleanup:** Automatic deletion after retention period
- **Access:** Available to anyone with repository access

## Additional Resources

- [Full Build Analysis Guide](BUILD_ANALYSIS.md)
- [GitHub Actions Artifacts Documentation](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Webpack Bundle Analysis](https://webpack.js.org/guides/code-splitting/)

---

**Pro Tip:** Bookmark the Actions tab URL for quick access to workflow runs and artifacts!

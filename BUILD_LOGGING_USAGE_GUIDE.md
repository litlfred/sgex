# Build Logging Usage Guide

## Overview

This guide explains how to use the enhanced build logging system for debugging and analyzing builds in the SGeX Workbench project.

## For CI/CD Users (GitHub Actions)

### Accessing Build Logs from Workflow Runs

After a workflow completes (successfully or with errors), you can download comprehensive build logs:

**Step 1**: Navigate to Actions Tab
```
https://github.com/litlfred/sgex/actions
```

**Step 2**: Select Your Workflow Run
- Click on the specific workflow run you want to inspect
- For example: "Deploy Feature Branch #1234"

**Step 3**: Download Artifacts
- Scroll to the bottom of the workflow run page
- Find the "Artifacts" section
- Download `build-logs-{run-id}.zip`

**Step 4**: Extract and Review
```bash
unzip build-logs-123456.zip
ls -la
# You'll see:
#   build-logs.txt        - Complete timestamped build output
#   webpack-stats.json    - Webpack compilation statistics
#   bundle-report.txt     - Human-readable bundle analysis
```

### Artifact Contents

#### 1. build-logs.txt
Complete build output with timestamps for every line:
```
================================================================================
Build Log - 2025-10-23T14:55:22.388Z
================================================================================

Branch: main
Public URL: /sgex/main/
Command: npm run build

Environment Variables:
  CI=false
  ESLINT_NO_DEV_ERRORS=true
  GENERATE_SOURCEMAP=false
  PUBLIC_URL=/sgex/main/
  ...

================================================================================
Build Output:
================================================================================

[14:55:23.456] > sgex-workbench@1.0.0 build
[14:55:23.457] > npm run configure:repo && craco build
[14:55:24.123] Creating an optimized production build...
...
```

#### 2. webpack-stats.json
Webpack compilation statistics (currently basic, can be enhanced):
```json
{
  "generated_at": "2025-10-23T14:55:22.388Z",
  "note": "Detailed webpack stats require webpack config modifications",
  "build_directory": "build/",
  "tool": "react-scripts with craco"
}
```

#### 3. bundle-report.txt
Human-readable bundle analysis:
```
================================================================================
Webpack Bundle Analysis Report
Generated: 2025-10-23T14:55:22.388Z
================================================================================

=== Build Directory Summary ===
Total Size: 2.4 MB
File Count: 45

=== File Types ===
  .js                   15 files    1.8 MB
  .css                   5 files    400 KB
  .html                  1 files      5 KB
  ...

=== Largest Files (Top 15) ===
   1.    450 KB  static/js/2.chunk.js
   2.    380 KB  static/js/main.chunk.js
   ...

=== JavaScript Bundles ===
Total JS Size: 1.8 MB
JS File Count: 15

=== Recommendations ===
⚠️  Found 3 large JavaScript files (>200 KB)
   Consider:
   - Code splitting for large modules
   - Lazy loading for non-critical components
   ...
```

## For Local Development

### Running Build with Enhanced Logging

You can run the enhanced build script locally to debug build issues:

```bash
# Build for main branch
python3 scripts/build_with_logging.py \
    --public-url "/sgex/main/" \
    --branch-name "main" \
    --artifacts-dir "artifacts"

# Build for feature branch
python3 scripts/build_with_logging.py \
    --public-url "/sgex/feature-xyz/" \
    --branch-name "feature/xyz" \
    --artifacts-dir "artifacts"

# Build with less verbose output
python3 scripts/build_with_logging.py \
    --public-url "/sgex/main/" \
    --branch-name "main" \
    --no-verbose
```

### Analyzing Build Results

After a successful build (either from CI or local), analyze the output:

```bash
# Analyze build directory
python3 scripts/analyze_webpack_stats.py \
    --build-dir build/ \
    --output-file artifacts/bundle-report.txt

# View the report
cat artifacts/bundle-report.txt

# Or analyze webpack stats (if available)
python3 scripts/analyze_webpack_stats.py \
    --stats-file artifacts/webpack-stats.json \
    --build-dir build/ \
    --output-file artifacts/bundle-report.txt
```

## Troubleshooting Build Issues

### Build Fails Without Clear Error

1. **Check the build logs**:
   ```bash
   # Download from GitHub Actions artifacts
   # OR run locally and check
   cat artifacts/build-logs.txt | grep -i error
   ```

2. **Look for the last successful operation**:
   ```bash
   tail -100 artifacts/build-logs.txt
   ```

3. **Check environment variables**:
   ```bash
   grep "Environment Variables" artifacts/build-logs.txt -A 10
   ```

### Large Bundle Size

1. **Generate bundle report**:
   ```bash
   python3 scripts/analyze_webpack_stats.py \
       --build-dir build/ \
       --output-file artifacts/bundle-report.txt
   ```

2. **Review largest files**:
   ```bash
   grep -A 20 "Largest Files" artifacts/bundle-report.txt
   ```

3. **Check JavaScript bundles**:
   ```bash
   grep -A 15 "JavaScript Bundles" artifacts/bundle-report.txt
   ```

4. **Review recommendations**:
   ```bash
   grep -A 20 "Recommendations" artifacts/bundle-report.txt
   ```

### Dependency Issues

1. **Check for dependency errors** in build logs:
   ```bash
   grep -i "dependency\|module not found" artifacts/build-logs.txt
   ```

2. **Verify node_modules** installation:
   ```bash
   grep "npm ci\|npm install" artifacts/build-logs.txt -A 5
   ```

### Environment Variable Problems

1. **Verify environment variables** were set correctly:
   ```bash
   grep "Environment Variables" artifacts/build-logs.txt -A 20
   ```

2. **Check for PUBLIC_URL** issues:
   ```bash
   grep PUBLIC_URL artifacts/build-logs.txt
   ```

## Understanding the Reports

### Bundle Size Guidelines

| Size | Recommendation |
|------|---------------|
| < 200 KB | ✅ Good - Acceptable size |
| 200 KB - 500 KB | ⚠️ Warning - Consider optimization |
| > 500 KB | 🔴 Alert - Requires attention |

### Common Large Dependencies

- `bpmn-js` - BPMN diagram editor (~450 KB)
- `react-dom` - React DOM library (~380 KB)
- `@octokit/rest` - GitHub API client (~150 KB)

### Optimization Strategies

1. **Code Splitting**:
   - Use dynamic `import()` for large components
   - Split routes into separate chunks

2. **Lazy Loading**:
   ```javascript
   const BpmnEditor = React.lazy(() => import('./components/BpmnEditor'));
   ```

3. **Tree Shaking**:
   - Import only what you need: `import { specific } from 'library'`
   - Avoid `import *` patterns

4. **Compression**:
   - Enable gzip/brotli on the server
   - Already configured for GitHub Pages

## Advanced Usage

### Custom Artifact Directory

Store artifacts in a different location:

```bash
python3 scripts/build_with_logging.py \
    --public-url "/sgex/main/" \
    --branch-name "main" \
    --artifacts-dir "/tmp/my-build-artifacts"
```

### Comparing Builds

Compare bundle sizes between branches:

```bash
# Build main branch
python3 scripts/build_with_logging.py \
    --public-url "/sgex/main/" \
    --branch-name "main" \
    --artifacts-dir "artifacts/main"

# Build feature branch
python3 scripts/build_with_logging.py \
    --public-url "/sgex/feature/" \
    --branch-name "feature/xyz" \
    --artifacts-dir "artifacts/feature"

# Compare reports
diff artifacts/main/bundle-report.txt artifacts/feature/bundle-report.txt
```

### Filtering Large Files

Find files larger than a specific size:

```bash
python3 -c "
import json
from pathlib import Path

# Parse bundle report
report = Path('artifacts/bundle-report.txt').read_text()
lines = report.split('\n')

# Find files > 300 KB
print('Files larger than 300 KB:')
for line in lines:
    if 'KB' in line and any(c.isdigit() for c in line):
        parts = line.split()
        if len(parts) >= 2:
            size_str = parts[1]
            if 'KB' in size_str:
                size = float(size_str.replace('KB', ''))
                if size > 300:
                    print(line)
"
```

## Security Notes

### Input Validation

The build scripts validate all inputs to prevent injection attacks:

- ✅ Environment variable names must be in allowlist
- ✅ Values must match safe pattern (alphanumeric, /, -, _, .)
- ✅ No shell metacharacters allowed
- ✅ Path traversal prevention

### Safe Command Execution

- Scripts use `subprocess.Popen` with list arguments (not shell strings)
- No command interpolation or variable substitution in shell
- All variables sanitized before use

### Logging Safety

- Build logs do not contain secrets or tokens
- Environment variables are filtered
- No sensitive data in artifacts

## Getting Help

### Common Issues

**Problem**: `scripts/build_with_logging.py` not found
```bash
# Solution: Ensure you're in the repository root
cd /path/to/sgex
python3 scripts/build_with_logging.py --help
```

**Problem**: Permission denied
```bash
# Solution: Make scripts executable
chmod +x scripts/build_with_logging.py
chmod +x scripts/analyze_webpack_stats.py
```

**Problem**: Module not found
```bash
# Solution: Ensure Python 3 is installed
python3 --version  # Should be 3.7+
```

### Support

- **GitHub Issues**: Report issues at https://github.com/litlfred/sgex/issues
- **PR Comments**: Ask questions in pull request comments
- **Documentation**: See `BUILD_LOGGING_IMPLEMENTATION_PLAN.md` for technical details

## Future Enhancements

Planned improvements:
- [ ] Historical trend analysis (compare builds over time)
- [ ] Automated bundle size alerts in PR comments
- [ ] Integration with monitoring tools
- [ ] Enhanced webpack stats with module-level analysis
- [ ] Bundle visualization (treemap, sunburst charts)
- [ ] Dependency version tracking
- [ ] Build time analysis

---

**Last Updated**: 2025-10-23
**Version**: 1.0
**Status**: Ready for use after approval

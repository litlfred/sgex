# Build Logs and Debugging (README Section)

**Note**: This section is ready to be added to README.md after workflow approval.

---

## 📊 Build Logs and Debugging

### Accessing Build Logs

Build logs and webpack statistics are automatically captured during CI/CD builds and uploaded as workflow artifacts for debugging and analysis.

#### From GitHub Actions

1. Navigate to the [Actions tab](https://github.com/litlfred/sgex/actions)
2. Select the workflow run you want to inspect
3. Scroll to the "Artifacts" section at the bottom
4. Download `build-logs-{run-id}` artifact

#### Artifact Contents

Each artifact contains:
- **build-logs.txt** - Complete build output with timestamps (every line logged)
- **webpack-stats.json** - Webpack compilation statistics  
- **bundle-report.txt** - Human-readable bundle size analysis with recommendations

**Retention**: Artifacts are kept for 90 days on public repositories.

### Local Build with Logging

Generate enhanced build logs locally for debugging:

```bash
# Build with detailed logging
python3 scripts/build_with_logging.py \
  --public-url "/sgex/" \
  --branch-name "main" \
  --artifacts-dir "artifacts"

# Analyze the build
python3 scripts/analyze_webpack_stats.py \
  --build-dir build/ \
  --output-file artifacts/bundle-report.txt

# View results
cat artifacts/bundle-report.txt
```

### Bundle Analysis

The bundle analyzer provides insights into:
- Total build size and file counts
- Breakdown by file type (.js, .css, etc.)
- Largest files and modules
- Optimization recommendations
- Bundle size warnings for files > 200 KB

### Security Features

All build scripts include:
- ✅ Input validation with allowlist
- ✅ Protection against command injection
- ✅ Path traversal prevention
- ✅ Sanitization of all environment variables

### Documentation

- **Quick Reference**: [BUILD_LOGGING_QUICK_REFERENCE.md](BUILD_LOGGING_QUICK_REFERENCE.md)
- **Usage Guide**: [BUILD_LOGGING_USAGE_GUIDE.md](BUILD_LOGGING_USAGE_GUIDE.md)
- **Implementation Details**: [BUILD_LOGGING_IMPLEMENTATION_PLAN.md](BUILD_LOGGING_IMPLEMENTATION_PLAN.md)

---

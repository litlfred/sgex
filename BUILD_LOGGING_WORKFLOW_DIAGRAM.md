# Build Logging Workflow - Visual Overview

## Current Workflow (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  1. Setup Environment                                        │
│     • Checkout code                                          │
│     • Setup Node.js                                          │
│     • npm ci --legacy-peer-deps                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Build Application (BASH)                                 │
│     • Set PUBLIC_URL env var                                 │
│     • Set GITHUB_REF_NAME env var                            │
│     • Run: npm run build                                     │
│     • Standard webpack output only                           │
│     ⚠️ Security Risk: Variable injection possible            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Deploy to GitHub Pages                                   │
│     • Checkout gh-pages branch                               │
│     • Copy build/ to branch directory                        │
│     • Commit and push                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ❌ No Artifacts
                    ❌ No Logs Saved
                    ❌ No Stats Generated
```

## Proposed Enhanced Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  1. Setup Environment                                        │
│     • Checkout code                                          │
│     • Setup Node.js                                          │
│     • npm ci --legacy-peer-deps                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Sanitize Variables (NEW - PYTHON)                        │
│     • Run: scripts/sanitize-workflow-vars.py                 │
│     • Validate variable names (allowlist)                    │
│     • Remove control characters                              │
│     • Limit lengths                                          │
│     • Output: /tmp/sanitized_vars.json                       │
│     ✅ Security: Injection prevention                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Build with Logging (ENHANCED - PYTHON)                   │
│     • Run: scripts/build-with-logging.py                     │
│     • Enable WEBPACK_PROFILE=true                            │
│     • Capture stdout/stderr → artifacts/build.log            │
│     • Record timing → artifacts/build-timing.json            │
│     • Save env snapshot → artifacts/build-env.json           │
│     • Execute: npm run build (with logging)                  │
│     ✅ Comprehensive logging                                 │
│     ✅ Safe subprocess execution                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Collect Build Stats (NEW - PYTHON)                       │
│     • Run: scripts/collect-build-stats.py                    │
│     • Parse webpack stats from build output                  │
│     • Analyze bundle composition                             │
│     • Output: artifacts/webpack-stats.json                   │
│     • Output: artifacts/bundle-analysis.json                 │
│     • Output: artifacts/bundle-summary.txt                   │
│     • Output: artifacts/largest-modules.txt                  │
│     • Display summary in workflow logs                       │
│     ✅ Bundle size analysis                                  │
│     ✅ Optimization insights                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Upload Artifacts (NEW)                                   │
│     • Use: actions/upload-artifact@v4                        │
│     • Name: build-logs-{branch}-{sha}                        │
│     • Path: artifacts/**                                     │
│     • Retention: 90 days                                     │
│     ✅ Logs preserved for troubleshooting                    │
│     ✅ Stats available for analysis                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Deploy to GitHub Pages                                   │
│     • Checkout gh-pages branch                               │
│     • Copy build/ to branch directory                        │
│     • Commit and push                                        │
│     (Unchanged from current workflow)                        │
└─────────────────────────────────────────────────────────────┘
```

## Artifact Contents

```
build-logs-main-abc123def/
├── 📄 build.log                 (Full build output with webpack details)
├── ⏱️  build-timing.json         (Build phase timing metrics)
├── 🔧 build-env.json            (Sanitized environment snapshot)
├── 📊 webpack-stats.json        (Raw webpack statistics - JSON)
├── 📈 bundle-analysis.json      (Parsed bundle information)
├── 📝 bundle-summary.txt        (Human-readable summary)
└── 🎯 largest-modules.txt       (Top 20 largest modules)
```

## Access Flow

```
Developer ──────────────────────────────────────────┐
    │                                                │
    ↓                                                │
┌─────────────────────────────────┐                 │
│  GitHub Actions Run Completed    │                 │
└─────────────────────────────────┘                 │
    │                                                │
    ↓                                                │
┌─────────────────────────────────┐                 │
│  Navigate to Actions Tab         │                 │
└─────────────────────────────────┘                 │
    │                                                │
    ↓                                                │
┌─────────────────────────────────┐                 │
│  Click Specific Workflow Run     │                 │
└─────────────────────────────────┘                 │
    │                                                │
    ↓                                                │
┌─────────────────────────────────┐                 │
│  Scroll to Artifacts Section     │                 │
│  (Bottom of run summary)         │                 │
└─────────────────────────────────┘                 │
    │                                                │
    ↓                                                │
┌─────────────────────────────────┐                 │
│  Download Artifact ZIP           │                 │
│  build-logs-{branch}-{sha}       │                 │
└─────────────────────────────────┘                 │
    │                                                │
    ↓                                                │
┌─────────────────────────────────┐                 │
│  Extract and Analyze Logs        │                 │
│  • Review build.log              │                 │
│  • Check timing metrics          │                 │
│  • Analyze bundle composition    │                 │
│  • Identify optimization targets │                 │
└─────────────────────────────────┘                 │
    │                                                │
    └────────────────────────────────────────────────┘
    (Iterate: Fix issues, re-run workflow)
```

## Security Improvements

### Before (Variable Injection Risk)

```bash
# RISKY: Direct variable interpolation in bash
PUBLIC_URL="${{ steps.public_url.outputs.public_url }}"
npm run build

# If public_url contains: "; rm -rf /"
# Result: Command injection vulnerability
```

### After (Sanitized and Safe)

```python
# SAFE: Python script with proper sanitization
def sanitize_variable(name: str, value: str) -> str:
    # Allowlist validation
    if name not in ALLOWED_NAMES:
        raise ValueError(f"Variable not allowed: {name}")
    
    # Remove control characters
    value = re.sub(r'[\x00-\x1f\x7f]', '', value)
    
    # Limit length
    value = value[:1000]
    
    return value

# SAFE: Subprocess with explicit arguments (no shell)
subprocess.run(
    ['npm', 'run', 'build'],
    env={'PUBLIC_URL': sanitized_value},
    check=True
)
```

## Webpack Stats Configuration

### CRACO Config Enhancement

```javascript
// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Only enable detailed stats when explicitly requested
      if (process.env.WEBPACK_PROFILE === 'true') {
        webpackConfig.stats = {
          all: false,
          assets: true,      // List all assets
          chunks: true,      // Show chunk information
          modules: true,     // Show module details
          timings: true,     // Include timing information
          performance: true, // Show performance hints
          errors: true,      // Show errors
          warnings: true,    // Show warnings
        };
      }
      
      return webpackConfig;
    }
  }
};
```

## Benefits Summary

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Benefits                       │
├─────────────────────────────────────────────────────────────┤
│  ✅ Variable sanitization prevents injection attacks         │
│  ✅ Python subprocess safety (no shell=True)                 │
│  ✅ Allowlist validation for variable names                  │
│  ✅ Length limits and control character removal              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Debugging Benefits                       │
├─────────────────────────────────────────────────────────────┤
│  ✅ Full build logs captured and preserved                   │
│  ✅ File-level webpack output details                        │
│  ✅ Error context and stack traces                           │
│  ✅ 90-day retention for historical analysis                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Optimization Benefits                      │
├─────────────────────────────────────────────────────────────┤
│  ✅ Bundle size analysis and composition                     │
│  ✅ Largest module identification                            │
│  ✅ Chunk dependency tracking                                │
│  ✅ Optimization opportunity detection                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Maintainability Benefits                    │
├─────────────────────────────────────────────────────────────┤
│  ✅ Python scripts easier to test than bash                  │
│  ✅ Clear separation of concerns                             │
│  ✅ Follows existing project patterns                        │
│  ✅ Comprehensive error handling                             │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

```
Phase 1: Python Scripts (No Breaking Changes)
┌──────────────────────────────────────────┐
│  • Create sanitize-workflow-vars.py      │
│  • Create build-with-logging.py          │
│  • Create collect-build-stats.py         │
│  • Test independently                    │
│  ✅ Safe to deploy immediately           │
└──────────────────────────────────────────┘

Phase 2: Configuration (Conditional)
┌──────────────────────────────────────────┐
│  • Update craco.config.js                │
│  • Add WEBPACK_PROFILE condition         │
│  • Test normal builds still work         │
│  ✅ No impact without env var            │
└──────────────────────────────────────────┘

Phase 3: Workflow Integration (Incremental)
┌──────────────────────────────────────────┐
│  • Add sanitization step                 │
│  • Replace build step                    │
│  • Add stats collection                  │
│  • Add artifact upload                   │
│  ✅ Test each step before next           │
└──────────────────────────────────────────┘

Phase 4: Documentation
┌──────────────────────────────────────────┐
│  • Update README.md                      │
│  • Create BUILD_TROUBLESHOOTING.md       │
│  • Add workflow comments                 │
│  ✅ Complete implementation              │
└──────────────────────────────────────────┘
```

## Risk Mitigation

```
╔════════════════════════════════════════════════════════════╗
║                    RISK MITIGATION STRATEGY                 ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  1. Incremental Changes                                     ║
║     → Test each phase independently                         ║
║     → Rollback possible at any step                         ║
║                                                             ║
║  2. Continue-on-error for Non-critical Steps                ║
║     → Stats collection won't break build                    ║
║     → Artifact upload failures don't stop deployment        ║
║                                                             ║
║  3. Backward Compatibility                                  ║
║     → Normal builds work without new features               ║
║     → WEBPACK_PROFILE optional                              ║
║                                                             ║
║  4. Feature Branch Testing                                  ║
║     → Test in this PR before merging                        ║
║     → Monitor first deployments                             ║
║                                                             ║
║  5. Comprehensive Testing                                   ║
║     → Unit test Python scripts                              ║
║     → Integration test workflow                             ║
║     → Manual verification of artifacts                      ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

---

**Status**: 📋 Plan complete - Awaiting approval to implement

**Next**: Review this visual overview alongside the detailed plan documents

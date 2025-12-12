# Copilot Instructions for Build Verification

## Overview

This document provides instructions for GitHub Copilot and other automated agents on how to properly verify builds before making commits to pull requests in the SGeX Workbench repository.

## Mandatory Build Verification

**⚠️ CRITICAL REQUIREMENT**: All automated agents (including GitHub Copilot) **MUST** run build verification before pushing commits or updating pull requests that modify source code, dependencies, or build configuration.

### When to Run Build Verification

Run the build verification script before pushing commits if your changes affect:
- Source code in `src/` directory
- Public assets in `public/` directory  
- Dependencies (`package.json`, `package-lock.json`)
- Build configuration (`craco.config.js`, `.env` files)
- GitHub workflows (`.github/workflows/`)

### How to Run Build Verification

From the repository root directory, execute:

```bash
./scripts/verify-ghpages-build.sh
```

For custom build output directories:

```bash
GH_PAGES_OUTPUT_DIR=public ./scripts/verify-ghpages-build.sh
```

### Build Verification Process

The verification script performs these steps:

1. **Detects build system** (npm, Hugo, MkDocs, Jekyll)
2. **Installs dependencies** (e.g., `npm ci --legacy-peer-deps`)
3. **Runs the build** command (e.g., `npm run build`)
4. **Validates output** (checks for files, index.html, etc.)
5. **Generates logs** in `artifacts/build-verification.log`

### On Success

When build verification passes:

1. ✅ **Add the `[build-verified]` marker** to the PR title or body
2. ✅ **Commit your changes** as planned
3. ✅ **Update the PR status** from `[WIP]` to `[REVIEW]` (if applicable)
4. ✅ **Proceed with pushing** to the branch

Example PR title:
```
[build-verified] Enhance Production Build Workflow with Detailed Logging
```

Or add to PR body:
```markdown
## Build Verification

✅ **Status**: Build verified successfully on [date/time]

The build was tested locally using `./scripts/verify-ghpages-build.sh` and completed without errors.
```

### On Failure

When build verification fails:

1. ❌ **DO NOT commit or push** any changes
2. ❌ **DO NOT update the PR**
3. 📝 **Analyze the build logs** in `artifacts/build-verification.log`
4. 🔧 **Attempt to fix the issue** if it's related to your changes
5. 💬 **Post a comment on the PR** with the failure details

#### Failure Comment Template

```markdown
## ⚠️ Build Verification Failed

The build verification script failed when testing these changes locally.

**Error Summary:**
[Brief description of the error]

**Build Log (last 30 lines):**
```
[Paste last 30 lines from artifacts/build-verification.log]
```

**Full Build Log:**
See `artifacts/build-verification.log` for complete output.

**Next Steps:**
- [ ] Investigate the root cause
- [ ] Fix the build errors
- [ ] Re-run verification
- [ ] Update PR when resolved

@litlfred Would you like me to attempt to fix this build issue, or should I leave the PR as `[WIP]` for manual review?
```

### PR Status Conventions

Use these status markers in PR titles:

- `[WIP]` - Work in progress, build not yet verified
- `[build-verified]` - Build has been verified successfully
- `[REVIEW]` - Ready for maintainer review (implies build-verified)

### Integration with CI/CD

This verification script mirrors the build steps in the GitHub Actions workflow:
- `.github/workflows/branch-deployment.yml` - Production deployment
- Both use the same build commands and environment variables
- CI acts as a safety net and required check

### Automated Agent Responsibilities

As an automated agent (Copilot), you are responsible for:

1. ✅ Running build verification before every code commit
2. ✅ Reporting build failures clearly and promptly
3. ✅ Marking PRs with `[build-verified]` only after successful verification
4. ✅ Keeping PR status accurate (`[WIP]`, `[build-verified]`, `[REVIEW]`)
5. ✅ Not pushing code that breaks the build

### Build Verification Examples

#### Example 1: Successful Verification

```bash
$ ./scripts/verify-ghpages-build.sh
================================================
🔍 GitHub Pages Build Verification
================================================

Repository root: /home/user/sgex
Build output directory: build
Artifacts directory: artifacts

📋 Step 1: Detecting build system...
✅ Found package.json - Node.js project detected
✅ Found 'build' script in package.json

📋 Step 2: Installing dependencies...
ℹ️  Running: npm ci --legacy-peer-deps
✅ Dependencies installed successfully

📋 Step 3: Running build...
ℹ️  Build command: npm run build
ℹ️  Build output will be written to: build
ℹ️  Environment: CI=false, PUBLIC_URL=/sgex/

[... build output ...]

✅ Build completed successfully in 45 seconds

📋 Step 4: Verifying build output...
✅ Build output contains 142 files
✅ Found index.html in build output
ℹ️  Total build size: 3.2M

================================================
✅ Build Verification PASSED
================================================

✅ The GitHub Pages build completed successfully
✅ Build artifacts are ready for deployment
ℹ️  Build verification log: artifacts/build-verification.log
```

#### Example 2: Failed Verification

```bash
$ ./scripts/verify-ghpages-build.sh
================================================
🔍 GitHub Pages Build Verification
================================================

[... setup steps ...]

📋 Step 3: Running build...

[... build output ...]

❌ Build failed after 12 seconds with exit code: 1

ℹ️  Last 30 lines of build output:
Module not found: Can't resolve './InvalidComponent' in '/home/user/sgex/src/pages'

ℹ️  Full build log saved to: artifacts/build-verification.log
```

### Environment Variables

The build script sets these environment variables automatically:

- `CI=false` - Treats warnings as warnings, not errors
- `ESLINT_NO_DEV_ERRORS=true` - Relaxes linting during build
- `GENERATE_SOURCEMAP=false` - Disables source maps for faster builds
- `PUBLIC_URL=/sgex/` - Sets the base URL for GitHub Pages

You can override `PUBLIC_URL` if needed:

```bash
PUBLIC_URL=/sgex/feature-branch/ ./scripts/verify-ghpages-build.sh
```

### Troubleshooting Build Failures

Common build failures and solutions:

#### Missing Dependencies

**Error:** `Module not found: Can't resolve 'package-name'`

**Solution:**
```bash
npm install package-name --legacy-peer-deps
npm run build
```

#### Linting Errors

**Error:** `Parsing error: Unexpected token`

**Solution:** Check ESLint configuration and fix syntax errors in code.

#### Memory Issues

**Error:** `FATAL ERROR: Ineffective mark-compacts near heap limit`

**Solution:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" ./scripts/verify-ghpages-build.sh
```

#### TypeScript Errors

**Error:** `TS2307: Cannot find module '...' or its corresponding type declarations`

**Solution:** Ensure all TypeScript dependencies are installed and types are correct.

### Contact and Support

If you encounter issues with the build verification script:

1. Check `artifacts/build-verification.log` for detailed error messages
2. Review recent changes that might have broken the build
3. Post a comment on your PR with the error details
4. Tag @litlfred for assistance with persistent build failures

### Script Location

- **Verification Script:** `scripts/verify-ghpages-build.sh`
- **Artifacts Directory:** `artifacts/` (created automatically)
- **Build Output:** `build/` (configurable via `GH_PAGES_OUTPUT_DIR`)

### Additional Resources

- **Build Logging Documentation:** `BUILD_LOGGING_USAGE_GUIDE.md`
- **Deployment Workflow:** `.github/workflows/branch-deployment.yml`
- **Troubleshooting Guide:** `TROUBLESHOOTING.md`
- **Contributing Guidelines:** `CONTRIBUTING.md`

---

**Remember:** Build verification is not optional. It's a critical step in ensuring the stability and reliability of the SGeX Workbench application. Always verify builds before pushing code.

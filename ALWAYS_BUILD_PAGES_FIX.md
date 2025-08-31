# Always Build Pages Fix

## Issue #883: Always build pages

### Problem Statement
The user requested that "on any commit to a branch that is not gh-pages the following workflow should run: Deploy Feature Branch as defined in https://github.com/litlfred/sgex/blob/main/.github/workflows/branch-deployment.yml"

### Root Cause
The `branch-deployment.yml` workflow was configured to exclude multiple branches from automatic deployment:
```yaml
push:
  branches-ignore: [gh-pages, deploy, main]
```

This meant that:
- Commits to `main` branch would NOT trigger automatic deployments
- Commits to `deploy` branch would NOT trigger automatic deployments
- Only feature branches (not main, deploy, or gh-pages) would trigger deployments

### Solution
**Minimal Change Applied:**
Changed line 31 in `.github/workflows/branch-deployment.yml` from:
```yaml
branches-ignore: [gh-pages, deploy, main]
```
to:
```yaml
branches-ignore: [gh-pages]
```

### Expected Behavior After Fix
Now the workflow will trigger on ANY branch push except `gh-pages`:
- ✅ **Main branch**: Commits to main will trigger automatic deployment
- ✅ **Deploy branch**: Commits to deploy will trigger automatic deployment  
- ✅ **Feature branches**: All feature branches continue to trigger deployment
- ❌ **gh-pages branch**: Still excluded to prevent infinite deployment loops

### Why This is the Correct Fix
1. **Meets Requirements**: The issue specifically asked for deployment "on any commit to a branch that is not gh-pages"
2. **Surgical Change**: Only one line changed, minimal risk of side effects
3. **Maintains Safety**: Still excludes gh-pages to prevent deployment loops
4. **Preserves Functionality**: All existing path filters and PR triggers remain intact

### Files Changed
- `.github/workflows/branch-deployment.yml` - Updated push trigger to only exclude gh-pages
- `src/tests/AlwaysBuildPagesWorkflow.test.js` - Added comprehensive test coverage

### Testing
✅ All new tests pass
✅ YAML syntax validation passes  
✅ Build process still works
✅ No side effects detected

### Impact
This change ensures that the deployment workflow will always run when code is pushed to any branch except gh-pages, exactly as requested in issue #883.
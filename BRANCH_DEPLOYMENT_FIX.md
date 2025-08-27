# Deploy Feature Branch Fix

## Issue #782: Branch preview deployments not starting

### Problem

Branch preview deployments were not starting when commits were pushed to feature branches in pull requests. Users expected to see deployment feedback and preview URLs in PR comments, but no deployment workflows were being triggered.

### Root Cause

The `branch-deployment.yml` workflow was configured to only trigger on pushes to the `main` branch:

```yaml
on:
  push:
    branches: [main]  # ❌ Only triggered on main branch
    branches-ignore: [gh-pages, deploy]
```

This meant that when developers pushed commits to feature branches (which is the typical workflow for PRs), no deployment was triggered, so there were no preview deployments or PR feedback.

### Solution

Removed the `branches: [main]` restriction from the push trigger to allow deployment on all branch pushes:

```yaml
on:
  push:
    branches-ignore: [gh-pages, deploy]  # ✅ Triggers on all branches except excluded ones
```

### Expected Behavior After Fix

When a commit is pushed to any feature branch with an open PR:

1. ✅ `branch-deployment.yml` triggers and builds the preview
2. ✅ `pr-commit-feedback.yml` triggers and provides PR feedback
3. ✅ PR gets immediate "build in progress" comment
4. ✅ PR gets updated with deployment success/failure status
5. ✅ PR includes clickable links to preview URLs and build logs

### Workflow Coordination

The fix maintains proper coordination between workflows:

- **Feature branches**: Both `branch-deployment.yml` and `pr-commit-feedback.yml` trigger
- **Main branch**: Only `branch-deployment.yml` triggers (feedback workflow excludes main)
- **Excluded branches**: Neither workflow triggers (`gh-pages`, `deploy`)

### Testing

Added comprehensive tests in `src/tests/BranchDeploymentWorkflowTriggers.test.js` to verify:

- ✅ Workflow triggers on all branches except excluded ones
- ✅ PR feedback workflow coordination works correctly
- ✅ YAML configuration is syntactically valid
- ✅ Integration logic works as expected

### Related Issues

This fix addresses the deployment automation issues mentioned in:
- #769: Surgical improvements to publishing workflows
- #642: PR conversation feedback deployment preview buttons
- #640: Improve PR deployment feedback
- #636: Improve PR feedback on commits

### Files Changed

- `.github/workflows/branch-deployment.yml` - Removed branch restriction
- `src/tests/BranchDeploymentWorkflowTriggers.test.js` - Added test coverage

### Impact

This is a minimal, surgical change that fixes the core issue without affecting existing functionality. The fix enables the comprehensive PR feedback system that was already implemented but not triggering due to the incorrect workflow configuration.
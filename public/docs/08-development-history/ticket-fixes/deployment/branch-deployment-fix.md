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
2. ✅ **PR gets immediate "build started" notification** (posted at workflow start)
3. ✅ `pr-commit-feedback.yml` triggers and provides PR feedback
4. ✅ PR gets updated with deployment success/failure status
5. ✅ PR includes clickable links to preview URLs and build logs

### Workflow Coordination

The fix maintains proper coordination between workflows:

- **Feature branches**: Both `branch-deployment.yml` and `pr-commit-feedback.yml` trigger
- **Main branch**: Only `branch-deployment.yml` triggers (feedback workflow excludes main)
- **Excluded branches**: Neither workflow triggers (`gh-pages`, `deploy`)

### Testing

Added comprehensive tests to verify the deployment workflow:

**Branch Deployment Triggers** (`src/tests/BranchDeploymentWorkflowTriggers.test.js`):
- ✅ Workflow triggers on all branches except excluded ones
- ✅ PR feedback workflow coordination works correctly
- ✅ YAML configuration is syntactically valid
- ✅ Integration logic works as expected

**Build Start Notification** (`src/tests/BuildStartNotification.test.js`):
- ✅ Build start notification step exists in workflow
- ✅ Notification is positioned immediately after checkout
- ✅ Notification comes before all build/test/deploy steps
- ✅ Uses correct GitHub Script action
- ✅ Handles errors gracefully without failing workflow
- ✅ Message includes commit SHA with clickable link
- ✅ Finds and posts to associated PR correctly
- ✅ Workflow has proper permissions for PR comments

### Build Started Notification Enhancement

As part of improving developer feedback, the `branch-deployment.yml` workflow now posts an immediate notification to PRs when the build starts. This provides instant visibility into the deployment process.

**Notification Format:**
```
Build started for commit [`abc1234`](https://github.com/litlfred/sgex/commit/full-sha)
```

**Key Features:**
- Posted immediately after repository checkout, before any build steps
- Includes shortened commit SHA (7 characters) for readability
- Links directly to the full commit on GitHub
- Gracefully handles cases where no PR exists (e.g., direct pushes)
- Does not fail the workflow if posting fails

**Implementation:**
- New step: "Post build started notification to PR"
- Position: Immediately after "Checkout repository" step
- Uses: `actions/github-script@v8` for GitHub API interaction
- Error handling: Try-catch block to prevent workflow failures

### Related Issues

This fix addresses the deployment automation issues mentioned in:
- #769: Surgical improvements to publishing workflows
- #642: PR conversation feedback deployment preview buttons
- #640: Improve PR deployment feedback
- #636: Improve PR feedback on commits
- **Build start notification**: Move PR build start notification to earliest possible point

### Files Changed

**Workflow Files:**
- `.github/workflows/branch-deployment.yml` 
  - Removed branch restriction to enable feature branch deployments
  - Added "Post build started notification to PR" step at workflow start

**Test Files:**
- `src/tests/BranchDeploymentWorkflowTriggers.test.js` - Test workflow triggers and configuration
- `src/tests/BuildStartNotification.test.js` - Test build start notification functionality

### Impact

This is a minimal, surgical change that fixes the core issue without affecting existing functionality. The fix enables the comprehensive PR feedback system that was already implemented but not triggering due to the incorrect workflow configuration.
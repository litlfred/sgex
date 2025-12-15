# Test Case: Simulated Workflow Failure Notification

This document shows what a workflow failure notification would look like when posted to a PR.

## Scenario
- Workflow: "Deploy Feature Branch" 
- Branch: `feature/new-component`
- PR: #123
- Failure: Build step failed due to TypeScript errors

## Expected PR Comment

---

❌ **PR Workflow Failure Notification**

- [Repo Cabinet (Source)](https://github.com/litlfred/sgex)
- [Workflow Run](https://github.com/litlfred/sgex/actions/runs/987654321)
- [Workflow Definition](https://github.com/litlfred/sgex/blob/main/.github/workflows/branch-deployment.yml)

### Workflow Chain:
- **Workflow**: Deploy Feature Branch ([YAML](https://github.com/litlfred/sgex/blob/main/.github/workflows/branch-deployment.yml))
    ↳ **Triggered by**: copilot
    ↳ **Event**: push

### Failure Details:
- **Branch**: `feature/new-component`
- **Commit**: `a1b2c3d`
- **Failed at**: 2025-09-02 18:45:12 UTC

### Failed Jobs:
- **deploy-branch**: failure
  - Failed steps: Build React application, Setup Node.js

### 🔧 Next Steps:
1. **Check Logs**: Click the [Workflow Run](https://github.com/litlfred/sgex/actions/runs/987654321) link above to view detailed error logs
2. **Review Code**: Check the failed commit for syntax errors, build issues, or test failures
3. **Fix Issues**: Address the errors shown in the logs
4. **Retry**: Push new commits or manually rerun the workflow

### 🔄 Quick Actions:
- 📄 [View detailed logs](https://github.com/litlfred/sgex/actions/runs/987654321)
- 🔄 [Rerun workflow](https://github.com/litlfred/sgex/actions/workflows/deploy-feature-branch.yml)
- 📝 [View workflow file](https://github.com/litlfred/sgex/blob/main/.github/workflows/branch-deployment.yml)

---
💡 *This is an automated notification for workflow failures. Fix the issues above and the next workflow run should succeed.*

---

## Benefits

This notification provides:

1. **Immediate Awareness**: Contributors know instantly when their changes break the build
2. **Comprehensive Context**: All relevant links and information in one place
3. **Actionable Guidance**: Clear next steps to resolve the issue
4. **Workflow Transparency**: Understanding of what failed and why
5. **Quick Resolution**: Direct links to logs and retry mechanisms

## Testing

To test this system:

1. Create a PR with intentionally failing code (e.g., syntax error)
2. Push the changes to trigger a workflow
3. Wait for the workflow to fail
4. Check that the failure notification appears on the PR
5. Verify all links work correctly
6. Fix the issue and confirm the workflow succeeds on retry

The system will automatically detect the failure and post this type of rich, informative comment.
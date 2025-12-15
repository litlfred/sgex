# PR Workflow Failure Notification System

This document describes the implementation of the PR workflow failure notification system as requested in issue #926.

## Overview

The PR Workflow Failure Notification System automatically detects when GitHub Actions workflows fail and posts rich, informative comments on associated Pull Requests. This provides immediate feedback to contributors about workflow failures without requiring manual intervention.

## Implementation

### Workflow File: `.github/workflows/pr-workflow-failure-notifier.yml`

The system is implemented as a single centralized workflow that uses the `workflow_run` trigger to monitor all specified workflows for failures.

### Monitored Workflows

The system monitors the following workflows for failures:
- **Deploy Feature Branch** (`branch-deployment.yml`)
- **Deploy Landing Page** (`landing-page-deployment.yml`) 
- **PR Commit Feedback** (`pr-commit-feedback.yml`)
- **PR Review Deployment** (`review.yml`)
- **Code Quality Checks** (`code-quality.yml`)

### Trigger Mechanism

```yaml
on:
  workflow_run:
    workflows: [
      "Deploy Feature Branch",
      "Deploy Landing Page", 
      "PR Commit Feedback",
      "PR Review Deployment",
      "Code Quality Checks"
    ]
    types:
      - completed
```

The workflow triggers when any of the monitored workflows complete, then checks if the conclusion was 'failure'.

## Features

### Rich PR Comments

When a workflow fails, the system posts a comprehensive comment including:

1. **Repository Links**
   - Link to repository ("Cabinet")
   - Link to the specific workflow run (for logs)
   - Link to the workflow YAML definition file

2. **Workflow Chain Information**
   - Which workflow failed
   - Who/what triggered the workflow
   - Event type that triggered the workflow

3. **Failure Details**
   - Branch name
   - Commit SHA (shortened)
   - Timestamp of failure
   - Failed job details with step information

4. **Actionable Guidance**
   - Next steps to resolve the issue
   - Quick action links for logs and rerunning workflows
   - Direct links to workflow files for debugging

### Example Comment

```markdown
❌ **PR Workflow Failure Notification**

- [Repo Cabinet (Source)](https://github.com/litlfred/sgex)
- [Workflow Run](https://github.com/litlfred/sgex/actions/runs/123456)
- [Workflow Definition](https://github.com/litlfred/sgex/blob/main/.github/workflows/branch-deployment.yml)

### Workflow Chain:
- **Workflow**: Deploy Feature Branch ([YAML](https://github.com/litlfred/sgex/blob/main/.github/workflows/branch-deployment.yml))
    ↳ **Triggered by**: copilot
    ↳ **Event**: push

### Failure Details:
- **Branch**: `feature/test-branch`
- **Commit**: `abc123d`
- **Failed at**: 2025-09-02 18:30:43 UTC

### Failed Jobs:
- **test-job**: failure
  - Failed steps: build, test

### 🔧 Next Steps:
1. **Check Logs**: Click the [Workflow Run](https://github.com/litlfred/sgex/actions/runs/123456) link above to view detailed error logs
2. **Review Code**: Check the failed commit for syntax errors, build issues, or test failures
3. **Fix Issues**: Address the errors shown in the logs
4. **Retry**: Push new commits or manually rerun the workflow

### 🔄 Quick Actions:
- 📄 [View detailed logs](https://github.com/litlfred/sgex/actions/runs/123456)
- 🔄 [Rerun workflow](https://github.com/litlfred/sgex/actions/workflows/deploy-feature-branch.yml)
- 📝 [View workflow file](https://github.com/litlfred/sgex/blob/main/.github/workflows/branch-deployment.yml)

---
💡 *This is an automated notification for workflow failures. Fix the issues above and the next workflow run should succeed.*
```

## Requirements Fulfilled

✅ **Minimal Intrusion**: Single new workflow file, no modifications to existing workflows
✅ **Centralized Failure Detection**: Uses `workflow_run` trigger to monitor all workflows from one place
✅ **Rich PR Comments**: Includes all requested information (repo link, workflow run, YAML definition, chain info, error details)
✅ **Workflow Chain Awareness**: Shows triggering actor and event information
✅ **GitHub Pages Deployment Support**: Monitors both branch and landing page deployment workflows
✅ **No Per-Workflow Customization**: Works automatically with all monitored workflows
✅ **Maintainability**: Single file with clear structure and robust error handling

## Technical Details

### Permissions Required

```yaml
permissions:
  contents: read          # Read repository content
  pull-requests: write    # Comment on PRs
  actions: read          # Read workflow run details
```

### Error Handling

- Gracefully handles missing PR associations
- Continues operation if log fetching fails
- Avoids duplicate comments by checking for existing notifications
- Updates existing comments rather than creating duplicates

### Workflow Name Mapping

The system includes a mapping from workflow names to file names for accurate YAML links:

```javascript
const workflowNameMap = {
  'Deploy Feature Branch': 'branch-deployment.yml',
  'Deploy Landing Page': 'landing-page-deployment.yml',
  'PR Commit Feedback': 'pr-commit-feedback.yml', 
  'PR Review Deployment': 'review.yml',
  'Code Quality Checks': 'code-quality.yml'
};
```

## Testing

The implementation includes comprehensive testing:

1. **Logic Testing**: Validates comment generation and workflow detection
2. **Configuration Testing**: Ensures workflow names match actual workflow files
3. **YAML Validation**: Confirms workflow syntax is valid

## Future Enhancements

The system is designed to be easily extensible:

- **Add New Workflows**: Simply add the workflow name to the `workflows` array
- **Enhanced Error Details**: Can be expanded to include more detailed job/step information
- **Custom Templates**: Comment template can be customized per workflow type
- **Notification Channels**: Could be extended to support Slack, email, or other notification methods

## Maintenance

- **Workflow Name Changes**: Update the `workflows` array and `workflowNameMap` if workflow names change
- **New Workflows**: Add new workflow names to the monitoring list
- **Comment Format**: Modify the comment template in the `commentBody` generation section
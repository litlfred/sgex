# GitHub Actions Workflow Interaction for PR Deployment Status

This document describes how the PR deployment status comment system works across multiple GitHub Actions workflows.

## Overview

When a PR is created or updated in the sgex repository, potentially two workflows run to build and deploy the branch preview:

1. **deploy-branch workflow** (`branch-deployment.yml`): Builds the React application and deploys it to the gh-pages branch
2. **pages-build-deployment workflow** (GitHub native): GitHub's built-in workflow that builds the static site from the gh-pages branch content

Each workflow maintains its own status comment on the PR to provide real-time feedback throughout the deployment process.

## Comment Management System

### Single Comment Per Workflow Run

The `scripts/manage-pr-comment.py` Python script ensures exactly one comment per workflow run by using an **action ID** as a unique identifier:

- Each workflow run passes its own `action_id` when calling the script
- The script embeds this ID in an HTML comment marker: `<!-- sgex-deployment-status-comment:ACTION_ID -->`
- When updating, the script finds the comment with the matching marker
- This prevents duplicate comments and ensures clean, organized PR feedback

### Action ID Sources

Different workflows use different action IDs:

| Workflow | Action ID Source | Example Value |
|----------|-----------------|---------------|
| deploy-branch | `${{ github.run_id }}` | `12345678` |
| pages-build-deployment | `${{ github.event.deployment.id }}` | `dep_abc123` |
| workflow_dispatch (manual) | `${{ github.run_id }}` | `87654321` |

## Workflow Stages

### deploy-branch Workflow Stages

The `branch-deployment.yml` workflow updates its comment at these stages:

1. **started** - Build initiated (immediately after checkout)
2. **setup** - Dependencies installed and environment ready
3. **building** - React application being compiled
4. **deploying** - Pushing built files to gh-pages branch
5. **verifying** - Checking if deployment is accessible
6. **success** - Deployment complete and verified
7. **failure** - Build or deployment failed

### pages-build-deployment Workflow Stage

GitHub's native Pages workflow can update the comment at:

- **pages-built** - Static site built from gh-pages content

## Usage Examples

### From deploy-branch Workflow

```yaml
- name: Update PR comment - Build Started
  if: steps.find_pr.outputs.result != ''
  continue-on-error: true
  run: |
    python3 scripts/manage-pr-comment.py \
      --token "${{ secrets.GITHUB_TOKEN }}" \
      --repo "${{ github.repository }}" \
      --pr "${{ steps.find_pr.outputs.result }}" \
      --action-id "${{ github.run_id }}" \
      --stage "started" \
      --data '{"commit_sha":"...","branch_name":"...","commit_url":"...","workflow_url":"..."}'
```

### From pages-build-deployment Workflow (if implemented)

```yaml
- name: Update PR comment - Pages Built
  run: |
    python3 scripts/manage-pr-comment.py \
      --token "${{ secrets.GITHUB_TOKEN }}" \
      --repo "${{ github.repository }}" \
      --pr "${{ steps.find_pr.outputs.result }}" \
      --action-id "${{ github.event.deployment.id }}" \
      --stage "pages-built" \
      --data '{"commit_sha":"...","branch_name":"...","commit_url":"...","workflow_url":"...","branch_url":"..."}'
```

## Manual Workflow Dispatch

The system works seamlessly with manual workflow triggers:

1. **From PR "Approve workflows to run"**: 
   - GitHub automatically sets `github.run_id`
   - PR number detected from branch name
   - Comment updates normally

2. **From GitHub Actions UI (workflow_dispatch)**:
   - User provides branch name as input
   - Script finds associated PR from branch
   - Uses `github.run_id` as action ID
   - Creates/updates comment for that specific run

## Comment Lifecycle

### Example Flow

1. Developer pushes to `feature/new-widget` branch with open PR #123
2. deploy-branch workflow starts (run_id: 11111)
   - Comment created: `<!-- sgex-deployment-status-comment:11111 -->`
   - Status: "Build Started"
3. Workflow progresses through stages, updating the SAME comment:
   - "Setting Up Environment"
   - "Building Application"
   - "Deploying to GitHub Pages"
   - "Verifying Deployment"
4. Workflow completes
   - Final status: "Successfully Deployed ✅"
5. GitHub pages-build-deployment runs (deployment_id: dep_22222)
   - NEW comment created: `<!-- sgex-deployment-status-comment:dep_22222 -->`
   - Status: "GitHub Pages Built"

Result: PR #123 has TWO comments:
- One from deploy-branch (tracking build/deploy)
- One from pages-build-deployment (tracking Pages build)

## Benefits

### For Developers
- **Real-time visibility**: See deployment progress without checking Actions tab
- **Clear status**: Each stage clearly labeled with emoji and timestamp
- **Quick actions**: Direct links to logs, preview URLs, and retry options
- **Organized feedback**: One comment per workflow, no clutter

### For Repository Maintainers
- **Content injection protection**: All inputs sanitized to prevent attacks
- **Reliable tracking**: Action IDs ensure no duplicate or lost comments
- **Flexible**: Works with both automatic and manual workflow triggers
- **Extensible**: Easy to add new stages or workflows

## Security

The Python script includes multiple security measures:

- **Stage validation**: Only allowed stage names accepted
- **Input sanitization**: All user content (commit SHA, branch names) sanitized
- **URL validation**: Only HTTPS GitHub URLs allowed
- **Length limits**: All inputs have maximum length constraints
- **Control character removal**: Prevents injection attacks
- **Action ID sanitization**: Only alphanumeric characters and hyphens/underscores allowed

## Troubleshooting

### Comment Not Updating

**Cause**: Script can't find existing comment
**Solution**: Check that `--action-id` is consistent across all update calls in the same workflow run

### Multiple Comments for Same Workflow

**Cause**: Action ID changed between updates
**Solution**: Ensure `--action-id` uses same source (e.g., always `github.run_id`) throughout the workflow

### No Comment Created

**Causes**:
1. No PR found for branch
2. Script failed (check logs)
3. Permission issues

**Solutions**:
1. Ensure branch has an open PR
2. Check workflow logs for Python script output
3. Verify workflow has `pull-requests: write` permission

## Future Enhancements

Potential improvements to the system:

1. Add more granular stages (e.g., "Running Tests", "Linting Code")
2. Include build artifacts information (size, changes)
3. Add estimated completion time based on historical data
4. Support multiple deployment targets (staging, production)
5. Add rollback capabilities with one-click buttons

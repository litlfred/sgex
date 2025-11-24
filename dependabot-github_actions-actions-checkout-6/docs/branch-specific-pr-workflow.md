# Branch-Specific Pull Request Workflow

This document outlines the process for creating pull requests that target branches other than `main`, particularly for fixing issues in deployment branches or feature branches.

## Overview

The SGeX project uses a multi-branch deployment strategy where different branches serve different purposes:

- **`main`**: Primary development branch
- **`deploy`**: Landing page deployment branch for GitHub Pages
- **Feature branches**: Active development branches for new features
- **Release branches**: Stable release candidates

When issues arise in these non-main branches, we need a structured approach to create targeted fixes without affecting the main development workflow.

## Branch Naming Convention

### Pattern
```
copilot-TAG-ISSNO-N-description
```

**Components:**
- **TAG**: Either `fix` (for bug fixes) or `feature` (for new functionality)
- **ISSNO**: GitHub issue number (e.g., 122, 607)
- **N**: Iteration number starting with 0 (increment for retry attempts)
- **description**: Short 6-word max summary using lowercase alphanumeric and dashes only

**Rules:**
- Branch names are stable once created (unless explicitly requested to change)
- Only lowercase letters, numbers, and dashes allowed
- No leading, trailing, or consecutive dashes

### Determining TAG Type
- **fix**: Bug reports, error corrections, broken functionality, security issues, performance problems
- **feature**: New functionality requests, enhancements, new components, feature additions

### Examples
| Issue Type | Issue Number | Iteration | Branch Name |
|------------|--------------|-----------|-------------|
| Bug fix | 607 | First attempt (0) | `copilot-fix-607-0-eslint-deploy-branch-errors` |
| Feature request | 123 | First attempt (0) | `copilot-feature-123-0-new-branch-selector-ui` |
| Bug fix retry | 456 | Second attempt (1) | `copilot-fix-456-1-github-api-rate-limiting` |
| Security fix | 789 | First attempt (0) | `copilot-fix-789-0-token-storage-vulnerability` |

## Workflow Process

### 1. Issue Identification
- **Issue exists**: Reference the existing GitHub issue number
- **No issue**: Create a new issue describing the problem specific to the target branch
- **Branch context**: Clearly identify which branch has the problem

### 2. Branch Creation
```bash
# Fetch latest changes
git fetch origin

# Create feature branch using new naming convention
# Pattern: copilot-TAG-ISSNO-N-description
git checkout -b copilot-fix-607-0-eslint-deploy-branch-errors origin/deploy

# For feature requests:
git checkout -b copilot-feature-123-0-new-branch-selector-ui origin/main

# For retry attempts (increment N):
git checkout -b copilot-fix-456-1-github-api-rate-limiting origin/main
```

**Branch Name Guidelines:**
- Determine TAG: `fix` for bugs, `feature` for new functionality
- Use actual issue number for ISSNO
- Start with N=0 for first attempt, increment for retries
- Create descriptive 6-word summary using only lowercase, numbers, and dashes
- Ensure no leading, trailing, or consecutive dashes

### 3. Making Changes
- **Minimal scope**: Address only the specific issue mentioned
- **Preserve functionality**: Don't remove working features unless they're the source of the issue
- **Test thoroughly**: Ensure the fix doesn't break existing functionality
- **Document changes**: Clear commit messages explaining the fix

### 4. Pull Request Creation
- **Branch name**: Use the new naming convention `copilot-TAG-ISSNO-N-description`
- **Target**: Set the base branch to the intended target (not main)  
- **Title**: Include the issue number and brief description
- **Description**: Include:
  - Problem description
  - Solution implemented
  - Testing performed
  - Files changed and why

### 5. Example PR Template

```markdown
# Fix ESLint errors in deploy branch - Fixes #607

**Branch**: `copilot-fix-607-0-eslint-deploy-branch-errors`

## Problem
The deploy branch fails to build due to ESLint errors in `src/components/BranchListing.js`:
- `loadCommentsForPRs` function is declared but never used
- This prevents the landing page deployment from completing

## Solution
- Removed unused `loadCommentsForPRs` function and related code
- Preserved all functional comment features
- Ensured deploy branch builds successfully with CI=true

## Files Changed
- `src/components/BranchListing.js`: Removed 15 lines of unused code

## Testing
- [x] Deploy branch builds successfully locally
- [x] All comment functionality still works
- [x] ESLint passes with no errors
```

## Required Permissions

### For Copilot Agents
To create branch-specific PRs, the GitHub Personal Access Token needs:

#### Fine-grained Tokens
- **Contents**: Read and Write
- **Metadata**: Read
- **Pull Requests**: Read and Write
- **Actions**: Read (for viewing workflow status)

#### Classic Tokens
- **repo**: Full control of private repositories
- **workflow**: Update GitHub Action workflows (if needed)

### For PR Merge Operations
To merge pull requests using the Preview Badge merge functionality:

#### Repository Access Level Required
The authenticated user must have one of these GitHub repository permission levels:
- **write**: Can push to the repository and manage issues/PRs
- **maintain**: Can manage the repository without access to destructive actions  
- **admin**: Full access to the repository

#### Common Permission Issues
1. **"Triage" permission level**: Can manage issues/PRs but CANNOT merge
2. **Token scope insufficient**: Classic PATs need `repo` scope; fine-grained PATs need Contents (Write) + Pull requests (Write)
3. **Branch protection rules**: Repository may require status checks or reviews before allowing merge
4. **Organization restrictions**: Some organizations restrict merge permissions regardless of repository access

### For Repository Settings
Ensure the repository allows:
- Creating branches from any base branch
- PRs targeting any branch (not just main)
- Workflow runs on all branches

## Automation Opportunities

### GitHub Actions Integration
Consider creating a workflow that:
1. **Detects branch-specific issues** in issue comments or labels
2. **Automatically creates** the appropriately named feature branch
3. **Sets up PR template** with correct target branch
4. **Triggers relevant CI/CD** for the target branch

### Example Workflow Trigger
```yaml
name: Create Branch-Specific Fix Branch
on:
  issue_comment:
    types: [created]
  issues:
    types: [labeled]

jobs:
  create-fix-branch:
    if: contains(github.event.comment.body, '@copilot') && contains(github.event.comment.body, 'branch:')
    # ... workflow implementation
```

## Best Practices

### Code Changes
1. **Surgical fixes**: Change only what's necessary to fix the specific issue
2. **Preserve context**: Don't refactor unrelated code
3. **Maintain compatibility**: Ensure changes work with the target branch's codebase
4. **Test thoroughly**: Validate fix in the context of the target branch

### Documentation
1. **Clear commit messages**: Explain what was changed and why
2. **PR descriptions**: Include context about why this branch needed a separate fix
3. **Issue updates**: Comment on the original issue with the PR link
4. **Post-merge**: Document any permanent differences between branches

### Communication
1. **Notify stakeholders**: Tag relevant team members in the PR
2. **Explain urgency**: If this is a hotfix, explain the impact
3. **Coordinate merging**: Discuss if/when changes should be merged to other branches

## Common Scenarios

### Deploy Branch ESLint Fixes
- **Problem**: CI=true causes strict ESLint enforcement
- **Solution**: Remove unused variables/functions while preserving functionality
- **Example**: Remove `loadCommentsForPRs` if it's never called

### Feature Branch Conflicts
- **Problem**: Feature branch has become outdated or has breaking changes
- **Solution**: Create targeted fix that works with the feature branch's current state
- **Consideration**: May need separate fix for main branch later

### Emergency Hotfixes
- **Problem**: Production issue needs immediate fix
- **Solution**: Create fix branch from deploy/production branch
- **Follow-up**: Plan to merge fix to main branch when appropriate

## Integration with Existing Workflows

### Landing Page Deployment
The `landing-page-deployment.yml` workflow already supports deploying from different source branches:
- Default: Uses `deploy` branch
- Override: Can specify different source branch via workflow_dispatch

### Branch Deployment
The `branch-deployment.yml` workflow can deploy any branch for preview purposes.

## Future Enhancements

### Workflow Improvements
1. **Automated branch detection**: Detect which branch needs fixing from issue labels
2. **Cross-branch synchronization**: Tools to help merge fixes between branches
3. **Branch health monitoring**: Regular checks for branch-specific issues

### Documentation Automation
1. **Auto-generated changelogs**: Track what fixes were applied to which branches
2. **Branch difference reports**: Document known differences between branches
3. **Merge planning**: Tools to help plan when/how to sync fixes across branches

---

This workflow ensures that fixes can be applied to any branch while maintaining code quality and clear documentation of what changes were made where.
# GitHub Environments Setup for Deployment Approval

This document describes how to set up GitHub environments with protection rules to ensure that page deployments require approval before proceeding.

## Required Environments

### 1. production-pages

This environment is used for:
- Landing page deployments (`landing-page-deployment.yml`)
- Manual main branch deployments (`branch-deployment.yml`)

**Setup Instructions:**

1. Go to repository Settings → Environments
2. Click "New environment"
3. Name: `production-pages`
4. Configure protection rules:
   - ✅ **Required reviewers**: Add repository maintainers/owners
   - ✅ **Wait timer**: 0 minutes (immediate approval required)
   - ✅ **Deployment branches**: No restriction
5. Environment URL: `https://litlfred.github.io/sgex/`

### 2. branch-preview

This environment is used for:
- Automatic branch preview deployments
- Manual feature branch deployments

**Setup Instructions:**

1. Go to repository Settings → Environments
2. Click "New environment"
3. Name: `branch-preview`
4. Configure protection rules:
   - ⚠️ **Required reviewers**: None (automatic approval for feature branches)
   - ✅ **Wait timer**: 0 minutes
   - ✅ **Deployment branches**: No restriction

## Environment Protection Rules

### production-pages Environment
```yaml
Protection Rules:
  - Required reviewers: 1+ repository administrators
  - Prevent self-review: true
  - Wait timer: 0 minutes
  - Allowed branches: No restriction (controlled by workflow triggers)
```

### branch-preview Environment
```yaml
Protection Rules:
  - Required reviewers: None (automatic)
  - Wait timer: 0 minutes
  - Allowed branches: No restriction
```

## How Approval Works

### Landing Page Deployments
1. User triggers "Deploy Landing Page" workflow manually
2. Workflow waits for approval in `production-pages` environment
3. Repository administrator must approve the deployment
4. After approval, deployment proceeds automatically

### Branch Deployments
- **Automatic branch pushes**: Use `branch-preview` environment (no approval required)
- **Manual main branch**: Use `production-pages` environment (approval required)
- **Manual feature branches**: Use `branch-preview` environment (no approval required)

## Setting Up Environments via GitHub CLI

Alternatively, you can set up environments using the GitHub CLI:

```bash
# Create production-pages environment
gh api repos/:owner/:repo/environments/production-pages \
  --method PUT \
  --field wait_timer=0 \
  --field prevent_self_review=true \
  --field reviewers='[{"type":"User","id":USER_ID}]'

# Create branch-preview environment  
gh api repos/:owner/:repo/environments/branch-preview \
  --method PUT \
  --field wait_timer=0
```

## Verification

After setting up the environments:

1. **Test landing page deployment**: 
   - Go to Actions → "Deploy Landing Page"
   - Click "Run workflow"
   - Verify that deployment waits for approval
   - Approve the deployment and verify it proceeds

2. **Test branch deployment**:
   - Push to a feature branch
   - Verify deployment proceeds automatically (branch-preview)
   - Manually trigger main branch deployment
   - Verify it requires approval (production-pages)

## Troubleshooting

### Environment Not Found Error
If you see "Environment protection rules not met" or "Environment not found":
1. Verify the environment names match exactly: `production-pages` and `branch-preview`
2. Check that the environments are created in the repository settings
3. Ensure the required reviewers are properly configured

### Approval Not Required
If deployments proceed without approval when they should require it:
1. Check that protection rules are enabled on the environment
2. Verify required reviewers are configured
3. Ensure the workflow is using the correct environment name

### Self-Approval Issues
If the same user who triggered the workflow is approving:
1. Enable "Prevent self-review" in environment protection rules
2. Add additional reviewers to ensure external approval

## References

- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Environment Protection Rules](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-protection-rules)
- [GitHub CLI Environments](https://cli.github.com/manual/gh_api)
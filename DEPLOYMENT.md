# Deployment Workflows

This repository uses two consolidated GitHub Actions workflows for deployment to GitHub Pages.

## 🚀 Branch Deployment (`branch-deployment.yml`)

**Purpose**: Deploy feature branches to subdirectories for preview purposes.

### Triggers
- **Manual only** (`workflow_dispatch`)
- Requires approval via GitHub environment protection

### Inputs
- `branch`: Branch to deploy (defaults to current branch)
- `force_deployment`: Force deployment even if no changes detected

### Behavior
- Deploys to `https://litlfred.github.io/sgex/{branch-name}/`
- Main branch deploys to `https://litlfred.github.io/sgex/main/`
- Branch names with slashes are converted to dashes (e.g., `feature/xyz` → `feature-xyz`)
- **Never affects the root landing page**
- Preserves all other branch deployments
- Comments on associated PRs with preview URLs

### Safety Features
- Extensive path validation to prevent directory traversal
- Cannot deploy to repository root
- Validates branch names for safety
- Requires manual approval

## 🏠 Landing Page Deployment (`landing-page-deployment.yml`)

**Purpose**: Deploy the main application to the root of GitHub Pages.

### Triggers
- **Manual only** (`workflow_dispatch`)
- Requires approval via GitHub environment protection

### Inputs
- `source_branch`: Branch to deploy from (defaults to `main`)
- `force_deployment`: Force deployment even if no changes detected

### Behavior
- Deploys to `https://litlfred.github.io/sgex/`
- **Never affects branch subdirectories**
- Preserves all existing branch deployments
- Only updates root-level files

### Safety Features
- Only removes specific root-level files
- Never removes directories (preserves all branch deployments)
- Requires manual approval

## 🔒 Security & Approval Process

### Manual Deployment
Both main workflows are manually triggered (`workflow_dispatch`) and require user confirmation:
1. Navigate to Actions tab
2. Select the appropriate workflow
3. Click "Run workflow" and confirm parameters
4. Workflows will execute immediately upon confirmation

### PR Review Deployment
The `review.yml` workflow automatically triggers when a PR is approved:
1. When a PR receives an approved review, the workflow runs automatically
2. It posts a comment with a deployment link for eligible branches
3. Branches `gh-pages` and `deploy` are excluded from review-triggered deployments
4. The actual deployment still requires manual confirmation via the deployment link

**Note**: Environment protection was removed to resolve deployment issues while maintaining manual trigger control.

## 📋 Workflow Files

### Active Workflows
- `branch-deployment.yml` - Branch previews deployment (manual trigger + workflow_call)
- `landing-page-deployment.yml` - Landing page deployment (manual trigger)
- `review.yml` - PR review-triggered deployment suggestions (automatic on approval)
- `framework-compliance.yml` - Compliance checks (automatic on PR)

### Removed Workflows
The following workflows were consolidated and removed:
- `deploy-branch-selector.yml` - Replaced by `landing-page-deployment.yml`
- `landing-page-deploy.yml` - Replaced by `landing-page-deployment.yml`
- `pages.yml` - Replaced by `branch-deployment.yml`

## 🧪 Testing & Validation

Both workflows include:
- Build validation
- Path safety checks
- Commit verification
- Rollback capabilities

## 📝 Usage Examples

### Deploy a feature branch for preview:
**Option 1: From an approved PR**
1. Get your PR approved by a reviewer
2. The system will automatically post a deployment comment with a direct link
3. Click the deployment link in the comment
4. Click "Run workflow" and confirm

**Option 2: Manual deployment**
1. Go to Actions → "Deploy Feature Branch"
2. Click "Run workflow"
3. Enter branch name (or leave empty for current branch)
4. Wait for deployment

### Update the landing page:
1. Go to Actions → "Deploy Landing Page"  
2. Click "Run workflow"
3. Choose source branch (defaults to main)
4. Wait for approval and deployment

## 🎯 Benefits

- **Clear separation of concerns**: Branch previews vs. landing page
- **Safety first**: Extensive validation prevents accidents
- **Manual control**: All deployments require explicit approval
- **Preserves work**: No deployment affects other deployments
- **Simple interface**: Easy-to-use workflow inputs
- **Comprehensive feedback**: PR comments and deployment summaries
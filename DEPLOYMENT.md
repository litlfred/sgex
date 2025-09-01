# Deployment Workflows

This repository uses two consolidated GitHub Actions workflows for deployment to GitHub Pages.

## 🚀 Branch Deployment (`branch-deployment.yml`)

**Purpose**: Deploy feature branches to subdirectories for preview purposes.

📄 **Workflow File**: [`.github/workflows/branch-deployment.yml`](.github/workflows/branch-deployment.yml)

### Triggers
- **Manual trigger** (`workflow_dispatch`) - Primary method for controlled deployments
- **Automatic push trigger** - On push to any branch (excludes only gh-pages)
- **Automatic PR trigger** - On PR events (opened, synchronize, reopened) targeting main
- **Workflow call** - Can be triggered by other workflows

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
- Automatic deployment for all branches except gh-pages, manual control for special environments

## 🏠 Landing Page Deployment (`landing-page-deployment.yml`)

**Purpose**: Deploy the main application to the root of GitHub Pages.

📄 **Workflow File**: [`.github/workflows/landing-page-deployment.yml`](.github/workflows/landing-page-deployment.yml)

### Triggers
- **Manual only** (`workflow_dispatch`) - Prevents accidental overwrites of production landing page

### Inputs
- `force_deployment`: Force deployment even if no changes detected
- `clean_old_assets`: Aggressively clean old assets from gh-pages

### Behavior
- Deploys to `https://litlfred.github.io/sgex/`
- **Never affects branch subdirectories**
- Preserves all existing branch deployments
- Only updates root-level files

### Safety Features
- Only removes specific root-level files
- Never removes directories (preserves all branch deployments)
- Manual trigger only prevents accidental production updates

## 🔒 Manual & Automatic Deployment

### Approval Workflow
All page deployments now use GitHub environments with protection rules to ensure proper approval:

- **production-pages Environment**: Used for landing page and main branch deployments
  - ✅ Requires approval from repository administrators
  - ⏳ Deployment pauses until approved
  - 🛡️ Prevents accidental production updates

- **branch-preview Environment**: Used for feature branch previews
  - 🚀 Automatic deployment for development workflows  
  - 🏗️ No approval required for branch previews
  - ⚡ Fast iteration for development teams

### Manual Deployment Access
Both workflows can be manually triggered from the GitHub Actions UI:

1. **Access Workflows**: Go to the repository's "Actions" tab
2. **Select Workflow**: Choose "Deploy Feature Branch" or "Deploy Landing Page from Main"
3. **Run Workflow**: Click "Run workflow" and configure parameters
4. **Approval Process**: 
   - **Landing Page deployments**: Require approval from repository administrators via the `production-pages` environment
   - **Main branch deployments**: Require approval via the `production-pages` environment
   - **Feature branch deployments**: Proceed automatically via the `branch-preview` environment
5. **Monitor Progress**: View real-time logs and deployment status

⚠️ **Environment Setup Required**: Before deployments can work with approval, GitHub environments must be configured. See [Environment Setup Guide](.github/ENVIRONMENT_SETUP.md) for detailed instructions.

### Automatic Deployment (Feature Branches)
The branch deployment workflow automatically triggers when:
- **Push events**: Commits are pushed to any branch (excludes only gh-pages)
- **Pull request events**: PR creation, updates, or reopening (for PRs targeting main)
- **Copilot commits**: Both direct pushes and PR updates from copilot agents
- **External PRs**: Pull requests from external contributors and forks
- **Code changes**: Changes to relevant paths (src/, public/, package files, workflows)

### PR Integration
When commits are pushed to PRs, the system provides:
- Real-time deployment status updates in PR comments
- Direct links to manual workflow triggers with pre-filled parameters
- Build progress monitoring and log access
- Quick action buttons for redeployment and troubleshooting

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
- Build validation with TypeScript type checking
- JSON schema generation and validation
- Path safety checks
- Commit verification
- Rollback capabilities

### TypeScript Integration

The deployment process now includes TypeScript-specific steps:

#### Type Checking
All deployments perform TypeScript type checking before building:
```yaml
- name: Type Check
  run: npm run type-check
```

#### Schema Generation
JSON schemas are automatically generated from TypeScript types during the build process:
```yaml
- name: Generate Schemas
  run: npm run generate-schemas
```

This ensures that:
- Type definitions are validated before deployment
- JSON schemas are always up-to-date with TypeScript types
- Runtime validation schemas are available in the deployed application

#### Build Process
The updated build process includes:
1. Install dependencies
2. TypeScript type checking
3. JSON schema generation from TypeScript types
4. React application build
5. Deployment artifact creation

Generated schemas are published to `public/docs/schemas/` and include:
- `generated-schemas-tjs.json` - Schemas from typescript-json-schema
- `generated-schemas-tsjsg.json` - Schemas from ts-json-schema-generator
- Individual type schemas for runtime validation

### Build Failure Handling

If TypeScript type checking fails:
- The deployment stops immediately
- Error messages show specific type errors
- No artifacts are deployed
- The team is notified of type issues

This ensures that only type-safe code reaches production environments.

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
4. **Wait for approval** - The deployment will pause and require approval from a repository administrator
5. **Approve the deployment** - A repository administrator must approve the deployment in the `production-pages` environment
6. Deployment proceeds automatically after approval

## 🎯 Benefits

- **Clear separation of concerns**: Branch previews vs. landing page
- **Safety first**: Extensive validation prevents accidents
- **Manual control**: All deployments require explicit approval
- **Preserves work**: No deployment affects other deployments
- **Simple interface**: Easy-to-use workflow inputs
- **Comprehensive feedback**: PR comments and deployment summaries

## 🔧 Supporting Workflows

The following additional workflows provide build quality, security, and feedback automation:

### PR Quality & Feedback Workflows
- **PR Commit Feedback**: [`.github/workflows/pr-commit-feedback.yml`](.github/workflows/pr-commit-feedback.yml) - Provides real-time feedback on PR commits and deployment status
- **Review Deployment**: [`.github/workflows/review.yml`](.github/workflows/review.yml) - Automates deployment options when PRs are approved

### Code Quality & Compliance Workflows  
- **Framework Compliance Check**: [`.github/workflows/framework-compliance.yml`](.github/workflows/framework-compliance.yml) - Validates page framework standards and TypeScript compliance
- **Dependency Security Check**: [`.github/workflows/dependency-security.yml`](.github/workflows/dependency-security.yml) - Scans for security vulnerabilities in dependencies

### Workflow Configuration Details
All workflows include:
- ✅ **Explicit fail-fast settings** on critical build steps (`continue-on-error: false`)
- 🚫 **Branch filtering** to exclude `gh-pages` and `deploy` branches
- 🔄 **Consistent triggers** on both `push` and `pull_request` events where appropriate
- 💬 **PR feedback** with detailed status updates and action buttons

## 🛠️ MCP Services

The SGEX Workbench includes Model Context Protocol (MCP) services that run separately from the main web application.

### DAK FAQ MCP Service

**Location**: `services/dak-faq-mcp/`
**Purpose**: Provides REST API access to DAK information and FAQ questions

#### Local Development
```bash
cd services/dak-faq-mcp
npm install
npm start
```
**Service URL**: `http://127.0.0.1:3001/mcp`

#### Available Endpoints
- `GET /mcp/health` - Service health check
- `GET /mcp/faq/questions/catalog` - Available FAQ questions
- `POST /mcp/faq/questions/execute` - Execute FAQ questions
- `GET /mcp/faq/valuesets` - DAK value sets
- `GET /mcp/faq/decision-tables` - DAK decision tables
- `GET /mcp/faq/business-processes` - DAK business processes  
- `GET /mcp/faq/personas` - DAK personas/actors
- `GET /mcp/faq/questionnaires` - DAK questionnaires

#### Security
- **Local binding only**: Service binds to `127.0.0.1:3001` for security
- **No external access**: Not exposed in production deployments
- **Development use**: Intended for local development and testing

#### Documentation
Complete MCP services documentation: [`public/docs/mcp/`](public/docs/mcp/)

#### Deployment Considerations
- MCP services are **not** deployed to GitHub Pages
- Services run locally for development and testing
- Production deployments may require separate hosting for MCP services
- Services follow WHO SMART Guidelines compliance standards
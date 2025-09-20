# SGEX MCP Server Deployment on Fly.io

This guide covers deploying the SGEX MCP service to Fly.io with GitHub OAuth authentication and collaborator-based authorization.

## Overview

The SGEX MCP service provides a REST API for accessing DAK (Digital Adaptation Kit) components and FAQ questions. When deployed to Fly.io, it includes:

- **Public HTTPS endpoint** via Fly.io
- **GitHub OAuth authentication** for user identification
- **Collaborator authorization** - only collaborators on `litlfred/sgex` can access protected endpoints
- **No persistent database** - authorization is checked dynamically via GitHub API

## Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io/) 
2. **flyctl CLI**: Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/)
3. **GitHub OAuth App**: Create a GitHub OAuth application
4. **GitHub Token**: Personal access token with `read:org` permissions

## GitHub OAuth Setup

### 1. Create GitHub OAuth Application

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - **Application name**: `SGEX MCP Server (Dev)`
   - **Homepage URL**: `https://your-app-name.fly.dev`
   - **Authorization callback URL**: `https://your-app-name.fly.dev/auth/github/callback`
4. Save the **Client ID** and **Client Secret**

### 2. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with scopes:
   - `read:org` (to check organization membership)
   - `read:user` (to get user information)
3. Save the token securely

## Deployment Steps

You can deploy the SGEX MCP service using either **manual deployment** or **automated GitHub Actions deployment**.

### Option A: GitHub Actions Deployment (Recommended)

GitHub Actions provides automated, secure deployment to the **development environment** with proper secret management.

#### 1. Set up Repository Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions, and add the following secrets:

**Required secrets:**
- `FLY_API_TOKEN` - Your Fly.io API token (get from `fly auth token`)
- `GITHUB_CLIENT_ID_DEV` - GitHub OAuth Client ID for development environment
- `GITHUB_CLIENT_SECRET_DEV` - GitHub OAuth Client Secret for development environment  
- `GITHUB_TOKEN_DEV` - GitHub API token for development environment

#### 2. Deploy via GitHub Actions

**Automatic Deployment:**
- Push changes to `main` branch → Automatically deploys to dev environment (`sgex-mcp-dev`)
- Merge PR to `main` → Automatically deploys to dev environment

**Manual Deployment:**
1. Go to your repository → Actions tab
2. Select "Deploy MCP Server to Fly.io (Dev)" workflow
3. Click "Run workflow"
4. Optionally specify a branch (defaults to current branch)
5. Click "Run workflow"

**Command Line Trigger:**
```bash
# Deploy current branch to dev environment
gh workflow run mcp-deployment.yml

# Deploy specific branch to dev environment
gh workflow run mcp-deployment.yml -f branch=feature-branch
```

#### 3. Monitor Deployment

- View deployment progress in the Actions tab
- Deployment summary shows app URL: `https://sgex-mcp-dev.fly.dev`
- Automatic health checks verify successful deployment

### Option B: Manual Deployment

For one-time deployments or local testing, you can deploy manually.

#### 1. Navigate to MCP Service Directory

```bash
cd services/dak-faq-mcp
```

#### 2. Initialize Fly.io Application

```bash
# Login to Fly.io
fly auth login

# Launch the application (uses existing fly.toml)
fly launch

# Follow prompts:
# - Choose app name (e.g., sgex-mcp-dev)
# - Select region (default: iad)
# - Don't deploy yet - we need to set secrets first
```

#### 3. Set Environment Secrets

```bash
# Set GitHub OAuth credentials
fly secrets set GITHUB_CLIENT_ID=your_github_client_id_here
fly secrets set GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Set GitHub API token for collaborator checking
fly secrets set GITHUB_TOKEN=your_github_token_here

# Optional: Set custom CORS origin
fly secrets set CORS_ORIGIN=https://litlfred.github.io
```

#### 4. Deploy the Application

```bash
# Deploy to Fly.io
fly deploy

# Check deployment status
fly status

# View logs
fly logs
```

#### 5. Verify Deployment

```bash
# Test health endpoint
curl https://your-app-name.fly.dev/health

# Test authentication info
curl https://your-app-name.fly.dev/
```

## GitHub Actions Setup Guide

### 1. **Fly.io API Token Setup**

```bash
# Get your Fly.io API token
fly auth token

# Copy the token and add it to GitHub repository secrets as FLY_API_TOKEN
```

### 2. **GitHub OAuth Application Setup**

Create a GitHub OAuth application for the development environment:

**Development Environment:**
1. GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. Application details:
   - **Name**: `SGEX MCP Server (Development)`
   - **Homepage URL**: `https://sgex-mcp-dev.fly.dev`
   - **Callback URL**: `https://sgex-mcp-dev.fly.dev/auth/github/callback`
3. Save **Client ID** as `GITHUB_CLIENT_ID_DEV` in repository secrets
4. Save **Client Secret** as `GITHUB_CLIENT_SECRET_DEV` in repository secrets

### 3. **GitHub API Token Setup**

```bash
# Create GitHub Personal Access Token with scopes:
# - read:org (check organization membership)
# - read:user (get user information)

# Add to repository secrets as GITHUB_TOKEN_DEV
```

### 4. **Repository Secrets Summary**

Add these secrets in GitHub repository Settings → Secrets and variables → Actions:

| Secret Name | Description | Required |
|-------------|-------------|-----------|
| `FLY_API_TOKEN` | Fly.io API token for deployment | ✅ Required |
| `GITHUB_CLIENT_ID_DEV` | OAuth Client ID for dev environment | ✅ Required |
| `GITHUB_CLIENT_SECRET_DEV` | OAuth Client Secret for dev environment | ✅ Required |
| `GITHUB_TOKEN_DEV` | GitHub API token for dev environment | ✅ Required |

### 5. **First Deployment**

After setting up secrets, trigger the first deployment:

```bash
# Via GitHub CLI
gh workflow run mcp-deployment.yml

# Or via GitHub UI: Actions → Deploy MCP Server to Fly.io (Dev) → Run workflow
```

The service will be deployed to: `https://sgex-mcp-dev.fly.dev`

The included GitHub Actions workflow (`.github/workflows/mcp-deployment.yml`) provides:

### 🔒 **Security Benefits**
- **Repository secrets management** - No local credential storage
- **Environment-specific secrets** - Separate OAuth apps for dev/staging/prod
- **Automatic secret injection** - Secure deployment without manual intervention
- **Audit trail** - All deployments logged in GitHub Actions

### 🚀 **Automation Features**
- **Automatic deployment** on push to main branch
- **PR merge deployment** when PRs are merged to main
- **Manual deployment** via GitHub UI or CLI
- **Multi-environment support** (dev/staging/production)
- **Health checks** and deployment verification
- **Deployment rollback** via Fly.io auto-rollback

### 📊 **Monitoring & Feedback**
- **Deployment summaries** in GitHub Actions interface
- **Health check validation** post-deployment
- **Automatic status reporting** in PR comments
- **Deployment URLs** and management commands in summary

### 🛠 **Environment Management**
- **Dev environment** - Automatic deployment from main branch
- **Staging environment** - Manual deployment for testing
- **Production environment** - Manual deployment with approval
- **Branch-specific deployment** - Deploy any branch to any environment

### 🔄 **CI/CD Pipeline Integration**
- **Build validation** before deployment
- **Test execution** (when tests are available)
- **Dependency caching** for faster builds
- **Error handling** and cleanup on failure

## GitHub Actions vs Manual Deployment
|---------|---------------|---------|
| **Security** | ✅ Repository secrets | ⚠️ Local credentials |
| **Automation** | ✅ Automatic on push/PR | ❌ Manual process |
| **Environments** | ✅ Dev/Staging/Prod | ⚠️ Single environment |
| **Rollback** | ✅ Built-in via Fly.io | ⚠️ Manual process |
| **CI/CD Integration** | ✅ Full pipeline | ❌ None |
| **Team Collaboration** | ✅ Centralized | ⚠️ Individual setup |
| **Audit Trail** | ✅ GitHub Actions logs | ⚠️ Local only |

## Configuration Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | Set to `production` in fly.toml |
| `PORT` | No | Server port (default: 8080) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth client secret |
| `GITHUB_TOKEN` | Yes | GitHub token for API access |
| `CORS_ORIGIN` | No | CORS origin (default: https://litlfred.github.io) |

### Fly.io Configuration (`fly.toml`)

```toml
app = "sgex-mcp-dev"
primary_region = "iad"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[vm]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

## API Endpoints

### Public Endpoints (No Authentication)

- `GET /health` - Health check
- `GET /` - API information and endpoint list

### Authentication Endpoints

- `GET /auth/github` - Initiate GitHub OAuth flow
- `POST /auth/github/callback` - Complete OAuth flow  
- `GET /auth/status` - Check authentication status
- `POST /auth/logout` - Logout

### Protected Endpoints (Require Authentication)

All FAQ endpoints require GitHub OAuth authentication and collaborator access to `litlfred/sgex`:

- `GET /faq/questions/catalog` - List FAQ questions
- `POST /faq/questions/execute` - Execute FAQ questions
- `GET /faq/valuesets` - List DAK value sets
- `GET /faq/decision-tables` - List DAK decision tables
- `GET /faq/business-processes` - List DAK business processes
- `GET /faq/personas` - List DAK personas
- `GET /faq/questionnaires` - List DAK questionnaires

Legacy endpoints with `/mcp` prefix are also supported.

## Authentication Flow

### 1. Client Authentication

```bash
# Get OAuth URL
curl https://your-app-name.fly.dev/auth/github

# Response includes:
# - auth_url: GitHub OAuth URL
# - session_id: Session identifier
```

### 2. GitHub OAuth

1. Redirect user to `auth_url`
2. User authorizes on GitHub
3. GitHub redirects to callback with authorization code

### 3. Complete Authentication

```bash
curl -X POST https://your-app-name.fly.dev/auth/github/callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "github_auth_code",
    "state": "oauth_state",
    "session_id": "session_from_step_1"
  }'
```

### 4. Access Protected Endpoints

```bash
# Use session_id in headers
curl -H "x-session-id: session_from_auth" \
  https://your-app-name.fly.dev/faq/questions/catalog

# Or use GitHub token directly
curl -H "Authorization: Bearer github_token" \
  https://your-app-name.fly.dev/faq/questions/catalog
```

## Authorization

The service checks if authenticated users are collaborators on the `litlfred/sgex` repository using the GitHub API endpoint:

```
GET /repos/litlfred/sgex/collaborators/{username}
```

- **HTTP 204**: User is a collaborator (authorized)
- **HTTP 404**: User is not a collaborator (denied)

## Security Features

1. **HTTPS only** - Enforced by Fly.io
2. **OAuth state verification** - Prevents CSRF attacks
3. **Collaborator authorization** - Dynamic GitHub API checks
4. **Secrets management** - Via Fly.io secrets (not in source code)
5. **Rate limiting** - Fly.io provides basic DDoS protection
6. **Non-root container** - Runs as user `app` (UID 1001)

## Monitoring & Maintenance

### View Logs

```bash
fly logs

# Follow logs in real-time
fly logs -f
```

### Scale Resources

```bash
# Scale to 2 instances
fly scale count 2

# Scale memory to 512MB
fly scale memory 512
```

### Update Deployment

```bash
# Deploy updates
fly deploy

# Check status
fly status
```

### Health Checks

Fly.io automatically monitors:
- HTTP health check: `GET /health` every 10 seconds
- TCP check: Port 8080 connectivity every 15 seconds

## Development vs Production

### Development Mode
- Binds to `127.0.0.1` (localhost only)
- Bypasses OAuth if not configured
- Allows access for testing

### Production Mode  
- Binds to `0.0.0.0` (public access)
- Requires OAuth configuration
- Enforces collaborator authorization

## Troubleshooting

### Common Issues

1. **OAuth not configured**
   ```bash
   # Check secrets are set
   fly secrets list
   ```

2. **Authorization failures**
   - Verify user is a collaborator on `litlfred/sgex`
   - Check GitHub token has `read:org` permissions

3. **Health check failures**
   ```bash
   # Check application logs
   fly logs

   # Test health endpoint
   curl https://your-app-name.fly.dev/health
   ```

4. **Build failures**
   ```bash
   # Test build locally
   npm run build
   
   # Test Dockerfile locally
   docker build -t sgex-mcp .
   docker run -p 8080:8080 sgex-mcp
   ```

### Support Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub API Documentation](https://docs.github.com/en/rest)

## Cost Estimation

Fly.io free tier includes:
- Up to 3 shared CPU VMs
- 256MB RAM per VM
- 160GB outbound transfer per month

The current configuration (1 shared CPU, 256MB RAM) fits within the free tier for development use.

## Next Steps

1. **Custom Domain**: Configure custom domain in Fly.io dashboard
2. **Rate Limiting**: Add application-level rate limiting if needed
3. **Metrics**: Set up monitoring and alerting
4. **Staging Environment**: Create separate staging deployment
5. **CI/CD**: Automate deployments via GitHub Actions

---

**Note**: This deployment provides a public development environment. For production use, consider additional security measures, monitoring, and scaling configurations.
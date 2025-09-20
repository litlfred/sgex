# GitHub Actions Deployment for SGEX MCP Server

This document explains how to deploy the SGEX MCP server to Fly.io using GitHub Actions for secure, automated deployments.

## Overview

The GitHub Actions workflow provides:
- **Automated deployment** on push/PR merge to main
- **Manual deployment** to multiple environments
- **Secure secret management** via GitHub repository secrets
- **Multi-environment support** (dev/staging/production)
- **Health checks** and deployment verification

## Quick Setup

1. **Add Fly.io API token** to repository secrets as `FLY_API_TOKEN`
2. **Create GitHub OAuth apps** for each environment
3. **Add OAuth secrets** to repository (see DEPLOYMENT.md for details)
4. **Deploy via Actions tab** or automatic on code changes

## Security Benefits

✅ **No local credentials** - All secrets managed in GitHub
✅ **Environment separation** - Different OAuth apps per environment  
✅ **Audit trail** - All deployments logged
✅ **Automated rollback** - Via Fly.io auto-rollback feature

## Deployment Triggers

- **Automatic**: Push to main → Deploy to dev environment
- **Manual**: GitHub UI → Choose environment and branch
- **PR Merge**: Merged PR → Deploy to dev environment

## Workflow File

The workflow is defined in `.github/workflows/mcp-deployment.yml` and includes:
- Build validation
- Environment-specific configuration
- Secure secret injection
- Health check verification
- Deployment status reporting

For complete setup instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
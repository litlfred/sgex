# GitHub Actions Deployment for SGEX MCP Server (Development)

This document explains how to deploy the SGEX MCP server to Fly.io using GitHub Actions for secure, automated deployment to the **development environment**.

## Overview

The GitHub Actions workflow provides:
- **Automated deployment** to development environment (`sgex-mcp-dev.fly.dev`)
- **Manual deployment** for testing branches
- **Secure secret management** via GitHub repository secrets
- **Development-focused workflow** - simplified single environment
- **Health checks** and deployment verification

## Quick Setup

1. **Add Fly.io API token** to repository secrets as `FLY_API_TOKEN`
2. **Create GitHub OAuth app** for development environment
3. **Add dev OAuth secrets** to repository (see DEPLOYMENT.md for details)
4. **Deploy via Actions tab** or automatic on code changes to main

> 📋 **Secret Management**: For detailed information about secret generation, permissions, and security practices, see [`SECRET_MANAGEMENT.md`](./SECRET_MANAGEMENT.md).

## Security Benefits

✅ **No local credentials** - All secrets managed in GitHub
✅ **Development environment** - Single OAuth app for dev environment  
✅ **Audit trail** - All deployments logged
✅ **Automated rollback** - Via Fly.io auto-rollback feature

## Deployment Triggers

- **Automatic**: Push to main → Deploy to `sgex-mcp-dev.fly.dev`
- **Manual**: GitHub UI → Deploy current or specific branch to dev
- **PR Merge**: Merged PR → Deploy to dev environment

## Development Environment

- **App Name**: `sgex-mcp-dev` (fixed)
- **URL**: `https://sgex-mcp-dev.fly.dev`
- **Purpose**: Development and testing
- **OAuth App**: Development-specific GitHub OAuth application

## Workflow File

The workflow is defined in `.github/workflows/mcp-deployment.yml` and includes:
- Build validation for development environment
- Development-specific configuration
- Secure secret injection for dev OAuth app
- Health check verification
- Development deployment status reporting

For complete setup instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
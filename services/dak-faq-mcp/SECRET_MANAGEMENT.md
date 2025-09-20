# SGEX MCP Server Secret Management Guide

This document provides a detailed explanation of how secrets are generated, stored, shared, and the permissions required for the SGEX MCP server deployment.

## Overview

The SGEX MCP server deployment requires 4 types of secrets for secure operation:
1. **Fly.io API Token** - For deployment to Fly.io platform
2. **GitHub OAuth Client ID/Secret** - For user authentication
3. **GitHub API Token** - For collaborator authorization checks

## Secret Categories and Generation

### 1. Fly.io API Token (`FLY_API_TOKEN`)

**Purpose**: Allows GitHub Actions to deploy and manage the MCP service on Fly.io

**Generation Process**:
```bash
# Install flyctl if not already installed
curl -L https://fly.io/install.sh | sh

# Login to Fly.io
fly auth login

# Generate API token
fly auth token
```

**Permissions**: 
- Full access to deploy, scale, and manage applications
- Access to set secrets on Fly.io applications
- Read/write access to Fly.io organization resources

**Storage**: GitHub repository secrets as `FLY_API_TOKEN`

**Security Considerations**:
- ⚠️ **High Privilege**: This token has full access to your Fly.io account
- 🔒 **Secure Storage**: Must be stored in GitHub repository secrets, never in code
- ⏰ **Rotation**: Consider rotating periodically for security
- 🏢 **Scope**: Limited to specific Fly.io organization if configured

### 2. GitHub OAuth Application (`GITHUB_CLIENT_ID_DEV`, `GITHUB_CLIENT_SECRET_DEV`)

**Purpose**: Enables users to authenticate via GitHub OAuth for MCP service access

**Generation Process**:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Configure application:
   - **Application name**: `SGEX MCP Server (Development)`
   - **Homepage URL**: `https://sgex-mcp-dev.fly.dev`
   - **Authorization callback URL**: `https://sgex-mcp-dev.fly.dev/auth/github/callback`
4. Save and note the **Client ID** and **Client Secret**

**Permissions**:
- **OAuth Scopes**: `read:user` (to get user information)
- **No special GitHub permissions required** for the OAuth app itself
- **App Access**: Public (anyone can initiate OAuth, but authorization is controlled separately)

**Storage**: 
- GitHub repository secrets as `GITHUB_CLIENT_ID_DEV` and `GITHUB_CLIENT_SECRET_DEV`

**Security Considerations**:
- 🔒 **Client Secret Security**: Must be kept secret, stored in GitHub repository secrets
- 🌐 **Callback URL**: Must match exactly with deployed service URL
- 👥 **User Consent**: Users see OAuth authorization prompt with app name and permissions
- 🔄 **OAuth Flow**: Uses standard OAuth 2.0 authorization code flow

### 3. GitHub API Token (`GITHUB_TOKEN_DEV`)

**Purpose**: Allows the MCP service to check if authenticated users are collaborators on `litlfred/sgex`

**Generation Process**:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Configure token:
   - **Note**: `SGEX MCP Server - Collaborator Checks`
   - **Expiration**: 90 days (or as per security policy)
   - **Scopes**: 
     - ✅ `read:user` - Get user information
     - ✅ `read:org` - Check organization membership and collaborator status

**Permissions Required**:
- **Repository Access**: Read access to `litlfred/sgex` (public repo, so automatic)
- **Organization Access**: Read access to check collaborator status
- **API Endpoints Used**:
  - `GET /repos/litlfred/sgex/collaborators/{username}` - Check collaborator status
  - `GET /user` - Get authenticated user information

**Storage**: GitHub repository secrets as `GITHUB_TOKEN_DEV`

**Security Considerations**:
- 🎯 **Minimal Permissions**: Only `read:user` and `read:org` scopes
- ⏰ **Token Expiration**: Set appropriate expiration (90 days recommended)
- 🔒 **Secure Storage**: Stored in GitHub repository secrets
- 🏢 **Organization Access**: May require organization approval for `read:org` scope

## Secret Storage and Access

### GitHub Repository Secrets

**Location**: Repository Settings → Secrets and variables → Actions

**Access Control**:
- 👨‍💼 **Repository Admin**: Can view, add, edit, and delete secrets
- 👥 **Write Access**: Can use secrets in workflows but cannot view values
- 👀 **Read Access**: Cannot access secrets at all
- 🤖 **GitHub Actions**: Can access secrets during workflow execution only

**Security Features**:
- 🔐 **Encryption**: All secrets encrypted at rest
- 🚫 **No Logging**: Secret values never appear in workflow logs
- 🔒 **Masked Output**: Automatic masking if accidentally printed
- 🏢 **Organization Policy**: Subject to organization secret policies

### Secret Injection in Workflows

**Mechanism**: Secrets are injected as environment variables during workflow execution

```yaml
# Example from workflow
env:
  FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
run: |
  flyctl secrets set \
    GITHUB_CLIENT_ID="${{ secrets.GITHUB_CLIENT_ID_DEV }}" \
    GITHUB_CLIENT_SECRET="${{ secrets.GITHUB_CLIENT_SECRET_DEV }}" \
    GITHUB_TOKEN="${{ secrets.GITHUB_TOKEN_DEV }}"
```

**Security Measures**:
- 🔒 **Runtime Only**: Secrets only available during workflow execution
- 🚫 **No Persistence**: Secrets not stored in workflow environment after completion
- 🔐 **Encrypted Transit**: Secure transfer to Fly.io via encrypted connection
- 📋 **Audit Trail**: Secret usage logged in GitHub Actions audit log

## Permission Matrix

| Secret | Required Permissions | Access Level | Rotation Frequency |
|--------|---------------------|--------------|-------------------|
| `FLY_API_TOKEN` | Full Fly.io account access | High | Monthly |
| `GITHUB_CLIENT_ID_DEV` | OAuth app client ID | Medium | Rarely |
| `GITHUB_CLIENT_SECRET_DEV` | OAuth app client secret | High | Quarterly |
| `GITHUB_TOKEN_DEV` | `read:user`, `read:org` | Medium | 90 days |

## Security Best Practices

### 1. **Principle of Least Privilege**
- ✅ GitHub token has minimal required scopes (`read:user`, `read:org`)
- ✅ OAuth app requests minimal permissions
- ✅ Fly.io token scoped to specific organization if possible

### 2. **Secret Rotation**
- 🔄 **Regular Rotation**: Rotate secrets on a schedule
- 📅 **Expiration Monitoring**: Set calendar reminders for token expiration
- 🚨 **Emergency Rotation**: Immediate rotation if compromise suspected

### 3. **Access Control**
- 👥 **Limited Access**: Only repository admins can view/edit secrets
- 🔐 **Two-Factor Authentication**: Required for all users with secret access
- 📋 **Audit Logging**: Monitor secret access and usage

### 4. **Monitoring and Alerting**
- 📊 **Usage Monitoring**: Track secret usage in workflows
- 🚨 **Failure Alerts**: Alert on authentication failures
- 🔍 **Audit Reviews**: Regular review of secret access logs

## Troubleshooting Common Issues

### 1. **OAuth Application Issues**
```
Error: Invalid client_id or redirect_uri
```
**Solution**: Verify `GITHUB_CLIENT_ID_DEV` matches OAuth app and callback URL is correct

### 2. **GitHub Token Issues**
```
Error: 403 Forbidden - read:org scope required
```
**Solution**: Ensure `GITHUB_TOKEN_DEV` has `read:org` scope and organization approval

### 3. **Fly.io Token Issues**
```
Error: authentication failed
```
**Solution**: Regenerate `FLY_API_TOKEN` using `fly auth token`

## Emergency Procedures

### 1. **Secret Compromise**
1. 🚨 **Immediate**: Rotate compromised secret
2. 🔒 **Update**: Update GitHub repository secret
3. 🔄 **Redeploy**: Trigger workflow to update deployed service
4. 📋 **Audit**: Review access logs for unauthorized usage

### 2. **Service Outage**
1. 🏥 **Health Check**: Verify all secrets are correctly configured
2. 🔍 **Log Review**: Check GitHub Actions and Fly.io logs
3. 🔄 **Manual Deployment**: Use manual deployment as fallback
4. 📞 **Escalation**: Contact Fly.io support if platform issue

## Compliance and Audit

### 1. **Audit Trail**
- 📋 **GitHub Actions**: All workflow executions logged
- 🔐 **Secret Access**: Repository secret access tracked
- 🌐 **OAuth Events**: GitHub logs all OAuth authorizations
- ☁️ **Fly.io Logs**: Deployment and application logs retained

### 2. **Compliance Requirements**
- 🔒 **Data Protection**: All secrets encrypted in transit and at rest
- 👥 **Access Control**: Role-based access to secrets
- 📊 **Monitoring**: Continuous monitoring of secret usage
- 📋 **Documentation**: This document serves as compliance documentation

---

## Quick Reference

### Required Repository Secrets
```
FLY_API_TOKEN=fly_token_here
GITHUB_CLIENT_ID_DEV=oauth_client_id_here
GITHUB_CLIENT_SECRET_DEV=oauth_client_secret_here
GITHUB_TOKEN_DEV=github_token_here
```

### Service URLs
- **Development**: `https://sgex-mcp-dev.fly.dev`
- **OAuth Callback**: `https://sgex-mcp-dev.fly.dev/auth/github/callback`
- **Health Check**: `https://sgex-mcp-dev.fly.dev/health`

### Emergency Contacts
- **Fly.io Support**: https://fly.io/docs/about/support/
- **GitHub Support**: https://support.github.com/
- **Repository Owner**: @litlfred
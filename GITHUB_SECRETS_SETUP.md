# GitHub Secrets Setup for OAuth Authentication

## Overview

SGEX Workbench supports GitHub OAuth Device Flow for enhanced authentication with higher rate limits and better user experience. This guide explains how to configure GitHub secrets for production deployment.

## ✅ Current Implementation Status

GitHub secret support for OAuth Client ID is **already implemented** in both deployment workflows:

### 1. Landing Page Deployment (`.github/workflows/landing-page-deployment.yml`)
- **Line 84-88**: OAuth configuration check and logging
- **Line 94**: Environment variable: `REACT_APP_SGEX_GITHUB_OAUTH_CLIENT_ID: ${{ secrets.SGEX_GITHUB_OAUTH_CLIENT_ID }}`

### 2. Branch Deployment (`.github/workflows/branch-deployment.yml`)  
- **Line 142-147**: OAuth configuration check and logging
- **Line 156**: Environment variable: `REACT_APP_SGEX_GITHUB_OAUTH_CLIENT_ID: ${{ secrets.SGEX_GITHUB_OAUTH_CLIENT_ID }}`

## 🔧 Setup Instructions

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Fill in your OAuth app details:
   ```
   Application name: SGEX Workbench
   Homepage URL: https://yourusername.github.io/sgex/
   Authorization callback URL: https://yourusername.github.io/sgex/
   ```
   *(Note: Callback URL is required but not used in Device Flow)*
3. Click "Register application"
4. Copy the **Client ID** (you don't need the Client Secret for Device Flow)

### Step 2: Add Repository Secret

1. Go to your repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `SGEX_GITHUB_OAUTH_CLIENT_ID`
4. Value: Paste your OAuth app Client ID
5. Click "Add secret"

### Step 3: Deploy

Once the secret is added, your deployments will automatically:
- ✅ Include OAuth Client ID in the build environment
- ✅ Enable OAuth authentication in the application
- ✅ Fall back gracefully to PAT authentication if OAuth fails

## 🔍 Verification

You can verify the setup by checking the workflow logs:

### With OAuth Configured:
```
✅ OAuth Client ID configured - OAuth authentication will be available
```

### Without OAuth Configured:
```
ℹ️  OAuth Client ID not set - application will use PAT authentication only
```

## 🛡️ Security Notes

### OAuth Client ID Safety
- **Safe to expose**: OAuth Client IDs are designed to be public
- **No secrets**: Contains no sensitive authentication information
- **Industry standard**: GitHub Desktop, VS Code, GitLens all expose Client IDs
- **Device Flow**: No client secret required, user authorization is explicit

### Deployment Security
- **Repository secrets**: Client ID stored securely in GitHub secrets
- **Automatic injection**: Workflows inject the secret only during build
- **No hardcoding**: No credentials committed to source code
- **Graceful fallback**: App works without OAuth if secret not configured

## 📊 Benefits of OAuth Setup

- **Higher rate limits**: 5,000 requests/hour (vs 60 for unauthenticated)
- **Better UX**: No manual token creation required
- **Standard flow**: Familiar GitHub authorization process
- **Enhanced security**: No Personal Access Tokens to manage

## 🚫 Alternative: PAT-Only Setup

If you prefer not to set up OAuth, the application will work perfectly with Personal Access Token authentication only. No additional configuration required.

---

**Status**: ✅ GitHub secret support already implemented and ready to use!
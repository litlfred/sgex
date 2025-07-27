# GitHub App Setup Guide for SGEX Workbench

This guide explains how to create and configure a GitHub App for OAuth authentication with SGEX Workbench.

## Overview

SGEX Workbench uses GitHub App OAuth for secure, granular access to DAK repositories. Unlike Personal Access Tokens (PATs), GitHub Apps provide:

- **Enhanced Security**: Scoped permissions per repository
- **Better User Experience**: No manual token creation or management
- **Audit Trail**: GitHub tracks app access and usage
- **Easy Revocation**: Users can revoke access through GitHub settings

## Prerequisites

- GitHub account with admin access to your organization (if deploying for an organization)
- Basic understanding of OAuth 2.0 and GitHub Apps

## Step 1: Create a GitHub App

1. **Navigate to GitHub App creation**:
   - For personal use: https://github.com/settings/apps
   - For organization: https://github.com/organizations/YOUR-ORG/settings/apps
   - Click **"New GitHub App"**

2. **Basic Information**:
   - **App name**: `SGEX Workbench` (or `SGEX Workbench - YourOrg`)
   - **Description**: `Browser-based collaborative editor for WHO SMART Guidelines DAK components`
   - **Homepage URL**: Your deployment URL (e.g., `https://yourdomain.github.io/sgex`)

3. **Identifying and authorizing users**:
   - **Callback URL**: `https://yourdomain.github.io/sgex` (your deployment URL)
   - **Request user authorization (OAuth) during installation**: ✅ **Checked**
   - **Enable Device Flow**: ✅ **Checked** (Important!)

4. **Post installation**:
   - **Setup URL**: Leave blank
   - **Redirect on update**: ✅ **Checked**

## Step 2: Configure Permissions

Set the following **Repository permissions**:

### Required for Read Access:
- **Contents**: `Read`
- **Issues**: `Read` 
- **Metadata**: `Read`
- **Pull requests**: `Read`

### Additional for Write Access:
- **Contents**: `Write`
- **Issues**: `Write`
- **Pull requests**: `Write`

### Account permissions:
- **Email addresses**: `Read`

## Step 3: Configure OAuth Settings

1. **User permissions**:
   - Select **"Any account"** if you want public access
   - Select **"Only this account"** for private/organizational use

2. **Device Flow**: ✅ **Must be enabled**

3. **OAuth Scopes**: The app will request these dynamically:
   - `read:user` - Access user profile information
   - `public_repo` - Access public repositories 
   - `repo` - Access private repositories (Write Access only)

## Step 4: Create and Configure

1. Click **"Create GitHub App"**

2. **Note your Client ID**: After creation, copy the **Client ID** from the app settings page

3. **Generate Client Secret** (if needed for server deployments):
   - Click **"Generate a new client secret"**
   - Store securely - you cannot view it again

## Step 5: Configure SGEX Workbench

### For Development:

Create `.env.local` file:
```bash
REACT_APP_GITHUB_CLIENT_ID=Iv1.your-client-id-here
```

### For Production Deployment:

Set environment variable during build:
```bash
REACT_APP_GITHUB_CLIENT_ID=Iv1.your-client-id-here npm run build
```

Or configure in your deployment platform:
- **Netlify**: Site settings → Environment variables
- **Vercel**: Project settings → Environment variables  
- **GitHub Pages**: Use repository secrets and GitHub Actions

## Step 6: Test the Setup

1. Deploy or start SGEX Workbench locally
2. Navigate to the OAuth login page
3. Click **"Authorize Read Access"** or **"Authorize Write Access"**
4. You should be redirected to GitHub's OAuth flow
5. Complete authorization and verify you can access DAK repositories

## Deployment Examples

### GitHub Pages with Actions

Add to your `.github/workflows/deploy.yml`:

```yaml
- name: Build
  run: npm run build
  env:
    REACT_APP_GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
```

Add `GITHUB_CLIENT_ID` to your repository secrets.

### Netlify

1. Go to Site settings → Environment variables
2. Add `REACT_APP_GITHUB_CLIENT_ID` with your Client ID value
3. Trigger a new deployment

### Vercel

1. Go to Project settings → Environment variables
2. Add `REACT_APP_GITHUB_CLIENT_ID` with your Client ID value
3. Redeploy your project

## Security Best Practices

1. **Limit App Permissions**: Only request permissions your app actually needs
2. **Regular Audits**: Periodically review which users have authorized your app
3. **Scope Restrictions**: Consider organization-only apps for internal deployments
4. **Monitor Usage**: Use GitHub's app analytics to track usage patterns

## Troubleshooting

### "Device Flow not enabled" Error
- Ensure **Device Flow** is checked in your GitHub App settings
- Re-save the app settings after enabling

### "Invalid Client ID" Error  
- Verify `REACT_APP_GITHUB_CLIENT_ID` matches your app's Client ID exactly
- Check for extra spaces or characters in the environment variable

### "Insufficient Permissions" Error
- Review and update your app's repository permissions
- Users may need to re-authorize after permission changes

### Users Can't Access Private Repositories
- Ensure your app requests `repo` scope for Write Access
- Verify the app has access to the specific repositories
- Check that users have appropriate repository permissions

## Advanced Configuration

### Organization Installation

To restrict your app to specific organizations:

1. Go to your GitHub App settings
2. Under **"User authorization callback URL"**
3. Select **"Only this account"** 
4. Install the app on specific organizations only

### Custom Scopes

You can customize the requested scopes by modifying `src/services/oauthService.js`:

```javascript
const SCOPES = {
  READ_ONLY: ['read:user', 'public_repo'],
  WRITE_ACCESS: ['read:user', 'public_repo', 'repo'],
  // Add custom scope configurations
};
```

### Multiple Deployment Environments

For staging/production environments, create separate GitHub Apps:

- `SGEX Workbench - Staging`
- `SGEX Workbench - Production`

Use different Client IDs for each environment.

## Support

For issues with GitHub App setup:

1. Check GitHub's [Apps documentation](https://docs.github.com/en/apps)
2. Review the [OAuth Device Flow guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
3. Open an issue in the SGEX Workbench repository with your app configuration details (without secrets)
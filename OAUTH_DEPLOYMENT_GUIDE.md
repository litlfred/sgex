# OAuth Deployment Configuration Guide

This guide explains how to configure GitHub OAuth Device Flow for SGEX Workbench deployment on GitHub Pages, including security considerations and setup instructions.

## Quick Setup Summary

1. **Create GitHub OAuth App**: https://github.com/settings/applications/new
2. **Add Repository Secret**: Go to repository Settings → Secrets → Actions
3. **Deploy**: OAuth becomes active automatically

## Detailed Setup Instructions

### Step 1: Create GitHub OAuth Application

1. Navigate to [GitHub OAuth Apps](https://github.com/settings/applications/new)
2. Fill in the application details:
   - **Application name**: `SGEX Workbench` (or your preferred name)
   - **Homepage URL**: `https://litlfred.github.io/sgex/`
   - **Authorization callback URL**: `https://litlfred.github.io/sgex/` (not used in Device Flow, but required)
   - **Description**: `WHO SMART Guidelines Exchange collaborative editor`

3. Click "Register application"
4. **Copy the Client ID** (looks like `Ov23liAbcd1234567890`)

### Step 2: Configure Repository Secret

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Set:
   - **Name**: `GITHUB_OAUTH_CLIENT_ID`
   - **Secret**: Paste your OAuth Client ID from Step 1
5. Click **Add secret**

### Step 3: Update Deployment Workflows

The deployment workflows need to be updated to include the OAuth Client ID during the build process. Add the environment variable to the build steps:

#### For Landing Page Deployment (`landing-page-deployment.yml`)

```yaml
- name: Build React application for landing page
  shell: bash
  run: |
    # ... existing build commands ...
    npm run build
  env:
    CI: false
    PUBLIC_URL: "/sgex/"
    REACT_APP_GITHUB_OAUTH_CLIENT_ID: ${{ secrets.GITHUB_OAUTH_CLIENT_ID }}
```

#### For Branch Deployment (`branch-deployment.yml`)

```yaml
- name: Build branch-specific React app
  run: |
    # ... existing build commands ...
    npm run build
  env:
    CI: false
    PUBLIC_URL: ${{ steps.public_url.outputs.public_url }}
    GITHUB_REF_NAME: ${{ steps.branch_info.outputs.branch_name }}
    REACT_APP_GITHUB_REF_NAME: ${{ steps.branch_info.outputs.branch_name }}
    REACT_APP_GITHUB_OAUTH_CLIENT_ID: ${{ secrets.GITHUB_OAUTH_CLIENT_ID }}
```

### Step 4: Deploy and Verify

1. **Trigger Deployment**: Push to main branch or manually trigger workflow
2. **Check Build Logs**: Verify the environment variable is set (it won't show the value, just that it's set)
3. **Test OAuth**: Visit your deployed application and verify OAuth login option appears
4. **Complete OAuth Flow**: Test the full authentication process

## Security Analysis

### ✅ Safe to Expose OAuth Client ID

**OAuth Client IDs are designed to be public:**
- Similar to API keys for frontend applications
- No sensitive information contained in the Client ID
- Standard practice for Single Page Applications (SPAs)
- GitHub's Device Flow is specifically designed for public clients

**Examples of public OAuth Client IDs:**
- GitHub Desktop: `de7496a7342add0b0e5d`
- VS Code: `01ab8ac9400c4e429b23`
- GitLens: `4770d69d8d8b419c84b2`

### 🔒 Security Features Already Implemented

**Device Flow Security:**
- No client secret required or exposed
- User explicitly authorizes each session
- Tokens are short-lived and user-controlled
- OAuth scopes limited to necessary permissions

**Application Security:**
- Tokens stored locally with XOR encryption
- No credential transmission outside browser
- All authentication happens client-side
- GitHub provides the security infrastructure

### ⚠️ Potential Attack Vectors (Low Risk)

**1. OAuth App Impersonation**
- **Risk**: Someone could create a malicious OAuth app with similar name
- **Impact**: Low - users would see different app name during authorization
- **Mitigation**: Users see your app name and URL during OAuth flow

**2. Rate Limit Exhaustion**
- **Risk**: Malicious actors could consume your 5000 requests/hour quota
- **Impact**: Medium - temporary service degradation
- **Mitigation**: GitHub's rate limiting protects against abuse; implement client-side rate limiting

**3. Brand Confusion**
- **Risk**: Similar-named OAuth apps could confuse users
- **Impact**: Low - OAuth flow clearly shows app details
- **Mitigation**: Use distinctive app name and clear homepage URL

### 🛡️ Security Best Practices

**Current Implementation:**
- ✅ Device Flow (most secure for public clients)
- ✅ Minimal OAuth scopes requested
- ✅ Local token storage with encryption
- ✅ No backend server attack surface
- ✅ Open source code for transparency

**Additional Recommendations:**
- Monitor OAuth app usage in GitHub settings
- Regularly rotate OAuth app if compromised
- Implement client-side request throttling
- Log authentication events for monitoring

## Environment Variables Reference

### Required for OAuth

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `REACT_APP_GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth App Client ID | `Ov23liAbcd1234567890` | Optional but recommended |

### Existing Build Variables

| Variable | Description | Set By |
|----------|-------------|---------|
| `PUBLIC_URL` | React app base path | Workflow |
| `CI` | Disable build warnings as errors | Workflow |
| `GITHUB_REF_NAME` | Current branch name | GitHub Actions |
| `REACT_APP_GITHUB_REF_NAME` | Branch name for app | Workflow |

## Fallback Authentication

If OAuth is not configured:
- Application shows configuration instructions
- Users can still use Personal Access Token authentication
- All features remain functional
- App gracefully degrades to PAT-only mode

## Troubleshooting

### OAuth Not Appearing
1. Check repository secret is set correctly
2. Verify environment variable in build logs
3. Clear browser cache and reload application
4. Check browser console for JavaScript errors

### OAuth Flow Failing
1. Verify OAuth app settings in GitHub
2. Check homepage URL matches deployment URL
3. Ensure OAuth app is not suspended
4. Test with different browser/incognito mode

### Rate Limiting Issues
1. Monitor usage in GitHub OAuth app settings
2. Implement exponential backoff in API calls
3. Consider multiple OAuth apps for high-traffic scenarios
4. Use authenticated requests to get higher limits

## Production Considerations

### For High-Traffic Deployments
- Consider multiple OAuth apps for load distribution
- Monitor GitHub API usage and rate limits
- Implement client-side caching for repository data
- Use CDN for static assets to reduce server load

### For Multi-Environment Deployments
- Create separate OAuth apps for different environments
- Use different repository secrets for staging/production
- Test OAuth flow in staging before production deployment
- Monitor authentication success rates

## Conclusion

Setting `REACT_APP_GITHUB_OAUTH_CLIENT_ID` for GitHub Pages deployment is **secure and recommended**. OAuth Client IDs are designed to be public, and the Device Flow provides robust security without requiring secret management in frontend applications.

The benefits (better user experience, higher rate limits, standard authentication flow) significantly outweigh the minimal risks associated with exposing the Client ID.
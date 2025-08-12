# GitHub OAuth Device Flow Setup Guide

## Overview

SGEX Workbench now supports GitHub OAuth Device Flow authentication, providing a seamless authentication experience with higher rate limits and better user experience compared to Personal Access Tokens.

## Benefits of OAuth Authentication

- **Higher Rate Limits**: 5,000 requests/hour (vs 60 for unauthenticated)
- **Seamless Experience**: No manual token creation required
- **Standard OAuth Flow**: Familiar GitHub authorization process
- **Secure**: Uses standard OAuth 2.0 Device Flow (RFC 8628)
- **CORS Compliant**: Works entirely in the browser without backend

## Setup Instructions

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: SGEX Workbench (or your preferred name)
   - **Homepage URL**: `https://yourdomain.github.io/sgex` (or your deployment URL)
   - **Authorization callback URL**: `http://localhost` (required but not used in Device Flow)
   - **Application description**: WHO SMART Guidelines Exchange collaborative editor

### 2. Configure OAuth Client ID

1. After creating the OAuth app, copy the **Client ID**
2. Set the environment variable:
   ```bash
   # For development (.env.local file)
   REACT_APP_SGEX_GITHUB_OAUTH_CLIENT_ID=your_client_id_here
   
   # For production (GitHub Pages deployment)
   # Set in your deployment workflow or repository secrets
   ```

### 3. Deploy with OAuth Support

For GitHub Pages deployment, ensure the OAuth client ID is available at build time:

```yaml
# In your GitHub Actions workflow
- name: Build
  run: npm run build
  env:
    REACT_APP_SGEX_GITHUB_OAUTH_CLIENT_ID: ${{ secrets.SGEX_GITHUB_OAUTH_CLIENT_ID }}
```

## OAuth Device Flow Process

### 1. User Initiates OAuth
- User clicks "🔐 Authenticate with GitHub OAuth"
- System requests device and user codes from GitHub

### 2. Device Authorization
- User is shown a verification code (e.g., "ABCD-1234")
- User clicks button to open GitHub authorization page
- User enters the code on GitHub and authorizes the application

### 3. Token Acquisition
- System polls GitHub for access token
- Once user authorizes, access token is retrieved
- Token is stored securely in browser using XOR encryption

### 4. Authenticated Access
- User can access all SGEX features with authenticated API calls
- Higher rate limits apply for better performance

## CORS Compliance

The OAuth Device Flow is fully CORS-compliant:

- **Device Code Request**: `POST https://github.com/login/device/code`
- **Token Polling**: `POST https://github.com/login/oauth/access_token`
- **API Requests**: `https://api.github.com/*` with `Authorization: token <oauth_token>`

All GitHub OAuth endpoints natively support CORS, enabling direct browser-to-GitHub communication without proxies.

## Fallback Support

If OAuth is not configured (`REACT_APP_SGEX_GITHUB_OAUTH_CLIENT_ID` not set):
- Only Personal Access Token authentication is available
- Users see the standard PAT login interface
- Full backwards compatibility maintained

## Security Considerations

### OAuth Client Security
- **Public Client**: Only client ID is used (stored in frontend)
- **No Secrets**: Client secret not needed for Device Flow
- **Token Storage**: OAuth tokens encrypted and stored securely in browser
- **Token Expiration**: Respects GitHub token expiration policies

### Best Practices
- Use fine-grained OAuth scopes when possible
- Regular token rotation (handled automatically by GitHub)
- Secure deployment practices for production

## Troubleshooting

### Common Issues

**OAuth not appearing**:
- Verify `REACT_APP_SGEX_GITHUB_OAUTH_CLIENT_ID` is set
- Check browser console for configuration errors

**Authorization fails**:
- Verify OAuth app settings in GitHub
- Check that callback URL is configured (even though not used)
- Ensure OAuth app is not suspended

**CORS errors**:
- This should not occur as GitHub supports CORS
- If seen, check for browser extensions blocking requests

### Debug Information

The OAuth service provides detailed logging. Check browser console for:
- Configuration status
- Device code requests
- Polling attempts
- Token acquisition success/failure

## Migration from PAT

Existing users with Personal Access Tokens:
- Can continue using PAT authentication
- Can switch to OAuth at any time
- Tokens are stored independently (no conflict)

## API Reference

### OAuth Service Methods

```javascript
import oauthDeviceFlowService from './services/oauthDeviceFlowService';

// Check if OAuth is configured
const config = oauthDeviceFlowService.checkConfiguration();

// Start OAuth flow
const result = await oauthDeviceFlowService.authenticateWithDeviceFlow(onUpdate);

// Get polling status
const status = oauthDeviceFlowService.getPollingStatus();
```

### Component Integration

```jsx
import OAuthLogin from './components/OAuthLogin';

<OAuthLogin 
  onAuthSuccess={(authData) => console.log('Success:', authData)}
  onAuthCancel={() => console.log('Cancelled')}
/>
```

## Support

For issues with OAuth implementation:
1. Check GitHub OAuth app configuration
2. Verify environment variables
3. Review browser console for errors
4. Consult GitHub OAuth documentation
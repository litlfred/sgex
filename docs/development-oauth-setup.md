# Development Setup for OAuth Authentication

This guide explains how to set up and develop with GitHub OAuth authentication in SGEX Workbench.

## CORS Issue and Development Proxy

GitHub's OAuth endpoints do not allow cross-origin requests from `localhost`, which causes CORS errors during local development. To solve this, SGEX Workbench includes a development proxy that forwards OAuth requests through the React development server.

### How the Proxy Works

1. **Development Mode**: When `NODE_ENV=development`, OAuth requests are sent to local proxy endpoints:
   - `/api/github/oauth/device/code` → `https://github.com/login/device/code`
   - `/api/github/oauth/access_token` → `https://github.com/login/oauth/access_token`

2. **Production Mode**: OAuth requests go directly to GitHub's endpoints

3. **Proxy Configuration**: The proxy is configured in `src/setupProxy.js` and automatically loaded by Create React App

### Starting Development Server

```bash
npm start
```

The development server will:
- Start React dev server on `http://localhost:3000`
- Automatically configure the OAuth proxy
- Handle CORS headers for GitHub OAuth requests

### GitHub App Configuration

For OAuth to work, you need a GitHub App configured with:

1. **Client ID**: Set via `REACT_APP_GITHUB_CLIENT_ID` environment variable
   - For development, defaults to `'sgex-workbench-dev'`
   - For production, should be set to your actual GitHub App client ID

2. **Device Flow Enabled**: Your GitHub App must have Device Flow enabled in its settings

3. **OAuth Scopes**: The app requests these scopes based on access level:
   - **Read Access**: `read:user`, `public_repo`
   - **Write Access**: `read:user`, `public_repo`, `repo`

### Testing OAuth Flow Locally

1. Start the development server: `npm start`
2. Open `http://localhost:3000`
3. Click "Authorize Read Access" or "Authorize Write Access"
4. The OAuth flow should now work without CORS errors

### Environment Variables

Create a `.env.local` file for local development:

```bash
# Optional: Override default client ID
REACT_APP_GITHUB_CLIENT_ID=your-github-app-client-id
```

### Troubleshooting

**CORS Errors**: If you still see CORS errors:
1. Ensure `src/setupProxy.js` exists
2. Restart the development server (`npm start`)
3. Check that `http-proxy-middleware` is installed

**OAuth Failures**: If OAuth requests fail:
1. Check your GitHub App configuration
2. Verify the client ID is correct
3. Ensure Device Flow is enabled in your GitHub App settings

**Proxy Not Working**: If the proxy isn't loading:
1. Verify `src/setupProxy.js` exports a function
2. Check for syntax errors in the proxy configuration
3. Ensure you're using `npm start` (not `npm run build && serve`)

### Production Deployment

When deploying to production:
1. Set `REACT_APP_GITHUB_CLIENT_ID` to your production GitHub App client ID
2. The proxy is automatically disabled (`NODE_ENV=production`)
3. OAuth requests go directly to GitHub (no CORS issues on non-localhost domains)

### Alternative: Manual Proxy Server

If you prefer to run a separate proxy server, you can use tools like:

```bash
# Using http-proxy-middleware as standalone server
npx http-proxy-middleware --target https://github.com --pathRewrite '^/oauth' '/login' --port 3001
```

Then update `OAUTH_ENDPOINTS` in `oauthService.js` to use `http://localhost:3001`.
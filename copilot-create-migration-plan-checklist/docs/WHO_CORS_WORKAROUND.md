# WHO Digital Library CORS Workaround for Development

## Problem
When running the SGEX Workbench in development mode, direct API calls to the WHO Digital Library (iris.who.int) fail due to CORS (Cross-Origin Resource Sharing) restrictions. Browsers block these requests for security reasons.

## Solution
We've implemented a development proxy that automatically forwards WHO Digital Library API requests through the local development server, bypassing CORS restrictions.

## How It Works

### 1. Proxy Configuration (`src/setupProxy.js`)
- Automatically loaded by Create React App's development server
- Proxies requests from `/api/who/*` to `https://iris.who.int/*`
- Only active in development mode (`NODE_ENV === 'development'`)

### 2. Service Layer Updates (`src/services/whoDigitalLibraryService.js`)
- Automatically detects development vs production environment
- Uses proxy endpoint (`/api/who`) in development
- Uses direct API (`https://iris.who.int`) in production
- Public URLs always point to the real WHO website

### 3. Error Handling
- Provides clear messages when the proxy needs to be enabled
- Guides users to restart the development server if needed
- Maintains helpful error context for debugging

## Usage

### Development Mode
1. Start the development server: `npm start`
2. The proxy is automatically configured and enabled
3. WHO Digital Library searches work without CORS issues

### Production Mode
- Direct API calls to `https://iris.who.int`
- No proxy needed (handled by server-side infrastructure)

## Technical Details

- **Package**: `http-proxy-middleware` (dev dependency)
- **Environment Detection**: `process.env.NODE_ENV === 'development'`
- **Proxy Path**: `/api/who/*` → `https://iris.who.int/*`
- **Logging**: Debug level logging for proxy requests

## Troubleshooting

If WHO Digital Library searches still fail after implementing this workaround:

### Common Error Types

1. **HTTP 403 (Access Denied)**
   - **Cause**: WHO's API is restricting access due to rate limiting, API policies, or access controls
   - **Solution**: Wait a few minutes and try again with different search terms
   - **Fallback**: Mock data is automatically provided in development mode

2. **HTTP 429 (Rate Limited)**
   - **Cause**: Too many requests made to the WHO API in a short time
   - **Solution**: Wait before making additional requests

3. **CORS Errors**
   - **Cause**: Browser blocking cross-origin requests in development
   - **Solution**: Restart the development server to activate the proxy

4. **Network Connectivity Issues**
   - **Cause**: Unable to reach iris.who.int
   - **Solution**: Check internet connection and network restrictions

### Debugging Steps

1. **Restart the development server** - The proxy configuration requires a server restart
2. **Check the console** - Look for proxy debug messages starting with `[WHO Proxy]`
3. **Verify the proxy file** - Ensure `src/setupProxy.js` exists and is configured correctly
4. **Check network connectivity** - The proxy still requires access to iris.who.int
5. **Review API status** - Check if iris.who.int is accessible and operational

## Alternative Solutions

If the proxy approach doesn't work in your environment, other options include:

1. **Mock Data Service** - Use mock data for development (already partially implemented)
2. **Browser CORS Extension** - Not recommended for team development
3. **Server-Side Backend** - Implement a proper backend API proxy
4. **Browser Flags** - Launch browser with `--disable-web-security` (not recommended)

The proxy approach is the recommended solution as it most closely mirrors production behavior while solving the development CORS issue.
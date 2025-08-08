# Security Headers Implementation

## Overview

This document describes the security headers implementation for SGeX Workbench, a client-side React application deployed on GitHub Pages.

## Security Headers Implemented

### 1. Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://github.com https://avatars.githubusercontent.com; connect-src 'self' https://api.github.com https://github.com https://raw.githubusercontent.com https://iris.who.int https://avatars.githubusercontent.com; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none'; child-src 'none'; manifest-src 'self';">
```

**Purpose**: Prevents code injection attacks by controlling resource loading sources.

**Directives**:
- `default-src 'self'`: Allow resources from the same origin by default
- `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com`: Allow scripts from same origin, inline scripts (required for React), eval (required for some React features), and unpkg.com CDN
- `style-src 'self' 'unsafe-inline'`: Allow styles from same origin and inline styles (required for React components)
- `img-src 'self' data: https://github.com https://avatars.githubusercontent.com`: Allow images from same origin, data URLs, and GitHub
- `connect-src 'self' https://api.github.com https://github.com https://raw.githubusercontent.com https://iris.who.int https://avatars.githubusercontent.com`: Allow network connections to GitHub APIs and WHO IRIS
- `font-src 'self'`: Allow fonts from same origin only
- `object-src 'none'`: Block all object/embed elements
- `media-src 'self'`: Allow media from same origin only
- `frame-src 'none'`: Block all frame/iframe elements
- `child-src 'none'`: Block all worker/frame contexts
- `manifest-src 'self'`: Allow manifest from same origin only

### 2. X-Frame-Options
```html
<meta http-equiv="X-Frame-Options" content="DENY">
```

**Purpose**: Prevents clickjacking attacks by denying the page from being embedded in frames.

### 3. X-Content-Type-Options
```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

**Purpose**: Prevents MIME sniffing attacks by forcing browsers to respect declared content types.

### 4. Referrer Policy
```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```

**Purpose**: Controls referrer information leakage. Sends full URL for same-origin requests, only origin for cross-origin HTTPS requests, and no referrer for HTTPS to HTTP transitions.

### 5. Permissions Policy
```html
<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), display-capture=(), document-domain=(), fullscreen=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), web-share=(), xr-spatial-tracking=()">
```

**Purpose**: Restricts browser features to prevent unauthorized access to sensitive APIs.

## Implementation Details

### Files Modified
- `public/index.html`: Main application HTML template
- `public/branch-listing.html`: Branch selector page template
- `.github/workflows/landing-page-deployment.yml`: Added CI=false for production builds

### GitHub Pages Limitations

**Why Meta Tags Instead of HTTP Headers**:
GitHub Pages is a static hosting service that doesn't support server-side configuration for HTTP headers. Traditional approaches like `.htaccess` files, server configuration, or `_headers` files don't work.

**Meta Tag Support**:
- ✅ `Content-Security-Policy`: Fully supported via meta tags
- ✅ `X-Frame-Options`: Supported via meta tags  
- ✅ `X-Content-Type-Options`: Supported via meta tags
- ✅ `Referrer-Policy`: Supported via meta tags
- ✅ `Permissions-Policy`: Supported via meta tags
- ❌ `Strict-Transport-Security`: Not supported via meta tags (GitHub Pages already enforces HTTPS)

## External Dependencies

### Allowed Domains
The CSP policy allows connections to these external domains:

1. **GitHub APIs and Resources**:
   - `api.github.com`: GitHub REST API for repository operations
   - `github.com`: GitHub web interface and avatar images
   - `avatars.githubusercontent.com`: User and organization avatars
   - `raw.githubusercontent.com`: Raw file content access

2. **WHO Digital Library**:
   - `iris.who.int`: WHO Institutional Repository for Information Sharing

3. **CDN Resources** (branch-listing.html only):
   - `unpkg.com`: React development builds for the branch listing page

### Network Connections
The application makes AJAX requests to:
- GitHub APIs for repository data, commits, and file content
- WHO IRIS API for digital library integration
- GitHub avatar URLs for user profile images

## Security Benefits

1. **XSS Protection**: CSP prevents injection of malicious scripts
2. **Clickjacking Protection**: X-Frame-Options prevents embedding in malicious frames
3. **MIME Sniffing Protection**: X-Content-Type-Options prevents content type confusion attacks
4. **Privacy Protection**: Referrer policy limits information leakage
5. **Feature Restriction**: Permissions policy blocks access to sensitive browser APIs
6. **HTTPS Enforcement**: GitHub Pages automatically redirects HTTP to HTTPS

## Testing and Validation

### Local Testing
```bash
# Build the application
npm run build

# Serve locally
cd build && python3 -m http.server 8080

# Verify headers in HTML
curl -s http://localhost:8080/index.html | grep -i "Content-Security-Policy"
```

### Browser Developer Tools
1. Open the application in a browser
2. Open Developer Tools → Security tab
3. Verify security headers are applied
4. Check Console for any CSP violations

## Maintenance

### Adding New External Domains
If the application needs to connect to new external domains:

1. Add the domain to the appropriate CSP directive in `public/index.html`
2. Also update `public/branch-listing.html` if applicable
3. Test the changes locally
4. Deploy and verify in production

### CSP Violation Monitoring
Consider implementing CSP violation reporting by adding a `report-uri` directive to monitor potential security issues in production.

## Security Considerations

### Limitations
- **No Server-Side Enforcement**: Meta tags can be modified client-side
- **Browser Support**: Older browsers may not fully support all policies
- **CSP Bypasses**: `unsafe-inline` and `unsafe-eval` are required for React but reduce CSP effectiveness

### Recommendations
- Monitor CSP violations in production
- Consider moving to a platform with server-side header support for enhanced security
- Regularly review and tighten CSP policies as the application evolves
- Implement Subresource Integrity (SRI) for CDN resources

## Compliance

This implementation addresses the following security requirements:
- Content Security Policy preventing code injection
- X-Frame-Options preventing clickjacking
- X-Content-Type-Options preventing MIME sniffing
- Permissions-Policy restricting browser features
- HTTPS enforcement (provided by GitHub Pages)

The implementation provides defense-in-depth security for a client-side React application while working within the constraints of GitHub Pages static hosting.
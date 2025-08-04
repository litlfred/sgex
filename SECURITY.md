# Security Guidelines for SGEX Workbench

## Overview

This document outlines the security measures implemented in SGEX Workbench and provides guidelines for secure usage and deployment.

## Security Features Implemented

### 1. Secure Token Storage

**Problem**: Previously, GitHub Personal Access Tokens (PATs) were stored in plain text in sessionStorage, making them vulnerable to XSS attacks.

**Solution**: Implemented `SecureTokenStorage` service with the following features:
- XOR encryption with browser fingerprint-based key
- Token format validation before storage
- Automatic token expiration (24 hours)
- Secure token masking for logs
- Metadata storage for token management

**Usage**:
```javascript
import secureTokenStorage from '../services/secureTokenStorage';

// Store token securely
secureTokenStorage.storeToken(token, { username: 'user' });

// Retrieve token
const token = secureTokenStorage.getToken();

// Check if valid token exists
if (secureTokenStorage.hasValidToken()) {
  // Token is available and not expired
}
```

### 2. Input Sanitization

**Problem**: User inputs could potentially contain malicious content leading to XSS attacks.

**Solution**: Comprehensive input sanitization utilities in `securityUtils.js`:

**Available Functions**:
- `sanitizeHtml(input)` - Escapes HTML entities
- `sanitizeUrl(input)` - Removes dangerous URL schemes
- `sanitizeRepositoryName(input)` - Validates repository names
- `sanitizeUsername(input)` - Validates GitHub usernames
- `sanitizeBranchName(input)` - Validates Git branch names
- `isValidFilePath(input)` - Prevents path traversal attacks

**Example**:
```javascript
import { sanitizeHtml, sanitizeUrl } from '../utils/securityUtils';

const safeHtml = sanitizeHtml(userInput);
const safeUrl = sanitizeUrl(userProvidedUrl);
```

### 3. Token Validation

**Features**:
- Format validation for GitHub PATs (classic and fine-grained)
- Token masking for safe logging and display
- Automatic token type detection

**Example**:
```javascript
import { isValidPATFormat, maskToken } from '../utils/securityUtils';

if (isValidPATFormat(token)) {
  console.log('Valid token:', maskToken(token)); // Logs: ghp_***cdef
}
```

### 4. Secure Logging

**Problem**: Sensitive data could be exposed in application logs.

**Solution**: Automatic sanitization of log data to remove or mask sensitive fields.

**Example**:
```javascript
import { sanitizeLogData } from '../utils/securityUtils';

const logData = sanitizeLogData({
  token: 'ghp_secret123',
  username: 'user'
}); // Results in: { token: 'ghp_***123', username: 'user' }
```

### 5. Content Security Policy (CSP)

**Implementation**: Comprehensive CSP headers configured for production deployment.

**Headers configured**:
- `Content-Security-Policy` - Prevents XSS and code injection
- `X-Content-Type-Options` - Prevents MIME sniffing
- `X-Frame-Options` - Prevents clickjacking
- `X-XSS-Protection` - Browser XSS protection
- `Referrer-Policy` - Controls referrer information
- `Strict-Transport-Security` - Forces HTTPS
- `Permissions-Policy` - Restricts browser features

### 6. Dependency Security

**Fixed Vulnerabilities**:
- Updated PrismJS to version 1.30.0+ to fix DOM Clobbering vulnerability
- Added security overrides in package.json for vulnerable dependencies

## Security Best Practices

### For Developers

1. **Input Validation**:
   - Always validate and sanitize user inputs
   - Use the provided security utilities
   - Never trust client-side data

2. **Token Handling**:
   - Use `SecureTokenStorage` for all token operations
   - Never log tokens in plain text
   - Validate token formats before processing

3. **Dependencies**:
   - Regularly run `npm audit` to check for vulnerabilities
   - Keep dependencies updated
   - Review security advisories for used packages

4. **Code Review**:
   - Review all user input handling
   - Check for potential XSS vulnerabilities
   - Ensure sensitive data is properly sanitized

### For Users

1. **Personal Access Tokens**:
   - Use fine-grained PATs when possible
   - Set minimal required permissions
   - Regularly rotate tokens (recommended: monthly)
   - Never share tokens with others

2. **Token Permissions**:
   - **Required permissions**:
     - Contents: Read and Write
     - Metadata: Read
     - Pull requests: Read and Write
   - **Optional permissions**:
     - Actions: Read (for workflow status)

3. **Security Practices**:
   - Always sign out when using shared computers
   - Monitor your GitHub account for unauthorized access
   - Use 2FA on your GitHub account

### For Deployment

1. **HTTPS**:
   - Always serve the application over HTTPS
   - Configure HSTS headers
   - Use strong TLS configuration

2. **Security Headers**:
   - Implement the provided security headers
   - Use the Netlify `_headers` file for Netlify deployments
   - Configure similar headers for other platforms

3. **Monitoring**:
   - Monitor access logs for suspicious activity
   - Set up alerts for unusual usage patterns
   - Regularly review security configurations

## Security Testing

### Automated Tests

Run the security test suite:
```bash
npm test -- src/tests/security.test.js
```

**Tests cover**:
- Input sanitization functions
- Token validation and storage
- Path traversal prevention
- XSS protection measures

### Manual Security Testing

1. **XSS Testing**:
   - Try entering `<script>alert('xss')</script>` in input fields
   - Verify content is properly escaped

2. **Path Traversal Testing**:
   - Try file paths like `../../../etc/passwd`
   - Verify paths are properly validated

3. **Token Security**:
   - Verify tokens are not visible in browser developer tools
   - Check that tokens are properly masked in logs

## Incident Response

### If a Security Issue is Discovered

1. **Immediate Actions**:
   - Document the issue thoroughly
   - Assess the scope and impact
   - Implement a temporary fix if possible

2. **Communication**:
   - Report to the project maintainers
   - If it affects users, prepare a security advisory
   - Coordinate disclosure timing

3. **Resolution**:
   - Develop and test a comprehensive fix
   - Update documentation and security guidelines
   - Release security updates

### User Token Compromise

If you suspect your GitHub PAT has been compromised:

1. **Immediate Actions**:
   - Revoke the compromised token in GitHub settings
   - Create a new token with fresh permissions
   - Sign out of all SGEX sessions

2. **Investigation**:
   - Review GitHub audit logs for unauthorized activity
   - Check for unauthorized repository access
   - Monitor for unusual API usage

3. **Prevention**:
   - Review and update security practices
   - Consider using fine-grained PATs
   - Enable additional GitHub security features

## Security Contact

For security-related issues or questions:
- Create a GitHub issue with the "security" label
- For sensitive security reports, contact maintainers directly

## Regular Security Reviews

This document and security measures should be reviewed:
- Quarterly for updates and improvements
- After any major application changes
- Following security incidents or discoveries
- When new dependencies are added

## Compliance and Standards

SGEX Workbench follows:
- OWASP Top 10 security guidelines
- GitHub security best practices
- Modern web application security standards
- React security recommendations

---

*Last updated: [Current Date]*
*Version: 1.0*
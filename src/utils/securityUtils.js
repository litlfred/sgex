/**
 * Security utilities for SGEX Workbench
 * Provides functions for input sanitization, XSS protection, and secure data handling
 */

/**
 * Sanitize a string for safe HTML rendering
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
export function sanitizeHtml(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Basic HTML entity encoding for XSS prevention
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize a string for safe URL usage
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized URL string
 */
export function sanitizeUrl(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous URL schemes
  const dangerousSchemes = /^(javascript|data|vbscript|file|ftp):/i;
  if (dangerousSchemes.test(input)) {
    return '';
  }

  return input.trim();
}

/**
 * Validate and sanitize repository name
 * @param {string} repoName - Repository name to validate
 * @returns {string} - Sanitized repository name
 */
export function sanitizeRepositoryName(repoName) {
  if (!repoName || typeof repoName !== 'string') {
    return '';
  }

  // Allow only alphanumeric characters, hyphens, underscores, and dots
  return repoName.replace(/[^a-zA-Z0-9\-_.]/g, '');
}

/**
 * Validate and sanitize username
 * @param {string} username - Username to validate
 * @returns {string} - Sanitized username
 */
export function sanitizeUsername(username) {
  if (!username || typeof username !== 'string') {
    return '';
  }

  // Allow only alphanumeric characters, hyphens, and underscores (GitHub username rules)
  return username.replace(/[^a-zA-Z0-9\-_]/g, '');
}

/**
 * Validate and sanitize branch name
 * @param {string} branchName - Branch name to validate
 * @returns {string} - Sanitized branch name
 */
export function sanitizeBranchName(branchName) {
  if (!branchName || typeof branchName !== 'string') {
    return '';
  }

  // Allow alphanumeric characters, hyphens, underscores, slashes, and dots
  // Remove control characters and other potentially dangerous characters
  return branchName.replace(/[^\w\-/.]/g, '');
}

/**
 * Validate if a string is a valid GitHub Personal Access Token format
 * @param {string} token - Token to validate
 * @returns {boolean} - True if token format is valid
 */
export function isValidPATFormat(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // GitHub PAT formats:
  // Classic: ghp_ followed by 36 characters
  // Fine-grained: github_pat_ followed by characters
  const classicPATPattern = /^ghp_[a-zA-Z0-9]{36}$/;
  const fineGrainedPATPattern = /^github_pat_[a-zA-Z0-9_]{22,255}$/;
  
  return classicPATPattern.test(token) || fineGrainedPATPattern.test(token);
}

/**
 * Mask a token for safe logging or display
 * @param {string} token - Token to mask
 * @returns {string} - Masked token
 */
export function maskToken(token) {
  if (!token || typeof token !== 'string') {
    return '[invalid]';
  }

  if (token.length < 8) {
    return '[masked]';
  }

  return token.substring(0, 4) + '***' + token.substring(token.length - 4);
}

/**
 * Validate file path for security
 * @param {string} filePath - File path to validate
 * @returns {boolean} - True if path is safe
 */
export function isValidFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }

  // Prevent path traversal attacks
  const dangerousPatterns = [
    /\.\./,     // Parent directory traversal
    /\/\//,     // Double slashes
    /^\/+/,     // Leading slashes
    /\0/,       // Null bytes
    /[<>:|*?"]/  // Invalid filename characters
  ];

  return !dangerousPatterns.some(pattern => pattern.test(filePath));
}

/**
 * Sanitize JSON data by removing sensitive fields
 * @param {object} data - Data object to sanitize
 * @param {Array<string>} sensitiveFields - Fields to remove/mask
 * @returns {object} - Sanitized data object
 */
export function sanitizeLogData(data, sensitiveFields = ['token', 'password', 'auth', 'key']) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field] !== undefined) {
      if (typeof sanitized[field] === 'string') {
        // Only mask if it looks like a token, otherwise redact
        if (field === 'token' && isValidPATFormat(sanitized[field])) {
          sanitized[field] = maskToken(sanitized[field]);
        } else if (field === 'token' && sanitized[field].length >= 8) {
          sanitized[field] = maskToken(sanitized[field]);
        } else {
          sanitized[field] = '[redacted]';
        }
      } else {
        sanitized[field] = '[redacted]';
      }
    }
  });

  return sanitized;
}

/**
 * Generate a Content Security Policy header value
 * @returns {string} - CSP header value
 */
export function generateCSPHeader() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // React needs unsafe-inline for development
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.github.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

/**
 * Validate and parse URL parameters safely
 * @param {URLSearchParams} params - URL parameters to validate
 * @param {object} expectedParams - Expected parameter definitions
 * @returns {object} - Validated parameters
 */
export function validateUrlParams(params, expectedParams) {
  const validated = {};
  
  Object.keys(expectedParams).forEach(key => {
    const value = params.get(key);
    const config = expectedParams[key];
    
    if (value !== null) {
      switch (config.type) {
        case 'username':
          validated[key] = sanitizeUsername(value);
          break;
        case 'repository':
          validated[key] = sanitizeRepositoryName(value);
          break;
        case 'branch':
          validated[key] = sanitizeBranchName(value);
          break;
        case 'string':
          validated[key] = sanitizeHtml(value);
          break;
        default:
          validated[key] = value;
      }
    } else if (config.required) {
      throw new Error(`Required parameter '${key}' is missing`);
    }
  });
  
  return validated;
}

const securityUtils = {
  sanitizeHtml,
  sanitizeUrl,
  sanitizeRepositoryName,
  sanitizeUsername,
  sanitizeBranchName,
  isValidPATFormat,
  maskToken,
  isValidFilePath,
  sanitizeLogData,
  generateCSPHeader,
  validateUrlParams
};

export default securityUtils;
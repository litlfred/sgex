/**
 * Security Utilities for XSS Prevention and Input Validation
 * 
 * This module provides comprehensive security functions to prevent XSS attacks
 * and validate user inputs throughout the SGEX Workbench application.
 */

/**
 * HTML entity escaping map for basic characters
 */
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

/**
 * Escapes HTML entities in a string to prevent XSS attacks
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') {
    return '';
  }
  
  return str.replace(/[&<>"'/]/g, (match) => HTML_ENTITIES[match]);
}

/**
 * Sanitizes HTML content by removing dangerous tags and attributes
 * @param {string} html - The HTML content to sanitize
 * @returns {string} - The sanitized HTML content
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') {
    return '';
  }

  // List of allowed HTML tags (conservative whitelist)
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'div', 'span', 'table', 'tr', 
    'td', 'th', 'thead', 'tbody', 'a'
  ];

  // List of allowed attributes (conservative whitelist)
  const allowedAttributes = ['href', 'title', 'class', 'id'];

  // Remove script tags and their content completely
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove dangerous attributes that can execute JavaScript
  sanitized = sanitized.replace(/\s(on\w+|javascript:|data:)[\s]*=[\s]*[^>\s]*/gi, '');
  
  // Remove tags not in the whitelist and clean attributes
  const tagRegex = /<(\/?[a-zA-Z0-9]+)([^>]*)>/g;
  sanitized = sanitized.replace(tagRegex, (match, tagPart, attributesPart) => {
    const isClosingTag = tagPart.startsWith('/');
    const tagName = isClosingTag ? tagPart.slice(1) : tagPart;
    
    if (!allowedTags.includes(tagName.toLowerCase())) {
      return '';
    }
    
    // For closing tags, just return the tag
    if (isClosingTag) {
      return `</${tagName}>`;
    }
    
    // For opening tags, clean their attributes
    let cleanAttributes = '';
    const attrRegex = /\s([a-zA-Z-]+)[\s]*=[\s]*["']?([^"'>\s]*)["']?/g;
    let attrMatch;
    
    while ((attrMatch = attrRegex.exec(attributesPart)) !== null) {
      const attrName = attrMatch[1];
      const attrValue = attrMatch[2];
      
      if (allowedAttributes.includes(attrName.toLowerCase())) {
        // Special handling for href attributes to prevent javascript: and data: schemes
        if (attrName.toLowerCase() === 'href') {
          if (isValidUrlScheme(attrValue)) {
            cleanAttributes += ` ${attrName}="${attrValue}"`;
          }
        } else {
          cleanAttributes += ` ${attrName}="${escapeHtml(attrValue)}"`;
        }
      }
    }
    
    return `<${tagName}${cleanAttributes}>`;
  });

  return sanitized;
}

/**
 * Validates GitHub repository names according to GitHub naming rules
 * @param {string} repoName - The repository name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateRepositoryName(repoName) {
  if (typeof repoName !== 'string') {
    return false;
  }

  // GitHub repository name rules:
  // - 1-100 characters
  // - Can contain alphanumeric characters, hyphens, periods, and underscores
  // - Cannot start or end with a period or hyphen
  // - Cannot be empty or contain only periods
  const repoRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
  
  return repoName.length >= 1 && 
         repoName.length <= 100 && 
         repoRegex.test(repoName) &&
         !repoName.startsWith('.') &&
         !repoName.endsWith('.') &&
         !repoName.startsWith('-') &&
         !repoName.endsWith('-') &&
         !/^\.+$/.test(repoName);
}

/**
 * Validates GitHub usernames according to GitHub naming rules
 * @param {string} username - The username to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateUsername(username) {
  if (typeof username !== 'string') {
    return false;
  }

  // GitHub username rules:
  // - 1-39 characters
  // - Can contain alphanumeric characters and hyphens
  // - Cannot start or end with a hyphen
  // - Cannot have consecutive hyphens
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  
  return username.length >= 1 && 
         username.length <= 39 && 
         usernameRegex.test(username) &&
         !username.includes('--');
}

/**
 * Validates Git branch names according to Git naming rules
 * @param {string} branchName - The branch name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateBranchName(branchName) {
  if (typeof branchName !== 'string') {
    return false;
  }

  // Git branch name rules:
  // - Cannot be empty
  // - Cannot start or end with a slash
  // - Cannot contain certain special characters
  // - Cannot contain double dots (..)
  // - Cannot contain spaces at the beginning or end
  // - Cannot end with .lock
  const invalidPatterns = [
    /^\//,           // starts with slash
    /\/$/,           // ends with slash
    /\.\./,          // contains double dots
    /[\x00-\x1f\x7f~^:?*\[\\]/,  // contains control chars or special chars
    /\.lock$/,       // ends with .lock
    /@{/,           // contains @{
    /\/\./,          // contains slash-dot
    /^\./,           // starts with dot
    /\/$/,           // ends with slash
  ];

  return branchName.length > 0 &&
         branchName.length <= 250 &&
         branchName.trim() === branchName &&
         !invalidPatterns.some(pattern => pattern.test(branchName));
}

/**
 * Validates URL schemes to prevent dangerous protocols
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL scheme is safe, false otherwise
 */
export function isValidUrlScheme(url) {
  if (typeof url !== 'string') {
    return false;
  }

  // Allow relative URLs (no scheme)
  if (!url.includes(':')) {
    return true;
  }

  // Extract the scheme (everything before the first colon)
  const scheme = url.split(':')[0].toLowerCase();

  // Allowed schemes (whitelist approach)
  const allowedSchemes = ['http', 'https', 'mailto', 'tel', 'ftp', 'ftps'];

  return allowedSchemes.includes(scheme);
}

/**
 * Prevents path traversal attacks in file paths
 * @param {string} filePath - The file path to sanitize
 * @returns {string} - The sanitized file path
 */
export function preventPathTraversal(filePath) {
  if (typeof filePath !== 'string') {
    return '';
  }

  // Remove any path traversal sequences
  let sanitized = filePath
    .replace(/\.\./g, '') // Remove ..
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash
    .replace(/^\/+/, '')  // Remove leading slashes
    .replace(/\/+$/, ''); // Remove trailing slashes

  // Additional safety: only allow alphanumeric, hyphens, underscores, periods, and forward slashes
  sanitized = sanitized.replace(/[^a-zA-Z0-9._/-]/g, '');

  return sanitized;
}

/**
 * Sanitizes user input for safe display in the UI
 * @param {string} input - The user input to sanitize
 * @returns {string} - The sanitized input
 */
export function sanitizeUserInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Escape HTML entities and limit length
  const maxLength = 1000;
  const truncated = input.length > maxLength ? input.substring(0, maxLength) + '...' : input;
  
  return escapeHtml(truncated);
}

/**
 * Validates and sanitizes a complete GitHub URL
 * @param {string} url - The GitHub URL to validate
 * @returns {object} - Object with isValid boolean and sanitized URL
 */
export function validateGitHubUrl(url) {
  if (typeof url !== 'string') {
    return { isValid: false, sanitizedUrl: '' };
  }

  try {
    const urlObj = new URL(url);
    
    // Only allow GitHub domains
    const allowedHosts = ['github.com', 'api.github.com', 'raw.githubusercontent.com'];
    if (!allowedHosts.includes(urlObj.hostname)) {
      return { isValid: false, sanitizedUrl: '' };
    }

    // Ensure HTTPS
    if (urlObj.protocol !== 'https:') {
      return { isValid: false, sanitizedUrl: '' };
    }

    return { isValid: true, sanitizedUrl: urlObj.toString() };
  } catch (error) {
    return { isValid: false, sanitizedUrl: '' };
  }
}

/**
 * Creates a Content Security Policy (CSP) compliant string for inline styles
 * @param {object} styles - Object containing CSS properties
 * @returns {string} - Safe CSS string
 */
export function createSafeInlineStyle(styles) {
  if (!styles || typeof styles !== 'object') {
    return '';
  }

  const safeStyles = [];
  const allowedProperties = [
    'color', 'background-color', 'font-size', 'font-weight', 'text-align',
    'margin', 'padding', 'border', 'border-radius', 'width', 'height',
    'max-width', 'max-height', 'display', 'position', 'top', 'left',
    'right', 'bottom', 'z-index', 'opacity', 'transform'
  ];

  for (const [property, value] of Object.entries(styles)) {
    const kebabProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    if (allowedProperties.includes(kebabProperty) && typeof value === 'string') {
      // Basic CSS value sanitization
      const sanitizedValue = value.replace(/[<>'"]/g, '');
      safeStyles.push(`${kebabProperty}: ${sanitizedValue}`);
    }
  }

  return safeStyles.join('; ');
}

// Default export for convenience
export default {
  escapeHtml,
  sanitizeHtml,
  validateRepositoryName,
  validateUsername,
  validateBranchName,
  isValidUrlScheme,
  preventPathTraversal,
  sanitizeUserInput,
  validateGitHubUrl,
  createSafeInlineStyle
};
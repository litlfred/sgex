/**
 * Security utilities for XSS protection and input validation
 * Provides comprehensive sanitization and validation functions for user inputs
 */

/**
 * HTML entity mapping for escaping dangerous characters
 */
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Escapes HTML entities to prevent XSS attacks
 * @param {string} input - The input string to escape
 * @returns {string} - The escaped string safe for HTML insertion
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.replace(/[&<>"'`=/]/g, (match) => HTML_ENTITIES[match] || match);
};

/**
 * Validates URL schemes to prevent dangerous redirects
 * Only allows http, https, and mailto schemes
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is safe
 */
export const validateUrlScheme = (url) => {
  if (typeof url !== 'string') {
    return false;
  }
  
  // Empty string or relative URLs are safe
  if (!url || url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
    return true;
  }
  
  try {
    const urlObj = new URL(url);
    const allowedSchemes = ['http:', 'https:', 'mailto:'];
    return allowedSchemes.includes(urlObj.protocol.toLowerCase());
  } catch {
    // If URL constructor fails, treat as relative URL (safe)
    return !url.includes(':');
  }
};

/**
 * Validates repository, username, or branch names for GitHub
 * Prevents injection attacks via repository identifiers
 * @param {string} name - The name to validate
 * @param {string} type - The type of name ('user', 'repo', 'branch')
 * @returns {boolean} - True if the name is valid
 */
export const validateRepositoryIdentifier = (name, type = 'repo') => {
  if (typeof name !== 'string' || !name) {
    return false;
  }
  
  // Common restrictions for all types
  if (name.length > 100 || name.includes('..')) {
    return false;
  }
  
  switch (type) {
    case 'user':
      // GitHub username rules: alphanumeric and hyphens, no consecutive hyphens
      return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(name) && !name.includes('--');
      
    case 'repo':
      // GitHub repository name rules: alphanumeric, hyphens, underscores, dots
      return /^[a-zA-Z0-9._-]+$/.test(name) && 
             !name.startsWith('.') && 
             !name.endsWith('.') &&
             !name.startsWith('-') &&
             !name.endsWith('-');
      
    case 'branch':
      // Git branch name rules: more permissive but prevent dangerous characters
      return /^[^\s~^:?*[\]\\@{}<>|"';`$()]+$/.test(name) && // eslint-disable-line no-useless-escape
             !name.startsWith('.') &&
             !name.endsWith('.') &&
             !name.includes('//') &&
             !name.includes('@{') &&
             name !== 'HEAD';
      
    default:
      return false;
  }
};

/**
 * Validates and sanitizes file paths to prevent path traversal attacks
 * @param {string} path - The file path to validate
 * @param {string[]} allowedExtensions - Optional array of allowed file extensions
 * @returns {string|null} - Sanitized path or null if invalid
 */
export const validateAndSanitizePath = (path, allowedExtensions = []) => {
  if (typeof path !== 'string' || !path) {
    return null;
  }
  
  // Check for null bytes and control characters first
  if (/[\u0000-\u001f\u007f-\u009f]/.test(path)) { // eslint-disable-line no-control-regex
    return null;
  }
  
  // Remove null bytes and normalize
  const cleanPath = path.replace(/\0/g, '').trim();
  
  // Prevent path traversal attacks
  if (cleanPath.includes('..') || 
      cleanPath.includes('//') ||
      cleanPath.startsWith('/')) {
    return null;
  }
  
  // Check for dangerous file patterns
  const dangerousPatterns = [
    /\.(exe|bat|cmd|com|pif|scr|vbs|jar|dll)$/i,
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i, // Windows reserved names
    /\.(htaccess|htpasswd|php|asp|jsp|cgi)$/i
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(cleanPath))) {
    return null;
  }
  
  // Check allowed extensions if specified
  if (allowedExtensions.length > 0) {
    const hasAllowedExtension = allowedExtensions.some(ext => 
      cleanPath.toLowerCase().endsWith(ext.toLowerCase())
    );
    if (!hasAllowedExtension) {
      return null;
    }
  }
  
  return cleanPath;
};

/**
 * Comprehensive input sanitization function
 * Applies appropriate sanitization based on the input type
 * @param {any} input - The input to sanitize
 * @param {string} type - The type of input ('html', 'url', 'user', 'repo', 'branch', 'path')
 * @param {Object} options - Additional options for specific types
 * @returns {string|null} - Sanitized input or null if invalid
 */
export const sanitizeInput = (input, type = 'html', options = {}) => {
  if (input === null || input === undefined) {
    return null;
  }
  
  const inputStr = String(input);
  
  switch (type) {
    case 'html':
      return sanitizeHtml(inputStr);
      
    case 'url':
      return validateUrlScheme(inputStr) ? inputStr : null;
      
    case 'user':
      return validateRepositoryIdentifier(inputStr, 'user') ? inputStr : null;
      
    case 'repo':
      return validateRepositoryIdentifier(inputStr, 'repo') ? inputStr : null;
      
    case 'branch':
      return validateRepositoryIdentifier(inputStr, 'branch') ? inputStr : null;
      
    case 'path':
      return validateAndSanitizePath(inputStr, options.allowedExtensions);
      
    default:
      // Default to HTML sanitization for unknown types
      return sanitizeHtml(inputStr);
  }
};

/**
 * Safe HTML creator that prevents XSS while allowing basic formatting
 * Creates HTML elements with sanitized content
 * @param {string} tag - The HTML tag to create
 * @param {string} content - The content to sanitize and insert
 * @param {Object} attributes - Safe attributes to add to the element
 * @returns {string} - Safe HTML string
 */
export const createSafeHtml = (tag, content, attributes = {}) => {
  if (typeof tag !== 'string' || typeof content !== 'string') {
    return '';
  }
  
  // Only allow safe HTML tags
  const allowedTags = ['div', 'span', 'p', 'br', 'strong', 'em', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!allowedTags.includes(tag.toLowerCase())) {
    tag = 'div';
  }
  
  const sanitizedContent = sanitizeHtml(content);
  
  // Sanitize attributes
  const safeAttributes = Object.entries(attributes)
    .filter(([key]) => /^[a-zA-Z-]+$/.test(key) && !key.startsWith('on')) // No event handlers
    .map(([key, value]) => `${key}="${sanitizeHtml(String(value))}"`)
    .join(' ');
  
  const attributeStr = safeAttributes ? ` ${safeAttributes}` : '';
  
  return `<${tag}${attributeStr}>${sanitizedContent}</${tag}>`;
};

/**
 * Validates GitHub API parameters to prevent injection attacks
 * @param {Object} params - Object containing GitHub API parameters
 * @returns {Object|null} - Validated parameters or null if invalid
 */
export const validateGitHubApiParams = (params) => {
  if (!params || typeof params !== 'object') {
    return null;
  }
  
  const validatedParams = {};
  
  // Validate common GitHub API parameters
  if (params.owner) {
    const sanitizedOwner = sanitizeInput(params.owner, 'user');
    if (!sanitizedOwner) return null;
    validatedParams.owner = sanitizedOwner;
  }
  
  if (params.repo) {
    const sanitizedRepo = sanitizeInput(params.repo, 'repo');
    if (!sanitizedRepo) return null;
    validatedParams.repo = sanitizedRepo;
  }
  
  if (params.branch) {
    const sanitizedBranch = sanitizeInput(params.branch, 'branch');
    if (!sanitizedBranch) return null;
    validatedParams.branch = sanitizedBranch;
  }
  
  if (params.path) {
    const sanitizedPath = sanitizeInput(params.path, 'path');
    if (sanitizedPath === null) return null;
    validatedParams.path = sanitizedPath;
  }
  
  // Copy other string parameters with HTML sanitization
  Object.entries(params).forEach(([key, value]) => {
    if (!validatedParams[key] && typeof value === 'string') {
      validatedParams[key] = sanitizeHtml(value);
    } else if (!validatedParams[key]) {
      validatedParams[key] = value;
    }
  });
  
  return validatedParams;
};

const securityUtils = {
  sanitizeHtml,
  validateUrlScheme,
  validateRepositoryIdentifier,
  validateAndSanitizePath,
  sanitizeInput,
  createSafeHtml,
  validateGitHubApiParams
};

export default securityUtils;
/**
 * Security utilities for XSS protection and input validation
 * Provides comprehensive sanitization and validation functions
 */

/**
 * HTML entity mapping for escaping
 */
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
  '=': '&#x3D;'
};

/**
 * Allowed URL schemes for safe redirects
 */
const ALLOWED_URL_SCHEMES = [
  'http:',
  'https:',
  'mailto:',
  'tel:',
  'ftp:'
];

/**
 * GitHub-specific validation patterns
 */
const GITHUB_PATTERNS = {
  // Username/organization: alphanumeric, hyphens, max 39 chars
  username: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
  // Repository name: alphanumeric, hyphens, underscores, periods, max 100 chars
  repository: /^[a-zA-Z0-9._-]{1,100}$/,
  // Branch name: no spaces, no control chars, no path separators, allow slashes for feature branches
  // eslint-disable-next-line no-control-regex
  branch: /^[^\s\x00-\x1f\x7f\\:*?"<>|]{1,250}$/,
  // File path: prevent path traversal, limit length
  // eslint-disable-next-line no-control-regex
  filePath: /^[^<>:"|?*\x00-\x1f\x7f]*$/
};

/**
 * Escapes HTML entities to prevent XSS attacks
 * @param {string} str - String to escape
 * @returns {string} - Escaped string safe for HTML insertion
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  
  return str.replace(/[&<>"'`=/]/g, (match) => HTML_ENTITIES[match] || match);
};

/**
 * Sanitizes text content by escaping HTML and limiting length
 * @param {string} content - Content to sanitize
 * @param {number} maxLength - Maximum allowed length (default: 10000)
 * @returns {string} - Sanitized content
 */
export const sanitizeTextContent = (content, maxLength = 10000) => {
  if (typeof content !== 'string') {
    return '';
  }
  
  // Trim and limit length
  const trimmed = content.trim().substring(0, maxLength);
  
  // Escape HTML entities
  return escapeHtml(trimmed);
};

/**
 * Validates and sanitizes URLs to prevent malicious redirects
 * @param {string} url - URL to validate
 * @param {boolean} allowRelative - Whether to allow relative URLs (default: true)
 * @returns {Object} - { isValid: boolean, sanitizedUrl: string, error?: string }
 */
export const validateUrl = (url, allowRelative = true) => {
  if (typeof url !== 'string') {
    return { isValid: false, sanitizedUrl: '', error: 'URL must be a string' };
  }
  
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { isValid: false, sanitizedUrl: '', error: 'URL cannot be empty' };
  }
  
  // Check for relative URLs
  if (allowRelative && (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./'))) {
    // Basic validation for relative paths - no dangerous patterns
    if (trimmedUrl.includes('..') || trimmedUrl.includes('//')) {
      return { isValid: false, sanitizedUrl: '', error: 'Invalid relative URL path' };
    }
    return { isValid: true, sanitizedUrl: trimmedUrl };
  }
  
  // Check for path traversal patterns in what might be intended as relative URLs
  if (allowRelative && trimmedUrl.includes('..')) {
    return { isValid: false, sanitizedUrl: '', error: 'Invalid relative URL path' };
  }
  
  // Validate absolute URLs
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Prevent javascript: and data: URLs explicitly
    // eslint-disable-next-line no-script-url
    if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
      return { 
        isValid: false, 
        sanitizedUrl: '', 
        error: 'JavaScript and data URLs are not allowed' 
      };
    }
    
    // Check if scheme is allowed
    if (!ALLOWED_URL_SCHEMES.includes(urlObj.protocol)) {
      return { 
        isValid: false, 
        sanitizedUrl: '', 
        error: `URL scheme '${urlObj.protocol}' is not allowed` 
      };
    }
    
    return { isValid: true, sanitizedUrl: urlObj.toString() };
  } catch (error) {
    return { isValid: false, sanitizedUrl: '', error: 'Invalid URL format' };
  }
};

/**
 * Validates GitHub username/organization name
 * @param {string} username - Username to validate
 * @returns {Object} - { isValid: boolean, sanitizedUsername: string, error?: string }
 */
export const validateGitHubUsername = (username) => {
  if (typeof username !== 'string') {
    return { isValid: false, sanitizedUsername: '', error: 'Username must be a string' };
  }
  
  const trimmed = username.trim();
  
  if (!trimmed) {
    return { isValid: false, sanitizedUsername: '', error: 'Username cannot be empty' };
  }
  
  if (!GITHUB_PATTERNS.username.test(trimmed)) {
    return { 
      isValid: false, 
      sanitizedUsername: '', 
      error: 'Invalid GitHub username format' 
    };
  }
  
  return { isValid: true, sanitizedUsername: trimmed };
};

/**
 * Validates GitHub repository name
 * @param {string} repository - Repository name to validate
 * @returns {Object} - { isValid: boolean, sanitizedRepository: string, error?: string }
 */
export const validateGitHubRepository = (repository) => {
  if (typeof repository !== 'string') {
    return { isValid: false, sanitizedRepository: '', error: 'Repository name must be a string' };
  }
  
  const trimmed = repository.trim();
  
  if (!trimmed) {
    return { isValid: false, sanitizedRepository: '', error: 'Repository name cannot be empty' };
  }
  
  if (!GITHUB_PATTERNS.repository.test(trimmed)) {
    return { 
      isValid: false, 
      sanitizedRepository: '', 
      error: 'Invalid GitHub repository name format' 
    };
  }
  
  return { isValid: true, sanitizedRepository: trimmed };
};

/**
 * Validates GitHub branch name
 * @param {string} branch - Branch name to validate
 * @returns {Object} - { isValid: boolean, sanitizedBranch: string, error?: string }
 */
export const validateGitHubBranch = (branch) => {
  if (typeof branch !== 'string') {
    return { isValid: false, sanitizedBranch: '', error: 'Branch name must be a string' };
  }
  
  const trimmed = branch.trim();
  
  if (!trimmed) {
    return { isValid: false, sanitizedBranch: '', error: 'Branch name cannot be empty' };
  }
  
  if (!GITHUB_PATTERNS.branch.test(trimmed)) {
    return { 
      isValid: false, 
      sanitizedBranch: '', 
      error: 'Invalid GitHub branch name format' 
    };
  }
  
  return { isValid: true, sanitizedBranch: trimmed };
};

/**
 * Validates and sanitizes file paths to prevent path traversal attacks
 * @param {string} filePath - File path to validate
 * @returns {Object} - { isValid: boolean, sanitizedPath: string, error?: string }
 */
export const validateFilePath = (filePath) => {
  if (typeof filePath !== 'string') {
    return { isValid: false, sanitizedPath: '', error: 'File path must be a string' };
  }
  
  const trimmed = filePath.trim();
  
  if (!trimmed) {
    return { isValid: false, sanitizedPath: '', error: 'File path cannot be empty' };
  }
  
  // Check for path traversal attempts
  if (trimmed.includes('..') || trimmed.includes('//')) {
    return { 
      isValid: false, 
      sanitizedPath: '', 
      error: 'Path traversal patterns not allowed' 
    };
  }
  
  // Check for invalid characters
  if (!GITHUB_PATTERNS.filePath.test(trimmed)) {
    return { 
      isValid: false, 
      sanitizedPath: '', 
      error: 'Invalid characters in file path' 
    };
  }
  
  // Normalize path separators and remove leading slashes
  const normalized = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
  
  return { isValid: true, sanitizedPath: normalized };
};

/**
 * Safely renders markdown content by sanitizing HTML output
 * @param {string} markdown - Markdown content to render
 * @param {Object} options - Rendering options
 * @returns {string} - Sanitized HTML output
 */
export const sanitizeMarkdown = (markdown, options = {}) => {
  if (typeof markdown !== 'string') {
    return '';
  }
  
  const { 
    maxLength = 50000,
    allowLinks = true,
    allowImages = true
  } = options;
  
  // Limit content length
  let content = markdown.trim().substring(0, maxLength);
  
  // First, escape all HTML content to prevent any embedded scripts or malicious HTML
  content = escapeHtml(content);
  
  // Basic markdown to HTML conversion with sanitization
  let html = content;
  
  // Process tables first
  html = html.replace(/(\|[^\n]+\|\n\|[-\s|:]+\|\n(?:\|[^\n]+\|\n?)*)/gm, (match) => {
    const lines = match.trim().split('\n');
    const headers = lines[0].split('|').slice(1, -1).map(h => h.trim()); // Already escaped
    const rows = lines.slice(2).map(row => 
      row.split('|').slice(1, -1).map(cell => cell.trim()) // Already escaped
    );
    
    let tableHtml = '<table class="doc-table">\n<thead>\n<tr>\n';
    headers.forEach(header => {
      tableHtml += `<th>${header}</th>\n`;
    });
    tableHtml += '</tr>\n</thead>\n<tbody>\n';
    
    rows.forEach(row => {
      tableHtml += '<tr>\n';
      row.forEach(cell => {
        tableHtml += `<td>${cell}</td>\n`;
      });
      tableHtml += '</tr>\n';
    });
    
    tableHtml += '</tbody>\n</table>\n';
    return tableHtml;
  });
  
  // Convert headers - since content is already escaped, we need to decode specific patterns
  html = html.replace(/^# (.*$)/gim, (match, text) => `<h1>${text}</h1>`);
  html = html.replace(/^## (.*$)/gim, (match, text) => `<h2>${text}</h2>`);
  html = html.replace(/^### (.*$)/gim, (match, text) => `<h3>${text}</h3>`);
  html = html.replace(/^#### (.*$)/gim, (match, text) => `<h4>${text}</h4>`);
  
  // Convert formatting - handle escaped characters
  html = html.replace(/\*\*(.*?)\*\*/gim, (match, text) => `<strong>${text}</strong>`);
  html = html.replace(/\*(.*?)\*/gim, (match, text) => `<em>${text}</em>`);
  html = html.replace(/`([^`]*)`/gim, (match, text) => `<code>${text}</code>`);
  
  // Convert images with validation - work with escaped content
  if (allowImages) {
    html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, (match, alt, src) => {
      // Decode the escaped URLs for validation  
      const decodedSrc = src.replace(/&amp;/g, '&').replace(/&#x2F;/g, '/').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      const urlValidation = validateUrl(decodedSrc);
      if (urlValidation.isValid) {
        return `<img alt="${alt}" src="${urlValidation.sanitizedUrl}" />`;
      }
      return `[Image: ${alt}]`;
    });
  } else {
    html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, (match, alt) => `[Image: ${alt}]`);
  }
  
  // Convert links with validation - work with escaped content
  if (allowLinks) {
    html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/gim, (match, text, href) => {
      // Decode the escaped URLs for validation
      const decodedHref = href.replace(/&amp;/g, '&').replace(/&#x2F;/g, '/').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      const urlValidation = validateUrl(decodedHref);
      if (urlValidation.isValid) {
        return `<a href="${urlValidation.sanitizedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      return text;
    });
  } else {
    html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/gim, (match, text) => text);
  }
  
  // Convert lists
  html = html.replace(/^- (.*$)/gim, (match, text) => `<li>${text}</li>`);
  html = html.replace(/^\* (.*$)/gim, (match, text) => `<li>${text}</li>`);
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li>.*<\/li>\s*)+/gim, (match) => `<ul>\n${match}</ul>\n`);
  
  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraphs if not already wrapped
  if (!html.includes('<p>') && !html.includes('<h1>') && !html.includes('<h2>')) {
    html = `<p>${html}</p>`;
  }
  
  return html;
};

/**
 * Validates multiple GitHub parameters at once
 * @param {Object} params - Object with username, repository, branch, filePath
 * @returns {Object} - Validation results and sanitized values
 */
export const validateGitHubParams = (params) => {
  const results = {
    isValid: true,
    sanitized: {},
    errors: []
  };
  
  if (params.username !== undefined) {
    const usernameResult = validateGitHubUsername(params.username);
    if (!usernameResult.isValid) {
      results.isValid = false;
      results.errors.push(`Username: ${usernameResult.error}`);
    } else {
      results.sanitized.username = usernameResult.sanitizedUsername;
    }
  }
  
  if (params.repository !== undefined) {
    const repoResult = validateGitHubRepository(params.repository);
    if (!repoResult.isValid) {
      results.isValid = false;
      results.errors.push(`Repository: ${repoResult.error}`);
    } else {
      results.sanitized.repository = repoResult.sanitizedRepository;
    }
  }
  
  if (params.branch !== undefined) {
    const branchResult = validateGitHubBranch(params.branch);
    if (!branchResult.isValid) {
      results.isValid = false;
      results.errors.push(`Branch: ${branchResult.error}`);
    } else {
      results.sanitized.branch = branchResult.sanitizedBranch;
    }
  }
  
  if (params.filePath !== undefined) {
    const pathResult = validateFilePath(params.filePath);
    if (!pathResult.isValid) {
      results.isValid = false;
      results.errors.push(`File path: ${pathResult.error}`);
    } else {
      results.sanitized.filePath = pathResult.sanitizedPath;
    }
  }
  
  return results;
};

/**
 * General input sanitization for various data types
 * @param {any} input - Input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {any} - Sanitized input
 */
export const sanitizeInput = (input, options = {}) => {
  const { 
    type = 'string',
    maxLength = 1000,
    allowHtml = false,
    allowEmpty = true
  } = options;
  
  if (input === null || input === undefined) {
    return allowEmpty ? (type === 'string' ? '' : null) : null;
  }
  
  switch (type) {
    case 'string':
      const str = String(input).trim().substring(0, maxLength);
      return allowHtml ? str : escapeHtml(str);
      
    case 'number':
      const num = Number(input);
      return isNaN(num) ? null : num;
      
    case 'boolean':
      return Boolean(input);
      
    case 'array':
      return Array.isArray(input) ? input.map(item => 
        sanitizeInput(item, { ...options, type: 'string' })
      ) : [];
      
    default:
      return allowHtml ? input : escapeHtml(String(input));
  }
};

// Export object with all functions
const securityUtils = {
  escapeHtml,
  sanitizeTextContent,
  validateUrl,
  validateGitHubUsername,
  validateGitHubRepository,
  validateGitHubBranch,
  validateFilePath,
  sanitizeMarkdown,
  validateGitHubParams,
  sanitizeInput
};

export default securityUtils;
/**
 * Security Configuration for SGEX Workbench
 * Provides security headers and CSP configuration for production deployment
 */

/**
 * Generate security headers for production deployment
 * These headers should be configured in your web server (Apache, Nginx, etc.)
 * or deployment platform (Netlify, Vercel, etc.)
 */
export const getSecurityHeaders = () => {
  return {
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // React needs unsafe-inline and unsafe-eval in some cases
      "style-src 'self' 'unsafe-inline'", // Styled components need unsafe-inline
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.github.com https://*.github.com",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; '),

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',

    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Prevent HTTPS downgrade attacks
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // Feature policy for privacy
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'magnetometer=()',
      'gyroscope=()',
      'fullscreen=(self)',
      'payment=()'
    ].join(', ')
  };
};

/**
 * Netlify-specific headers configuration
 * Create a _headers file in the public directory with these headers
 */
export const getNetlifyHeaders = () => {
  const headers = getSecurityHeaders();
  let netlifyConfig = '/*\n';
  
  Object.entries(headers).forEach(([key, value]) => {
    netlifyConfig += `  ${key}: ${value}\n`;
  });
  
  return netlifyConfig;
};

/**
 * Apache .htaccess configuration for security headers
 */
export const getApacheHeaders = () => {
  const headers = getSecurityHeaders();
  let htaccess = '# Security Headers\n';
  
  Object.entries(headers).forEach(([key, value]) => {
    htaccess += `Header always set ${key} "${value}"\n`;
  });
  
  return htaccess;
};

/**
 * Nginx configuration for security headers
 */
export const getNginxHeaders = () => {
  const headers = getSecurityHeaders();
  let nginx = '# Security Headers\n';
  
  Object.entries(headers).forEach(([key, value]) => {
    nginx += `add_header ${key} "${value}" always;\n`;
  });
  
  return nginx;
};

/**
 * Development-friendly CSP for local development
 * This is more permissive than production CSP
 */
export const getDevelopmentCSP = () => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:* 127.0.0.1:*",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.github.com https://*.github.com localhost:* 127.0.0.1:* ws://localhost:* ws://127.0.0.1:*",
    "media-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};

/**
 * Security recommendations for deployment
 */
export const getSecurityRecommendations = () => {
  return {
    deployment: [
      'Enable HTTPS for all traffic',
      'Configure security headers in your web server or CDN',
      'Regularly update dependencies to patch security vulnerabilities',
      'Monitor access logs for suspicious activity',
      'Implement rate limiting to prevent abuse',
      'Use a Web Application Firewall (WAF) if possible'
    ],
    
    development: [
      'Never commit secrets or tokens to version control',
      'Use environment variables for sensitive configuration',
      'Regularly run npm audit to check for vulnerabilities',
      'Validate and sanitize all user inputs',
      'Use the secure token storage service for PATs',
      'Test with CSP enabled to catch inline script issues'
    ],
    
    userEducation: [
      'Educate users about GitHub PAT security best practices',
      'Recommend using fine-grained PATs when possible',
      'Advise users to regularly rotate their tokens',
      'Provide clear instructions for token permissions',
      'Warn about token sharing and security risks'
    ]
  };
};

export default {
  getSecurityHeaders,
  getNetlifyHeaders,
  getApacheHeaders,
  getNginxHeaders,
  getDevelopmentCSP,
  getSecurityRecommendations
};
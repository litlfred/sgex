/**
 * SAML Error Detection and Handling Utilities
 * 
 * Provides utilities for detecting SAML enforcement errors from GitHub API
 * and creating appropriate user guidance messages.
 */

/**
 * Checks if an error is a SAML enforcement error
 * @param {Error} error - The error object to check
 * @returns {boolean} True if the error is SAML-related
 */
export const isSAMLError = (error) => {
  if (!error) return false;
  
  // Check for explicit SAML error flag first (set by our own code)
  if (error.isSAMLError === true) {
    return true;
  }
  
  // Check for SAML enforcement in error message
  const message = error.message || '';
  const lowerMessage = message.toLowerCase();
  
  return (
    error.status === 403 && 
    (
      lowerMessage.includes('saml enforcement') ||
      lowerMessage.includes('saml single sign-on') ||
      lowerMessage.includes('saml authorization required') ||
      message.includes('must grant your Personal Access token access to this organization')
    )
  );
};

/**
 * Extracts organization name from SAML error
 * @param {Error} error - The SAML error
 * @param {string} fallbackOrg - Fallback organization name
 * @returns {string} Organization name
 */
export const extractOrganizationFromSAMLError = (error, fallbackOrg = 'organization') => {
  const message = error?.message || '';
  
  // Try to extract organization name from common error patterns
  const patterns = [
    /organization ([A-Za-z0-9-_]+)/i,
    /org ([A-Za-z0-9-_]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return fallbackOrg;
};

/**
 * Creates SAML authorization URL for a specific organization
 * @param {string} organization - The GitHub organization name
 * @returns {string} The authorization URL
 */
export const createSAMLAuthorizationURL = (organization) => {
  // GitHub's SAML authorization URL pattern with return URL
  const currentUrl = window.location.origin + window.location.pathname;
  const returnUrl = `${currentUrl}?saml_authorized=1&org=${organization}`;
  
  // GitHub's SAML SSO URL with return_to parameter
  return `https://github.com/orgs/${organization}/sso?return_to=${encodeURIComponent(returnUrl)}`;
};

/**
 * Creates user-friendly SAML error information
 * @param {Error} error - The SAML error
 * @param {string} organization - The organization name
 * @param {Object} options - Configuration options
 * @returns {Object} SAML error information
 */
export const createSAMLErrorInfo = (error, organization, options = {}) => {
  const { isRequired = false, context = 'access organization data' } = options;
  
  return {
    type: 'saml_enforcement',
    organization,
    isRequired,
    context,
    authorizationURL: createSAMLAuthorizationURL(organization),
    documentationURL: 'https://docs.github.com/articles/authenticating-to-a-github-organization-with-saml-single-sign-on/',
    title: isRequired ? 'SAML Authorization Required' : 'SAML Authorization Available',
    message: isRequired 
      ? `Access to ${organization} requires SAML authorization to ${context}.`
      : `Your Personal Access Token can be authorized for ${organization} to ${context}.`,
    instructions: [
      `Click the "Authorize SAML" button to navigate to GitHub's authorization page`,
      `Sign in to your organization's SAML identity provider if prompted`,
      `Click "Authorize" to grant your Personal Access Token access to ${organization}`,
      `You'll be automatically redirected back to SGEX Workbench after authorization`
    ],
    severity: isRequired ? 'error' : 'warning'
  };
};

/**
 * Checks if a SAML authorization attempt is possible
 * @param {string} organization - The organization name
 * @returns {boolean} True if SAML authorization can be attempted
 */
export const canAttemptSAMLAuthorization = (organization) => {
  // Basic validation for organization name
  if (!organization || typeof organization !== 'string' || organization.trim().length === 0) {
    return false;
  }
  
  return /^[A-Za-z0-9-_]+$/.test(organization);
};
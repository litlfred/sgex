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
  // Get the current URL information
  const currentOrigin = window.location.origin;
  const currentPathname = window.location.pathname;
  
  // Store the return URL in localStorage as a fallback mechanism
  // This helps in case GitHub's return_to parameter doesn't work properly
  const returnUrl = `${currentOrigin}${currentPathname}?saml_authorized=1&org=${organization}`;
  
  try {
    localStorage.setItem('saml_return_url', returnUrl);
    localStorage.setItem('saml_org', organization);
    localStorage.setItem('saml_timestamp', Date.now().toString());
    console.log('Stored SAML return info in localStorage:', { returnUrl, organization });
  } catch (e) {
    console.warn('Could not store SAML return info in localStorage:', e);
  }
  
  console.log('SAML Authorization URL Debug:', {
    origin: currentOrigin,
    pathname: currentPathname,
    isGitHubPages: currentOrigin.includes('github.io'),
    returnUrl,
    encodedReturnUrl: encodeURIComponent(returnUrl),
    organization
  });
  
  // Create GitHub's SAML SSO URL with return_to parameter
  // We'll use both the return_to parameter AND localStorage fallback
  const encodedReturnUrl = encodeURIComponent(returnUrl);
  const authUrl = `https://github.com/orgs/${organization}/sso?return_to=${encodedReturnUrl}`;
  
  console.log('Final SAML authorization URL:', authUrl);
  console.log('Expected return after SAML:', returnUrl);
  
  return authUrl;
};

/**
 * Checks if user returned from SAML authorization and handles fallback
 * @returns {Object|null} SAML return info if detected
 */
export const detectSAMLReturn = () => {
  // First check URL parameters (primary method)
  const urlParams = new URLSearchParams(window.location.search);
  const samlAuthorized = urlParams.get('saml_authorized') === '1';
  const authorizedOrg = urlParams.get('org');
  
  if (samlAuthorized && authorizedOrg) {
    console.log('SAML return detected via URL parameters');
    return { organization: authorizedOrg, method: 'url_params' };
  }
  
  // Enhanced fallback: Check if user came from GitHub and we have localStorage data
  const referrer = document.referrer;
  const fromGitHub = referrer && referrer.includes('github.com');
  
  // Also check localStorage even without GitHub referrer (for manual navigation cases)
  const checkStoredData = fromGitHub || true; // Always check localStorage as fallback
  
  if (checkStoredData) {
    try {
      const storedReturnUrl = localStorage.getItem('saml_return_url');
      const storedOrg = localStorage.getItem('saml_org');
      const storedTimestamp = localStorage.getItem('saml_timestamp');
      
      // Check if the stored data is recent (within last 15 minutes for more flexibility)
      const isRecent = storedTimestamp && (Date.now() - parseInt(storedTimestamp)) < 15 * 60 * 1000;
      
      if (storedOrg && isRecent) {
        console.log('SAML return detected via localStorage fallback', {
          organization: storedOrg,
          storedReturnUrl,
          timestamp: new Date(parseInt(storedTimestamp)),
          referrer: referrer,
          fromGitHub: fromGitHub,
          method: fromGitHub ? 'localStorage_with_github_referrer' : 'localStorage_manual_return'
        });
        
        // Clear the stored data to prevent repeat processing
        localStorage.removeItem('saml_return_url');
        localStorage.removeItem('saml_org');
        localStorage.removeItem('saml_timestamp');
        
        // Add the parameters to the current URL for consistency
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('saml_authorized', '1');
        currentUrl.searchParams.set('org', storedOrg);
        window.history.replaceState({}, document.title, currentUrl.href);
        
        return { 
          organization: storedOrg, 
          method: fromGitHub ? 'localStorage_with_github_referrer' : 'localStorage_manual_return',
          referrer: referrer 
        };
      } else if (storedOrg && !isRecent) {
        console.log('Found old SAML localStorage data, clearing it', {
          organization: storedOrg,
          age: storedTimestamp ? (Date.now() - parseInt(storedTimestamp)) / 1000 / 60 : 'unknown',
          timestamp: storedTimestamp ? new Date(parseInt(storedTimestamp)) : 'unknown'
        });
        
        // Clear old data to prevent confusion
        localStorage.removeItem('saml_return_url');
        localStorage.removeItem('saml_org');
        localStorage.removeItem('saml_timestamp');
      }
    } catch (e) {
      console.warn('Error checking localStorage for SAML return data:', e);
    }
  }
  
  return null;
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
      `Click the "Authorize SAML" button to open GitHub's authorization page in a new tab`,
      `Sign in to your organization's SAML identity provider if prompted`,
      `Click "Authorize" to grant your Personal Access Token access to ${organization}`,
      `Return to this tab - SGEX will automatically detect when authorization is complete`
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
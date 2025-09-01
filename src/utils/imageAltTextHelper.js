/**
 * Image Alt Text Helper Utility
 * 
 * Provides utilities for extracting meaningful alt text from image filenames
 * and managing translatable alt text keys.
 */

/**
 * Extract meaningful description from image filename
 * @param {string} filename - The image filename (e.g., "sgex-mascot.png", "authoring_grey_tabby.png")
 * @returns {string} - Descriptive text suitable for alt attributes
 */
export function extractAltTextFromFilename(filename) {
  if (!filename) return '';
  
  // Remove file extension and path
  const baseName = filename.replace(/^.*\//, '').replace(/\.[^.]*$/, '');
  
  // Handle special theme variants (grey_tabby, dark mode, etc.)
  const cleanName = baseName.replace(/_grey_tabby$/, '').replace(/_dark$/, '');
  
  // Common filename patterns and their descriptions
  const patterns = {
    'sgex-mascot': 'SGEX Mascot',
    'authoring': 'Authoring Interface',
    'collaboration': 'Collaboration Features', 
    'create': 'Create New DAK',
    'editing': 'Editing Interface',
    'forking': 'Repository Forking',
    'experiment': 'Experimental Features',
    'bug-report-icon': 'Bug Report Icon',
    'cat-paw-lock-icon': 'Security Lock Icon',
    'cat-paw-bug-icon': 'Bug Icon',
    'logo192': 'SGEX Logo (192px)',
    'logo512': 'SGEX Logo (512px)',
    'workflow': 'Workflow Diagram'
  };
  
  // Check for exact matches first
  if (patterns[cleanName]) {
    return patterns[cleanName];
  }
  
  // Try to match partial patterns
  for (const [pattern, description] of Object.entries(patterns)) {
    if (cleanName.includes(pattern)) {
      return description;
    }
  }
  
  // Fallback: convert kebab-case and snake_case to title case
  return cleanName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim() || 'Image';
}

/**
 * Generate translation key for alt text based on context
 * @param {string} context - The context (e.g., 'mascot', 'avatar', 'icon', 'logo')
 * @param {string} variant - Optional variant (e.g., 'user', 'organization', 'helper')
 * @returns {string} - Translation key (e.g., 'altText.mascot.helper')
 */
export function generateAltTextKey(context, variant = null) {
  const baseKey = 'altText';
  if (variant) {
    return `${baseKey}.${context}.${variant}`;
  }
  return `${baseKey}.${context}`;
}

/**
 * Common alt text translation keys used throughout the application
 */
export const ALT_TEXT_KEYS = {
  // SGEX Mascot variations
  MASCOT_HELPER: 'altText.mascot.helper',
  MASCOT_ICON: 'altText.mascot.icon',
  MASCOT_EXAMINING: 'altText.mascot.examining',
  MASCOT_CELEBRATING: 'altText.mascot.celebrating',
  MASCOT_CODING: 'altText.mascot.coding',
  MASCOT_COMMUNITY: 'altText.mascot.community',
  
  // User/Profile images
  AVATAR_USER: 'altText.avatar.user',
  AVATAR_ORGANIZATION: 'altText.avatar.organization',
  AVATAR_PERSONAL: 'altText.avatar.personal',
  AVATAR_PROFILE: 'altText.avatar.profile',
  
  // Interface icons and images
  ICON_SGEX: 'altText.icon.sgex',
  ICON_BUG_REPORT: 'altText.icon.bugReport',
  ICON_SECURITY: 'altText.icon.security',
  ICON_ACTION: 'altText.icon.action',
  ICON_DAK_COMPONENT: 'altText.icon.dakComponent',
  
  // Feature/workflow images
  IMAGE_AUTHORING: 'altText.image.authoring',
  IMAGE_COLLABORATION: 'altText.image.collaboration',
  IMAGE_WORKFLOW: 'altText.image.workflow',
  IMAGE_PRONUNCIATION: 'altText.image.pronunciation',
  
  // Logos
  LOGO_SGEX: 'altText.logo.sgex',
  LOGO_WHO: 'altText.logo.who'
};

/**
 * Get alt text with fallback for dynamic content
 * @param {Function} t - Translation function from useTranslation
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text if translation is missing
 * @param {Object} interpolation - Variables for translation interpolation
 * @returns {string} - Translated alt text or fallback
 */
export function getAltText(t, key, fallback, interpolation = {}) {
  try {
    const translated = t(key, interpolation);
    // If translation returns the key itself, use fallback
    return translated === key ? fallback : translated;
  } catch (error) {
    console.warn(`Alt text translation failed for key: ${key}`, error);
    return fallback;
  }
}

/**
 * Generate alt text for user/organization avatars
 * @param {Function} t - Translation function
 * @param {Object} entity - User or organization object
 * @param {string} type - 'user' or 'organization'
 * @returns {string} - Appropriate alt text
 */
export function getAvatarAltText(t, entity, type = 'user') {
  if (!entity) {
    return getAltText(t, ALT_TEXT_KEYS.AVATAR_PROFILE, 'Profile avatar');
  }
  
  const name = entity.name || entity.display_name || entity.login;
  const key = type === 'organization' ? ALT_TEXT_KEYS.AVATAR_ORGANIZATION : ALT_TEXT_KEYS.AVATAR_USER;
  
  return getAltText(t, key, `${name} avatar`, { name });
}

const imageAltTextHelper = {
  extractAltTextFromFilename,
  generateAltTextKey,
  getAltText,
  getAvatarAltText,
  ALT_TEXT_KEYS
};

export default imageAltTextHelper;
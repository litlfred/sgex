/**
 * Image Alt Text Helper Utility
 * 
 * Provides utilities for extracting meaningful alt text from image filenames
 * and managing translatable alt text keys.
 * 
 * @module imageAltTextHelper
 */

/**
 * Translation function type from i18next
 */
export type TranslationFunction = (key: string, interpolation?: Record<string, unknown>) => string;

/**
 * Entity with avatar (user or organization)
 * @example { "login": "user123", "name": "John Doe", "display_name": "John" }
 */
export interface AvatarEntity {
  /** GitHub login username */
  login?: string;
  /** Display name */
  name?: string;
  /** Alternative display name */
  display_name?: string;
}

/**
 * Type for avatar entity types
 * @example "user"
 */
export type AvatarType = 'user' | 'organization';

/**
 * Filename patterns mapped to descriptions
 * @example { "sgex-mascot": "SGEX Mascot" }
 */
export interface FilenamePatterns {
  [key: string]: string;
}

/**
 * Extract meaningful description from image filename
 * @param filename - The image filename (e.g., "sgex-mascot.png", "authoring_grey_tabby.png")
 * @returns Descriptive text suitable for alt attributes
 * 
 * @example
 * extractAltTextFromFilename("sgex-mascot.png"); // "SGEX Mascot"
 * extractAltTextFromFilename("authoring_grey_tabby.png"); // "Authoring Interface"
 */
export function extractAltTextFromFilename(filename: string): string {
  if (!filename) return '';
  
  // Remove file extension and path
  const baseName = filename.replace(/^.*\//, '').replace(/\.[^.]*$/, '');
  
  // Handle special theme variants (grey_tabby, dark mode, etc.)
  const cleanName = baseName.replace(/_grey_tabby$/, '').replace(/_dark$/, '');
  
  // Common filename patterns and their descriptions
  const patterns: FilenamePatterns = {
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
 * @param context - The context (e.g., 'mascot', 'avatar', 'icon', 'logo')
 * @param variant - Optional variant (e.g., 'user', 'organization', 'helper')
 * @returns Translation key (e.g., 'altText.mascot.helper')
 * 
 * @example
 * generateAltTextKey("mascot", "helper"); // "altText.mascot.helper"
 * generateAltTextKey("logo"); // "altText.logo"
 */
export function generateAltTextKey(context: string, variant: string | null = null): string {
  const baseKey = 'altText';
  if (variant) {
    return `${baseKey}.${context}.${variant}`;
  }
  return `${baseKey}.${context}`;
}

/**
 * Common alt text translation keys used throughout the application
 * @example ALT_TEXT_KEYS.MASCOT_HELPER // "altText.mascot.helper"
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
  IMAGE_PAT_LOGIN: 'altText.image.patLogin',
  
  // Logos
  LOGO_SGEX: 'altText.logo.sgex',
  LOGO_WHO: 'altText.logo.who'
} as const;

/**
 * Type for alt text keys
 */
export type AltTextKey = typeof ALT_TEXT_KEYS[keyof typeof ALT_TEXT_KEYS];

/**
 * Get alt text with fallback for dynamic content
 * @param t - Translation function from useTranslation
 * @param key - Translation key
 * @param fallback - Fallback text if translation is missing
 * @param interpolation - Variables for translation interpolation
 * @returns Translated alt text or fallback
 * 
 * @example
 * getAltText(t, "altText.mascot.helper", "Helper Mascot", { name: "SGEX" });
 */
export function getAltText(
  t: TranslationFunction, 
  key: string, 
  fallback: string, 
  interpolation: Record<string, unknown> = {}
): string {
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
 * @param t - Translation function
 * @param entity - User or organization object
 * @param type - 'user' or 'organization'
 * @returns Appropriate alt text
 * 
 * @example
 * const user = { login: "john", name: "John Doe" };
 * getAvatarAltText(t, user, "user"); // "John Doe avatar"
 */
export function getAvatarAltText(
  t: TranslationFunction, 
  entity: AvatarEntity | null | undefined, 
  type: AvatarType = 'user'
): string {
  if (!entity) {
    return getAltText(t, ALT_TEXT_KEYS.AVATAR_PROFILE, 'Profile avatar');
  }
  
  const name = entity.name || entity.display_name || entity.login;
  const key = type === 'organization' ? ALT_TEXT_KEYS.AVATAR_ORGANIZATION : ALT_TEXT_KEYS.AVATAR_USER;
  
  return getAltText(t, key, `${name} avatar`, { name });
}

/**
 * Image alt text helper utilities
 * @example
 * import imageAltTextHelper from './imageAltTextHelper';
 * const altText = imageAltTextHelper.extractAltTextFromFilename("logo.png");
 */
const imageAltTextHelper = {
  extractAltTextFromFilename,
  generateAltTextKey,
  getAltText,
  getAvatarAltText,
  ALT_TEXT_KEYS
};

export default imageAltTextHelper;

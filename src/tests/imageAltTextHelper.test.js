/**
 * Tests for image alt text helper functionality
 */
import { 
  extractAltTextFromFilename, 
  generateAltTextKey, 
  getAltText, 
  getAvatarAltText,
  ALT_TEXT_KEYS 
} from '../utils/imageAltTextHelper';

describe('Image Alt Text Helper', () => {
  
  describe('extractAltTextFromFilename', () => {
    it('should extract meaningful descriptions from known filenames', () => {
      expect(extractAltTextFromFilename('sgex-mascot.png')).toBe('SGEX Mascot');
      expect(extractAltTextFromFilename('authoring.png')).toBe('Authoring Interface');
      expect(extractAltTextFromFilename('collaboration_grey_tabby.png')).toBe('Collaboration Features');
      expect(extractAltTextFromFilename('/path/to/bug-report-icon.svg')).toBe('Bug Report Icon');
    });

    it('should handle edge cases gracefully', () => {
      expect(extractAltTextFromFilename('')).toBe('');
      expect(extractAltTextFromFilename('unknown-file.png')).toBe('Unknown File');
      expect(extractAltTextFromFilename('some_complex-filename_123.jpg')).toBe('Some Complex Filename 123');
    });
  });

  describe('generateAltTextKey', () => {
    it('should generate proper translation keys', () => {
      expect(generateAltTextKey('mascot', 'helper')).toBe('altText.mascot.helper');
      expect(generateAltTextKey('icon')).toBe('altText.icon');
    });
  });

  describe('getAltText', () => {
    const mockT = jest.fn();

    beforeEach(() => {
      mockT.mockClear();
    });

    it('should return translated text when available', () => {
      mockT.mockReturnValue('Translated Text');
      
      const result = getAltText(mockT, 'test.key', 'Fallback Text');
      
      expect(mockT).toHaveBeenCalledWith('test.key', {});
      expect(result).toBe('Translated Text');
    });

    it('should return fallback when translation equals key', () => {
      mockT.mockReturnValue('test.key'); // Translation not found
      
      const result = getAltText(mockT, 'test.key', 'Fallback Text');
      
      expect(result).toBe('Fallback Text');
    });

    it('should handle translation errors gracefully', () => {
      mockT.mockImplementation(() => {
        throw new Error('Translation error');
      });
      
      const result = getAltText(mockT, 'test.key', 'Fallback Text');
      
      expect(result).toBe('Fallback Text');
    });
  });

  describe('getAvatarAltText', () => {
    const mockT = jest.fn();

    beforeEach(() => {
      mockT.mockClear();
      mockT.mockReturnValue('{{name}} avatar'); // Default return
    });

    it('should generate user avatar alt text', () => {
      const user = { name: 'John Doe', login: 'johndoe' };
      
      const result = getAvatarAltText(mockT, user, 'user');
      
      expect(mockT).toHaveBeenCalledWith(ALT_TEXT_KEYS.AVATAR_USER, { name: 'John Doe' });
    });

    it('should generate organization avatar alt text', () => {
      const org = { display_name: 'My Org', login: 'myorg' };
      
      const result = getAvatarAltText(mockT, org, 'organization');
      
      expect(mockT).toHaveBeenCalledWith(ALT_TEXT_KEYS.AVATAR_ORGANIZATION, { name: 'My Org' });
    });

    it('should handle null entity gracefully', () => {
      const result = getAvatarAltText(mockT, null, 'user');
      
      expect(mockT).toHaveBeenCalledWith(ALT_TEXT_KEYS.AVATAR_PROFILE, {});
    });
  });

  describe('ALT_TEXT_KEYS', () => {
    it('should contain all expected key categories', () => {
      expect(ALT_TEXT_KEYS.MASCOT_HELPER).toBeDefined();
      expect(ALT_TEXT_KEYS.AVATAR_USER).toBeDefined();
      expect(ALT_TEXT_KEYS.ICON_SGEX).toBeDefined();
      expect(ALT_TEXT_KEYS.IMAGE_AUTHORING).toBeDefined();
      expect(ALT_TEXT_KEYS.IMAGE_PRONUNCIATION).toBeDefined();
      expect(ALT_TEXT_KEYS.LOGO_SGEX).toBeDefined();
    });
  });
});
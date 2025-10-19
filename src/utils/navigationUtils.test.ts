/**
 * Tests for navigation utilities
 */
import { shouldOpenInNewTab, constructFullUrl, handleNavigationClick } from './navigationUtils';

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
});

// Mock window.location
const mockLocation = {
  origin: 'https://example.com'
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock process.env
const originalEnv = process.env;

describe('navigationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.PUBLIC_URL = '/sgex';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('shouldOpenInNewTab', () => {
    it('should return true when ctrlKey is pressed', () => {
      const event = { ctrlKey: true, metaKey: false };
      expect(shouldOpenInNewTab(event)).toBe(true);
    });

    it('should return true when metaKey is pressed (Cmd on Mac)', () => {
      const event = { ctrlKey: false, metaKey: true };
      expect(shouldOpenInNewTab(event)).toBe(true);
    });

    it('should return true when both keys are pressed', () => {
      const event = { ctrlKey: true, metaKey: true };
      expect(shouldOpenInNewTab(event)).toBe(true);
    });

    it('should return false when neither key is pressed', () => {
      const event = { ctrlKey: false, metaKey: false };
      expect(shouldOpenInNewTab(event)).toBe(false);
    });

    it('should return false for undefined event properties', () => {
      const event = {};
      expect(shouldOpenInNewTab(event)).toBe(false);
    });
  });

  describe('constructFullUrl', () => {
    it('should construct full URL with base path', () => {
      const relativePath = '/dashboard/user/repo';
      const expected = 'https://example.com/sgex/dashboard/user/repo';
      expect(constructFullUrl(relativePath)).toBe(expected);
    });

    it('should handle relative path without leading slash', () => {
      const relativePath = 'dashboard/user/repo';
      const expected = 'https://example.com/sgex/dashboard/user/repo';
      expect(constructFullUrl(relativePath)).toBe(expected);
    });

    it('should handle empty base path', () => {
      delete process.env.PUBLIC_URL;
      const relativePath = '/dashboard/user/repo';
      const expected = 'https://example.com/dashboard/user/repo';
      expect(constructFullUrl(relativePath)).toBe(expected);
    });

    it('should handle base path without trailing slash', () => {
      process.env.PUBLIC_URL = '/sgex';
      const relativePath = '/dashboard/user/repo';
      const expected = 'https://example.com/sgex/dashboard/user/repo';
      expect(constructFullUrl(relativePath)).toBe(expected);
    });

    it('should handle base path with trailing slash', () => {
      process.env.PUBLIC_URL = '/sgex/';
      const relativePath = '/dashboard/user/repo';
      const expected = 'https://example.com/sgex/dashboard/user/repo';
      expect(constructFullUrl(relativePath)).toBe(expected);
    });
  });

  describe('handleNavigationClick', () => {
    const mockNavigate = jest.fn();
    const testPath = '/dashboard/user/repo';
    const testState = { profile: 'test' };

    beforeEach(() => {
      mockNavigate.mockClear();
      mockWindowOpen.mockClear();
    });

    it('should open in new tab when command key is pressed', () => {
      const event = { ctrlKey: true, metaKey: false };
      handleNavigationClick(event, testPath, mockNavigate, testState);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com/sgex/dashboard/user/repo',
        '_blank',
        'noopener,noreferrer'
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should navigate in same tab when no command key is pressed', () => {
      const event = { ctrlKey: false, metaKey: false };
      handleNavigationClick(event, testPath, mockNavigate, testState);

      expect(mockNavigate).toHaveBeenCalledWith(testPath, { state: testState });
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should navigate without state when no state provided', () => {
      const event = { ctrlKey: false, metaKey: false };
      handleNavigationClick(event, testPath, mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith(testPath);
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });
  });
});
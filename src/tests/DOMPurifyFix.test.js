/**
 * Unit test for DOMPurify lazy loading fix
 * This tests the fix for the "z.sanitize is not a function" error
 */

import { lazyLoadDOMPurify } from '../utils/lazyRouteUtils';

// Mock browser environment for testing
const mockWindow = {
  document: {},
  window: {}
};

// Store original window
const originalWindow = global.window;

beforeAll(() => {
  // Set up mock browser environment
  global.window = mockWindow;
  global.document = mockWindow.document;
});

afterAll(() => {
  // Restore original window
  global.window = originalWindow;
});

describe('DOMPurify Lazy Loading Fix', () => {
  test('should load DOMPurify successfully', async () => {
    const DOMPurify = await lazyLoadDOMPurify();
    
    expect(DOMPurify).toBeDefined();
    expect(typeof DOMPurify).toBe('function');
  });

  test('should have sanitize method available', async () => {
    const DOMPurify = await lazyLoadDOMPurify();
    
    expect(DOMPurify.sanitize).toBeDefined();
    expect(typeof DOMPurify.sanitize).toBe('function');
  });

  test('should sanitize content correctly', async () => {
    const DOMPurify = await lazyLoadDOMPurify();
    
    const unsafeContent = '<script>alert("xss")</script><p>Safe content</p>';
    const sanitized = DOMPurify.sanitize(unsafeContent);
    
    expect(sanitized).toContain('<p>Safe content</p>');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  test('should handle empty content gracefully', async () => {
    const DOMPurify = await lazyLoadDOMPurify();
    
    expect(DOMPurify.sanitize('')).toBe('');
    expect(DOMPurify.sanitize(null)).toBe('');
    expect(DOMPurify.sanitize(undefined)).toBe('');
  });
});
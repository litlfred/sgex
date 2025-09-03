import { applyTheme } from '../utils/themeManager';

describe('PreviewBadge Theme Support', () => {
  beforeEach(() => {
    // Reset body classes before each test
    document.body.className = '';
  });

  afterEach(() => {
    // Clean up after each test
    document.body.className = '';
  });

  test('should apply light theme class correctly', () => {
    // Apply light theme
    applyTheme('light');
    expect(document.body.classList.contains('theme-light')).toBe(true);
    expect(document.body.classList.contains('theme-dark')).toBe(false);
  });

  test('should apply dark theme class correctly', () => {
    // Apply dark theme
    applyTheme('dark');
    expect(document.body.classList.contains('theme-dark')).toBe(true);
    expect(document.body.classList.contains('theme-light')).toBe(false);
  });

  test('should switch themes properly', () => {
    // Start with light theme
    applyTheme('light');
    expect(document.body.classList.contains('theme-light')).toBe(true);
    
    // Switch to dark theme
    applyTheme('dark');
    expect(document.body.classList.contains('theme-dark')).toBe(true);
    expect(document.body.classList.contains('theme-light')).toBe(false);
    
    // Switch back to light theme
    applyTheme('light');
    expect(document.body.classList.contains('theme-light')).toBe(true);
    expect(document.body.classList.contains('theme-dark')).toBe(false);
  });

  test('should verify CSS selectors use body.theme-dark instead of media queries', () => {
    // Load the PreviewBadge CSS file content (this test verifies our fix)
    const fs = require('fs');
    const path = require('path');
    const cssPath = path.join(__dirname, '../components/PreviewBadge.css');
    
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Verify that media queries for dark mode have been replaced
      const mediaQueries = cssContent.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)/g);
      expect(mediaQueries).toBeNull(); // Should not find any media queries
      
      // Verify that body.theme-dark selectors exist
      const bodyThemeDarkSelectors = cssContent.match(/body\.theme-dark/g);
      expect(bodyThemeDarkSelectors).not.toBeNull(); // Should find body.theme-dark selectors
      expect(bodyThemeDarkSelectors.length).toBeGreaterThan(10); // Should have many instances
    }
  });
});
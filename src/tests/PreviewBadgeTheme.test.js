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
    // Load CSS files and verify our complete theme system conversion
    const fs = require('fs');
    const path = require('path');
    
    // Manually check key CSS files that should have been converted
    const cssFiles = [
      path.join(__dirname, '../components/PreviewBadge.css'),
      path.join(__dirname, '../components/framework/AccessBadge.css'),
      path.join(__dirname, '../components/CommitDiffModal.css'),
      path.join(__dirname, '../dak/faq/components/FAQAccordion.css')
    ];
    
    let totalMediaQueries = 0;
    let totalBodyThemeDarkSelectors = 0;
    
    cssFiles.forEach(cssFile => {
      if (fs.existsSync(cssFile)) {
        const cssContent = fs.readFileSync(cssFile, 'utf8');
        
        // Count media queries for dark mode
        const mediaQueries = cssContent.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)/g);
        if (mediaQueries) {
          totalMediaQueries += mediaQueries.length;
        }
        
        // Count body.theme-dark selectors
        const bodyThemeDarkSelectors = cssContent.match(/body\.theme-dark/g);
        if (bodyThemeDarkSelectors) {
          totalBodyThemeDarkSelectors += bodyThemeDarkSelectors.length;
        }
      }
    });
    
    // Verify complete conversion
    expect(totalMediaQueries).toBe(0); // Should not find any media queries
    expect(totalBodyThemeDarkSelectors).toBeGreaterThan(100); // Should have many instances across all files
    
    // Verify comprehensive coverage
    expect(totalBodyThemeDarkSelectors).toBeGreaterThan(150); // Should have comprehensive coverage
  });
});
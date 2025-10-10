/**
 * Image Asset Validity Test
 * 
 * Ensures all referenced image assets actually exist in the public directory.
 * This test prevents 404 errors for missing assets.
 */

const fs = require('fs');
const path = require('path');

describe('Image Asset Validity', () => {
  // Critical SVG icons that must exist
  const criticalSvgIcons = [
    'bug-report-icon.svg',
    'cat-paw-bug-icon.svg',
    'cat-paw-lock-icon.svg',
    'cat-paw-icon.svg',
    'cat-paw-info-icon.svg',
    'cat-paw-file-icon.svg',
    'cat-paw-document-icon.svg',
    'cat-paw-settings-icon.svg',
    'cat-paw-workflow-icon.svg',
  ];

  // Dark mode SVG icons that must exist for theme support
  const darkModeSvgIcons = [
    'cat-paw-icon_dark.svg',
    'cat-paw-info-icon_dark.svg',
    'cat-paw-file-icon_dark.svg',
    'cat-paw-document-icon_dark.svg',
    'cat-paw-settings-icon_dark.svg',
    'cat-paw-workflow-icon_dark.svg',
  ];

  // Critical PNG images that must exist
  const criticalPngImages = [
    'sgex-mascot.png',
    'sgex-mascot_grey_tabby.png',
    'authoring.png',
    'authoring_grey_tabby.png',
    'collaboration.png',
    'collaboration_grey_tabby.png',
    'favicon.ico',
  ];

  describe('Critical SVG Icons', () => {
    criticalSvgIcons.forEach(icon => {
      test(`${icon} should exist in public directory`, () => {
        const iconPath = path.join(__dirname, '../../public', icon);
        expect(fs.existsSync(iconPath)).toBe(true);
      });

      test(`${icon} should be valid SVG`, () => {
        const iconPath = path.join(__dirname, '../../public', icon);
        if (fs.existsSync(iconPath)) {
          const content = fs.readFileSync(iconPath, 'utf8');
          expect(content).toContain('<svg');
          expect(content).toContain('</svg>');
          expect(content).toContain('viewBox');
        }
      });
    });
  });

  describe('Critical PNG Images', () => {
    criticalPngImages.forEach(image => {
      test(`${image} should exist in public directory`, () => {
        const imagePath = path.join(__dirname, '../../public', image);
        expect(fs.existsSync(imagePath)).toBe(true);
      });
    });
  });

  describe('Cat Paw Icon Consistency', () => {
    const catPawIcons = criticalSvgIcons.filter(icon => icon.startsWith('cat-paw-'));

    test('All cat-paw icons should follow naming convention', () => {
      catPawIcons.forEach(icon => {
        expect(icon).toMatch(/^cat-paw-[a-z-]+\.svg$/);
      });
    });

    test('All cat-paw icons should contain cat paw comment', () => {
      catPawIcons.forEach(icon => {
        const iconPath = path.join(__dirname, '../../public', icon);
        if (fs.existsSync(iconPath)) {
          const content = fs.readFileSync(iconPath, 'utf8');
          expect(content).toContain('<!-- Cat paw -->');
        }
      });
    });

    test('All cat-paw icons should use consistent dimensions', () => {
      catPawIcons.forEach(icon => {
        const iconPath = path.join(__dirname, '../../public', icon);
        if (fs.existsSync(iconPath)) {
          const content = fs.readFileSync(iconPath, 'utf8');
          expect(content).toContain('viewBox="0 0 20 20"');
        }
      });
    });
  });

  describe('Referenced Icons in HelpContentService', () => {
    const helpContentServicePath = path.join(__dirname, '../services/helpContentService.js');
    
    test('helpContentService.js should exist', () => {
      expect(fs.existsSync(helpContentServicePath)).toBe(true);
    });

    test('All badge icons referenced in helpContentService should exist', () => {
      if (!fs.existsSync(helpContentServicePath)) {
        return; // Skip if file doesn't exist
      }

      const content = fs.readFileSync(helpContentServicePath, 'utf8');
      const badgePattern = /badge:\s*['"`]\/sgex\/([^'"`]+\.svg)['"`]/g;
      const matches = [...content.matchAll(badgePattern)];

      matches.forEach(match => {
        const iconFile = match[1];
        const iconPath = path.join(__dirname, '../../public', iconFile);
        expect(fs.existsSync(iconPath)).toBe(true);
      });
    });
  });

  describe('Theme Variants', () => {
    const imagesWithThemeVariants = [
      'sgex-mascot.png',
      'authoring.png',
      'collaboration.png',
    ];

    imagesWithThemeVariants.forEach(image => {
      test(`${image} should have _grey_tabby variant`, () => {
        const variantName = image.replace('.png', '_grey_tabby.png');
        const variantPath = path.join(__dirname, '../../public', variantName);
        expect(fs.existsSync(variantPath)).toBe(true);
      });
    });

    // Test dark mode SVG variants
    darkModeSvgIcons.forEach(icon => {
      test(`${icon} should exist for dark mode theme`, () => {
        const iconPath = path.join(__dirname, '../../public', icon);
        expect(fs.existsSync(iconPath)).toBe(true);
      });

      test(`${icon} should be valid SVG`, () => {
        const iconPath = path.join(__dirname, '../../public', icon);
        if (fs.existsSync(iconPath)) {
          const content = fs.readFileSync(iconPath, 'utf8');
          expect(content).toContain('<svg');
          expect(content).toContain('</svg>');
          expect(content).toContain('viewBox');
        }
      });
    });
  });
});

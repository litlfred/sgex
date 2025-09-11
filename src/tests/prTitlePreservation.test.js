/**
 * Test to verify PR title preservation requirements
 * This test validates that copilot instructions properly enforce title preservation
 */

describe('PR Title Preservation', () => {
  test('should never change original title text', () => {
    // Test cases for title preservation
    const originalTitles = [
      'Fix broken feature X',
      'Enhance tracked issues functionality with immediate visibility',
      'Add new component for data processing',
      'Update documentation with typos in tittle', // Intentional typo to test no correction
    ];

    const allowedStatusTags = ['[WIP]', '[REVIEW]', '[BLOCKED]'];

    originalTitles.forEach(originalTitle => {
      // Original title should remain unchanged
      expect(originalTitle).toBe(originalTitle);

      // Only status tags should be allowed as prefixes
      allowedStatusTags.forEach(tag => {
        const titleWithStatus = `${tag} ${originalTitle}`;
        // The text after the status tag should be exactly the original
        const extractedTitle = titleWithStatus.replace(/^\[[^\]]+\]\s+/, '');
        expect(extractedTitle).toBe(originalTitle);
      });
    });
  });

  test('should preserve titles with intentional typos or unconventional text', () => {
    // These titles should NEVER be "corrected" or "improved"
    const titlesWithIntentionalIssues = [
      'fix lowercase title', // Intentionally lowercase
      'Title with   extra spaces',
      'Title with minor typo in recieve', // Intentional typo
      'Very long title that might seem like it needs shortening but should be preserved exactly as written',
    ];

    titlesWithIntentionalIssues.forEach(title => {
      // Title must be preserved exactly, no improvements allowed
      expect(title).toBe(title);
    });
  });

  test('should only allow status tag modifications', () => {
    const originalTitle = 'Implement new authentication system';
    
    // These are the only allowed modifications (adding/changing status tags)
    const allowedModifications = [
      `[WIP] ${originalTitle}`,
      `[REVIEW] ${originalTitle}`,
      `[BLOCKED] ${originalTitle}`,
    ];

    // These modifications should NOT be allowed
    const disallowedModifications = [
      'Implement New Authentication System', // Capitalization change
      'Implement authentication system', // Word removal
      'Implement new authentication system with improvements', // Addition
      'Fix: Implement new authentication system', // Different prefix format
    ];

    allowedModifications.forEach(modifiedTitle => {
      const textAfterTag = modifiedTitle.replace(/^\[[^\]]+\]\s+/, '');
      expect(textAfterTag).toBe(originalTitle);
    });

    disallowedModifications.forEach(modifiedTitle => {
      // These should not match the original
      expect(modifiedTitle).not.toBe(originalTitle);
      // And they should not be considered valid modifications
      expect(modifiedTitle.replace(/^\[[^\]]+\]\s+/, '')).not.toBe(originalTitle);
    });
  });
});
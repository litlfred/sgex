import React from 'react';

describe('BranchListing Preview Links HTML Structure', () => {
  test('all preview links should have target="_blank" attribute', () => {
    // Read the BranchListing.js file directly to verify HTML structure
    const fs = require('fs');
    const path = require('path');
    
    const branchListingPath = path.join(__dirname, '../components/BranchListing.js');
    const fileContent = fs.readFileSync(branchListingPath, 'utf8');
    
    // Find all preview-link elements and verify they have target="_blank"
    const previewLinkRegex = /className="preview-link"[\s\S]*?>/g;
    const matches = fileContent.match(previewLinkRegex);
    
    expect(matches).toBeTruthy();
    expect(matches.length).toBeGreaterThan(0);
    
    // Each preview-link should have target="_blank"
    matches.forEach((match, index) => {
      expect(match).toContain('target="_blank"');
      expect(match).toContain('rel="noopener noreferrer"');
      expect(match).toContain('className="preview-link"');
    });
    
    // Verify we have exactly 4 preview links as expected
    expect(matches.length).toBe(4);
  });

  test('branch preview links have correct attributes', () => {
    const fs = require('fs');
    const path = require('path');
    
    const branchListingPath = path.join(__dirname, '../components/BranchListing.js');
    const fileContent = fs.readFileSync(branchListingPath, 'utf8');
    
    // Count target="_blank" attributes in preview links context
    const targetBlankCount = (fileContent.match(/className="preview-link"[\s\S]*?target="_blank"[\s\S]*?rel="noopener noreferrer"/g) || []).length;
    
    // Should have 4 preview links with target="_blank"
    expect(targetBlankCount).toBe(4);
  });
});
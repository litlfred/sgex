import React from 'react';

describe('PreviewBadge Markdown Links Configuration', () => {
  test('should have markdownComponents configuration for external links', () => {
    // Read the PreviewBadge.js file to verify markdownComponents is defined
    const fs = require('fs');
    const path = require('path');
    
    const previewBadgePath = path.join(__dirname, '../components/PreviewBadge.js');
    const fileContent = fs.readFileSync(previewBadgePath, 'utf8');
    
    // Verify markdownComponents is defined
    expect(fileContent).toContain('markdownComponents');
    expect(fileContent).toContain('target="_blank"');
    expect(fileContent).toContain('rel="noopener noreferrer"');
    
    // Verify it's applied to ReactMarkdown components
    const markdownComponentsPattern = /components={markdownComponents}/g;
    const matches = fileContent.match(markdownComponentsPattern);
    
    expect(matches).toBeTruthy();
    expect(matches.length).toBeGreaterThanOrEqual(4); // Should be applied to all 4 ReactMarkdown instances
  });

  test('should configure link component with proper attributes', () => {
    const fs = require('fs');
    const path = require('path');
    
    const previewBadgePath = path.join(__dirname, '../components/PreviewBadge.js');
    const fileContent = fs.readFileSync(previewBadgePath, 'utf8');
    
    // Verify the custom link component configuration
    expect(fileContent).toContain('a: ({ href, children, ...props }) => (');
    expect(fileContent).toContain('<a href={href} target="_blank" rel="noopener noreferrer" {...props}>');
    
    // Verify ReactMarkdown instances have the components prop
    const reactMarkdownWithComponents = fileContent.match(/<ReactMarkdown[\s\S]*?components={markdownComponents}/g);
    expect(reactMarkdownWithComponents).toBeTruthy();
    expect(reactMarkdownWithComponents.length).toBe(4);
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import { sanitizeHtml } from '../utils/securityUtils';

// Mock component that simulates how content is now sanitized
const MockContentComponent = ({ htmlContent }) => {
  return (
    <div 
      data-testid="sanitized-content"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
    />
  );
};

describe('XSS Protection Integration', () => {
  it('should prevent script injection through HTML content', () => {
    const maliciousContent = '<p>Safe content</p><script>alert("XSS Attack!")</script><p>More content</p>';
    
    render(<MockContentComponent htmlContent={maliciousContent} />);
    
    const contentElement = screen.getByTestId('sanitized-content');
    
    // Verify script tags are removed
    expect(contentElement.innerHTML).not.toContain('<script>');
    expect(contentElement.innerHTML).not.toContain('alert("XSS Attack!")');
    
    // Verify safe content is preserved
    expect(contentElement.innerHTML).toContain('<p>Safe content</p>');
    expect(contentElement.innerHTML).toContain('<p>More content</p>');
  });

  it('should prevent event handler injection', () => {
    const maliciousContent = '<p onclick="alert(\'XSS!\')">Click me</p>';
    
    render(<MockContentComponent htmlContent={maliciousContent} />);
    
    const contentElement = screen.getByTestId('sanitized-content');
    
    // Verify event handlers are removed
    expect(contentElement.innerHTML).not.toContain('onclick');
    expect(contentElement.innerHTML).not.toContain('alert');
    
    // Verify safe content is preserved
    expect(contentElement.innerHTML).toContain('<p>Click me</p>');
  });

  it('should prevent javascript: protocol in links', () => {
    const maliciousContent = '<a href="javascript:alert(\'XSS!\')">Malicious link</a>';
    
    render(<MockContentComponent htmlContent={maliciousContent} />);
    
    const contentElement = screen.getByTestId('sanitized-content');
    
    // Verify javascript: protocol is removed
    expect(contentElement.innerHTML).not.toContain('javascript:');
    expect(contentElement.innerHTML).not.toContain('alert');
    
    // Verify link text is preserved but href is removed
    expect(contentElement.innerHTML).toContain('Malicious link');
  });

  it('should preserve safe HTML content', () => {
    const safeContent = `
      <h1>Safe Title</h1>
      <p>This is <strong>safe</strong> content with <em>emphasis</em></p>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
      </ul>
      <a href="https://example.com">Safe external link</a>
    `;
    
    render(<MockContentComponent htmlContent={safeContent} />);
    
    const contentElement = screen.getByTestId('sanitized-content');
    
    // Verify all safe elements are preserved
    expect(contentElement.innerHTML).toContain('<h1>Safe Title</h1>');
    expect(contentElement.innerHTML).toContain('<strong>safe</strong>');
    expect(contentElement.innerHTML).toContain('<em>emphasis</em>');
    expect(contentElement.innerHTML).toContain('<ul>');
    expect(contentElement.innerHTML).toContain('<li>List item 1</li>');
    expect(contentElement.innerHTML).toContain('https://example.com');
  });

  it('should remove dangerous tags completely', () => {
    const maliciousContent = `
      <p>Safe content</p>
      <iframe src="https://evil.com"></iframe>
      <object data="malicious.swf"></object>
      <embed src="plugin.swf"></embed>
      <style>body { background: url(javascript:alert('XSS')); }</style>
      <p>More safe content</p>
    `;
    
    render(<MockContentComponent htmlContent={maliciousContent} />);
    
    const contentElement = screen.getByTestId('sanitized-content');
    
    // Verify dangerous tags are completely removed
    expect(contentElement.innerHTML).not.toContain('iframe');
    expect(contentElement.innerHTML).not.toContain('object');
    expect(contentElement.innerHTML).not.toContain('embed');
    expect(contentElement.innerHTML).not.toContain('style');
    expect(contentElement.innerHTML).not.toContain('evil.com');
    expect(contentElement.innerHTML).not.toContain('malicious.swf');
    
    // Verify safe content is preserved
    expect(contentElement.innerHTML).toContain('<p>Safe content</p>');
    expect(contentElement.innerHTML).toContain('<p>More safe content</p>');
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BranchListing from '../components/BranchListing';

// Mock fetch globally
global.fetch = jest.fn();

// Mock PageLayout component
jest.mock('../components/framework', () => ({
  PageLayout: ({ children }) => <div data-testid="page-layout">{children}</div>
}));

// Mock HelpModal component
jest.mock('../components/HelpModal', () => {
  return function MockHelpModal({ onClose }) {
    return <div data-testid="help-modal"><button onClick={onClose}>Close</button></div>;
  };
});

describe('BranchListing Preview URL Links', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should make preview URLs clickable links', async () => {
    const mockPRs = [
      {
        id: 1,
        number: 123,
        title: 'Test PR',
        state: 'open',
        user: { login: 'testuser' },
        head: { ref: 'feature/test-pr' },
        html_url: 'https://github.com/litlfred/sgex/pull/123',
        updated_at: '2023-01-01T00:00:00Z',
        created_at: '2023-01-01T00:00:00Z'
      }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPRs)
      })
      .mockResolvedValue({ ok: true, status: 200 });

    render(
      <BrowserRouter>
        <BranchListing />
      </BrowserRouter>
    );

    // Wait for data to load and find preview URL links
    await screen.findByText(/Pull Request Previews \(\d+\)/);
    
    // Check that preview URLs in card footers are clickable links
    const previewUrlLinks = screen.getAllByText(/Preview URL:/);
    
    // Each preview URL should be within a link element or should be a clickable link
    previewUrlLinks.forEach((element) => {
      const parent = element.closest('.card-footer');
      expect(parent).toBeInTheDocument();
      
      // Look for a link within the same card footer
      const linkElement = parent.querySelector('a[href]');
      expect(linkElement).toBeInTheDocument();
      expect(linkElement.getAttribute('href')).toMatch(/\.\/.*\/index\.html/);
    });
  });
});
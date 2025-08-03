import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BranchListing from '../components/BranchListing';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage for cache service
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock the cache service
jest.mock('../services/branchListingCacheService', () => ({
  getCachedData: jest.fn(() => null),
  setCachedData: jest.fn(() => true),
  getCacheInfo: jest.fn(() => ({ exists: false, stale: true })),
  forceRefresh: jest.fn(() => true)
}));

// Mock PageLayout component
jest.mock('../components/framework', () => ({
  PageLayout: ({ children, pageName, showMascot }) => (
    <div data-testid="page-layout" data-page-name={pageName} data-show-mascot={showMascot}>
      {children}
    </div>
  )
}));

// Mock HelpModal component
jest.mock('../components/HelpModal', () => {
  return function MockHelpModal({ helpTopic, onClose }) {
    return (
      <div data-testid="help-modal">
        <h3>{helpTopic.title}</h3>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

describe('BranchListing Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders loading state initially', () => {
    // Mock fetch to never resolve to test loading state
    fetch.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <BranchListing />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading previews...')).toBeInTheDocument();
  });

  it('renders deployment selection page with PR functionality', async () => {
    // Mock successful API responses
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
      // Mock deployment status checks (will return HEAD requests)
      .mockResolvedValue({
        ok: true,
        status: 200
      });

    render(
      <BrowserRouter>
        <BranchListing />
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/SGEX Deployment Selection/)).toBeInTheDocument();
      expect(screen.getByText(/Pull Request Previews \(\d+\)/)).toBeInTheDocument();
    });

    // Check that sections are properly displayed
    expect(screen.getByText(/🚀 Main Branch/)).toBeInTheDocument();
    expect(screen.getByText(/Pull Request Previews \(\d+\)/)).toBeInTheDocument();
  });

  it('allows PR filtering', async () => {
    const mockPRs = [
      {
        id: 1,
        number: 123,
        title: 'Add new feature',
        state: 'open',
        user: { login: 'testuser' },
        head: { ref: 'feature/new-feature' },
        html_url: 'https://github.com/test/repo/pull/123',
        updated_at: '2023-01-01T00:00:00Z',
        created_at: '2023-01-01T00:00:00Z'
      },
      {
        id: 2,
        number: 124,
        title: 'Fix authentication bug',
        state: 'open',
        user: { login: 'developer' },
        head: { ref: 'fix/auth-bug' },
        html_url: 'https://github.com/test/repo/pull/124',
        updated_at: '2023-01-02T00:00:00Z',
        created_at: '2023-01-02T00:00:00Z'
      }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPRs)
      })
      .mockResolvedValue({
        ok: true,
        status: 200
      });

    render(
      <BrowserRouter>
        <BranchListing />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Add new feature/)).toBeInTheDocument();
      expect(screen.getByText(/Fix authentication bug/)).toBeInTheDocument();
    });

    // Test PR filtering
    const prSearchInput = screen.getByPlaceholderText('Search pull requests by title or author...');
    fireEvent.change(prSearchInput, { target: { value: 'authentication' } });

    // Should still see authentication PR, but not the feature PR
    expect(screen.getByText(/Fix authentication bug/)).toBeInTheDocument();
    expect(screen.queryByText(/Add new feature/)).not.toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <BranchListing />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load previews/)).toBeInTheDocument();
      expect(screen.getByText(/Please try refreshing the page/)).toBeInTheDocument();
    });
  });

  it('shows contribute modal when button is clicked', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

    render(
      <BrowserRouter>
        <BranchListing />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/How to Contribute/)).toBeInTheDocument();
    });

    // Click the contribute button
    fireEvent.click(screen.getByText(/How to Contribute/));

    // Should show the modal
    expect(screen.getByTestId('help-modal')).toBeInTheDocument();
    expect(screen.getByText('How to Contribute to SGEX')).toBeInTheDocument();
  });
});
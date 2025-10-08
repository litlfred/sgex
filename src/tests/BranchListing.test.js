import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BranchListing from '../components/BranchListing';

// Mock fetch globally
global.fetch = jest.fn();

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

  it('renders branch and PR tabs with enhanced functionality', async () => {
    // Mock successful API responses
    const mockBranches = [
      {
        name: 'main',
        commit: {
          sha: 'abc123def456',
          commit: {
            committer: {
              date: '2023-01-01T00:00:00Z'
            }
          }
        }
      },
      {
        name: 'feature/test',
        commit: {
          sha: 'def456ghi789',
          commit: {
            committer: {
              date: '2023-01-02T00:00:00Z'
            }
          }
        }
      }
    ];

    const mockPRs = [
      {
        id: 1,
        number: 123,
        title: 'Test PR',
        state: 'open',
        user: { login: 'testuser' },
        head: { 
          ref: 'feature/test-pr',
          sha: 'abc123def456789'
        },
        html_url: 'https://github.com/litlfred/sgex/pull/123',
        updated_at: '2023-01-01T00:00:00Z',
        created_at: '2023-01-01T00:00:00Z'
      }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBranches)
      })
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
      expect(screen.getByText(/Branch Previews/)).toBeInTheDocument();
      expect(screen.getByText(/Pull Request Previews/)).toBeInTheDocument();
    });

    // Check that tabs show counts
    expect(screen.getByText(/Branch Previews \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Pull Request Previews \(1\)/)).toBeInTheDocument();
  });

  it('allows branch filtering', async () => {
    const mockBranches = [
      {
        name: 'main',
        commit: {
          sha: 'abc123def456',
          commit: {
            committer: {
              date: '2023-01-01T00:00:00Z'
            }
          }
        }
      },
      {
        name: 'feature/authentication',
        commit: {
          sha: 'def456ghi789',
          commit: {
            committer: {
              date: '2023-01-02T00:00:00Z'
            }
          }
        }
      }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBranches)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
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
      expect(screen.getByText('main')).toBeInTheDocument();
      expect(screen.getByText('feature/authentication')).toBeInTheDocument();
    });

    // Test branch filtering
    const branchSearchInput = screen.getByPlaceholderText('Search branches by name...');
    fireEvent.change(branchSearchInput, { target: { value: 'feature' } });

    // Should still see feature branch, but not main
    expect(screen.getByText('feature/authentication')).toBeInTheDocument();
    expect(screen.queryByText('main')).not.toBeInTheDocument();
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

  it('displays commit badge with link for PRs', async () => {
    const mockPRs = [
      {
        id: 1,
        number: 456,
        title: 'Feature PR',
        state: 'open',
        user: { login: 'developer' },
        head: { 
          ref: 'feature/new-feature',
          sha: 'abc123def456789'
        },
        html_url: 'https://github.com/litlfred/sgex/pull/456',
        updated_at: '2023-01-01T00:00:00Z',
        created_at: '2023-01-01T00:00:00Z'
      }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })
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
      // Check that commit SHA is displayed (first 7 characters)
      const commitBadge = screen.getByText('abc123d');
      expect(commitBadge).toBeInTheDocument();
      
      // Check that it's a link
      expect(commitBadge.tagName).toBe('A');
      
      // Check that it links to the correct commit
      expect(commitBadge).toHaveAttribute('href', 'https://github.com/litlfred/sgex/commit/abc123def456789');
      
      // Check that it opens in a new tab
      expect(commitBadge).toHaveAttribute('target', '_blank');
      expect(commitBadge).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
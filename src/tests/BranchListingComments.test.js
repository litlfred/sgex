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

// Mock WorkflowStatus component
jest.mock('../components/WorkflowStatus', () => {
  return function MockWorkflowStatus() {
    return <div data-testid="workflow-status">Workflow Status</div>;
  };
});

describe('BranchListing Comments Feature', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Clear any stored tokens
    sessionStorage.clear();
    localStorage.clear();
  });

  it('shows discussion summaries for unauthenticated users', async () => {
    const mockBranches = [];
    const mockPRs = [
      {
        id: 1,
        number: 123,
        title: 'Test PR with Comments',
        state: 'open',
        user: { login: 'testuser' },
        head: { ref: 'feature/test-pr' },
        html_url: 'https://github.com/litlfred/sgex/pull/123',
        updated_at: '2023-01-01T00:00:00Z',
        created_at: '2023-01-01T00:00:00Z'
      }
    ];

    const mockComments = [
      {
        id: 1,
        user: {
          login: 'commenter1',
          avatar_url: 'https://github.com/commenter1.png'
        },
        body: 'This is a test comment',
        created_at: '2023-01-01T12:00:00Z'
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
      // Mock deployment status checks
      .mockResolvedValueOnce({
        ok: true,
        status: 200
      })
      // Mock comment summary fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockComments)
      });

    render(
      <BrowserRouter>
        <BranchListing />
      </BrowserRouter>
    );

    // Wait for data to load and switch to PR tab
    await waitFor(() => {
      expect(screen.getByText(/Pull Request Previews/)).toBeInTheDocument();
    });

    // Click on PR tab to show PRs
    fireEvent.click(screen.getByText(/Pull Request Previews/));

    await waitFor(() => {
      expect(screen.getByText('Test PR with Comments')).toBeInTheDocument();
    });

    // Should show discussion summary even without authentication
    await waitFor(() => {
      expect(screen.getByText(/💬/)).toBeInTheDocument();
    });
  });

  it('shows sign-in message for unauthenticated users in expanded discussion', async () => {
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
        json: () => Promise.resolve([])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPRs)
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
        status: 200
      });

    render(
      <BrowserRouter>
        <BranchListing />
      </BrowserRouter>
    );

    // Wait for PR tab to be available and click it
    await waitFor(() => {
      expect(screen.getByText(/Pull Request Previews/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Pull Request Previews/));

    // Wait for PR to appear and look for discussion section
    await waitFor(() => {
      expect(screen.getByText('Test PR')).toBeInTheDocument();
    });

    // Find and click the discussion summary bar to expand
    const discussionBar = screen.getByText(/💬/);
    if (discussionBar) {
      fireEvent.click(discussionBar.closest('.discussion-summary-bar'));

      // Should show sign-in message for unauthenticated users
      await waitFor(() => {
        expect(screen.getByText(/Sign in to add comments/)).toBeInTheDocument();
      });
    }
  });
});
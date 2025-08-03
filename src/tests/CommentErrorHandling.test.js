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

describe('Comment Error Handling', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Clear any stored tokens
    sessionStorage.clear();
    localStorage.clear();
  });

  it('shows error message when comment submission fails with 401 (authentication)', async () => {
    // Set up authentication
    sessionStorage.setItem('github_token', 'test-token');
    
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

    // Mock successful initial API calls
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

    // Wait for PR tab and click it
    await waitFor(() => {
      expect(screen.getByText(/Pull Request Previews/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Pull Request Previews/));

    // Wait for PR to appear
    await waitFor(() => {
      expect(screen.getByText('Test PR')).toBeInTheDocument();
    });

    // Find and click the discussion summary to expand
    const discussionBar = screen.getByText(/💬/);
    fireEvent.click(discussionBar.closest('.discussion-summary-bar'));

    // Wait for comment input to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
    });

    // Type a comment
    const commentInput = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(commentInput, { target: { value: 'Test comment' } });

    // Mock failed comment submission with 401 error
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    // Click submit button
    const submitButton = screen.getByText('Add Comment');
    fireEvent.click(submitButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Authentication failed. Please check your token permissions./)).toBeInTheDocument();
    });
  });

  it('shows error message when comment submission fails with 403 (permission denied)', async () => {
    sessionStorage.setItem('github_token', 'test-token');
    
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

    await waitFor(() => {
      expect(screen.getByText(/Pull Request Previews/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Pull Request Previews/));

    await waitFor(() => {
      expect(screen.getByText('Test PR')).toBeInTheDocument();
    });

    const discussionBar = screen.getByText(/💬/);
    fireEvent.click(discussionBar.closest('.discussion-summary-bar'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(commentInput, { target: { value: 'Test comment' } });

    // Mock failed comment submission with 403 error
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403
    });

    const submitButton = screen.getByText('Add Comment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Permission denied. You may not have write access to this repository./)).toBeInTheDocument();
    });
  });

  it('clears error message when user starts typing', async () => {
    sessionStorage.setItem('github_token', 'test-token');
    
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

    await waitFor(() => {
      expect(screen.getByText(/Pull Request Previews/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Pull Request Previews/));

    await waitFor(() => {
      expect(screen.getByText('Test PR')).toBeInTheDocument();
    });

    const discussionBar = screen.getByText(/💬/);
    fireEvent.click(discussionBar.closest('.discussion-summary-bar'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(commentInput, { target: { value: 'Test comment' } });

    // Mock failed comment submission
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const submitButton = screen.getByText('Add Comment');
    fireEvent.click(submitButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/GitHub server error. Please try again later./)).toBeInTheDocument();
    });

    // Start typing again - error should clear
    fireEvent.change(commentInput, { target: { value: 'New comment text' } });

    // Error message should no longer be visible
    await waitFor(() => {
      expect(screen.queryByText(/GitHub server error. Please try again later./)).not.toBeInTheDocument();
    });
  });
});
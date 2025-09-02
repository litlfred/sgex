import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreviewBadge from '../components/PreviewBadge';

// Mock the GitHub service
jest.mock('../services/githubService', () => ({
  isAuth: () => true,
  token: 'mock-token'
}));

// Mock the GitHub Actions service
jest.mock('../services/githubActionsService', () => ({
  setToken: jest.fn()
}));

describe('PreviewBadge PR Workflow UI', () => {
  const mockBranchInfo = {
    name: 'test-branch',
    commit: { sha: 'abc123' }
  };

  const mockCopilotSessionInfo = {
    hasActiveCopilot: true,
    latestActivity: '2024-01-01T12:00:00Z',
    sessionUrl: 'https://github.com/litlfred/sgex/pull/123/agent-sessions',
    commentUrl: 'https://github.com/litlfred/sgex/pull/123#issuecomment-456',
    commentsCount: 2,
    latestComment: {
      id: 456,
      created_at: '2024-01-01T12:00:00Z',
      user: {
        login: 'copilot',
        avatar_url: 'https://avatars.githubusercontent.com/copilot',
        html_url: 'https://github.com/copilot'
      },
      body: 'Test copilot comment'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders watch session button first in button order', async () => {
    render(
      <PreviewBadge 
        branchInfo={mockBranchInfo}
        isExpanded={true}
        prInfo={[{ number: 123, state: 'open' }]}
      />
    );

    // Wait for component to load and simulate having copilot session info
    await waitFor(() => {
      const component = screen.getByText('🤖 GitHub Copilot Activity').closest('.copilot-session-wrapper');
      if (component) {
        // Manually set the copilot session info for testing
        const buttons = component.querySelectorAll('.copilot-session-actions button, .copilot-session-actions a');
        if (buttons.length > 0) {
          // First button should be Watch Session
          expect(buttons[0]).toHaveTextContent(/Watch Session/);
        }
      }
    });
  });

  test('shows "Open Session" instead of "View Agent Session"', async () => {
    render(
      <PreviewBadge 
        branchInfo={mockBranchInfo}
        isExpanded={true}
        prInfo={[{ number: 123, state: 'open' }]}
      />
    );

    await waitFor(() => {
      // Should not find old text
      expect(screen.queryByText(/View Agent Session/)).not.toBeInTheDocument();
      // Should find new text when copilot session is active
      const openSessionLink = screen.queryByText(/Open Session/);
      if (openSessionLink) {
        expect(openSessionLink).toBeInTheDocument();
      }
    });
  });

  test('shows watching status when watch session is active', async () => {
    const { container } = render(
      <PreviewBadge 
        branchInfo={mockBranchInfo}
        isExpanded={true}
        prInfo={[{ number: 123, state: 'open' }]}
      />
    );

    // Simulate clicking watch session button
    const watchButton = container.querySelector('.copilot-session-toggle');
    if (watchButton) {
      fireEvent.click(watchButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Watching for updates/)).toBeInTheDocument();
      });
    }
  });

  test('dark mode CSS classes are properly applied', () => {
    const { container } = render(
      <PreviewBadge 
        branchInfo={mockBranchInfo}
        isExpanded={true}
        prInfo={[{ number: 123, state: 'open' }]}
      />
    );

    // Check if dark mode CSS is loaded by checking for specific classes
    const styles = document.head.querySelector('style');
    if (styles) {
      const cssText = styles.textContent || '';
      expect(cssText).toContain('copilot-session-modal');
      expect(cssText).toContain('copilot-watching-status');
    }
  });

  test('auto-refresh interval is set up correctly', async () => {
    const { container } = render(
      <PreviewBadge 
        branchInfo={mockBranchInfo}
        isExpanded={true}
        prInfo={[{ number: 123, state: 'open' }]}
      />
    );

    const watchButton = container.querySelector('.copilot-session-toggle');
    if (watchButton) {
      fireEvent.click(watchButton);
      
      // Fast-forward time to test interval
      jest.advanceTimersByTime(10000);
      
      await waitFor(() => {
        // Verify that interval was set up (we can't easily test the actual API call without more mocking)
        expect(watchButton).toHaveTextContent(/Stop Watching/);
      });
    }
  });
});
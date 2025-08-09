import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import PreviewBadge from '../components/PreviewBadge';
import githubService from '../services/githubService';

// Mock the githubService
jest.mock('../services/githubService', () => ({
  isAuth: jest.fn(),
  getPullRequestForBranch: jest.fn(),
  getPullRequestsForBranch: jest.fn(),
  getPullRequestComments: jest.fn(),
  getPullRequestIssueComments: jest.fn(),
  createPullRequestComment: jest.fn()
}));

describe('PreviewBadge Mobile Touch Events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.location for a test branch
    delete window.location;
    window.location = { pathname: '/sgex/test-branch/' };
    
    // Mock window.open
    window.open = jest.fn();
  });

  test('handles touch events to close expanded panel on mobile', async () => {
    const mockPR = {
      id: 1,
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    const { container } = render(<PreviewBadge />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    // Click to expand
    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title')).toBeInTheDocument();
    });

    // Verify expanded panel is visible
    const expandedPanel = container.querySelector('.preview-badge-expanded');
    expect(expandedPanel).toBeInTheDocument();

    // Simulate touch event outside the expanded panel (like on mobile)
    fireEvent.touchStart(document.body);

    // Wait for the panel to close
    await waitFor(() => {
      const closedPanel = container.querySelector('.preview-badge-expanded');
      expect(closedPanel).not.toBeInTheDocument();
    });
  });

  test('touch events on badge trigger expansion properly', async () => {
    const mockPR = {
      id: 1,
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    const { container } = render(<PreviewBadge />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    // Use touch events instead of click to simulate mobile interaction
    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    
    // Simulate mobile touch sequence
    fireEvent.touchStart(badge);
    fireEvent.touchEnd(badge);
    fireEvent.click(badge); // Touch usually triggers click after touchend

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title')).toBeInTheDocument();
    });

    // Verify expanded panel is visible
    const expandedPanel = container.querySelector('.preview-badge-expanded');
    expect(expandedPanel).toBeInTheDocument();
  });
});
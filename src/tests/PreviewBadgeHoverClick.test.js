import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import PreviewBadge from '../components/PreviewBadge';
import githubService from '../services/githubService';

// Mock the githubService
jest.mock('../services/githubService', () => ({
  isAuth: jest.fn(),
  getPullRequestForBranch: jest.fn(),
  getPullRequestComments: jest.fn(),
  getPullRequestIssueComments: jest.fn(),
  createPullRequestComment: jest.fn()
}));

describe('PreviewBadge Hover and Click Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.location for a test branch
    delete window.location;
    window.location = { pathname: '/sgex/test-branch/' };
    
    // Mock window.open
    window.open = jest.fn();
  });

  test('expands on mouse hover when PR is available', async () => {
    const mockPR = {
      number: 123,
      title: 'Test PR Title That Should Be Truncated Because It Is Very Long And Exceeds Fifty Characters',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(mockPR);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    const { container } = render(<PreviewBadge />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/Test PR Title That Should Be Truncated/)).toBeInTheDocument();
    });

    // Verify truncated title shows ~50 characters
    const titleElement = screen.getByText(/Test PR Title That Should Be Truncated/);
    expect(titleElement.textContent).toMatch(/^Test PR Title That Should Be Truncated Because It \.\.\.$/);
    expect(titleElement.textContent.length).toBeLessThanOrEqual(53); // 50 + "..."

    const badge = titleElement.closest('.preview-badge');

    // Hover over badge
    fireEvent.mouseEnter(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title That Should Be Truncated Because It Is Very Long And Exceeds Fifty Characters')).toBeInTheDocument();
    });

    // Verify expanded panel is visible
    const expandedPanel = container.querySelector('.preview-badge-expanded');
    expect(expandedPanel).toBeInTheDocument();
  });

  test('collapses on mouse leave when not sticky', async () => {
    const mockPR = {
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(mockPR);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    const { container } = render(<PreviewBadge />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');

    // Hover to expand
    fireEvent.mouseEnter(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title')).toBeInTheDocument();
    });

    // Leave hover
    fireEvent.mouseLeave(badge);

    // Wait for collapse
    await waitFor(() => {
      const expandedPanel = container.querySelector('.preview-badge-expanded');
      expect(expandedPanel).not.toBeInTheDocument();
    });
  });

  test('stays expanded after click (sticky behavior)', async () => {
    const mockPR = {
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(mockPR);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    const { container } = render(<PreviewBadge />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');

    // Click to make sticky
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title')).toBeInTheDocument();
    });

    // Verify sticky class is applied
    expect(badge).toHaveClass('sticky');

    // Leave hover - should still be expanded due to sticky
    fireEvent.mouseLeave(badge);

    // Wait a bit and verify it's still expanded
    await new Promise(resolve => setTimeout(resolve, 100));
    const expandedPanel = container.querySelector('.preview-badge-expanded');
    expect(expandedPanel).toBeInTheDocument();
  });

  test('collapses when clicking sticky badge', async () => {
    const mockPR = {
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(mockPR);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    const { container } = render(<PreviewBadge />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');

    // First click to make sticky
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title')).toBeInTheDocument();
    });

    // Verify it's sticky and expanded
    expect(badge).toHaveClass('sticky');
    let expandedPanel = container.querySelector('.preview-badge-expanded');
    expect(expandedPanel).toBeInTheDocument();

    // Second click should collapse
    fireEvent.click(badge);

    // Wait for collapse
    await waitFor(() => {
      expandedPanel = container.querySelector('.preview-badge-expanded');
      expect(expandedPanel).not.toBeInTheDocument();
    });

    // Verify sticky class is removed
    expect(badge).not.toHaveClass('sticky');

    // Verify window.open was never called for GitHub navigation
    expect(window.open).not.toHaveBeenCalled();
  });

  test('close button resets sticky state', async () => {
    const mockPR = {
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(mockPR);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    const { container } = render(<PreviewBadge />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');

    // Click to make sticky
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title')).toBeInTheDocument();
    });

    // Click close button
    const closeButton = screen.getByTitle('Close expanded view');
    fireEvent.click(closeButton);

    // Wait for collapse
    await waitFor(() => {
      const expandedPanel = container.querySelector('.preview-badge-expanded');
      expect(expandedPanel).not.toBeInTheDocument();
    });

    // Verify sticky class is removed
    expect(badge).not.toHaveClass('sticky');
  });

  test('GitHub navigation works through footer link', async () => {
    const mockPR = {
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(mockPR);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    render(<PreviewBadge />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');

    // Click to make sticky and expand
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title')).toBeInTheDocument();
    });

    // Find and verify the GitHub footer link
    const githubLink = screen.getByText('View on GitHub →');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/litlfred/sgex/pull/123');
    expect(githubLink.closest('a')).toHaveAttribute('target', '_blank');
  });
});
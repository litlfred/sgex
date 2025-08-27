import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import PreviewBadge from '../components/PreviewBadge';
import githubService from '../services/githubService';

// Mock the githubService
jest.mock('../services/githubService', () => ({
  isAuth: jest.fn(),
  getPullRequestsForBranch: jest.fn(),
  getPullRequestComments: jest.fn(),
  getPullRequestIssueComments: jest.fn(),
  createPullRequestComment: jest.fn(),
  mergePullRequest: jest.fn(),
  checkPullRequestMergePermissions: jest.fn(),
  checkCommentPermissions: jest.fn(),
  checkRepositoryWritePermissions: jest.fn(),
  token: 'mock-token'
}));

// Mock environment variables for branch detection
const originalEnv = process.env;

describe('PreviewBadge Merge PR Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.location
    delete window.location;
    window.location = { pathname: '/sgex/test-branch/' };
    
    // Mock window.open
    window.open = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('shows merge button when user has merge permissions', async () => {
    const mockPR = {
      id: 1,
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser', html_url: 'https://github.com/testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);
    githubService.checkCommentPermissions.mockResolvedValue(true);
    githubService.checkPullRequestMergePermissions.mockResolvedValue(true);

    render(<PreviewBadge />);

    // Wait for initial load and expand the badge
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion and PR actions section to appear
    await waitFor(() => {
      expect(screen.getByText('🔀 Pull Request Actions')).toBeInTheDocument();
      expect(screen.getByText('🔀 Merge PR')).toBeInTheDocument();
    });
  });

  test('does not show merge button when user lacks merge permissions', async () => {
    const mockPR = {
      id: 1,
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser', html_url: 'https://github.com/testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);
    githubService.checkCommentPermissions.mockResolvedValue(true);
    githubService.checkPullRequestMergePermissions.mockResolvedValue(false);

    render(<PreviewBadge />);

    // Wait for initial load and expand the badge
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('🔀 Pull Request Actions')).toBeInTheDocument();
      expect(screen.getByText('⚠️ You don\'t have permission to merge this PR')).toBeInTheDocument();
    });

    // Ensure merge button is not present
    expect(screen.queryByText('🔀 Merge PR')).not.toBeInTheDocument();
  });

  test('does not show PR actions for closed PRs', async () => {
    const mockPR = {
      id: 1,
      number: 123,
      title: 'Test PR Title',
      state: 'closed',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser', html_url: 'https://github.com/testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    render(<PreviewBadge />);

    // Wait for initial load and expand the badge
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title')).toBeInTheDocument();
    });

    // Ensure PR actions section is not present for closed PRs
    expect(screen.queryByText('🔀 Pull Request Actions')).not.toBeInTheDocument();
    
    // Verify status notification is shown for closed PR
    expect(screen.getByText('This pull request is closed')).toBeInTheDocument();
    expect(screen.getByText('The pull request has been closed without merging.')).toBeInTheDocument();
  });

  test('shows status notification for merged PRs', async () => {
    const mockPR = {
      id: 1,
      number: 124,
      title: 'Test Merged PR',
      state: 'merged',
      html_url: 'https://github.com/litlfred/sgex/pull/124',
      user: { login: 'testuser', html_url: 'https://github.com/testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description for merged PR'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);

    render(<PreviewBadge />);

    // Wait for initial load and expand the badge
    await waitFor(() => {
      expect(screen.getByText('Test Merged PR')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test Merged PR').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#124: Test Merged PR')).toBeInTheDocument();
    });

    // Ensure PR actions section is not present for merged PRs
    expect(screen.queryByText('🔀 Pull Request Actions')).not.toBeInTheDocument();
    
    // Verify status notification is shown for merged PR
    expect(screen.getByText('This pull request was merged')).toBeInTheDocument();
    expect(screen.getByText('The changes have been successfully merged into the target branch.')).toBeInTheDocument();
  });

  test('does not show status notification for open PRs', async () => {
    const mockPR = {
      id: 1,
      number: 125,
      title: 'Test Open PR',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/125',
      user: { login: 'testuser', html_url: 'https://github.com/testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description for open PR'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);
    githubService.checkCommentPermissions.mockResolvedValue(true);
    githubService.checkPullRequestMergePermissions.mockResolvedValue(false);

    render(<PreviewBadge />);

    // Wait for initial load and expand the badge
    await waitFor(() => {
      expect(screen.getByText('Test Open PR')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test Open PR').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('#125: Test Open PR')).toBeInTheDocument();
    });

    // Ensure PR actions section IS present for open PRs
    expect(screen.getByText('🔀 Pull Request Actions')).toBeInTheDocument();
    
    // Verify status notification is NOT shown for open PRs
    expect(screen.queryByText('This pull request is closed')).not.toBeInTheDocument();
    expect(screen.queryByText('This pull request was merged')).not.toBeInTheDocument();
  });

  test('successfully merges PR when merge button is clicked', async () => {
    const mockPR = {
      id: 1,
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser', html_url: 'https://github.com/testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    const mockMergeResult = {
      sha: 'merged-commit-sha',
      merged: true,
      message: 'Pull Request successfully merged'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);
    githubService.checkCommentPermissions.mockResolvedValue(true);
    githubService.checkPullRequestMergePermissions.mockResolvedValue(true);
    githubService.mergePullRequest.mockResolvedValue(mockMergeResult);

    render(<PreviewBadge />);

    // Wait for initial load and expand the badge
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion and find merge button
    await waitFor(() => {
      expect(screen.getByText('🔀 Merge PR')).toBeInTheDocument();
    });

    const mergeButton = screen.getByText('🔀 Merge PR');
    fireEvent.click(mergeButton);

    // Verify merge function was called with correct parameters
    await waitFor(() => {
      expect(githubService.mergePullRequest).toHaveBeenCalledWith(
        'litlfred',
        'sgex',
        123,
        expect.objectContaining({
          commit_title: 'Merge PR #123: Test PR Title',
          commit_message: expect.stringContaining('Merges pull request #123'),
          merge_method: 'merge'
        })
      );
    });
  });

  test('shows appropriate message when not authenticated', async () => {
    const mockPR = {
      id: 1,
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser', html_url: 'https://github.com/testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(false);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);

    render(<PreviewBadge />);

    // Wait for initial load and expand the badge
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('🔀 Pull Request Actions')).toBeInTheDocument();
      expect(screen.getByText('🔒 Sign in to access PR actions')).toBeInTheDocument();
    });

    // Ensure merge button is not present
    expect(screen.queryByText('🔀 Merge PR')).not.toBeInTheDocument();
  });

  test('disables merge button while merging', async () => {
    const mockPR = {
      id: 1,
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser', html_url: 'https://github.com/testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);
    githubService.checkCommentPermissions.mockResolvedValue(true);
    githubService.checkPullRequestMergePermissions.mockResolvedValue(true);
    
    // Mock a delayed merge response to test loading state
    githubService.mergePullRequest.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ merged: true }), 100))
    );

    render(<PreviewBadge />);

    // Wait for initial load and expand the badge
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion and find merge button
    await waitFor(() => {
      expect(screen.getByText('🔀 Merge PR')).toBeInTheDocument();
    });

    const mergeButton = screen.getByText('🔀 Merge PR');
    fireEvent.click(mergeButton);

    // Check for merging state
    expect(screen.getByText('⏳ Merging...')).toBeInTheDocument();
    
    // Wait for merging to complete
    await waitFor(() => {
      expect(screen.queryByText('⏳ Merging...')).not.toBeInTheDocument();
    });
  });
});
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

// Mock environment variables for branch detection
const originalEnv = process.env;

describe('PreviewBadge Enhanced Functionality', () => {
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

  test('displays branch name when no PR is found', async () => {
    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(null);

    render(<PreviewBadge />);

    await waitFor(() => {
      expect(screen.getByText('test/branch')).toBeInTheDocument();
    });
  });

  test('displays PR information when PR is found', async () => {
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

    render(<PreviewBadge />);

    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });
  });

  test('expands and shows PR details when clicked', async () => {
    const mockPR = {
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    const mockComments = [
      {
        id: 1,
        user: { login: 'commenter1', avatar_url: 'https://avatar1.com' },
        body: 'This is a test comment',
        created_at: '2024-01-01T13:00:00Z',
        type: 'issue'
      }
    ];

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(mockPR);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue(mockComments);

    render(<PreviewBadge />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    // Click to expand
    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion and comments to load
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR Title')).toBeInTheDocument();
      expect(screen.getByText('Test PR description')).toBeInTheDocument();
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });
  });

  test('shows comment form when user can comment', async () => {
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

    // Wait for initial load and click to expand
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getByText('Add Comment')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });
  });

  test('submits new comment successfully', async () => {
    const mockPR = {
      number: 123,
      title: 'Test PR Title',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/123',
      user: { login: 'testuser' },
      created_at: '2024-01-01T12:00:00Z',
      body: 'Test PR description'
    };

    const mockNewComment = {
      id: 2,
      user: { login: 'currentuser', avatar_url: 'https://avatar2.com' },
      body: 'New test comment',
      created_at: '2024-01-01T14:00:00Z'
    };

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(mockPR);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue([]);
    githubService.createPullRequestComment.mockResolvedValue(mockNewComment);

    render(<PreviewBadge />);

    // Expand the badge
    await waitFor(() => {
      expect(screen.getByText('Test PR Title')).toBeInTheDocument();
    });

    const badge = screen.getByText('Test PR Title').closest('.preview-badge');
    fireEvent.click(badge);

    // Wait for expansion and fill in comment
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(textarea, { target: { value: 'New test comment' } });

    const submitButton = screen.getByText('Comment');
    fireEvent.click(submitButton);

    // Verify the comment was submitted
    await waitFor(() => {
      expect(githubService.createPullRequestComment).toHaveBeenCalledWith(
        'litlfred',
        'sgex',
        123,
        'New test comment'
      );
    });
  });

  test('handles non-main branch from environment variable', async () => {
    process.env.REACT_APP_GITHUB_REF_NAME = 'feature/test-branch';
    
    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestForBranch.mockResolvedValue(null);

    render(<PreviewBadge />);

    await waitFor(() => {
      expect(screen.getByText('feature/test-branch')).toBeInTheDocument();
    });
  });
});
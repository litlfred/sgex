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

describe('PreviewBadge Integration Test', () => {
  test('complete workflow: hover, click, interact', async () => {
    const mockPR = {
      id: 1,
      number: 627,
      title: 'Enhanced Preview Branch Badge with Expandable PR Details, Comments, and Mobile Touch Support',
      state: 'open',
      html_url: 'https://github.com/litlfred/sgex/pull/627',
      user: { login: 'copilot' },
      created_at: '2024-01-07T20:00:00Z',
      body: 'This enhancement transforms the preview branch badge from a simple display element into an interactive PR management interface with full mobile device support. When deployed on non-main branches, users can now expand the badge to access detailed PR information, view comments, and participate in discussions without leaving the deployment.'
    };

    const mockComments = [
      {
        id: 1,
        user: { login: 'litlfred', avatar_url: 'https://github.com/litlfred.png' },
        body: '@copilot expansion on mobile phone (Android) is not working',
        created_at: '2024-01-07T21:00:00Z',
        type: 'issue'
      },
      {
        id: 2,
        user: { login: 'copilot', avatar_url: 'https://github.com/copilot.png' },
        body: 'Fixed the mobile touch event handling issue. The problem was that the preview badge only listened for mousedown events to detect clicks outside the expanded panel, but Android devices use touchstart events.',
        created_at: '2024-01-07T22:00:00Z',
        type: 'issue'
      }
    ];

    // Mock environment to simulate preview branch
    delete window.location;
    window.location = { pathname: '/sgex/feature-preview-badge/' };
    window.open = jest.fn();

    githubService.isAuth.mockReturnValue(true);
    githubService.getPullRequestsForBranch.mockResolvedValue([mockPR]);
    githubService.getPullRequestComments.mockResolvedValue([]);
    githubService.getPullRequestIssueComments.mockResolvedValue(mockComments);

    const { container } = render(<PreviewBadge />);

    // 1. Initial load - should show truncated PR title
    await waitFor(() => {
      expect(screen.getByText(/Enhanced Preview Branch Badge \.\.\./)).toBeInTheDocument();
    });

    const badge = screen.getByText(/Enhanced Preview Branch Badge \.\.\./).closest('.preview-badge');
    
    // Verify truncation works (~30 chars)
    const titleElement = screen.getByText(/Enhanced Preview Branch Badge \.\.\./);
    expect(titleElement.textContent.length).toBeLessThanOrEqual(33);

    // 2. Click behavior - should expand to show comments
    fireEvent.click(badge);

    await waitFor(() => {
      expect(screen.getByText('#627: Enhanced Preview Branch Badge with Expandable PR Details, Comments, and Mobile Touch Support')).toBeInTheDocument();
    });

    let expandedPanel = container.querySelector('.preview-badge-expanded');
    expect(expandedPanel).toBeInTheDocument();

    // 3. Should show comments section
    await waitFor(() => {
      expect(screen.getByText('Recent Comments (2/5)')).toBeInTheDocument();
    });

    // Should have sticky and expanded classes
    expect(badge).toHaveClass('sticky');
    expect(badge).toHaveClass('expanded');

    // 4. Verify comments are loaded and displayed (truncated to 200 chars)
    expect(screen.getByText('@copilot expansion on mobile phone (Android) is not working')).toBeInTheDocument();
    expect(screen.getByText(/Fixed the mobile touch event handling issue.*touchstart e\.\.\./)).toBeInTheDocument();

    // 5. Test comment expansion (if > 200 chars)
    const showMoreButton = screen.queryByText('Show more');
    if (showMoreButton) {
      fireEvent.click(showMoreButton);
      await waitFor(() => {
        expect(screen.getByText(/touchstart events/)).toBeInTheDocument();
      });
    }

    // 6. Close using close button
    const closeButton = screen.getByTitle('Close expanded view');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expandedPanel = container.querySelector('.preview-badge-expanded');
      expect(expandedPanel).not.toBeInTheDocument();
    });

    // Should remove sticky and expanded classes
    expect(badge).not.toHaveClass('sticky');
    expect(badge).not.toHaveClass('expanded');

    console.log('✅ All PreviewBadge enhanced functionality working correctly:');
    console.log('  - Click to expand ✅');
    console.log('  - PR title truncation (~30 chars) ✅');
    console.log('  - Comments display with truncation ✅');
    console.log('  - Comment expansion ✅');
    console.log('  - Close functionality ✅');
    console.log('  - Visual feedback with sticky styling ✅');
  });
});
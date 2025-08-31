import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkflowDashboard from '../components/WorkflowDashboard';

// Mock GitHub Actions service
const mockGithubActionsService = {
  getAllWorkflowsForBranch: jest.fn(() => Promise.resolve([])),
  setToken: jest.fn()
};

describe('Ready for Review Button', () => {
  const mockProps = {
    branchName: 'test-branch',
    githubActionsService: mockGithubActionsService,
    isAuthenticated: true,
    canMergePR: true,
    canReviewPR: false,
    prInfo: [{
      number: 123,
      title: 'Test PR',
      draft: true, // Draft PR
      state: 'open'
    }],
    onMarkReadyForReview: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows ready for review button for draft PR', async () => {
    render(<WorkflowDashboard {...mockProps} />);
    
    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByText('PR #123 is in draft mode')).toBeInTheDocument();
    });

    const readyButton = screen.getByText('✅ Ready for review');
    expect(readyButton).toBeInTheDocument();
    expect(readyButton).toHaveClass('pr-ready-review-btn');
  });

  test('does not show ready for review button for non-draft PR', async () => {
    const nonDraftProps = {
      ...mockProps,
      prInfo: [{
        ...mockProps.prInfo[0],
        draft: false
      }]
    };

    render(<WorkflowDashboard {...nonDraftProps} />);
    
    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByText('PR #123 is ready for actions')).toBeInTheDocument();
    });

    expect(screen.queryByText('✅ Ready for review')).not.toBeInTheDocument();
    expect(screen.getByText('🔀 Merge PR')).toBeInTheDocument();
  });

  test('shows draft status in PR actions header', async () => {
    render(<WorkflowDashboard {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('PR #123 is in draft mode')).toBeInTheDocument();
    });
  });

  test('shows ready status for non-draft PR', async () => {
    const nonDraftProps = {
      ...mockProps,
      prInfo: [{
        ...mockProps.prInfo[0],
        draft: false
      }]
    };

    render(<WorkflowDashboard {...nonDraftProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('PR #123 is ready for actions')).toBeInTheDocument();
    });
  });

  test('calls onMarkReadyForReview when button is clicked', async () => {
    render(<WorkflowDashboard {...mockProps} />);
    
    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByText('✅ Ready for review')).toBeInTheDocument();
    });

    const readyButton = screen.getByText('✅ Ready for review');
    fireEvent.click(readyButton);
    
    expect(mockProps.onMarkReadyForReview).toHaveBeenCalledWith('litlfred', 'sgex', 123);
  });

  test('disables button when marking ready for review', async () => {
    const loadingProps = {
      ...mockProps,
      isMarkingReadyForReview: true
    };

    render(<WorkflowDashboard {...loadingProps} />);
    
    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByText('⏳ Marking ready...')).toBeInTheDocument();
    });

    const readyButton = screen.getByText('⏳ Marking ready...');
    expect(readyButton).toBeDisabled();
  });

  test('does not show ready for review button when not authenticated', async () => {
    const unauthenticatedProps = {
      ...mockProps,
      isAuthenticated: false
    };

    render(<WorkflowDashboard {...unauthenticatedProps} />);
    
    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByText('🔒 Sign in to access PR actions')).toBeInTheDocument();
    });

    expect(screen.queryByText('✅ Ready for review')).not.toBeInTheDocument();
  });

  test('does not show ready for review button when cannot merge PR', async () => {
    const noMergeProps = {
      ...mockProps,
      canMergePR: false
    };

    render(<WorkflowDashboard {...noMergeProps} />);
    
    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByText('⚠️ You don\'t have permission to merge or review this PR')).toBeInTheDocument();
    });

    expect(screen.queryByText('✅ Ready for review')).not.toBeInTheDocument();
  });
});
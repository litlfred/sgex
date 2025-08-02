import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkflowStatus from '../components/WorkflowStatus';

describe('WorkflowStatus Component', () => {
  const mockTriggerWorkflow = jest.fn();
  
  beforeEach(() => {
    mockTriggerWorkflow.mockClear();
  });

  test('renders loading state correctly', () => {
    render(
      <WorkflowStatus
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={true}
        isLoading={true}
      />
    );

    expect(screen.getByText('⚙️ Build Status')).toBeInTheDocument();
    expect(screen.getByText('Loading workflow status...')).toBeInTheDocument();
  });

  test('renders not started status correctly', () => {
    const workflowStatus = {
      status: 'not_started',
      conclusion: null,
      url: null,
      runId: null,
      createdAt: null,
      displayStatus: 'Not Started',
      badgeClass: 'not-started',
      icon: '⚪'
    };

    render(
      <WorkflowStatus
        workflowStatus={workflowStatus}
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={true}
        isLoading={false}
      />
    );

    expect(screen.getByText('⚙️ Build Status')).toBeInTheDocument();
    expect(screen.getByText('⚪')).toBeInTheDocument();
    expect(screen.getByText('Not Started')).toBeInTheDocument();
    expect(screen.getByText('🔄 Trigger Build')).toBeInTheDocument();
  });

  test('renders in progress status correctly', () => {
    const workflowStatus = {
      status: 'in_progress',
      conclusion: null,
      url: 'https://github.com/litlfred/sgex/actions/runs/123',
      runId: 123,
      createdAt: new Date('2023-01-01T10:00:00Z'),
      displayStatus: 'In Progress',
      badgeClass: 'in-progress',
      icon: '🟡'
    };

    render(
      <WorkflowStatus
        workflowStatus={workflowStatus}
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={true}
        isLoading={false}
      />
    );

    expect(screen.getByText('⚙️ Build Status')).toBeInTheDocument();
    
    // Check that the status badge is a link
    const statusLink = screen.getByRole('link', { name: /🟡 In Progress/ });
    expect(statusLink).toBeInTheDocument();
    expect(statusLink).toHaveAttribute('href', 'https://github.com/litlfred/sgex/actions/runs/123');
    
    // Check that "View Log" link is present
    expect(screen.getByRole('link', { name: '📋 View Log' })).toBeInTheDocument();
    
    // Check trigger button is present
    expect(screen.getByText('🔄 Trigger Build')).toBeInTheDocument();
  });

  test('renders succeeded status correctly', () => {
    const workflowStatus = {
      status: 'completed',
      conclusion: 'success',
      url: 'https://github.com/litlfred/sgex/actions/runs/456',
      runId: 456,
      createdAt: new Date('2023-01-01T10:00:00Z'),
      displayStatus: 'Succeeded',
      badgeClass: 'succeeded',
      icon: '🟢'
    };

    render(
      <WorkflowStatus
        workflowStatus={workflowStatus}
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={true}
        isLoading={false}
      />
    );

    const statusLink = screen.getByRole('link', { name: /🟢 Succeeded/ });
    expect(statusLink).toBeInTheDocument();
    expect(statusLink).toHaveAttribute('href', 'https://github.com/litlfred/sgex/actions/runs/456');
  });

  test('renders failed status correctly', () => {
    const workflowStatus = {
      status: 'completed',
      conclusion: 'failure',
      url: 'https://github.com/litlfred/sgex/actions/runs/789',
      runId: 789,
      createdAt: new Date('2023-01-01T10:00:00Z'),
      displayStatus: 'Failed',
      badgeClass: 'failed',
      icon: '🔴'
    };

    render(
      <WorkflowStatus
        workflowStatus={workflowStatus}
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={true}
        isLoading={false}
      />
    );

    const statusLink = screen.getByRole('link', { name: /🔴 Failed/ });
    expect(statusLink).toBeInTheDocument();
    expect(statusLink).toHaveAttribute('href', 'https://github.com/litlfred/sgex/actions/runs/789');
  });

  test('triggers workflow when button is clicked', async () => {
    const workflowStatus = {
      status: 'not_started',
      conclusion: null,
      url: null,
      runId: null,
      createdAt: null,
      displayStatus: 'Not Started',
      badgeClass: 'not-started',
      icon: '⚪'
    };

    mockTriggerWorkflow.mockResolvedValue(true);

    render(
      <WorkflowStatus
        workflowStatus={workflowStatus}
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={true}
        isLoading={false}
      />
    );

    const triggerButton = screen.getByText('🔄 Trigger Build');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(mockTriggerWorkflow).toHaveBeenCalledWith('test-branch');
    });
  });

  test('does not show trigger button when not authenticated', () => {
    const workflowStatus = {
      status: 'not_started',
      conclusion: null,
      url: null,
      runId: null,
      createdAt: null,
      displayStatus: 'Not Started',
      badgeClass: 'not-started',
      icon: '⚪'
    };

    render(
      <WorkflowStatus
        workflowStatus={workflowStatus}
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={false}
        isLoading={false}
      />
    );

    expect(screen.queryByText('🔄 Trigger Build')).not.toBeInTheDocument();
  });

  test('shows triggering state when workflow is being triggered', async () => {
    const workflowStatus = {
      status: 'not_started',
      conclusion: null,
      url: null,
      runId: null,
      createdAt: null,
      displayStatus: 'Not Started',
      badgeClass: 'not-started',
      icon: '⚪'
    };

    // Mock a delayed response to test the loading state
    mockTriggerWorkflow.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));

    render(
      <WorkflowStatus
        workflowStatus={workflowStatus}
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={true}
        isLoading={false}
      />
    );

    const triggerButton = screen.getByText('🔄 Trigger Build');
    fireEvent.click(triggerButton);

    // Check for loading state
    expect(screen.getByText('⏳ Starting...')).toBeInTheDocument();
    
    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.queryByText('⏳ Starting...')).not.toBeInTheDocument();
    });
  });

  test('renders error state when workflow status is null', () => {
    render(
      <WorkflowStatus
        workflowStatus={null}
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={true}
        isLoading={false}
      />
    );

    expect(screen.getByText('⚙️ Build Status')).toBeInTheDocument();
    expect(screen.getByText('Unable to load workflow status')).toBeInTheDocument();
  });

  test('formats date correctly', () => {
    const workflowStatus = {
      status: 'completed',
      conclusion: 'success',
      url: 'https://github.com/litlfred/sgex/actions/runs/456',
      runId: 456,
      createdAt: new Date('2023-01-15T14:30:00Z'),
      displayStatus: 'Succeeded',
      badgeClass: 'succeeded',
      icon: '🟢'
    };

    render(
      <WorkflowStatus
        workflowStatus={workflowStatus}
        branchName="test-branch"
        onTriggerWorkflow={mockTriggerWorkflow}
        isAuthenticated={true}
        isLoading={false}
      />
    );

    // Check that the date is formatted and displayed
    expect(screen.getByText(/Jan 15/)).toBeInTheDocument();
  });
});
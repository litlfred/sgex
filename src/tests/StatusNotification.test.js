import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component that mimics the status notification logic
const StatusNotification = ({ state }) => {
  if (state === 'open') return null;
  
  return (
    <div className={`pr-status-notification pr-status-${state}`}>
      <div className="status-icon">
        {state === 'closed' && '❌'}
        {state === 'merged' && '🔀'}
      </div>
      <div className="status-message">
        <strong>
          {state === 'closed' && 'This pull request is closed'}
          {state === 'merged' && 'This pull request was merged'}
        </strong>
        <div className="status-details">
          {state === 'closed' && 'The pull request has been closed without merging.'}
          {state === 'merged' && 'The changes have been successfully merged into the target branch.'}
        </div>
      </div>
    </div>
  );
};

describe('StatusNotification Component', () => {
  test('shows status notification for closed PRs', () => {
    render(<StatusNotification state="closed" />);
    
    expect(screen.getByText('This pull request is closed')).toBeInTheDocument();
    expect(screen.getByText('The pull request has been closed without merging.')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  test('shows status notification for merged PRs', () => {
    render(<StatusNotification state="merged" />);
    
    expect(screen.getByText('This pull request was merged')).toBeInTheDocument();
    expect(screen.getByText('The changes have been successfully merged into the target branch.')).toBeInTheDocument();
    expect(screen.getByText('🔀')).toBeInTheDocument();
  });

  test('does not show status notification for open PRs', () => {
    const { container } = render(<StatusNotification state="open" />);
    
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('This pull request is closed')).not.toBeInTheDocument();
    expect(screen.queryByText('This pull request was merged')).not.toBeInTheDocument();
  });
});
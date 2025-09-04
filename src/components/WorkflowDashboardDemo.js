import React, { useState, useEffect } from 'react';
import WorkflowDashboard from './WorkflowDashboard';
import { timeAgo, formatTimestamp } from '../utils/timeUtils';

// Mock GitHub Actions Service for demonstration
class MockGitHubActionsService {
  constructor() {
    this.mockWorkflows = [
      {
        workflow: {
          id: 1,
          name: 'Code Quality Checks',
          path: '.github/workflows/code-quality.yml',
          url: 'https://github.com/litlfred/sgex/actions/workflows/code-quality.yml'
        },
        status: 'completed',
        conclusion: 'success',
        url: 'https://github.com/litlfred/sgex/actions/runs/12345',
        runId: 12345,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        displayStatus: 'Succeeded',
        badgeClass: 'succeeded',
        icon: '🟢',
        workflowUrl: 'https://github.com/litlfred/sgex/actions/workflows/1'
      },
      {
        workflow: {
          id: 2,
          name: 'Deploy Feature Branch',
          path: '.github/workflows/branch-deployment.yml',
          url: 'https://github.com/litlfred/sgex/actions/workflows/branch-deployment.yml'
        },
        status: 'waiting',
        conclusion: null,
        url: 'https://github.com/litlfred/sgex/actions/runs/12346',
        runId: 12346,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        displayStatus: 'Awaiting Approval',
        badgeClass: 'waiting',
        icon: '🟠',
        workflowUrl: 'https://github.com/litlfred/sgex/actions/workflows/2'
      },
      {
        workflow: {
          id: 3,
          name: 'PR Commit Feedback',
          path: '.github/workflows/pr-feedback.yml',
          url: 'https://github.com/litlfred/sgex/actions/workflows/pr-feedback.yml'
        },
        status: 'in_progress',
        conclusion: null,
        url: 'https://github.com/litlfred/sgex/actions/runs/12347',
        runId: 12347,
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        displayStatus: 'In Progress',
        badgeClass: 'in-progress',
        icon: '🟡',
        workflowUrl: 'https://github.com/litlfred/sgex/actions/workflows/3'
      }
    ];
  }

  async getAllWorkflowsForBranch(branch) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockWorkflows;
  }

  async approveWorkflowRun(runId) {
    // Simulate approval
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the workflow status
    const workflow = this.mockWorkflows.find(w => w.runId === runId);
    if (workflow) {
      workflow.status = 'in_progress';
      workflow.displayStatus = 'In Progress';
      workflow.badgeClass = 'in-progress';
      workflow.icon = '🟡';
      workflow.createdAt = new Date(); // Update to current time
    }
    
    return true;
  }

  isAuthenticated() {
    return true;
  }
}

const WorkflowDashboardDemo = () => {
  const [mockService] = useState(() => new MockGitHubActionsService());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every 30 seconds to show relative time changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleWorkflowAction = (actionData) => {
    console.log('Workflow action performed:', actionData);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1>Enhanced Workflow Status Dashboard Demo</h1>
        <p>This demo shows the enhanced workflow status display with relative time formatting.</p>
        
        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Time Utility Examples:</h3>
          <p><strong>Current time:</strong> {currentTime.toLocaleString()}</p>
          <p><strong>5 minutes ago:</strong> {timeAgo(new Date(Date.now() - 5 * 60 * 1000))}</p>
          <p><strong>2 hours ago:</strong> {timeAgo(new Date(Date.now() - 2 * 60 * 60 * 1000))}</p>
          <p><strong>3 days ago:</strong> {timeAgo(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))}</p>
          <p><strong>Full timestamp example:</strong> {JSON.stringify(formatTimestamp(new Date(Date.now() - 5 * 60 * 1000)), null, 2)}</p>
        </div>

        <WorkflowDashboard
          branchName="feature/workflow-status-enhancement"
          githubActionsService={mockService}
          isAuthenticated={true}
          canTriggerWorkflows={true}
          canApproveWorkflows={true}
          onWorkflowAction={handleWorkflowAction}
        />
      </div>
    </div>
  );
};

export default WorkflowDashboardDemo;
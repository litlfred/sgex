import React, { useState } from 'react';
import { timeAgo, formatTimestamp } from '../utils/timeUtils';

const WorkflowStatus = ({ 
  workflowStatus, 
  branchName, 
  onTriggerWorkflow, 
  onApproveWorkflow,
  isAuthenticated, 
  canTriggerWorkflows = false,
  canApproveWorkflows = false,
  isLoading = false 
}) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleTriggerWorkflow = async () => {
    if (!isAuthenticated || isTriggering || !onTriggerWorkflow || !canTriggerWorkflows) return;
    
    setIsTriggering(true);
    try {
      await onTriggerWorkflow(branchName);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleApproveWorkflow = async () => {
    if (!isAuthenticated || isApproving || !onApproveWorkflow || !canApproveWorkflows || !workflowStatus?.runId) return;
    
    setIsApproving(true);
    try {
      await onApproveWorkflow(workflowStatus.runId);
    } finally {
      setIsApproving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="workflow-status-section">
        <div className="workflow-status-header">
          <h4 className="workflow-status-title">⚙️ Build Status</h4>
        </div>
        <div className="workflow-loading">Loading workflow status...</div>
      </div>
    );
  }

  if (!workflowStatus) {
    return (
      <div className="workflow-status-section">
        <div className="workflow-status-header">
          <h4 className="workflow-status-title">⚙️ Build Status</h4>
        </div>
        <div className="workflow-error">Unable to load workflow status</div>
      </div>
    );
  }

  return (
    <div className="workflow-status-section">
      <div className="workflow-status-header">
        <h4 className="workflow-status-title">⚙️ Build Status</h4>
      </div>
      
      <div className="workflow-status-container">
        <div className="workflow-status-info">
          {workflowStatus.url ? (
            <a 
              href={workflowStatus.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`workflow-status-badge ${workflowStatus.badgeClass}`}
            >
              <span>{workflowStatus.icon}</span>
              {workflowStatus.displayStatus}
            </a>
          ) : (
            <span className={`workflow-status-badge ${workflowStatus.badgeClass}`}>
              <span>{workflowStatus.icon}</span>
              {workflowStatus.displayStatus}
            </span>
          )}
          
          {workflowStatus.createdAt && (
            <span className="workflow-status-details" title={formatTimestamp(workflowStatus.createdAt).full}>
              {timeAgo(workflowStatus.createdAt)} ({formatDate(workflowStatus.createdAt)})
            </span>
          )}
        </div>
        
        <div className="workflow-actions">
          {isAuthenticated && canTriggerWorkflows && (
            <button
              onClick={handleTriggerWorkflow}
              disabled={isTriggering}
              className="workflow-trigger-btn"
              title={`Trigger build for ${branchName}`}
            >
              {isTriggering ? (
                <>⏳ Starting...</>
              ) : (
                <>🔄 Trigger Build</>
              )}
            </button>
          )}
          
          {isAuthenticated && canApproveWorkflows && workflowStatus?.status === 'waiting' && (
            <button
              onClick={handleApproveWorkflow}
              disabled={isApproving}
              className="workflow-approve-btn"
              title={`Approve workflow run for ${branchName}`}
            >
              {isApproving ? (
                <>⏳ Approving...</>
              ) : (
                <>✅ Approve Run</>
              )}
            </button>
          )}
          
          {workflowStatus?.url && (
            <a
              href={workflowStatus.url}
              target="_blank"
              rel="noopener noreferrer"
              className="workflow-link"
            >
              📋 View Log
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowStatus;
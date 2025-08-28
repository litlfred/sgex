import React, { useState, useEffect, useRef } from 'react';
import './WorkflowDashboard.css';

const WorkflowDashboard = ({ 
  branchName, 
  githubActionsService,
  isAuthenticated, 
  canTriggerWorkflows = false,
  canApproveWorkflows = false,
  onWorkflowAction = null, // Callback for when workflow actions are performed
  // PR actions props
  prInfo = null,
  canMergePR = false,
  canReviewPR = false,
  isMergingPR = false,
  isApprovingPR = false,
  isRequestingChanges = false,
  approvalStatus = null,
  approvalMessage = '',
  newComment = '',
  onMergePR = null,
  onApprovePR = null,
  onRequestChanges = null
}) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionStates, setActionStates] = useState({}); // Track individual action states
  const refreshIntervalRef = useRef(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fetch all workflows for the branch
  const fetchWorkflows = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      if (!githubActionsService || !branchName) {
        throw new Error('Missing required parameters');
      }

      console.debug(`Fetching workflows for branch: ${branchName}`);
      const workflowData = await githubActionsService.getAllWorkflowsForBranch(branchName);
      
      console.debug(`Fetched ${workflowData.length} workflows:`, workflowData.map(w => ({
        name: w.workflow.name,
        status: w.displayStatus,
        lastRun: w.createdAt
      })));

      setWorkflows(workflowData);
      setLastRefresh(new Date());

      // Call callback if provided
      if (onWorkflowAction && workflowData.length > 0) {
        onWorkflowAction({ type: 'workflows_loaded', workflows: workflowData });
      }

    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Setup auto-refresh
  const setupAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Refresh every 15 seconds for active monitoring
    refreshIntervalRef.current = setInterval(() => {
      fetchWorkflows(true);
    }, 15000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Initial load and setup refresh when branch changes
  useEffect(() => {
    if (branchName && githubActionsService) {
      const initializeWorkflows = async () => {
        await fetchWorkflows();
        setupAutoRefresh();
      };
      initializeWorkflows();
    }
  }, [branchName, githubActionsService]); // Remove fetchWorkflows and setupAutoRefresh from dependencies to avoid infinite loops

  // Handle workflow trigger
  const handleTriggerWorkflow = async (workflow) => {
    if (!isAuthenticated || !canTriggerWorkflows || !githubActionsService) return;
    
    const workflowId = workflow.workflow.id;
    setActionStates(prev => ({ ...prev, [workflowId]: { action: 'triggering' } }));

    try {
      console.debug(`Triggering workflow: ${workflow.workflow.name} for branch: ${branchName}`);
      const success = await githubActionsService.triggerWorkflow(branchName);
      
      if (success) {
        setActionStates(prev => ({ ...prev, [workflowId]: { action: 'triggered', message: 'Workflow triggered successfully!' } }));
        
        // Refresh workflows after a short delay
        setTimeout(() => {
          fetchWorkflows(true);
        }, 2000);

        // Call callback
        if (onWorkflowAction) {
          onWorkflowAction({ type: 'workflow_triggered', workflow, success: true });
        }
      } else {
        setActionStates(prev => ({ ...prev, [workflowId]: { action: 'error', message: 'Failed to trigger workflow' } }));
      }
    } catch (error) {
      console.error('Error triggering workflow:', error);
      setActionStates(prev => ({ ...prev, [workflowId]: { action: 'error', message: error.message } }));
    }

    // Clear action state after 5 seconds
    setTimeout(() => {
      setActionStates(prev => {
        const newState = { ...prev };
        delete newState[workflowId];
        return newState;
      });
    }, 5000);
  };

  // Handle workflow rerun
  const handleRerunWorkflow = async (workflow) => {
    const runId = workflow.runId || workflow.lastRunId;
    if (!isAuthenticated || !runId || !githubActionsService) return;
    
    const workflowId = workflow.workflow.id;
    setActionStates(prev => ({ ...prev, [workflowId]: { action: 'rerunning' } }));

    try {
      console.debug(`Rerunning failed workflow run: ${runId} for workflow: ${workflow.workflow.name}`);
      const success = await githubActionsService.rerunFailedWorkflow(runId);
      
      if (success) {
        setActionStates(prev => ({ ...prev, [workflowId]: { action: 'rerun', message: 'Workflow rerun started!' } }));
        
        // Refresh workflows after a short delay
        setTimeout(() => {
          fetchWorkflows(true);
        }, 2000);

        // Call callback
        if (onWorkflowAction) {
          onWorkflowAction({ type: 'workflow_rerun', workflow, success: true });
        }
      } else {
        setActionStates(prev => ({ ...prev, [workflowId]: { action: 'error', message: 'Failed to rerun workflow' } }));
      }
    } catch (error) {
      console.error('Error rerunning workflow:', error);
      setActionStates(prev => ({ ...prev, [workflowId]: { action: 'error', message: error.message } }));
    }

    // Clear action state after 5 seconds
    setTimeout(() => {
      setActionStates(prev => {
        const newState = { ...prev };
        delete newState[workflowId];
        return newState;
      });
    }, 5000);
  };

  // Handle workflow approval  
  const handleApproveWorkflow = async (workflow) => {
    const runId = workflow.runId || workflow.lastRunId;
    if (!isAuthenticated || !canApproveWorkflows || !runId || !githubActionsService) return;
    
    const workflowId = workflow.workflow.id;
    setActionStates(prev => ({ ...prev, [workflowId]: { action: 'approving' } }));

    try {
      console.debug(`Approving workflow run: ${runId} for workflow: ${workflow.workflow.name}`);
      const success = await githubActionsService.approveWorkflowRun(runId);
      
      if (success) {
        setActionStates(prev => ({ ...prev, [workflowId]: { action: 'approved', message: 'Workflow approved successfully!' } }));
        
        // Refresh workflows after a short delay
        setTimeout(() => {
          fetchWorkflows(true);
        }, 1000);

        // Call callback
        if (onWorkflowAction) {
          onWorkflowAction({ type: 'workflow_approved', workflow, success: true });
        }
      } else {
        setActionStates(prev => ({ ...prev, [workflowId]: { action: 'error', message: 'Failed to approve workflow' } }));
      }
    } catch (error) {
      console.error('Error approving workflow:', error);
      setActionStates(prev => ({ ...prev, [workflowId]: { action: 'error', message: error.message } }));
    }

    // Clear action state after 5 seconds
    setTimeout(() => {
      setActionStates(prev => {
        const newState = { ...prev };
        delete newState[workflowId];
        return newState;
      });
    }, 5000);
  };

  // Manual refresh
  const handleManualRefresh = () => {
    fetchWorkflows(true);
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getWorkflowDescription = (workflow) => {
    const name = workflow.workflow.name.toLowerCase();
    const path = workflow.workflow.path.toLowerCase();
    
    if (name.includes('deploy') && name.includes('landing')) {
      return 'Deploys main branch to production landing page';
    } else if (name.includes('deploy') && name.includes('feature')) {
      return 'Deploys feature branch for preview';
    } else if (name.includes('deploy') || path.includes('deploy')) {
      return 'Deployment workflow';
    } else if (name.includes('ci') || name.includes('test') || path.includes('ci') || path.includes('test')) {
      return 'Continuous integration and testing';
    } else if (name.includes('build') || path.includes('build')) {
      return 'Build and compilation workflow';
    } else {
      return 'Workflow automation';
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="workflow-dashboard">
        <div className="workflow-dashboard-header">
          <h4>⚙️ Workflow Status Dashboard</h4>
        </div>
        <div className="workflow-dashboard-loading">
          <div className="loading-spinner"></div>
          <span>Loading workflow status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workflow-dashboard">
        <div className="workflow-dashboard-header">
          <h4>⚙️ Workflow Status Dashboard</h4>
        </div>
        <div className="workflow-dashboard-error">
          <span className="error-icon">❌</span>
          <span>Error: {error}</span>
          <button onClick={() => fetchWorkflows()} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-dashboard">
      <div className="workflow-dashboard-header">
        <div className="dashboard-title">
          <h4>⚙️ Workflow Status Dashboard</h4>
          <span className="branch-indicator">Branch: <code>{branchName}</code></span>
        </div>
        <div className="dashboard-controls">
          {lastRefresh && (
            <span className="last-refresh">
              Last updated: {formatDate(lastRefresh)}
            </span>
          )}
          <button 
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="refresh-btn"
            title="Refresh workflow status"
          >
            {refreshing ? '⏳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* PR Actions Section - moved into workflow dashboard */}
      {prInfo && prInfo.length > 0 && prInfo[0].state === 'open' && (
        <div className="pr-actions-section">
          <div className="pr-actions-header">
            <h4>🔀 Pull Request Actions</h4>
            <span className="pr-actions-status">
              PR #{prInfo[0].number} is ready for actions
            </span>
          </div>
          <div className="pr-actions-container">
            <div className="pr-actions-buttons">
              {isAuthenticated && canMergePR && (
                <button
                  onClick={() => onMergePR && onMergePR('litlfred', 'sgex', prInfo[0].number)}
                  disabled={isMergingPR}
                  className="pr-merge-btn"
                  title={`Merge PR #${prInfo[0].number}`}
                >
                  {isMergingPR ? (
                    <>⏳ Merging...</>
                  ) : (
                    <>🔀 Merge PR</>
                  )}
                </button>
              )}
              
              {/* PR Review Buttons */}
              {isAuthenticated && canReviewPR && (
                <>
                  <div className="pr-review-note">
                    💡 Use the comment form above to add feedback with your review.
                  </div>
                  <div className="pr-review-buttons">
                    <button
                      onClick={() => onApprovePR && onApprovePR('litlfred', 'sgex', prInfo[0].number)}
                      disabled={isApprovingPR}
                      className="pr-approve-btn"
                      title={`Approve PR #${prInfo[0].number}`}
                    >
                      {isApprovingPR ? (
                        <>⏳ Approving...</>
                      ) : (
                        <>✅ Approve</>
                      )}
                    </button>
                    <button
                      onClick={() => onRequestChanges && onRequestChanges('litlfred', 'sgex', prInfo[0].number)}
                      disabled={isRequestingChanges || !newComment.trim()}
                      className="pr-request-changes-btn"
                      title={`Request changes for PR #${prInfo[0].number} (comment required)`}
                    >
                      {isRequestingChanges ? (
                        <>⏳ Requesting...</>
                      ) : (
                        <>❌ Request Changes</>
                      )}
                    </button>
                  </div>
                  
                  {/* Approval Status Message */}
                  {approvalStatus && (
                    <div className={`approval-status-message ${approvalStatus}`}>
                      {approvalMessage}
                    </div>
                  )}
                </>
              )}
              
              {!isAuthenticated && (
                <span className="pr-actions-note">
                  🔒 Sign in to access PR actions
                </span>
              )}
              {isAuthenticated && !canMergePR && !canReviewPR && (
                <span className="pr-actions-note">
                  ⚠️ You don't have permission to merge or review this PR
                </span>
              )}
              {isAuthenticated && !canMergePR && canReviewPR && (
                <span className="pr-actions-note">
                  ℹ️ You can review this PR but cannot merge it
                </span>
              )}
              {isAuthenticated && canMergePR && !canReviewPR && (
                <span className="pr-actions-note">
                  ℹ️ You can merge this PR but cannot review it
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="workflow-dashboard-empty">
          <span className="empty-icon">📋</span>
          <span>No workflows found for this branch</span>
          <div className="empty-description">
            This branch may not have any active workflows configured, or they may not have run yet.
          </div>
        </div>
      ) : (
        <div className="workflow-dashboard-content">
          <div className="workflow-summary">
            <span className="summary-text">
              Found {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} for this branch
            </span>
            <div className="summary-stats">
              {workflows.filter(w => w.status === 'in_progress' || w.status === 'queued').length > 0 && (
                <span className="stat-badge in-progress">
                  {workflows.filter(w => w.status === 'in_progress' || w.status === 'queued').length} running
                </span>
              )}
              {workflows.filter(w => w.status === 'waiting').length > 0 && (
                <span className="stat-badge waiting">
                  {workflows.filter(w => w.status === 'waiting').length} awaiting approval
                </span>
              )}
              {workflows.filter(w => w.conclusion === 'success').length > 0 && (
                <span className="stat-badge success">
                  {workflows.filter(w => w.conclusion === 'success').length} successful
                </span>
              )}
              {workflows.filter(w => w.conclusion === 'failure').length > 0 && (
                <span className="stat-badge failed">
                  {workflows.filter(w => w.conclusion === 'failure').length} failed
                </span>
              )}
            </div>
          </div>

          <div className="workflows-list">
            {workflows.map((workflow) => {
              const actionState = actionStates[workflow.workflow.id];
              
              return (
                <div key={workflow.workflow.id} className="workflow-card">
                  <div className="workflow-header">
                    <div className="workflow-info">
                      <div className="workflow-name">
                        <a
                          href={workflow.workflowUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="workflow-link"
                        >
                          {workflow.workflow.name}
                        </a>
                      </div>
                      <div className="workflow-description">
                        {getWorkflowDescription(workflow)}
                      </div>
                    </div>
                    <div className="workflow-status">
                      {workflow.url ? (
                        <a
                          href={workflow.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`status-badge ${workflow.badgeClass}`}
                        >
                          <span className="status-icon">{workflow.icon}</span>
                          <span className="status-text">{workflow.displayStatus}</span>
                        </a>
                      ) : (
                        <span className={`status-badge ${workflow.badgeClass}`}>
                          <span className="status-icon">{workflow.icon}</span>
                          <span className="status-text">{workflow.displayStatus}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="workflow-details">
                    {workflow.createdAt && (
                      <span className="workflow-timestamp">
                        Last run: {formatDate(workflow.createdAt)}
                      </span>
                    )}
                    {(workflow.runId || workflow.lastRunId) && (
                      <span className="workflow-run-id">
                        Run ID: {workflow.runId || workflow.lastRunId}
                      </span>
                    )}
                  </div>

                  {/* Action buttons and status messages */}
                  <div className="workflow-actions">
                    {isAuthenticated ? (
                      <>
                        {/* Always show trigger button when authenticated */}
                        <button
                          onClick={() => handleTriggerWorkflow(workflow)}
                          disabled={actionState?.action === 'triggering'}
                          className="workflow-action-btn trigger-btn"
                          title={`Trigger ${workflow.workflow.name}`}
                        >
                          {actionState?.action === 'triggering' ? (
                            <>⏳ Starting...</>
                          ) : (
                            <>🔄 Trigger</>
                          )}
                        </button>

                        {/* Show approve button for workflows awaiting approval - use both runId and lastRunId */}
                        {workflow.status === 'waiting' && (workflow.runId || workflow.lastRunId) && (
                          <button
                            onClick={() => handleApproveWorkflow(workflow)}
                            disabled={actionState?.action === 'approving'}
                            className="workflow-action-btn approve-btn"
                            title={`Approve ${workflow.workflow.name}`}
                          >
                            {actionState?.action === 'approving' ? (
                              <>⏳ Approving...</>
                            ) : (
                              <>✅ Approve</>
                            )}
                          </button>
                        )}

                        {/* Show rerun button for failed workflows - use both runId and lastRunId */}
                        {workflow.conclusion === 'failure' && (workflow.runId || workflow.lastRunId) && (
                          <button
                            onClick={() => handleRerunWorkflow(workflow)}
                            disabled={actionState?.action === 'rerunning'}
                            className="workflow-action-btn rerun-btn"
                            title={`Rerun failed jobs for ${workflow.workflow.name}`}
                          >
                            {actionState?.action === 'rerunning' ? (
                              <>⏳ Rerunning...</>
                            ) : (
                              <>🔄 Rerun Failed</>
                            )}
                          </button>
                        )}

                        {/* Always show view button - prefer run URL, fall back to workflow URL */}
                        {(workflow.url || workflow.workflowUrl) && (
                          <a
                            href={workflow.url || workflow.workflowUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="workflow-action-btn view-btn"
                          >
                            📋 View {workflow.url ? 'Run' : 'Workflow'}
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="auth-required">🔒 Sign in for actions</span>
                    )}

                    {/* Debug information - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="workflow-debug" style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.5rem' }}>
                        Auth: {isAuthenticated ? '✅' : '❌'} | 
                        Status: {workflow.status} | 
                        Conclusion: {workflow.conclusion || 'N/A'} | 
                        RunId: {workflow.runId || 'N/A'} | 
                        LastRunId: {workflow.lastRunId || 'N/A'} | 
                        URL: {workflow.url ? '✅' : '❌'} | 
                        WorkflowURL: {workflow.workflowUrl ? '✅' : '❌'}
                      </div>
                    )}

                    {/* Action status messages */}
                    {actionState && (
                      <div className={`action-status ${actionState.action}`}>
                        {actionState.action === 'triggered' && '✅ '}
                        {actionState.action === 'approved' && '✅ '}
                        {actionState.action === 'rerun' && '✅ '}
                        {actionState.action === 'error' && '❌ '}
                        {actionState.message || `${actionState.action}...`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDashboard;
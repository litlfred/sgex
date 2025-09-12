import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WorkflowDashboard.css';
import { timeAgo, formatTimestamp } from '../utils/timeUtils';

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
  canManagePR = false, // For draft/ready status changes
  canReviewPR = false,
  isMergingPR = false,
  isApprovingPR = false,
  isRequestingChanges = false,
  isMarkingReadyForReview = false,
  approvalStatus = null,
  approvalMessage = '',
  newComment = '',
  onMergePR = null,
  onApprovePR = null,
  onRequestChanges = null,
  onMarkReadyForReview = null
}) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionStates, setActionStates] = useState({}); // Track individual action states
  const [expandedWorkflows, setExpandedWorkflows] = useState({}); // Track expanded workflow details
  const [workflowJobs, setWorkflowJobs] = useState({}); // Cache for workflow jobs
  const [loadingJobs, setLoadingJobs] = useState({}); // Track job loading states
  const refreshIntervalRef = useRef(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fetch all workflows for the branch
  const fetchWorkflows = useCallback(async (isRefresh = false) => {
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
  }, [branchName, githubActionsService, onWorkflowAction]);

  // Setup auto-refresh
  const setupAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Refresh every 30 seconds for active monitoring with visual feedback
    refreshIntervalRef.current = setInterval(() => {
      fetchWorkflows(true);
    }, 30000);
  }, [fetchWorkflows]);

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
  }, [branchName, githubActionsService, fetchWorkflows, setupAutoRefresh]);

  // Handle workflow trigger
  const handleTriggerWorkflow = async (workflow) => {
    if (!isAuthenticated || !githubActionsService) return;
    
    const workflowId = workflow.workflow.id;
    setActionStates(prev => ({ ...prev, [workflowId]: { action: 'triggering' } }));

    let success = false;
    try {
      console.debug(`Triggering workflow: ${workflow.workflow.name} for branch: ${branchName}`);
      success = await githubActionsService.triggerWorkflow(branchName);
      
      if (success) {
        setActionStates(prev => ({ ...prev, [workflowId]: { 
          action: 'triggered', 
          message: `✅ Workflow "${workflow.workflow.name}" has been triggered successfully! Check the workflow status above for progress.`,
          persistent: true
        } }));
        
        // Refresh workflows after a short delay to show updated status
        setTimeout(() => {
          fetchWorkflows(true);
        }, 3000);

        // Call callback
        if (onWorkflowAction) {
          onWorkflowAction({ type: 'workflow_triggered', workflow, success: true });
        }
      } else {
        setActionStates(prev => ({ ...prev, [workflowId]: { 
          action: 'error', 
          message: `❌ Failed to trigger workflow "${workflow.workflow.name}". Please check your permissions and try again.`,
          persistent: true
        } }));
      }
    } catch (error) {
      console.error('Error triggering workflow:', error);
      setActionStates(prev => ({ ...prev, [workflowId]: { 
        action: 'error', 
        message: `❌ Error triggering workflow "${workflow.workflow.name}": ${error.message}`,
        persistent: true
      } }));
    }

    // Clear action state after 15 seconds for success messages, 8 seconds for errors
    setTimeout(() => {
      setActionStates(prev => {
        const newState = { ...prev };
        if (newState[workflowId]) {
          delete newState[workflowId];
        }
        return newState;
      });
    }, success ? 15000 : 8000);
  };

  // Handle workflow rerun
  const handleRerunWorkflow = async (workflow) => {
    const runId = workflow.runId || workflow.lastRunId;
    if (!isAuthenticated || !runId || !githubActionsService) return;
    
    const workflowId = workflow.workflow.id;
    setActionStates(prev => ({ ...prev, [workflowId]: { action: 'rerunning' } }));

    let success = false;
    try {
      console.debug(`Rerunning failed workflow run: ${runId} for workflow: ${workflow.workflow.name}`);
      success = await githubActionsService.rerunFailedWorkflow(runId);
      
      if (success) {
        setActionStates(prev => ({ ...prev, [workflowId]: { 
          action: 'rerun', 
          message: `✅ Workflow "${workflow.workflow.name}" failed jobs have been restarted! Monitor the status above for progress.`,
          persistent: true
        } }));
        
        // Refresh workflows after a short delay
        setTimeout(() => {
          fetchWorkflows(true);
        }, 3000);

        // Call callback
        if (onWorkflowAction) {
          onWorkflowAction({ type: 'workflow_rerun', workflow, success: true });
        }
      } else {
        setActionStates(prev => ({ ...prev, [workflowId]: { 
          action: 'error', 
          message: `❌ Failed to rerun workflow "${workflow.workflow.name}". Please check your permissions and try again.`,
          persistent: true
        } }));
      }
    } catch (error) {
      console.error('Error rerunning workflow:', error);
      setActionStates(prev => ({ ...prev, [workflowId]: { 
        action: 'error', 
        message: `❌ Error rerunning workflow "${workflow.workflow.name}": ${error.message}`,
        persistent: true
      } }));
    }

    // Clear action state after 15 seconds for success messages, 8 seconds for errors
    setTimeout(() => {
      setActionStates(prev => {
        const newState = { ...prev };
        if (newState[workflowId]) {
          delete newState[workflowId];
        }
        return newState;
      });
    }, success ? 15000 : 8000);
  };

  // Handle workflow approval  
  const handleApproveWorkflow = async (workflow) => {
    const runId = workflow.runId || workflow.lastRunId;
    if (!isAuthenticated || !runId || !githubActionsService) return;
    
    const workflowId = workflow.workflow.id;
    setActionStates(prev => ({ ...prev, [workflowId]: { action: 'approving' } }));

    let success = false;
    try {
      console.debug(`Approving workflow run: ${runId} for workflow: ${workflow.workflow.name}`);
      success = await githubActionsService.approveWorkflowRun(runId);
      
      if (success) {
        setActionStates(prev => ({ ...prev, [workflowId]: { 
          action: 'approved', 
          message: `✅ Workflow "${workflow.workflow.name}" has been approved! Monitoring progress...`,
          persistent: true
        } }));
        
        // Immediate refresh to show the workflow starting
        console.debug(`Immediately refreshing workflows after approval of ${workflow.workflow.name}`);
        fetchWorkflows(true);
        
        // Setup aggressive monitoring for the next 2 minutes after approval
        let refreshCount = 0;
        const maxRefreshes = 12; // 12 refreshes over 2 minutes
        const approvedWorkflowMonitor = setInterval(() => {
          refreshCount++;
          console.debug(`Aggressive monitoring refresh ${refreshCount}/${maxRefreshes} for approved workflow: ${workflow.workflow.name}`);
          fetchWorkflows(true);
          
          if (refreshCount >= maxRefreshes) {
            clearInterval(approvedWorkflowMonitor);
            console.debug(`Stopping aggressive monitoring for approved workflow: ${workflow.workflow.name}`);
          }
        }, 10000); // Every 10 seconds for 2 minutes

        // Call callback
        if (onWorkflowAction) {
          onWorkflowAction({ type: 'workflow_approved', workflow, success: true });
        }
      } else {
        setActionStates(prev => ({ ...prev, [workflowId]: { 
          action: 'error', 
          message: `❌ Failed to approve workflow "${workflow.workflow.name}". Please check your permissions and try again.`,
          persistent: true
        } }));
      }
    } catch (error) {
      console.error('Error approving workflow:', error);
      setActionStates(prev => ({ ...prev, [workflowId]: { 
        action: 'error', 
        message: `❌ Error approving workflow "${workflow.workflow.name}": ${error.message}`,
        persistent: true
      } }));
    }

    // Clear action state after 15 seconds for success messages, 8 seconds for errors  
    setTimeout(() => {
      setActionStates(prev => {
        const newState = { ...prev };
        if (newState[workflowId]) {
          delete newState[workflowId];
        }
        return newState;
      });
    }, success ? 15000 : 8000);
  };

  // Manual refresh
  const handleManualRefresh = () => {
    fetchWorkflows(true);
  };

  // Toggle workflow expansion to show job details
  const toggleWorkflowExpansion = async (workflow) => {
    const workflowId = workflow.workflow.id;
    const runId = workflow.runId || workflow.lastRunId;
    
    // If already expanded, just collapse it
    if (expandedWorkflows[workflowId]) {
      setExpandedWorkflows(prev => ({
        ...prev,
        [workflowId]: false
      }));
      return;
    }

    // If not expanded and we have a run ID, fetch jobs
    if (runId && githubActionsService) {
      setLoadingJobs(prev => ({ ...prev, [workflowId]: true }));
      
      try {
        const jobs = await githubActionsService.getWorkflowRunJobs(runId);
        
        if (jobs) {
          setWorkflowJobs(prev => ({
            ...prev,
            [runId]: jobs
          }));
          console.debug(`Fetched ${jobs.length} jobs for workflow ${workflow.workflow.name}`);
        }
      } catch (error) {
        console.error(`Error fetching jobs for workflow ${workflow.workflow.name}:`, error);
      } finally {
        setLoadingJobs(prev => ({ ...prev, [workflowId]: false }));
      }
    }

    // Expand the workflow
    setExpandedWorkflows(prev => ({
      ...prev,
      [workflowId]: true
    }));
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

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
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
    } else if (name.includes('code quality') || path.includes('code-quality')) {
      return 'Code quality checks, security audit, and compliance validation';
    } else if (name.includes('pr review') || path.includes('review')) {
      return 'Pull request review and automated deployment';
    } else if (name.includes('pr commit feedback') || path.includes('pr-commit-feedback')) {
      return 'Pull request deployment status and feedback';
    } else if (name.includes('pr workflow failure') || path.includes('pr-workflow-failure')) {
      return 'Pull request workflow failure notifications';
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
              {refreshing && <span className="refresh-indicator"> • Checking for updates...</span>}
            </span>
          )}
          <button 
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            title="Refresh workflow status (auto-refreshes every 30 seconds)"
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
              {prInfo[0].draft ? (
                <>PR #{prInfo[0].number} is in draft mode</>
              ) : (
                <>PR #{prInfo[0].number} is ready for actions</>
              )}
            </span>
          </div>
          <div className="pr-actions-container">
            <div className="pr-actions-buttons">
              {/* Ready for Review Button - only for draft PRs */}
              {isAuthenticated && prInfo[0].draft && canManagePR && (
                <button
                  onClick={() => onMarkReadyForReview && onMarkReadyForReview('litlfred', 'sgex', prInfo[0].number)}
                  disabled={isMarkingReadyForReview}
                  className="pr-ready-review-btn"
                  title={`Mark PR #${prInfo[0].number} as ready for review`}
                >
                  {isMarkingReadyForReview ? (
                    <>⏳ Marking ready...</>
                  ) : (
                    <>✅ Ready for review</>
                  )}
                </button>
              )}
              
              {isAuthenticated && canMergePR && !prInfo[0].draft && (
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
              {isAuthenticated && !canMergePR && !canReviewPR && !canManagePR && (
                <span className="pr-actions-note">
                  ⚠️ You don't have permission to merge or review this PR
                </span>
              )}
              {isAuthenticated && !canMergePR && canReviewPR && !canManagePR && (
                <span className="pr-actions-note">
                  ℹ️ You can review this PR but cannot merge it
                </span>
              )}
              {isAuthenticated && !canMergePR && canReviewPR && canManagePR && (
                <span className="pr-actions-note">
                  ℹ️ You can review and manage this PR but cannot merge it
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
              const workflowId = workflow.workflow.id;
              const runId = workflow.runId || workflow.lastRunId;
              const isExpanded = expandedWorkflows[workflowId];
              const isLoadingJobs = loadingJobs[workflowId];
              const jobs = runId ? workflowJobs[runId] : null;
              
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
                          className={`status-badge ${workflow.badgeClass} ${refreshing ? 'refreshing-badge' : ''}`}
                        >
                          <span className="status-icon">{workflow.icon}</span>
                          <span className="status-text">{workflow.displayStatus}</span>
                        </a>
                      ) : (
                        <span className={`status-badge ${workflow.badgeClass} ${refreshing ? 'refreshing-badge' : ''}`}>
                          <span className="status-icon">{workflow.icon}</span>
                          <span className="status-text">{workflow.displayStatus}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="workflow-details">
                    {workflow.createdAt && (
                      <span className="workflow-timestamp" title={formatTimestamp(workflow.createdAt).full}>
                        Last run: {timeAgo(workflow.createdAt)} ({formatDate(workflow.createdAt)})
                      </span>
                    )}
                    {(workflow.runId || workflow.lastRunId) && (
                      <span className="workflow-run-id">
                        Run ID: {workflow.runId || workflow.lastRunId}
                      </span>
                    )}
                    {/* Job expansion toggle */}
                    {runId && (
                      <button
                        onClick={() => toggleWorkflowExpansion(workflow)}
                        className="job-expansion-toggle"
                        disabled={isLoadingJobs}
                      >
                        {isLoadingJobs ? (
                          <>⏳ Loading jobs...</>
                        ) : isExpanded ? (
                          <>🔽 Hide jobs</>
                        ) : (
                          <>🔼 Show jobs</>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expandable job details section */}
                  {isExpanded && runId && (
                    <div className="workflow-jobs-section">
                      {isLoadingJobs ? (
                        <div className="jobs-loading">
                          <div className="loading-spinner"></div>
                          <span>Loading job details...</span>
                        </div>
                      ) : jobs && jobs.length > 0 ? (
                        <div className="jobs-list">
                          <div className="jobs-header">
                            <h5>Jobs for this run:</h5>
                          </div>
                          {jobs.map((job) => (
                            <div key={job.id} className="job-card">
                              <div className="job-header">
                                <div className="job-info">
                                  <div className="job-name">
                                    {job.url ? (
                                      <a 
                                        href={job.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="job-link"
                                      >
                                        {job.name}
                                      </a>
                                    ) : (
                                      <span>{job.name}</span>
                                    )}
                                  </div>
                                  <div className="job-details">
                                    {job.runnerName && (
                                      <span className="job-runner">Runner: {job.runnerName}</span>
                                    )}
                                    {job.duration && (
                                      <span className="job-duration">Duration: {formatDuration(job.duration)}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="job-status">
                                  <span className={`status-badge ${job.badgeClass}`}>
                                    <span className="status-icon">{job.icon}</span>
                                    <span className="status-text">{job.displayStatus}</span>
                                  </span>
                                </div>
                              </div>
                              
                              {/* Job steps - only show if there are steps */}
                              {job.steps && job.steps.length > 0 && (
                                <div className="job-steps">
                                  <details className="job-steps-details">
                                    <summary className="job-steps-summary">
                                      {job.steps.length} step{job.steps.length !== 1 ? 's' : ''}
                                    </summary>
                                    <div className="job-steps-list">
                                      {job.steps.map((step, stepIndex) => (
                                        <div key={stepIndex} className="job-step">
                                          <div className="step-info">
                                            <span className="step-number">{step.number}.</span>
                                            <span className="step-name">{step.name}</span>
                                          </div>
                                          <div className="step-status">
                                            <span className={`step-badge ${step.badgeClass}`}>
                                              <span className="step-icon">{step.icon}</span>
                                              <span className="step-text">{step.displayStatus}</span>
                                            </span>
                                            {step.duration && (
                                              <span className="step-duration">{formatDuration(step.duration)}</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </details>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="jobs-empty">
                          <span>No job details available for this run</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons and status messages */}
                  <div className="workflow-actions">
                    <div className="workflow-action-buttons">
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

                      {/* Debug information for troubleshooting */}
                      <div className="workflow-debug" style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.5rem', fontFamily: 'monospace' }}>
                        Auth: {isAuthenticated ? '✅' : '❌'} | 
                        Status: {workflow.status} | 
                        Conclusion: {workflow.conclusion || 'N/A'} | 
                        RunId: {workflow.runId || 'N/A'} | 
                        LastRunId: {workflow.lastRunId || 'N/A'} | 
                        URL: {workflow.url ? '✅' : '❌'} | 
                        WorkflowURL: {workflow.workflowUrl ? '✅' : '❌'} |
                        Path: {workflow.workflow.path}
                      </div>
                    </div>

                    {/* Action status messages */}
                    {actionState && (
                      <div className={`action-status ${actionState.action}`}>
                        {actionState.action === 'triggered' && '🎯 '}
                        {actionState.action === 'approved' && '✅ '}
                        {actionState.action === 'rerun' && '🔄 '}
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
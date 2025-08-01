import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import './GitHubActionsIntegration.css';

const GitHubActionsIntegration = ({ repository, selectedBranch, hasWriteAccess }) => {
  const [workflows, setWorkflows] = useState([]);
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState(null);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;
  const branch = selectedBranch || repository.default_branch || 'main';

  // Load workflows and recent runs
  const loadWorkflowData = async () => {
    if (!githubService.isAuth()) {
      // In demo mode or without auth, show placeholder data
      setWorkflows([]);
      setWorkflowRuns([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load workflows
      const workflowsData = await githubService.getWorkflows(owner, repoName);
      setWorkflows(workflowsData);

      // Load recent workflow runs
      const runsData = await githubService.getWorkflowRuns(owner, repoName, {
        branch: branch,
        per_page: 5
      });
      setWorkflowRuns(runsData.workflow_runs || []);
    } catch (err) {
      console.error('Error loading workflow data:', err);
      
      // Check if it's a permission error
      if (err.status === 403 || err.message.includes('permission') || err.message.includes('forbidden')) {
        setError('Your Personal Access Token does not have permission to view GitHub Actions for this repository. Please create a new token with "Actions: Read" permission.');
      } else if (err.status === 404) {
        setError('No GitHub Actions workflows found for this repository.');
      } else {
        setError('Failed to load GitHub Actions data. Please check your internet connection and try again.');
      }
      
      setWorkflows([]);
      setWorkflowRuns([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount or branch change
  useEffect(() => {
    loadWorkflowData();
  }, [repository, selectedBranch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger workflow
  const handleTriggerWorkflow = async (workflowId) => {
    if (!hasWriteAccess || triggeringWorkflow) return;

    setTriggeringWorkflow(workflowId);

    try {
      await githubService.triggerWorkflow(owner, repoName, workflowId, branch);
      
      // Refresh workflow runs after triggering
      setTimeout(() => {
        loadWorkflowData();
      }, 2000);

      // Show success message
      alert('Workflow triggered successfully! It may take a few moments to appear in the runs list.');
    } catch (err) {
      console.error('Error triggering workflow:', err);
      alert('Failed to trigger workflow. Please check your permissions and try again.');
    } finally {
      setTriggeringWorkflow(null);
    }
  };

  // Rerun workflow
  const handleRerunWorkflow = async (runId) => {
    if (!hasWriteAccess) return;

    try {
      await githubService.rerunWorkflow(owner, repoName, runId);
      
      // Refresh workflow runs after rerunning
      setTimeout(() => {
        loadWorkflowData();
      }, 1000);

      alert('Workflow rerun initiated successfully!');
    } catch (err) {
      console.error('Error rerunning workflow:', err);
      alert('Failed to rerun workflow. Please check your permissions and try again.');
    }
  };

  // Get status icon for workflow run
  const getStatusIcon = (status, conclusion) => {
    if (status === 'in_progress' || status === 'queued') {
      return '🔄';
    }
    
    switch (conclusion) {
      case 'success':
        return '✅';
      case 'failure':
        return '❌';
      case 'cancelled':
        return '⏹️';
      case 'skipped':
        return '⏭️';
      case 'timed_out':
        return '⏰';
      default:
        return '⚪';
    }
  };

  // Get status color for workflow run
  const getStatusColor = (status, conclusion) => {
    if (status === 'in_progress' || status === 'queued') {
      return '#ffa500';
    }
    
    switch (conclusion) {
      case 'success':
        return '#28a745';
      case 'failure':
        return '#dc3545';
      case 'cancelled':
        return '#6c757d';
      case 'timed_out':
        return '#fd7e14';
      default:
        return '#6c757d';
    }
  };

  // Format duration
  const formatDuration = (startTime, endTime) => {
    if (!startTime) return 'Unknown';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s`;
    }
    return `${diffSecs}s`;
  };

  if (loading) {
    return (
      <div className="github-actions-loading">
        <span className="loading-spinner">⏳</span>
        Loading GitHub Actions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="github-actions-error">
        <span className="error-icon">⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  if (!githubService.isAuth()) {
    return (
      <div className="github-actions-placeholder">
        <div className="placeholder-content">
          <span className="placeholder-icon">⚡</span>
          <p>Sign in to GitHub to view and manage workflow runs</p>
          <a 
            href={`https://github.com/${owner}/${repoName}/actions`}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            View Actions on GitHub ↗️
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="github-actions-integration">
      <div className="actions-header">
        <a 
          href={`https://github.com/${owner}/${repoName}/actions`}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link"
        >
          View All ↗️
        </a>
      </div>

      {/* Workflows Section */}
      {workflows.length > 0 && (
        <div className="workflows-section">
          <h5>Available Workflows</h5>
          <div className="workflows-list">
            {workflows.map((workflow) => (
              <div key={workflow.filename} className="workflow-item">
                <div className="workflow-info">
                  <div className="workflow-name">{workflow.name}</div>
                  <div className="workflow-triggers">
                    {workflow.triggers.map((trigger) => (
                      <span key={trigger} className="trigger-tag">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="workflow-actions">
                  {hasWriteAccess && workflow.triggers.includes('manual') && (
                    <button
                      className="trigger-btn"
                      onClick={() => handleTriggerWorkflow(workflow.filename)}
                      disabled={triggeringWorkflow === workflow.filename}
                      title="Trigger workflow manually"
                    >
                      {triggeringWorkflow === workflow.filename ? (
                        <>
                          <span className="loading-spinner">⏳</span>
                          Triggering...
                        </>
                      ) : (
                        '▶️ Run'
                      )}
                    </button>
                  )}
                  <a
                    href={workflow.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-workflow-btn"
                    title="View workflow file"
                  >
                    📄
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Workflow Runs */}
      <div className="workflow-runs-section">
        <h5>Recent Workflow Runs</h5>
        {workflowRuns.length > 0 ? (
          <div className="workflow-runs-list">
            {workflowRuns.map((run) => (
              <div key={run.id} className="workflow-run-item">
                <div className="run-status">
                  <span 
                    className="status-icon"
                    style={{ color: getStatusColor(run.status, run.conclusion) }}
                  >
                    {getStatusIcon(run.status, run.conclusion)}
                  </span>
                </div>
                <div className="run-info">
                  <div className="run-name">{run.name}</div>
                  <div className="run-details">
                    <span className="run-branch">#{run.run_number}</span>
                    <span className="run-separator">•</span>
                    <span className="run-actor">{run.actor?.login}</span>
                    <span className="run-separator">•</span>
                    <span className="run-duration">
                      {formatDuration(run.created_at, run.updated_at)}
                    </span>
                  </div>
                </div>
                <div className="run-actions">
                  {hasWriteAccess && run.conclusion === 'failure' && (
                    <button
                      className="rerun-btn"
                      onClick={() => handleRerunWorkflow(run.id)}
                      title="Re-run workflow"
                    >
                      🔄
                    </button>
                  )}
                  <a
                    href={run.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-run-btn"
                    title="View workflow run details"
                  >
                    ↗️
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-runs">
            <p>No recent workflow runs found</p>
            <p className="help-text">
              Workflow runs will appear here when actions are triggered in your repository.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubActionsIntegration;
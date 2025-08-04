import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import CommitDiffModal from './CommitDiffModal';
import './GitHubActionsIntegration.css';

const GitHubActionsIntegration = ({ repository, selectedBranch, hasWriteAccess, profile }) => {
  const [workflows, setWorkflows] = useState([]);
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState(null);
  const [approvingRun, setApprovingRun] = useState(null);
  const [showCommitDiff, setShowCommitDiff] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState(null);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;
  const branch = selectedBranch || repository.default_branch || 'main';

  // Load workflows and recent runs
  const loadWorkflowData = async () => {
    if (!githubService.isAuth()) {
      // In demo mode or without auth, show placeholder data
      if (profile?.isDemo || repository?.owner?.login === 'demo-user') {
        setWorkflows([
          { 
            id: 'pages-build', 
            name: 'Deploy to GitHub Pages', 
            triggers: ['push', 'manual'],
            filename: 'pages.yml',
            url: `https://github.com/${owner}/${repoName}/blob/main/.github/workflows/pages.yml`
          }
        ]);
        setWorkflowRuns([
          {
            id: 123456,
            name: 'Deploy to GitHub Pages',
            status: 'completed',
            conclusion: 'success',
            html_url: `https://github.com/${owner}/${repoName}/actions/runs/123456`,
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            updated_at: new Date(Date.now() - 3500000).toISOString(),
            run_number: 42,
            actor: { login: 'demo-user' },
            head_sha: 'abc123def456',
            display_title: 'Add new feature documentation'
          },
          {
            id: 123457,
            name: 'Deploy to GitHub Pages',
            status: 'completed',
            conclusion: 'action_required',
            html_url: `https://github.com/${owner}/${repoName}/actions/runs/123457`,
            created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            updated_at: new Date(Date.now() - 7100000).toISOString(),
            run_number: 41,
            actor: { login: 'demo-user' },
            head_sha: 'def456ghi789',
            display_title: 'Update CI configuration for security'
          },
          {
            id: 123458,
            name: 'Deploy to GitHub Pages',
            status: 'completed',
            conclusion: 'failure',
            html_url: `https://github.com/${owner}/${repoName}/actions/runs/123458`,
            created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
            updated_at: new Date(Date.now() - 10700000).toISOString(),
            run_number: 40,
            actor: { login: 'demo-user' },
            head_sha: 'ghi789jkl012',
            display_title: 'Fix broken test suite'
          }
        ]);
      } else {
        setWorkflows([]);
        setWorkflowRuns([]);
      }
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
      
      // Check if this is a permissions error
      if (err.status === 403 || err.message.includes('permission') || err.message.includes('403')) {
        setError('PAT does not grant permission to view GitHub Actions. Please update your token with Actions read permissions.');
      } else {
        setError('Failed to load GitHub Actions data');
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

  // Approve workflow run
  const handleApproveWorkflow = async (runId) => {
    if (!hasWriteAccess) return;

    setApprovingRun(runId);

    try {
      await githubService.approveWorkflowRun(owner, repoName, runId);
      
      // Refresh workflow runs after approval
      setTimeout(() => {
        loadWorkflowData();
      }, 2000);

      alert('Workflow approved successfully!');
    } catch (err) {
      console.error('Error approving workflow:', err);
      alert('Failed to approve workflow. Please check your permissions and try again.');
    } finally {
      setApprovingRun(null);
    }
  };

  // Show commit diff modal
  const handleViewChanges = (run) => {
    setSelectedCommit({
      sha: run.head_sha,
      message: run.display_title || run.name
    });
    setShowCommitDiff(true);
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
      case 'action_required':
        return '⏳';
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
      case 'action_required':
        return '#6f42c1';
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

  if (!githubService.isAuth() && !(profile?.isDemo || repository?.owner?.login === 'demo-user')) {
    return (
      <div className="github-actions-placeholder">
        <div className="placeholder-content">
          <span className="placeholder-icon">⚡</span>
          <h4>GitHub Actions Integration</h4>
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
                  {hasWriteAccess && run.conclusion === 'action_required' && (
                    <button
                      className="approve-btn"
                      onClick={() => handleApproveWorkflow(run.id)}
                      disabled={approvingRun === run.id}
                      title="Approve workflow run"
                    >
                      {approvingRun === run.id ? '⏳' : '👍'}
                    </button>
                  )}
                  {hasWriteAccess && run.conclusion === 'failure' && (
                    <button
                      className="rerun-btn"
                      onClick={() => handleRerunWorkflow(run.id)}
                      title="Re-run workflow"
                    >
                      🔄
                    </button>
                  )}
                  <button
                    className="view-changes-btn"
                    onClick={() => handleViewChanges(run)}
                    title="View commit changes"
                  >
                    📋
                  </button>
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
      
      {/* Commit Diff Modal */}
      <CommitDiffModal
        isOpen={showCommitDiff}
        onClose={() => setShowCommitDiff(false)}
        owner={owner}
        repo={repoName}
        commitSha={selectedCommit?.sha}
        commitMessage={selectedCommit?.message}
      />
    </div>
  );
};

export default GitHubActionsIntegration;
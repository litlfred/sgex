import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import './DAKStatusBox.css';

const DAKStatusBox = ({ repository, selectedBranch, hasWriteAccess, profile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;
  const branch = selectedBranch || repository.default_branch || 'main';
  const isDemo = profile && profile.login === 'demo-user';

  // Load data when expanded
  useEffect(() => {
    const loadStatusData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isDemo) {
          // Provide mock data for demo mode
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

          // Mock workflows
          const mockWorkflows = [
            { id: 1, name: 'Build and Deploy IG', state: 'active' },
            { id: 2, name: 'Run Tests', state: 'active' },
            { id: 3, name: 'QA Validation', state: 'active' }
          ];

          // Mock workflow runs
          const mockWorkflowRuns = [
            {
              id: 101,
              name: 'Build and Deploy IG',
              status: 'completed',
              conclusion: 'success',
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
              html_url: `https://github.com/${owner}/${repoName}/actions/runs/101`
            },
            {
              id: 102,
              name: 'QA Validation',
              status: 'in_progress',
              conclusion: null,
              created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
              html_url: `https://github.com/${owner}/${repoName}/actions/runs/102`
            },
            {
              id: 103,
              name: 'Run Tests',
              status: 'completed',
              conclusion: 'failure',
              created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
              html_url: `https://github.com/${owner}/${repoName}/actions/runs/103`
            }
          ];

          // Mock releases
          const mockReleases = [
            {
              id: 1,
              name: 'v1.2.0',
              tag_name: 'v1.2.0',
              published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
              prerelease: false,
              html_url: `https://github.com/${owner}/${repoName}/releases/tag/v1.2.0`,
              assets: [
                {
                  name: `${repoName}-v1.2.0.zip`,
                  browser_download_url: `https://github.com/${owner}/${repoName}/releases/download/v1.2.0/${repoName}-v1.2.0.zip`
                }
              ]
            },
            {
              id: 2,
              name: 'v1.1.0',
              tag_name: 'v1.1.0',
              published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
              prerelease: false,
              html_url: `https://github.com/${owner}/${repoName}/releases/tag/v1.1.0`,
              assets: []
            },
            {
              id: 3,
              name: 'v1.1.0-beta.1',
              tag_name: 'v1.1.0-beta.1',
              published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
              prerelease: true,
              html_url: `https://github.com/${owner}/${repoName}/releases/tag/v1.1.0-beta.1`,
              assets: []
            }
          ];

          setWorkflows(mockWorkflows);
          setWorkflowRuns(mockWorkflowRuns);
          setReleases(mockReleases);
        } else {
          // Load real data from GitHub
          const [workflowsData, workflowRunsData, releasesData] = await Promise.allSettled([
            githubService.getWorkflows(owner, repoName),
            githubService.getWorkflowRuns(owner, repoName, { branch, per_page: 5 }),
            githubService.getReleases(owner, repoName, { per_page: 5 })
          ]);

          if (workflowsData.status === 'fulfilled') {
            setWorkflows(workflowsData.value);
          }

          if (workflowRunsData.status === 'fulfilled') {
            setWorkflowRuns(workflowRunsData.value.workflow_runs || []);
          }

          if (releasesData.status === 'fulfilled') {
            setReleases(releasesData.value);
          }

          // Check if any requests failed
          const failures = [workflowsData, workflowRunsData, releasesData]
            .filter(result => result.status === 'rejected');
          
          if (failures.length > 0) {
            console.warn('Some status data could not be loaded:', failures);
          }
        }
      } catch (err) {
        setError('Failed to load status information');
        console.error('Error loading status data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isExpanded && repository) {
      loadStatusData();
    }
  }, [isExpanded, repository, selectedBranch, owner, repoName, branch, isDemo]);

  const refreshStatusData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load workflows, recent workflow runs, and releases in parallel
      const [workflowsData, workflowRunsData, releasesData] = await Promise.allSettled([
        githubService.getWorkflows(owner, repoName),
        githubService.getWorkflowRuns(owner, repoName, { branch, per_page: 5 }),
        githubService.getReleases(owner, repoName, { per_page: 5 })
      ]);

      if (workflowsData.status === 'fulfilled') {
        setWorkflows(workflowsData.value);
      }

      if (workflowRunsData.status === 'fulfilled') {
        setWorkflowRuns(workflowRunsData.value.workflow_runs || []);
      }

      if (releasesData.status === 'fulfilled') {
        setReleases(releasesData.value);
      }

      // Check if any requests failed
      const failures = [workflowsData, workflowRunsData, releasesData]
        .filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        console.warn('Some status data could not be loaded:', failures);
      }
    } catch (err) {
      setError('Failed to load status information');
      console.error('Error loading status data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleWorkflowTrigger = async (workflowId, workflowName) => {
    if (!hasWriteAccess) {
      alert('You need write permissions to trigger workflows');
      return;
    }

    try {
      if (isDemo) {
        // Simulate workflow trigger in demo mode
        alert(`Workflow "${workflowName}" has been triggered successfully (Demo Mode)`);
        return;
      }

      await githubService.triggerWorkflow(owner, repoName, workflowId, branch);
      alert(`Workflow "${workflowName}" has been triggered successfully`);
      // Reload workflow runs after triggering
      setTimeout(refreshStatusData, 2000);
    } catch (err) {
      alert(`Failed to trigger workflow: ${err.message}`);
    }
  };

  const handleWorkflowRerun = async (runId, workflowName) => {
    if (!hasWriteAccess) {
      alert('You need write permissions to rerun workflows');
      return;
    }

    try {
      if (isDemo) {
        // Simulate workflow rerun in demo mode
        alert(`Workflow run for "${workflowName}" has been restarted successfully (Demo Mode)`);
        return;
      }

      await githubService.rerunWorkflow(owner, repoName, runId);
      alert(`Workflow run for "${workflowName}" has been restarted successfully`);
      // Reload workflow runs after rerunning
      setTimeout(refreshStatusData, 2000);
    } catch (err) {
      alert(`Failed to rerun workflow: ${err.message}`);
    }
  };

  const getWorkflowStatusIcon = (status, conclusion) => {
    if (status === 'in_progress' || status === 'queued') {
      return '🔄';
    }
    
    switch (conclusion) {
      case 'success': return '✅';
      case 'failure': return '❌';
      case 'cancelled': return '🚫';
      case 'skipped': return '⏭️';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateQuickLinks = () => {
    const baseUrl = `https://${owner}.github.io/${repoName}`;
    
    return {
      ciBuild: `${baseUrl}/branches/${branch}`,
      qcReport: `${baseUrl}/branches/${branch}/artifacts.html`,
      artifacts: `${baseUrl}/branches/${branch}/artifacts.html`
    };
  };

  const quickLinks = generateQuickLinks();

  return (
    <div className="dak-status-box">
      <div className="status-header" onClick={handleToggle}>
        <div className="status-title">
          <span className="status-icon">📈</span>
          <h3>DAK Status & Actions</h3>
          <span className="branch-indicator">
            {branch && <code>{branch}</code>}
          </span>
        </div>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="status-content">
          {loading ? (
            <div className="loading-indicator">
              <span className="loading-spinner">⏳</span>
              Loading status information...
            </div>
          ) : error ? (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          ) : (
            <>
              {/* Quick Links Section */}
              <div className="status-section">
                <h4>📎 Quick Links</h4>
                <div className="quick-links">
                  <a 
                    href={quickLinks.ciBuild} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="quick-link"
                  >
                    <span className="link-icon">🏗️</span>
                    CI Build
                    <span className="external-indicator">↗</span>
                  </a>
                  <a 
                    href={`https://github.com/${owner}/${repoName}/issues`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="quick-link"
                  >
                    <span className="link-icon">🐛</span>
                    Issues
                    <span className="external-indicator">↗</span>
                  </a>
                  <a 
                    href={quickLinks.qcReport} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="quick-link"
                  >
                    <span className="link-icon">✅</span>
                    QC Report
                    <span className="external-indicator">↗</span>
                  </a>
                  <a 
                    href={quickLinks.artifacts} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="quick-link"
                  >
                    <span className="link-icon">📦</span>
                    Artifacts
                    <span className="external-indicator">↗</span>
                  </a>
                </div>
              </div>

              {/* Workflows Section */}
              <div className="status-section">
                <h4>⚙️ GitHub Actions</h4>
                {workflows.length > 0 ? (
                  <div className="workflows-section">
                    <div className="available-workflows">
                      <h5>Available Workflows</h5>
                      <div className="workflow-actions">
                        {workflows.map(workflow => (
                          <div key={workflow.id} className="workflow-item">
                            <span className="workflow-name">{workflow.name}</span>
                            <button
                              className="workflow-trigger-btn"
                              onClick={() => handleWorkflowTrigger(workflow.id, workflow.name)}
                              disabled={!hasWriteAccess}
                              title={hasWriteAccess ? 'Trigger workflow' : 'Write access required'}
                            >
                              ▶️ Run
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="recent-runs">
                      <h5>Recent Workflow Runs</h5>
                      {workflowRuns.length > 0 ? (
                        <div className="workflow-runs">
                          {workflowRuns.slice(0, 5).map(run => (
                            <div key={run.id} className="workflow-run">
                              <div className="run-info">
                                <span className="run-status">
                                  {getWorkflowStatusIcon(run.status, run.conclusion)}
                                </span>
                                <span className="run-name">{run.name}</span>
                                <span className="run-date">{formatDate(run.created_at)}</span>
                              </div>
                              <div className="run-actions">
                                {hasWriteAccess && (
                                  <button
                                    className="rerun-btn"
                                    onClick={() => handleWorkflowRerun(run.id, run.name)}
                                    title="Rerun workflow"
                                  >
                                    🔄
                                  </button>
                                )}
                                <a
                                  href={run.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="view-run-btn"
                                  title="View run details"
                                >
                                  👁️
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-data">No recent workflow runs found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="no-data">No workflows found in this repository</p>
                )}
              </div>

              {/* Releases Section */}
              <div className="status-section">
                <h4>🏷️ Latest Releases</h4>
                {releases.length > 0 ? (
                  <div className="releases-list">
                    {releases.slice(0, 3).map(release => (
                      <div key={release.id} className="release-item">
                        <div className="release-info">
                          <span className="release-name">{release.name || release.tag_name}</span>
                          <span className="release-date">{formatDate(release.published_at)}</span>
                          {release.prerelease && (
                            <span className="prerelease-badge">Pre-release</span>
                          )}
                        </div>
                        <div className="release-actions">
                          <a
                            href={release.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="release-link"
                            title="View release"
                          >
                            📋 Details
                          </a>
                          {release.assets && release.assets.length > 0 && (
                            <a
                              href={release.assets[0].browser_download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="download-link"
                              title="Download package"
                            >
                              📦 Download
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No releases found</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DAKStatusBox;
import React, { useState, useEffect, useCallback } from 'react';
import dakComplianceService from '../services/dakComplianceService';
import githubService from '../services/githubService';
import CommitsSlider from './CommitsSlider';
import GitHubActionsIntegration from './GitHubActionsIntegration';
import './DAKStatusBox.css';

const DAKStatusBox = ({ repository, selectedBranch, hasWriteAccess, profile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repositoryStats, setRepositoryStats] = useState({
    recentCommits: [],
    openPullRequestsCount: 0,
    openIssuesCount: 0,
    statsLoading: false,
    statsError: null
  });

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;
  const branch = selectedBranch || repository.default_branch || 'main';

  // Load repository statistics
  const loadRepositoryStats = useCallback(async () => {
    if (!githubService.isAuth()) {
      return;
    }

    setRepositoryStats(prev => ({ ...prev, statsLoading: true, statsError: null }));

    try {
      const stats = await githubService.getRepositoryStats(owner, repoName, branch);
      setRepositoryStats({
        recentCommits: stats.recentCommits,
        openPullRequestsCount: stats.openPullRequestsCount,
        openIssuesCount: stats.openIssuesCount,
        statsLoading: false,
        statsError: null
      });
    } catch (err) {
      console.error('Error loading repository stats:', err);
      setRepositoryStats(prev => ({
        ...prev,
        statsLoading: false,
        statsError: 'Failed to load repository statistics'
      }));
    }
  }, [owner, repoName, branch]);

  // Initialize component
  useEffect(() => {
    if (repository && selectedBranch) {
      loadRepositoryStats();
    }
  }, [repository, selectedBranch, loadRepositoryStats]);

  // Handle toggle expansion
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle save button click
  const handleSave = () => {
    setShowSaveDialog(true);
  };

  // Handle successful save
  const handleSaveSuccess = (result) => {
    setShowSaveDialog(false);
    
    // Clear staging ground after successful save
    stagingGroundService.clearStagingGround();
    
    // Show success message
    alert(`Changes saved successfully! Commit: ${result.sha.substring(0, 7)}`);
  };

  // Handle clearing staging ground
  const handleClearChanges = () => {
    if (window.confirm('Are you sure you want to discard all changes? This cannot be undone.')) {
      stagingGroundService.clearStagingGround();
    }
  };

  // Handle removing individual file
  const handleRemoveFile = (filePath) => {
    if (window.confirm(`Are you sure you want to remove "${filePath}" from staging? This cannot be undone.`)) {
      stagingGroundService.removeFile(filePath);
    }
  };

  // Get validation summary for display
  const getValidationSummary = () => {
    if (!validation) {
      return { error: 0, warning: 0, info: 0, canSave: true };
    }
    return dakComplianceService.getValidationSummary(validation);
  };

  // Format file list for display
  const formatFileList = () => {
    if (!stagingGround || !stagingGround.files) return [];
    
    return stagingGround.files.map(file => ({
      path: file.path,
      size: new Blob([file.content]).size,
      lastModified: file.timestamp
    }));
  };

  // Format the last commit for display
  const formatLastCommit = () => {
    if (!repositoryStats.recentCommits || repositoryStats.recentCommits.length === 0) {
      return null;
    }
    
    const lastCommit = repositoryStats.recentCommits[0];
    const commitDate = new Date(lastCommit.author.date);
    const shortSha = lastCommit.sha.substring(0, 7);
    const shortMessage = lastCommit.message.split('\n')[0].substring(0, 60);
    const displayMessage = lastCommit.message.split('\n')[0].length > 60 ? shortMessage + '...' : shortMessage;
    
    return {
      sha: shortSha,
      message: displayMessage,
      author: lastCommit.author.name,
      date: commitDate.toLocaleDateString(),
      time: commitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      url: lastCommit.html_url
    };
  };

  const validationSummary = getValidationSummary();
  const hasChanges = stagingGround && stagingGround.files.length > 0;
  const filesCount = stagingGround ? stagingGround.files.length : 0;

  return (
    <div className="dak-status-box">
      <div className="status-header" onClick={handleToggle}>
        <div className="status-title">
          <span className="status-icon">📊</span>
          <h3>Repository Status</h3>
          <span className="branch-indicator">
            {branch && <code>{branch}</code>}
          </span>
        </div>
        <div className="status-indicators">
          {/* Validation stoplight */}
          <div className="validation-stoplight">
            <div className={`stoplight-indicator error ${validationSummary.error === 0 ? 'lit' : ''}`}>
              🔴
              {validationSummary.error > 0 && (
                <span className="indicator-badge">{validationSummary.error}</span>
              )}
            </div>
            <div className={`stoplight-indicator warning ${validationSummary.warning === 0 ? 'lit' : ''}`}>
              🟡
              {validationSummary.warning > 0 && (
                <span className="indicator-badge">{validationSummary.warning}</span>
              )}
            </div>
            <div className={`stoplight-indicator info ${validationSummary.info === 0 ? 'lit' : ''}`}>
              🟢
              {validationSummary.info > 0 && (
                <span className="indicator-badge">{validationSummary.info}</span>
              )}
            </div>
          </div>
          
          {/* Save button */}
          <button
            className={`save-btn ${!hasChanges || !validationSummary.canSave ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={!hasChanges || !hasWriteAccess}
            title={
              !hasChanges ? 'No changes to save' :
              !hasWriteAccess ? 'Write access required' :
              !validationSummary.canSave ? 'Fix validation errors first' :
              'Save changes to repository'
            }
          >
            💾 Save
          </button>
          
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="status-content">
          {loading ? (
            <div className="loading-indicator">
              <span className="loading-spinner">⏳</span>
              Loading staging ground...
            </div>
          ) : error ? (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          ) : (
            <>
              {/* Changed Files Section */}
              <div className="status-section">
                <h4>📁 Changed Files</h4>
                {hasChanges ? (
                  <div className="changed-files">
                    {formatFileList().map((file, index) => (
                      <div key={index} className="file-item">
                        <div className="file-info">
                          <span className="file-icon">📄</span>
                          <span className="file-path">{file.path}</span>
                        </div>
                        <div className="file-meta">
                          <span className="file-size">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                          <span className="file-time">
                            {new Date(file.lastModified).toLocaleTimeString()}
                          </span>
                          <button
                            className="remove-file-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(file.path);
                            }}
                            title={`Remove ${file.path} from staging`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="file-actions">
                      <button
                        className="action-btn secondary small"
                        onClick={handleClearChanges}
                      >
                        🗑️ Clear All
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-changes">
                    <p>No changes in staging ground</p>
                    <p className="help-text">
                      Changes made through DAK component editors will appear here before being saved to the repository.
                    </p>
                  </div>
                )}
              </div>

              {/* Validation Results Section */}
              {validation && hasChanges && (
                <div className="status-section">
                  <h4>🚦 Validation Results</h4>
                  <div className="validation-summary-detailed">
                    <div className="validation-counts">
                      <div className={`count-item error ${validationSummary.error === 0 ? 'clean' : 'has-issues'}`}>
                        <span className="count-icon">🔴</span>
                        <span className="count-number">{validationSummary.error}</span>
                        <span className="count-label">Errors</span>
                      </div>
                      <div className={`count-item warning ${validationSummary.warning === 0 ? 'clean' : 'has-issues'}`}>
                        <span className="count-icon">🟡</span>
                        <span className="count-number">{validationSummary.warning}</span>
                        <span className="count-label">Warnings</span>
                      </div>
                      <div className={`count-item info ${validationSummary.info === 0 ? 'clean' : 'has-issues'}`}>
                        <span className="count-icon">🟢</span>
                        <span className="count-number">{validationSummary.info}</span>
                        <span className="count-label">Info</span>
                      </div>
                    </div>
                    
                    {!validationSummary.canSave && (
                      <div className="validation-blocking">
                        <span className="blocking-icon">🚫</span>
                        <span className="blocking-text">
                          Cannot save due to validation errors. Fix errors or enable override in save dialog.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Commit Message Preview */}
              {hasChanges && stagingGround.message && (
                <div className="status-section">
                  <h4>✍️ Commit Message</h4>
                  <div className="commit-preview">
                    <p>{stagingGround.message}</p>
                  </div>
                </div>
              )}

              {/* Commits Section */}
              <div className="status-section">
                <CommitsSlider 
                  repository={repository}
                  selectedBranch={selectedBranch}
                />
              </div>

              {/* GitHub Actions Integration */}
              <div className="status-section">
                <GitHubActionsIntegration
                  repository={repository}
                  selectedBranch={selectedBranch}
                  hasWriteAccess={hasWriteAccess}
                />
              </div>

              {/* Quick Actions */}
              <div className="status-section">
                <h4>⚡ Quick Actions</h4>
                <div className="quick-actions">
                  <div className="quick-action-group">
                    <a 
                      href={`https://github.com/${owner}/${repoName}/commits/${branch}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="quick-link"
                    >
                      <span className="link-icon">📈</span>
                      Recent Commits
                      <span className="external-indicator">↗</span>
                    </a>
                    {/* Last commit display */}
                    {(() => {
                      const lastCommit = formatLastCommit();
                      return lastCommit ? (
                        <div className="last-commit">
                          <a 
                            href={lastCommit.url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="commit-link"
                          >
                            <span className="commit-sha">{lastCommit.sha}</span>
                            <span className="commit-message">{lastCommit.message}</span>
                            <span className="commit-meta">
                              by {lastCommit.author} on {lastCommit.date} at {lastCommit.time}
                            </span>
                          </a>
                        </div>
                      ) : repositoryStats.statsLoading ? (
                        <div className="last-commit loading">
                          <span className="loading-spinner">⏳</span>
                          Loading recent commits...
                        </div>
                      ) : null;
                    })()}
                  </div>
                  
                  <a 
                    href={`https://github.com/${owner}/${repoName}/pulls`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="quick-link"
                  >
                    <span className="link-icon">🔄</span>
                    Pull Requests
                    {repositoryStats.openPullRequestsCount > 0 && !repositoryStats.statsLoading && (
                      <span className="notification-badge pr-badge">
                        {repositoryStats.openPullRequestsCount}
                      </span>
                    )}
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
                    {repositoryStats.openIssuesCount > 0 && !repositoryStats.statsLoading && (
                      <span className="notification-badge issue-badge">
                        {repositoryStats.openIssuesCount}
                      </span>
                    )}
                    <span className="external-indicator">↗</span>
                  </a>
                  
                  <a 
                    href={`https://github.com/${owner}/${repoName}/actions`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="quick-link"
                  >
                    <span className="link-icon">⚡</span>
                    GitHub Actions
                    <span className="external-indicator">↗</span>
                  </a>
                </div>
                
                {repositoryStats.statsError && (
                  <div className="stats-error">
                    <span className="error-icon">⚠️</span>
                    {repositoryStats.statsError}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Save Dialog */}
      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        stagingGround={stagingGround}
        validation={validation}
        repository={repository}
        selectedBranch={selectedBranch}
        hasWriteAccess={hasWriteAccess}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default DAKStatusBox;
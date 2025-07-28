import React, { useState, useEffect, useCallback } from 'react';
import stagingGroundService from '../services/stagingGroundService';
import dakComplianceService from '../services/dakComplianceService';
import SaveDialog from './SaveDialog';
import CommitsSlider from './CommitsSlider';
import GitHubActionsIntegration from './GitHubActionsIntegration';
import './DAKStatusBox.css';

const DAKStatusBox = ({ repository, selectedBranch, hasWriteAccess, profile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stagingGround, setStagingGround] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;
  const branch = selectedBranch || repository.default_branch || 'main';

  // Load staging ground data
  const loadStagingGroundData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentStagingGround = stagingGroundService.getStagingGround();
      setStagingGround(currentStagingGround);
      
      if (currentStagingGround.files.length > 0) {
        await validateStagingGround(currentStagingGround);
      }
    } catch (err) {
      setError('Failed to load staging ground data');
      console.error('Error loading staging ground:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize staging ground service
  useEffect(() => {
    if (repository && selectedBranch) {
      stagingGroundService.initialize(repository, selectedBranch);
      loadStagingGroundData();

      // Subscribe to staging ground changes
      const unsubscribe = stagingGroundService.addListener((updatedStagingGround) => {
        setStagingGround(updatedStagingGround);
        validateStagingGround(updatedStagingGround);
      });

      return unsubscribe;
    }
  }, [repository, selectedBranch, loadStagingGroundData]);

  // Validate staging ground
  const validateStagingGround = async (stagingGroundData) => {
    if (!stagingGroundData || stagingGroundData.files.length === 0) {
      setValidation(null);
      return;
    }

    try {
      const validationResult = await dakComplianceService.validateStagingGround(stagingGroundData);
      setValidation(validationResult);
    } catch (err) {
      console.error('Error validating staging ground:', err);
      setValidation(null);
    }
  };

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

  const validationSummary = getValidationSummary();
  const hasChanges = stagingGround && stagingGround.files.length > 0;
  const filesCount = stagingGround ? stagingGround.files.length : 0;

  return (
    <div className="dak-status-box">
      <div className="status-header" onClick={handleToggle}>
        <div className="status-title">
          <span className="status-icon">📊</span>
          <h3>Staging Ground</h3>
          {hasChanges && (
            <span className="files-badge">
              {filesCount} file{filesCount !== 1 ? 's' : ''}
            </span>
          )}
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
                  <a 
                    href={`https://github.com/${owner}/${repoName}/pulls`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="quick-link"
                  >
                    <span className="link-icon">🔄</span>
                    Pull Requests
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
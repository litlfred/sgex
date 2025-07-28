import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import dakComplianceService from '../services/dakComplianceService';
import stagingGroundService from '../services/stagingGroundService';
import './SaveDialog.css';

const SaveDialog = ({ 
  isOpen, 
  onClose, 
  stagingGround, 
  validation, 
  repository, 
  selectedBranch,
  hasWriteAccess,
  onSaveSuccess 
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [overrideValidation, setOverrideValidation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCommitMessage(stagingGround?.message || '');
      setOverrideValidation(false);
      setIsSaving(false);
      setError(null);
      setShowValidationDetails(false);
    }
  }, [isOpen, stagingGround]);

  if (!isOpen) return null;

  const validationSummary = validation ? dakComplianceService.getValidationSummary(validation) : null;
  const canSave = validationSummary ? (validationSummary.canSave || overrideValidation) : true;
  const hasErrors = validationSummary ? validationSummary.error > 0 : false;

  const handleSave = async () => {
    if (!commitMessage.trim()) {
      setError('Commit message is required');
      return;
    }

    if (!hasWriteAccess) {
      setError('You need write permissions to save changes');
      return;
    }

    if (hasErrors && !overrideValidation) {
      setError('Cannot save with validation errors. Enable override option to proceed anyway.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      
      if (repository.isDemo || (repository.owner && repository.owner.login === 'demo-user')) {
        // Simulate save in demo mode
        await new Promise(resolve => setTimeout(resolve, 2000));
        onSaveSuccess({
          sha: 'demo-commit-sha',
          message: commitMessage,
          url: `https://github.com/${repository.full_name}/commit/demo-commit-sha`
        });
        return;
      }

      // Create commit with multiple files
      const result = await githubService.createCommit(
        owner,
        repository.name,
        selectedBranch,
        commitMessage.trim(),
        stagingGround.files
      );

      onSaveSuccess({
        sha: result.sha,
        message: commitMessage,
        url: result.html_url
      });

    } catch (err) {
      console.error('Error saving changes:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.status === 409) {
      return 'Conflict detected. The branch has been updated since you started. Please refresh and try again.';
    } else if (error.status === 403) {
      return 'Permission denied. Check that your token has write access to this repository.';
    } else if (error.status === 404) {
      return 'Repository or branch not found. Please verify the repository exists and you have access.';
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred while saving. Please try again.';
    }
  };

  const formatValidationIcon = (level) => {
    switch (level) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🟢';
      default: return '❓';
    }
  };

  // Handle removing individual file
  const handleRemoveFile = (filePath) => {
    if (window.confirm(`Are you sure you want to remove "${filePath}" from staging? This cannot be undone.`)) {
      stagingGroundService.removeFile(filePath);
    }
  };

  return (
    <div className="save-dialog-overlay">
      <div className="save-dialog">
        <div className="dialog-header">
          <h3>💾 Save Changes</h3>
          <button 
            className="dialog-close"
            onClick={onClose}
            disabled={isSaving}
          >
            ×
          </button>
        </div>

        <div className="dialog-content">
          {/* Files Summary */}
          <div className="save-summary">
            <h4>Files to be committed ({stagingGround?.files?.length || 0}):</h4>
            <div className="files-list">
              {stagingGround?.files?.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-icon">📄</span>
                  <span className="file-path">{file.path}</span>
                  <span className="file-size">
                    {(new Blob([file.content]).size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    className="remove-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.path);
                    }}
                    title={`Remove ${file.path} from staging`}
                    disabled={isSaving}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Status */}
          {validationSummary && (
            <div className="validation-section">
              <div 
                className={`validation-summary ${validationSummary.hasIssues ? 'has-issues' : 'clean'}`}
                onClick={() => setShowValidationDetails(!showValidationDetails)}
              >
                <div className="validation-header">
                  <h4>🚦 Validation Status</h4>
                  <div className="validation-badges">
                    {validationSummary.error > 0 && (
                      <span className="validation-badge error">
                        🔴 {validationSummary.error}
                      </span>
                    )}
                    {validationSummary.warning > 0 && (
                      <span className="validation-badge warning">
                        🟡 {validationSummary.warning}
                      </span>
                    )}
                    {validationSummary.info > 0 && (
                      <span className="validation-badge info">
                        🟢 {validationSummary.info}
                      </span>
                    )}
                    {!validationSummary.hasIssues && (
                      <span className="validation-badge success">
                        ✅ All clear
                      </span>
                    )}
                  </div>
                  <span className={`expand-icon ${showValidationDetails ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {showValidationDetails && validation && (
                <div className="validation-details">
                  {Object.entries(validation.files).map(([filePath, results]) => (
                    results.length > 0 && (
                      <div key={filePath} className="file-validation">
                        <h5>📄 {filePath}</h5>
                        <div className="validation-issues">
                          {results.map((result, index) => (
                            <div key={index} className={`validation-issue ${result.level}`}>
                              <span className="issue-icon">{formatValidationIcon(result.level)}</span>
                              <div className="issue-content">
                                <div className="issue-message">{result.message}</div>
                                {result.suggestion && (
                                  <div className="issue-suggestion">💡 {result.suggestion}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Override option for errors */}
              {hasErrors && (
                <div className="override-section">
                  <label className="override-checkbox">
                    <input
                      type="checkbox"
                      checked={overrideValidation}
                      onChange={(e) => setOverrideValidation(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Override validation errors and save anyway
                  </label>
                  <p className="override-warning">
                    ⚠️ Saving with validation errors may cause issues with your DAK.
                    Only enable this if you're sure about your changes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Commit Message */}
          <div className="commit-message-section">
            <label htmlFor="commit-message">
              <h4>✍️ Commit Message</h4>
            </label>
            <textarea
              id="commit-message"
              className="commit-message-input"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe your changes..."
              rows={3}
              disabled={isSaving}
              required
            />
            <div className="commit-tips">
              <p>💡 <strong>Tip:</strong> Write a clear, descriptive message about what you changed and why.</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-section">
              <div className="error-message">
                <span className="error-icon">❌</span>
                {error}
              </div>
            </div>
          )}

          {/* Repository Info */}
          <div className="repo-info">
            <div className="info-item">
              <span className="info-label">Repository:</span>
              <span className="info-value">{repository?.full_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Branch:</span>
              <span className="info-value">{selectedBranch}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Access:</span>
              <span className={`info-value ${hasWriteAccess ? 'write' : 'read'}`}>
                {hasWriteAccess ? '✏️ Write' : '👁️ Read-only'}
              </span>
            </div>
          </div>
        </div>

        <div className="dialog-actions">
          <button
            className="action-btn secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="action-btn primary"
            onClick={handleSave}
            disabled={!canSave || !commitMessage.trim() || isSaving || !hasWriteAccess}
          >
            {isSaving ? (
              <>
                <span className="saving-spinner">⏳</span>
                Saving...
              </>
            ) : (
              <>💾 Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
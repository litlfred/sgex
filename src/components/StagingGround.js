import React, { useState, useEffect, useCallback } from 'react';
import stagingGroundService from '../services/stagingGroundService';
import dakComplianceService from '../services/dakComplianceService';
import SaveDialog from './SaveDialog';
import './StagingGround.css';

const StagingGround = ({ repository, selectedBranch, hasWriteAccess, profile }) => {
  const [stagingGround, setStagingGround] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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

  // Handle saving changes
  const handleSave = () => {
    if (!hasWriteAccess) {
      alert('You need write permissions to save changes to this repository.');
      return;
    }
    
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

  const validationSummary = getValidationSummary();
  const hasChanges = stagingGround && stagingGround.files.length > 0;
  const filesCount = stagingGround ? stagingGround.files.length : 0;

  return (
    <div className="staging-ground-section">
      <div className="section-header">
        <h3 className="section-title">
          <span className="section-icon">📝</span>
          Staging Ground
          {hasChanges && (
            <span className="files-badge">
              {filesCount} file{filesCount !== 1 ? 's' : ''}
            </span>
          )}
        </h3>
        <p className="section-description">
          Changes made through DAK component editors are staged here before being committed to the repository.
          Review and commit your changes when ready.
        </p>
      </div>

      <div className="staging-content">
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
            {/* Staging Status Bar */}
            <div className="staging-status-bar">
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
                💾 Save Changes
              </button>
            </div>

            {/* Changed Files Section */}
            <div className="staging-files-section">
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
                      🗑️ Clear All Changes
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

            {/* Commit Message Preview */}
            {hasChanges && stagingGround.message && (
              <div className="commit-message-section">
                <h4>✍️ Commit Message</h4>
                <div className="commit-preview">
                  <p>{stagingGround.message}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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

export default StagingGround;
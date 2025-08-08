import React from 'react';

/**
 * Container for save buttons with independent states
 * Provides consistent UI for local and GitHub save operations
 */
const SaveButtonsContainer = ({
  // States
  hasChanges = false,
  isSavingLocal = false,
  isSavingGitHub = false,
  canSaveToGitHub = false,
  localSaveSuccess = false,
  githubSaveSuccess = false,
  savedLocally = false,
  
  // Handlers
  onSaveLocal,
  onSaveGitHub,
  
  // Configuration
  isDemo = false,
  showLocalButton = true,
  showGitHubButton = true,
  buttonSize = 'medium', // 'small', 'medium', 'large'
  layout = 'horizontal' // 'horizontal', 'vertical'
}) => {
  
  // Determine button states
  const localButtonDisabled = !hasChanges || isSavingLocal || localSaveSuccess;
  const githubButtonDisabled = !hasChanges || isSavingGitHub || githubSaveSuccess || !canSaveToGitHub;
  
  // Button text based on state
  const getLocalButtonText = () => {
    if (localSaveSuccess) return 'Saved Locally ✓';
    if (isSavingLocal) return 'Saving...';
    return 'Save Local';
  };
  
  const getGitHubButtonText = () => {
    if (githubSaveSuccess) return 'Committed ✓';
    if (isSavingGitHub) return 'Committing...';
    return 'Save to GitHub';
  };

  // CSS classes
  const containerClasses = [
    'save-buttons-container',
    `layout-${layout}`,
    `size-${buttonSize}`
  ].join(' ');

  const getButtonClasses = (type, disabled, success) => {
    const classes = ['save-button', `save-button-${type}`];
    if (disabled) classes.push('disabled');
    if (success) classes.push('success');
    return classes.join(' ');
  };

  return (
    <div className={containerClasses}>
      {/* Local Save Button */}
      {showLocalButton && (
        <button
          className={getButtonClasses('local', localButtonDisabled, localSaveSuccess)}
          onClick={onSaveLocal}
          disabled={localButtonDisabled}
          title={
            !hasChanges ? 'No changes to save' :
            localSaveSuccess ? 'Changes saved to local storage' :
            isSavingLocal ? 'Saving to local storage...' :
            'Save changes to browser local storage'
          }
        >
          <span className="button-icon">💾</span>
          <span className="button-text">{getLocalButtonText()}</span>
        </button>
      )}

      {/* GitHub Save Button */}
      {showGitHubButton && canSaveToGitHub && (
        <button
          className={getButtonClasses('github', githubButtonDisabled, githubSaveSuccess)}
          onClick={onSaveGitHub}
          disabled={githubButtonDisabled}
          title={
            !hasChanges ? 'No changes to save' :
            githubSaveSuccess ? 'Changes committed to GitHub' :
            isSavingGitHub ? 'Committing to GitHub...' :
            'Commit changes to GitHub repository'
          }
        >
          <span className="button-icon">📤</span>
          <span className="button-text">{getGitHubButtonText()}</span>
        </button>
      )}

      {/* GitHub unavailable indicator */}
      {showGitHubButton && !canSaveToGitHub && !isDemo && (
        <div className="github-unavailable">
          <span className="unavailable-icon">🔒</span>
          <span className="unavailable-text">GitHub save unavailable</span>
          <small>Login required for GitHub access</small>
        </div>
      )}

      {/* Demo mode indicator */}
      {isDemo && (
        <div className="demo-mode-indicator">
          <span className="demo-icon">🧪</span>
          <span className="demo-text">Demo Mode - Local save only</span>
        </div>
      )}

      {/* Local storage indicator */}
      {savedLocally && (
        <div className="local-storage-indicator">
          <span className="local-icon">💾</span>
          <span className="local-text">Local version available</span>
        </div>
      )}
    </div>
  );
};

export default SaveButtonsContainer;
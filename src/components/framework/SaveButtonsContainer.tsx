import React from 'react';

/**
 * Props for SaveButtonsContainer component
 */
interface SaveButtonsContainerProps {
  // States
  /** Whether there are unsaved changes */
  hasChanges?: boolean;
  /** Whether local save is in progress */
  isSavingLocal?: boolean;
  /** Whether GitHub save is in progress */
  isSavingGitHub?: boolean;
  /** Whether user can save to GitHub */
  canSaveToGitHub?: boolean;
  /** Whether local save was successful */
  localSaveSuccess?: boolean;
  /** Whether GitHub save was successful */
  githubSaveSuccess?: boolean;
  /** Whether changes are saved locally */
  savedLocally?: boolean;
  
  // Handlers
  /** Handler for local save */
  onSaveLocal?: () => void;
  /** Handler for GitHub save */
  onSaveGitHub?: () => void;
  
  // Configuration
  /** Whether to show local button */
  showLocalButton?: boolean;
  /** Whether to show GitHub button */
  showGitHubButton?: boolean;
  /** Button size */
  buttonSize?: 'small' | 'medium' | 'large';
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
}

/**
 * Container for save buttons with independent states
 * Provides consistent UI for local and GitHub save operations
 * 
 * @example
 * <SaveButtonsContainer
 *   hasChanges={true}
 *   canSaveToGitHub={true}
 *   onSaveLocal={handleLocalSave}
 *   onSaveGitHub={handleGitHubSave}
 * />
 */
const SaveButtonsContainer: React.FC<SaveButtonsContainerProps> = ({
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
  showLocalButton = true,
  showGitHubButton = true,
  buttonSize = 'medium',
  layout = 'horizontal'
}) => {
  
  // Determine button states
  const localButtonDisabled = !hasChanges || isSavingLocal || localSaveSuccess;
  const githubButtonDisabled = !hasChanges || isSavingGitHub || githubSaveSuccess || !canSaveToGitHub;
  
  // Button text based on state
  const getLocalButtonText = (): string => {
    if (localSaveSuccess) return 'Saved Locally ✓';
    if (isSavingLocal) return 'Saving...';
    return 'Save Local';
  };
  
  const getGitHubButtonText = (): string => {
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

  const getButtonClasses = (type: string, disabled: boolean, success: boolean): string => {
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
      {showGitHubButton && !canSaveToGitHub && (
        <div className="github-unavailable">
          <span className="unavailable-icon">🔒</span>
          <span className="unavailable-text">GitHub save unavailable</span>
          <small>Login required for GitHub access</small>
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

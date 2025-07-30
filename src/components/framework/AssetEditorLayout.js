import React, { useState, useCallback } from 'react';
import { PageLayout } from './index';
import SaveButtonsContainer from './SaveButtonsContainer';
import CommitMessageDialog from './CommitMessageDialog';
import githubService from '../../services/githubService';
import localStorageService from '../../services/localStorageService';
import './AssetEditorLayout.css';

/**
 * Enhanced page framework for asset editors
 * Provides consistent save functionality with independent local/GitHub save states
 */
const AssetEditorLayout = ({
  children,
  pageName,
  // Asset information
  file,
  repository,
  branch,
  // Content management
  content,
  originalContent,
  hasChanges = false,
  isDemo = false,
  // Save callbacks
  onSave,
  onContentChange,
  // UI customization
  showSaveButtons = true,
  saveButtonsPosition = 'top', // 'top', 'bottom', 'both'
  ...pageLayoutProps
}) => {
  // Save states
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isSavingGitHub, setIsSavingGitHub] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedLocally, setSavedLocally] = useState(false);
  const [localSaveSuccess, setLocalSaveSuccess] = useState(false);
  const [githubSaveSuccess, setGithubSaveSuccess] = useState(false);
  
  // Commit dialog state
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');

  // Check if user can save to GitHub
  const canSaveToGitHub = githubService.isAuth() && !isDemo;

  // Handle local save
  const handleSaveLocal = useCallback(async () => {
    if (!hasChanges || !file?.path) return;

    try {
      setIsSavingLocal(true);
      setSaveError(null);
      setLocalSaveSuccess(false);

      // Save to local storage
      const metadata = {
        repository: repository?.full_name || `${repository?.owner?.login}/${repository?.name}`,
        branch: branch || repository?.default_branch || 'main',
        fileName: file.name,
        timestamp: new Date().toISOString()
      };

      const saved = localStorageService.saveLocal(file.path, content, metadata);
      
      if (saved) {
        setSavedLocally(true);
        setLocalSaveSuccess(true);
        onSave && onSave(content, 'local');
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setLocalSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error('Failed to save to local storage');
      }

    } catch (error) {
      console.error('Error saving file locally:', error);
      setSaveError(`Failed to save locally: ${error.message}`);
    } finally {
      setIsSavingLocal(false);
    }
  }, [hasChanges, file, content, repository, branch, onSave]);

  // Handle GitHub save - shows commit dialog
  const handleSaveGitHub = useCallback(() => {
    if (!hasChanges || !canSaveToGitHub) return;
    
    setSaveError(null);
    setShowCommitDialog(true);
  }, [hasChanges, canSaveToGitHub]);

  // Handle commit to GitHub with message
  const handleCommitToGitHub = useCallback(async (message) => {
    if (!message.trim() || !file?.path) return;

    try {
      setIsSavingGitHub(true);
      setSaveError(null);
      setGithubSaveSuccess(false);

      let owner, repoName;
      if (repository?.owner?.login) {
        owner = repository.owner.login;
        repoName = repository.name;
      } else if (repository?.full_name) {
        [owner, repoName] = repository.full_name.split('/');
      } else {
        throw new Error('Repository information not available');
      }

      await githubService.updateFile(
        owner,
        repoName,
        file.path,
        content,
        message,
        branch || repository?.default_branch || 'main'
      );

      setGithubSaveSuccess(true);
      setShowCommitDialog(false);
      setCommitMessage('');
      onSave && onSave(content, 'github');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setGithubSaveSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving file to GitHub:', error);
      setSaveError(`Failed to save to GitHub: ${error.message}`);
    } finally {
      setIsSavingGitHub(false);
    }
  }, [file, content, repository, branch, onSave]);

  // Handle commit dialog cancel
  const handleCancelCommit = useCallback(() => {
    setShowCommitDialog(false);
    setCommitMessage('');
  }, []);

  // Check if there's a local version of this file
  React.useEffect(() => {
    if (file?.path) {
      const localContent = localStorageService.getLocalContent(file.path);
      if (localContent && localContent !== originalContent) {
        setSavedLocally(true);
      }
    }
  }, [file?.path, originalContent]);

  const saveButtonsProps = {
    // States
    hasChanges,
    isSavingLocal,
    isSavingGitHub,
    canSaveToGitHub,
    localSaveSuccess,
    githubSaveSuccess,
    savedLocally,
    
    // Handlers
    onSaveLocal: handleSaveLocal,
    onSaveGitHub: handleSaveGitHub,
    
    // Configuration
    isDemo
  };

  return (
    <PageLayout pageName={pageName} {...pageLayoutProps}>
      <div className="asset-editor-layout">
        {/* Top save buttons */}
        {showSaveButtons && (saveButtonsPosition === 'top' || saveButtonsPosition === 'both') && (
          <div className="save-buttons-top">
            <SaveButtonsContainer {...saveButtonsProps} />
          </div>
        )}

        {/* Error display */}
        {saveError && (
          <div className="asset-editor-error">
            <span className="error-icon">⚠️</span>
            {saveError}
            <button 
              className="btn-link error-dismiss"
              onClick={() => setSaveError(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Success messages */}
        {localSaveSuccess && (
          <div className="asset-editor-success">
            <span className="success-icon">✅</span>
            Changes saved locally successfully!
          </div>
        )}
        
        {githubSaveSuccess && (
          <div className="asset-editor-success">
            <span className="success-icon">✅</span>
            Changes committed to GitHub successfully!
          </div>
        )}

        {/* Main content area */}
        <div className="asset-editor-content">
          {children}
        </div>

        {/* Bottom save buttons */}
        {showSaveButtons && (saveButtonsPosition === 'bottom' || saveButtonsPosition === 'both') && (
          <div className="save-buttons-bottom">
            <SaveButtonsContainer {...saveButtonsProps} />
          </div>
        )}

        {/* Commit message dialog */}
        {showCommitDialog && (
          <CommitMessageDialog
            isOpen={showCommitDialog}
            commitMessage={commitMessage}
            setCommitMessage={setCommitMessage}
            onCommit={handleCommitToGitHub}
            onCancel={handleCancelCommit}
            isSaving={isSavingGitHub}
            fileName={file?.name}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default AssetEditorLayout;
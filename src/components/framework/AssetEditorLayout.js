import React, { useState, useCallback, useEffect } from 'react';
import { PageLayout } from './index';
import SaveButtonsContainer from './SaveButtonsContainer';
import CommitMessageDialog from './CommitMessageDialog';
import dataAccessLayer from '../../services/dataAccessLayer';
import userAccessService from '../../services/userAccessService';
import './AssetEditorLayout.css';

/**
 * Enhanced page framework for asset editors
 * Provides consistent save functionality with user access integration
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
  // Save callbacks
  onSave,
  onContentChange,
  // Custom save functions (for special cases like BPMN that need XML export)
  customSaveToGitHub,
  // UI customization
  showSaveButtons = true,
  saveButtonsPosition = 'top', // 'top', 'bottom', 'both'
  ...pageLayoutProps
}) => {
  // Save states
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isSavingGitHub, setIsSavingGitHub] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [localSaveSuccess, setLocalSaveSuccess] = useState(false);
  const [githubSaveSuccess, setGithubSaveSuccess] = useState(false);
  const [saveOptions, setSaveOptions] = useState(null);
  
  // Commit dialog state
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');

  // Load save options based on current user and repository
  useEffect(() => {
    const loadSaveOptions = async () => {
      if (repository) {
        try {
          const options = await dataAccessLayer.getSaveOptions(
            repository.owner?.login,
            repository.name,
            branch
          );
          setSaveOptions(options);
        } catch (error) {
          console.error('Error loading save options:', error);
        }
      }
    };

    loadSaveOptions();
  }, [repository, branch]);

  // Check if user can save to GitHub based on access service
  const canSaveToGitHub = saveOptions?.canSaveGitHub && saveOptions?.showSaveGitHub;

  // Handle local save
  const handleSaveLocal = useCallback(async () => {
    if (!hasChanges || !file?.path) return;

    try {
      setIsSavingLocal(true);
      setSaveError(null);
      setLocalSaveSuccess(false);

      // Use data access layer for local save
      const result = await dataAccessLayer.saveAssetLocal(file.path, content, {
        repository: repository?.full_name || `${repository?.owner?.login}/${repository?.name}`,
        branch: branch || repository?.default_branch || 'main',
        fileName: file.name,
        timestamp: new Date().toISOString()
      });
      
      if (result.result === 'success') {
        setLocalSaveSuccess(true);
        onSave && onSave(content, 'local');
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setLocalSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to save to local storage');
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

      // Use custom save function if provided (for special cases like BPMN)
      if (customSaveToGitHub) {
        const success = await customSaveToGitHub(message.trim());
        if (success) {
          setGithubSaveSuccess(true);
          setShowCommitDialog(false);
          setCommitMessage('');
          onSave && onSave(content, 'github');
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            setGithubSaveSuccess(false);
          }, 3000);
        } else {
          throw new Error('Custom save function failed');
        }
        return;
      }

      // Use data access layer for GitHub save
      const result = await dataAccessLayer.saveAssetGitHub(
        repository?.owner?.login,
        repository?.name,
        branch,
        file.path,
        content,
        message.trim()
      );

      if (result.result === 'success') {
        setGithubSaveSuccess(true);
        setShowCommitDialog(false);
        setCommitMessage('');
        onSave && onSave(content, 'github');
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setGithubSaveSuccess(false);
        }, 3000);
      } else {
        // Handle different result types
        let errorMessage = result.message;
        if (result.result === 'demo_mode_blocked') {
          errorMessage = 'Demo users cannot save to GitHub. You can save changes locally instead.';
        } else if (result.result === 'permission_denied') {
          errorMessage = 'You do not have permission to save to this repository.';
        }
        throw new Error(errorMessage);
      }
        [owner, repoName] = repository.full_name.split('/');
      } else {
        throw new Error('Repository information not available');
      }

      await githubService.updateFile(
        owner,
        repoName,
        file.path,
        content,
        message.trim(),
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
  }, [file, content, repository, branch, onSave, customSaveToGitHub]);

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
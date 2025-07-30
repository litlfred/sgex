import { useState, useCallback, useEffect } from 'react';
import githubService from '../../services/githubService';
import localStorageService from '../../services/localStorageService';

/**
 * Hook for managing asset editor save state and operations
 * Provides consistent save functionality for asset editors
 */
export const useAssetSave = ({
  file,
  repository,
  branch,
  content,
  originalContent,
  isDemo = false,
  onSave
}) => {
  // Save states
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isSavingGitHub, setIsSavingGitHub] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedLocally, setSavedLocally] = useState(false);
  const [localSaveSuccess, setLocalSaveSuccess] = useState(false);
  const [githubSaveSuccess, setGithubSaveSuccess] = useState(false);

  // Derived states
  const hasChanges = content !== originalContent;
  const canSaveToGitHub = githubService.isAuth() && !isDemo;

  // Check if there's a local version of this file
  useEffect(() => {
    if (file?.path) {
      const localContent = localStorageService.getLocalContent(file.path);
      if (localContent && localContent !== originalContent) {
        setSavedLocally(true);
      } else {
        setSavedLocally(false);
      }
    }
  }, [file?.path, originalContent]);

  // Reset success states when content changes
  useEffect(() => {
    if (hasChanges) {
      setLocalSaveSuccess(false);
      setGithubSaveSuccess(false);
      setSaveError(null);
    }
  }, [hasChanges]);

  // Handle local save
  const saveLocal = useCallback(async () => {
    if (!hasChanges || !file?.path) return false;

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
        
        return true;
      } else {
        throw new Error('Failed to save to local storage');
      }

    } catch (error) {
      console.error('Error saving file locally:', error);
      setSaveError(`Failed to save locally: ${error.message}`);
      return false;
    } finally {
      setIsSavingLocal(false);
    }
  }, [hasChanges, file, content, repository, branch, onSave]);

  // Handle GitHub save with commit message
  const saveToGitHub = useCallback(async (commitMessage) => {
    if (!commitMessage?.trim() || !file?.path || !canSaveToGitHub) return false;

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
        commitMessage.trim(),
        branch || repository?.default_branch || 'main'
      );

      setGithubSaveSuccess(true);
      onSave && onSave(content, 'github');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setGithubSaveSuccess(false);
      }, 3000);
      
      return true;

    } catch (error) {
      console.error('Error saving file to GitHub:', error);
      setSaveError(`Failed to save to GitHub: ${error.message}`);
      return false;
    } finally {
      setIsSavingGitHub(false);
    }
  }, [file, content, repository, branch, canSaveToGitHub, onSave]);

  // Load local version of file
  const loadLocalVersion = useCallback(() => {
    if (file?.path) {
      const localContent = localStorageService.getLocalContent(file.path);
      return localContent;
    }
    return null;
  }, [file?.path]);

  // Discard local version
  const discardLocalVersion = useCallback(() => {
    if (file?.path) {
      localStorageService.removeLocal(file.path);
      setSavedLocally(false);
      return true;
    }
    return false;
  }, [file?.path]);

  // Clear save error
  const clearError = useCallback(() => {
    setSaveError(null);
  }, []);

  // Export local changes
  const exportLocalChanges = useCallback(() => {
    try {
      const exportData = localStorageService.exportLocalChanges('json');
      const url = URL.createObjectURL(exportData);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sgex-local-changes-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting local changes:', error);
      setSaveError(`Failed to export: ${error.message}`);
      return false;
    }
  }, []);

  return {
    // States
    hasChanges,
    isSavingLocal,
    isSavingGitHub,
    saveError,
    savedLocally,
    localSaveSuccess,
    githubSaveSuccess,
    canSaveToGitHub,
    
    // Actions
    saveLocal,
    saveToGitHub,
    loadLocalVersion,
    discardLocalVersion,
    clearError,
    exportLocalChanges,
    
    // Utilities
    isLoading: isSavingLocal || isSavingGitHub
  };
};
/**
 * Asset Save Hook
 * 
 * Hook for managing asset editor save state and operations
 * Provides consistent save functionality for asset editors with local and GitHub save support
 * 
 * @module useAssetSave
 */

import { useState, useCallback, useEffect } from 'react';
import githubService from '../../services/githubService';
import localStorageService from '../../services/localStorageService';

/**
 * File information
 * @example { path: "input/fsh/actors.fsh", name: "actors.fsh", sha: "abc123" }
 */
export interface FileInfo {
  /** File path in repository */
  path: string;
  /** File name */
  name: string;
  /** Git blob SHA */
  sha?: string;
}

/**
 * Repository information
 * @example { name: "anc-dak", owner: { login: "who" }, full_name: "who/anc-dak" }
 */
export interface RepositoryInfo {
  /** Repository name */
  name: string;
  /** Repository owner */
  owner?: {
    login: string;
  };
  /** Full repository name (owner/repo) */
  full_name?: string;
  /** Default branch */
  default_branch?: string;
}

/**
 * Hook configuration parameters
 * @example { file: {...}, repository: {...}, branch: "main", content: "...", originalContent: "..." }
 */
export interface UseAssetSaveParams {
  /** File information */
  file: FileInfo | null;
  /** Repository information */
  repository: RepositoryInfo | null;
  /** Current branch name */
  branch: string | null;
  /** Current file content */
  content: string;
  /** Original file content */
  originalContent: string;
  /** Callback when save is successful */
  onSave?: (content: string, saveType: 'local' | 'github') => void;
}

/**
 * Asset save hook return type
 * @example { hasChanges: true, saveLocal: Function, saveToGitHub: Function, ... }
 */
export interface UseAssetSaveReturn {
  /** Whether content has unsaved changes */
  hasChanges: boolean;
  /** Whether currently saving locally */
  isSavingLocal: boolean;
  /** Whether currently saving to GitHub */
  isSavingGitHub: boolean;
  /** Save error message if any */
  saveError: string | null;
  /** Whether file has local saved version */
  savedLocally: boolean;
  /** Whether local save just succeeded */
  localSaveSuccess: boolean;
  /** Whether GitHub save just succeeded */
  githubSaveSuccess: boolean;
  /** Whether user can save to GitHub */
  canSaveToGitHub: boolean;
  /** Save content locally */
  saveLocal: () => Promise<boolean>;
  /** Save content to GitHub with commit message */
  saveToGitHub: (commitMessage: string) => Promise<boolean>;
  /** Load local version of file */
  loadLocalVersion: () => string | null;
  /** Discard local version */
  discardLocalVersion: () => boolean;
  /** Clear save error */
  clearError: () => void;
  /** Export all local changes */
  exportLocalChanges: () => boolean;
  /** Whether any save operation is in progress */
  isLoading: boolean;
}

/**
 * Hook for managing asset editor save state and operations
 * Provides consistent save functionality for asset editors with local storage and GitHub integration
 * 
 * @param params - Hook configuration parameters
 * @returns Asset save state and operations
 * 
 * @example
 * const {
 *   hasChanges,
 *   saveLocal,
 *   saveToGitHub,
 *   isSavingGitHub,
 *   githubSaveSuccess
 * } = useAssetSave({
 *   file: { path: "input/fsh/actors.fsh", name: "actors.fsh" },
 *   repository: { name: "anc-dak", owner: { login: "who" } },
 *   branch: "main",
 *   content: currentContent,
 *   originalContent: originalContent,
 *   onSave: (content, type) => console.log(`Saved ${type}`)
 * });
 */
export const useAssetSave = ({
  file,
  repository,
  branch,
  content,
  originalContent,
  onSave
}: UseAssetSaveParams): UseAssetSaveReturn => {
  // Save states
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isSavingGitHub, setIsSavingGitHub] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedLocally, setSavedLocally] = useState(false);
  const [localSaveSuccess, setLocalSaveSuccess] = useState(false);
  const [githubSaveSuccess, setGithubSaveSuccess] = useState(false);

  // Derived states
  const hasChanges = content !== originalContent;
  const canSaveToGitHub = githubService.isAuth();

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
  const saveLocal = useCallback(async (): Promise<boolean> => {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving file locally:', error);
      setSaveError(`Failed to save locally: ${errorMessage}`);
      return false;
    } finally {
      setIsSavingLocal(false);
    }
  }, [hasChanges, file, content, repository, branch, onSave]);

  // Handle GitHub save with commit message
  const saveToGitHub = useCallback(async (commitMessage: string): Promise<boolean> => {
    if (!commitMessage?.trim() || !file?.path || !canSaveToGitHub) return false;

    try {
      setIsSavingGitHub(true);
      setSaveError(null);
      setGithubSaveSuccess(false);

      let owner: string;
      let repoName: string;
      
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving file to GitHub:', error);
      setSaveError(`Failed to save to GitHub: ${errorMessage}`);
      return false;
    } finally {
      setIsSavingGitHub(false);
    }
  }, [file, content, repository, branch, canSaveToGitHub, onSave]);

  // Load local version of file
  const loadLocalVersion = useCallback((): string | null => {
    if (file?.path) {
      const localContent = localStorageService.getLocalContent(file.path);
      return localContent;
    }
    return null;
  }, [file?.path]);

  // Discard local version
  const discardLocalVersion = useCallback((): boolean => {
    if (file?.path) {
      localStorageService.removeLocal(file.path);
      setSavedLocally(false);
      return true;
    }
    return false;
  }, [file?.path]);

  // Clear save error
  const clearError = useCallback((): void => {
    setSaveError(null);
  }, []);

  // Export local changes
  const exportLocalChanges = useCallback((): boolean => {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error exporting local changes:', error);
      setSaveError(`Failed to export: ${errorMessage}`);
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

import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import githubService from '../services/githubService';
import localStorageService from '../services/localStorageService';
import './FeatureFileEditor.css';

const FeatureFileEditor = ({ 
  file, 
  repository, 
  selectedBranch, 
  isOpen, 
  onClose, 
  onSave,
  initialContent = '',
  isDemo = false 
}) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isSavingGitHub, setIsSavingGitHub] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [canSaveToGitHub, setCanSaveToGitHub] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setHasChanges(false);
    setSavedLocally(false);
    
    // Determine if user can save to GitHub (authenticated and not in demo mode)
    const canSaveToGitHub = githubService.isAuth() && !isDemo;
    setCanSaveToGitHub(canSaveToGitHub);
    
    // Check if there's a local version of this file
    if (file && file.path) {
      const localContent = localStorageService.getLocalContent(file.path);
      if (localContent && localContent !== initialContent) {
        setSavedLocally(true);
      }
    }
  }, [initialContent, isDemo, file]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasChanges(newContent !== initialContent);
  };

  const handleSaveLocal = async () => {
    if (!hasChanges) return;

    try {
      setIsSavingLocal(true);
      setSaveError(null);

      // Save to local storage
      const metadata = {
        repository: repository.full_name || `${repository.owner?.login}/${repository.name}`,
        branch: selectedBranch || repository.default_branch || 'main',
        fileName: file.name
      };

      const saved = localStorageService.saveLocal(file.path, content, metadata);
      
      if (saved) {
        setSavedLocally(true);
        onSave && onSave(content);
        
        // Only close editing if not saving to GitHub and no other saves in progress
        setTimeout(() => {
          if (!isSavingGitHub && !canSaveToGitHub) {
            setIsEditing(false);
          }
        }, 1000);
      } else {
        throw new Error('Failed to save to local storage');
      }

    } catch (error) {
      console.error('Error saving file locally:', error);
      setSaveError(`Failed to save locally: ${error.message}`);
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleSaveGitHub = async () => {
    if (!hasChanges || !canSaveToGitHub) return;

    try {
      setIsSavingGitHub(true);
      setSaveError(null);

      // Save to GitHub
      let owner, repoName;
      if (repository.owner?.login) {
        owner = repository.owner.login;
        repoName = repository.name;
      } else if (repository.full_name) {
        [owner, repoName] = repository.full_name.split('/');
      }

      await githubService.updateFile(
        owner,
        repoName,
        file.path,
        content,
        `Update ${file.name}`,
        selectedBranch || repository.default_branch || 'main'
      );

      setHasChanges(false);
      onSave && onSave(content);
      
      // Show success message briefly and close editor
      setTimeout(() => {
        if (!isSavingLocal) {
          setIsEditing(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Error saving file to GitHub:', error);
      setSaveError(`Failed to save to GitHub: ${error.message}`);
    } finally {
      setIsSavingGitHub(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    setContent(initialContent);
    setHasChanges(false);
    setIsEditing(false);
    setSaveError(null);
  };

  const handleExportLocal = () => {
    try {
      const exportData = localStorageService.exportLocalChanges('json');
      const url = URL.createObjectURL(exportData);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sgex-feature-files-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting local changes:', error);
      setSaveError(`Failed to export: ${error.message}`);
    }
  };

  const handleLoadLocal = () => {
    if (file && file.path) {
      const localContent = localStorageService.getLocalContent(file.path);
      if (localContent) {
        if (hasChanges && !window.confirm('Loading local version will discard current changes. Continue?')) {
          return;
        }
        setContent(localContent);
        setHasChanges(localContent !== initialContent);
        setSavedLocally(true);
      }
    }
  };

  const handleDiscardLocal = () => {
    if (file && file.path && window.confirm('This will permanently delete the local version. Continue?')) {
      localStorageService.removeLocal(file.path);
      setSavedLocally(false);
      if (content !== initialContent) {
        setContent(initialContent);
        setHasChanges(false);
      }
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="feature-editor-overlay" onClick={onClose}>
      <div className="feature-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feature-editor-header">
          <div className="editor-title">
            <h3>{file.name}</h3>
            <span className="file-path">{file.path}</span>
          </div>
          <div className="editor-actions">
            {!isEditing ? (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                {savedLocally && (
                  <button 
                    className="btn btn-info"
                    onClick={handleLoadLocal}
                    title="Load local version"
                  >
                    Load Local
                  </button>
                )}
                <button 
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-success"
                  onClick={handleSaveLocal}
                  disabled={!hasChanges || isSavingLocal}
                >
                  {isSavingLocal ? 'Saving...' : 'Save Local'}
                </button>
                {canSaveToGitHub && (
                  <button 
                    className="btn btn-success"
                    onClick={handleSaveGitHub}
                    disabled={!hasChanges || isSavingGitHub}
                  >
                    {isSavingGitHub ? 'Saving...' : 'Save to GitHub'}
                  </button>
                )}
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isSavingLocal || isSavingGitHub}
                >
                  Cancel
                </button>
                {localStorageService.hasLocalChanges() && (
                  <button 
                    className="btn btn-info"
                    onClick={handleExportLocal}
                    title="Export all local changes"
                  >
                    Export All
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="feature-editor-content">
          {isEditing ? (
            <div className="editor-container">
              <textarea
                className="feature-editor-textarea"
                value={content}
                onChange={handleContentChange}
                placeholder="Enter your Gherkin feature content here..."
                spellCheck={false}
              />
              <div className="editor-preview">
                <h4>Preview:</h4>
                <SyntaxHighlighter
                  language="gherkin"
                  style={oneLight}
                  customStyle={{
                    margin: 0,
                    borderRadius: '4px',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                >
                  {content || '# Feature content will appear here...'}
                </SyntaxHighlighter>
              </div>
            </div>
          ) : (
            <div className="feature-viewer">
              <SyntaxHighlighter
                language="gherkin"
                style={oneLight}
                customStyle={{
                  margin: 0,
                  borderRadius: '4px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  minHeight: '400px'
                }}
              >
                {content}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

        {saveError && (
          <div className="editor-error">
            <span className="error-icon">⚠️</span>
            {saveError}
          </div>
        )}

        {!canSaveToGitHub && !isDemo && (
          <div className="local-storage-notice">
            <span className="info-icon">💾</span>
            Local Mode: Changes will be saved to your browser's local storage. 
            {savedLocally && ' Local version available.'} 
            <button 
              className="btn-link"
              onClick={handleExportLocal}
              disabled={!localStorageService.hasLocalChanges()}
            >
              Export changes
            </button>
            {savedLocally && (
              <button 
                className="btn-link danger"
                onClick={handleDiscardLocal}
              >
                Discard local
              </button>
            )}
          </div>
        )}

        {isDemo && (
          <div className="demo-notice">
            <span className="info-icon">🧪</span>
            Demo Mode: Changes are saved locally for demonstration. Use "Save Local" to save changes to your browser's storage.
          </div>
        )}

        <div className="feature-editor-footer">
          <div className="editor-info">
            <span>Gherkin Feature File</span>
            {hasChanges && <span className="changes-indicator">• Unsaved changes</span>}
            {savedLocally && <span className="local-indicator">• Local version available</span>}
            {canSaveToGitHub && <span className="github-indicator">• GitHub access available</span>}
            {!canSaveToGitHub && !isDemo && <span className="save-mode-indicator">• Local storage only</span>}
          </div>
          <div className="editor-links">
            <a 
              href={file.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-link"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureFileEditor;
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMode, setSaveMode] = useState('github'); // 'github' or 'local'
  const [savedLocally, setSavedLocally] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setHasChanges(false);
    setSavedLocally(false);
    
    // Determine save mode based on authentication and demo status
    const canSaveToGitHub = githubService.isAuth() && !isDemo;
    setSaveMode(canSaveToGitHub ? 'github' : 'local');
    
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

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      if (saveMode === 'github') {
        // Save to GitHub (existing functionality)
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
        
        // Show success message briefly
        setTimeout(() => {
          setIsEditing(false);
        }, 1000);

      } else {
        // Save to local storage
        const metadata = {
          repository: repository.full_name || `${repository.owner?.login}/${repository.name}`,
          branch: selectedBranch || repository.default_branch || 'main',
          fileName: file.name
        };

        const saved = localStorageService.saveLocal(file.path, content, metadata);
        
        if (saved) {
          setHasChanges(false);
          setSavedLocally(true);
          onSave && onSave(content);
          
          // Show success message briefly
          setTimeout(() => {
            setIsEditing(false);
          }, 1000);
        } else {
          throw new Error('Failed to save to local storage');
        }
      }

    } catch (error) {
      console.error('Error saving file:', error);
      setSaveError(`Failed to save file: ${error.message}`);
    } finally {
      setIsSaving(false);
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
                  Edit {saveMode === 'local' ? '(Local)' : ''}
                </button>
                {savedLocally && saveMode === 'local' && (
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
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? 'Saving...' : `Save ${saveMode === 'local' ? 'Locally' : 'to GitHub'}`}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                {saveMode === 'local' && localStorageService.hasLocalChanges() && (
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

        {saveMode === 'local' && !isDemo && (
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
            Demo Mode: Changes are saved locally for demonstration. In a real repository with write permissions, changes would be saved to GitHub.
          </div>
        )}

        <div className="feature-editor-footer">
          <div className="editor-info">
            <span>Gherkin Feature File</span>
            {hasChanges && <span className="changes-indicator">• Unsaved changes</span>}
            {savedLocally && <span className="local-indicator">• Local version available</span>}
            {saveMode === 'local' && <span className="save-mode-indicator">• Local storage mode</span>}
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
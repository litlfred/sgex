import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import githubService from '../services/githubService';
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

  useEffect(() => {
    setContent(initialContent);
    setHasChanges(false);
  }, [initialContent]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasChanges(newContent !== initialContent);
  };

  const handleSave = async () => {
    if (!hasChanges || isDemo) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      // Extract owner and repo name
      let owner, repoName;
      if (repository.owner?.login) {
        owner = repository.owner.login;
        repoName = repository.name;
      } else if (repository.full_name) {
        [owner, repoName] = repository.full_name.split('/');
      }

      // Save the file content back to GitHub
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
                  disabled={isDemo}
                >
                  {isDemo ? 'Edit (Demo Mode)' : 'Edit'}
                </button>
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
                  disabled={!hasChanges || isSaving || isDemo}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
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

        {isDemo && (
          <div className="demo-notice">
            <span className="info-icon">ℹ️</span>
            Demo Mode: Editing is disabled. In a real repository with write permissions, you would be able to edit and save changes.
          </div>
        )}

        <div className="feature-editor-footer">
          <div className="editor-info">
            <span>Gherkin Feature File</span>
            {hasChanges && <span className="changes-indicator">• Unsaved changes</span>}
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
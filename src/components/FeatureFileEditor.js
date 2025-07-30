import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AssetEditorLayout } from './framework';
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
  const [savedLocally, setSavedLocally] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    
    // Check if there's a local version of this file
    if (file && file.path) {
      const localContent = localStorageService.getLocalContent(file.path);
      if (localContent && localContent !== initialContent) {
        setSavedLocally(true);
      }
    }
  }, [initialContent, file]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  const handleSave = (savedContent, saveType) => {
    console.log(`Feature file saved to ${saveType}`);
    onSave && onSave(savedContent);
    
    // Auto-close editing mode after save if not continuing to edit
    if (saveType === 'local') {
      setTimeout(() => {
        setIsEditing(false);
      }, 2000);
    } else if (saveType === 'github') {
      setTimeout(() => {
        setIsEditing(false);
      }, 1000);
    }
  };

  const handleCancel = () => {
    const hasChanges = content !== initialContent;
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    setContent(initialContent);
    setIsEditing(false);
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
    }
  };

  const handleLoadLocal = () => {
    if (file && file.path) {
      const localContent = localStorageService.getLocalContent(file.path);
      if (localContent) {
        const hasChanges = content !== initialContent;
        if (hasChanges && !window.confirm('Loading local version will discard current changes. Continue?')) {
          return;
        }
        setContent(localContent);
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
      }
    }
  };

  if (!isOpen || !file) return null;

  const hasChanges = content !== initialContent;

  return (
    <div className="feature-editor-overlay" onClick={onClose}>
      <div className="feature-editor-modal" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <AssetEditorLayout
            pageName="feature-file-editor"
            file={file}
            repository={repository}
            branch={selectedBranch}
            content={content}
            originalContent={initialContent}
            hasChanges={hasChanges}
            isDemo={isDemo}
            onSave={handleSave}
            showHeader={false}
            showMascot={false}
            saveButtonsPosition="top"
          >
            <div className="feature-editor-header">
              <div className="editor-title">
                <h3>{file.name}</h3>
                <span className="file-path">{file.path}</span>
              </div>
              <div className="editor-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
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
              </div>
            </div>

            <div className="feature-editor-content">
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
            </div>

            {!isDemo && (
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
          </AssetEditorLayout>
        ) : (
          <>
            <div className="feature-editor-header">
              <div className="editor-title">
                <h3>{file.name}</h3>
                <span className="file-path">{file.path}</span>
              </div>
              <div className="editor-actions">
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
              </div>
            </div>

            <div className="feature-editor-content">
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
            </div>

            <div className="feature-editor-footer">
              <div className="editor-info">
                <span>Gherkin Feature File</span>
                {savedLocally && <span className="local-indicator">• Local version available</span>}
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
          </>
        )}
      </div>
    </div>
  );
};

export default FeatureFileEditor;
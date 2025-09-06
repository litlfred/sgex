import React, { useState, Suspense, lazy } from 'react';
import stagingGroundService from '../services/stagingGroundService';
import TinyMCEEditor from './TinyMCEEditor';

// Lazy load MDEditor as fallback to improve initial page responsiveness
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

const PageEditModal = ({ page, onClose, onSave }) => {
  const [content, setContent] = useState(page?.content ? atob(page.content.content) : '');
  const [isSaving, setIsSaving] = useState(false);
  const [editorMode, setEditorMode] = useState('tinymce'); // 'tinymce' or 'markdown'
  const [editorError, setEditorError] = useState(null);

  if (!page) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert TinyMCE HTML to markdown if needed
      let contentToSave = content;
      if (editorMode === 'tinymce') {
        // For now, save HTML directly - could add HTML to markdown conversion here
        contentToSave = content;
      }
      
      // Save content to staging ground instead of directly to GitHub
      const success = stagingGroundService.updateFile(
        page.path,
        contentToSave,
        {
          title: page.title,
          filename: page.filename,
          tool: editorMode === 'tinymce' ? 'TinyMCE PageEditor' : 'PageEditor',
          contentType: editorMode === 'tinymce' ? 'html' : 'markdown'
        }
      );
      
      if (success) {
        // Notify parent that changes were staged successfully
        if (onSave) {
          await onSave(page, contentToSave, 'staged');
        }
        onClose();
      } else {
        throw new Error('Failed to save to staging ground');
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page to staging ground. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-edit-modal-overlay" onClick={handleOverlayClick}>
      <div className="page-edit-modal">
        <div className="page-edit-modal-header">
          <h2>Edit {page.title}</h2>
          <div className="header-actions">
            <div className="editor-mode-toggle">
              <button 
                className={`mode-toggle ${editorMode === 'tinymce' ? 'active' : ''}`}
                onClick={() => setEditorMode('tinymce')}
                disabled={isSaving}
                title="Rich text editor with advanced formatting"
              >
                🎨 Rich Text
              </button>
              <button 
                className={`mode-toggle ${editorMode === 'markdown' ? 'active' : ''}`}
                onClick={() => setEditorMode('markdown')}
                disabled={isSaving}
                title="Markdown editor for technical content"
              >
                📝 Markdown
              </button>
            </div>
            <button 
              className="btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Staging...' : 'Stage Changes'}
            </button>
          </div>
        </div>
        
        <div className="page-edit-modal-content">
          <div className="page-info">
            <span className="page-filename">{page.filename}</span>
            <span className="page-path">{page.path}</span>
          </div>
          
          <div className="md-editor-container">
            {editorMode === 'tinymce' ? (
              <TinyMCEEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                height={500}
                disabled={isSaving}
                placeholder="Start editing your page content..."
                mode="standard"
                onInit={(editor) => {
                  setEditorError(null);
                  console.log('TinyMCE editor initialized');
                }}
                onError={(error) => {
                  setEditorError(error);
                  console.error('TinyMCE error:', error);
                }}
              />
            ) : (
              <Suspense fallback={<div className="loading-spinner">Loading markdown editor...</div>}>
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  preview="edit"
                  height={500}
                  visibleDragBar={false}
                  data-color-mode="light"
                  hideToolbar={isSaving}
                />
              </Suspense>
            )}
            
            {editorError && (
              <div className="editor-error-notice">
                <p><strong>⚠️ Editor Error:</strong> {editorError}</p>
                <p>
                  <button 
                    onClick={() => setEditorMode('markdown')}
                    className="btn-secondary"
                    style={{ fontSize: '0.9em', padding: '4px 8px' }}
                  >
                    Switch to Markdown Editor
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditModal;
import React, { useState } from 'react';
import stagingGroundService from '../services/stagingGroundService';
import TinyMCEEditor from './TinyMCEEditor';

const PageEditModal = ({ page, onClose, onSave }) => {
  const [content, setContent] = useState(page?.content ? atob(page.content.content) : '');
  const [isSaving, setIsSaving] = useState(false);
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
      // Save content from TinyMCE (HTML format)
      const success = stagingGroundService.updateFile(
        page.path,
        content,
        {
          title: page.title,
          filename: page.filename,
          tool: 'TinyMCE PageEditor',
          contentType: 'html'
        }
      );
      
      if (success) {
        // Notify parent that changes were staged successfully
        if (onSave) {
          await onSave(page, content, 'staged');
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
            
            {editorError && (
              <div className="editor-error-notice">
                <p><strong>⚠️ Editor Error:</strong> {editorError}</p>
                <p>Please try refreshing the page or contact support if the problem persists.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditModal;
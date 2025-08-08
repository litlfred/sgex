import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import stagingGroundService from '../services/stagingGroundService';

const PageEditModal = ({ page, onClose, onSave }) => {
  const [content, setContent] = useState(page?.content ? atob(page.content.content) : '');
  const [isSaving, setIsSaving] = useState(false);

  if (!page) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save content to staging ground instead of directly to GitHub
      const success = stagingGroundService.updateFile(
        page.path,
        content,
        {
          title: page.title,
          filename: page.filename,
          tool: 'PageEditor',
          contentType: 'markdown'
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
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              preview="edit"
              height={500}
              visibleDragBar={false}
              data-color-mode="light"
              hideToolbar={isSaving}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditModal;
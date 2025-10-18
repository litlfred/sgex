import React, { useState, useEffect, Suspense, lazy } from 'react';
import stagingGroundService from '../services/stagingGroundService';

// Lazy load MDEditor to improve initial page responsiveness
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

const PageEditModal = ({ page, onClose, onSave }) => {
  const [content, setContent] = useState(page?.content ? atob(page.content.content) : '');
  const [isSaving, setIsSaving] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isSaving]);

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
    <div 
      className="page-edit-modal-overlay" 
      onClick={(e) => e.target === e.currentTarget && handleOverlayClick(e)}
      role="presentation"
    >
      <div 
        className="page-edit-modal"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
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
            <Suspense fallback={<div className="loading-spinner">Loading editor...</div>}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditModal;
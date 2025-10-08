import React, { useState, Suspense, lazy } from 'react';
import stagingGroundService from '../services/stagingGroundService';

// Lazy load MDEditor to improve initial page responsiveness
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

const PageEditModal = ({ 
  page, 
  onClose, 
  onSave,
  title,
  enablePreview = false,
  variableHelper = null,
  additionalMetadata = {},
  onContentChange = null
}) => {
  const [content, setContent] = useState(page?.content ? atob(page.content.content) : '');
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('edit');

  if (!page) return null;

  const handleContentChange = (val) => {
    const newContent = val || '';
    setContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save content to staging ground instead of directly to GitHub
      const metadata = {
        title: page.title || title,
        filename: page.filename,
        tool: additionalMetadata.tool || 'PageEditor',
        contentType: 'markdown',
        ...additionalMetadata
      };
      
      const success = stagingGroundService.updateFile(
        page.path,
        content,
        metadata
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
          <h2>{title || `Edit ${page.title}`}</h2>
          <div className="header-actions">
            {enablePreview && (
              <>
                <button 
                  className={`btn-toggle ${previewMode === 'edit' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('edit')}
                  disabled={isSaving}
                  title="Edit mode"
                >
                  ✏️ Edit
                </button>
                <button 
                  className={`btn-toggle ${previewMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('preview')}
                  disabled={isSaving}
                  title="Preview mode"
                >
                  👁️ Preview
                </button>
                <div className="toolbar-separator"></div>
              </>
            )}
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
          
          {variableHelper && (
            <div className="variable-helper-toolbar">
              {variableHelper}
            </div>
          )}
          
          <div className="md-editor-container">
            <Suspense fallback={<div className="loading-spinner">Loading editor...</div>}>
              <MDEditor
                value={content}
                onChange={handleContentChange}
                preview={enablePreview ? previewMode : 'edit'}
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
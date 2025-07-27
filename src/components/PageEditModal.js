import React, { useState, useRef } from 'react';
import './PageEditModal.css';

const PageEditModal = ({ page, onClose, onSave }) => {
  const [content, setContent] = useState(page?.content ? atob(page.content.content) : '');
  const [activeTab, setActiveTab] = useState('edit');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);

  if (!page) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(page, content);
      onClose();
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position after the inserted markdown
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const formatMarkdown = (markdown) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        <div className="page-edit-modal-content">
          <div className="page-info">
            <span className="page-filename">{page.filename}</span>
            <span className="page-path">{page.path}</span>
          </div>
          
          <div className="editor-toolbar">
            <button 
              className="toolbar-btn" 
              onClick={() => insertMarkdown('**', '**')}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button 
              className="toolbar-btn" 
              onClick={() => insertMarkdown('*', '*')}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button 
              className="toolbar-btn" 
              onClick={() => insertMarkdown('`', '`')}
              title="Code"
            >
              {'</>'}
            </button>
            <div className="toolbar-separator"></div>
            <button 
              className="toolbar-btn" 
              onClick={() => insertMarkdown('# ', '')}
              title="Heading 1"
            >
              H1
            </button>
            <button 
              className="toolbar-btn" 
              onClick={() => insertMarkdown('## ', '')}
              title="Heading 2"
            >
              H2
            </button>
            <button 
              className="toolbar-btn" 
              onClick={() => insertMarkdown('### ', '')}
              title="Heading 3"
            >
              H3
            </button>
            <div className="toolbar-separator"></div>
            <button 
              className="toolbar-btn" 
              onClick={() => insertMarkdown('- ', '')}
              title="Bullet List"
            >
              • List
            </button>
            <button 
              className="toolbar-btn" 
              onClick={() => insertMarkdown('[', '](url)')}
              title="Link"
            >
              🔗
            </button>
          </div>
          
          <div className="editor-content">
            <div className="content-tabs">
              <button 
                className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                Edit
              </button>
              <button 
                className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
            </div>
            
            {activeTab === 'edit' ? (
              <textarea
                ref={textareaRef}
                className="markdown-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your markdown content here..."
                disabled={isSaving}
              />
            ) : (
              <div className="markdown-preview">
                <div dangerouslySetInnerHTML={{ 
                  __html: formatMarkdown(content) || '<p>No content to preview</p>'
                }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditModal;
import React from 'react';
import { sanitizeMarkdown } from '../utils/securityUtils';

const PageViewModal = ({ page, onClose }) => {
  if (!page) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Decode the markdown content
  const markdownContent = page.content ? atob(page.content.content) : '';

  return (
    <div className="page-view-modal-overlay" onClick={handleOverlayClick}>
      <div className="page-view-modal">
        <div className="page-view-modal-header">
          <h2>{page.title}</h2>
          <button 
            className="close-btn"
            onClick={onClose}
            aria-label="Close page view"
          >
            ×
          </button>
        </div>
        
        <div className="page-view-modal-content">
          <div className="page-info">
            <span className="page-filename">{page.filename}</span>
            <span className="page-path">{page.path}</span>
          </div>
          
          <div className="page-content">
            <div className="content-tabs">
              <button className="tab-btn active">Rendered</button>
              <button className="tab-btn" onClick={() => {
                // Toggle between rendered and raw view
                const rendered = document.querySelector('.rendered-content');
                const raw = document.querySelector('.raw-content');
                const tabs = document.querySelectorAll('.tab-btn');
                
                if (rendered.style.display === 'none') {
                  rendered.style.display = 'block';
                  raw.style.display = 'none';
                  tabs[0].classList.add('active');
                  tabs[1].classList.remove('active');
                } else {
                  rendered.style.display = 'none';
                  raw.style.display = 'block';
                  tabs[0].classList.remove('active');
                  tabs[1].classList.add('active');
                }
              }}>Raw Markdown</button>
            </div>
            
            <div className="rendered-content" dangerouslySetInnerHTML={{ 
              __html: sanitizeMarkdown(markdownContent)
            }} />
            
            <div className="raw-content" style={{ display: 'none' }}>
              <pre>{markdownContent}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageViewModal;
import React, { useEffect } from 'react';

/**
 * Page content structure from GitHub API
 */
interface PageContent {
  content: string;
}

/**
 * Page data structure
 */
interface Page {
  title: string;
  filename: string;
  path: string;
  content?: PageContent;
}

/**
 * Props for PageViewModal component
 */
interface PageViewModalProps {
  /** Page data to display */
  page: Page | null;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * Modal component for viewing page content with markdown rendering
 * 
 * @example
 * <PageViewModal page={pageData} onClose={handleClose} />
 */
const PageViewModal: React.FC<PageViewModalProps> = ({ page, onClose }) => {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!page) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Decode the markdown content
  const markdownContent = page.content ? atob(page.content.content) : '';

  // Simple markdown to HTML conversion for basic formatting
  const formatMarkdown = (markdown: string): string => {
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
    <div 
      className="page-view-modal-overlay" 
      onClick={(e) => e.target === e.currentTarget && handleOverlayClick(e)}
      role="presentation"
    >
      <div 
        className="page-view-modal"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
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
                const rendered = document.querySelector('.rendered-content') as HTMLElement;
                const raw = document.querySelector('.raw-content') as HTMLElement;
                const tabs = document.querySelectorAll('.tab-btn');
                
                if (rendered && raw && tabs.length >= 2) {
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
                }
              }}>Raw Markdown</button>
            </div>
            
            <div className="rendered-content" dangerouslySetInnerHTML={{ 
              __html: formatMarkdown(markdownContent) 
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
export type { Page, PageContent, PageViewModalProps };

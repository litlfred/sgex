import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLayout } from './framework';
import documentationService from '../services/documentationService';
import bookmarkService from '../services/bookmarkService';

const DocumentationViewer = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navigationMenu, setNavigationMenu] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const loadNavigationMenu = async () => {
      try {
        const menu = await documentationService.getNavigationMenu();
        setNavigationMenu(menu);
      } catch (err) {
        console.error('Error loading navigation menu:', err);
      }
    };
    
    loadNavigationMenu();
  }, []);

  useEffect(() => {
    const loadDocumentation = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentDocId = docId || 'overview';
        const document = await documentationService.getDocument(currentDocId);
        
        setCurrentDoc(document);
        setContent(document.content);
        setBreadcrumbs(document.breadcrumbs || []);
        
        // Update document title for better UX
        document.title = `${document.title} - ${t('documentation.title', 'Documentation')}`;
        
      } catch (err) {
        console.error('Error loading documentation:', err);
        setError(t('documentation.errors.loadFailed', 'Failed to load documentation. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    loadDocumentation();
  }, [docId, t]);

  const renderMarkdown = (markdown) => {
    // Simple markdown to HTML conversion for basic formatting
    let html = markdown;

    // For JSON schemas, wrap in code block
    if (currentDoc?.isSchema) {
      return `<pre class="schema-content"><code>${html}</code></pre>`;
    }

    // Process tables first (before paragraph processing)
    html = html.replace(/(\|[^\n]+\|\n\|[-\s|:]+\|\n(?:\|[^\n]+\|\n?)*)/gm, (match) => {
      const lines = match.trim().split('\n');
      const headers = lines[0].split('|').slice(1, -1).map(h => h.trim());
      const rows = lines.slice(2).map(row => row.split('|').slice(1, -1).map(cell => cell.trim()));
      
      let tableHtml = '<table class="doc-table">\n<thead>\n<tr>\n';
      headers.forEach(header => {
        tableHtml += `<th>${header}</th>\n`;
      });
      tableHtml += '</tr>\n</thead>\n<tbody>\n';
      
      rows.forEach(row => {
        tableHtml += '<tr>\n';
        row.forEach(cell => {
          tableHtml += `<td>${cell}</td>\n`;
        });
        tableHtml += '</tr>\n';
      });
      
      tableHtml += '</tbody>\n</table>\n';
      return tableHtml;
    });

    // Apply other markdown formatting
    return html
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img alt="$1" src="$2" />')
      .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`([^`]*)`/gim, '<code>$1</code>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^\n/gim, '<p>')
      .replace(/\n$/gim, '</p>');
  };

  const handleBookmark = () => {
    if (!currentDoc) return;
    
    const context = {
      docId: currentDoc.id,
      title: currentDoc.title,
      path: currentDoc.path || ''
    };
    
    try {
      bookmarkService.addBookmark(
        'documentation',
        window.location.pathname,
        context
      );
      // Could add a toast notification here
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const isBookmarked = currentDoc ? 
    bookmarkService.isBookmarked(window.location.pathname) : false;

  if (loading) {
    return (
      <PageLayout pageName="documentation-viewer">
        <div className="documentation-viewer">
          <div className="doc-content">
            <div className="loading">
              <div className="spinner"></div>
              <p>{t('documentation.loading', 'Loading documentation...')}</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout pageName="documentation-viewer">
        <div className="documentation-viewer">
          <div className="doc-content">
            <div className="error-state">
              <h2>{t('common.error', 'Error')}</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                {t('common.tryAgain', 'Try Again')}
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Custom breadcrumbs for documentation in the preferred style
  const customBreadcrumbs = breadcrumbs.length > 1 ? breadcrumbs.map((crumb) => ({
    label: crumb.label,
    path: crumb.path,
    current: crumb.current,
    onClick: crumb.current ? undefined : () => navigate(crumb.path)
  })) : undefined;

  return (
    <PageLayout 
      pageName="documentation-viewer" 
      showBreadcrumbs={true}
      customBreadcrumbs={customBreadcrumbs}
    >
      <div className="documentation-viewer">
        <div className="doc-content">

          <div className="doc-sidebar">
            <div className="doc-sidebar-header">
              <h3>{t('documentation.title', 'Documentation')}</h3>
              {currentDoc && (
                <button 
                  className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={handleBookmark}
                  title={isBookmarked ? 
                    t('bookmarks.removeBookmark', 'Remove bookmark') : 
                    t('bookmarks.addBookmark', 'Add bookmark')
                  }
                  type="button"
                >
                  {isBookmarked ? '★' : '☆'}
                </button>
              )}
            </div>
            
            <nav className="doc-menu">
              {navigationMenu.map((section) => (
                <div key={section.id} className="doc-category">
                  <div className="doc-category-header">
                    {section.title}
                    {section.description && (
                      <div className="doc-category-description">
                        {section.description}
                      </div>
                    )}
                  </div>
                  
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      className={`doc-menu-item ${docId === item.id || (!docId && item.id === 'overview') ? 'active' : ''} ${item.hasSubpath ? 'has-subpath' : ''} ${item.type === 'schema' ? 'schema-item' : ''}`}
                      onClick={() => navigate(item.path)}
                      type="button"
                    >
                      <span className="doc-menu-title">{item.title}</span>
                      {item.description && (
                        <span className="doc-menu-description">{item.description}</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </div>

          <div className="doc-main">
            <article 
              className={`doc-article ${currentDoc?.isSchema ? 'schema-article' : ''}`}
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(content)
              }}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DocumentationViewer;
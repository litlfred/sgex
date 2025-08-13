import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLayout } from './framework';
import bookmarkService from '../services/bookmarkService';
import './DocumentationViewer.css';

// Dynamically generate documentation files structure
const generateDocFiles = () => {
  const files = {
    'overview': { 
      file: 'README.md', 
      title: 'Documentation Overview', 
      category: 'root',
      path: 'README.md'
    },
    'bpmn-integration': { 
      file: 'bpmn-integration.md', 
      title: 'BPMN Integration', 
      category: 'technical',
      path: 'bpmn-integration.md'
    },
    'dak-components': { 
      file: 'dak-components.md', 
      title: 'DAK Components', 
      category: 'user',
      path: 'dak-components.md'
    },
    'decision-table-editor': { 
      file: 'decision-table-editor.md', 
      title: 'Decision Table Editor', 
      category: 'user',
      path: 'decision-table-editor.md'
    },
    'framework-developer-guide': { 
      file: 'framework-developer-guide.md', 
      title: 'Framework Developer Guide', 
      category: 'technical',
      path: 'framework-developer-guide.md'
    },
    'page-framework': { 
      file: 'page-framework.md', 
      title: 'Page Framework', 
      category: 'technical',
      path: 'page-framework.md'
    },
    'page-inventory': { 
      file: 'page-inventory.md', 
      title: 'Page Inventory', 
      category: 'technical',
      path: 'page-inventory.md'
    },
    'project-plan': { 
      file: 'project-plan.md', 
      title: 'Project Plan', 
      category: 'root',
      path: 'project-plan.md'
    },
    'qa-testing': { 
      file: 'qa-testing.md', 
      title: 'QA Testing', 
      category: 'technical',
      path: 'qa-testing.md'
    },
    'requirements': { 
      file: 'requirements.md', 
      title: 'Requirements', 
      category: 'root',
      path: 'requirements.md'
    },
    'solution-architecture': { 
      file: 'solution-architecture.md', 
      title: 'Solution Architecture', 
      category: 'technical',
      path: 'solution-architecture.md'
    },
    'ui-styling-requirements': { 
      file: 'UI_STYLING_REQUIREMENTS.md', 
      title: 'UI Styling Requirements', 
      category: 'technical',
      path: 'UI_STYLING_REQUIREMENTS.md'
    },
    'who-cors-workaround': { 
      file: 'WHO_CORS_WORKAROUND.md', 
      title: 'WHO CORS Workaround', 
      category: 'technical',
      path: 'WHO_CORS_WORKAROUND.md'
    },
    'workflows-overview': { 
      file: 'workflows/README.md', 
      title: 'Workflows Overview', 
      category: 'workflows',
      path: 'workflows/README.md'
    },
    'schemas': {
      isSchemaSection: true,
      title: 'JSON Schemas',
      category: 'schemas',
      path: 'schemas'
    }
  };

  return files;
};

const docFiles = generateDocFiles();

// Schema discovery function
const discoverSchemas = async () => {
  const schemas = [];
  
  // Known schema files in src/schemas/
  const srcSchemas = [
    'actor-definition.json',
    'dak-action-form.json', 
    'dak-config-form.json',
    'dak-selection-form.json',
    'organization-selection-form.json',
    'sushi-config.json'
  ];
  
  // Check for generated schemas in public/docs/schemas/
  const publicSchemas = [
    'generated-schemas-tjs.json',
    'generated-schemas-tsjsg.json'
  ];
  
  // Add src schemas
  for (const schema of srcSchemas) {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/schemas/${schema}`, { method: 'HEAD' });
      if (response.ok) {
        schemas.push({
          id: schema.replace('.json', ''),
          title: schema.replace('.json', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          file: schema,
          source: 'src/schemas',
          category: 'schemas'
        });
      }
    } catch (error) {
      // Schema file might not exist, continue
    }
  }
  
  // Add public schemas
  for (const schema of publicSchemas) {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/docs/schemas/${schema}`, { method: 'HEAD' });
      if (response.ok) {
        schemas.push({
          id: schema.replace('.json', ''),
          title: schema.replace('.json', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          file: schema,
          source: 'public/docs/schemas',
          category: 'schemas'
        });
      }
    } catch (error) {
      // Schema file might not exist, continue
    }
  }
  
  return schemas;
};

const DocumentationViewer = () => {
  const { docId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schemas, setSchemas] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Load schemas on component mount
  useEffect(() => {
    const loadSchemas = async () => {
      try {
        const discoveredSchemas = await discoverSchemas();
        setSchemas(discoveredSchemas);
      } catch (error) {
        console.warn('Error discovering schemas:', error);
      }
    };
    
    loadSchemas();
  }, []);

  // Update breadcrumbs based on current document
  useEffect(() => {
    const docInfo = docFiles[docId];
    const currentBreadcrumbs = [
      { label: t('documentation.navigation.home'), path: '/docs' }
    ];
    
    if (docInfo) {
      // Add category breadcrumb if not root
      if (docInfo.category && docInfo.category !== 'root') {
        currentBreadcrumbs.push({
          label: t(`documentation.categories.${docInfo.category}`, docInfo.category),
          path: `/docs/category/${docInfo.category}`
        });
      }
      
      // Add current document
      currentBreadcrumbs.push({
        label: docInfo.title,
        current: true
      });
    }
    
    setBreadcrumbs(currentBreadcrumbs);
  }, [docId, t]);

  useEffect(() => {
    const loadDocumentation = async () => {
      setLoading(true);
      setError(null);

      try {
        const docInfo = docFiles[docId] || docFiles['overview'];

        // Handle schema section
        if (docInfo.isSchemaSection) {
          const schemaContent = generateSchemasSectionContent();
          setContent(schemaContent);
          setLoading(false);
          return;
        }

        // For HTML files, open in a new tab to avoid navigation conflicts
        if (docInfo.isHtml) {
          // Check if file exists first
          try {
            const checkResponse = await fetch(`${process.env.PUBLIC_URL}/docs/${docInfo.file}`, { method: 'HEAD' });
            if (checkResponse.ok) {
              // File exists, open in new tab to avoid server conflicts
              window.open(`${process.env.PUBLIC_URL}/docs/${docInfo.file}`, '_blank');
              // Show message in current tab
              setContent(`# ${docInfo.title}\n\n${t('documentation.openedInNewTab')}\n\n${t('documentation.ifNotOpenedAutomatically')}: [${docInfo.file}](${process.env.PUBLIC_URL}/docs/${docInfo.file})`);
              setLoading(false);
              return;
            } else {
              // File doesn't exist, show helpful message
              setContent(`# ${docInfo.title}\n\n${t('documentation.generatedOnDeployment')}: [${docInfo.file}](/docs/${docInfo.file})\n\n${t('documentation.availableAfterDeployment')}`);
              setLoading(false);
              return;
            }
          } catch (htmlCheckError) {
            // If check fails, show helpful message
            setContent(`# ${docInfo.title}\n\n${t('documentation.generatedOnDeployment')}\n\n${t('documentation.availableAfterDeployment')}`);
            setLoading(false);
            return;
          }
        }

        // Fetch the markdown file from the docs folder
        const response = await fetch(`${process.env.PUBLIC_URL}/docs/${docInfo.file}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load documentation: ${response.status}`);
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error loading documentation:', err);
        setError(t('documentation.error'));
      } finally {
        setLoading(false);
      }
    };

    loadDocumentation();
  }, [docId, t]);

  // Generate content for schemas section
  const generateSchemasSectionContent = () => {
    let content = `# ${t('documentation.schemas.title')}\n\n${t('documentation.schemas.description')}\n\n`;
    
    if (schemas.length === 0) {
      content += `*${t('documentation.schemas.noSchemasFound')}*\n\n`;
    } else {
      content += '| ' + t('documentation.schemas.title') + ' | ' + 
                 t('documentation.schemas.source') + ' | ' + 
                 t('documentation.schemas.description_text') + ' |\n';
      content += '|---|---|---|\n';
      
      schemas.forEach(schema => {
        const sourceLink = schema.source === 'src/schemas' ? 
          `[${schema.file}](${process.env.PUBLIC_URL}/schemas/${schema.file})` :
          `[${schema.file}](${process.env.PUBLIC_URL}/docs/schemas/${schema.file})`;
        
        content += `| **${schema.title}** | ${sourceLink} | ${schema.source} |\n`;
      });
    }
    
    return content;
  };

  // Handle bookmark functionality
  const handleBookmark = () => {
    const docInfo = docFiles[docId];
    if (docInfo) {
      const context = {
        pageName: 'documentation',
        docId: docId,
        title: docInfo.title,
        path: location.pathname
      };
      
      if (bookmarkService.isBookmarked(location.pathname)) {
        bookmarkService.removeBookmark(location.pathname);
      } else {
        bookmarkService.addBookmark(
          docInfo.title,
          location.pathname,
          'documentation',
          context
        );
      }
    }
  };

  const renderMarkdown = (markdown) => {
    // Simple markdown to HTML conversion for basic formatting
    let html = markdown;

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

  if (loading) {
    return (
      <PageLayout 
        pageName="documentation-viewer"
        breadcrumbs={breadcrumbs}
      >
        <div className="doc-content-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('documentation.loading')}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout 
        pageName="documentation-viewer"
        breadcrumbs={breadcrumbs}
      >
        <div className="doc-content-container">
          <div className="error-state">
            <h2>{t('common.error')}</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              {t('documentation.tryAgain')}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      pageName="documentation-viewer"
      breadcrumbs={breadcrumbs}
    >
      <div className="doc-content-container">
        <div className="doc-sidebar">
          <h3>{t('documentation.title')}</h3>
          <nav className="doc-menu">
            {(() => {
              // Group files by category
              const grouped = {};
              Object.entries(docFiles).forEach(([key, doc]) => {
                if (!grouped[doc.category]) {
                  grouped[doc.category] = [];
                }
                grouped[doc.category].push({ key, ...doc });
              });

              // Sort within each category
              Object.keys(grouped).forEach(category => {
                grouped[category].sort((a, b) => a.title.localeCompare(b.title));
              });

              // Render sections
              return Object.entries(grouped)
                .sort(([a], [b]) => {
                  // Order: root, technical, user, workflows, schemas
                  const order = { root: 0, technical: 1, user: 2, workflows: 3, schemas: 4 };
                  return (order[a] || 99) - (order[b] || 99);
                })
                .map(([category, items]) => (
                  <div key={category} className="doc-category">
                    <div className="doc-category-header">
                      {t(`documentation.categories.${category}`, category.charAt(0).toUpperCase() + category.slice(1))}
                    </div>
                    {items.map(({ key, title }) => (
                      <button
                        key={key}
                        className={`doc-menu-item ${docId === key ? 'active' : ''}`}
                        onClick={() => navigate(`/docs/${key}`)}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                ));
            })()}
          </nav>
        </div>

        <div className="doc-main">
          <div className="doc-toolbar">
            <button 
              onClick={handleBookmark}
              className={`bookmark-btn ${bookmarkService.isBookmarked(location.pathname) ? 'bookmarked' : ''}`}
              title={t('documentation.navigation.bookmark')}
            >
              {bookmarkService.isBookmarked(location.pathname) ? '★' : '☆'} 
              {t('documentation.navigation.bookmark')}
            </button>
          </div>
          
          <article 
            className="doc-article"
            dangerouslySetInnerHTML={{ 
              __html: renderMarkdown(content)
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default DocumentationViewer;
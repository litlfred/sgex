import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLayout } from './framework';
import bookmarkService from '../services/bookmarkService';

// Enhanced documentation files structure with better subdirectory support
const generateDocFiles = () => {
  const files = {
    // Root documentation files
    'overview': { 
      file: 'README.md', 
      title: 'Documentation Overview', 
      category: 'root',
      path: 'README.md',
      breadcrumbs: ['Documentation']
    },
    'bpmn-integration': { 
      file: 'bpmn-integration.md', 
      title: 'BPMN Integration', 
      category: 'root',
      path: 'bpmn-integration.md',
      breadcrumbs: ['Documentation']
    },
    'dak-components': { 
      file: 'dak-components.md', 
      title: 'DAK Components', 
      category: 'root',
      path: 'dak-components.md',
      breadcrumbs: ['Documentation']
    },
    'decision-table-editor': { 
      file: 'decision-table-editor.md', 
      title: 'Decision Table Editor', 
      category: 'root',
      path: 'decision-table-editor.md',
      breadcrumbs: ['Documentation']
    },
    'framework-developer-guide': { 
      file: 'framework-developer-guide.md', 
      title: 'Framework Developer Guide', 
      category: 'root',
      path: 'framework-developer-guide.md',
      breadcrumbs: ['Documentation']
    },
    'page-framework': { 
      file: 'page-framework.md', 
      title: 'Page Framework', 
      category: 'root',
      path: 'page-framework.md',
      breadcrumbs: ['Documentation']
    },
    'page-inventory': { 
      file: 'page-inventory.md', 
      title: 'Page Inventory', 
      category: 'root',
      path: 'page-inventory.md',
      breadcrumbs: ['Documentation']
    },
    'project-plan': { 
      file: 'project-plan.md', 
      title: 'Project Plan', 
      category: 'root',
      path: 'project-plan.md',
      breadcrumbs: ['Documentation']
    },
    'qa-testing': { 
      file: 'qa-testing.md', 
      title: 'QA Testing', 
      category: 'root',
      path: 'qa-testing.md',
      breadcrumbs: ['Documentation']
    },
    'requirements': { 
      file: 'requirements.md', 
      title: 'Requirements', 
      category: 'root',
      path: 'requirements.md',
      breadcrumbs: ['Documentation']
    },
    'solution-architecture': { 
      file: 'solution-architecture.md', 
      title: 'Solution Architecture', 
      category: 'root',
      path: 'solution-architecture.md',
      breadcrumbs: ['Documentation']
    },
    'ui-styling-requirements': { 
      file: 'UI_STYLING_REQUIREMENTS.md', 
      title: 'UI Styling Requirements', 
      category: 'root',
      path: 'UI_STYLING_REQUIREMENTS.md',
      breadcrumbs: ['Documentation']
    },
    'who-cors-workaround': { 
      file: 'WHO_CORS_WORKAROUND.md', 
      title: 'WHO CORS Workaround', 
      category: 'root',
      path: 'WHO_CORS_WORKAROUND.md',
      breadcrumbs: ['Documentation']
    },
    
    // Workflows subdirectory
    'workflows': {
      title: 'Workflows',
      category: 'workflows',
      isDirectory: true,
      breadcrumbs: ['Documentation', 'Workflows']
    },
    'workflows-overview': { 
      file: 'workflows/README.md', 
      title: 'Workflows Overview', 
      category: 'workflows',
      path: 'workflows/README.md',
      breadcrumbs: ['Documentation', 'Workflows']
    },
    
    // JSON Schemas directory and files  
    'schemas': {
      title: 'JSON Schemas',
      category: 'schemas',
      isDirectory: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    'schemas-overview': {
      file: 'schemas/README.md',
      title: 'Schemas Overview',
      category: 'schemas',
      path: 'schemas/README.md',
      isVirtual: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    'generated-schemas-tjs': {
      file: 'schemas/generated-schemas-tjs.json',
      title: 'TypeScript JSON Schema',
      category: 'schemas',
      path: 'schemas/generated-schemas-tjs.json',
      isJson: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    'generated-schemas-tsjsg': {
      file: 'schemas/generated-schemas-tsjsg.json',
      title: 'TS JSON Schema Generator',
      category: 'schemas',
      path: 'schemas/generated-schemas-tsjsg.json',
      isJson: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    
    // Source schemas from src/schemas
    'actor-definition-schema': {
      title: 'Actor Definition Schema',
      category: 'schemas', 
      path: 'schemas/actor-definition.json',
      isSourceSchema: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    'dak-action-form-schema': {
      title: 'DAK Action Form Schema',
      category: 'schemas',
      path: 'schemas/dak-action-form.json', 
      isSourceSchema: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    'dak-config-form-schema': {
      title: 'DAK Configuration Form Schema',
      category: 'schemas',
      path: 'schemas/dak-config-form.json',
      isSourceSchema: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    'dak-selection-form-schema': {
      title: 'DAK Selection Form Schema', 
      category: 'schemas',
      path: 'schemas/dak-selection-form.json',
      isSourceSchema: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    'organization-selection-form-schema': {
      title: 'Organization Selection Form Schema',
      category: 'schemas',
      path: 'schemas/organization-selection-form.json',
      isSourceSchema: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    'sushi-config-schema': {
      title: 'SUSHI Configuration Schema',
      category: 'schemas',
      path: 'schemas/sushi-config.json',
      isSourceSchema: true,
      breadcrumbs: ['Documentation', 'Schemas']
    },
    
    // Additional documentation files that might exist
    'asset-management': {
      file: 'asset-management.md',
      title: 'Asset Management',
      category: 'root',
      path: 'asset-management.md',
      breadcrumbs: ['Documentation']
    },
    'bookmark-system': {
      file: 'bookmark-system.md',
      title: 'Bookmark System',
      category: 'root',
      path: 'bookmark-system.md',
      breadcrumbs: ['Documentation']
    },
    'compliance-framework': {
      file: 'compliance-framework.md',
      title: 'Compliance Framework',
      category: 'root',
      path: 'compliance-framework.md',
      breadcrumbs: ['Documentation']
    }
  };

  return files;
};

const docFiles = generateDocFiles();

const DocumentationViewer = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState('');

  // Generate breadcrumbs for documentation navigation
  const generateDocBreadcrumbs = () => {
    if (!docId || docId === 'overview') {
      return [{ label: t('navigation.documentation'), current: true }];
    }

    const docInfo = docFiles[docId];
    if (!docInfo || !docInfo.breadcrumbs) {
      return [{ label: t('navigation.documentation'), current: true }];
    }

    const breadcrumbs = [];
    
    // Build breadcrumbs from the predefined breadcrumb array
    docInfo.breadcrumbs.forEach((crumbLabel, index) => {
      if (index === 0) {
        // First breadcrumb is always Documentation root
        breadcrumbs.push({
          label: t('navigation.documentation'),
          path: '/docs',
          onClick: () => navigate('/docs')
        });
      } else {
        // Build path for intermediate breadcrumbs
        const path = `/docs/${crumbLabel.toLowerCase()}`;
        breadcrumbs.push({
          label: t(`documentation.categories.${crumbLabel.toLowerCase()}`, crumbLabel),
          path: path,
          onClick: () => navigate(path)
        });
      }
    });

    // Add current page as final breadcrumb
    if (breadcrumbs.length === 0 || breadcrumbs[breadcrumbs.length - 1].label !== docInfo.title) {
      breadcrumbs.push({
        label: docInfo.title,
        current: true
      });
    }

    return breadcrumbs;
  };

  // Add bookmark functionality
  const handleBookmark = () => {
    const currentUrl = location.pathname;
    const docInfo = docFiles[docId] || docFiles['overview'];
    
    bookmarkService.addBookmark(
      'Documentation',
      currentUrl,
      {
        asset: docInfo.title,
        user: 'sgex',
        repository: 'documentation',
        branch: 'main'
      }
    );
  };

  useEffect(() => {
    const loadDocumentation = async () => {
      setLoading(true);
      setError(null);

      try {
        const docInfo = docFiles[docId] || docFiles['overview'];
        setCurrentPath(docInfo.path || '');

        // Handle virtual schema overview
        if (docInfo.isVirtual && docId === 'schemas-overview') {
          const schemaOverview = `# JSON Schemas

This section contains the JSON schemas used throughout the SGEX Workbench system.

## Available Schemas

### Generated Schemas
These schemas are automatically generated from TypeScript types during the build process:

- **[TypeScript JSON Schema](./generated-schemas-tjs)**: Generated using typescript-json-schema tool
- **[TS JSON Schema Generator](./generated-schemas-tsjsg)**: Generated using ts-json-schema-generator tool

### Source Schemas
The source schemas are located in \`/src/schemas/\` and include:

- **Actor Definition Schema**: Defines the structure for WHO SMART Guidelines actors and personas
- **DAK Action Form Schema**: Schema for DAK action selection forms
- **DAK Configuration Schema**: Configuration schema for Digital Adaptation Kits
- **DAK Selection Form Schema**: Schema for DAK repository selection forms
- **Organization Selection Form Schema**: Schema for GitHub organization selection
- **SUSHI Configuration Schema**: Schema for FHIR Implementation Guide SUSHI configuration

## Schema Usage

These schemas define the data structures and validation rules used throughout the application for:

- **Form Validation**: Ensuring user input meets required format and constraints
- **API Contracts**: Defining data exchange formats with external services
- **Data Modeling**: Establishing consistent data structures across components
- **Runtime Validation**: Validating data integrity during application execution

## Schema Development

Schemas are developed using JSON Schema Draft 7 specification and follow WHO SMART Guidelines naming conventions and data modeling best practices.

For more information about schema development, see the [Framework Developer Guide](../framework-developer-guide).
`;
          setContent(schemaOverview);
          setLoading(false);
          return;
        }

        // Handle source schema files from /src/schemas
        if (docInfo.isSourceSchema) {
          try {
            // Source schemas are served from /src/schemas but need to be imported
            const schemaPath = docInfo.path.replace('schemas/', '');
            const response = await import(`../schemas/${schemaPath}`);
            const schemaData = response.default || response;
            const formattedJson = JSON.stringify(schemaData, null, 2);
            setContent(`# ${docInfo.title}\n\n\`\`\`json\n${formattedJson}\n\`\`\``);
            setLoading(false);
            return;
          } catch (sourceSchemaError) {
            console.error('Error loading source schema:', sourceSchemaError);
            setContent(`# ${docInfo.title}\n\nThis schema file is part of the source code and defines the data structure for ${docInfo.title.toLowerCase()}.\n\nThe schema can be found at: \`/src/schemas/${docInfo.path.replace('schemas/', '')}\``);
            setLoading(false);
            return;
          }
        }

        // Handle JSON schema files
        if (docInfo.isJson) {
          try {
            const response = await fetch(`${process.env.PUBLIC_URL}/docs/${docInfo.file}`);
            if (!response.ok) {
              throw new Error(`Schema file not found: ${response.status}`);
            }
            const jsonData = await response.json();
            const formattedJson = JSON.stringify(jsonData, null, 2);
            setContent(`# ${docInfo.title}\n\n\`\`\`json\n${formattedJson}\n\`\`\``);
            setLoading(false);
            return;
          } catch (jsonError) {
            // If public schema doesn't exist, show helpful message
            setContent(`# ${docInfo.title}\n\nThis schema file is generated during the build process and may not be available in development mode.\n\nThe schema will be available after running:\n\`\`\`bash\nnpm run generate-schemas\n\`\`\``);
            setLoading(false);
            return;
          }
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
              setContent(`# ${docInfo.title}\n\n${t('documentation.openedInNewTab')}\n\n${t('documentation.accessDirectly')}: [${docInfo.file}](${process.env.PUBLIC_URL}/docs/${docInfo.file})`);
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
        setError(t('documentation.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadDocumentation();
  }, [docId, t]);

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
        customBreadcrumbs={generateDocBreadcrumbs()}
      >
        <div className="documentation-viewer">
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout 
        pageName="documentation-viewer"
        customBreadcrumbs={generateDocBreadcrumbs()}
      >
        <div className="documentation-viewer">
          <div className="error-state">
            <h2>{t('common.error')}</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      pageName="documentation-viewer"
      customBreadcrumbs={generateDocBreadcrumbs()}
    >
      <div className="documentation-viewer">
        <div className="doc-content">
          <div className="doc-sidebar">
            <div className="doc-sidebar-header">
              <h3>{t('navigation.documentation')}</h3>
              <button 
                className="bookmark-btn"
                onClick={handleBookmark}
                title={t('common.bookmark')}
              >
                ⭐
              </button>
            </div>
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
                    const order = ['root', 'workflows', 'schemas'];
                    const aIndex = order.indexOf(a);
                    const bIndex = order.indexOf(b);
                    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    return a.localeCompare(b);
                  })
                  .map(([category, items]) => (
                    <div key={category} className="doc-category">
                      {category !== 'root' && (
                        <div className="doc-category-header">
                          {t(`documentation.categories.${category}`, category.charAt(0).toUpperCase() + category.slice(1))}
                        </div>
                      )}
                      {items.map(({ key, title, isDirectory }) => (
                        <button
                          key={key}
                          className={`doc-menu-item ${docId === key ? 'active' : ''} ${category !== 'root' ? 'doc-menu-item-nested' : ''} ${isDirectory ? 'doc-menu-directory' : ''}`}
                          onClick={() => {
                            if (isDirectory) {
                              // For directories, navigate to the first file in that directory or a default overview
                              const overviewKey = `${key}-overview`;
                              if (docFiles[overviewKey]) {
                                navigate(`/docs/${overviewKey}`);
                              } else {
                                // Find first file in this category
                                const firstFile = items.find(item => !item.isDirectory);
                                if (firstFile) {
                                  navigate(`/docs/${firstFile.key}`);
                                }
                              }
                            } else {
                              navigate(`/docs/${key}`);
                            }
                          }}
                        >
                          {isDirectory && <span className="directory-icon">📁 </span>}
                          {title}
                        </button>
                      ))}
                    </div>
                  ));
              })()}
            </nav>
          </div>

          <div className="doc-main">
            <article 
              className="doc-article"
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
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from './framework';
import { sanitizeMarkdown } from '../utils/securityUtils';

// Dynamically generate documentation files structure
const generateDocFiles = () => {

  const files = {
    'overview': { file: 'README.md', title: 'Documentation Overview', category: 'root' },
    'bpmn-integration': { file: 'bpmn-integration.md', title: 'BPMN Integration', category: 'root' },
    'dak-components': { file: 'dak-components.md', title: 'DAK Components', category: 'root' },
    'decision-table-editor': { file: 'decision-table-editor.md', title: 'Decision Table Editor', category: 'root' },
    'framework-developer-guide': { file: 'framework-developer-guide.md', title: 'Framework Developer Guide', category: 'root' },
    'page-framework': { file: 'page-framework.md', title: 'Page Framework', category: 'root' },
    'page-inventory': { file: 'page-inventory.md', title: 'Page Inventory', category: 'root' },
    'project-plan': { file: 'project-plan.md', title: 'Project Plan', category: 'root' },
    'qa-testing': { file: 'qa-testing.md', title: 'QA Testing', category: 'root' },
    'requirements': { file: 'requirements.md', title: 'Requirements', category: 'root' },
    'solution-architecture': { file: 'solution-architecture.md', title: 'Solution Architecture', category: 'root' },
    'ui-styling-requirements': { file: 'UI_STYLING_REQUIREMENTS.md', title: 'UI Styling Requirements', category: 'root' },
    'who-cors-workaround': { file: 'WHO_CORS_WORKAROUND.md', title: 'WHO CORS Workaround', category: 'root' },
    'workflows-overview': { file: 'workflows/README.md', title: 'Workflows Overview', category: 'workflows' }
  };

  return files;
};

const docFiles = generateDocFiles();

const DocumentationViewer = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDocumentation = async () => {
      setLoading(true);
      setError(null);

      try {
        const docInfo = docFiles[docId] || docFiles['overview'];

        // For HTML files, open in a new tab to avoid navigation conflicts
        if (docInfo.isHtml) {
          // Check if file exists first
          try {
            const checkResponse = await fetch(`${process.env.PUBLIC_URL}/docs/${docInfo.file}`, { method: 'HEAD' });
            if (checkResponse.ok) {
              // File exists, open in new tab to avoid server conflicts
              window.open(`${process.env.PUBLIC_URL}/docs/${docInfo.file}`, '_blank');
              // Show message in current tab
              setContent(`# ${docInfo.title}\n\nThe QA report has been opened in a new tab.\n\nIf it didn't open automatically, you can access it here: [${docInfo.file}](${process.env.PUBLIC_URL}/docs/${docInfo.file})`);
              setLoading(false);
              return;
            } else {
              // File doesn't exist, show helpful message
              setContent(`# ${docInfo.title}\n\nThe QA report is generated during deployment and is available on the live site at: [${docInfo.file}](/docs/${docInfo.file})\n\nIf you're viewing this locally, the report will be available after the next deployment to GitHub Pages.`);
              setLoading(false);
              return;
            }
          } catch (htmlCheckError) {
            // If check fails, show helpful message
            setContent(`# ${docInfo.title}\n\nThe QA report is generated during deployment and is available on the live site.\n\nIf you're viewing this locally, the report will be available after the next deployment to GitHub Pages.`);
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
        setError('Failed to load documentation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadDocumentation();
  }, [docId]);

  if (loading) {
    return (
      <PageLayout pageName="documentation-viewer">
        <div className="documentation-viewer">
          <div className="doc-content">
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading documentation...</p>
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
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="documentation-viewer">
      <div className="documentation-viewer">
        <div className="doc-content">
        <div className="doc-sidebar">
          <h3>Documentation</h3>
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
                .sort(([a], [b]) => a === 'root' ? -1 : b === 'root' ? 1 : a.localeCompare(b))
                .map(([category, items]) => (
                  <div key={category} className="doc-category">
                    {category !== 'root' && (
                      <div className="doc-category-header">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </div>
                    )}
                    {items.map(({ key, title }) => (
                      <button
                        key={key}
                        className={`doc-menu-item ${docId === key ? 'active' : ''} ${category !== 'root' ? 'doc-menu-item-nested' : ''}`}
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
          <article 
            className="doc-article"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeMarkdown(content)
            }}
          />
        </div>
      </div>
      
      </div>
    </PageLayout>
  );
};

export default DocumentationViewer;
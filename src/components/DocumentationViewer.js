import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from './framework';
import './DocumentationViewer.css';

// Map of available documentation files
const docFiles = {
  'overview': { file: 'README.md', title: 'Documentation Overview' },
  'dak-components': { file: 'dak-components.md', title: 'DAK Components' },
  'requirements': { file: 'requirements.md', title: 'Requirements' },
  'architecture': { file: 'solution-architecture.md', title: 'Solution Architecture' },
  'project-plan': { file: 'project-plan.md', title: 'Project Plan' },
  'bpmn-integration': { file: 'bpmn-integration.md', title: 'BPMN Integration' },
  'qa-report': { file: 'qa-report.html', title: 'QA Report', isHtml: true },
  'issues-analysis': { file: 'github-issues-analysis.md', title: 'GitHub Issues Analysis' }
};

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

  const handleBack = () => {
    navigate(-1);
  };

  const handleHomeNavigation = () => {
    navigate('/');
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
      <div className="documentation-viewer">
        <div className="doc-header">
          <div className="who-branding">
            <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
            <p className="subtitle">WHO SMART Guidelines Exchange</p>
          </div>
          <button onClick={handleBack} className="back-btn">
            ← Back
          </button>
        </div>
        <div className="doc-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading documentation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documentation-viewer">
        <div className="doc-header">
          <div className="who-branding">
            <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
            <p className="subtitle">WHO SMART Guidelines Exchange</p>
          </div>
          <button onClick={handleBack} className="back-btn">
            ← Back
          </button>
        </div>
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
    );
  }

  return (
    <PageLayout pageName="documentation-viewer">
      <div className="documentation-viewer">
        <div className="doc-content">
          <div className="doc-sidebar">
          <h3>Documentation</h3>
          <nav className="doc-menu">
            {Object.entries(docFiles).map(([key, doc]) => (
              <button
                key={key}
                className={`doc-menu-item ${docId === key ? 'active' : ''}`}
                onClick={() => navigate(`/docs/${key}`)}
              >
                {doc.title}
              </button>
            ))}
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
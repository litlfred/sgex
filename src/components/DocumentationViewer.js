import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DocumentationViewer.css';

// Map of available documentation files
const docFiles = {
  'overview': { file: 'README.md', title: 'Documentation Overview' },
  'dak-components': { file: 'dak-components.md', title: 'DAK Components' },
  'requirements': { file: 'requirements.md', title: 'Requirements' },
  'architecture': { file: 'solution-architecture.md', title: 'Solution Architecture' },
  'project-plan': { file: 'project-plan.md', title: 'Project Plan' },
  'bpmn-integration': { file: 'bpmn-integration.md', title: 'BPMN Integration' }
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
    return markdown
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
    <div className="documentation-viewer">
      <div className="doc-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="doc-nav">
          <select 
            value={docId} 
            onChange={(e) => navigate(`/docs/${e.target.value}`)}
            className="doc-selector"
          >
            {Object.entries(docFiles).map(([key, doc]) => (
              <option key={key} value={key}>{doc.title}</option>
            ))}
          </select>
          <button onClick={handleBack} className="back-btn">
            ← Back
          </button>
        </div>
      </div>

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
  );
};

export default DocumentationViewer;
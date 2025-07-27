import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ContextualHelpMascot from './ContextualHelpMascot';
import WHODigitalLibrary from './WHODigitalLibrary';
import './ComponentEditor.css';

const ComponentEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedReferences, setSelectedReferences] = useState([]);
  
  const { profile, repository, component } = location.state || {};

  const handleReferencesChange = useCallback((references) => {
    setSelectedReferences(references);
  }, []);

  const handleHomeNavigation = () => {
    navigate('/');
  };

  if (!profile || !repository || !component) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  // Render WHO Digital Library for health-interventions component
  if (component.id === 'health-interventions') {
    return (
      <div className="component-editor">
        <div className="editor-header">
          <div className="who-branding">
            <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
            <p className="subtitle">WHO SMART Guidelines Exchange</p>
          </div>
          <div className="context-info">
            <img 
              src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
              alt="Profile" 
              className="context-avatar" 
            />
            <div className="context-details">
              <span className="context-repo">{repository.name}</span>
              <span className="context-component">{component.name}</span>
            </div>
          </div>
        </div>

        <div className="editor-content">
          <div className="breadcrumb">
            <button onClick={() => navigate('/')} className="breadcrumb-link">
              Select Profile
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={() => navigate('/repositories', { state: { profile } })} className="breadcrumb-link">
              Select Repository
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={() => navigate('/dashboard', { state: { profile, repository } })} className="breadcrumb-link">
              DAK Components
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{component.name}</span>
          </div>

          <div className="editor-main">
            <div className="component-intro">
              <div className="component-icon" style={{ color: component.color }}>
                {component.icon}
              </div>
              <div className="intro-content">
                <h2>{component.name}</h2>
                <p>
                  Manage clinical guidelines and health intervention specifications by searching and selecting 
                  publications from digital libraries. References are stored using Dublin Core metadata standards.
                </p>
                <div className="component-info">
                  <div className="info-item">
                    <strong>Connected Library:</strong> WHO Digital Library (IRIS)
                  </div>
                  <div className="info-item">
                    <strong>Metadata Standard:</strong> Dublin Core
                  </div>
                  <div className="info-item">
                    <strong>Storage:</strong> Client-side (localStorage)
                  </div>
                  <div className="info-item">
                    <strong>References Selected:</strong> {selectedReferences.length}
                  </div>
                </div>
              </div>
            </div>

            <WHODigitalLibrary onReferencesChange={handleReferencesChange} />
          </div>
        </div>
        
        <ContextualHelpMascot 
          pageId="health-interventions-editor"
          contextData={{ 
            profile, 
            repository, 
            component,
            selectedReferencesCount: selectedReferences.length 
          }}
        />
      </div>
    );
  }

  return (
    <div className="component-editor">
      <div className="editor-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="context-info">
          <img 
            src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
            alt="Profile" 
            className="context-avatar" 
          />
          <div className="context-details">
            <span className="context-repo">{repository.name}</span>
            <span className="context-component">{component.name}</span>
          </div>
        </div>
      </div>

      <div className="editor-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/repositories', { state: { profile } })} className="breadcrumb-link">
            Select Repository
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/dashboard', { state: { profile, repository } })} className="breadcrumb-link">
            DAK Components
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{component.name}</span>
        </div>

        <div className="editor-main">
          <div className="editor-placeholder">
            <div className="component-icon" style={{ color: component.color }}>
              {component.icon}
            </div>
            <h2>{component.name} Editor</h2>
            <p>
              This is where the {component.name.toLowerCase()} editor will be implemented. 
              The editor will support {component.fileTypes.join(', ')} files and provide 
              specialized tools for {component.description.toLowerCase()}.
            </p>
            
            <div className="component-info">
              <div className="info-item">
                <strong>Component Type:</strong> {component.type}
              </div>
              <div className="info-item">
                <strong>File Types:</strong> {component.fileTypes.join(', ')}
              </div>
              <div className="info-item">
                <strong>Repository:</strong> {repository.name}
              </div>
            </div>

            <div className="placeholder-actions">
              <button 
                className="action-btn primary"
                onClick={() => alert('File browser functionality coming soon!')}
              >
                Browse Files
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => alert('Create new file functionality coming soon!')}
              >
                Create New File
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ContextualHelpMascot 
        pageId="component-editor"
        contextData={{ profile, repository, component }}
      />
    </div>
  );
};

export default ComponentEditor;
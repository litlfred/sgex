import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ContextualHelpMascot from './ContextualHelpMascot';
import WHODigitalLibrary from './WHODigitalLibrary';
import './ComponentEditor.css';

const ComponentEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [selectedReferences, setSelectedReferences] = useState([]);
  
  const { profile, repository, component } = location.state || {};

  // Determine component from route or state
  let currentComponent = component;
  
  // Handle direct access to editor-health-interventions route
  if (location.pathname === '/sgex/editor-health-interventions' && !component) {
    currentComponent = { id: 'health-interventions', name: 'Health Interventions' };
  } else if (params.componentId && !component) {
    currentComponent = { id: params.componentId, name: params.componentId };
  }

  const handleReferencesChange = useCallback((references) => {
    setSelectedReferences(references);
  }, []);

  const handleHomeNavigation = () => {
    navigate('/');
  };

  // For health-interventions, we can work without full context for now
  if (!profile || !repository) {
    if (currentComponent?.id === 'health-interventions') {
      // Allow access to health-interventions editor without full context
      // Use placeholder data for now
      const placeholderProfile = { login: 'demo-user', avatar_url: '/sgex/sgex-mascot.png', name: 'Demo User' };
      const placeholderRepo = { name: 'demo-repository' };
      
      return (
        <div className="component-editor">
          <div className="editor-header">
            <div className="who-branding">
              <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
              <p className="subtitle">WHO SMART Guidelines Exchange</p>
            </div>
            <div className="context-info">
              <img 
                src={placeholderProfile.avatar_url} 
                alt="Profile" 
                className="context-avatar" 
              />
              <div className="context-details">
                <span className="context-repo">{placeholderRepo.name}</span>
                <span className="context-component">{currentComponent.name}</span>
              </div>
            </div>
          </div>

          <div className="editor-content">
            <WHODigitalLibrary 
              onReferencesChange={handleReferencesChange}
              selectedReferences={selectedReferences}
            />
          </div>
          
          <ContextualHelpMascot />
        </div>
      );
    } else {
      navigate('/');
      return <div>Redirecting...</div>;
    }
  }

  // Render WHO Digital Library for health-interventions component
  if (currentComponent?.id === 'health-interventions') {
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
              <span className="context-component">{currentComponent.name}</span>
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
            <span className="breadcrumb-current">{currentComponent.name}</span>
          </div>

          <div className="editor-main">
            <div className="component-intro">
              <div className="component-icon" style={{ color: currentComponent.color }}>
                {currentComponent.icon}
              </div>
              <div className="intro-content">
                <h2>{currentComponent.name}</h2>
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
        
        <ContextualHelpMascot />
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
            <span className="context-component">{currentComponent.name}</span>
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
          <span className="breadcrumb-current">{currentComponent.name}</span>
        </div>

        <div className="editor-main">
          <div className="editor-placeholder">
            <div className="component-icon" style={{ color: currentComponent.color }}>
              {currentComponent.icon}
            </div>
            <h2>{currentComponent.name} Editor</h2>
            <p>
              This is where the {currentComponent.name?.toLowerCase()} editor will be implemented. 
              The editor will support {currentComponent.fileTypes?.join(', ') || 'various'} files and provide 
              specialized tools for {currentComponent.description?.toLowerCase() || 'component editing'}.
            </p>
            
            <div className="component-info">
              <div className="info-item">
                <strong>Component Type:</strong> {currentComponent.type || 'Editor'}
              </div>
              <div className="info-item">
                <strong>File Types:</strong> {currentComponent.fileTypes?.join(', ') || 'Various formats'}
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
      
      <ContextualHelpMascot />
    </div>
  );
};

export default ComponentEditor;
import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageLayout, usePageParams } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import WHODigitalLibrary from './WHODigitalLibrary';
import useThemeImage from '../hooks/useThemeImage';
import './ComponentEditor.css';

const ComponentEditor = () => {
  const location = useLocation();
  
  // Handle health-interventions routes with PageLayout framework
  if (location.pathname.includes('/health-interventions/')) {
    return (
      <PageLayout pageName="health-interventions">
        <HealthInterventionsEditor />
      </PageLayout>
    );
  }
  
  // For other routes, use existing logic
  return <ComponentEditorContent />;
};

const HealthInterventionsEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { params } = usePageParams();
  const [selectedReferences, setSelectedReferences] = useState([]);
  
  // Theme-aware mascot image for fallback avatar
  const mascotImage = useThemeImage('sgex-mascot.png');
  
  // Get data from URL params or location state
  const { profile, repository } = location.state || {};
  const user = params?.user;
  const repo = params?.repo;
  
  const currentComponent = { id: 'health-interventions', name: 'Health Interventions' };

  const handleReferencesChange = useCallback((references) => {
    setSelectedReferences(references);
  }, []);

  const handleHomeNavigation = () => {
    navigate('/');
  };

  // Render WHO Digital Library for health-interventions component
  return (
    <div className="component-editor">
      <div className="editor-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="context-info">
          <img 
            src={profile?.avatar_url || user ? `https://github.com/${user}.png` : mascotImage} 
            alt="Profile" 
            className="context-avatar" 
          />
          <div className="context-details">
            <span className="context-repo">{repository?.name || repo || 'Repository'}</span>
            <span className="context-component">{currentComponent.name}</span>
          </div>
          <a href="/sgex/docs/overview" className="nav-link">📖 Documentation</a>
        </div>
      </div>

      <div className="editor-content">
        <WHODigitalLibrary 
          onReferencesChange={handleReferencesChange}
          selectedReferences={selectedReferences}
        />
      </div>
      
      <ContextualHelpMascot 
        pageId="health-interventions-editor"
        contextData={{ 
          profile: profile || { login: user }, 
          repository: repository || { name: repo }, 
          component: currentComponent,
          selectedReferencesCount: selectedReferences.length 
        }}
      />
    </div>
  );
};

const ComponentEditorContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { params } = usePageParams();
  const [selectedReferences, setSelectedReferences] = useState([]);
  
  // Theme-aware mascot image for fallback avatar
  const mascotImage = useThemeImage('sgex-mascot.png');
  
  const { profile, repository, component } = location.state || {};

  // Determine component from route or state
  let currentComponent = component;
  
  // Handle direct access to editor-health-interventions route (legacy)
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

  // For legacy editor-health-interventions route, allow access without full context
  if (!profile || !repository) {
    if (currentComponent?.id === 'health-interventions') {
      // Allow access to health-interventions editor without full context
      // Use placeholder data for now
      const placeholderProfile = { login: 'demo-user', avatar_url: mascotImage, name: 'Demo User' };
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
              <a href="/sgex/docs/overview" className="nav-link">📖 Documentation</a>
            </div>
          </div>

          <div className="editor-content">
            <WHODigitalLibrary 
              onReferencesChange={handleReferencesChange}
              selectedReferences={selectedReferences}
            />
          </div>
          
          <ContextualHelpMascot 
            pageId="component-editor"
            contextData={{ component: currentComponent }}
          />
        </div>
      );
    } else {
      navigate('/');
      return <div>Redirecting...</div>;
    }
  }

  return (
    <PageLayout pageName="component-editor">
      <div className="component-editor">
      <div className="editor-content">

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
      </div>
    </PageLayout>
  );
};

export default ComponentEditor;
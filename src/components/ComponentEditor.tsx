import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageLayout, usePageParams } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import WHODigitalLibrary from './WHODigitalLibrary';
import useThemeImage from '../hooks/useThemeImage';

interface Profile {
  login: string;
  name?: string;
  avatar_url?: string;
  type?: string;
}

interface Repository {
  name: string;
  description?: string;
}

interface Component {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  fileTypes?: string[];
  type?: string;
  description?: string;
}

interface LocationState {
  profile?: Profile;
  repository?: Repository;
  component?: Component;
}

const ComponentEditor: React.FC = () => {
  const location = useLocation();
  
  const isHealthInterventions = location.pathname.includes('/health-interventions/');
  
  return (
    <PageLayout pageName="component-editor">
      {isHealthInterventions ? (
        <HealthInterventionsEditor />
      ) : (
        <ComponentEditorContent />
      )}
    </PageLayout>
  );
};

const HealthInterventionsEditor: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { params } = usePageParams();
  const [selectedReferences, setSelectedReferences] = useState<any[]>([]);
  
  // Theme-aware mascot image for fallback avatar
  const mascotImage = useThemeImage('sgex-mascot.png');
  
  // Get data from URL params or location state
  const { profile, repository } = (location.state as LocationState) || {};
  const user = params?.user;
  const repo = params?.repo;
  
  const currentComponent: Component = { id: 'health-interventions', name: 'Health Interventions' };

  const handleReferencesChange = useCallback((references: any[]) => {
    setSelectedReferences(references);
  }, []);

  const handleHomeNavigation = (): void => {
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
        </div>
      </div>

      <div className="editor-content">
        <WHODigitalLibrary 
          onReferencesChange={handleReferencesChange}
        />
      </div>
      
      <ContextualHelpMascot 
        pageId="health-interventions-editor"
        helpContent={null}
        contextData={{ 
          profile: profile || { login: user || 'unknown' }, 
          repository: repository || { name: repo || 'unknown' }, 
          component: currentComponent,
          selectedReferencesCount: selectedReferences.length 
        }}
      />
    </div>
  );
};

const ComponentEditorContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { params } = usePageParams();
  const [selectedReferences, setSelectedReferences] = useState<any[]>([]);
  
  // Theme-aware mascot image for fallback avatar
  const mascotImage = useThemeImage('sgex-mascot.png');
  
  const { profile, repository, component } = (location.state as LocationState) || {};

  // Determine component from route or state
  let currentComponent = component;
  
  // Handle direct access to editor-health-interventions route (legacy)
  if (location.pathname === '/sgex/editor-health-interventions' && !component) {
    currentComponent = { id: 'health-interventions', name: 'Health Interventions' };
  } else if (params.componentId && !component) {
    currentComponent = { id: params.componentId, name: params.componentId };
  }

  const handleReferencesChange = useCallback((references: any[]) => {
    setSelectedReferences(references);
  }, []);

  const handleHomeNavigation = (): void => {
    navigate('/');
  };

  // For legacy editor-health-interventions route, allow access without full context
  if (!profile || !repository) {
    if (currentComponent?.id === 'health-interventions') {
      // Allow access to health-interventions editor without full context
      // Use placeholder data for now
      const placeholderProfile: Profile = { login: 'demo-user', avatar_url: mascotImage, name: 'Demo User' };
      const placeholderRepo: Repository = { name: 'demo-repository' };
      
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
            />
          </div>
          
          <ContextualHelpMascot 
            pageId="component-editor"
            helpContent={null}
            contextData={{ component: currentComponent }}
          />
        </div>
      );
    } else {
      navigate('/');
      return <div>Redirecting...</div>;
    }
  }

  // Safety check for currentComponent
  if (!currentComponent) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
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
  );
};

export default ComponentEditor;

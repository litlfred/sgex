import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ComponentEditor.css';

const ComponentEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, repository, component } = location.state || {};

  if (!profile || !repository || !component) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <div className="component-editor">
      <div className="editor-header">
        <div className="who-branding">
          <h1>SGEX Workbench</h1>
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
    </div>
  );
};

export default ComponentEditor;
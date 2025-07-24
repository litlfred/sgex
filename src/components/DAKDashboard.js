import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DAKDashboard.css';

const DAKDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, repository } = location.state || {};

  // Define the 8 DAK components based on WHO SMART Guidelines structure
  const dakComponents = [
    {
      id: 'business-processes',
      name: 'Business Processes',
      description: 'BPMN workflows and business process definitions',
      icon: '🔄',
      type: 'Level 2',
      color: '#0078d4',
      fileTypes: ['BPMN', 'XML'],
      count: 12
    },
    {
      id: 'decision-support',
      name: 'Decision Support Logic',
      description: 'DMN decision tables and clinical decision support',
      icon: '🎯',
      type: 'Level 2',
      color: '#107c10',
      fileTypes: ['DMN', 'XML'],
      count: 8
    },
    {
      id: 'indicators',
      name: 'Indicators & Measures',
      description: 'Performance indicators and measurement definitions',
      icon: '📊',
      type: 'Level 2',
      color: '#881798',
      fileTypes: ['JSON', 'XML'],
      count: 15
    },
    {
      id: 'forms',
      name: 'Data Entry Forms',
      description: 'Structured data collection forms and questionnaires',
      icon: '📋',
      type: 'Level 2',
      color: '#d13438',
      fileTypes: ['JSON', 'XML'],
      count: 24
    },
    {
      id: 'terminology',
      name: 'Terminology',
      description: 'Code systems, value sets, and concept maps',
      icon: '🏷️',
      type: 'Level 3',
      color: '#ff8c00',
      fileTypes: ['JSON', 'XML'],
      count: 156
    },
    {
      id: 'profiles',
      name: 'FHIR Profiles',
      description: 'FHIR resource profiles and structure definitions',
      icon: '🔧',
      type: 'Level 3',
      color: '#00bcf2',
      fileTypes: ['JSON', 'XML'],
      count: 42
    },
    {
      id: 'extensions',
      name: 'FHIR Extensions',
      description: 'Custom FHIR extensions and data elements',
      icon: '🧩',
      type: 'Level 3',
      color: '#498205',
      fileTypes: ['JSON', 'XML'],
      count: 18
    },
    {
      id: 'examples',
      name: 'Test Data & Examples',
      description: 'Sample data and test cases for validation',
      icon: '🧪',
      type: 'Level 3',
      color: '#6b69d6',
      fileTypes: ['JSON', 'XML'],
      count: 67
    }
  ];

  const handleComponentClick = (component) => {
    // Navigate to component-specific editor
    navigate(`/editor/${component.id}`, {
      state: {
        profile,
        repository,
        component
      }
    });
  };

  const handleBackToRepos = () => {
    navigate('/repositories', { state: { profile } });
  };

  if (!profile || !repository) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <div className="dak-dashboard">
      <div className="dashboard-header">
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
            <span className="context-owner">@{profile.login}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBackToRepos} className="breadcrumb-link">
            Select Repository
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">DAK Components</span>
        </div>

        <div className="dashboard-main">
          <div className="dashboard-intro">
            <h2>Digital Adaptation Kit Components</h2>
            <p>
              Select a component to edit content for <strong>{repository.name}</strong>. 
              Components are organized by WHO SMART Guidelines levels for structured development.
            </p>
          </div>

          <div className="components-legend">
            <div className="legend-item">
              <span className="legend-badge level-2">Level 2</span>
              <span>Business Logic & Processes</span>
            </div>
            <div className="legend-item">
              <span className="legend-badge level-3">Level 3</span>
              <span>Technical Implementation</span>
            </div>
          </div>

          <div className="components-grid">
            {dakComponents.map((component) => (
              <div 
                key={component.id}
                className={`component-card ${component.type.toLowerCase().replace(' ', '-')}`}
                onClick={() => handleComponentClick(component)}
                style={{ '--component-color': component.color }}
              >
                <div className="component-header">
                  <div className="component-icon" style={{ color: component.color }}>
                    {component.icon}
                  </div>
                  <div className="component-badge">
                    <span className={`level-badge ${component.type.toLowerCase().replace(' ', '-')}`}>
                      {component.type}
                    </span>
                  </div>
                </div>
                
                <div className="component-content">
                  <h3>{component.name}</h3>
                  <p>{component.description}</p>
                  
                  <div className="component-meta">
                    <div className="file-types">
                      {component.fileTypes.map((type) => (
                        <span key={type} className="file-type-tag">{type}</span>
                      ))}
                    </div>
                    <div className="file-count">
                      {component.count} files
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-footer">
            <div className="repo-actions">
              <button className="action-btn secondary" onClick={() => window.open(`https://github.com/${repository.full_name}`, '_blank')}>
                <span>📂</span>
                View on GitHub
              </button>
              <button className="action-btn secondary" onClick={() => window.open(`https://github.com/${repository.full_name}/issues`, '_blank')}>
                <span>🐛</span>
                Issues
              </button>
              <button className="action-btn secondary" onClick={() => window.open(`https://github.com/${repository.full_name}/pulls`, '_blank')}>
                <span>🔄</span>
                Pull Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAKDashboard;
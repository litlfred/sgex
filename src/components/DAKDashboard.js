import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import HelpButton from './HelpButton';
import './DAKDashboard.css';

const DAKDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, repository } = location.state || {};
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Check write permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (repository && profile) {
        try {
          const writeAccess = await githubService.checkRepositoryWritePermissions(
            repository.owner?.login || repository.full_name.split('/')[0],
            repository.name
          );
          setHasWriteAccess(writeAccess);
        } catch (error) {
          console.warn('Could not check write permissions:', error);
          setHasWriteAccess(false);
        }
      }
      setCheckingPermissions(false);
    };

    checkPermissions();
  }, [repository, profile]);

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
    // Check if user wants to edit and has permissions
    if (!hasWriteAccess) {
      setShowPermissionDialog(true);
      return;
    }

    // Navigate to component-specific editor
    if (component.id === 'business-processes') {
      // Use dedicated BPMN editor for business processes
      navigate(`/bpmn-editor`, {
        state: {
          profile,
          repository,
          component
        }
      });
    } else {
      // Use generic component editor for other components
      navigate(`/editor/${component.id}`, {
        state: {
          profile,
          repository,
          component
        }
      });
    }
  };

  const handleBackToRepos = () => {
    navigate('/repositories', { state: { profile } });
  };

  // Temporary mock data for testing
  const mockProfile = profile || { login: 'testuser', avatar_url: 'https://github.com/testuser.png' };
  const mockRepository = repository || { name: 'test-dak', full_name: 'testuser/test-dak' };
  
  if (!profile || !repository) {
    // Use mock data for testing
    console.log('Using mock data for dashboard testing');
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
            src={mockProfile.avatar_url || `https://github.com/${mockProfile.login}.png`} 
            alt="Profile" 
            className="context-avatar" 
          />
          <div className="context-details">
            <span className="context-repo">{mockRepository.name}</span>
            <span className="context-owner">@{mockProfile.login}</span>
            {!checkingPermissions && (
              <span className={`access-level ${hasWriteAccess ? 'write' : 'read'}`}>
                {hasWriteAccess ? '✏️ Edit Access' : '👁️ Read-Only Access'}
              </span>
            )}
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
              Select a component to edit content for <strong>{mockRepository.name}</strong>. 
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
              <button className="action-btn secondary" onClick={() => window.open(`https://github.com/${mockRepository.full_name}`, '_blank')}>
                <span>📂</span>
                View on GitHub
              </button>
              <button className="action-btn secondary" onClick={() => window.open(`https://github.com/${mockRepository.full_name}/issues`, '_blank')}>
                <span>🐛</span>
                Issues
              </button>
              <button className="action-btn secondary" onClick={() => window.open(`https://github.com/${mockRepository.full_name}/pulls`, '_blank')}>
                <span>🔄</span>
                Pull Requests
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Upgrade Dialog */}
      {showPermissionDialog && (
        <div className="permission-dialog-overlay">
          <div className="permission-dialog">
            <div className="dialog-header">
              <h3>Edit Access Required</h3>
              <button 
                className="dialog-close"
                onClick={() => setShowPermissionDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="dialog-content">
              <div className="dialog-mascot">
                <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="dialog-mascot-img" />
                <div className="mascot-message">
                  <p>You need edit permissions to modify DAK components!</p>
                  <p>Your current token only provides read access to this repository.</p>
                </div>
              </div>
              <div className="permission-options">
                <div className="option-card">
                  <h4>🔧 Upgrade Your Token</h4>
                  <p>Create a new fine-grained token with write permissions for this repository.</p>
                  <div className="option-buttons">
                    <a 
                      href="https://github.com/settings/personal-access-tokens/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      Create New Token
                    </a>
                    <HelpButton 
                      helpTopic="github-token"
                      contextData={{ 
                        repository: { owner: mockRepository.owner?.login || mockRepository.full_name.split('/')[0], name: mockRepository.name },
                        requiredScopes: ['Contents: Write', 'Metadata: Read', 'Pull requests: Write'],
                        permissionMode: 'edit',
                        upgradeMode: true
                      }}
                    />
                  </div>
                </div>
                <div className="option-card">
                  <h4>👁️ Continue in Read-Only Mode</h4>
                  <p>Browse and view DAK components without editing capabilities.</p>
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowPermissionDialog(false)}
                  >
                    Continue Read-Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DAKDashboard;
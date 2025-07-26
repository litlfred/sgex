import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import HelpButton from './HelpButton';
import ContextualHelpMascot from './ContextualHelpMascot';
import './DAKDashboard.css';

const DAKDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, repository } = location.state || {};
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('core'); // 'core' or 'additional'

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

  // Define the 8 core DAK components based on WHO SMART Guidelines documentation
  const coreDAKComponents = [
    {
      id: 'health-interventions',
      name: 'Health Interventions and Recommendations',
      description: 'Clinical guidelines and health intervention specifications that define evidence-based care recommendations',
      icon: '📖',
      type: 'L2',
      color: '#0078d4',
      fileTypes: ['IRIS', 'Publication'],
      count: 5,
      editor: 'Publication reference manager with IRIS integration'
    },
    {
      id: 'generic-personas',
      name: 'Generic Personas',
      description: 'Standardized user roles and actor definitions that represent different types of healthcare workers and patients',
      icon: '👥',
      type: 'L2',
      color: '#107c10',
      fileTypes: ['Actor', 'Role'],
      count: 8,
      editor: 'Persona definition editor with role-based access specifications'
    },
    {
      id: 'user-scenarios',
      name: 'User Scenarios',
      description: 'Narrative descriptions of how different personas interact with the system in specific healthcare contexts',
      icon: '📝',
      type: 'L2',
      color: '#881798',
      fileTypes: ['Narrative', 'Use Case'],
      count: 12,
      editor: 'Scenario editor with workflow visualization'
    },
    {
      id: 'business-processes',
      name: 'Generic Business Processes and Workflows',
      description: 'BPMN workflows and business process definitions that model clinical workflows and care pathways',
      icon: '🔄',
      type: 'L2',
      color: '#d13438',
      fileTypes: ['BPMN', 'XML'],
      count: 15,
      editor: 'Graphical BPMN editor with SVG visualization'
    },
    {
      id: 'core-data-elements',
      name: 'Core Data Elements',
      description: 'Essential data structures and terminology needed for clinical data capture and exchange',
      icon: '🗃️',
      type: 'L2',
      color: '#ff8c00',
      fileTypes: ['OCL', 'Concept'],
      count: 89,
      editor: 'Data element editor with OCL integration'
    },
    {
      id: 'decision-support',
      name: 'Decision-Support Logic',
      description: 'DMN decision tables and clinical decision support rules that encode clinical logic',
      icon: '🎯',
      type: 'L2',
      color: '#00bcf2',
      fileTypes: ['DMN', 'XML'],
      count: 24,
      editor: 'DMN decision table editor with validation'
    },
    {
      id: 'program-indicators',
      name: 'Program Indicators',
      description: 'Performance indicators and measurement definitions for monitoring and evaluation',
      icon: '📊',
      type: 'L2',
      color: '#498205',
      fileTypes: ['Measure', 'Logic'],
      count: 18,
      editor: 'Indicator definition editor with measurement logic'
    },
    {
      id: 'functional-requirements',
      name: 'Functional and Non-Functional Requirements',
      description: 'System requirements specifications that define capabilities and constraints',
      icon: '⚙️',
      type: 'L2',
      color: '#6b69d6',
      fileTypes: ['Requirements', 'Specification'],
      count: 32,
      editor: 'Requirements editor with structured templates'
    }
  ];

  // Additional Structured Knowledge Representations
  const additionalComponents = [
    {
      id: 'terminology',
      name: 'Terminology',
      description: 'Code systems, value sets, and concept maps',
      icon: '🏷️',
      type: 'L3',
      color: '#ff8c00',
      fileTypes: ['CodeSystem', 'ValueSet'],
      count: 156
    },
    {
      id: 'profiles',
      name: 'FHIR Profiles',
      description: 'FHIR resource profiles and structure definitions',
      icon: '🔧',
      type: 'L3',
      color: '#00bcf2',
      fileTypes: ['StructureDefinition', 'Profile'],
      count: 42
    },
    {
      id: 'extensions',
      name: 'FHIR Extensions',
      description: 'Custom FHIR extensions and data elements',
      icon: '🧩',
      type: 'L3',
      color: '#498205',
      fileTypes: ['Extension', 'Element'],
      count: 18
    },
    {
      id: 'questionnaires',
      name: 'FHIR Questionnaires',
      description: 'Structured forms and questionnaires for data collection',
      icon: '📋',
      type: 'L3',
      color: '#881798',
      fileTypes: ['Questionnaire', 'StructureMap'],
      count: 24
    },
    {
      id: 'examples',
      name: 'Test Data & Examples',
      description: 'Sample data and test cases for validation',
      icon: '🧪',
      type: 'L3',
      color: '#6b69d6',
      fileTypes: ['Example', 'Bundle'],
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
              Select a component to edit content for <strong>{repository.name}</strong>. 
              Components are organized according to the WHO SMART Guidelines framework.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'core' ? 'active' : ''}`}
              onClick={() => setActiveTab('core')}
            >
              <span className="tab-icon">⭐</span>
              <span className="tab-text">8 Core Components</span>
              <span className="tab-badge core">L2</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'additional' ? 'active' : ''}`}
              onClick={() => setActiveTab('additional')}
            >
              <span className="tab-icon">🔧</span>
              <span className="tab-text">Additional Representations</span>
              <span className="tab-badge additional">L3</span>
            </button>
          </div>

          {/* 8 Core DAK Components Section */}
          {activeTab === 'core' && (
            <div className="components-section active">
              <div className="section-header">
                <h3 className="section-title">8 Core DAK Components</h3>
                <p className="section-description">
                  Essential components that form the foundation of any WHO SMART Guidelines Digital Adaptation Kit
                </p>
              </div>

              <div className="components-legend">
                <div className="legend-item">
                  <span className="legend-badge l2">L2</span>
                  <span>Data model agnostic representations</span>
                </div>
              </div>

              <div className="components-grid core-components">
                {coreDAKComponents.map((component) => (
                  <div 
                    key={component.id}
                    className={`component-card ${component.type.toLowerCase()}`}
                    onClick={() => handleComponentClick(component)}
                    style={{ '--component-color': component.color }}
                  >
                    <div className="component-header">
                      <div className="component-icon" style={{ color: component.color }}>
                        {component.icon}
                      </div>
                      <div className="component-badge">
                        <span className={`level-badge ${component.type.toLowerCase()}`}>
                          {component.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="component-content">
                      <h4>{component.name}</h4>
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
            </div>
          )}

          {/* Additional Structured Knowledge Representations Section */}
          {activeTab === 'additional' && (
            <div className="components-section additional-section active">
              <div className="section-header">
                <h3 className="section-title">Additional Structured Knowledge Representations</h3>
                <p className="section-description">
                  FHIR R4-specific implementations and technical artifacts that support the core DAK components
                </p>
              </div>

              <div className="components-legend">
                <div className="legend-item">
                  <span className="legend-badge l3">L3</span>
                  <span>FHIR R4-specific implementations</span>
                </div>
              </div>

              <div className="components-grid additional-components">
                {additionalComponents.map((component) => (
                  <div 
                    key={component.id}
                    className={`component-card ${component.type.toLowerCase()}`}
                    onClick={() => handleComponentClick(component)}
                    style={{ '--component-color': component.color }}
                  >
                    <div className="component-header">
                      <div className="component-icon" style={{ color: component.color }}>
                        {component.icon}
                      </div>
                      <div className="component-badge">
                        <span className={`level-badge ${component.type.toLowerCase()}`}>
                          {component.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="component-content">
                      <h4>{component.name}</h4>
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
            </div>
          )}

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
                        repository: { owner: repository.owner?.login || repository.full_name.split('/')[0], name: repository.name },
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

      {/* Contextual Help Mascot */}
      <ContextualHelpMascot 
        helpContent={
          <div>
            <h4>DAK Component Dashboard</h4>
            <p>Welcome to the Digital Adaptation Kit (DAK) component selection dashboard!</p>
            <div className="tip">
              <strong>Getting Started:</strong>
              <ul>
                <li>Use the tabs above to switch between <strong>8 Core Components</strong> (L2 - Data model agnostic) and <strong>Additional Representations</strong> (L3 - FHIR R4-specific)</li>
                <li>Click on any component card to start editing its content</li>
                <li>Each component shows the number of files and supported formats</li>
              </ul>
            </div>
            <p><strong>Need Help?</strong> This page organizes WHO SMART Guidelines components according to the official framework. The core components represent essential building blocks, while additional representations provide technical implementations.</p>
            {!hasWriteAccess && (
              <div className="tip">
                <strong>Read-Only Access:</strong> You currently have read-only access. To edit components, you'll need write permissions to this repository.
              </div>
            )}
          </div>
        }
        position="bottom-right"
      />
    </div>
  );
};

export default DAKDashboard;
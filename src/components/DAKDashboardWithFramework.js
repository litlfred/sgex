import React, { useState, useEffect } from 'react';
import { PageLayout, useDAKParams } from './framework';
import githubService from '../services/githubService';
import branchContextService from '../services/branchContextService';
import DAKStatusBox from './DAKStatusBox';
import Publications from './Publications';
import './DAKDashboard.css';

const DAKDashboardWithFramework = () => {
  return (
    <PageLayout pageName="dashboard">
      <DAKDashboardContent />
    </PageLayout>
  );
};

const DAKDashboardContent = () => {
  const { profile, repository, branch, navigate } = useDAKParams();
  
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('core'); // 'core', 'additional', or 'publications'
  const [issueCounts, setIssueCounts] = useState({});

  // Check write permissions
  useEffect(() => {
    const checkWritePermissions = async () => {
      if (!repository || !githubService.isAuth()) {
        setHasWriteAccess(false);
        return;
      }

      try {
        // Check repository permissions
        const hasPermission = await githubService.checkRepositoryPermissions(repository.owner.login, repository.name);
        setHasWriteAccess(hasPermission);
      } catch (error) {
        console.error('Error checking repository permissions:', error);
        setHasWriteAccess(false);
      }
    };

    checkWritePermissions();
  }, [repository]);

  // Set branch context
  useEffect(() => {
    if (profile && repository && branch) {
      branchContextService.setBranchContext(profile.login, repository.name, branch);
    }
  }, [profile, repository, branch]);

  // Fetch issue counts for repository (if authenticated)
  useEffect(() => {
    const fetchIssueCounts = async () => {
      if (!repository || !githubService.isAuth()) {
        return;
      }

      try {
        const issues = await githubService.getRepositoryIssues(repository.owner.login, repository.name);
        
        // Count issues by label
        const counts = {};
        issues.forEach(issue => {
          issue.labels.forEach(label => {
            counts[label.name] = (counts[label.name] || 0) + 1;
          });
        });
        
        setIssueCounts(counts);
      } catch (error) {
        console.warn('Could not fetch issue counts:', error);
      }
    };

    fetchIssueCounts();
  }, [repository]);

  const handleComponentNavigate = (componentPath) => {
    if (profile && repository) {
      navigate(`/${componentPath}/${profile.login}/${repository.name}/${branch}`, {
        state: {
          profile,
          repository,
          selectedBranch: branch
        }
      });
    }
  };

  const handlePublicationNavigate = () => {
    if (profile && repository) {
      navigate(`/publications/${profile.login}/${repository.name}/${branch}`, {
        state: {
          profile,
          repository,
          selectedBranch: branch
        }
      });
    }
  };

  // Define the 9 core DAK components based on WHO SMART Guidelines documentation
  const dakComponents = [
    // Core Components (Level 2)
    {
      id: 'health-interventions',
      title: 'Health Interventions and Recommendations',
      description: 'Clinical guidelines and health intervention specifications that define evidence-based care recommendations',
      icon: '📖',
      path: 'health-interventions',
      level: 'Level 2: Core Components',
      color: '#0078d4'
    },
    {
      id: 'generic-personas',
      title: 'Generic Personas',
      description: 'Standardized user roles and actor definitions that represent different types of healthcare workers and patients',
      icon: '👥',
      path: 'actor-editor',
      level: 'Level 2: Core Components',
      color: '#107c10'
    },
    {
      id: 'user-scenarios',
      title: 'User Scenarios',
      description: 'Narrative descriptions of how different personas interact with the system in specific healthcare contexts',
      icon: '📝',
      path: 'user-scenarios',
      level: 'Level 2: Core Components',
      color: '#881798'
    },
    {
      id: 'business-processes',
      title: 'Generic Business Processes and Workflows',
      description: 'BPMN workflows and business process definitions that model clinical workflows and care pathways',
      icon: '🔄',
      path: 'business-process-selection',
      level: 'Level 2: Core Components',
      color: '#d13438'
    },
    {
      id: 'core-data-elements',
      title: 'Core Data Elements',
      description: 'Essential data structures and terminology needed for clinical data capture and exchange',
      icon: '🗃️',
      path: 'core-data-dictionary-viewer',
      level: 'Level 2: Core Components',
      color: '#ff8c00'
    },
    {
      id: 'decision-support',
      title: 'Decision-Support Logic',
      description: 'DMN decision tables and clinical decision support rules that encode clinical logic',
      icon: '🎯',
      path: 'decision-support-logic',
      level: 'Level 2: Core Components',
      color: '#00bcf2'
    },
    {
      id: 'program-indicators',
      title: 'Program Indicators',
      description: 'Performance indicators and measurement definitions for monitoring and evaluation',
      icon: '📊',
      path: 'program-indicators',
      level: 'Level 2: Core Components',
      color: '#498205'
    },
    {
      id: 'functional-requirements',
      title: 'Functional and Non-Functional Requirements',
      description: 'System requirements specifications that define capabilities and constraints',
      icon: '⚙️',
      path: 'functional-requirements',
      level: 'Level 2: Core Components',
      color: '#6b69d6'
    },
    {
      id: 'testing',
      title: 'Testing',
      description: 'Feature files and test scenarios for validating the DAK implementation',
      icon: '🧪',
      path: 'testing-viewer',
      level: 'Level 2: Core Components',
      color: '#8b5cf6'
    },
    // Additional Components (Level 3)
    {
      id: 'terminology',
      title: 'Terminology',
      description: 'Code systems, value sets, and concept maps',
      icon: '🏷️',
      path: 'terminology',
      level: 'Level 3: Technical Implementation',
      color: '#ff8c00'
    },
    {
      id: 'profiles',
      title: 'FHIR Profiles',
      description: 'FHIR resource profiles and constraints',
      icon: '🔧',
      path: 'profiles',
      level: 'Level 3: Technical Implementation',
      color: '#00bcf2'
    },
    {
      id: 'extensions',
      title: 'FHIR Extensions',
      description: 'Custom FHIR extensions and modifications',
      icon: '🧩',
      path: 'extensions',
      level: 'Level 3: Technical Implementation',
      color: '#498205'
    },
    {
      id: 'test-data',
      title: 'Test Data & Examples',
      description: 'Sample data and testing resources',
      icon: '🧪',
      path: 'test-data',
      level: 'Level 3: Technical Implementation',
      color: '#8b5cf6'
    },
    {
      id: 'questionnaire-editor',
      title: 'FHIR Questionnaires',
      description: 'Structured questionnaires and forms for data collection using FHIR standard',
      icon: '📋',
      path: 'questionnaire-editor',
      level: 'Level 3: Technical Implementation',
      color: '#17a2b8'
    }
  ];

  const coreComponents = dakComponents.filter(comp => comp.level.includes('Level 2: Core Components'));
  const additionalComponents = dakComponents.filter(comp => comp.level.includes('Level 3: Technical Implementation'));

  return (
    <div className="dak-dashboard">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>{repository?.name} Dashboard</h1>
            <p className="dashboard-subtitle">
              Digital Adaptation Kit for {profile?.name || profile?.login}
            </p>
          </div>
        </div>

        {repository && (
          <DAKStatusBox 
            repository={repository}
            profile={profile}
            selectedBranch={branch}
            issueCounts={issueCounts}
          />
        )}

        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'core' ? 'active' : ''}`}
            onClick={() => setActiveTab('core')}
          >
            <span className="tab-icon">⭐</span>
            <span className="tab-text">9 Core Components</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            <span className="tab-icon">🔧</span>
            <span className="tab-text">Additional Components ({additionalComponents.length})</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'publications' ? 'active' : ''}`}
            onClick={() => setActiveTab('publications')}
          >
            <span className="tab-icon">📚</span>
            <span className="tab-text">Publications</span>
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'core' && (
            <div className="components-grid core-components">
              {coreComponents.map(component => (
                <div 
                  key={component.id}
                  className="component-card"
                  onClick={() => handleComponentNavigate(component.path)}
                >
                  <div className="component-icon">{component.icon}</div>
                  <h3>{component.title}</h3>
                  <p>{component.description}</p>
                  {issueCounts[component.id] > 0 && (
                    <div className="issue-badge">
                      {issueCounts[component.id]} issues
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="components-grid additional-components">
              {additionalComponents.map(component => (
                <div 
                  key={component.id}
                  className="component-card"
                  onClick={() => handleComponentNavigate(component.path)}
                >
                  <div className="component-icon">{component.icon}</div>
                  <h3>{component.title}</h3>
                  <p>{component.description}</p>
                  {issueCounts[component.id] > 0 && (
                    <div className="issue-badge">
                      {issueCounts[component.id]} issues
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'publications' && (
            <div className="publications-section">
              <Publications 
                repository={repository}
                profile={profile}
                selectedBranch={branch}
                onNavigate={handlePublicationNavigate}
              />
            </div>
          )}
        </div>

        {showPermissionDialog && (
          <div className="permission-dialog">
            <div className="dialog-overlay" onClick={() => setShowPermissionDialog(false)}></div>
            <div className="dialog-content">
              <h3>Repository Permissions</h3>
              <p>
                You have {hasWriteAccess ? 'write' : 'read-only'} access to this repository.
                {!hasWriteAccess && ' You can view content but cannot make changes.'}
              </p>
              <button onClick={() => setShowPermissionDialog(false)}>
                Got it
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default DAKDashboardWithFramework;
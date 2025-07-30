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
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('core'); // 'core', 'additional', or 'publications'
  const [issueCounts, setIssueCounts] = useState({});

  // Check write permissions
  useEffect(() => {
    const checkWritePermissions = async () => {
      if (!repository || !githubService.isAuth()) {
        setHasWriteAccess(false);
        setCheckingPermissions(false);
        return;
      }

      try {
        // Check repository permissions
        const hasPermission = await githubService.checkRepositoryPermissions(repository.owner.login, repository.name);
        setHasWriteAccess(hasPermission);
      } catch (error) {
        console.error('Error checking repository permissions:', error);
        setHasWriteAccess(false);
      } finally {
        setCheckingPermissions(false);
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

  const dakComponents = [
    {
      id: 'business-processes',
      title: 'Business Processes',
      description: 'Workflow definitions and process models',
      icon: '🔄',
      path: 'business-process-selection',
      level: 'Level 2: Business Logic'
    },
    {
      id: 'decision-support',
      title: 'Decision Support Logic',
      description: 'Clinical decision support rules and algorithms', 
      icon: '🧠',
      path: 'decision-support-logic',
      level: 'Level 2: Business Logic'
    },
    {
      id: 'data-dictionary',
      title: 'Core Data Dictionary',
      description: 'Essential data elements and definitions',
      icon: '📊',
      path: 'core-data-dictionary-viewer',
      level: 'Level 2: Business Logic'
    },
    {
      id: 'forms',
      title: 'Data Entry Forms',
      description: 'User interface forms for data collection',
      icon: '📝',
      path: 'forms',
      level: 'Level 2: Business Logic'
    },
    {
      id: 'terminology',
      title: 'Terminology',
      description: 'Code systems, value sets, and concept maps',
      icon: '🏷️',
      path: 'terminology',
      level: 'Level 3: Technical Implementation'
    },
    {
      id: 'profiles',
      title: 'FHIR Profiles',
      description: 'FHIR resource profiles and constraints',
      icon: '🔧',
      path: 'profiles',
      level: 'Level 3: Technical Implementation'
    },
    {
      id: 'extensions',
      title: 'FHIR Extensions',
      description: 'Custom FHIR extensions and modifications',
      icon: '🧩',
      path: 'extensions',
      level: 'Level 3: Technical Implementation'
    },
    {
      id: 'test-data',
      title: 'Test Data & Examples',
      description: 'Sample data and testing resources',
      icon: '🧪',
      path: 'test-data',
      level: 'Level 3: Technical Implementation'
    }
  ];

  const coreComponents = dakComponents.filter(comp => comp.level.includes('Level 2'));
  const additionalComponents = dakComponents.filter(comp => comp.level.includes('Level 3'));

  return (
    <div className="dak-dashboard">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>{repository?.name} Dashboard</h1>
            <p className="dashboard-subtitle">
              Digital Adaptation Kit for {profile?.name || profile?.login}
            </p>
          </div>
          
          {checkingPermissions ? (
            <div className="permissions-check">
              <span>Checking permissions...</span>
            </div>
          ) : (
            <div className="permissions-status">
              {hasWriteAccess ? (
                <span className="write-access">✅ Write Access</span>
              ) : (
                <span className="read-access">👁️ Read Only</span>
              )}
            </div>
          )}
        </div>

        {repository && (
          <DAKStatusBox 
            repository={repository}
            profile={profile}
            selectedBranch={branch}
            issueCounts={issueCounts}
          />
        )}

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'core' ? 'active' : ''}`}
            onClick={() => setActiveTab('core')}
          >
            Core Components ({coreComponents.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            Additional Components ({additionalComponents.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'publications' ? 'active' : ''}`}
            onClick={() => setActiveTab('publications')}
          >
            Publications
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'core' && (
            <div className="components-grid">
              <h2>Level 2: Business Logic & Processes</h2>
              <div className="component-cards">
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
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="components-grid">
              <h2>Level 3: Technical Implementation</h2>
              <div className="component-cards">
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
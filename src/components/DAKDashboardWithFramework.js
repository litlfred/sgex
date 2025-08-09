import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout, useDAKParams } from './framework';
import githubService from '../services/githubService';
import branchContextService from '../services/branchContextService';
import DAKStatusBox from './DAKStatusBox';
import Publications from './Publications';
import ForkStatusBar from './ForkStatusBar';

const DAKDashboardWithFramework = () => {
  return (
    <PageLayout pageName="dashboard">
      <DAKDashboardContent />
    </PageLayout>
  );
};

const DAKDashboardContent = () => {
  const { t } = useTranslation();
  const { profile, repository, branch, navigate } = useDAKParams();
  
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('core'); // 'core', 'additional', or 'publications'
  const [issueCounts, setIssueCounts] = useState({});
  const [themeVersion, setThemeVersion] = useState(0); // Force re-render on theme change

  // Check write permissions
  useEffect(() => {
    const checkWritePermissions = async () => {
      if (!repository || !githubService.isAuth()) {
        setHasWriteAccess(false);
        return;
      }

      try {
        // Check repository permissions
        const hasPermission = await githubService.checkRepositoryWritePermissions(repository.owner.login, repository.name);
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
        const issues = await githubService.getIssues(repository.owner.login, repository.name);
        
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

  // Watch for theme changes to update mascot card paths
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Force re-render to update mascot card paths
          setThemeVersion(prev => prev + 1);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

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

  // Helper function to get theme-aware mascot card image path
  const getMascotCardPath = (componentId) => {
    const isDarkMode = document.body.classList.contains('theme-dark');
    const publicUrl = process.env.PUBLIC_URL || '';
    
    const baseCardName = `dak_${componentId.replace(/[-]/g, '_')}.png`;
    const cardPath = isDarkMode 
      ? `dashboard/${baseCardName.replace('.png', '_grey_tabby.png')}`
      : `dashboard/${baseCardName}`;
    
    return publicUrl ? `${publicUrl}/${cardPath}` : `/${cardPath}`;
  };

  // Define the 9 core DAK components based on WHO SMART Guidelines documentation
  // This needs to be recalculated when theme changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dakComponents = React.useMemo(() => [
    // Core Components (Level 2)
    {
      id: 'health-interventions',
      title: t('dak.component.healthInterventions.name'),
      description: t('dak.component.healthInterventions.description'),
      mascotCard: getMascotCardPath('interventions'),
      path: 'health-interventions',
      level: t('dak.level.core'),
      color: '#0078d4'
    },
    {
      id: 'generic-personas',
      title: t('dak.component.genericPersonas.name'),
      description: t('dak.component.genericPersonas.description'),
      mascotCard: getMascotCardPath('personas'),
      path: 'actor-editor',
      level: t('dak.level.core'),
      color: '#107c10'
    },
    {
      id: 'user-scenarios',
      title: t('dak.component.userScenarios.name'),
      description: t('dak.component.userScenarios.description'),
      mascotCard: getMascotCardPath('user_scenarios'),
      path: 'user-scenarios',
      level: t('dak.level.core'),
      color: '#881798'
    },
    {
      id: 'business-processes',
      title: t('dak.component.businessProcesses.name'),
      description: t('dak.component.businessProcesses.description'),
      mascotCard: getMascotCardPath('business_processes'),
      path: 'business-process-selection',
      level: t('dak.level.core'),
      color: '#d13438'
    },
    {
      id: 'core-data-elements',
      title: t('dak.component.coreDataElements.name'),
      description: t('dak.component.coreDataElements.description'),
      mascotCard: getMascotCardPath('core_data_elements'),
      path: 'core-data-dictionary-viewer',
      level: t('dak.level.core'),
      color: '#ff8c00'
    },
    {
      id: 'decision-support',
      title: t('dak.component.decisionSupportLogic.name'),
      description: t('dak.component.decisionSupportLogic.description'),
      mascotCard: getMascotCardPath('decision_support_logic'),
      path: 'decision-support-logic',
      level: t('dak.level.core'),
      color: '#00bcf2'
    },
    {
      id: 'program-indicators',
      title: t('dak.component.programIndicators.name'),
      description: t('dak.component.programIndicators.description'),
      mascotCard: getMascotCardPath('indicators'),
      path: 'program-indicators',
      level: t('dak.level.core'),
      color: '#498205'
    },
    {
      id: 'functional-requirements',
      title: t('dak.component.requirements.name'),
      description: t('dak.component.requirements.description'),
      mascotCard: getMascotCardPath('requirements'),
      path: 'functional-requirements',
      level: t('dak.level.core'),
      color: '#6b69d6'
    },
    {
      id: 'testing',
      title: t('dak.component.testing.name'),
      description: t('dak.component.testing.description'),
      mascotCard: getMascotCardPath('testing'),
      path: 'testing-viewer',
      level: t('dak.level.core'),
      color: '#8b5cf6'
    },
    // Additional Components (Level 3)
    {
      id: 'terminology',
      title: t('dak.component.terminology.name'),
      description: t('dak.component.terminology.description'),
      icon: '🏷️',
      path: 'terminology',
      level: t('dak.level.technical'),
      color: '#ff8c00'
    },
    {
      id: 'profiles',
      title: t('dak.component.profiles.name'),
      description: t('dak.component.profiles.description'),
      icon: '🔧',
      path: 'profiles',
      level: t('dak.level.technical'),
      color: '#00bcf2'
    },
    {
      id: 'extensions',
      title: t('dak.component.extensions.name'),
      description: t('dak.component.extensions.description'),
      icon: '🧩',
      path: 'extensions',
      level: t('dak.level.technical'),
      color: '#498205'
    },
    {
      id: 'test-data',
      title: t('dak.component.testData.name'),
      description: t('dak.component.testData.description'),
      icon: '🧪',
      path: 'test-data',
      level: t('dak.level.technical'),
      color: '#8b5cf6'
    },
    {
      id: 'questionnaire-editor',
      title: t('dak.component.questionnaireEditor.name'),
      description: t('dak.component.questionnaireEditor.description'),
      icon: '📋',
      path: 'questionnaire-editor',
      level: t('dak.level.technical'),
      color: '#17a2b8'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [themeVersion, t]); // Re-compute when theme changes or translations change

  const coreComponents = dakComponents.filter(comp => comp.level.includes(t('dak.level.core')));
  const additionalComponents = dakComponents.filter(comp => comp.level.includes(t('dak.level.technical')));

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

        {/* Fork Status Bar - shows forks of sgex repository */}
        <ForkStatusBar 
          profile={profile}
          repository={repository}
          selectedBranch={branch}
        />

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
                  <div className="component-mascot">
                    <img 
                      src={component.mascotCard} 
                      alt={`${component.title} mascot`}
                      className="mascot-card-image"
                    />
                  </div>
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
                  {component.mascotCard ? (
                    <div className="component-mascot">
                      <img 
                        src={component.mascotCard} 
                        alt={`${component.title} mascot`}
                        className="mascot-card-image"
                      />
                    </div>
                  ) : (
                    <div className="component-icon">{component.icon}</div>
                  )}
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
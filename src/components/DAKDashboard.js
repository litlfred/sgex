import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import githubService from '../services/githubService';
import dakValidationService from '../services/dakValidationService';
import branchContextService from '../services/branchContextService';
import HelpButton from './HelpButton';
import DAKStatusBox from './DAKStatusBox';
import Publications from './Publications';
import ForkStatusBar from './ForkStatusBar';
import { PageLayout } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';
import useThemeImage from '../hooks/useThemeImage';
import { ALT_TEXT_KEYS, getAltText } from '../utils/imageAltTextHelper';

const DAKDashboard = () => {
  return (
    <PageLayout pageName="dak-dashboard">
      <DAKDashboardContent />
    </PageLayout>
  );
};

const DAKDashboardContent = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, repo, branch } = useParams();
  
  // Theme-aware mascot image for dialog
  const mascotImage = useThemeImage('sgex-mascot.png');
  
  // Try to get data from location.state first, then from URL params
  const [profile, setProfile] = useState(location.state?.profile || null);
  const [repository, setRepository] = useState(location.state?.repository || null);
  const [loading, setLoading] = useState(!profile || !repository);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('core'); // 'core' or 'publications'
  const [selectedBranch, setSelectedBranch] = useState(location.state?.selectedBranch || branch || null);
  const [issueCounts, setIssueCounts] = useState({});
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Component Card component defined within the dashboard
  const ComponentCard = ({ component, cardImagePath, handleComponentClick, t }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageError(true);
      setImageLoaded(false);
    };

    return (
      <div 
        className={`component-card ${component.type.toLowerCase()} large-card ${imageLoaded ? 'image-loaded' : ''}`}
        onClick={(event) => handleComponentClick(event, component)}
        style={{ '--component-color': component.color }}
        tabIndex={0}
        role="button"
        aria-label={`${component.name} - ${component.description}`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleComponentClick(event, component);
          }
        }}
      >
        <div className="component-header">
          <div className="component-image-container">
            <img 
              src={cardImagePath}
              alt={getAltText(t, ALT_TEXT_KEYS.ICON_DAK_COMPONENT, component.name, { name: component.name })}
              className="component-card-image"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageError ? 'none' : 'block' }}
            />
            {/* Fallback icon when image fails to load */}
            {imageError && (
              <div className="component-icon" style={{ color: component.color }}>
                {component.icon}
              </div>
            )}
          </div>
        </div>
        
        <div className="component-content">
          {/* Only show title text if image failed to load or as screen reader backup */}
          <h4 className={imageLoaded && !imageError ? 'visually-hidden' : ''}>
            {component.name}
          </h4>
          <p className={imageLoaded && !imageError ? 'visually-hidden' : ''}>
            {component.description}
          </p>
          
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
    );
  };

  // Fetch data from URL parameters if not available in location.state
  useEffect(() => {
    const fetchDataFromUrlParams = async () => {
      if ((!profile || !repository) && user && repo) {
        try {
          setLoading(true);
          setError(null);

          // Check if githubService is authenticated (allow demo mode to proceed without auth)
          if (!githubService.isAuth()) {
            // In demo mode, use the DAK validation service for demo repositories
            if (window.location.pathname.includes('/dashboard/')) {
              const isValidDAK = dakValidationService.validateDemoDAKRepository(user, repo);
              
              if (!isValidDAK) {
                navigate('/', { 
                  state: { 
                    warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
                  } 
                });
                return;
              }

              const demoProfile = {
                login: user,
                name: user.charAt(0).toUpperCase() + user.slice(1),
                avatar_url: `https://github.com/${user}.png`,
                type: 'User',
                isDemo: true
              };

              const demoRepository = {
                name: repo,
                full_name: `${user}/${repo}`,
                owner: { login: user },
                default_branch: branch || 'main',
                html_url: `https://github.com/${user}/${repo}`,
                isDemo: true
              };

              setProfile(demoProfile);
              setRepository(demoRepository);
              setSelectedBranch(branch || 'main');
              setLoading(false);
              return;
            } else {
              setError(t('auth.authRequired'));
              setLoading(false);
              return;
            }
          }

          // Fetch user profile
          let userProfile = null;
          try {
            const userResponse = await githubService.getUser(user);
            userProfile = userResponse;
          } catch (err) {
            console.error('Error fetching user:', err);
            // Redirect to landing page with warning message
            navigate('/', { 
              state: { 
                warningMessage: `Could not access the requested DAK. User '${user}' not found or not accessible.` 
              } 
            });
            return;
          }

          // Fetch repository
          let repoData = null;
          try {
            const repoResponse = await githubService.getRepository(user, repo);
            repoData = repoResponse;
          } catch (err) {
            console.error('Error fetching repository:', err);
            // Redirect to landing page with warning message
            navigate('/', { 
              state: { 
                warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
              } 
            });
            return;
          }

          // Validate that this is actually a DAK repository
          const isValidDAK = await dakValidationService.validateDAKRepository(user, repo, branch || repoData.default_branch);
          
          if (!isValidDAK) {
            console.log(`Repository ${user}/${repo} is not a valid DAK repository`);
            navigate('/', { 
              state: { 
                warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
              } 
            });
            return;
          }

          // Validate branch if specified
          if (branch) {
            try {
              await githubService.getBranch(user, repo, branch);
              setSelectedBranch(branch);
            } catch (err) {
              console.warn(`Branch '${branch}' not found, falling back to default branch`);
              setSelectedBranch(repoData.default_branch);
            }
          } else {
            setSelectedBranch(repoData.default_branch);
          }

          setProfile(userProfile);
          setRepository(repoData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching data from URL params:', err);
          setError('Failed to load dashboard data. Please check the URL or try again.');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchDataFromUrlParams();
  }, [user, repo, branch, profile, repository, navigate, t]);

  // Initialize selected branch from session context
  useEffect(() => {
    if (repository) {
      const storedBranch = branchContextService.getSelectedBranch(repository);
      if (storedBranch) {
        setSelectedBranch(storedBranch);
      } else if (profile && profile.login === 'demo-user') {
        // For demo mode, set a default branch
        const defaultBranch = repository.default_branch || 'main';
        setSelectedBranch(defaultBranch);
        branchContextService.setSelectedBranch(repository, defaultBranch);
      }
    }
  }, [repository, profile]);

  // Load issue counts for repository
  const loadIssueCounts = async () => {
    if (!repository) return;
    
    try {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      
      // Get all issues (includes pull requests in GitHub API)
      const issues = await githubService.getIssues(owner, repoName, {
        state: 'all',
        per_page: 100
      });
      
      // Filter out pull requests to get actual issues
      const actualIssues = issues.filter(issue => !issue.pull_request);
      
      // Count issues by state
      const openIssues = actualIssues.filter(issue => issue.state === 'open').length;
      const closedIssues = actualIssues.filter(issue => issue.state === 'closed').length;
      
      setIssueCounts({
        total: actualIssues.length,
        open: openIssues,
        closed: closedIssues
      });
    } catch (err) {
      console.warn('Could not load issue counts:', err);
      setIssueCounts({ total: 0, open: 0, closed: 0 });
    }
  };

  // Load issue counts when repository changes
  useEffect(() => {
    if (repository && !loading) {
      loadIssueCounts();
    }
  }, [repository, loading]); // eslint-disable-line react-hooks/exhaustive-deps

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
      setLoading(false);
    };

    checkPermissions();
  }, [repository, profile]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);



  // Define the 9 core DAK components based on WHO SMART Guidelines documentation
  const coreDAKComponents = [
    {
      id: 'health-interventions',
      name: t('dak.healthInterventions'),
      description: 'Clinical guidelines and health intervention specifications that define evidence-based care recommendations',
      icon: '📖',
      cardImage: 'dashboard/dak_interventions.png',
      type: 'L2',
      color: '#0078d4',
      fileTypes: ['IRIS', 'Publication'],
      count: 5,
      editor: 'Publication reference manager with IRIS integration'
    },
    {
      id: 'generic-personas',
      name: t('dak.genericPersonas'),
      description: 'Standardized user roles and actor definitions that represent different types of healthcare workers and patients',
      icon: '👥',
      cardImage: 'dashboard/dak_personas.png',
      type: 'L2',
      color: '#107c10',
      fileTypes: ['Actor', 'Role'],
      count: 8,
      editor: 'Persona definition editor with role-based access specifications'
    },
    {
      id: 'user-scenarios',
      name: t('dak.userScenarios'),
      description: 'Narrative descriptions of how different personas interact with the system in specific healthcare contexts',
      icon: '📝',
      cardImage: 'dashboard/dak_user_scenarios.png',
      type: 'L2',
      color: '#881798',
      fileTypes: ['Narrative', 'Use Case'],
      count: 12,
      editor: 'Scenario editor with workflow visualization'
    },
    {
      id: 'business-processes',
      name: t('dak.businessProcesses'),
      description: 'BPMN workflows and business process definitions that model clinical workflows and care pathways',
      icon: '🔄',
      cardImage: 'dashboard/dak_business_processes.png',
      type: 'L2',
      color: '#d13438',
      fileTypes: ['BPMN', 'XML'],
      count: 15,
      editor: 'Graphical BPMN editor with SVG visualization'
    },
    {
      id: 'core-data-elements',
      name: t('dak.coreDataElements'),
      description: 'Essential data structures and terminology needed for clinical data capture and exchange (includes Terminology Services via OCL and Product Master Data via PCMT)',
      icon: '🗃️',
      cardImage: 'dashboard/dak_core_data_elements.png',
      type: 'L2',
      color: '#ff8c00',
      fileTypes: ['OCL', 'Concept', 'PCMT', 'Product'],
      count: issueCounts.total || 89,
      editor: 'Data element editor with OCL and PCMT integration'
    },
    {
      id: 'decision-support',
      name: t('dak.decisionSupportLogic'),
      description: 'DMN decision tables and clinical decision support rules that encode clinical logic',
      icon: '🎯',
      cardImage: 'dashboard/dak_decision_support_logic.png',
      type: 'L2',
      color: '#00bcf2',
      fileTypes: ['DMN', 'XML'],
      count: 24,
      editor: 'DMN decision table editor with validation'
    },
    {
      id: 'program-indicators',
      name: t('dak.programIndicators'),
      description: 'Performance indicators and measurement definitions for monitoring and evaluation',
      icon: '📊',
      cardImage: 'dashboard/dak_indicators.png',
      type: 'L2',
      color: '#498205',
      fileTypes: ['Measure', 'Logic'],
      count: 18,
      editor: 'Indicator definition editor with measurement logic'
    },
    {
      id: 'functional-requirements',
      name: t('dak.requirements'),
      description: 'System requirements specifications that define capabilities and constraints',
      icon: '⚙️',
      cardImage: 'dashboard/dak_requirements.png',
      type: 'L2',
      color: '#6b69d6',
      fileTypes: ['Requirements', 'Specification'],
      count: 32,
      editor: 'Requirements editor with structured templates'
    },
    {
      id: 'test-scenarios',
      name: t('dak.testScenarios') || 'Test Scenarios',
      description: 'Feature files and test scenarios for validating the DAK implementation',
      icon: '🧪',
      cardImage: 'dashboard/dak_testing.png',
      type: 'L2',
      color: '#8b5cf6',
      fileTypes: ['Feature', 'Test'],
      count: 0,
      editor: 'Testing viewer with feature file browser'
    }
  ];



  const handleComponentClick = (event, component) => {
    const navigationState = {
      profile,
      repository,
      component,
      selectedBranch
    };
    
    // For decision-support, always navigate to view page (no permission check needed)
    if (component.id === 'decision-support') {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const path = selectedBranch 
        ? `/decision-support-logic/${owner}/${repoName}/${selectedBranch}`
        : `/decision-support-logic/${owner}/${repoName}`;
      
      handleNavigationClick(event, path, navigate, navigationState);
      return;
    }

    // For business processes, navigate to selection page without permission check
    if (component.id === 'business-processes') {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const path = selectedBranch 
        ? `/business-process-selection/${owner}/${repoName}/${selectedBranch}`
        : `/business-process-selection/${owner}/${repoName}`;
      
      handleNavigationClick(event, path, navigate, navigationState);
      return;
    }



    // For health-interventions (WHO Digital Library), allow access in read-only mode
    if (component.id === 'health-interventions') {
      handleNavigationClick(event, `/editor/${component.id}`, navigate, navigationState);
      return;
    }

    // For core-data-elements (Component 2 Core Data Dictionary), navigate to viewer
    if (component.id === 'core-data-elements') {
      const owner = user || repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repo || repository.name;
      const branchName = selectedBranch;
      
      const viewerPath = branchName ? 
        `/core-data-dictionary-viewer/${owner}/${repoName}/${branchName}` :
        `/core-data-dictionary-viewer/${owner}/${repoName}`;
        
      handleNavigationClick(event, viewerPath, navigate, navigationState);
      return;
    }



    // For generic-personas, navigate to actor editor
    if (component.id === 'generic-personas') {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const path = selectedBranch 
        ? `/actor-editor/${owner}/${repoName}/${selectedBranch}`
        : `/actor-editor/${owner}/${repoName}`;
      
      handleNavigationClick(event, path, navigate, navigationState);
      return;
    }

    // For test-scenarios, navigate to testing viewer
    if (component.id === 'test-scenarios') {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const path = selectedBranch 
        ? `/testing-viewer/${owner}/${repoName}/${selectedBranch}`
        : `/testing-viewer/${owner}/${repoName}`;
      
      handleNavigationClick(event, path, navigate, navigationState);
      return;
    }

    // For other components, check permissions before proceeding
    if (!hasWriteAccess) {
      // If command-click, still show permission dialog instead of opening new tab
      // since the user needs to authenticate first
      setShowPermissionDialog(true);
      return;
    }

    // Navigate to generic component editor for other components
    handleNavigationClick(event, `/editor/${component.id}`, navigate, navigationState);
  };



  if (loading) {
    return (
      <div className="dak-dashboard loading-state">
        <div className="loading-content">
          <h2>Loading Dashboard...</h2>
          <p>Fetching repository and user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dak-dashboard error-state">
        <div className="error-content">
          <h2>{t('dashboard.errorLoading')}</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/')} className="action-btn primary">
              {t('navigation.home')}
            </button>
            <button onClick={() => window.location.reload()} className="action-btn secondary">
              {t('common.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !repository) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <div className="dak-dashboard">
      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-intro">
            <h2>{t('dak.components')}</h2>
            <p>
              Select a component to edit content for <strong>{repository.name}</strong>
              {selectedBranch && (
                <span> on branch <code className="branch-display">{selectedBranch}</code></span>
              )}. 
              Components are organized according to the WHO SMART Guidelines framework.
            </p>
          </div>

          {/* Fork Status Bar - shows forks of sgex repository */}
          <ForkStatusBar 
            profile={profile}
            repository={repository}
            selectedBranch={selectedBranch}
          />

          {/* DAK Status Box - only show when repository and branch are selected */}
          {repository && selectedBranch && (
            <DAKStatusBox 
              repository={repository}
              selectedBranch={selectedBranch}
              hasWriteAccess={hasWriteAccess}
              profile={profile}
            />
          )}

          {/* Tab Navigation - Full Width Toggle Buttons */}
          <div className="tab-navigation-fullwidth">
            <button 
              className={`tab-button-fullwidth ${activeTab === 'core' ? 'active' : ''}`}
              onClick={() => setActiveTab('core')}
            >
              <span className="tab-icon">⭐</span>
              <span className="tab-text">9 Core Components</span>
            </button>
            <button
              className={`tab-button-fullwidth ${activeTab === 'publications' ? 'active' : ''}`}
              onClick={() => setActiveTab('publications')}
            >
              <span className="tab-icon">📚</span>
              <span className="tab-text">Publications</span>
            </button>
            <button
              className={`tab-button-fullwidth ${activeTab === 'other' ? 'active' : ''}`}
              onClick={() => setActiveTab('other')}
            >
              <span className="tab-icon">🔧</span>
              <span className="tab-text">Other DAK Components</span>
            </button>
          </div>

          {/* 9 Core DAK Components Section */}
          {activeTab === 'core' && (
            <div className="components-section active">
              <div className="section-header">
                <h3 className="section-title">{t('dak.components')}</h3>
                <p className="section-description">
                  Essential components that form the foundation of any WHO SMART Guidelines Digital Adaptation Kit
                </p>
              </div>

              <div className="components-grid core-components">
                {coreDAKComponents.map((component) => {
                  const cardImagePath = useThemeImage(component.cardImage);

                  return (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      cardImagePath={cardImagePath}
                      handleComponentClick={handleComponentClick}
                      t={t}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Other DAK Components Section */}
          {activeTab === 'other' && (
            <div className="components-section other-components active">
              <div className="section-header">
                <h3 className="section-title">Other DAK Components</h3>
                <p className="section-description">
                  Additional specialized components for advanced DAK functionality and implementation
                </p>
              </div>

              <div className="components-grid other-components">
                <div 
                  className="component-card l3"
                  onClick={(event) => {
                    const component = {
                      id: 'questionnaire-editor',
                      name: 'FHIR Questionnaires',
                      description: 'Structured questionnaires and forms for data collection using FHIR standard'
                    };
                    const owner = repository.owner?.login || repository.full_name.split('/')[0];
                    const repoName = repository.name;
                    const path = selectedBranch 
                      ? `/questionnaire-editor/${owner}/${repoName}/${selectedBranch}`
                      : `/questionnaire-editor/${owner}/${repoName}`;
                    
                    const navigationState = {
                      profile,
                      repository,
                      component,
                      selectedBranch
                    };
                    
                    handleNavigationClick(event, path, navigate, navigationState);
                  }}
                  style={{ '--component-color': '#17a2b8' }}
                >
                  <div className="component-header">
                    <div className="component-icon" style={{ color: '#17a2b8' }}>
                      📋
                    </div>
                  </div>
                  
                  <div className="component-content">
                    <h4>FHIR Questionnaires</h4>
                    <p>Structured questionnaires and forms for data collection using FHIR Questionnaire standard</p>
                    
                    <div className="component-meta">
                      <div className="file-types">
                        <span className="file-type-tag">JSON</span>
                        <span className="file-type-tag">FHIR</span>
                      </div>
                      <div className="file-count">
                        questionnaires/
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Publications Section */}
          {activeTab === 'publications' && (
            <div className="components-section publications-section active">
              <Publications
                profile={profile}
                repository={repository}
                selectedBranch={selectedBranch}
                hasWriteAccess={hasWriteAccess}
              />
            </div>
          )}
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
                <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Helper')} className="dialog-mascot-img" />
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
    </div>
  );
};

export default DAKDashboard;
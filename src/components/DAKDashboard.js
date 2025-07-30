import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import githubService from '../services/githubService';
import dakValidationService from '../services/dakValidationService';
import branchContextService from '../services/branchContextService';
import cacheManagementService from '../services/cacheManagementService';
import BranchSelector from './BranchSelector';
import HelpButton from './HelpButton';
import ContextualHelpMascot from './ContextualHelpMascot';
import DAKStatusBox from './DAKStatusBox';
import Publications from './Publications';
import { handleNavigationClick } from '../utils/navigationUtils';
import './DAKDashboard.css';

const DAKDashboard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, repo, branch } = useParams();
  
  // Try to get data from location.state first, then from URL params
  const [profile, setProfile] = useState(location.state?.profile || null);
  const [repository, setRepository] = useState(location.state?.repository || null);
  const [loading, setLoading] = useState(!profile || !repository);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('core'); // 'core', 'additional', or 'publications'
  const [selectedBranch, setSelectedBranch] = useState(location.state?.selectedBranch || branch || null);
  const [issueCounts, setIssueCounts] = useState({});
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);

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
              setError(t('errors.github_auth_required'));
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
                warningMessage: t('errors.user_not_found', { user }) 
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
      setCheckingPermissions(false);
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
      count: issueCounts.total || 89,
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
      id: 'pages',
      name: 'Pages',
      description: 'Published page content and documentation defined in sushi-config.yaml',
      icon: '📄',
      type: 'Content',
      color: '#8b5cf6',
      fileTypes: ['Markdown', 'HTML'],
      count: 0
    },
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

  // Handle branch selection change
  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    branchContextService.setSelectedBranch(repository, branch);
    
    // Update the URL to include the branch parameter
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    const repoName = repository.name;
    const newPath = `/dashboard/${owner}/${repoName}/${branch}`;
    
    navigate(newPath, {
      state: {
        profile,
        repository,
        selectedBranch: branch
      }
    });
  };

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

    // For pages, navigate to pages manager (read-only access allowed)
    if (component.id === 'pages') {
      handleNavigationClick(event, '/pages', navigate, navigationState);
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

    // For terminology (also Component 2 Core Data Dictionary from Additional Components), navigate to viewer
    if (component.id === 'terminology') {
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
      handleNavigationClick(event, '/actor-editor', navigate, navigationState);
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

  const handleBackToRepos = () => {
    navigate('/repositories', { state: { profile } });
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleClearCacheClick = () => {
    setShowUserMenu(false);
    setShowClearCacheConfirm(true);
  };

  const handleClearCacheConfirm = () => {
    const success = cacheManagementService.clearAllCache();
    setShowClearCacheConfirm(false);
    
    if (success) {
      // Show success message and redirect to home
      navigate('/', { 
        state: { 
          successMessage: '🚽 Cache cleared successfully! All local data has been flushed.' 
        } 
      });
    } else {
      // Show error message
      alert('⚠️ There was an error clearing the cache. Please try again or refresh the page.');
    }
  };

  const handleClearCacheCancel = () => {
    setShowClearCacheConfirm(false);
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
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/')} className="action-btn primary">
              Return to Home
            </button>
            <button onClick={() => window.location.reload()} className="action-btn secondary">
              Retry
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
      <div className="dashboard-header">
        <div className="header-left">
          <div className="who-branding">
            <h1 onClick={handleHomeNavigation} className="clickable-title">{t('app.title')}</h1>
            <p className="subtitle">{t('app.subtitle')}</p>
          </div>
          <div className="repo-status">
            <div className="repo-info">
              <a 
                href={`https://github.com/${repository.full_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="context-repo-link"
                title="View repository on GitHub"
              >
                <span className="repo-icon">📁</span>
                <span className="context-repo">{repository.name}</span>
                <span className="external-link">↗</span>
              </a>
            </div>
            <div className="branch-info">
              <BranchSelector
                repository={repository}
                selectedBranch={selectedBranch}
                onBranchChange={handleBranchChange}
                className="header-branch-selector"
              />
            </div>
            {!checkingPermissions && (
              <span className={`access-level ${hasWriteAccess ? 'write' : 'read'}`}>
                {hasWriteAccess ? '✏️ Edit Access' : '👁️ Read-Only Access'}
              </span>
            )}
          </div>
        </div>
        <div className="header-right">
          <div className="user-menu-container">
            <div className="user-info" onClick={handleUserMenuToggle}>
              <img 
                src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
                alt="Profile" 
                className="context-avatar" 
              />
              <span className="context-owner">@{profile.login}</span>
              <span className="menu-arrow">▼</span>
            </div>
            
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <div className="dropdown-item" onClick={handleClearCacheClick}>
                  <span className="dropdown-icon">🚽</span>
                  <span className="dropdown-text">Clear Cache</span>
                </div>
              </div>
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
              Select a component to edit content for <strong>{repository.name}</strong>
              {selectedBranch && (
                <span> on branch <code className="branch-display">{selectedBranch}</code></span>
              )}. 
              Components are organized according to the WHO SMART Guidelines framework.
            </p>
          </div>

          {/* DAK Status Box - only show when repository and branch are selected */}
          {repository && selectedBranch && (
            <DAKStatusBox 
              repository={repository}
              selectedBranch={selectedBranch}
              hasWriteAccess={hasWriteAccess}
              profile={profile}
            />
          )}

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'core' ? 'active' : ''}`}
              onClick={() => setActiveTab('core')}
            >
              <span className="tab-icon">⭐</span>
              <span className="tab-text">8 Core Components</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'additional' ? 'active' : ''}`}
              onClick={() => setActiveTab('additional')}
            >
              <span className="tab-icon">🔧</span>
              <span className="tab-text">Additional Components</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'publications' ? 'active' : ''}`}
              onClick={() => setActiveTab('publications')}
            >
              <span className="tab-icon">📚</span>
              <span className="tab-text">Publications</span>
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

              <div className="components-grid core-components">
                {coreDAKComponents.map((component) => (
                  <div 
                    key={component.id}
                    className={`component-card ${component.type.toLowerCase()}`}
                    onClick={(event) => handleComponentClick(event, component)}
                    style={{ '--component-color': component.color }}
                  >
                    <div className="component-header">
                      <div className="component-icon" style={{ color: component.color }}>
                        {component.icon}
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

          {/* Additional Components Section */}
          {activeTab === 'additional' && (
            <div className="components-section additional-section active">
              <div className="section-header">
                <h3 className="section-title">Additional Components</h3>
                <p className="section-description">
                  FHIR R4-specific implementations and technical artifacts that support the core DAK components
                </p>
              </div>

              <div className="components-grid additional-components">
                {additionalComponents.map((component) => (
                  <div 
                    key={component.id}
                    className={`component-card ${component.type.toLowerCase()}`}
                    onClick={(event) => handleComponentClick(event, component)}
                    style={{ '--component-color': component.color }}
                  >
                    <div className="component-header">
                      <div className="component-icon" style={{ color: component.color }}>
                        {component.icon}
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
                <img src="/sgex/sgex-mascot.png" alt="SGEX Helper" className="dialog-mascot-img" />
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

      {/* Clear Cache Confirmation Dialog */}
      {showClearCacheConfirm && (
        <div className="clear-cache-dialog-overlay">
          <div className="clear-cache-dialog">
            <div className="dialog-header">
              <h3>🚽 Clear Cache</h3>
              <button 
                className="dialog-close"
                onClick={handleClearCacheCancel}
              >
                ×
              </button>
            </div>
            <div className="dialog-content">
              <div className="dialog-mascot">
                <img src="/sgex/sgex-mascot.png" alt="SGEX Helper" className="dialog-mascot-img" />
                <div className="mascot-message">
                  <p><strong>⚠️ Warning: You may lose unsaved progress!</strong></p>
                  <p>This will clear all cached data including:</p>
                  <ul>
                    <li>Repository lists and metadata</li>
                    <li>Branch selections and context</li>
                    <li>Unsaved changes in staging area</li>
                    <li>Other local application data</li>
                  </ul>
                  <p><strong>Any work not committed to GitHub will be lost permanently.</strong></p>
                </div>
              </div>
              <div className="dialog-actions">
                <button 
                  className="btn-danger"
                  onClick={handleClearCacheConfirm}
                >
                  🚽 Yes, Clear Cache
                </button>
                <button 
                  className="btn-secondary"
                  onClick={handleClearCacheCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Help Mascot */}
      <ContextualHelpMascot 
        pageId="dak-dashboard"
        position="bottom-right"
        contextData={{ profile, repository, hasWriteAccess }}
      />
    </div>
  );
};

export default DAKDashboard;
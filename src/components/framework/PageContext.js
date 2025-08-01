import React, { useState, useEffect } from 'react';
import { usePage, PAGE_TYPES } from './PageProvider';
import AccessBadge from './AccessBadge';
import githubService from '../../services/githubService';
import './PageContext.css';

/**
 * Page context component that displays profile/repo/branch information and breadcrumbs
 * Unified navigation component with avatar on left and two-row content on right
 */
const PageContext = ({ customBreadcrumbs }) => {
  const { 
    type, 
    pageName,
    profile, 
    repository, 
    branch,
    navigate 
  } = usePage();

  // Branch selector state
  const [branches, setBranches] = useState([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBranchDropdown && !event.target.closest('.page-context-branch-selector')) {
        setShowBranchDropdown(false);
        setBranchSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBranchDropdown]);

  // Fetch branches when repository changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (!repository || !(type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET)) {
        setBranches([]);
        return;
      }

      try {
        setLoadingBranches(true);
        const owner = repository.owner?.login || repository.full_name?.split('/')[0];
        const branchData = await githubService.getBranches(owner, repository.name);
        
        // Sort branches alphabetically as requested
        const sortedBranches = branchData.sort((a, b) => a.name.localeCompare(b.name));
        setBranches(sortedBranches);
      } catch (error) {
        console.error('Failed to fetch branches for context:', error);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [repository, type]);

  const handleBranchChange = (newBranch) => {
    // Update URL with new branch
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    
    // URL structure: /sgex/dashboard/{user}/{repo}/{branch}
    // After splitting: ['', 'sgex', 'dashboard', '{user}', '{repo}', '{branch}']
    // So branch is at index 5 when including the empty string at index 0
    if (pathParts.length >= 5) {
      if (pathParts.length === 5) {
        // No branch in URL, append it
        pathParts.push(newBranch);
      } else {
        // Branch exists, replace it
        pathParts[5] = newBranch;
      }
      navigate(pathParts.join('/'));
    }
    setShowBranchDropdown(false);
    setBranchSearchTerm('');
  };

  // Filter branches based on search term
  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(branchSearchTerm.toLowerCase())
  );

  const handleGitHubRepo = () => {
    if (repository?.html_url) {
      window.open(repository.html_url, '_blank');
    }
  };

  const handleGitHubUser = () => {
    if (profile?.html_url) {
      window.open(profile.html_url, '_blank');
    } else if (profile?.login) {
      window.open(`https://github.com/${profile.login}`, '_blank');
    }
  };

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    // If custom breadcrumbs are provided, use them
    if (customBreadcrumbs && customBreadcrumbs.length > 0) {
      return customBreadcrumbs;
    }

    // Generate automatic breadcrumbs based on page type
    const breadcrumbs = [];

    // Always start with home
    breadcrumbs.push({
      label: 'Home',
      path: '/',
      onClick: () => navigate('/')
    });

    // Add user context for user/DAK/asset pages
    if ((type === PAGE_TYPES.USER || type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && profile) {
      breadcrumbs.push({
        label: 'Select Repository',
        path: `/repositories`,
        onClick: () => navigate(`/repositories`, { state: { profile } })
      });
    }

    // Add DAK context for DAK/asset pages
    if ((type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && repository) {
      const branchPath = branch && branch !== 'main' ? `/${branch}` : '';
      const ownerLogin = repository.owner?.login || repository.full_name?.split('/')[0];
      if (ownerLogin) {
        breadcrumbs.push({
          label: 'DAK Components',
          path: `/sgex/dashboard/${ownerLogin}/${repository.name}${branchPath}`,
          onClick: () => navigate(`/sgex/dashboard/${ownerLogin}/${repository.name}${branchPath}`)
        });
      }
    }

    // Add current page context
    const pageLabels = {
      'landing': 'Home',
      'landing-unauthenticated': 'Home',
      'repositories': 'Select Repository', 
      'dak-selection': 'Select DAK',
      'dak-action': 'Choose DAK Action',
      'dashboard': 'DAK Components',
      'dak-dashboard': 'DAK Components',
      'actor-editor': 'Actor Definitions',
      'component-editor': 'Component Editor',
      'bpmn-viewer': 'Business Process Viewer',
      'bpmn-editor': 'Business Process Editor',
      'decision-support-logic': 'Decision Support Logic',
      'core-data-dictionary-viewer': 'Core Data Dictionary',
      'testing-viewer': 'Testing',
      'pages-manager': 'Pages',
      'documentation': 'Documentation'
    };

    const currentPageLabel = pageLabels[pageName] || pageName;
    
    // Don't add duplicate page labels
    if (breadcrumbs.length === 0 || breadcrumbs[breadcrumbs.length - 1].label !== currentPageLabel) {
      breadcrumbs.push({
        label: currentPageLabel,
        current: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't render if no context information to show
  if (!profile && !repository && breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className="page-context-container">
      <div className="page-context-content">
        {/* Avatar positioned to the far left */}
        {profile && (
          <img src={profile.avatar_url} alt={`${profile.login} avatar`} className="page-context-avatar" />
        )}
        
        <div className="page-context-info">
          {/* First row: Profile / Repository / Branch */}
          <div className="page-context-row page-context-user-repo">
            {profile && (
              <>
                <span className="page-context-profile" onClick={handleGitHubUser}>
                  {profile.login}
                </span>
                {repository && <span className="page-context-separator">/</span>}
              </>
            )}
            {repository && (
              <span className="page-context-repo">
                {repository.name}
              </span>
            )}
            {branch && (type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && (
              <>
                <span className="page-context-separator">@</span>
                <div className="page-context-branch-selector">
                  <button 
                    className="page-context-branch-btn"
                    onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                    title="Switch branch"
                  >
                    <span className="branch-icon">🌿</span>
                    {branch}
                    <span className="branch-dropdown-arrow">{showBranchDropdown ? '▲' : '▼'}</span>
                  </button>
                  
                  {showBranchDropdown && (
                    <div className="branch-dropdown">
                      <div className="branch-search">
                        <input
                          type="text"
                          placeholder="Search branches..."
                          value={branchSearchTerm}
                          onChange={(e) => setBranchSearchTerm(e.target.value)}
                          className="branch-search-input"
                          autoFocus
                        />
                      </div>
                      <div className="branch-list">
                        {loadingBranches ? (
                          <div className="branch-item loading">Loading branches...</div>
                        ) : filteredBranches.length > 0 ? (
                          filteredBranches.map((b) => (
                            <button
                              key={b.name}
                              className={`branch-item ${b.name === branch ? 'current' : ''}`}
                              onClick={() => handleBranchChange(b.name)}
                            >
                              <span className="branch-icon">🌿</span>
                              {b.name}
                              {b.name === branch && <span className="current-badge">current</span>}
                            </button>
                          ))
                        ) : (
                          <div className="branch-item no-results">
                            {branchSearchTerm ? 'No branches found' : 'No branches available'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Second row: Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <nav className="page-context-row page-context-breadcrumbs" aria-label="Breadcrumb navigation">
              <ol className="breadcrumb-list">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="breadcrumb-item">
                    {!crumb.current ? (
                      <>
                        <button 
                          className="breadcrumb-link" 
                          onClick={() => crumb.onClick ? crumb.onClick() : navigate(crumb.path)}
                          aria-label={`Navigate to ${crumb.label}`}
                        >
                          {crumb.label}
                        </button>
                        <span className="breadcrumb-separator" aria-hidden="true">›</span>
                      </>
                    ) : (
                      <span className="breadcrumb-current" aria-current="page">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
        
        {/* Actions area for DAK and Asset pages */}
        {(type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && repository && (
          <div className="page-context-actions">
            {/* Access badge */}
            <AccessBadge 
              owner={repository.owner?.login || profile?.login}
              repo={repository.name}
              branch={branch}
              className="context-access-badge"
            />
            {/* GitHub repository button */}
            <button className="context-btn github-repo-btn" onClick={handleGitHubRepo} title="Open repository on GitHub">
              <svg className="github-icon" viewBox="0 0 16 16" width="16" height="16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Repository
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageContext;
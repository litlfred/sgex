import React from 'react';
import { usePage, PAGE_TYPES } from './PageProvider';
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
        path: `/repositories/${profile.login}`,
        onClick: () => navigate(`/repositories/${profile.login}`, { state: { profile } })
      });
    }

    // Add DAK context for DAK/asset pages
    if ((type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && repository) {
      const branchPath = branch && branch !== 'main' ? `/${branch}` : '';
      const ownerLogin = repository.owner?.login || repository.full_name?.split('/')[0];
      if (ownerLogin) {
        breadcrumbs.push({
          label: 'DAK Components',
          path: `/dashboard/${ownerLogin}/${repository.name}${branchPath}`,
          onClick: () => navigate(`/dashboard/${ownerLogin}/${repository.name}${branchPath}`)
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
              <span className="page-context-repo" onClick={handleGitHubRepo}>
                {repository.name}
              </span>
            )}
            {branch && (type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && (
              <>
                <span className="page-context-separator">@</span>
                <span className="page-context-branch">{branch}</span>
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
      </div>
    </div>
  );
};

export default PageContext;
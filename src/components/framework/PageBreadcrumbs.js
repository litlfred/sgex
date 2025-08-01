import React from 'react';
import { usePage, PAGE_TYPES } from './PageProvider';
import './PageBreadcrumbs.css';

/**
 * Unified breadcrumb component for consistent navigation across all pages
 */
const PageBreadcrumbs = ({ customBreadcrumbs }) => {
  const { 
    type, 
    pageName, 
    profile, 
    repository, 
    branch,
    navigate 
  } = usePage();

  // If custom breadcrumbs are provided, use them
  if (customBreadcrumbs && customBreadcrumbs.length > 0) {
    return (
      <nav className="page-breadcrumbs" aria-label="Breadcrumb navigation">
        <ol className="breadcrumb-list">
          {customBreadcrumbs.map((crumb, index) => (
            <li key={index} className="breadcrumb-item">
              {index < customBreadcrumbs.length - 1 ? (
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
    );
  }

  // Generate automatic breadcrumbs based on page type
  const breadcrumbs = [];

  // Always start with home
  breadcrumbs.push({
    label: 'Select Profile',
    path: '/',
    onClick: () => navigate('/')
  });

  // Add user context for user/DAK/asset pages
  if ((type === PAGE_TYPES.USER || type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && profile) {
    breadcrumbs.push({
      label: 'Select Repository',
      path: `/dak-selection/${profile.login}`,
      onClick: () => navigate(`/dak-selection/${profile.login}`, { state: { profile, action: 'edit' } })
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

  // Don't render breadcrumbs for top-level pages with only one item
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="page-breadcrumbs" aria-label="Breadcrumb navigation">
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
  );
};

export default PageBreadcrumbs;
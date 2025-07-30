import React from 'react';
import { usePage, PAGE_TYPES } from './PageProvider';
import './PageContext.css';

/**
 * Page context component that displays profile/repo/branch information
 * Positioned above breadcrumbs as per navigation improvement requirements
 */
const PageContext = () => {
  const { 
    type, 
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

  // Don't render if no context information to show
  if (!profile && !repository) {
    return null;
  }

  return (
    <div className="page-context-container">
      <div className="page-context-content">
        {/* Avatar positioned to the left */}
        {profile && (
          <img src={profile.avatar_url} alt={`${profile.login} avatar`} className="page-context-avatar" />
        )}
        
        <div className="page-context-info">
          {/* First row: Profile / Repository */}
          <div className="page-context-row">
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
          </div>
          
          {/* Second row: Branch (if present) */}
          {branch && (type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && (
            <div className="page-context-row">
              <span className="page-context-separator">@</span>
              <span className="page-context-branch">{branch}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageContext;
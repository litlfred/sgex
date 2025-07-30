import React from 'react';
import { usePage, PAGE_TYPES } from './PageProvider';
import BranchSelector from '../BranchSelector';
import githubService from '../../services/githubService';
import './PageHeader.css';

/**
 * Consistent header component for all pages
 */
const PageHeader = () => {
  const { 
    type, 
    pageName, 
    profile, 
    repository, 
    branch, 
    isAuthenticated,
    navigate 
  } = usePage();

  const handleLogout = () => {
    githubService.logout();
    navigate('/');
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleGitHubUser = () => {
    if (profile?.html_url) {
      window.open(profile.html_url, '_blank');
    } else if (profile?.login) {
      window.open(`https://github.com/${profile.login}`, '_blank');
    }
  };

  const shouldShowGitHubRepo = type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET;
  const shouldShowBranchSelector = type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET;

  return (
    <header className="page-header">
      {/* Left side - Logo and context */}
      <div className="page-header-left">
        <div className="sgex-logo" onClick={handleHomeNavigation}>
          <h1>SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        
        {/* Context information */}
        {(type === PAGE_TYPES.USER || type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && profile && (
          <div className="page-context">
            <span className="context-separator">/</span>
            <span className="context-user" onClick={handleGitHubUser}>
              <img src={profile.avatar_url} alt={`${profile.login} avatar`} className="context-avatar" />
              {profile.login}
            </span>
          </div>
        )}
        
        {(type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && repository && (
          <div className="page-context">
            <span className="context-separator">/</span>
            <span className="context-repo" onClick={() => window.open(repository?.html_url, '_blank')}>
              {repository.name}
            </span>
          </div>
        )}
        
        {type === PAGE_TYPES.ASSET && branch && (
          <div className="page-context">
            <span className="context-separator">@</span>
            <span className="context-branch">{branch}</span>
          </div>
        )}
      </div>

      {/* Right side - Navigation and user controls */}
      <div className="page-header-right">
        {/* GitHub repository button (DAK and Asset pages) */}
        {shouldShowGitHubRepo && repository && (
          <button className="header-btn github-repo-btn" onClick={() => window.open(repository?.html_url, '_blank')}>
            <svg className="github-icon" viewBox="0 0 16 16" width="16" height="16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Repository
          </button>
        )}
        
        {/* Branch selector (DAK and Asset pages) */}
        {shouldShowBranchSelector && repository && (
          <div className="header-branch-selector">
            <BranchSelector
              repository={repository}
              selectedBranch={branch}
              onBranchChange={(newBranch) => {
                // Update URL with new branch
                const currentPath = window.location.pathname;
                const pathParts = currentPath.split('/');
                if (pathParts.length >= 5) {
                  pathParts[5] = newBranch; // Replace branch part
                  navigate(pathParts.join('/'));
                }
              }}
              className="header-branch-selector-component"
            />
          </div>
        )}
        
        {/* User info and controls */}
        {isAuthenticated && profile ? (
          <div className="user-controls">
            <div className="user-info" title="User Profile Menu - Click to access GitHub profile and logout">
              <img src={profile.avatar_url} alt="User avatar" className="user-avatar" />
              <span className="user-name">{profile.name || profile.login}</span>
            </div>
            <div className="user-dropdown">
              <button className="dropdown-item" onClick={handleGitHubUser}>
                <svg className="github-icon" viewBox="0 0 16 16" width="16" height="16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                GitHub Profile
              </button>
              <button className="dropdown-item logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button className="login-btn" onClick={handleHomeNavigation}>
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
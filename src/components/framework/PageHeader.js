import React, { useState, useEffect } from 'react';
import { usePage, PAGE_TYPES } from './PageProvider';
import BranchSelector from '../BranchSelector';
import AccessBadge from './AccessBadge';
import githubService from '../../services/githubService';
import userAccessService from '../../services/userAccessService';
import bookmarkService from '../../services/bookmarkService';
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
    asset,
    isAuthenticated,
    navigate 
  } = usePage();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBookmarkDropdown, setShowBookmarkDropdown] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  // Always fetch the authenticated user for login button display
  useEffect(() => {
    if (isAuthenticated) {
      const fetchAuthenticatedUser = async () => {
        try {
          // Use userAccessService to get the current user (handles both authenticated and demo users)
          const user = userAccessService.getCurrentUser();
          if (user) {
            setAuthenticatedUser(user);
          } else {
            // Fallback to githubService for backwards compatibility
            const githubUser = await githubService.getCurrentUser();
            setAuthenticatedUser(githubUser);
          }
        } catch (error) {
          console.debug('Could not fetch authenticated user:', error);
        }
      };
      
      fetchAuthenticatedUser();
    } else {
      setAuthenticatedUser(null);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    githubService.logout();
    navigate('/');
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleGitHubRepo = () => {
    if (repository?.html_url) {
      window.open(repository.html_url, '_blank');
    }
  };

  const handleGitHubUser = () => {
    // Always navigate to the authenticated user's GitHub profile, not the DAK owner's
    if (authenticatedUser?.html_url) {
      window.open(authenticatedUser.html_url, '_blank');
    } else if (authenticatedUser?.login) {
      window.open(`https://github.com/${authenticatedUser.login}`, '_blank');
    }
  };

  const handleBookmarkCurrentPage = () => {
    const context = {
      user: authenticatedUser?.login, // Use authenticated user for bookmarks
      repository,
      branch,
      asset
    };
    
    const currentUrl = window.location.pathname;
    bookmarkService.addBookmark(pageName, currentUrl, context);
    setShowBookmarkDropdown(false);
  };

  const handleRemoveBookmark = (bookmarkId) => {
    bookmarkService.removeBookmark(bookmarkId);
    // Force re-render by toggling dropdown
    setShowBookmarkDropdown(false);
    setTimeout(() => setShowBookmarkDropdown(true), 50);
  };

  const handleBookmarkNavigation = (bookmark) => {
    navigate(bookmark.url);
    setShowBookmarkDropdown(false);
  };

  const getCurrentPageBookmark = () => {
    return bookmarkService.getBookmarkByUrl(window.location.pathname);
  };

  const getBookmarksGrouped = () => {
    return bookmarkService.getBookmarksGroupedByPage();
  };

  const shouldShowGitHubRepo = type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET;
  const shouldShowBranchSelector = type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET;
  const currentBookmark = getCurrentPageBookmark();
  const bookmarksGrouped = getBookmarksGrouped();

  return (
    <header className="page-header">
      {/* Left side - Logo and context */}
      <div className="page-header-left">
        <div className="sgex-logo" onClick={handleHomeNavigation}>
          <h1>SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>

      </div>

      {/* Right side - Navigation and user controls */}
      <div className="page-header-right">
        {/* Access badge for DAK and Asset pages */}
        {(type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) && repository && (
          <AccessBadge 
            owner={repository.owner?.login || profile?.login}
            repo={repository.name}
            branch={branch}
            className="header-access-badge"
          />
        )}
        
        {/* GitHub repository button (DAK and Asset pages) */}
        {shouldShowGitHubRepo && repository && (
          <button className="header-btn github-repo-btn" onClick={handleGitHubRepo}>
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
        {(isAuthenticated || profile?.isDemo) && authenticatedUser ? (
          <div className="user-controls">
            <div className="user-info" onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <img src={authenticatedUser.avatar_url} alt="User avatar" className="user-avatar" />
              <span className="user-name">{authenticatedUser.name || authenticatedUser.login}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            {showUserDropdown && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={handleGitHubUser}>
                  <svg className="github-icon" viewBox="0 0 16 16" width="16" height="16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  GitHub Profile
                </button>
                
                {/* Add/Remove current page bookmark - moved to same level as bookmarks */}
                {currentBookmark ? (
                  <button 
                    className="dropdown-item bookmark-action"
                    onClick={() => handleRemoveBookmark(currentBookmark.id)}
                  >
                    ⭐ Remove Bookmark
                  </button>
                ) : (
                  <button 
                    className="dropdown-item bookmark-action"
                    onClick={handleBookmarkCurrentPage}
                  >
                    ☆ Add Bookmark
                  </button>
                )}
                
                {/* Bookmarks submenu */}
                <div className="bookmarks-section">
                  <div className="dropdown-item bookmarks-header" onClick={() => setShowBookmarkDropdown(!showBookmarkDropdown)}>
                    📖 Bookmarks
                    <span className="dropdown-arrow">{showBookmarkDropdown ? '▲' : '▼'}</span>
                  </div>
                  
                  {showBookmarkDropdown && (
                    <div className="bookmarks-dropdown">
                      {/* Bookmarks list grouped by page */}
                      {bookmarksGrouped.length > 0 ? (
                        <div className="bookmarks-list">
                          {bookmarksGrouped.map(group => (
                            <div key={group.pageName} className="bookmark-group">
                              <div className="bookmark-group-header">{group.pageName}</div>
                              {group.bookmarks.map(bookmark => (
                                <div key={bookmark.id} className="bookmark-item">
                                  <button 
                                    className="bookmark-link"
                                    onClick={() => handleBookmarkNavigation(bookmark)}
                                    title={bookmark.url}
                                  >
                                    {bookmark.title}
                                  </button>
                                  <button 
                                    className="bookmark-remove"
                                    onClick={() => handleRemoveBookmark(bookmark.id)}
                                    title="Remove bookmark"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-bookmarks">No bookmarks yet</div>
                      )}
                    </div>
                  )}
                </div>
                
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
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
import React, { useState, useEffect, useRef } from 'react';
import { usePage, PAGE_TYPES } from './PageProvider';
import BranchSelector from '../BranchSelector';
import githubService from '../../services/githubService';
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
    isAuthenticated,
    navigate,
    location
  } = usePage();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isCurrentPageBookmarked, setIsCurrentPageBookmarked] = useState(false);
  const dropdownRef = useRef(null);

  // Load bookmarks and check current page status
  useEffect(() => {
    const loadBookmarks = () => {
      const allBookmarks = bookmarkService.getBookmarks();
      setBookmarks(allBookmarks);
      
      const currentUrl = window.location.pathname + (window.location.search || '');
      setIsCurrentPageBookmarked(bookmarkService.isBookmarked(currentUrl));
    };

    loadBookmarks();
    
    // Listen for bookmark changes from other tabs/components
    const handleStorageChange = (event) => {
      if (event.key === 'sgex-bookmarks') {
        loadBookmarks();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    githubService.logout();
    navigate('/');
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleDocumentation = () => {
    window.open('/sgex/docs/overview', '_blank');
  };

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

  const addBookmark = () => {
    const bookmark = bookmarkService.createBookmarkFromFramework({ 
      type, 
      pageName, 
      profile, 
      repository, 
      branch,
      location: window.location
    });
    if (bookmarkService.addBookmark(bookmark)) {
      setIsCurrentPageBookmarked(true);
      setBookmarks(bookmarkService.getBookmarks());
    }
  };

  const removeBookmark = (bookmarkId) => {
    if (bookmarkService.removeBookmark(bookmarkId)) {
      const updatedBookmarks = bookmarkService.getBookmarks();
      setBookmarks(updatedBookmarks);
      
      // Check if current page is still bookmarked
      const currentUrl = window.location.pathname + (window.location.search || '');
      setIsCurrentPageBookmarked(bookmarkService.isBookmarked(currentUrl));
    }
  };

  const navigateToBookmark = (bookmark) => {
    setShowUserDropdown(false);
    navigate(bookmark.url, { state: bookmark.data });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const groupBookmarksByPageType = (bookmarks) => {
    return bookmarks.reduce((groups, bookmark) => {
      const pageType = bookmark.pageType || 'Other';
      if (!groups[pageType]) {
        groups[pageType] = [];
      }
      groups[pageType].push(bookmark);
      return groups;
    }, {});
  };

  const shouldShowDocumentationButton = pageName !== 'documentation';
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
            <span className="context-repo" onClick={handleGitHubRepo}>
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
        {/* Documentation button (except on documentation page) */}
        {shouldShowDocumentationButton && (
          <button className="header-btn documentation-btn" onClick={handleDocumentation}>
            📖 Documentation
          </button>
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
        {isAuthenticated && profile ? (
          <div className="user-controls" ref={dropdownRef}>
            <div className="user-info" onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <img src={profile.avatar_url} alt="User avatar" className="user-avatar" />
              <span className="user-name">{profile.name || profile.login}</span>
              <span className={`dropdown-arrow ${showUserDropdown ? 'open' : ''}`}>▾</span>
            </div>
            {showUserDropdown && (
              <div className="user-dropdown">
                {/* Bookmark current page section */}
                <div className="dropdown-section">
                  <button 
                    className={`bookmark-current-btn ${isCurrentPageBookmarked ? 'bookmarked' : ''}`}
                    onClick={addBookmark}
                    disabled={isCurrentPageBookmarked}
                  >
                    {isCurrentPageBookmarked ? (
                      <>
                        <span className="bookmark-icon">★</span>
                        Page Bookmarked
                      </>
                    ) : (
                      <>
                        <span className="bookmark-icon">☆</span>
                        Bookmark Page
                      </>
                    )}
                  </button>
                </div>

                {/* Bookmarks list organized by page type */}
                {bookmarks.length > 0 && (
                  <>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-section">
                      <div className="dropdown-section-title">Bookmarks</div>
                      <div className="bookmarks-list">
                        {Object.entries(groupBookmarksByPageType(bookmarks))
                          .sort(([a], [b]) => a.localeCompare(b)) // Sort page types alphabetically
                          .map(([pageType, pageBookmarks]) => (
                            <div key={pageType} className="bookmark-page-group">
                              <div className="bookmark-page-type">{pageType}</div>
                              {pageBookmarks.map((bookmark) => (
                                <div key={bookmark.id} className="bookmark-item">
                                  <button 
                                    className="bookmark-link"
                                    onClick={() => navigateToBookmark(bookmark)}
                                    title={bookmark.title}
                                  >
                                    <span className="bookmark-title">{bookmark.title}</span>
                                    <span className="bookmark-date">{formatDate(bookmark.timestamp)}</span>
                                  </button>
                                  <button 
                                    className="bookmark-remove"
                                    onClick={() => removeBookmark(bookmark.id)}
                                    title="Remove bookmark"
                                    aria-label="Remove bookmark"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {/* User menu items */}
                <div className="dropdown-divider"></div>
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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from './PageProvider';
import { useLocation } from 'react-router-dom';
import githubService from '../../services/githubService';
import userAccessService from '../../services/userAccessService';
import bookmarkService from '../../services/bookmarkService';
import samlAuthService from '../../services/samlAuthService';
import SAMLAuthModal from '../SAMLAuthModal';
import PreviewBadge from '../PreviewBadge';
import { navigateToWelcomeWithFocus } from '../../utils/navigationUtils';
import logger from '../../utils/logger';

/**
 * Consistent header component for all pages
 */
const PageHeader = () => {
  const { 
    pageName, 
    profile, 
    repository, 
    branch, 
    asset,
    isAuthenticated,
    navigate 
  } = usePage();

  const location = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBookmarkDropdown, setShowBookmarkDropdown] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [samlModalOpen, setSamlModalOpen] = useState(false);
  const [samlModalInfo, setSamlModalInfo] = useState(null);
  const [samlStatuses, setSamlStatuses] = useState({});
  const [relevantOrgs, setRelevantOrgs] = useState([]);
  const samlRefreshIntervalRef = useRef(null);
  const componentLogger = logger.getLogger('PageHeader');

  // Register SAML modal callback
  useEffect(() => {
    samlAuthService.registerModalCallback((samlInfo) => {
      componentLogger.debug('SAML modal callback triggered', { 
        organization: samlInfo.organization 
      });
      setSamlModalInfo(samlInfo);
      setSamlModalOpen(true);
    });
  }, [componentLogger]);

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

  // Check SAML authorization status for an organization
  const checkSAMLStatus = useCallback(async (org) => {
    try {
      componentLogger.debug('Checking SAML status for organization', { org });
      
      // Try to fetch organization data as a test
      const isAuthorized = await samlAuthService.checkAuthorizationStatus(
        org,
        async () => {
          await githubService.getOrganization(org);
        }
      );
      
      return isAuthorized;
    } catch (error) {
      componentLogger.debug('Error checking SAML status', {
        org,
        error: error.message
      });
      return false;
    }
  }, [componentLogger]);

  // Refresh SAML statuses for all relevant organizations
  const refreshSAMLStatuses = useCallback(async () => {
    if (!isAuthenticated || relevantOrgs.length === 0) return;

    componentLogger.debug('Refreshing SAML statuses', {
      organizations: relevantOrgs
    });

    const newStatuses = {};
    
    for (const org of relevantOrgs) {
      const authorized = await checkSAMLStatus(org);
      newStatuses[org] = authorized;
    }

    setSamlStatuses(newStatuses);
    
    componentLogger.debug('SAML statuses updated', { statuses: newStatuses });
  }, [isAuthenticated, relevantOrgs, checkSAMLStatus, componentLogger]);

  // Start/stop SAML status refresh when dropdown opens/closes
  useEffect(() => {
    if (showUserDropdown && relevantOrgs.length > 0) {
      // Initial refresh
      refreshSAMLStatuses();
      
      // Start 10-second refresh interval
      samlRefreshIntervalRef.current = setInterval(() => {
        refreshSAMLStatuses();
      }, 10000);

      componentLogger.debug('Started SAML status refresh interval');
    } else {
      // Stop refresh interval when dropdown closes
      if (samlRefreshIntervalRef.current) {
        clearInterval(samlRefreshIntervalRef.current);
        samlRefreshIntervalRef.current = null;
        componentLogger.debug('Stopped SAML status refresh interval');
      }
    }

    return () => {
      if (samlRefreshIntervalRef.current) {
        clearInterval(samlRefreshIntervalRef.current);
        samlRefreshIntervalRef.current = null;
      }
    };
  }, [showUserDropdown, relevantOrgs, refreshSAMLStatuses, componentLogger]);

  // Detect relevant organizations from user's context
  useEffect(() => {
    if (isAuthenticated && authenticatedUser) {
      const orgs = new Set();
      
      // Add organization from current context
      if (profile?.login && profile.type === 'Organization') {
        orgs.add(profile.login);
      }
      
      // Add WHO organization if accessing WHO repos
      if (repository?.includes('who') || repository?.includes('WHO')) {
        orgs.add('WorldHealthOrganization');
      }
      
      // Add any pending SAML organizations
      const pendingOrgs = samlAuthService.getPendingOrganizations();
      pendingOrgs.forEach(org => orgs.add(org));

      const orgList = Array.from(orgs);
      setRelevantOrgs(orgList);
      
      componentLogger.debug('Relevant organizations detected', { 
        organizations: orgList 
      });
    }
  }, [isAuthenticated, authenticatedUser, profile, repository, componentLogger]);

  const handleLogout = () => {
    // Stop SAML refresh interval
    if (samlRefreshIntervalRef.current) {
      clearInterval(samlRefreshIntervalRef.current);
      samlRefreshIntervalRef.current = null;
    }
    
    githubService.logout();
    navigate('/');
  };

  const handleInitiateSAMLAuth = (org) => {
    componentLogger.userAction('User initiated SAML authorization from dropdown', { 
      organization: org 
    });
    
    setSamlModalInfo({
      organization: org,
      repository: null,
      authorizationUrl: samlAuthService.getSAMLAuthorizationUrl(org),
      message: 'Manual SAML authorization requested'
    });
    setSamlModalOpen(true);
    setShowUserDropdown(false);
  };

  const handleHomeNavigation = () => {
    navigateToWelcomeWithFocus(navigate, location);
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

  const currentBookmark = getCurrentPageBookmark();
  const bookmarksGrouped = getBookmarksGrouped();

  return (
    <>
      {/* SAML Authorization Modal */}
      <SAMLAuthModal
        isOpen={samlModalOpen}
        onClose={() => {
          setSamlModalOpen(false);
          setSamlModalInfo(null);
          if (samlModalInfo?.organization) {
            samlAuthService.markModalClosed(samlModalInfo.organization);
          }
        }}
        samlInfo={samlModalInfo}
        onAuthorizationComplete={(data) => {
          componentLogger.info('SAML authorization completed', data);
          // Refresh SAML statuses after successful authorization
          refreshSAMLStatuses();
        }}
      />
      
      <header className="page-header">
        {/* Left side - Logo and context */}
        <div className="page-header-left">
        <button 
          className="sgex-logo" 
          onClick={handleHomeNavigation}
          onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleHomeNavigation() : null}
          style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
        >
          <h1>SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </button>
        
        {/* Preview badge for non-main branches */}
        <PreviewBadge />
      </div>

      {/* Right side - Navigation and user controls */}
      <div className="page-header-right">
        {/* User info and controls */}
        {(isAuthenticated || profile?.isDemo) && authenticatedUser ? (
          <div className="user-controls">
            <button 
              className="user-info" 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowUserDropdown(!showUserDropdown)}
              style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <img src={authenticatedUser.avatar_url} alt="User avatar" className="user-avatar" />
              <span className="user-name">{authenticatedUser.name || authenticatedUser.login}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {showUserDropdown && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={handleGitHubUser}>
                  <svg className="github-icon" viewBox="0 0 16 16" width="16" height="16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  GitHub Profile
                </button>
                
                {/* SAML Authorization Status */}
                {relevantOrgs.length > 0 && (
                  <div className="saml-status-section">
                    <div className="dropdown-section-header">SAML Authorization</div>
                    {relevantOrgs.map(org => (
                      <div key={org} className="saml-status-item">
                        <div className="saml-org-info">
                          <span className="saml-org-name">{org}</span>
                          <span className={`saml-status-badge ${samlStatuses[org] ? 'authorized' : 'not-authorized'}`}>
                            {samlStatuses[org] === undefined ? '...' : 
                             samlStatuses[org] ? '✓ Authorized' : '⚠ Not Authorized'}
                          </span>
                        </div>
                        {!samlStatuses[org] && samlStatuses[org] !== undefined && (
                          <button 
                            className="saml-authorize-link"
                            onClick={() => handleInitiateSAMLAuth(org)}
                          >
                            Authorize Now
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
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
                  <button 
                    className="dropdown-item bookmarks-header" 
                    onClick={() => setShowBookmarkDropdown(!showBookmarkDropdown)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowBookmarkDropdown(!showBookmarkDropdown)}
                  >
                    📖 Bookmarks
                    <span className="dropdown-arrow">{showBookmarkDropdown ? '▲' : '▼'}</span>
                  </button>
                  
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
          <button 
            className="login-btn" 
            onClick={handleHomeNavigation}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleHomeNavigation()}
            aria-label="Navigate to login page"
          >
            Login
          </button>
        )}
      </div>
      </header>
    </>
  );
};

export default PageHeader;
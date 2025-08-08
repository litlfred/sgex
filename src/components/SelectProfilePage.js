import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';
import { PageLayout } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';

const SelectProfilePage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dakCounts, setDakCounts] = useState({});
  const [warningMessage, setWarningMessage] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Load cached DAK counts without initiating any scanning
  const loadCachedDakCounts = useCallback((userData, orgsData) => {
    if (!githubService.isAuth()) {
      return;
    }

    const counts = {};
    
    // Check cache for user's personal repositories
    if (userData) {
      const userCache = repositoryCacheService.getCachedRepositories(userData.login, 'user');
      if (userCache && userCache.repositories) {
        counts[`user-${userData.login}`] = userCache.repositories.length;
      }
    }
    
    // Check cache for organization repositories
    orgsData.forEach(org => {
      const orgCache = repositoryCacheService.getCachedRepositories(org.login, 'org');
      if (orgCache && orgCache.repositories) {
        counts[`org-${org.login}`] = orgCache.repositories.length;
      }
    });
    
    setDakCounts(counts);
  }, []);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let userData = null;
      
      if (isAuthenticated) {
        // Check token permissions first for authenticated users
        await githubService.checkTokenPermissions();
        
        // Fetch user data using GitHub service
        userData = await githubService.getCurrentUser();
        setUser(userData);
      } else {
        // For unauthenticated users, set a demo user profile
        userData = {
          login: 'anonymous-user',
          name: 'Anonymous User',
          avatar_url: 'https://github.com/github.png',
          type: 'User',
          isAnonymous: true
        };
        setUser(userData);
      }
      
      // Fetch organizations inline
      let orgsData = [];
      
      if (isAuthenticated) {
        try {
          orgsData = await githubService.getUserOrganizations();
        } catch (error) {
          console.error('Error fetching organizations:', error);
          orgsData = [];
        }
      }
      
      // Always ensure WHO organization is included (using public API)
      try {
        const whoOrganization = await githubService.getWHOOrganization();
        
        // Check if WHO organization is already in the list
        const whoIndex = orgsData.findIndex(org => org.login === 'WorldHealthOrganization');
        
        if (whoIndex >= 0) {
          // Replace existing WHO org with fresh data and ensure isWHO flag
          orgsData[whoIndex] = { ...orgsData[whoIndex], ...whoOrganization, isWHO: true };
        } else {
          // Add WHO organization at the beginning of the list
          orgsData.unshift(whoOrganization);
        }
      } catch (whoError) {
        console.warn('Could not fetch WHO organization data, using fallback:', whoError);
        
        // Fallback to hardcoded WHO organization
        const whoOrganization = {
          id: 'who-organization',
          login: 'WorldHealthOrganization',
          name: 'World Health Organization',
          description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
          avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
          html_url: 'https://github.com/WorldHealthOrganization',
          type: 'Organization',
          isWHO: true
        };
        
        // Check if WHO organization is already in the list
        const hasWHO = orgsData.some(org => org.login === 'WorldHealthOrganization');
        
        if (!hasWHO) {
          // Add WHO organization at the beginning of the list
          orgsData.unshift(whoOrganization);
        } else {
          // Ensure existing WHO organization has the isWHO flag
          orgsData = orgsData.map(org => 
            org.login === 'WorldHealthOrganization' 
              ? { ...org, isWHO: true }
              : org
          );
        }
      }
      
      setOrganizations(orgsData);
      
      // Load cached DAK counts (if available and authenticated)
      if (isAuthenticated) {
        loadCachedDakCounts(userData, orgsData);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      if (isAuthenticated) {
        setError('Failed to fetch user data. Please check your connection and try again.');
        setIsAuthenticated(false);
        githubService.logout(); // Use secure logout method
      } else {
        // For unauthenticated users, show limited error message
        setError('Unable to fetch additional data. Some features may be limited.');
      }
    } finally {
      setLoading(false);
    }
  }, [loadCachedDakCounts, isAuthenticated]);

  // Initial authentication check - don't redirect if not authenticated
  useEffect(() => {
    const initializeAuth = () => {
      // Try to initialize from securely stored token
      const success = githubService.initializeFromStoredToken();
      if (success) {
        setIsAuthenticated(true);
      } else {
        // Don't redirect - allow unauthenticated access
        setIsAuthenticated(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle warning message from navigation state
  useEffect(() => {
    if (location.state?.warningMessage) {
      setWarningMessage(location.state.warningMessage);
      // Clear the warning message from navigation state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch user data when component mounts or authentication state changes
  useEffect(() => {
    // Always fetch data regardless of authentication state
    if (!user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  const handleProfileSelect = (event, profile) => {
    const navigationState = { profile };
    handleNavigationClick(event, `/dak-action/${profile.login}`, navigate, navigationState);
  };

  const handleDismissWarning = () => {
    setWarningMessage(null);
  };

  // Don't render anything if still loading initial state
  if (loading && !user) {
    return (
      <PageLayout pageName="select-profile">
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading profile data...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="select-profile">
      <div className="select-profile-content">
        {warningMessage && (
          <div className="warning-message">
            <div className="warning-content">
              <div className="warning-header">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">{warningMessage}</span>
              </div>
              <button 
                className="warning-dismiss" 
                onClick={handleDismissWarning}
                aria-label="Dismiss warning"
              >
                × Dismiss
              </button>
            </div>
          </div>
        )}
        
        {/* Authentication Status Indicator */}
        {!isAuthenticated && (
          <div className="auth-status-message">
            <div className="auth-status-content">
              <span className="auth-status-icon">🔓</span>
              <span className="auth-status-text">
                You are browsing in unauthenticated mode. Some features like saving to GitHub will be disabled, but you can still explore and use local staging.
              </span>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Loading profile data...</p>
          </div>
        ) : (
          <div className="profile-selection">
            <h2>{t('organization.select')}</h2>
            <p>{t('organization.personal')}:</p>
            
            {error && <div className="error-message">{error}</div>}
            
            {/* Horizontal profile grid */}
            <div className="profile-grid-horizontal">
              {/* Personal Profile - Show for authenticated users or anonymous access */}
              {(isAuthenticated || user?.isAnonymous) && (
                <div 
                  className="profile-card"
                  onClick={(event) => handleProfileSelect(event, { type: 'user', ...user })}
                >
                  <div className="profile-card-header">
                    <img src={user?.avatar_url} alt="Personal profile" />
                    {dakCounts[`user-${user?.login}`] > 0 && (
                      <div className="dak-count-badge">
                        {dakCounts[`user-${user?.login}`]}
                      </div>
                    )}
                  </div>
                  <h3>{user?.name || user?.login}</h3>
                  <p>{user?.isAnonymous ? 'Anonymous browsing' : 'Personal repositories'}</p>
                  <div className="profile-badges">
                    <span className="profile-type">
                      {user?.isAnonymous ? 'Anonymous' : 'Personal'}
                    </span>
                    {user?.isAnonymous && (
                      <span className="auth-badge">Limited Access</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Organization Profiles */}
              {organizations.map((org) => (
                <div 
                  key={org.login}
                  className={`profile-card ${org.isWHO ? 'who-org' : ''}`}
                  onClick={(event) => handleProfileSelect(event, { type: 'org', ...org })}
                >
                  <div className="profile-card-header">
                    <img 
                      src={org.avatar_url || `https://github.com/${org.login}.png`} 
                      alt={`${org.name || org.login} organization`} 
                    />
                    {dakCounts[`org-${org.login}`] > 0 && (
                      <div className="dak-count-badge">
                        {dakCounts[`org-${org.login}`]}
                      </div>
                    )}
                  </div>
                  <h3>{org.name || org.login}</h3>
                  <p>@{org.login}</p>
                  <div className="profile-badges">
                    <span className="profile-type">{t('organization.organizations')}</span>
                    {org.isWHO && <span className="who-badge">WHO Official</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SelectProfilePage;
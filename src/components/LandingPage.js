import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';
import PATLogin from './PATLogin';
import { PageLayout } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';
import './LandingPage.css';

const LandingPage = () => {
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
      // Check token permissions first
      await githubService.checkTokenPermissions();
      
      // Fetch user data using GitHub service
      const userData = await githubService.getCurrentUser();
      setUser(userData);
      
      // Fetch organizations inline
      let orgsData = [];
      
      if (githubService.isAuth()) {
        try {
          orgsData = await githubService.getUserOrganizations();
        } catch (error) {
          console.error('Error fetching organizations:', error);
          orgsData = [];
        }
      }
      
      // Always ensure WHO organization is included
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
      
      // Load cached DAK counts (if available)
      loadCachedDakCounts(userData, orgsData);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data. Please check your connection and try again.');
      setIsAuthenticated(false);
      sessionStorage.removeItem('github_token');
      localStorage.removeItem('github_token');
    } finally {
      setLoading(false);
    }
  }, [loadCachedDakCounts]); // Remove dependencies to prevent circular re-renders

  // Initial authentication check - runs once on mount
  useEffect(() => {
    const initializeAuth = () => {
      // Check if user is already authenticated from previous session
      const token = sessionStorage.getItem('github_token') || localStorage.getItem('github_token');
      if (token) {
        const success = githubService.authenticate(token);
        if (success) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('github_token');
          localStorage.removeItem('github_token');
        }
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

  // Fetch user data when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUserData();
    }
  }, [isAuthenticated, user, fetchUserData]);

  const handleAuthSuccess = (token, octokitInstance) => {
    // Store token in session storage for this session
    sessionStorage.setItem('github_token', token);
    
    // Use the provided Octokit instance directly
    githubService.authenticateWithOctokit(octokitInstance);
    
    setIsAuthenticated(true);
    setError(null);
    fetchUserData();
  };

  const handleProfileSelect = (event, profile) => {
    const navigationState = { profile };
    handleNavigationClick(event, `/dak-action/${profile.login}`, navigate, navigationState);
  };

  const handleDemoMode = (event) => {
    // Create a mock profile for demonstration purposes
    const demoProfile = {
      login: 'demo-user',
      name: 'Demo User',
      avatar_url: 'https://github.com/github.png',
      type: 'User',
      isDemo: true
    };
    
    // Navigate directly to DAK selection with edit action to show enhanced scanning
    const navigationState = {
      profile: demoProfile,
      action: 'edit'
    };
    
    handleNavigationClick(event, `/dak-selection/${demoProfile.login}`, navigate, navigationState);
  };

  const handleDismissWarning = () => {
    setWarningMessage(null);
  };

  if (!isAuthenticated) {
    return (
      <PageLayout pageName="landing-unauthenticated">
        <div className="landing-content">
          {warningMessage && (
            <div className="warning-message">
              <div className="warning-content">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">{warningMessage}</span>
                <button 
                  className="warning-dismiss" 
                  onClick={handleDismissWarning}
                  aria-label="Dismiss warning"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          <div className="welcome-section">
            <h2>{t('landing.welcome')}</h2>
            <p>
              {t('app.description')}
            </p>
            
            <div className="auth-section">
              <p>{t('auth.signInWithPAT')}:</p>
              <PATLogin 
                onAuthSuccess={handleAuthSuccess}
              />
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
            
            <div className="demo-section">
              <p>Want to try without authentication?</p>
              <button 
                onClick={handleDemoMode}
                className="demo-mode-btn"
              >
                🎭 Try Demo Mode
              </button>
              <p className="demo-note">
                Demo mode showcases the enhanced DAK scanning display with mock data.
              </p>
            </div>
            
            <div className="info-section">
              <p>
                Need help getting started? Check out our comprehensive{' '}
                <a href="/sgex/docs/overview" className="doc-link">
                  documentation
                </a>{' '}
                to learn more about SGEX Workbench and DAK components.
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="landing-authenticated">
      <div className="landing-content">
        {warningMessage && (
          <div className="warning-message">
            <div className="warning-content">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">{warningMessage}</span>
              <button 
                className="warning-dismiss" 
                onClick={handleDismissWarning}
                aria-label="Dismiss warning"
              >
                ×
              </button>
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
            
            <div className="profile-grid">
              {/* Personal Profile */}
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
                <p>Personal repositories</p>
                <div className="profile-badges">
                  <span className="profile-type">Personal</span>
                </div>
              </div>
              
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

export default LandingPage;
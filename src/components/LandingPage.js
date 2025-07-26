import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import PATLogin from './PATLogin';
import './LandingPage.css';

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dakCounts, setDakCounts] = useState({});
  const [countingInProgress, setCountingInProgress] = useState(false);
  const navigate = useNavigate();

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
      
      // Prepare profiles for counting DAK repositories
      const profiles = [
        { login: userData.login, type: 'user' },
        ...orgsData.map(org => ({ login: org.login, type: 'org' }))
      ];
      
      // Fetch DAK repository counts inline
      if (!githubService.isAuth()) {
        setDakCounts({});
        return;
      }
      
      setCountingInProgress(true);
      const counts = {};
      
      try {
        // Count DAK repositories for each profile in parallel
        const countPromises = profiles.map(async (profile) => {
          try {
            const repositories = await githubService.getSmartGuidelinesRepositories(
              profile.login, 
              profile.type === 'user' ? 'user' : 'org'
            );
            return { 
              key: `${profile.type}-${profile.login}`, 
              count: repositories.length 
            };
          } catch (error) {
            console.warn(`Failed to count DAK repos for ${profile.login}:`, error);
            return { 
              key: `${profile.type}-${profile.login}`, 
              count: 0 
            };
          }
        });
        
        const results = await Promise.all(countPromises);
        results.forEach(({ key, count }) => {
          counts[key] = count;
        });
        
      } catch (error) {
        console.error('Error fetching DAK repository counts:', error);
      } finally {
        setCountingInProgress(false);
      }
      
      setDakCounts(counts);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data. Please check your connection and try again.');
      setIsAuthenticated(false);
      sessionStorage.removeItem('github_token');
      localStorage.removeItem('github_token');
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent circular re-renders

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

  const handleLogout = () => {
    githubService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setOrganizations([]);
    setError(null);
  };

  const handleProfileSelect = (profile) => {
    navigate('/dak-action', { state: { profile } });
  };

  const handleDemoMode = () => {
    // Create a mock profile for demonstration purposes
    const demoProfile = {
      login: 'demo-user',
      name: 'Demo User',
      avatar_url: 'https://github.com/github.png',
      type: 'User',
      isDemo: true
    };
    
    // Navigate directly to DAK selection with edit action to show enhanced scanning
    navigate('/dak-selection', {
      state: {
        profile: demoProfile,
        action: 'edit'
      }
    });
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="landing-page">
        <div className="landing-header">
          <div className="who-branding">
            <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
            <p className="subtitle">WHO SMART Guidelines Exchange</p>
          </div>
          <div className="header-nav">
            <a href="/sgex/docs/overview" className="nav-link">📖 Documentation</a>
          </div>
        </div>
        
        <div className="landing-content">
          <div className="welcome-section">
            <h2>Welcome to SGEX Workbench</h2>
            <p>
              A browser-based, standards-compliant collaborative editor for 
              WHO SMART Guidelines Digital Adaptation Kits (DAKs).
            </p>
            
            <div className="auth-section">
              <p>Connect your GitHub account to get started:</p>
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
        
        <div className="landing-mascot">
          <img src="/sgex/sgex-mascot.png" alt="SGEX Helper" className="landing-mascot-img" />
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="landing-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="user-info">
          <img src={user?.avatar_url} alt="User avatar" className="user-avatar" />
          <span>{user?.name || user?.login}</span>
          <a href="/sgex/docs/overview" className="nav-link">📖 Documentation</a>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      <div className="landing-content">
        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Loading profile data...</p>
          </div>
        ) : (
          <div className="profile-selection">
            <h2>Select Profile or Organization</h2>
            <p>Choose the GitHub profile or organization containing your DAK repositories:</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="profile-grid">
              {/* Personal Profile */}
              <div 
                className="profile-card"
                onClick={() => handleProfileSelect({ type: 'user', ...user })}
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
                  {countingInProgress && (
                    <span className="counting-badge">Scanning...</span>
                  )}
                </div>
              </div>
              
              {/* Organization Profiles */}
              {organizations.map((org) => (
                <div 
                  key={org.login}
                  className={`profile-card ${org.isWHO ? 'who-org' : ''}`}
                  onClick={() => handleProfileSelect({ type: 'org', ...org })}
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
                    <span className="profile-type">Organization</span>
                    {org.isWHO && <span className="who-badge">WHO Official</span>}
                    {countingInProgress && (
                      <span className="counting-badge">Scanning...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="landing-mascot">
        <img src="/sgex/sgex-mascot.png" alt="SGEX Helper" className="landing-mascot-img" />
      </div>
    </div>
  );
};

export default LandingPage;
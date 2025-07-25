import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import DeviceFlowLogin from './DeviceFlowLogin';
import { DEFAULT_SCOPES } from '../services/../config/oauth';
import './LandingPage.css';

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated from previous session
    const token = sessionStorage.getItem('github_token') || localStorage.getItem('github_token');
    if (token) {
      const success = githubService.authenticate(token);
      if (success) {
        setIsAuthenticated(true);
        fetchUserData();
      } else {
        sessionStorage.removeItem('github_token');
        localStorage.removeItem('github_token');
      }
    }
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check token permissions first
      await githubService.checkTokenPermissions();
      
      // Fetch user data using GitHub service
      const userData = await githubService.getCurrentUser();
      setUser(userData);
      
      // Fetch organizations separately
      await fetchOrganizations();
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data. Please check your connection and try again.');
      setIsAuthenticated(false);
      sessionStorage.removeItem('github_token');
      localStorage.removeItem('github_token');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      // Fetch organizations
      let orgsData = [];
      
      if (githubService.isAuth()) {
        orgsData = await githubService.getUserOrganizations();
      }
      
      // Always ensure WHO organization is included
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
      
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      
      // Even if organizations fail, still show WHO organization
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
      setOrganizations([whoOrganization]);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="landing-page">
        <div className="landing-header">
          <div className="who-branding">
            <h1>SGEX Workbench</h1>
            <p className="subtitle">WHO SMART Guidelines Exchange</p>
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
              <DeviceFlowLogin 
                onAuthSuccess={handleAuthSuccess}
                requiredScopes={DEFAULT_SCOPES}
              />
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="landing-header">
        <div className="who-branding">
          <h1>SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="user-info">
          <img src={user?.avatar_url} alt="User avatar" className="user-avatar" />
          <span>{user?.name || user?.login}</span>
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
                <img src={user?.avatar_url} alt="Personal profile" />
                <h3>{user?.name || user?.login}</h3>
                <p>Personal repositories</p>
                <span className="profile-type">Personal</span>
              </div>
              
              {/* Organization Profiles */}
              {organizations.map((org) => (
                <div 
                  key={org.login}
                  className={`profile-card ${org.isWHO ? 'who-org' : ''}`}
                  onClick={() => handleProfileSelect({ type: 'org', ...org })}
                >
                  <img 
                    src={org.avatar_url || `https://github.com/${org.login}.png`} 
                    alt={`${org.name || org.login} organization`} 
                  />
                  <h3>{org.name || org.login}</h3>
                  <p>@{org.login}</p>
                  <div className="profile-badges">
                    <span className="profile-type">Organization</span>
                    {org.isWHO && <span className="who-badge">WHO Official</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
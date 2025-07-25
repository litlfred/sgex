import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import './LandingPage.css';

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('github_token');
    if (token) {
      const success = githubService.authenticate(token);
      if (success) {
        setIsAuthenticated(true);
        fetchUserData();
      } else {
        localStorage.removeItem('github_token');
      }
    }
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user data using GitHub service
      const userData = await githubService.getCurrentUser();
      setUser(userData);
      
      // Fetch organizations
      const orgsData = await githubService.getUserOrganizations();
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data. Please check your token and try again.');
      setIsAuthenticated(false);
      localStorage.removeItem('github_token');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    setShowTokenInput(true);
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Please enter a valid GitHub token');
      return;
    }

    const success = githubService.authenticate(tokenInput.trim());
    if (success) {
      localStorage.setItem('github_token', tokenInput.trim());
      setIsAuthenticated(true);
      setShowTokenInput(false);
      setTokenInput('');
      fetchUserData();
    } else {
      setError('Invalid GitHub token. Please check and try again.');
    }
  };

  const handleLogout = () => {
    githubService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setOrganizations([]);
    setError(null);
    setShowTokenInput(false);
    setTokenInput('');
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
              {!showTokenInput ? (
                <>
                  <p>Connect your GitHub account to get started:</p>
                  <button 
                    className="github-login-btn"
                    onClick={handleGitHubLogin}
                    disabled={loading}
                  >
                    <span className="github-icon">⚡</span>
                    Continue with GitHub
                  </button>
                </>
              ) : (
                <form onSubmit={handleTokenSubmit}>
                  <p>Enter your GitHub Personal Access Token:</p>
                  <div className="token-input-group">
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="token-input"
                      disabled={loading}
                    />
                    <button 
                      type="submit" 
                      className="token-submit-btn"
                      disabled={loading || !tokenInput.trim()}
                    >
                      {loading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                  <p className="token-help">
                    Create a token at{' '}
                    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                      GitHub Settings
                    </a>{' '}
                    with 'repo' and 'read:org' permissions.
                  </p>
                </form>
              )}
              
              {error && <div className="error-message">{error}</div>}
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
                  className="profile-card"
                  onClick={() => handleProfileSelect({ type: 'org', ...org })}
                >
                  <img 
                    src={org.avatar_url || `https://github.com/${org.login}.png`} 
                    alt={`${org.name || org.login} organization`} 
                  />
                  <h3>{org.name || org.login}</h3>
                  <p>@{org.login}</p>
                  <span className="profile-type">Organization</span>
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
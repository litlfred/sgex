import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import HelpButton from './HelpButton';
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
    navigate('/repositories', { state: { profile } });
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
                <div className="token-section">
                  <form onSubmit={handleTokenSubmit}>
                    <div className="token-header">
                      <p>Enter your GitHub Personal Access Token:</p>
                      <HelpButton 
                        helpTopic="github-token"
                        contextData={{ 
                          repository: { owner: 'litlfred', name: 'sgex' },
                          requiredScopes: ['repo', 'read:org']
                        }}
                      />
                    </div>
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
                      Need a token? We can help!{' '}
                      <a 
                        href="https://github.com/settings/tokens/new?description=SGEX%20Workbench%20Access&scopes=repo,read:org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="quick-token-link"
                      >
                        Create one with pre-filled settings →
                      </a>
                      <br />
                      Or visit{' '}
                      <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                        GitHub Settings
                      </a>{' '}
                      and select 'repo' and 'read:org' permissions.
                    </p>
                  </form>
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  {error}
                  {error.includes('Failed to fetch user data') && (
                    <div className="error-help">
                      <HelpButton 
                        helpTopic="github-token"
                        contextData={{ 
                          repository: { owner: 'litlfred', name: 'sgex' },
                          requiredScopes: ['repo', 'read:org'],
                          error: error
                        }}
                      />
                      <span>Click the helper for step-by-step guidance</span>
                    </div>
                  )}
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
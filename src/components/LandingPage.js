import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('github_token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      // Mock GitHub API call - replace with actual Octokit implementation
      const mockUser = {
        login: 'demo-user',
        name: 'Demo User',
        avatar_url: 'https://github.com/images/modules/logos_page/GitHub-Mark.png'
      };
      const mockOrgs = [
        { login: 'who-organization', name: 'WHO Organization' },
        { login: 'health-ministry', name: 'Health Ministry' }
      ];
      
      setUser(mockUser);
      setOrganizations(mockOrgs);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleGitHubLogin = () => {
    // Mock authentication - replace with actual GitHub OAuth
    const mockToken = 'mock_github_token_' + Date.now();
    localStorage.setItem('github_token', mockToken);
    setIsAuthenticated(true);
    fetchUserData(mockToken);
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
              <p>Connect your GitHub account to get started:</p>
              <button 
                className="github-login-btn"
                onClick={handleGitHubLogin}
              >
                <span className="github-icon">⚡</span>
                Continue with GitHub
              </button>
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
        </div>
      </div>
      
      <div className="landing-content">
        <div className="profile-selection">
          <h2>Select Profile or Organization</h2>
          <p>Choose the GitHub profile or organization containing your DAK repositories:</p>
          
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
                  src={`https://github.com/${org.login}.png`} 
                  alt={`${org.name} organization`} 
                />
                <h3>{org.name}</h3>
                <p>@{org.login}</p>
                <span className="profile-type">Organization</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import githubService from '../services/githubService';
import CollaborationModal from './CollaborationModal';
import HelpModal from './HelpModal';
import helpContentService from '../services/helpContentService';
import { PageLayout } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';
import './WelcomePage.css';

const WelcomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [showPATHelp, setShowPATHelp] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [patToken, setPatToken] = useState('');
  const [patError, setPATError] = useState('');
  const [patLoading, setPATLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

  // Listen for authentication state changes (for logout)
  useEffect(() => {
    const checkAuthState = () => {
      setIsAuthenticated(githubService.isAuthenticated);
    };

    // Check periodically for auth state changes
    const interval = setInterval(checkAuthState, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle warning message from navigation state
  useEffect(() => {
    if (location.state?.warningMessage) {
      setWarningMessage(location.state.warningMessage);
      // Clear the warning message from navigation state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleAuthSuccess = (token, octokitInstance, username) => {
    // Store token in session storage for this session
    sessionStorage.setItem('github_token', token);
    
    // Store username if provided for better UX
    if (username) {
      sessionStorage.setItem('github_username', username);
    }
    
    // Use the provided Octokit instance directly
    githubService.authenticateWithOctokit(octokitInstance);
    
    setIsAuthenticated(true);
  };

  const handleAuthoringClick = (event) => {
    handleNavigationClick(event, '/select_profile', navigate);
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

  const handleCollaborationOpen = () => {
    setShowCollaborationModal(true);
  };

  const handleCollaborationClose = () => {
    setShowCollaborationModal(false);
  };

  const handlePATSubmit = async (e) => {
    e.preventDefault();
    
    if (!patToken.trim()) {
      setPATError("Please enter a GitHub Personal Access Token");
      return;
    }

    setPATLoading(true);
    setPATError('');
    
    try {
      // Test the token by creating an Octokit instance and making a test request
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: patToken.trim() });
      
      // Test the token by fetching user info
      const userResponse = await octokit.rest.users.getAuthenticated();
      
      // Call success callback with token and octokit instance
      handleAuthSuccess(patToken.trim(), octokit, userResponse.data.login);
    } catch (err) {
      console.error('PAT authentication failed:', err);
      
      if (err.status === 401) {
        setPATError('Invalid Personal Access Token. Please check your token and try again.');
      } else if (err.status === 403) {
        setPATError("Token doesn't have sufficient permissions. Please ensure your token has 'repo' and 'read:org' scopes.");
      } else {
        setPATError('Authentication failed. Please check your connection and try again.');
      }
    } finally {
      setPATLoading(false);
    }
  };

  const handleTokenNameChange = (e) => {
    setTokenName(e.target.value);
    if (patError) setPATError(''); // Clear error when user starts typing
  };

  const handlePATTokenChange = (e) => {
    setPatToken(e.target.value);
    if (patError) setPATError(''); // Clear error when user starts typing
  };

  return (
    <PageLayout pageName="welcome" showBreadcrumbs={false}>
      <div className="welcome-page-content">
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

        <div className="welcome-hero">
          <div className="welcome-intro">
            <div className="welcome-mascot">
              <img src="/sgex-mascot.png" alt="SGEX Workbench Helper" />
            </div>
            <div className="welcome-text">
              <h1>SGEX Workbench</h1>
              <h2>WHO SMART Guidelines Exchange</h2>
              <p className="mission-statement">
                SGEX is an experimental collaborative project developing a workbench of tools to make it easier and faster to develop high fidelity SMART Guidelines Digital Adaptation Kits (DAKs). Our mission is to empower healthcare organizations worldwide to create and maintain standards-compliant digital health implementations.
              </p>
            </div>
          </div>
        </div>

        <div className="welcome-cards">
          <div className="card-grid">
            {/* Authoring Card - Always show */}
            <div className="action-card authoring-card" onClick={handleAuthoringClick}>
              <div className="card-icon">
                <img src="/authoring.png" alt="Authoring" />
              </div>
              <p>Create, edit, or fork WHO SMART Guidelines Digital Adaptation Kits.</p>
            </div>

            {/* PAT Login + Demo Card (Middle) - Only show when not authenticated */}
            {!isAuthenticated && (
              <div className="action-card pat-demo-card">
                {/* PAT Login Section */}
                <div className="pat-section">
                  <h4>Quick PAT Login</h4>
                  <form onSubmit={handlePATSubmit} className="pat-form">
                    <div className="form-group">
                      <input
                        type="text"
                        value={tokenName}
                        onChange={handleTokenNameChange}
                        placeholder="Token name"
                        className="token-name-input"
                        disabled={patLoading}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        value={patToken}
                        onChange={handlePATTokenChange}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        className={`token-input ${patError ? 'error' : ''}`}
                        disabled={patLoading}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="pat-login-btn" 
                      disabled={patLoading || !patToken.trim()}
                    >
                      {patLoading ? 'Signing In...' : '🔑 Sign In'}
                    </button>
                  </form>
                  {patError && <div className="pat-error">{patError}</div>}
                  <div className="pat-help-link">
                    <button 
                      type="button"
                      className="pat-help-btn" 
                      onClick={() => setShowPATHelp(true)}
                    >
                      📖 Help creating a PAT
                    </button>
                  </div>
                </div>

                {/* Demo Section */}
                <div className="demo-section">
                  <h4>Want to try without signing in?</h4>
                  <button onClick={handleDemoMode} className="demo-btn">
                    🎭 Try Demo Mode
                  </button>
                  <p className="demo-note">
                    Demo mode showcases the enhanced DAK scanning display with mock data.
                  </p>
                </div>
              </div>
            )}

            {/* Collaboration Card */}
            <div className="action-card collaboration-card" onClick={handleCollaborationOpen}>
              <div className="card-icon">
                <img src="/collaboration.png" alt="Collaboration" />
              </div>
              <p>Learn about our mission, how to contribute, and join our community-driven development process.</p>
            </div>
          </div>
        </div>

        {/* Collaboration Modal */}
        {showCollaborationModal && (
          <CollaborationModal onClose={handleCollaborationClose} />
        )}

        {/* PAT Help Modal */}
        {showPATHelp && (
          <HelpModal
            helpTopic={helpContentService.getHelpTopic('github-pat-setup')}
            contextData={{ pageId: 'welcome' }}
            onClose={() => setShowPATHelp(false)}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default WelcomePage;
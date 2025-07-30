import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import githubService from '../services/githubService';
import PATLogin from './PATLogin';
import CollaborationModal from './CollaborationModal';
import { PageLayout } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';
import './WelcomePage.css';

const WelcomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [error, setError] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);

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

  // Handle warning message from navigation state
  useEffect(() => {
    if (location.state?.warningMessage) {
      setWarningMessage(location.state.warningMessage);
      // Clear the warning message from navigation state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleAuthSuccess = (token, octokitInstance) => {
    // Store token in session storage for this session
    sessionStorage.setItem('github_token', token);
    
    // Use the provided Octokit instance directly
    githubService.authenticateWithOctokit(octokitInstance);
    
    setIsAuthenticated(true);
    setError(null);
  };

  const handleAuthoringClick = (event) => {
    handleNavigationClick(event, '/select_profile', navigate);
  };

  const handleLoginClick = (event) => {
    // Scroll to login section or show login modal
    const authSection = document.querySelector('.auth-section');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' });
    }
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

  return (
    <PageLayout pageName="welcome" showBreadcrumbs={false}>
      <div className="welcome-page-content">
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

          <div className="welcome-cards">
            <div className="card-grid">
              {/* Collaboration Card */}
              <div className="action-card collaboration-card" onClick={handleCollaborationOpen}>
                <div className="card-icon">
                  <img src="/collaboration.png" alt="Collaboration" />
                </div>
                <h3>Collaboration</h3>
                <p>Learn about our mission, how to contribute, and join our community-driven development process.</p>
              </div>

              {/* Login/Authoring Card */}
              {!isAuthenticated ? (
                <div className="action-card login-card" onClick={handleLoginClick}>
                  <div className="card-icon">
                    <span className="icon-symbol">🔑</span>
                  </div>
                  <h3>Sign In</h3>
                  <p>Sign in with your GitHub Personal Access Token to start editing DAKs.</p>
                </div>
              ) : (
                <div className="action-card authoring-card" onClick={handleAuthoringClick}>
                  <div className="card-icon">
                    <img src="/authoring.png" alt="Authoring" />
                  </div>
                  <h3>Start Authoring</h3>
                  <p>Create, edit, or fork WHO SMART Guidelines Digital Adaptation Kits.</p>
                </div>
              )}
            </div>

            {/* Demo Mode Card */}
            <div className="demo-card">
              <h4>Want to try without signing in?</h4>
              <button onClick={handleDemoMode} className="demo-btn">
                🎭 Try Demo Mode
              </button>
              <p className="demo-note">
                Demo mode showcases the enhanced DAK scanning display with mock data.
              </p>
            </div>
          </div>
        </div>

        {/* Login Section (shown when not authenticated and login card is clicked) */}
        {!isAuthenticated && (
          <div className="auth-section">
            <h3>Sign In with Personal Access Token</h3>
            <p>
              SGEX Workbench uses GitHub Personal Access Tokens for secure authentication without requiring any backend server setup.
            </p>
            
            <PATLogin onAuthSuccess={handleAuthSuccess} />
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Collaboration Modal */}
        {showCollaborationModal && (
          <CollaborationModal onClose={handleCollaborationClose} />
        )}
      </div>
    </PageLayout>
  );
};

export default WelcomePage;
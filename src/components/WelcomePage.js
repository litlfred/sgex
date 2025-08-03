import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import githubService from '../services/githubService';
import CollaborationModal from './CollaborationModal';
import HelpModal from './HelpModal';
import OAuthRedirectFlow from './OAuthRedirectFlow';
import helpContentService from '../services/helpContentService';
import { PageLayout } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';
import useThemeImage from '../hooks/useThemeImage';
import './WelcomePage.css';

const WelcomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [showPATHelp, setShowPATHelp] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Theme-aware image paths
  const mascotImage = useThemeImage('sgex-mascot.png');
  const authoringImage = useThemeImage('authoring.png');
  const collaborationImage = useThemeImage('collaboration.png');

  // Initial authentication check - runs once on mount
  useEffect(() => {
    const initializeAuth = () => {
      // Check if user is already authenticated from previous session
      const token = sessionStorage.getItem('github_token') || localStorage.getItem('github_token');
      if (token) {
        const success = githubService.authenticate(token);
        if (success) {
          setIsAuthenticated(true);
          // Try to get user info
          githubService.getCurrentUser().then(user => {
            setAuthUser(user);
          }).catch(err => {
            console.warn('Could not fetch user info:', err);
          });
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

  const handleOAuthSuccess = (token, user, scopes) => {
    // Store token in session storage for this session
    sessionStorage.setItem('github_token', token);
    
    // Store username for better UX
    if (user && user.login) {
      sessionStorage.setItem('github_username', user.login);
    }
    
    // Authentication is already set by the OAuth flow
    setIsAuthenticated(true);
    setAuthUser(user);
  };

  const handleGuestBrowsing = () => {
    // Enable guest mode for read-only browsing
    githubService.enableGuestMode();
    setIsAuthenticated(false);
    setAuthUser(null);
    
    // Navigate to profile selection in guest mode
    handleNavigationClick(null, '/select_profile', navigate, { guestMode: true });
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
              <img src={mascotImage} alt="SGEX Workbench Helper" />
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
                <img src={authoringImage} alt="Authoring" />
              </div>
              <p>Create, edit, or fork WHO SMART Guidelines Digital Adaptation Kits.</p>
            </div>

            {/* OAuth + Demo Card (Middle) - Only show when not authenticated */}
            {!isAuthenticated && (
              <div className="action-card oauth-demo-card">
                {/* OAuth Login Section */}
                <div className="oauth-section">
                  <OAuthRedirectFlow
                    onAuthSuccess={handleOAuthSuccess}
                    onError={(error) => {
                      console.error('OAuth authentication failed:', error);
                    }}
                  />
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

                {/* Guest Browsing Section */}
                <div className="guest-section">
                  <h4>Browse Public Repositories</h4>
                  <button onClick={handleGuestBrowsing} className="guest-btn">
                    👤 Browse as Guest
                  </button>
                  <p className="guest-note">
                    Read-only access to public repositories without authentication.
                  </p>
                </div>
              </div>
            )}

            {/* Authenticated User Info */}
            {isAuthenticated && authUser && (
              <div className="action-card user-info-card">
                <div className="user-info">
                  <img 
                    src={authUser.avatar_url} 
                    alt={authUser.name || authUser.login}
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <h4>Welcome back, {authUser.name || authUser.login}!</h4>
                    <p>You're signed in and ready to collaborate.</p>
                    <button 
                      onClick={() => {
                        githubService.clearAllRepositoryTokens();
                        sessionStorage.removeItem('github_token');
                        localStorage.removeItem('github_token');
                        sessionStorage.removeItem('github_username');
                        setIsAuthenticated(false);
                        setAuthUser(null);
                      }}
                      className="sign-out-btn"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Collaboration Card */}
            <div className="action-card collaboration-card" onClick={handleCollaborationOpen}>
              <div className="card-icon">
                <img src={collaborationImage} alt="Collaboration" />
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
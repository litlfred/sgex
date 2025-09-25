import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import githubService from '../services/githubService';
import CollaborationModal from './CollaborationModal';
import HelpModal from './HelpModal';
import helpContentService from '../services/helpContentService';
import { PageLayout } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';
import useThemeImage from '../hooks/useThemeImage';
import { ALT_TEXT_KEYS, getAltText } from '../utils/imageAltTextHelper';

const WelcomePage = () => {
  const { t } = useTranslation();
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
  
  // Ref to focus on PAT token input
  const patTokenInputRef = useRef(null);

  // Theme-aware image paths
  const mascotImage = useThemeImage('sgex-mascot.png');
  const authoringImage = useThemeImage('authoring.png');
  const collaborationImage = useThemeImage('collaboration.png');
  const tutorialImage = useThemeImage('tutorial-icon.png');

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

  // Handle focus PAT input when navigated with focusPATInput parameter
  useEffect(() => {
    if (location.state?.focusPATInput && patTokenInputRef.current && !isAuthenticated) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        patTokenInputRef.current.focus();
        // Clear the focus parameter from state AFTER focusing to prevent re-focusing on re-renders
        navigate(location.pathname, { 
          replace: true, 
          state: { ...location.state, focusPATInput: undefined }
        });
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname, isAuthenticated]);

  // Listen for custom focus PAT input event (for same-page focus)
  useEffect(() => {
    const handleFocusPATInput = () => {
      if (patTokenInputRef.current && !isAuthenticated) {
        patTokenInputRef.current.focus();
      }
    };

    window.addEventListener('focusPATInput', handleFocusPATInput);
    
    return () => {
      window.removeEventListener('focusPATInput', handleFocusPATInput);
    };
  }, [isAuthenticated]);

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



  const handleDismissWarning = () => {
    setWarningMessage(null);
  };

  const handleTutorialClick = (event) => {
    handleNavigationClick(event, '/local-tutorial-manager', navigate);
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
              <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Workbench Helper')} />
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
            <button 
              className="action-card authoring-card" 
              onClick={handleAuthoringClick}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAuthoringClick()}
            >
              <div className="card-icon">
                <img src={authoringImage} alt={getAltText(t, ALT_TEXT_KEYS.IMAGE_AUTHORING, 'Authoring')} />
              </div>
              <p>Create, edit, or fork WHO SMART Guidelines Digital Adaptation Kits.</p>
            </button>

            {/* Tutorial Card - Only show when authenticated */}
            {isAuthenticated && (
              <button 
                className="action-card tutorial-card" 
                onClick={handleTutorialClick}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTutorialClick()}
              >
                <div className="card-icon">
                  <img src={tutorialImage} alt={getAltText(t, ALT_TEXT_KEYS.IMAGE_TUTORIAL, 'Tutorials')} />
                </div>
                <p>Generate, manage, and upload screen recording tutorials for SGEX user scenarios.</p>
              </button>
            )}

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
                        aria-label="Token name (optional)"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        ref={patTokenInputRef}
                        type="password"
                        value={patToken}
                        onChange={handlePATTokenChange}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        className={`token-input ${patError ? 'error' : ''}`}
                        disabled={patLoading}
                        aria-label="GitHub Personal Access Token"
                        aria-describedby="pat-help-text"
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
                      id="pat-help-text"
                    >
                      📖 Help creating a PAT
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Collaboration Card */}
            <button 
              className="action-card collaboration-card" 
              onClick={handleCollaborationOpen}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCollaborationOpen()}
            >
              <div className="card-icon">
                <img src={collaborationImage} alt={getAltText(t, ALT_TEXT_KEYS.IMAGE_COLLABORATION, 'Collaboration')} />
              </div>
              <p>Learn about our mission, how to contribute, and join our community-driven development process.</p>
            </button>
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
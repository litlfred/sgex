import React, { useState, useEffect } from 'react';
import oauthService from '../services/oauthService';
import { ACCESS_LEVELS } from '../services/tokenManagerService';
import './OAuthLogin.css';

const OAuthLogin = ({ onAuthSuccess, requiredAccessLevel = 'READ_ONLY', repoOwner = null, repoName = null }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authFlow, setAuthFlow] = useState(null);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Poll for auth completion when device flow is active
  useEffect(() => {
    let pollInterval = null;

    if (authFlow && authFlow.device_code) {
      const poll = async () => {
        try {
          const tokenData = await oauthService.pollDeviceFlow(
            authFlow.device_code, 
            authFlow.interval
          );
          
          // Store the token
          const tokenInfo = await oauthService.storeToken(
            tokenData, 
            authFlow.accessLevel, 
            authFlow.repoOwner, 
            authFlow.repoName
          );

          // Clear auth flow state
          setAuthFlow(null);
          setIsAuthenticating(false);
          setError('');

          // Get user info and call success callback
          try {
            const user = await oauthService.getCurrentUser();
            onAuthSuccess(tokenInfo, user);
          } catch (userError) {
            console.warn('Could not fetch user info, but auth was successful:', userError);
            onAuthSuccess(tokenInfo, null);
          }

        } catch (pollError) {
          if (pollError.message.includes('access_denied')) {
            setError('Authorization was denied. Please try again.');
            setAuthFlow(null);
            setIsAuthenticating(false);
          } else if (pollError.message.includes('expired')) {
            setError('Authorization expired. Please try again.');
            setAuthFlow(null);
            setIsAuthenticating(false);
          }
          // Continue polling for other errors (authorization_pending, etc.)
        }
      };

      // Start immediate poll, then continue at interval
      poll();
      pollInterval = setInterval(poll, (authFlow.interval || 5) * 1000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [authFlow, onAuthSuccess]);

  const handleStartAuth = async (accessLevel) => {
    setIsAuthenticating(true);
    setError('');

    try {
      const flowData = await oauthService.startDeviceFlow(
        accessLevel, 
        repoOwner, 
        repoName
      );
      
      setAuthFlow(flowData);
    } catch (err) {
      console.error('Failed to start OAuth flow:', err);
      setError('Failed to start authorization. Please check your connection and try again.');
      setIsAuthenticating(false);
    }
  };

  const handleCancelAuth = () => {
    setAuthFlow(null);
    setIsAuthenticating(false);
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => {
      // Could add a toast notification here
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  const openGitHubAuth = () => {
    if (authFlow?.verification_uri_complete) {
      window.open(authFlow.verification_uri_complete, '_blank');
    } else if (authFlow?.verification_uri) {
      window.open(authFlow.verification_uri, '_blank');
    }
  };

  if (authFlow) {
    return (
      <div className="oauth-login">
        <div className="oauth-flow-active">
          <div className="oauth-flow-header">
            <h3>🔐 Authorize SGEX Workbench</h3>
            <p>Complete the authorization on GitHub to continue</p>
          </div>

          <div className="oauth-flow-steps">
            <div className="oauth-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Open GitHub Authorization</h4>
                <button 
                  onClick={openGitHubAuth}
                  className="github-auth-btn primary"
                >
                  🌐 Open GitHub
                </button>
                <p className="step-help">
                  Click to open GitHub's device authorization page
                </p>
              </div>
            </div>

            <div className="oauth-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Enter Verification Code</h4>
                <div className="verification-code">
                  <span className="code">{authFlow.user_code}</span>
                  <button 
                    onClick={() => copyToClipboard(authFlow.user_code)}
                    className="copy-btn"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
                <p className="step-help">
                  Enter this code on the GitHub page that opens
                </p>
              </div>
            </div>

            <div className="oauth-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Waiting for Authorization</h4>
                <div className="waiting-indicator">
                  <div className="spinner"></div>
                  <span>Waiting for you to complete authorization...</span>
                </div>
                <p className="step-help">
                  This page will automatically continue once you authorize the app
                </p>
              </div>
            </div>
          </div>

          <div className="oauth-flow-actions">
            <button 
              onClick={handleCancelAuth}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>

          <div className="oauth-flow-info">
            <p className="access-level-info">
              <strong>Access Level:</strong> {ACCESS_LEVELS[authFlow.accessLevel]?.name}
              {repoOwner && repoName && (
                <span> for <strong>{repoOwner}/{repoName}</strong></span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="oauth-login">
      <div className="oauth-login-section">
        <div className="oauth-intro">
          <h3>🚀 Get Started with GitHub</h3>
          <p>
            Choose your access level to start working with DAK repositories. 
            You can always upgrade your permissions later.
          </p>
          
          <div className="github-app-notice">
            <div className="notice-header">
              <span className="notice-icon">ℹ️</span>
              <strong>GitHub App Required</strong>
            </div>
            <p>
              This deployment uses GitHub App OAuth for secure authentication. 
              If you're the administrator, ensure a GitHub App is configured with your Client ID.
            </p>
            <a 
              href="/sgex/docs/github-app-setup.md" 
              target="_blank" 
              className="setup-guide-link"
            >
              📋 GitHub App Setup Guide
            </a>
          </div>
        </div>

        <div className="access-level-options">
          {Object.values(ACCESS_LEVELS)
            .filter(level => level.id !== 'UNAUTHENTICATED')
            .map(level => (
            <div key={level.id} className="access-level-card">
              <div className="access-level-header">
                <span className="access-level-icon">{level.icon}</span>
                <h4 style={{ color: level.color }}>{level.name}</h4>
              </div>
              
              <p className="access-level-description">
                {level.description}
              </p>
              
              <ul className="capabilities-list">
                {level.capabilities.map((capability, index) => (
                  <li key={index}>{capability}</li>
                ))}
              </ul>
              
              <button
                onClick={() => handleStartAuth(level.id)}
                className={`auth-btn ${level.id.toLowerCase().replace('_', '-')}`}
                disabled={isAuthenticating}
                style={{ backgroundColor: level.color }}
              >
                {isAuthenticating ? (
                  <>
                    <span className="spinner small"></span>
                    Starting...
                  </>
                ) : (
                  <>
                    {level.icon} Authorize {level.name}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="oauth-help-section">
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="help-toggle-btn"
          >
            {showHelp ? '📖 Hide Help' : '❓ How does this work?'}
          </button>
          
          {showHelp && (
            <div className="oauth-help-content">
              <h4>🔐 Secure OAuth Authentication</h4>
              <div className="help-grid">
                <div className="help-item">
                  <span className="help-icon">🛡️</span>
                  <div>
                    <strong>Enhanced Security</strong>
                    <p>OAuth provides more secure, granular access than personal access tokens.</p>
                  </div>
                </div>
                
                <div className="help-item">
                  <span className="help-icon">🎯</span>
                  <div>
                    <strong>Precise Permissions</strong>
                    <p>Grant only the specific permissions needed for each repository and component.</p>
                  </div>
                </div>
                
                <div className="help-item">
                  <span className="help-icon">🔄</span>
                  <div>
                    <strong>Easy Management</strong>
                    <p>Easily revoke or modify access through GitHub's OAuth applications settings.</p>
                  </div>
                </div>
                
                <div className="help-item">
                  <span className="help-icon">🏠</span>
                  <div>
                    <strong>Client-Side Only</strong>
                    <p>No server required - all authentication happens directly in your browser.</p>
                  </div>
                </div>
              </div>
              
              <div className="oauth-steps-help">
                <h5>How Authorization Works:</h5>
                <ol>
                  <li>Click an authorization level above</li>
                  <li>You'll get a code to enter on GitHub</li>
                  <li>GitHub asks you to approve specific permissions</li>
                  <li>Return here - you'll be automatically signed in!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthLogin;
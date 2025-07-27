import React, { useState, useEffect } from 'react';
import oauthService from '../services/oauthService';
import { ACCESS_LEVELS } from '../services/tokenManagerService';
import './OAuthLogin.css';

// Configuration status display component
const ConfigurationStatus = () => {
  const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID || 'sgex-workbench-dev';
  const isConfigured = clientId && clientId !== 'sgex-workbench-dev';
  const hasCorrectFormat = clientId && (clientId.startsWith('Iv1.') || clientId.startsWith('Iv23.'));
  
  // Always show configuration status for transparency
  return (
    <div className="configuration-status">
      <div className="config-header">
        <h4>🔧 GitHub App Configuration Status</h4>
      </div>
      
      <div className="config-checks">
        <div className={`config-check ${isConfigured ? 'success' : 'error'}`}>
          <span className="check-icon">{isConfigured ? '✅' : '❌'}</span>
          <div className="check-content">
            <strong>Client ID Configuration</strong>
            <div className="check-details">
              {isConfigured ? (
                <>
                  <div>✓ REACT_APP_GITHUB_CLIENT_ID is set</div>
                  <div className="config-value">Current: {clientId.substring(0, 10)}...</div>
                </>
              ) : (
                <>
                  <div>✗ REACT_APP_GITHUB_CLIENT_ID not configured</div>
                  <div className="config-value">Current: {clientId}</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`config-check ${hasCorrectFormat ? 'success' : isConfigured ? 'warning' : 'error'}`}>
          <span className="check-icon">{hasCorrectFormat ? '✅' : isConfigured ? '⚠️' : '❌'}</span>
          <div className="check-content">
            <strong>Client ID Format</strong>
            <div className="check-details">
              {hasCorrectFormat ? (
                <div>✓ Valid GitHub App Client ID format</div>
              ) : isConfigured ? (
                <div>⚠️ Client ID format may be invalid (should start with 'Iv1.' or 'Iv23.')</div>
              ) : (
                <div>✗ Using default fallback ID</div>
              )}
            </div>
          </div>
        </div>

        <div className="config-check info">
          <span className="check-icon">ℹ️</span>
          <div className="check-content">
            <strong>Setup Requirements</strong>
            <div className="check-details">
              <div>• GitHub App must be created with Device Flow enabled</div>
              <div>• OAuth callback URL configured (not required for Device Flow)</div>
              <div>• Appropriate permissions granted (read:user, public_repo, repo)</div>
            </div>
          </div>
        </div>
      </div>

      {!isConfigured && (
        <div className="config-actions">
          <div className="config-step">
            <strong>Quick Setup:</strong>
            <ol>
              <li>Create <code>.env.local</code> file in project root</li>
              <li>Add: <code>REACT_APP_GITHUB_CLIENT_ID=Iv1.your-client-id</code></li>
              <li>Restart development server: <code>npm start</code></li>
            </ol>
          </div>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="dev-info">
          <strong>Development Mode:</strong> 
          <span className="dev-value">CORS proxy enabled for localhost testing</span>
        </div>
      )}
    </div>
  );
};

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
      
      // Enhanced error handling with specific troubleshooting
      let errorMessage = '';
      let troubleshooting = [];
      
      if (err.message.includes('GitHub App Client ID not configured')) {
        errorMessage = '🔧 GitHub App Client ID not configured';
        troubleshooting = [
          'Create a .env.local file in your project root',
          'Add: REACT_APP_GITHUB_CLIENT_ID=Iv1.your-client-id-here',
          'Get your Client ID from https://github.com/settings/apps',
          'Restart the development server: npm start'
        ];
      } else if (err.message.includes('GitHub App configuration error') || err.message.includes('422')) {
        errorMessage = '⚙️ GitHub App configuration error';
        troubleshooting = [
          'Verify your GitHub App exists at https://github.com/settings/apps',
          'Ensure Device Flow is enabled in your GitHub App settings',
          'Check that your Client ID is correct and starts with "Iv1." or "Iv23."',
          'Verify the GitHub App has the required permissions (read:user, public_repo, repo)'
        ];
      } else if (err.message.includes('403') || err.message.includes('Device flow initiation failed')) {
        errorMessage = '🚫 GitHub App access denied';
        troubleshooting = [
          'Your GitHub App may not have Device Flow enabled',
          'The Client ID may belong to a different type of GitHub App',
          'Check your GitHub App permissions at https://github.com/settings/apps',
          'Ensure the GitHub App is not suspended or restricted'
        ];
      } else if (err.message.includes('Failed to fetch') || err.message.includes('network')) {
        errorMessage = '🌐 Network connectivity issue';
        troubleshooting = [
          'Check your internet connection',
          'Verify GitHub is accessible: https://github.com',
          'If using a proxy or VPN, try disabling it temporarily',
          'Check browser console for additional network errors'
        ];
      } else {
        errorMessage = '⚠️ Authentication initialization failed';
        troubleshooting = [
          'Check browser console for detailed error information',
          'Verify your GitHub App configuration',
          'Try refreshing the page and attempting again',
          'Contact administrator if the issue persists'
        ];
      }
      
      setError({ message: errorMessage, troubleshooting });
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
          
          <ConfigurationStatus />
          
          <div className="setup-resources">
            <h4>📚 Setup Resources</h4>
            <div className="resource-links">
              <a 
                href="/sgex/docs/github-app-setup.md" 
                target="_blank" 
                rel="noreferrer"
                className="resource-link primary"
              >
                📋 GitHub App Setup Guide
              </a>
              <a 
                href="/sgex/docs/development-oauth-setup.md"
                target="_blank"
                rel="noreferrer"
                className="resource-link"
              >
                🔧 Development Setup
              </a>
              <a 
                href="https://github.com/settings/apps"
                target="_blank"
                rel="noreferrer"
                className="resource-link"
              >
                ⚙️ GitHub Apps Settings
              </a>
            </div>
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
          <div className="error-message enhanced">
            <div className="error-header">
              <span className="error-icon">🚨</span>
              <div className="error-title">
                {typeof error === 'string' ? error : error.message}
              </div>
            </div>
            
            {typeof error === 'object' && error.troubleshooting && (
              <div className="error-troubleshooting">
                <h5>🔍 Troubleshooting Steps:</h5>
                <ol>
                  {error.troubleshooting.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="error-actions">
              <button 
                onClick={() => setError('')}
                className="dismiss-error-btn"
              >
                Dismiss
              </button>
              <a 
                href="/sgex/docs/oauth-guide.md#troubleshooting"
                target="_blank"
                rel="noreferrer"
                className="troubleshooting-guide-link"
              >
                📖 Full Troubleshooting Guide
              </a>
            </div>
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
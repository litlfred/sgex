import React, { useState } from 'react';
import OAuthLogin from './OAuthLogin';
import oauthDeviceFlowService from '../services/oauthDeviceFlowService';
import logger from '../utils/logger';

const LoginModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('oauth'); // 'oauth' or 'pat'
  const componentLogger = logger.getLogger('LoginModal');

  React.useEffect(() => {
    componentLogger.componentMount({ 
      isOpen,
      hasOnAuthSuccess: !!onAuthSuccess 
    });
    
    // Check OAuth configuration on mount and set default method
    const config = oauthDeviceFlowService.checkConfiguration();
    if (!config.isConfigured) {
      setAuthMethod('pat'); // Fall back to PAT if OAuth not configured
    }
    
    return () => componentLogger.componentUnmount();
  }, [componentLogger, isOpen, onAuthSuccess]);

  // Handle OAuth authentication success
  const handleOAuthSuccess = (authData) => {
    componentLogger.auth('OAuth authentication successful', {
      tokenType: authData.tokenType,
      authMethod: authData.authMethod
    });
    
    // Call the parent success callback
    if (onAuthSuccess) {
      // For OAuth, we need to create an Octokit instance for compatibility
      import('@octokit/rest').then(({ Octokit }) => {
        const octokit = new Octokit({ auth: authData.token });
        onAuthSuccess(authData.token, octokit, '', authData.authMethod);
      });
    }
    onClose();
  };

  // Handle OAuth authentication cancellation
  const handleOAuthCancel = () => {
    componentLogger.userAction('OAuth authentication cancelled');
    // Don't close modal, just switch back to method selection or stay on OAuth
  };

  // Handle PAT authentication submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    componentLogger.userAction('PAT login attempt', { 
      usernameProvided: !!username.trim(),
      tokenProvided: !!token.trim() 
    });
    
    if (!token.trim()) {
      const errorMsg = "Please enter a GitHub Personal Access Token";
      setError(errorMsg);
      componentLogger.warn('PAT login failed - no token provided');
      return;
    }

    setLoading(true);
    setError('');
    const startTime = Date.now();
    componentLogger.auth('Starting PAT authentication');
    
    try {
      // Test the token by creating an Octokit instance and making a test request
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: token.trim() });
      componentLogger.debug('Octokit instance created for PAT validation');
      
      // Test the token by fetching user info
      componentLogger.apiCall('GET', '/user', null);
      const userResponse = await octokit.rest.users.getAuthenticated();
      const duration = Date.now() - startTime;
      componentLogger.apiResponse('GET', '/user', userResponse.status, duration);
      
      componentLogger.auth('PAT authentication successful', { 
        username: userResponse.data.login,
        duration 
      });
      
      // Call success callback with token and octokit instance
      onAuthSuccess(token.trim(), octokit, username.trim());
      onClose();
    } catch (err) {
      const duration = Date.now() - startTime;
      componentLogger.apiError('GET', '/user', err);
      componentLogger.auth('PAT authentication failed', { 
        status: err.status, 
        message: err.message,
        duration 
      });
      console.error('PAT authentication failed:', err);
      
      if (err.status === 401) {
        setError('Invalid Personal Access Token. Please check your token and try again.');
      } else if (err.status === 403) {
        setError("Token doesn't have sufficient permissions. Please ensure your token has 'repo' and 'read:org' scopes.");
      } else {
        setError('Authentication failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTokenChange = (e) => {
    setToken(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal">
        <div className="login-modal-header">
          <h2>Sign In with GitHub</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="login-modal-content">
          {/* Authentication method tabs */}
          <div className="auth-method-tabs">
            {oauthDeviceFlowService.checkConfiguration().isConfigured && (
              <button
                className={`auth-tab ${authMethod === 'oauth' ? 'active' : ''}`}
                onClick={() => setAuthMethod('oauth')}
                type="button"
              >
                🔐 OAuth (Recommended)
              </button>
            )}
            <button
              className={`auth-tab ${authMethod === 'pat' ? 'active' : ''}`}
              onClick={() => setAuthMethod('pat')}
              type="button"
            >
              🔑 Personal Access Token
            </button>
          </div>

          {/* OAuth Authentication */}
          {authMethod === 'oauth' && (
            <div className="auth-content">
              <OAuthLogin 
                onAuthSuccess={handleOAuthSuccess}
                onAuthCancel={handleOAuthCancel}
              />
            </div>
          )}

          {/* PAT Authentication */}
          {authMethod === 'pat' && (
            <div className="auth-content">
              <p className="login-description">
                SGEX Workbench uses GitHub Personal Access Tokens for secure authentication 
                without requiring any backend server setup.
              </p>
              
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="username">
                    Username/Token Name <span className="optional">(optional)</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="e.g., john-doe or work-token"
                    className="username-input"
                    disabled={loading}
                    autoComplete="username"
                  />
                  <small className="help-text">
                    Helps identify this token in your password manager
                  </small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="pat-token">GitHub Personal Access Token *</label>
                  <input
                    id="pat-token"
                    type="password"
                    value={token}
                    onChange={handleTokenChange}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className={`token-input ${error ? 'error' : ''}`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <small className="help-text">
                    Token needs 'repo' and 'read:org' scopes
                  </small>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="cancel-btn" 
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    className="login-btn" 
                    disabled={loading || !token.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <span className="github-icon">🔑</span>
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="help-section">
                <h4>Need a Personal Access Token?</h4>
                <p>
                  Visit <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                    GitHub Settings → Developer settings → Personal access tokens
                  </a> to create one.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
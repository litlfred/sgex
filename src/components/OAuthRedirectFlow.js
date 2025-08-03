import React, { useState, useEffect } from 'react';
import GITHUB_CONFIG from '../config/github';
import logger from '../utils/logger';
import './OAuthDeviceFlow.css';

const OAuthRedirectFlow = ({ onAuthSuccess, onError, scopes = GITHUB_CONFIG.DEFAULT_SCOPES }) => {
  const [error, setError] = useState('');
  const componentLogger = logger.getLogger('OAuthRedirectFlow');

  useEffect(() => {
    componentLogger.componentMount({ scopes });
    
    // Check if we're returning from GitHub OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      setError('GitHub authentication was cancelled or failed.');
      if (onError) onError(new Error(errorParam));
    } else if (code) {
      // For now, show that we received the code but need server-side handling
      setError('OAuth code received but server-side token exchange is required for security.');
    }
    
    return () => {
      componentLogger.componentUnmount();
    };
  }, [componentLogger, scopes, onError]);

  const handleGitHubOAuth = () => {
    componentLogger.userAction('Starting GitHub OAuth redirect', { scopes });
    
    // Build GitHub OAuth URL
    const params = new URLSearchParams({
      client_id: GITHUB_CONFIG.CLIENT_ID,
      scope: scopes.join(' '),
      redirect_uri: window.location.origin + window.location.pathname,
      state: Math.random().toString(36).substring(7) // Simple CSRF protection
    });
    
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    
    // For now, open in new tab to avoid breaking the current session
    window.open(githubOAuthUrl, '_blank');
  };

  const getScopeDescription = (scope) => {
    return GITHUB_CONFIG.SCOPE_DESCRIPTIONS[scope] || scope;
  };

  return (
    <div className="oauth-device-flow">
      <div className="oauth-section">
        <h4>Sign in with GitHub</h4>
        <p className="oauth-description">
          Get secure access to GitHub with the permissions you need, when you need them.
        </p>
        
        <div className="permissions-info">
          <h5>Initial permissions requested:</h5>
          <ul className="permissions-list">
            {scopes.map(scope => (
              <li key={scope} className="permission-item">
                <code>{scope}</code> - {getScopeDescription(scope)}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="oauth-status error">
            <span className="error-icon">❌</span>
            <p>{error}</p>
          </div>
        )}

        <button 
          onClick={handleGitHubOAuth}
          className="github-oauth-btn"
        >
          <span className="github-icon">🔗</span>
          Sign in with GitHub
        </button>
        
        <p className="oauth-note">
          <strong>Note:</strong> GitHub OAuth requires a server to complete authentication securely. 
          For now, this opens GitHub authorization in a new tab. A complete implementation would 
          require backend token exchange.
        </p>
      </div>
    </div>
  );
};

export default OAuthRedirectFlow;
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import logger from "../utils/logger";
import secureTokenStorage from "../services/secureTokenStorage";
import { isValidPATFormat, sanitizeLogData } from "../utils/securityUtils";
import "./PATLogin.css";

const PATLogin = ({ onAuthSuccess }) => {
  const { t } = useTranslation();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const componentLogger = logger.getLogger('PATLogin');

  React.useEffect(() => {
    componentLogger.componentMount({ hasOnAuthSuccess: !!onAuthSuccess });
    return () => componentLogger.componentUnmount();
  }, [componentLogger, onAuthSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedLogData = sanitizeLogData({ tokenProvided: !!token.trim() });
    componentLogger.userAction('PAT login attempt', sanitizedLogData);
    
    if (!token.trim()) {
      const errorMsg = "Please enter a GitHub Personal Access Token";
      setError(errorMsg);
      componentLogger.warn('PAT login failed - no token provided');
      return;
    }

    // Validate token format before making API call
    if (!isValidPATFormat(token.trim())) {
      const errorMsg = "Invalid Personal Access Token format. Please check your token.";
      setError(errorMsg);
      componentLogger.warn('PAT login failed - invalid token format');
      return;
    }

    setLoading(true);
    setError("");
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
      
      // Store token securely
      const tokenStored = secureTokenStorage.storeToken(token.trim(), {
        username: userResponse.data.login
      });

      if (!tokenStored) {
        throw new Error('Failed to store token securely');
      }
      
      const sanitizedAuthData = sanitizeLogData({ 
        username: userResponse.data.login,
        duration 
      });
      componentLogger.auth('PAT authentication successful', sanitizedAuthData);
      
      // Call success callback with token and octokit instance
      onAuthSuccess(token.trim(), octokit);
    } catch (err) {
      const duration = Date.now() - startTime;
      componentLogger.apiError('GET', '/user', err);
      const sanitizedErrorData = sanitizeLogData({ 
        status: err.status, 
        message: err.message,
        duration 
      });
      componentLogger.auth('PAT authentication failed', sanitizedErrorData);
      console.error('PAT authentication failed:', err);
      
      if (err.status === 401) {
        setError("Invalid Personal Access Token. Please check your token and try again.");
      } else if (err.status === 403) {
        setError("Token doesn't have sufficient permissions. Please ensure your token has 'repo' and 'read:org' scopes.");
      } else {
        setError("Authentication failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTokenChange = (e) => {
    setToken(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="pat-login">
      <div className="pat-login-section">
        <form onSubmit={handleSubmit} className="pat-form">
          <div className="form-group">
            <label htmlFor="pat-token">{t('auth.setupToken')}:</label>
            <input
              id="pat-token"
              type="password"
              value={token}
              onChange={handleTokenChange}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className={`token-input ${error ? 'error' : ''}`}
              disabled={loading}
              autoComplete="off"
            />
          </div>
          
          <button 
            type="submit" 
            className="github-login-btn" 
            disabled={loading || !token.trim()}
          >
            {loading ? (
              <>
                <span className="spinner small"></span>
                {t('common.loading')}...
              </>
            ) : (
              <>
                <span className="github-icon">🔑</span>
                {t('auth.signInWithPAT')}
              </>
            )}
          </button>
        </form>
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default PATLogin;
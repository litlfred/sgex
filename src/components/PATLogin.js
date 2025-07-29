import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import logger from "../utils/logger";
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
    componentLogger.userAction('PAT login attempt', { tokenProvided: !!token.trim() });
    
    if (!token.trim()) {
      const errorMsg = t('patLogin.errors.noToken');
      setError(errorMsg);
      componentLogger.warn('PAT login failed - no token provided');
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
      
      componentLogger.auth('PAT authentication successful', { 
        username: userResponse.data.login,
        duration 
      });
      
      // Call success callback with token and octokit instance
      onAuthSuccess(token.trim(), octokit);
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
        setError(t('patLogin.errors.invalidToken'));
      } else if (err.status === 403) {
        setError(t('patLogin.errors.insufficientPermissions'));
      } else {
        setError(t('patLogin.errors.authFailed'));
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
            <label htmlFor="pat-token">{t('patLogin.tokenLabel')}:</label>
            <input
              id="pat-token"
              type="password"
              value={token}
              onChange={handleTokenChange}
              placeholder={t('patLogin.tokenPlaceholder')}
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
                {t('patLogin.authenticating')}
              </>
            ) : (
              <>
                <span className="github-icon">🔑</span>
                {t('patLogin.signInButton')}
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
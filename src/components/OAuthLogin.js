import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import oauthDeviceFlowService from '../services/oauthDeviceFlowService';
import logger from '../utils/logger';
import './OAuthLogin.css';

const OAuthLogin = ({ onAuthSuccess, onAuthCancel }) => {
  const { t } = useTranslation();
  const [authState, setAuthState] = useState('idle'); // idle, requesting, awaiting, polling, success, error
  const [deviceAuth, setDeviceAuth] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [pollingInfo, setPollingInfo] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const componentLogger = logger.getLogger('OAuthLogin');

  useEffect(() => {
    componentLogger.componentMount({ hasOnAuthSuccess: !!onAuthSuccess });
    return () => {
      componentLogger.componentUnmount();
      // Cancel any ongoing polling when component unmounts
      oauthDeviceFlowService.cancelPolling();
    };
  }, [componentLogger, onAuthSuccess]);

  // Update status based on OAuth service updates
  const handleOAuthUpdate = useCallback((update) => {
    componentLogger.debug('OAuth status update', update);
    
    setPollingInfo(update);
    
    switch (update.status) {
      case 'requesting_code':
        setAuthState('requesting');
        setStatusMessage(update.message);
        setError('');
        break;
        
      case 'awaiting_authorization':
        setAuthState('awaiting');
        setDeviceAuth(update.deviceAuth);
        setStatusMessage(update.message);
        setTimeRemaining(update.deviceAuth?.expiresIn || 900);
        break;
        
      case 'polling':
        setAuthState('polling');
        setStatusMessage(`${update.message} (Attempt ${update.attempt})`);
        setTimeRemaining(update.timeRemaining || 0);
        break;
        
      case 'slow_down':
        setStatusMessage(`${update.message} (Next check in ${update.interval}s)`);
        break;
        
      case 'success':
        setAuthState('success');
        setStatusMessage(update.message);
        break;
        
      case 'expired':
        setAuthState('error');
        setError(update.message);
        break;
        
      case 'denied':
        setAuthState('error');
        setError(update.message);
        break;
        
      case 'error':
        setError(update.message);
        break;
        
      default:
        componentLogger.warn('Unknown OAuth update status', update);
    }
  }, [componentLogger]);

  // Countdown timer for expiration
  useEffect(() => {
    if (authState === 'awaiting' || authState === 'polling') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [authState]);

  // Start OAuth Device Flow authentication
  const handleStartOAuth = async () => {
    componentLogger.userAction('OAuth authentication started');
    setError('');
    setAuthState('requesting');
    
    try {
      const result = await oauthDeviceFlowService.authenticateWithDeviceFlow(handleOAuthUpdate);
      
      if (result.success) {
        componentLogger.auth('OAuth authentication successful');
        setAuthState('success');
        
        // Call success callback with token info
        if (onAuthSuccess) {
          onAuthSuccess({
            token: result.token,
            tokenType: result.tokenType,
            scope: result.scope,
            authMethod: 'oauth-device-flow'
          });
        }
      } else {
        componentLogger.warn('OAuth authentication failed', { error: result.error });
        setAuthState('error');
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      componentLogger.error('OAuth authentication error', { error: error.message });
      setAuthState('error');
      setError(error.message);
    }
  };

  // Cancel OAuth authentication
  const handleCancel = () => {
    componentLogger.userAction('OAuth authentication cancelled');
    oauthDeviceFlowService.cancelPolling();
    oauthDeviceFlowService.reset();
    setAuthState('idle');
    setDeviceAuth(null);
    setStatusMessage('');
    setError('');
    
    if (onAuthCancel) {
      onAuthCancel();
    }
  };

  // Reset to try again
  const handleReset = () => {
    componentLogger.userAction('OAuth authentication reset');
    oauthDeviceFlowService.reset();
    setAuthState('idle');
    setDeviceAuth(null);
    setStatusMessage('');
    setError('');
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    if (deviceAuth?.userCode) {
      try {
        await navigator.clipboard.writeText(deviceAuth.userCode);
        componentLogger.userAction('User code copied to clipboard');
        // Could show a temporary "Copied!" message here
      } catch (error) {
        componentLogger.warn('Failed to copy code to clipboard', { error: error.message });
      }
    }
  };

  // Open verification URL in new tab
  const handleOpenGitHub = () => {
    if (deviceAuth?.verificationUrlComplete) {
      window.open(deviceAuth.verificationUrlComplete, '_blank', 'noopener,noreferrer');
      componentLogger.userAction('Verification URL opened');
    }
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Check if OAuth is configured
  const config = oauthDeviceFlowService.checkConfiguration();
  
  if (!config.isConfigured) {
    return (
      <div className="oauth-login oauth-login--not-configured">
        <div className="oauth-login__header">
          <h3>GitHub OAuth Authentication</h3>
        </div>
        <div className="oauth-login__content">
          <div className="oauth-login__error">
            <p>OAuth authentication is not configured.</p>
            <p>Please contact the administrator to set up OAuth client credentials.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="oauth-login">
      <div className="oauth-login__header">
        <h3>GitHub OAuth Authentication</h3>
        <p className="oauth-login__description">
          Authenticate with GitHub using OAuth for the best experience. 
          This provides higher rate limits and seamless access to your repositories.
        </p>
      </div>

      <div className="oauth-login__content">
        {authState === 'idle' && (
          <div className="oauth-login__start">
            <button 
              className="oauth-login__button oauth-login__button--primary"
              onClick={handleStartOAuth}
              type="button"
            >
              🔐 Authenticate with GitHub OAuth
            </button>
            <p className="oauth-login__help">
              This will open GitHub in a new tab for secure authentication.
              No passwords or tokens needed!
            </p>
          </div>
        )}

        {authState === 'requesting' && (
          <div className="oauth-login__requesting">
            <div className="oauth-login__spinner"></div>
            <p>{statusMessage || 'Requesting authorization code...'}</p>
          </div>
        )}

        {(authState === 'awaiting' || authState === 'polling') && deviceAuth && (
          <div className="oauth-login__awaiting">
            <div className="oauth-login__instructions">
              <h4>Complete Authorization in GitHub</h4>
              <div className="oauth-login__steps">
                <div className="oauth-login__step">
                  <span className="oauth-login__step-number">1</span>
                  <div className="oauth-login__step-content">
                    <p>Visit GitHub and enter this code:</p>
                    <div className="oauth-login__code-container">
                      <code className="oauth-login__user-code">{deviceAuth.userCode}</code>
                      <button 
                        className="oauth-login__copy-button"
                        onClick={handleCopyCode}
                        title="Copy code to clipboard"
                        type="button"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>

                <div className="oauth-login__step">
                  <span className="oauth-login__step-number">2</span>
                  <div className="oauth-login__step-content">
                    <p>Click this button to open GitHub:</p>
                    <button 
                      className="oauth-login__button oauth-login__button--github"
                      onClick={handleOpenGitHub}
                      type="button"
                    >
                      🚀 Open GitHub Authorization
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="oauth-login__status">
              <div className="oauth-login__waiting">
                <div className="oauth-login__spinner oauth-login__spinner--small"></div>
                <span>{statusMessage}</span>
              </div>
              
              {timeRemaining > 0 && (
                <div className="oauth-login__timer">
                  Time remaining: {formatTimeRemaining(timeRemaining)}
                </div>
              )}
            </div>

            <div className="oauth-login__actions">
              <button 
                className="oauth-login__button oauth-login__button--secondary"
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {authState === 'success' && (
          <div className="oauth-login__success">
            <div className="oauth-login__success-icon">✅</div>
            <h4>Authentication Successful!</h4>
            <p>You are now authenticated with GitHub OAuth.</p>
          </div>
        )}

        {authState === 'error' && (
          <div className="oauth-login__error">
            <div className="oauth-login__error-icon">❌</div>
            <h4>Authentication Failed</h4>
            <p>{error}</p>
            <div className="oauth-login__actions">
              <button 
                className="oauth-login__button oauth-login__button--primary"
                onClick={handleReset}
                type="button"
              >
                Try Again
              </button>
              <button 
                className="oauth-login__button oauth-login__button--secondary"
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && authState !== 'error' && (
          <div className="oauth-login__warning">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthLogin;
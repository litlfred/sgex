import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import GITHUB_CONFIG from '../config/github';
import logger from '../utils/logger';
import './OAuthDeviceFlow.css';

const OAuthDeviceFlow = ({ onAuthSuccess, onError, scopes = GITHUB_CONFIG.DEFAULT_SCOPES }) => {
  const [state, setState] = useState('idle'); // 'idle', 'initiating', 'waiting', 'polling', 'success', 'error'
  const [deviceFlowData, setDeviceFlowData] = useState(null);
  const [error, setError] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const componentLogger = logger.getLogger('OAuthDeviceFlow');

  useEffect(() => {
    componentLogger.componentMount({ scopes });
    return () => {
      componentLogger.componentUnmount();
      // Clean up polling interval on unmount
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [componentLogger, scopes, pollingInterval]);

  const handleStartDeviceFlow = async () => {
    componentLogger.userAction('Starting OAuth device flow', { scopes });
    setState('initiating');
    setError('');

    try {
      const deviceData = await githubService.initiateDeviceFlow(scopes);
      setDeviceFlowData(deviceData);
      setState('waiting');
      setTimeRemaining(deviceData.expires_in);
      
      componentLogger.auth('Device flow initiated', { 
        verification_uri: deviceData.verification_uri,
        expires_in: deviceData.expires_in 
      });

      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setState('error');
            setError('Device code expired. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-start polling after a short delay
      setTimeout(() => {
        startPolling(deviceData);
      }, 2000);

    } catch (err) {
      componentLogger.auth('Device flow initiation failed', { error: err.message });
      setState('error');
      setError('Failed to start device flow. Please try again.');
      if (onError) onError(err);
    }
  };

  const startPolling = (deviceData) => {
    componentLogger.auth('Starting device flow polling');
    setState('polling');

    const interval = setInterval(async () => {
      try {
        const result = await githubService.pollDeviceFlowToken(deviceData.device_code, deviceData.interval);
        
        if (result.status === 'success') {
          clearInterval(interval);
          setPollingInterval(null);
          
          // Complete the authentication
          const authResult = await githubService.authenticateWithDeviceFlow(
            result.access_token, 
            result.scope ? result.scope.split(' ') : scopes
          );
          
          setState('success');
          componentLogger.auth('OAuth device flow completed successfully', { 
            username: authResult.user.login,
            scopes: authResult.scopes 
          });
          
          if (onAuthSuccess) {
            onAuthSuccess(result.access_token, authResult.user, authResult.scopes);
          }
          
        } else if (result.status === 'pending') {
          // Continue polling
          componentLogger.debug('Device flow still pending');
        } else if (result.status === 'slow_down') {
          // Increase polling interval
          clearInterval(interval);
          setTimeout(() => startPolling(deviceData), (deviceData.interval + 2) * 1000);
        } else if (result.status === 'expired') {
          clearInterval(interval);
          setPollingInterval(null);
          setState('error');
          setError('Device code expired. Please try again.');
        } else if (result.status === 'denied') {
          clearInterval(interval);
          setPollingInterval(null);
          setState('error');
          setError('Access denied. Please try again if you change your mind.');
        }
      } catch (err) {
        componentLogger.auth('Device flow polling error', { error: err.message });
        clearInterval(interval);
        setPollingInterval(null);
        setState('error');
        setError('Authentication failed. Please try again.');
        if (onError) onError(err);
      }
    }, deviceData.interval * 1000);

    setPollingInterval(interval);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScopeDescription = (scope) => {
    return GITHUB_CONFIG.SCOPE_DESCRIPTIONS[scope] || scope;
  };

  const openVerificationPage = () => {
    if (deviceFlowData?.verification_uri_complete) {
      window.open(deviceFlowData.verification_uri_complete, '_blank');
    } else if (deviceFlowData?.verification_uri) {
      window.open(deviceFlowData.verification_uri, '_blank');
    }
  };

  if (state === 'idle') {
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

          <button 
            onClick={handleStartDeviceFlow}
            className="github-oauth-btn"
          >
            <span className="github-icon">🔗</span>
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  if (state === 'initiating') {
    return (
      <div className="oauth-device-flow">
        <div className="oauth-section">
          <div className="oauth-status loading">
            <span className="spinner"></span>
            <p>Preparing GitHub authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'waiting' || state === 'polling') {
    return (
      <div className="oauth-device-flow">
        <div className="oauth-section">
          <div className="device-flow-instructions">
            <h4>Complete GitHub Authentication</h4>
            
            <div className="verification-step">
              <p><strong>Step 1:</strong> Copy this code:</p>
              <div className="device-code">
                <code className="user-code">{deviceFlowData?.user_code}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(deviceFlowData?.user_code)}
                  className="copy-btn"
                  title="Copy code"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="verification-step">
              <p><strong>Step 2:</strong> Open GitHub and enter the code:</p>
              <button 
                onClick={openVerificationPage}
                className="verification-btn"
              >
                🔗 Open GitHub ({deviceFlowData?.verification_uri})
              </button>
            </div>

            <div className="oauth-status">
              {state === 'waiting' && (
                <p>⏳ Waiting for you to authorize the app...</p>
              )}
              {state === 'polling' && (
                <p>🔄 Checking for authorization...</p>
              )}
              
              <div className="time-remaining">
                Code expires in: <strong>{formatTime(timeRemaining)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="oauth-device-flow">
        <div className="oauth-section">
          <div className="oauth-status success">
            <span className="success-icon">✅</span>
            <p>Successfully signed in with GitHub!</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="oauth-device-flow">
        <div className="oauth-section">
          <div className="oauth-status error">
            <span className="error-icon">❌</span>
            <p>{error}</p>
            <button 
              onClick={() => {
                setState('idle');
                setError('');
                setDeviceFlowData(null);
              }}
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthDeviceFlow;
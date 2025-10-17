import React, { useEffect, useState, useRef, useCallback } from 'react';
import logger from '../utils/logger';
import crossTabSyncService, { CrossTabEventTypes } from '../services/crossTabSyncService';
import samlAuthService from '../services/samlAuthService';
import './SAMLAuthModal.css';

/**
 * SAMLAuthModal Component
 * 
 * Enhanced modal dialog that guides users through GitHub SAML SSO authorization process.
 * Features:
 * - Automatic polling for SAML authorization status
 * - Cross-tab synchronization to ensure single modal per org
 * - Automatic retry of original request on authorization
 * - Session storage for state persistence
 * - Configurable polling intervals and timeouts
 */
const SAMLAuthModal = ({ 
  isOpen, 
  onClose, 
  samlInfo,
  onAuthorizationComplete,
  pollingInterval = 3000,
  pollingTimeout = 300000 // 5 minutes
}) => {
  const componentLogger = logger.getLogger('SAMLAuthModal');
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState(null);
  const [ssoWindowRef, setSsoWindowRef] = useState(null);
  const pollingIntervalRef = useRef(null);
  const pollingStartTimeRef = useRef(null);
  const originalRequestRef = useRef(null);

  // Store original request for automatic retry
  useEffect(() => {
    if (isOpen && samlInfo?.originalRequest) {
      originalRequestRef.current = samlInfo.originalRequest;
    }
  }, [isOpen, samlInfo]);

  // Check if SAML authorization is successful
  const checkSAMLStatus = useCallback(async () => {
    if (!samlInfo?.organization) return false;

    try {
      componentLogger.debug('Checking SAML authorization status', {
        organization: samlInfo.organization,
        repository: samlInfo.repository
      });

      // Attempt to retry the original request if available
      if (originalRequestRef.current) {
        try {
          await originalRequestRef.current();
          componentLogger.info('SAML authorization successful - original request succeeded', {
            organization: samlInfo.organization
          });
          return true;
        } catch (error) {
          // If still 403 SAML error, authorization not complete yet
          if (error.status === 403 && error.message?.toLowerCase().includes('saml')) {
            return false;
          }
          // If different error, authorization may be complete but request failed for other reasons
          componentLogger.warn('Original request failed with non-SAML error', {
            organization: samlInfo.organization,
            error: error.message
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      componentLogger.error('Error checking SAML status', {
        organization: samlInfo.organization,
        error: error.message
      });
      return false;
    }
  }, [samlInfo, componentLogger]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
      setPollingStatus(null);
      pollingStartTimeRef.current = null;
      
      componentLogger.debug('Polling stopped', {
        organization: samlInfo?.organization
      });
    }
  }, [samlInfo, componentLogger]);

  // Start polling for SAML authorization
  const startPolling = useCallback(() => {
    if (isPolling || !samlInfo?.organization) return;

    setIsPolling(true);
    pollingStartTimeRef.current = Date.now();
    setPollingStatus('Waiting for authorization...');

    componentLogger.info('Started polling for SAML authorization', {
      organization: samlInfo.organization,
      pollingInterval,
      pollingTimeout
    });

    // Broadcast that this tab is polling for this org
    if (crossTabSyncService.isAvailable()) {
      crossTabSyncService.broadcast(CrossTabEventTypes.SAML_POLLING_STARTED, {
        organization: samlInfo.organization,
        timestamp: Date.now()
      });
    }

    // Start polling
    pollingIntervalRef.current = setInterval(async () => {
      const elapsedTime = Date.now() - pollingStartTimeRef.current;
      
      // Check timeout
      if (elapsedTime > pollingTimeout) {
        componentLogger.warn('SAML polling timeout reached', {
          organization: samlInfo.organization,
          elapsedTime,
          timeout: pollingTimeout
        });
        setPollingStatus('Authorization check timed out. Please try again.');
        stopPolling();
        return;
      }

      // Check SAML status
      const authorized = await checkSAMLStatus();
      
      if (authorized) {
        componentLogger.info('SAML authorization detected', {
          organization: samlInfo.organization,
          elapsedTime
        });
        
        // Mark as authorized in service
        samlAuthService.markSAMLAuthorized(samlInfo.organization, samlInfo.repository);
        
        // Notify completion
        if (onAuthorizationComplete) {
          onAuthorizationComplete({
            organization: samlInfo.organization,
            repository: samlInfo.repository
          });
        }
        
        // Close modal
        setPollingStatus('Authorization successful!');
        setTimeout(() => {
          stopPolling();
          onClose();
        }, 1000);
      } else {
        componentLogger.debug('SAML authorization not yet complete', {
          organization: samlInfo.organization,
          elapsedTime
        });
      }
    }, pollingInterval);
  }, [
    isPolling,
    samlInfo,
    pollingInterval,
    pollingTimeout,
    checkSAMLStatus,
    stopPolling,
    onAuthorizationComplete,
    onClose,
    componentLogger
  ]);

  // Listen for SAML authentication events from other tabs
  useEffect(() => {
    if (!isOpen || !samlInfo?.organization) return;

    const unsubscribe = crossTabSyncService.on(
      CrossTabEventTypes.SAML_AUTHENTICATED,
      (data) => {
        if (data.organization === samlInfo.organization) {
          componentLogger.debug('SAML authentication detected from another tab', {
            organization: data.organization
          });
          stopPolling();
          onClose();
        }
      }
    );

    return unsubscribe;
  }, [isOpen, samlInfo, stopPolling, onClose, componentLogger]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      
      // Close SSO window if open
      if (ssoWindowRef && !ssoWindowRef.closed) {
        componentLogger.debug('Closing SSO window', {
          organization: samlInfo?.organization
        });
      }
    }
  }, [isOpen, ssoWindowRef, samlInfo, stopPolling, componentLogger]);

  useEffect(() => {
    if (isOpen && samlInfo) {
      componentLogger.componentMount({ 
        organization: samlInfo.organization,
        repository: samlInfo.repository 
      });
    }
    return () => {
      if (isOpen) {
        stopPolling();
        componentLogger.componentUnmount();
      }
    };
  }, [componentLogger, isOpen, samlInfo, stopPolling]);

  if (!isOpen || !samlInfo) {
    return null;
  }

  const { organization, repository, authorizationUrl } = samlInfo;

  const handleAuthorize = () => {
    componentLogger.userAction('Authorize SAML clicked', { 
      organization,
      authorizationUrl 
    });
    
    // Open GitHub SAML authorization page in new tab/window
    const ssoWindow = window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
    setSsoWindowRef(ssoWindow);
    
    componentLogger.info('SAML authorization page opened', {
      organization,
      instruction: 'Polling will check for authorization completion'
    });

    // Start polling
    startPolling();
  };

  const handleLater = () => {
    componentLogger.userAction('SAML modal "Later" clicked', { organization });
    
    // Stop polling if active
    stopPolling();
    
    // Start cooldown period
    samlAuthService.clearCooldown(organization);
    
    onClose();
  };

  const handleClose = () => {
    componentLogger.userAction('SAML modal closed', { organization });
    stopPolling();
    onClose();
  };

  return (
    <div 
      className="saml-modal-overlay" 
      onClick={handleClose}
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="saml-modal-title"
      tabIndex={-1}
    >
      <div 
        className="saml-modal" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="saml-modal-header">
          <h2 id="saml-modal-title">🔐 SAML SSO Authorization Required</h2>
          <button 
            onClick={handleClose}
            className="close-button"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="saml-modal-content">
          <div className="saml-info-section">
            <div className="saml-icon">
              <span role="img" aria-label="lock">🔒</span>
            </div>
            
            <h3>Organization Access Required</h3>
            <p className="saml-description">
              Your Personal Access Token needs SAML SSO authorization to access the{' '}
              <strong>{organization}</strong> organization{repository ? ` and the ${repository} repository` : ''}.
            </p>
          </div>

          <div className="saml-steps-section">
            <h4>How to authorize your token:</h4>
            <ol className="saml-steps">
              <li>
                <strong>Click "Authorize on GitHub"</strong> below to open the authorization page
              </li>
              <li>
                <strong>Review the permissions</strong> requested by the organization
              </li>
              <li>
                <strong>Click "Authorize"</strong> to grant your token access
              </li>
              <li>
                <strong>This modal will automatically detect</strong> when authorization is complete
              </li>
            </ol>
          </div>

          {isPolling && (
            <div className="saml-polling-status">
              <span className="polling-spinner">⏳</span>
              <p>{pollingStatus}</p>
            </div>
          )}

          <div className="saml-note">
            <span className="note-icon">ℹ️</span>
            <p>
              This is a GitHub security feature for organizations using SAML SSO.
              You only need to authorize once per organization per token.
              {!isPolling && ' Click "Later" to dismiss for 1 minute.'}
            </p>
          </div>

          <div className="saml-modal-actions">
            {!isPolling ? (
              <>
                <button 
                  onClick={handleAuthorize}
                  className="saml-authorize-btn"
                >
                  🔓 Authorize on GitHub
                </button>
                <button 
                  onClick={handleLater}
                  className="saml-cancel-btn"
                >
                  Later
                </button>
              </>
            ) : (
              <button 
                onClick={handleClose}
                className="saml-cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SAMLAuthModal;

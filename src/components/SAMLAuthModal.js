import React, { useEffect, useState, useRef } from 'react';
import logger from '../utils/logger';
import samlAuthService from '../services/samlAuthService';
import crossTabSyncService from '../services/crossTabSyncService';
import './SAMLAuthModal.css';

/**
 * SAMLAuthModal Component
 * 
 * Modal dialog that guides users through GitHub SAML SSO authorization process.
 * Displayed when a Personal Access Token needs SAML SSO authorization for an organization.
 * 
 * Features:
 * - Polling for authorization completion
 * - Cross-tab coordination
 * - Automatic retry on success
 */
const SAMLAuthModal = ({ isOpen, onClose, samlInfo }) => {
  const componentLogger = logger.getLogger('SAMLAuthModal');
  const [isPolling, setIsPolling] = useState(false);
  const ssoWindowRef = useRef(null);
  const crossTabUnsubscribeRef = useRef(null);

  useEffect(() => {
    if (isOpen && samlInfo) {
      componentLogger.componentMount({ 
        organization: samlInfo.organization,
        repository: samlInfo.repository 
      });
      
      // Subscribe to cross-tab events for this modal
      crossTabUnsubscribeRef.current = crossTabSyncService.subscribe('saml-events', (data) => {
        if (data.organization === samlInfo.organization) {
          if (data.type === 'authorization-complete') {
            componentLogger.info('Authorization completed in another tab', {
              organization: samlInfo.organization
            });
            
            // Close this modal
            handleClose();
          }
        }
      });
    }
    
    return () => {
      if (isOpen) {
        componentLogger.componentUnmount();
        
        // Clean up cross-tab subscription
        if (crossTabUnsubscribeRef.current) {
          crossTabUnsubscribeRef.current();
          crossTabUnsubscribeRef.current = null;
        }
        
        // Close SSO window if still open
        if (ssoWindowRef.current && !ssoWindowRef.current.closed) {
          ssoWindowRef.current.close();
        }
      }
    };
  }, [componentLogger, isOpen, samlInfo]);

  if (!isOpen || !samlInfo) {
    return null;
  }

  const { organization, repository, authorizationUrl } = samlInfo;

  const handleAuthorize = () => {
    componentLogger.userAction('Authorize SAML clicked', { 
      organization,
      authorizationUrl 
    });
    
    // Open GitHub SAML authorization page in new tab
    ssoWindowRef.current = window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
    
    // Start polling for authorization completion
    setIsPolling(true);
    samlAuthService.startPolling(organization, ssoWindowRef.current);
    
    // Log instruction for user
    componentLogger.info('SAML authorization page opened, polling started', {
      type: 'authorization-initiated',
      organization,
      instruction: 'Polling for authorization completion'
    });
  };

  const handleLater = () => {
    componentLogger.userAction('Later clicked', { 
      type: 'later-clicked',
      organization 
    });
    
    // Stop polling if active
    if (isPolling) {
      samlAuthService.stopPolling(organization);
      setIsPolling(false);
    }
    
    // Notify service that modal was closed with "Later"
    samlAuthService.notifyModalClosed(organization, true);
    
    onClose();
  };

  const handleClose = () => {
    componentLogger.userAction('SAML modal closed', { 
      type: 'modal-closed',
      organization 
    });
    
    // Stop polling if active
    if (isPolling) {
      samlAuthService.stopPolling(organization);
      setIsPolling(false);
    }
    
    // Notify service that modal was closed
    samlAuthService.notifyModalClosed(organization, false);
    
    onClose();
  };

  return (
    <div 
      className="saml-modal-overlay" 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="saml-modal-title"
    >
      <div 
        className="saml-modal" 
        onClick={(e) => e.stopPropagation()}
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
                <strong>Return to this page</strong> - the authorization will be detected automatically
              </li>
            </ol>
            
            {isPolling && (
              <div className="polling-indicator">
                <span className="spinner">⏳</span>
                <span>Waiting for authorization...</span>
              </div>
            )}
          </div>

          <div className="saml-note">
            <span className="note-icon">ℹ️</span>
            <p>
              This is a GitHub security feature for organizations using SAML SSO.
              You only need to authorize once per organization per token.
              {isPolling && ' Your authorization will be detected automatically when complete.'}
            </p>
          </div>

          <div className="saml-modal-actions">
            <button 
              onClick={handleAuthorize}
              className="saml-authorize-btn"
              disabled={isPolling}
            >
              {isPolling ? '⏳ Waiting...' : '🔓 Authorize on GitHub'}
            </button>
            <button 
              onClick={handleLater}
              className="saml-cancel-btn"
              title="Dismiss for 1 minute"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SAMLAuthModal;

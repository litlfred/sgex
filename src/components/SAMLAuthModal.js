import React, { useEffect } from 'react';
import logger from '../utils/logger';
import './SAMLAuthModal.css';

/**
 * SAMLAuthModal Component
 * 
 * Modal dialog that guides users through GitHub SAML SSO authorization process.
 * Displayed when a Personal Access Token needs SAML SSO authorization for an organization.
 */
const SAMLAuthModal = ({ isOpen, onClose, samlInfo }) => {
  const componentLogger = logger.getLogger('SAMLAuthModal');

  useEffect(() => {
    if (isOpen && samlInfo) {
      componentLogger.componentMount({ 
        organization: samlInfo.organization,
        repository: samlInfo.repository 
      });
    }
    return () => {
      if (isOpen) {
        componentLogger.componentUnmount();
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
    window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
    
    // Log instruction for user
    componentLogger.info('SAML authorization page opened', {
      organization,
      instruction: 'User should authorize their PAT on GitHub and then refresh'
    });
  };

  const handleClose = () => {
    componentLogger.userAction('SAML modal closed', { organization });
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
                <strong>Return to this page</strong> and refresh or try your action again
              </li>
            </ol>
          </div>

          <div className="saml-note">
            <span className="note-icon">ℹ️</span>
            <p>
              This is a GitHub security feature for organizations using SAML SSO.
              You only need to authorize once per organization per token.
            </p>
          </div>

          <div className="saml-modal-actions">
            <button 
              onClick={handleAuthorize}
              className="saml-authorize-btn"
            >
              🔓 Authorize on GitHub
            </button>
            <button 
              onClick={handleClose}
              className="saml-cancel-btn"
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

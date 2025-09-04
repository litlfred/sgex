import React, { useState } from 'react';
import './SAMLAuthorizationModal.css';

/**
 * Modal component for guiding users through SAML authorization process
 */
const SAMLAuthorizationModal = ({ 
  isOpen, 
  onClose, 
  samlErrorInfo, 
  onRetry,
  onSkip 
}) => {
  const [authorizationAttempted, setAuthorizationAttempted] = useState(false);

  if (!isOpen || !samlErrorInfo) return null;

  const handleSAMLAuthorization = () => {
    setAuthorizationAttempted(true);
    
    console.log('SAML Authorization Flow Debug:', {
      authorizationURL: samlErrorInfo.authorizationURL,
      currentLocation: window.location.href,
      organization: samlErrorInfo.organization
    });
    
    // Navigate to GitHub's SAML authorization page in the same tab
    // GitHub will redirect back to the select_profile page after authorization
    window.location.href = samlErrorInfo.authorizationURL;
  };

  const handleDocumentation = () => {
    window.open(samlErrorInfo.documentationURL, '_blank', 'noopener,noreferrer');
  };

  const handleRetryAfterAuth = () => {
    setAuthorizationAttempted(false);
    if (onRetry) {
      onRetry();
    }
  };

  const handleSkipSAML = () => {
    setAuthorizationAttempted(false);
    if (onSkip) {
      onSkip();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOverlayKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="saml-modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="saml-modal-title"
      tabIndex="-1"
    >
      <div className="saml-modal">
        <div className="saml-modal-header">
          <div className="saml-icon">
            {samlErrorInfo.isRequired ? '🔒' : '🔐'}
          </div>
          <h2 id="saml-modal-title">{samlErrorInfo.title}</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="saml-modal-content">
          <div className="saml-message">
            <p>{samlErrorInfo.message}</p>
            {samlErrorInfo.context && (
              <p className="saml-context">
                <strong>Context:</strong> {samlErrorInfo.context}
              </p>
            )}
          </div>

          <div className="saml-organization-info">
            <div className="org-badge">
              <span className="org-icon">🏢</span>
              <span className="org-name">{samlErrorInfo.organization}</span>
            </div>
          </div>

          <div className="saml-instructions">
            <h3>📋 Authorization Steps:</h3>
            <ol>
              {samlErrorInfo.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          {authorizationAttempted && (
            <div className="saml-post-auth">
              <div className="success-note">
                <span className="success-icon">✅</span>
                <span>Redirecting to GitHub for authorization. You'll return here automatically after completion.</span>
              </div>
            </div>
          )}

          <div className="saml-actions">
            <button 
              className="saml-btn primary"
              onClick={handleSAMLAuthorization}
              disabled={authorizationAttempted}
            >
              {authorizationAttempted ? '✅ Authorization Started' : '🔓 Authorize SAML'}
            </button>

            {authorizationAttempted && (
              <button 
                className="saml-btn success"
                onClick={handleRetryAfterAuth}
              >
                🔄 Retry After Authorization
              </button>
            )}

            {!samlErrorInfo.isRequired && onSkip && (
              <button 
                className="saml-btn secondary"
                onClick={handleSkipSAML}
              >
                ⏭️ Skip for Now
              </button>
            )}

            <button 
              className="saml-btn link"
              onClick={handleDocumentation}
            >
              📖 View Documentation
            </button>
          </div>

          {!samlErrorInfo.isRequired && (
            <div className="saml-note">
              <span className="note-icon">💡</span>
              <span>SAML authorization is optional for this action. You can continue without it, but some features may be limited.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SAMLAuthorizationModal;
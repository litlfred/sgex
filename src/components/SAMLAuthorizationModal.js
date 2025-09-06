import React, { useState, useRef, useEffect } from 'react';
import githubService from '../services/githubService';
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
  const [checkingCompletion, setCheckingCompletion] = useState(false);
  const [completionCheckCount, setCompletionCheckCount] = useState(0);
  const checkInterval = useRef(null);

  // Clean up interval on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
        checkInterval.current = null;
      }
    };
  }, []);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
        checkInterval.current = null;
      }
      setCheckingCompletion(false);
      setCompletionCheckCount(0);
    }
  }, [isOpen]);

  // Add global escape key listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleGlobalKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !samlErrorInfo) return null;

  const startSAMLCompletionCheck = () => {
    setCheckingCompletion(true);
    setCompletionCheckCount(0);
    
    console.log('Starting SAML completion check for organization:', samlErrorInfo.organization);
    
    // Check for SAML completion every 3 seconds, up to 20 times (1 minute)
    checkInterval.current = setInterval(async () => {
      try {
        setCompletionCheckCount(prev => prev + 1);
        
        // Try to access the organization to see if SAML authorization completed
        const org = await githubService.getOrganization(samlErrorInfo.organization);
        
        if (org && !org.needsSAMLAuth) {
          console.log('SAML authorization detected as complete for', samlErrorInfo.organization);
          
          // Stop checking
          clearInterval(checkInterval.current);
          checkInterval.current = null;
          setCheckingCompletion(false);
          
          // Trigger success callback
          if (onRetry) {
            onRetry();
          }
        }
      } catch (error) {
        console.log(`SAML check ${completionCheckCount + 1}: Authorization still pending`);
        
        // Stop checking after 20 attempts (1 minute)
        if (completionCheckCount >= 19) {
          console.log('SAML completion check timeout - stopping automatic checks');
          clearInterval(checkInterval.current);
          checkInterval.current = null;
          setCheckingCompletion(false);
        }
      }
    }, 3000);
  };

  const handleSAMLAuthorization = () => {
    setAuthorizationAttempted(true);
    
    console.log('SAML Authorization Flow Debug:', {
      authorizationURL: samlErrorInfo.authorizationURL,
      currentLocation: window.location.href,
      organization: samlErrorInfo.organization
    });
    
    // Open GitHub's SAML authorization page in a new tab to preserve the current page
    // User can complete SAML authorization and return manually or use browser navigation
    window.open(samlErrorInfo.authorizationURL, '_blank', 'noopener,noreferrer');
    
    // Set up interval to check for SAML completion
    startSAMLCompletionCheck();
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

  const handleCloseWithKeyboard = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div 
      className="saml-modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="saml-modal-title"
      tabIndex="-1"
    >
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
            onKeyDown={handleCloseWithKeyboard}
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

          {(authorizationAttempted || checkingCompletion) && (
            <div className="saml-post-auth">
              <div className="success-note">
                <span className="success-icon">✅</span>
                <span>
                  SAML authorization opened in new tab. 
                  {checkingCompletion ? 
                    ` Checking for completion... (${completionCheckCount}/20)` : 
                    ' Complete the authorization and return here.'
                  }
                </span>
              </div>
              {checkingCompletion && (
                <div className="checking-status">
                  <div className="spinner-small"></div>
                  <span>Automatically checking for SAML completion...</span>
                </div>
              )}
            </div>
          )}

          <div className="saml-actions">
            <button 
              className="saml-btn primary"
              onClick={handleSAMLAuthorization}
              disabled={authorizationAttempted || checkingCompletion}
            >
              {(authorizationAttempted || checkingCompletion) ? '✅ Authorization Started' : '🔓 Authorize SAML'}
            </button>

            {(authorizationAttempted || checkingCompletion) && (
              <button 
                className="saml-btn success"
                onClick={handleRetryAfterAuth}
                disabled={checkingCompletion}
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
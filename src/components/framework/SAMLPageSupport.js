import React, { useState, useEffect } from 'react';
import { usePage } from './PageProvider';
import SAMLAuthorizationModal from '../SAMLAuthorizationModal';
import { isSAMLError, createSAMLErrorInfo } from '../../utils/samlErrorHandler';
import githubService from '../../services/githubService';

/**
 * HOC that adds SAML error handling to page components
 * Useful for DAK/Asset pages where SAML authorization may be required
 */
const withSAMLSupport = (WrappedComponent) => {
  const SAMLAwarePage = (props) => {
    const pageContext = usePage();
    const [samlModal, setSamlModal] = useState({ isOpen: false, errorInfo: null });
    const [samlRequiredError, setSamlRequiredError] = useState(null);

    /**
     * Handle SAML errors that occur during component operations
     * @param {Error} error - The error that occurred
     * @param {string} organization - The organization requiring SAML auth
     * @param {Object} options - Configuration options
     */
    const handleSAMLError = (error, organization, options = {}) => {
      if (!isSAMLError(error)) {
        // Not a SAML error, let the component handle it normally
        return false;
      }

      const { isRequired = true, context = 'access this resource' } = options;
      
      const samlErrorInfo = createSAMLErrorInfo(error, organization, {
        isRequired,
        context
      });

      if (isRequired) {
        // For required SAML, show modal immediately
        setSamlModal({
          isOpen: true,
          errorInfo: samlErrorInfo
        });
        setSamlRequiredError(error);
      } else {
        // For optional SAML, just show modal
        setSamlModal({
          isOpen: true,
          errorInfo: samlErrorInfo
        });
      }

      return true; // Indicates SAML error was handled
    };

    /**
     * Retry the operation after SAML authorization
     */
    const handleSAMLRetry = async () => {
      const organization = samlModal.errorInfo?.organization;
      
      if (!organization) {
        console.error('No organization specified for SAML retry');
        return;
      }

      try {
        // Test if SAML authorization was successful by making a simple API call
        await githubService.getOrganization(organization);
        
        // Success! Clear error and close modal
        setSamlRequiredError(null);
        setSamlModal({ isOpen: false, errorInfo: null });
        
        // Trigger a page refresh or component re-render to retry the original operation
        if (props.onSAMLAuthSuccess) {
          props.onSAMLAuthSuccess(organization);
        } else {
          // Default behavior: reload the page
          window.location.reload();
        }
      } catch (error) {
        if (isSAMLError(error)) {
          // Still needs SAML authorization - keep modal open
          console.log('SAML authorization still required');
        } else {
          // Different error - close modal and let component handle it
          setSamlModal({ isOpen: false, errorInfo: null });
          setSamlRequiredError(null);
        }
      }
    };

    /**
     * Skip SAML authorization (only for optional SAML)
     */
    const handleSAMLSkip = () => {
      setSamlModal({ isOpen: false, errorInfo: null });
      
      if (props.onSAMLSkip) {
        props.onSAMLSkip();
      }
    };

    /**
     * Close SAML modal
     */
    const handleSAMLClose = () => {
      if (samlModal.errorInfo?.isRequired && samlRequiredError) {
        // Don't close modal if SAML is required and error persists
        return;
      }
      
      setSamlModal({ isOpen: false, errorInfo: null });
    };

    // Provide SAML handling functions to wrapped component
    const samlProps = {
      ...props,
      saml: {
        handleError: handleSAMLError,
        isModalOpen: samlModal.isOpen,
        hasRequiredError: !!samlRequiredError,
        organization: samlModal.errorInfo?.organization
      }
    };

    return (
      <>
        <WrappedComponent {...samlProps} />
        
        {/* SAML Authorization Modal */}
        <SAMLAuthorizationModal
          isOpen={samlModal.isOpen}
          onClose={handleSAMLClose}
          samlErrorInfo={samlModal.errorInfo}
          onRetry={handleSAMLRetry}
          onSkip={!samlModal.errorInfo?.isRequired ? handleSAMLSkip : undefined}
        />
      </>
    );
  };

  // Set display name for debugging
  SAMLAwarePage.displayName = `withSAMLSupport(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return SAMLAwarePage;
};

/**
 * Hook for using SAML functionality in function components
 */
export const useSAMLError = () => {
  const [samlModal, setSamlModal] = useState({ isOpen: false, errorInfo: null });

  const handleSAMLError = (error, organization, options = {}) => {
    if (!isSAMLError(error)) {
      return false;
    }

    const { isRequired = false, context = 'access this resource' } = options;
    
    const samlErrorInfo = createSAMLErrorInfo(error, organization, {
      isRequired,
      context
    });

    setSamlModal({
      isOpen: true,
      errorInfo: samlErrorInfo
    });

    return true;
  };

  const closeSAMLModal = () => {
    setSamlModal({ isOpen: false, errorInfo: null });
  };

  return {
    samlModal,
    handleSAMLError,
    closeSAMLModal,
    SAMLModal: ({ onRetry, onSkip }) => (
      <SAMLAuthorizationModal
        isOpen={samlModal.isOpen}
        onClose={closeSAMLModal}
        samlErrorInfo={samlModal.errorInfo}
        onRetry={onRetry}
        onSkip={onSkip}
      />
    )
  };
};

export default withSAMLSupport;
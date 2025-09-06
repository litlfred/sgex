/**
 * Test component to demonstrate SAML error handling in action
 * This can be used to test the SAML modal without needing actual GitHub API calls
 */

import React, { useState } from 'react';
import SAMLAuthorizationModal from '../components/SAMLAuthorizationModal';
import { createSAMLErrorInfo } from '../utils/samlErrorHandler';

const SAMLTestDemo = () => {
  const [modalState, setModalState] = useState({ isOpen: false, errorInfo: null });

  const showOptionalSAML = () => {
    const samlErrorInfo = createSAMLErrorInfo(
      new Error('SAML enforcement error'),
      'WorldHealthOrganization',
      {
        isRequired: false,
        context: 'access additional organization features'
      }
    );
    
    setModalState({ isOpen: true, errorInfo: samlErrorInfo });
  };

  const showRequiredSAML = () => {
    const samlErrorInfo = createSAMLErrorInfo(
      new Error('SAML enforcement error'),
      'WorldHealthOrganization',
      {
        isRequired: true,
        context: 'edit DAK repositories'
      }
    );
    
    setModalState({ isOpen: true, errorInfo: samlErrorInfo });
  };

  const handleRetry = () => {
    console.log('SAML authorization retry attempted');
    alert('SAML authorization completed! (Demo)');
    setModalState({ isOpen: false, errorInfo: null });
  };

  const handleSkip = () => {
    console.log('SAML authorization skipped');
    setModalState({ isOpen: false, errorInfo: null });
  };

  const handleClose = () => {
    setModalState({ isOpen: false, errorInfo: null });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>SAML Authorization Demo</h1>
      <p>This demo shows how SAML authorization modals work in SGEX Workbench.</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={showOptionalSAML}
          style={{
            background: '#0078d4',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Show Optional SAML Modal
        </button>
        
        <button 
          onClick={showRequiredSAML}
          style={{
            background: '#d73502',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Show Required SAML Modal
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '4px',
        border: '1px solid #e9ecef'
      }}>
        <h3>📋 Test Scenarios:</h3>
        <ul>
          <li><strong>Optional SAML:</strong> Used on profile selection page - user can skip</li>
          <li><strong>Required SAML:</strong> Used on DAK/Asset pages - user must authorize</li>
        </ul>
        
        <h3>🔧 Expected Behavior:</h3>
        <ul>
          <li>Clear instructions for authorization process</li>
          <li>Visual indicators for organization type</li>
          <li>One-click authorization workflow</li>
          <li>Proper error handling and retry logic</li>
        </ul>
      </div>

      <SAMLAuthorizationModal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        samlErrorInfo={modalState.errorInfo}
        onRetry={handleRetry}
        onSkip={handleSkip}
      />
    </div>
  );
};

export default SAMLTestDemo;
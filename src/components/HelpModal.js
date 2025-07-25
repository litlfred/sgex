import React, { useState } from 'react';
import GitHubTokenSlideshow from './GitHubTokenSlideshow';
import './HelpModal.css';

const HelpModal = ({ topic, contextData, onClose }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleBugReport = () => {
    const issueUrl = 'https://github.com/litlfred/sgex/issues/new';
    const title = encodeURIComponent(`Bug Report: ${topic}`);
    const body = encodeURIComponent(`
**Issue Description:**
Please describe the issue you encountered.

**Context:**
- Help Topic: ${topic}
- Page: ${window.location.pathname}
- Context Data: ${JSON.stringify(contextData, null, 2)}

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
What did you expect to happen?

**Actual Behavior:**
What actually happened?

**Additional Information:**
Any other relevant information or screenshots.
    `.trim());
    
    window.open(`${issueUrl}?title=${title}&body=${body}`, '_blank');
  };

  const handleDAKFeedback = () => {
    if (contextData.repository) {
      const { owner, name } = contextData.repository;
      const issueUrl = `https://github.com/${owner}/${name}/issues`;
      window.open(issueUrl, '_blank');
    }
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent(`SGEX Workbench Support: ${topic}`);
    const body = encodeURIComponent(`
Hello SMART Guidelines Team,

I need assistance with the SGEX Workbench.

Topic: ${topic}
Page: ${window.location.pathname}

Please describe your question or issue:


Best regards,
    `.trim());
    
    window.open(`mailto:smart@who.int?subject=${subject}&body=${body}`);
  };

  const getHelpContent = () => {
    switch (topic) {
      case 'github-token':
        return {
          title: `GitHub Personal Access Token Help${contextData.upgradeMode ? ' - Upgrade to Edit Access' : ''}`,
          content: <GitHubTokenSlideshow contextData={contextData} />
        };
      default:
        return {
          title: 'SGEX Workbench Help',
          content: (
            <div className="help-content">
              <div className="mascot-message">
                <img src="/sgex/mascot-full.svg" alt="SGEX Helper" className="help-mascot" />
                <div className="message-bubble">
                  <p>Hi! I'm here to help you with the SGEX Workbench.</p>
                  <p>Use the menu in the top right to get additional support options.</p>
                </div>
              </div>
            </div>
          )
        };
    }
  };

  const { title, content } = getHelpContent();

  return (
    <div className="help-modal-overlay" onClick={handleOverlayClick}>
      <div className="help-modal">
        <div className="help-modal-header">
          <h2>{title}</h2>
          <div className="help-modal-actions">
            <button 
              className="hamburger-menu-btn"
              onClick={handleMenuToggle}
              aria-label="More options"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <button 
              className="close-btn"
              onClick={onClose}
              aria-label="Close help"
            >
              ×
            </button>
          </div>
          
          {showMenu && (
            <div className="help-menu-dropdown">
              <button onClick={handleBugReport} className="menu-item">
                <img src="/sgex/bug-report-icon.svg" alt="Bug" className="menu-icon" />
                File Bug Report
              </button>
              
              {contextData.repository && (
                <button onClick={handleDAKFeedback} className="menu-item">
                  <span className="menu-icon">📝</span>
                  Provide DAK Feedback
                </button>
              )}
              
              <button onClick={handleEmailSupport} className="menu-item">
                <span className="menu-icon">📧</span>
                Email Support
              </button>
            </div>
          )}
        </div>
        
        <div className="help-modal-content">
          {content}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
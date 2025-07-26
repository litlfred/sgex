import React, { useState } from 'react';
import './HelpModal.css';

const HelpModal = ({ topic, helpTopic, contextData, onClose }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleBugReport = () => {
    const topicTitle = helpTopic?.title || topic;
    const issueUrl = 'https://github.com/litlfred/sgex/issues/new';
    const title = encodeURIComponent(`Bug Report: ${topicTitle}`);
    const body = encodeURIComponent(`
**Issue Description:**
Please describe the issue you encountered.

**Context:**
- Help Topic: ${topicTitle}
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
    const topicTitle = helpTopic?.title || topic;
    const subject = encodeURIComponent(`SGEX Workbench Support: ${topicTitle}`);
    const body = encodeURIComponent(`
Hello SMART Guidelines Team,

I need assistance with the SGEX Workbench.

Topic: ${topicTitle}
Page: ${window.location.pathname}

Please describe your question or issue:


Best regards,
    `.trim());
    
    window.open(`mailto:smart@who.int?subject=${subject}&body=${body}`);
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNextSlide = () => {
    if (helpTopic?.content && currentSlide < helpTopic.content.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const renderSlideshow = () => {
    if (!helpTopic?.content || helpTopic.type !== 'slideshow') {
      return null;
    }

    const slides = helpTopic.content;
    const currentSlideData = slides[currentSlide];

    return (
      <div className="help-slideshow">
        <div className="slideshow-header">
          <h3>{currentSlideData.title}</h3>
          <div className="slide-counter">
            {currentSlide + 1} of {slides.length}
          </div>
        </div>
        
        <div 
          className="slideshow-content"
          dangerouslySetInnerHTML={{ __html: currentSlideData.content }}
        />
        
        <div className="slideshow-controls">
          <button 
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            className="slide-nav-btn"
          >
            ← Previous
          </button>
          
          <div className="slide-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`slide-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            onClick={handleNextSlide}
            disabled={currentSlide === slides.length - 1}
            className="slide-nav-btn"
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  const getHelpContent = () => {
    // If we have a specific help topic, use it
    if (helpTopic) {
      return {
        title: helpTopic.title,
        content: helpTopic.type === 'slideshow' ? renderSlideshow() : (
          <div className="help-content">
            <div className="mascot-message">
              <img src="/sgex/sgex-mascot.png" alt="SGEX Helper" className="help-mascot" />
              <div className="message-bubble">
                <div dangerouslySetInnerHTML={{ __html: helpTopic.content }} />
              </div>
            </div>
          </div>
        )
      };
    }

    // Legacy support for old topic strings
    switch (topic) {
      case 'github-token':
      case 'pat-help':
        return {
          title: 'GitHub Authentication Help',
          content: (
            <div className="help-content">
              <div className="mascot-message">
                <img src="/sgex/sgex-mascot.png" alt="SGEX Helper" className="help-mascot" />
                <div className="message-bubble">
                  <p>SGEX Workbench uses GitHub Personal Access Tokens for secure authentication!</p>
                  <p><strong>How it works:</strong></p>
                  <ul>
                    <li>Create a Personal Access Token in your GitHub settings</li>
                    <li>Enter the token in the login form</li>
                    <li>SGEX will securely connect to your GitHub repositories</li>
                    <li>No backend server required - works entirely in your browser!</li>
                  </ul>
                  <p>This approach ensures compliance with our no-backend requirement while keeping your data secure.</p>
                  <p>If you're having trouble, please use the menu above to get additional support.</p>
                </div>
              </div>
            </div>
          )
        };
      default:
        return {
          title: 'SGEX Workbench Help',
          content: (
            <div className="help-content">
              <div className="mascot-message">
                <img src="/sgex/sgex-mascot.png" alt="SGEX Helper" className="help-mascot" />
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
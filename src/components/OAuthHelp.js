import React, { useState, useEffect } from 'react';
import tokenManagerService from '../services/tokenManagerService';
import './OAuthHelp.css';

const OAuthHelp = ({ isOpen, onClose, componentId = null, operation = 'read', repoOwner = null, repoName = null }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authHelp, setAuthHelp] = useState(null);

  useEffect(() => {
    if (isOpen && componentId) {
      const help = tokenManagerService.generateAuthorizationHelp(componentId, operation);
      setAuthHelp(help);
      setCurrentSlide(0);
    }
  }, [isOpen, componentId, operation]);

  if (!isOpen || !authHelp) return null;

  const slides = [
    {
      id: 'welcome',
      title: '🎉 Welcome to OAuth Authorization!',
      content: (
        <div className="welcome-slide">
          <div className="mascot-section">
            <div className="mascot">🤖</div>
            <div className="speech-bubble">
              <p>Hi there! I'm your SGEX assistant, and I'm here to help you authorize access to your DAK repositories!</p>
            </div>
          </div>
          
          <div className="component-info">
            <h3>What you're accessing:</h3>
            <div className="component-card">
              <h4>{authHelp.component.name}</h4>
              <p>{authHelp.component.description}</p>
              <div className="operation-badge">
                {operation === 'write' ? '✏️ Write Access' : '👁️ Read Access'}
              </div>
            </div>
            
            {repoOwner && repoName && (
              <div className="repo-info">
                <strong>Repository:</strong> {repoOwner}/{repoName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'why-oauth',
      title: '🔐 Why OAuth is Better',
      content: (
        <div className="why-oauth-slide">
          <div className="mascot-section">
            <div className="mascot">🛡️</div>
            <div className="speech-bubble">
              <p>Let me explain why OAuth is much better than personal access tokens!</p>
            </div>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit">
              <div className="benefit-icon">🎯</div>
              <h4>Granular Permissions</h4>
              <p>Only request the specific permissions you need for each repository and component.</p>
            </div>
            
            <div className="benefit">
              <div className="benefit-icon">🔄</div>
              <h4>Easy to Revoke</h4>
              <p>Quickly revoke access through GitHub's settings without affecting other applications.</p>
            </div>
            
            <div className="benefit">
              <div className="benefit-icon">📱</div>
              <h4>Device-Based</h4>
              <p>Works securely on any device without needing to copy sensitive tokens.</p>
            </div>
            
            <div className="benefit">
              <div className="benefit-icon">👥</div>
              <h4>Audit Trail</h4>
              <p>GitHub tracks which app accesses what, making it easier to monitor usage.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'required-access',
      title: '📋 Required Access Level',
      content: (
        <div className="access-level-slide">
          <div className="mascot-section">
            <div className="mascot">🎓</div>
            <div className="speech-bubble">
              <p>Here's exactly what permissions we'll request and why we need them!</p>
            </div>
          </div>
          
          <div className="access-level-info">
            <div className="access-level-card">
              <div className="access-header">
                <span className="access-icon">{authHelp.accessLevel.icon}</span>
                <h3 style={{ color: authHelp.accessLevel.color }}>
                  {authHelp.accessLevel.name}
                </h3>
              </div>
              
              <p className="access-description">
                {authHelp.accessLevel.description}
              </p>
              
              <div className="capabilities">
                <h4>What this enables:</h4>
                <ul>
                  {authHelp.accessLevel.capabilities.map((capability, index) => (
                    <li key={index}>{capability}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="security-note">
            <div className="note-icon">🔒</div>
            <div>
              <strong>Security Note:</strong> We only request the minimum permissions needed. 
              You can revoke access at any time through GitHub's OAuth applications settings.
            </div>
          </div>
        </div>
      ),
    },
    ...authHelp.steps.map((step, index) => ({
      id: `step-${index}`,
      title: `${step.icon} Step ${index + 1}: ${step.title}`,
      content: (
        <div className="step-slide">
          <div className="mascot-section">
            <div className="mascot">{step.icon}</div>
            <div className="speech-bubble">
              <p>{step.description}</p>
            </div>
          </div>
          
          <div className="step-content">
            <div className="step-number">{index + 1}</div>
            <div className="step-details">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              
              {index === 0 && (
                <div className="step-action">
                  <p><strong>What to do:</strong> Look for the authorization button on the main screen and click it.</p>
                </div>
              )}
              
              {index === 1 && (
                <div className="step-action">
                  <p><strong>What to do:</strong> A new browser tab will open with GitHub's authorization page.</p>
                  <div className="example-url">
                    <strong>URL will look like:</strong><br/>
                    <code>https://github.com/login/device</code>
                  </div>
                </div>
              )}
              
              {index === 2 && (
                <div className="step-action">
                  <p><strong>What to do:</strong> Enter the 8-character code shown on the previous screen.</p>
                  <div className="code-example">
                    <strong>Code format:</strong> <code className="sample-code">A1B2-C3D4</code>
                  </div>
                </div>
              )}
              
              {index === 3 && (
                <div className="step-action">
                  <p><strong>What to do:</strong> Review the permissions and click "Authorize" on GitHub.</p>
                  <div className="permissions-note">
                    GitHub will show you exactly what access you're granting.
                  </div>
                </div>
              )}
              
              {index === 4 && (
                <div className="step-action">
                  <p><strong>What happens:</strong> You'll automatically return here and can start working!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    })),
    {
      id: 'troubleshooting',
      title: '🔧 Troubleshooting Tips',
      content: (
        <div className="troubleshooting-slide">
          <div className="mascot-section">
            <div className="mascot">🤔</div>
            <div className="speech-bubble">
              <p>Having trouble? Here are some common issues and solutions!</p>
            </div>
          </div>
          
          <div className="troubleshooting-list">
            <div className="troubleshooting-item">
              <h4>❌ "Authorization denied" error</h4>
              <p><strong>Solution:</strong> Click "Authorize" again and make sure to approve the permissions on GitHub.</p>
            </div>
            
            <div className="troubleshooting-item">
              <h4>⏰ "Authorization expired" error</h4>
              <p><strong>Solution:</strong> The code expired (after 15 minutes). Start the process again to get a new code.</p>
            </div>
            
            <div className="troubleshooting-item">
              <h4>🌐 GitHub page won't open</h4>
              <p><strong>Solution:</strong> Check if pop-ups are blocked. Allow pop-ups for this site or copy the URL manually.</p>
            </div>
            
            <div className="troubleshooting-item">
              <h4>🔑 Wrong permissions requested</h4>
              <p><strong>Solution:</strong> You can revoke and re-authorize with different permissions in Settings → OAuth Tokens.</p>
            </div>
          </div>
          
          <div className="help-contact">
            <h4>Still need help?</h4>
            <p>
              Check out the <a href="/sgex/docs/oauth-guide" target="_blank">OAuth Documentation</a> or 
              visit our <a href="https://github.com/litlfred/sgex/issues" target="_blank">GitHub Issues</a> page.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="oauth-help-overlay">
      <div className="oauth-help-modal">
        <div className="oauth-help-header">
          <h2>{currentSlideData.title}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="oauth-help-content">
          <div className="slideshow-container">
            <div className="slide-content">
              {currentSlideData.content}
            </div>
            
            <div className="slide-navigation">
              <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="nav-btn prev"
              >
                ← Previous
              </button>
              
              <div className="slide-indicators">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="nav-btn next"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
        
        <div className="oauth-help-footer">
          <div className="slide-counter">
            {currentSlide + 1} of {slides.length}
          </div>
          
          <div className="footer-actions">
            {currentSlide === slides.length - 1 ? (
              <button onClick={onClose} className="finish-btn">
                🎉 Got it, let's go!
              </button>
            ) : (
              <button onClick={() => goToSlide(slides.length - 1)} className="skip-btn">
                Skip to troubleshooting
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthHelp;
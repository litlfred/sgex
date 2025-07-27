import React, { useState } from 'react';
import './PATHelpSlideshow.css';

const PATHelpSlideshow = ({ repository = null, requiredAccess = 'read', onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const getSlides = () => {
    const repoContext = repository ? {
      owner: repository.owner,
      name: repository.name,
      fullName: `${repository.owner}/${repository.name}`,
      isOrg: repository.owner_type === 'Organization'
    } : null;

    const slides = [
      {
        title: "Welcome to PAT Setup",
        icon: "👋",
        content: (
          <div className="slide-content">
            <p>This guide will walk you through creating a GitHub Personal Access Token step by step.</p>
            {repoContext && (
              <div className="repo-context">
                <strong>Target Repository:</strong> {repoContext.fullName}<br/>
                <strong>Required Access:</strong> {requiredAccess === 'write' ? 'Write (Edit)' : 'Read (View)'}
              </div>
            )}
            <p>Personal Access Tokens are secure alternatives to passwords for accessing GitHub's API.</p>
          </div>
        )
      },
      {
        title: "Step 1: Open GitHub Settings",
        icon: "⚙️",
        content: (
          <div className="slide-content">
            <p>First, we need to navigate to GitHub's token settings page.</p>
            <div className="action-steps">
              <div className="step-item">
                <span className="step-number">1</span>
                <span>Click your profile picture in GitHub's top-right corner</span>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <span>Select "Settings" from the dropdown menu</span>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <span>Scroll down and click "Developer settings" in the left sidebar</span>
              </div>
            </div>
            <div className="quick-link">
              <strong>Quick Link:</strong> <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer">Fine-grained tokens</a> or <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">Classic tokens</a>
            </div>
          </div>
        )
      },
      {
        title: "Step 2: Choose Token Type",
        icon: "🔑",
        content: (
          <div className="slide-content">
            <p>GitHub offers two types of tokens. We recommend fine-grained tokens for better security.</p>
            <div className="token-options">
              <div className="token-option recommended">
                <h4>Fine-grained Tokens (Recommended)</h4>
                <ul>
                  <li>More secure with repository-specific permissions</li>
                  <li>Better access control</li>
                  <li>May require organization approval</li>
                </ul>
              </div>
              <div className="token-option">
                <h4>Classic Tokens</h4>
                <ul>
                  <li>Broader permissions</li>
                  <li>Works with all repositories</li>
                  <li>No organization approval needed</li>
                </ul>
              </div>
            </div>
            <p>Choose the type that works best for your organization's policies.</p>
          </div>
        )
      },
      {
        title: "Step 3: Configure Token",
        icon: "📝",
        content: (
          <div className="slide-content">
            <p>Now let's configure your token with the right settings.</p>
            <div className="config-section">
              <h4>Basic Information</h4>
              <div className="config-item">
                <strong>Token name:</strong> SGEX Workbench{repoContext ? ` - ${repoContext.fullName}` : ''}
              </div>
              <div className="config-item">
                <strong>Expiration:</strong> 90 days (recommended)
              </div>
              {repoContext && (
                <div className="config-item">
                  <strong>Repository access:</strong> Select only "{repoContext.fullName}"
                </div>
              )}
            </div>
            {repoContext?.isOrg && (
              <div className="org-notice">
                <strong>Organization Repository:</strong> You may need approval from {repoContext.owner} administrators for fine-grained tokens.
              </div>
            )}
          </div>
        )
      },
      {
        title: "Step 4: Set Permissions",
        icon: "🛡️",
        content: (
          <div className="slide-content">
            <p>Select the minimum permissions needed for your use case.</p>
            <div className="permissions-section">
              <h4>For Fine-grained Tokens:</h4>
              <div className="permission-list">
                <div className="permission-item">
                  <span className="permission-name">Contents</span>
                  <span className="permission-level">{requiredAccess === 'write' ? 'Read and Write' : 'Read'}</span>
                </div>
                <div className="permission-item">
                  <span className="permission-name">Metadata</span>
                  <span className="permission-level">Read</span>
                </div>
                {requiredAccess === 'write' && (
                  <div className="permission-item">
                    <span className="permission-name">Pull requests</span>
                    <span className="permission-level">Read and Write</span>
                  </div>
                )}
              </div>
              <h4>For Classic Tokens:</h4>
              <div className="permission-list">
                <div className="permission-item">
                  <span className="permission-name">{requiredAccess === 'write' ? 'repo' : 'public_repo'}</span>
                  <span className="permission-level">✓ Selected</span>
                </div>
                <div className="permission-item">
                  <span className="permission-name">read:org</span>
                  <span className="permission-level">✓ Selected</span>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Step 5: Generate & Copy",
        icon: "📋",
        content: (
          <div className="slide-content">
            <p>Almost done! Now generate and securely copy your token.</p>
            <div className="action-steps">
              <div className="step-item">
                <span className="step-number">1</span>
                <span>Click "Generate token" at the bottom of the page</span>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <span>Copy the token immediately (you won't see it again!)</span>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <span>Paste it into SGEX Workbench</span>
              </div>
            </div>
            <div className="security-warning">
              <strong>🔒 Security Reminder:</strong>
              <p>Treat your token like a password. Never share it or commit it to repositories. Store it securely!</p>
            </div>
          </div>
        )
      },
      {
        title: "All Set! 🎉",
        icon: "✅",
        content: (
          <div className="slide-content">
            <p>Congratulations! You've successfully created your GitHub Personal Access Token.</p>
            <div className="next-steps">
              <h4>What's Next?</h4>
              <ul>
                <li>Paste your token in the SGEX Workbench login form</li>
                <li>Start editing your DAK repositories</li>
                <li>Add more tokens for other repositories as needed</li>
              </ul>
            </div>
            <div className="help-section">
              <h4>Need Help?</h4>
              <p>If you encounter any issues:</p>
              <ul>
                <li>Check our <a href="/sgex/docs/overview" target="_blank" rel="noopener noreferrer">documentation</a></li>
                <li>Verify your token has the correct permissions</li>
                <li>For organization repos, confirm admin approval if needed</li>
              </ul>
            </div>
          </div>
        )
      }
    ];

    return slides;
  };

  const slides = getSlides();

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="slideshow-overlay" onClick={onClose}>
      <div className="slideshow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="slideshow-header">
          <h2>🎓 PAT Creation Guide</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="slideshow-content">
          <div className="slide">
            <div className="slide-header">
              <div className="slide-icon">{slides[currentSlide].icon}</div>
              <h3>{slides[currentSlide].title}</h3>
            </div>
            {slides[currentSlide].content}
          </div>
        </div>

        <div className="slideshow-controls">
          <div className="slide-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="navigation-controls">
            <button 
              className="nav-btn prev" 
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              ← Previous
            </button>
            
            <span className="slide-counter">
              {currentSlide + 1} of {slides.length}
            </span>
            
            <button 
              className="nav-btn next" 
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
            >
              {currentSlide === slides.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PATHelpSlideshow;
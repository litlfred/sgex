import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useThemeImage from '../hooks/useThemeImage';
import IssueCreationModal from './IssueCreationModal';
import githubService from '../services/githubService';
import BugReportForm from './BugReportForm';
import EnhancedTutorialModal from './EnhancedTutorialModal';
import tutorialService from '../services/tutorialService';
import { ALT_TEXT_KEYS, getAltText } from '../utils/imageAltTextHelper';
import './HelpModal.css';

const HelpModal = ({ topic, helpTopic, contextData, onClose, tutorialId }) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showIssueCreationModal, setShowIssueCreationModal] = useState(false);
  const [issueCreationType, setIssueCreationType] = useState('bug');
  const [issueRepository, setIssueRepository] = useState(null);
  const [showBugReportForm, setShowBugReportForm] = useState(false);
  const [showEnhancedTutorial, setShowEnhancedTutorial] = useState(false);
  const [currentTutorialId, setCurrentTutorialId] = useState(tutorialId);

  // Check if we should show enhanced tutorial modal
  useEffect(() => {
    if (tutorialId) {
      const tutorial = tutorialService.getTutorial(tutorialId);
      if (tutorial) {
        setCurrentTutorialId(tutorialId);
        setShowEnhancedTutorial(true);
        return;
      }
    }
    
    // Try to convert legacy help topic to enhanced tutorial
    if (helpTopic && helpTopic.type === 'slideshow' && helpTopic.id) {
      const convertedTutorial = tutorialService.convertHelpTopicToTutorial(helpTopic);
      if (convertedTutorial) {
        // Register as temporary tutorial
        tutorialService.registerTutorial(`legacy-${helpTopic.id}`, convertedTutorial);
        setCurrentTutorialId(`legacy-${helpTopic.id}`);
        setShowEnhancedTutorial(true);
        return;
      }
    }
  }, [tutorialId, helpTopic]);

  // Theme-aware mascot image
  const mascotImage = useThemeImage('sgex-mascot.png');

  // Set up global reference for inline onclick handlers
  useEffect(() => {
    // Helper function to generate GitHub issue URL for non-authenticated users
    const generateGitHubUrl = (issueType, repository = null) => {
      const repoInfo = repository ? 
        { owner: repository.owner?.login || repository.owner, repo: repository.name } :
        { owner: 'litlfred', repo: 'sgex' };
      
      const params = new URLSearchParams();
      
      // Set template based on issue type
      if (issueType === 'bug') {
        params.set('template', 'bug_report.yml');
        params.set('labels', 'bug+reports');
      } else if (issueType === 'feature') {
        params.set('template', 'feature_request.yml');
        params.set('labels', 'feature+request');
      } else if (issueType === 'content' || issueType === 'dak-content') {
        params.set('template', 'dak_content_error.yml');
        params.set('labels', 'authoring');
      }
      
      // Add context
      params.set('sgex_current_url', window.location.href);
      
      return `https://github.com/${repoInfo.owner}/${repoInfo.repo}/issues/new?${params.toString()}`;
    };

    window.helpModalInstance = {
      openSgexIssue: (issueType) => {
        // Check if user is authenticated
        if (!githubService.isAuth()) {
          // Open GitHub directly for non-authenticated users
          const githubUrl = generateGitHubUrl(issueType);
          window.open(githubUrl, '_blank');
          return;
        }

        // Always use the issue creation modal for authenticated users
        // The modal will handle PAT permission errors during submission
        setIssueCreationType(issueType);
        setIssueRepository(null); // Use default SGEX repo
        setShowIssueCreationModal(true);
      },

      openDakIssue: (issueType) => {
        const repository = contextData.repository || contextData.selectedDak;
        if (!repository) {
          console.warn('No DAK repository specified for feedback');
          return;
        }

        // Check if user is authenticated
        if (!githubService.isAuth()) {
          // Open GitHub directly for non-authenticated users
          const githubUrl = generateGitHubUrl(issueType === 'content' ? 'dak-content' : issueType, repository);
          window.open(githubUrl, '_blank');
          return;
        }

        // Always use the issue creation modal for authenticated users
        // The modal will handle PAT permission errors during submission
        setIssueCreationType(issueType === 'content' ? 'dak-content' : issueType);
        setIssueRepository(repository);
        setShowIssueCreationModal(true);
      },

      // Function to show fallback instructions when GitHub access is blocked
      showFallbackInstructions: (reason, url, issueType) => {
        const instructions = {
          'github-blocked': {
            title: 'GitHub Access Required',
            message: `
              <div class="help-fallback-notice">
                <h4>🔗 GitHub Link Blocked</h4>
                <p>It looks like GitHub access is restricted in your current environment.</p>
                <h5>To report this issue:</h5>
                <ol>
                  <li>Copy the link below</li>
                  <li>Open it in a browser with GitHub access</li>
                  <li>Fill out the issue template</li>
                </ol>
                <div class="fallback-url">
                  <strong>Link to copy:</strong><br>
                  <textarea readonly onclick="this.select()" style="width: 100%; height: 60px; margin: 5px 0; padding: 5px; font-family: monospace; font-size: 12px;">${url}</textarea>
                </div>
                <p><em>💡 Tip: You can also email us at <a href="mailto:smart@who.int">smart@who.int</a> with your issue details.</em></p>
              </div>
            `
          }
        };

        const fallback = instructions[reason] || {
          title: 'External Link Issue',
          message: `<p>Unable to open external link. Please copy and visit: <br><code>${url}</code></p>`
        };

        // Create a temporary modal-like alert for fallback instructions
        const existingFallback = document.querySelector('.help-fallback-overlay');
        if (existingFallback) {
          existingFallback.remove();
        }

        const fallbackOverlay = document.createElement('div');
        fallbackOverlay.className = 'help-fallback-overlay';
        fallbackOverlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const fallbackModal = document.createElement('div');
        fallbackModal.style.cssText = `
          background: var(--who-card-bg, white);
          border-radius: 8px;
          padding: 20px;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        `;

        fallbackModal.innerHTML = `
          <button onclick="this.closest('.help-fallback-overlay').remove()" style="
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--who-text-secondary, #666);
          ">×</button>
          <h3 style="margin-top: 0; color: var(--who-text-primary, #333);">${fallback.title}</h3>
          <div style="color: var(--who-text-primary, #555); line-height: 1.5;">${fallback.message}</div>
        `;

        fallbackOverlay.appendChild(fallbackModal);
        document.body.appendChild(fallbackOverlay);

        // Click outside to close
        fallbackOverlay.addEventListener('click', (e) => {
          if (e.target === fallbackOverlay) {
            fallbackOverlay.remove();
          }
        });

        // Auto-remove after 30 seconds
        setTimeout(() => {
          if (document.body.contains(fallbackOverlay)) {
            fallbackOverlay.remove();
          }
        }, 30000);
      }
    };

    return () => {
      // Cleanup
      delete window.helpModalInstance;
    };
  }, [contextData]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  // Helper function to generate GitHub issue URL for non-authenticated users
  const generateGitHubUrl = (issueType, repository = null) => {
    const repoInfo = repository ? 
      { owner: repository.owner?.login || repository.owner, repo: repository.name } :
      { owner: 'litlfred', repo: 'sgex' };
    
    const params = new URLSearchParams();
    
    // Set template based on issue type
    if (issueType === 'bug') {
      params.set('template', 'bug_report.yml');
      params.set('labels', 'bug+reports');
    } else if (issueType === 'feature') {
      params.set('template', 'feature_request.yml');
      params.set('labels', 'feature+request');
    } else if (issueType === 'content' || issueType === 'dak-content') {
      params.set('template', 'dak_content_error.yml');
      params.set('labels', 'authoring');
    }
    
    // Add context
    params.set('sgex_current_url', window.location.href);
    
    return `https://github.com/${repoInfo.owner}/${repoInfo.repo}/issues/new?${params.toString()}`;
  };

  const handleBugReport = () => {
    // Check if user is authenticated
    if (!githubService.isAuth()) {
      // Open GitHub directly for non-authenticated users
      const githubUrl = generateGitHubUrl('bug');
      window.open(githubUrl, '_blank');
      return;
    }

    // Use the issue creation modal for authenticated users
    if (window.helpModalInstance?.openSgexIssue) {
      window.helpModalInstance.openSgexIssue('bug');
    } else {
      setIssueCreationType('bug');
      setIssueRepository(null);
      setShowIssueCreationModal(true);
    }
  };

  const handleDAKFeedback = () => {
    const repository = contextData.repository || contextData.selectedDak;
    if (!repository) {
      console.warn('No DAK repository specified for feedback');
      return;
    }

    // Check if user is authenticated
    if (!githubService.isAuth()) {
      // Open GitHub directly for non-authenticated users
      const githubUrl = generateGitHubUrl('content', repository);
      window.open(githubUrl, '_blank');
      return;
    }

    // Use the issue creation modal for authenticated users
    if (window.helpModalInstance?.openDakIssue) {
      window.helpModalInstance.openDakIssue('content');
    } else {
      setIssueCreationType('dak-content');
      setIssueRepository(repository);
      setShowIssueCreationModal(true);
    }
  };

  const handleFeatureRequest = () => {
    // Check if user is authenticated
    if (!githubService.isAuth()) {
      // Open GitHub directly for non-authenticated users
      const githubUrl = generateGitHubUrl('feature');
      window.open(githubUrl, '_blank');
      return;
    }

    // Use the issue creation modal for authenticated users
    if (window.helpModalInstance?.openSgexIssue) {
      window.helpModalInstance.openSgexIssue('feature');
    } else {
      setIssueCreationType('feature');
      setIssueRepository(null);
      setShowIssueCreationModal(true);
    }
  };

  const handleIssueCreationSuccess = (issue) => {
    console.log('Issue created successfully:', issue);
    // Show success message or redirect to the created issue
    alert(`Issue #${issue.number} created successfully: ${issue.title}`);
  };

  const handleIssueCreationError = (error) => {
    console.error('Failed to create issue:', error);
    // Error is already shown in the modal
  };

  // Render bug report content with proper React event handlers
  const renderBugReportContent = (htmlContent) => {
    // Check if this is SGeX bug report or DAK feedback
    const isDakFeedback = htmlContent.includes('window.helpModalInstance?.openDakIssue');
    
    if (isDakFeedback) {
      return (
        <div>
          <p>Share feedback about this Digital Adaptation Kit (DAK):</p>
          <h4>What type of feedback do you have?</h4>
          <div className="bug-report-options">
            <button className="bug-type-btn" onClick={() => handleDAKIssueClick('content')}>
              📝 DAK Content Feedback - Provide feedback on clinical content or logic
            </button>
            <button className="bug-type-btn" onClick={() => handleDAKIssueClick('bug')}>
              🐛 DAK Bug - Report issue with this specific DAK content
            </button>
            <button className="bug-type-btn" onClick={() => handleDAKIssueClick('feature')}>
              📈 DAK Improvement - Suggest enhancements to this DAK
            </button>
            <button className="bug-type-btn" onClick={() => handleDAKIssueClick('question')}>
              ❓ DAK Question - Ask about this DAK's implementation
            </button>
            <button className="bug-type-btn" onClick={() => handleDAKIssueClick('blank')}>
              📝 Blank DAK Issue - Create an issue without a template
            </button>
          </div>
          <div className="help-tip">
            <strong>💡 Note:</strong> This will open an issue in the selected DAK repository for targeted feedback.
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <p>Help us improve SGeX by reporting bugs and issues:</p>
          <h4>What type of issue are you experiencing?</h4>
          <div className="bug-report-options">
            <button className="bug-type-btn" onClick={() => handleSgexIssueClick('bug')}>
              🐛 Bug Report - Something isn't working correctly
            </button>
            <button className="bug-type-btn" onClick={() => handleSgexIssueClick('feature')}>
              ✨ Feature Request - Suggest a new feature or improvement
            </button>
            <button className="bug-type-btn" onClick={() => handleSgexIssueClick('question')}>
              ❓ Question - Ask for help or clarification
            </button>
            <button className="bug-type-btn" onClick={() => handleSgexIssueClick('documentation')}>
              📚 Documentation Issue - Report problems with documentation
            </button>
            <button className="bug-type-btn" onClick={() => handleSgexIssueClick('blank')}>
              📝 Blank Issue - Create an issue without a template
            </button>
          </div>
          <div className="help-tip">
            <strong>💡 Tip:</strong> Please provide as much detail as possible including steps to reproduce, expected behavior, and actual behavior.
          </div>
          <div className="help-fallback">
            <strong>🔗 Can't access GitHub?</strong> If the buttons above don't work in your environment:
            <ol>
              <li>Email us directly at <a href="mailto:smart@who.int?subject=SGEX Bug Report">smart@who.int</a></li>
              <li>Or visit <a href="https://github.com/litlfred/sgex/issues/new" target="_blank">github.com/litlfred/sgex/issues/new</a> manually</li>
            </ol>
          </div>
        </div>
      );
    }
  };

  // Handle SGeX issue button clicks
  const handleSgexIssueClick = (issueType) => {
    // Check if user is authenticated
    if (!githubService.isAuth()) {
      // Open GitHub directly for non-authenticated users
      const githubUrl = generateGitHubUrl(issueType);
      window.open(githubUrl, '_blank');
      return;
    }

    // Always use the issue creation modal for authenticated users
    setIssueCreationType(issueType);
    setIssueRepository(null); // Use default SGEX repo
    setShowIssueCreationModal(true);
  };

  // Handle DAK issue button clicks
  const handleDAKIssueClick = (issueType) => {
    const repository = contextData.repository || contextData.selectedDak;
    if (!repository) {
      console.warn('No DAK repository specified for feedback');
      return;
    }

    // Check if user is authenticated
    if (!githubService.isAuth()) {
      // Open GitHub directly for non-authenticated users
      const githubUrl = generateGitHubUrl(issueType === 'content' ? 'dak-content' : issueType, repository);
      window.open(githubUrl, '_blank');
      return;
    }

    // Always use the issue creation modal for authenticated users
    setIssueCreationType(issueType === 'content' ? 'dak-content' : issueType);
    setIssueRepository(repository);
    setShowIssueCreationModal(true);
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

  const handleDocumentation = () => {
    window.open('/sgex/docs/overview', '_blank');
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

    // Replace inline onclick handlers with React event handlers
    let processedContent = currentSlideData.content;
    
    // Check if this is the bug report slide with the issue type buttons
    const isBugReportSlide = processedContent.includes('window.helpModalInstance?.openSgexIssue') || 
                            processedContent.includes('window.helpModalInstance?.openDakIssue');

    return (
      <div className="help-slideshow">
        <div className="slideshow-header">
          <h3>{currentSlideData.title}</h3>
          <div className="slide-counter">
            {currentSlide + 1} of {slides.length}
          </div>
        </div>
        
        <div className="slideshow-content">
          {isBugReportSlide ? renderBugReportContent(processedContent) : (
            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
          )}
        </div>
        
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
              <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Helper')} className="help-mascot" />
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
                <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Helper')} className="help-mascot" />
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
                <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Helper')} className="help-mascot" />
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

  // Show enhanced tutorial modal if applicable
  if (showEnhancedTutorial && currentTutorialId) {
    return (
      <EnhancedTutorialModal
        tutorialId={currentTutorialId}
        onClose={() => {
          setShowEnhancedTutorial(false);
          setCurrentTutorialId(null);
          onClose();
        }}
        contextData={contextData}
      />
    );
  }

  // Show bug report form if requested
  if (showBugReportForm) {
    return (
      <div className="help-modal-overlay bug-report-overlay" onClick={handleOverlayClick}>
        <BugReportForm 
          onClose={() => {
            setShowBugReportForm(false);
            // Close the main modal after successful submission or cancel
            onClose();
          }}
          contextData={contextData}
        />
      </div>
    );
  }
  return (
    <>
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
                <button onClick={handleDocumentation} className="menu-item">
                  <span className="menu-icon">📖</span>
                  Documentation
                </button>
                
                <button onClick={handleBugReport} className="menu-item">
                  <img src="/sgex/bug-report-icon.svg" alt={getAltText(t, ALT_TEXT_KEYS.ICON_BUG_REPORT, 'Bug Report')} className="menu-icon" />
                  File Bug Report
                </button>
                
                <button onClick={handleFeatureRequest} className="menu-item">
                  <span className="menu-icon">💡</span>
                  Feature Request
                </button>
                
                {(contextData.repository || contextData.selectedDak) && (
                  <button onClick={handleDAKFeedback} className="menu-item">
                    <span className="menu-icon">📝</span>
                    DAK Content Feedback
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

      {/* Issue Creation Modal */}
      <IssueCreationModal
        isOpen={showIssueCreationModal}
        onClose={() => setShowIssueCreationModal(false)}
        issueType={issueCreationType}
        repository={issueRepository}
        contextData={contextData}
        onSuccess={handleIssueCreationSuccess}
        onError={handleIssueCreationError}
      />
    </>
  );
};

export default HelpModal;
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useThemeImage from '../hooks/useThemeImage';
import BugReportForm from './BugReportForm';
import EnhancedTutorialModal from './EnhancedTutorialModal';
import tutorialService from '../services/tutorialService';
import { ALT_TEXT_KEYS, getAltText } from '../utils/imageAltTextHelper';


const HelpModal = ({ topic, helpTopic, contextData, onClose, tutorialId }) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
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
    const createContextualUrl = (baseUrl, params) => {
      const urlParams = new URLSearchParams(params);
      
      // Add contextual information
      if (contextData.pageId) {
        urlParams.set('sgex_page', contextData.pageId);
      }
      
      const currentUrl = window.location.href;
      urlParams.set('sgex_current_url', currentUrl);
      
      if (contextData.selectedDak?.name) {
        urlParams.set('sgex_selected_dak', contextData.selectedDak.name);
      }
      
      return `${baseUrl}?${urlParams.toString()}`;
    };

    window.helpModalInstance = {
      openSgexIssue: (issueType) => {
        // For bug reports, show the new integrated form
        if (issueType === 'bug') {
          setShowBugReportForm(true);
          return;
        }
        
        // For other issue types, continue with existing behavior
        const baseUrl = `https://github.com/litlfred/sgex/issues/new`;
        let params = {};

        switch (issueType) {
          case 'feature':
            params.template = 'feature_request.yml';
            params.labels = 'enhancement';
            break;
          case 'question':
            params.template = 'question.yml';
            params.labels = 'question';
            break;
          case 'documentation':
            params.template = 'documentation.yml';
            params.labels = 'documentation';
            break;
          case 'blank':
            // No template specified - this will allow users to create a blank issue
            params.labels = 'blank-issue';
            break;
          default:
            params.labels = 'needs-triage';
        }

        const url = createContextualUrl(baseUrl, params);
        
        // Try to open the GitHub issue, but handle cases where external links are blocked
        try {
          const newWindow = window.open(url, '_blank');
          
          // Check if the window was blocked or failed to open
          if (!newWindow || newWindow.closed) {
            // Fallback: show instructions to manually open the link
            window.helpModalInstance?.showFallbackInstructions?.('github-blocked', url, issueType);
          } else {
            // Check if the window actually loaded after a brief delay
            setTimeout(() => {
              try {
                if (newWindow.closed || !newWindow.location || newWindow.location.href === 'about:blank') {
                  newWindow.close();
                  window.helpModalInstance?.showFallbackInstructions?.('github-blocked', url, issueType);
                }
              } catch (e) {
                // Cross-origin restriction means it probably loaded successfully
                // or the check failed due to security - either way, don't show fallback
              }
            }, 1000);
          }
        } catch (error) {
          console.warn('Failed to open GitHub issue:', error);
          window.helpModalInstance?.showFallbackInstructions?.('github-blocked', url, issueType);
        }
      },

      openDakIssue: (issueType) => {
        const repository = contextData.repository || contextData.selectedDak;
        if (!repository) {
          console.warn('No DAK repository specified for feedback');
          return;
        }

        const baseUrl = `https://github.com/${repository.owner}/${repository.name}/issues/new`;
        let params = {};

        switch (issueType) {
          case 'bug':
            params.template = 'dak_bug_report.yml';
            params.labels = 'bug,dak-issue';
            break;
          case 'improvement':
            params.template = 'dak_feature_request.yml';
            params.labels = 'enhancement,dak-improvement';
            break;
          case 'content':
            params.template = 'dak_content_error.yml';
            params.labels = 'content-issue,clinical-content';
            break;
          case 'question':
            params.template = 'dak_question.yml';
            params.labels = 'question,dak-question';
            break;
          case 'blank':
            // No template specified - this will allow users to create a blank issue
            params.labels = 'blank-issue,dak-feedback';
            break;
          default:
            params.labels = 'dak-feedback';
        }

        // Add DAK-specific context
        if (repository.name) {
          params.sgex_dak_repository = `${repository.owner}/${repository.name}`;
        }

        const url = createContextualUrl(baseUrl, params);
        
        // Try to open the GitHub issue, but handle cases where external links are blocked
        try {
          const newWindow = window.open(url, '_blank');
          
          // Check if the window was blocked or failed to open
          if (!newWindow || newWindow.closed) {
            // Fallback: show instructions to manually open the link
            window.helpModalInstance?.showFallbackInstructions?.('github-blocked', url, `dak-${issueType}`);
          } else {
            // Check if the window actually loaded after a brief delay
            setTimeout(() => {
              try {
                if (newWindow.closed || !newWindow.location || newWindow.location.href === 'about:blank') {
                  newWindow.close();
                  window.helpModalInstance?.showFallbackInstructions?.('github-blocked', url, `dak-${issueType}`);
                }
              } catch (e) {
                // Cross-origin restriction means it probably loaded successfully
                // or the check failed due to security - either way, don't show fallback
              }
            }, 1000);
          }
        } catch (error) {
          console.warn('Failed to open DAK issue:', error);
          window.helpModalInstance?.showFallbackInstructions?.('github-blocked', url, `dak-${issueType}`);
        }
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

  const handleBugReport = () => {
    // Show the new integrated bug report form
    setShowBugReportForm(true);
  };

  const handleDAKFeedback = () => {
    if (contextData.repository) {
      // Default to opening content error as the primary DAK feedback type
      if (window.helpModalInstance?.openDakIssue) {
        window.helpModalInstance.openDakIssue('content');
      }
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

  const handleGitHubSource = () => {
    // Open the SGEX GitHub repository
    window.open('https://github.com/litlfred/sgex', '_blank');
  };

  const handleDocumentation = () => {
    // Use the standard /docs path that matches the route configuration
    // The docs component is configured as a DAK component at /docs
    window.open('/docs/overview', '_blank');
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

    // Handle DAK feedback buttons by replacing onclick handlers
    let processedContent = currentSlideData.content;
    if (helpTopic.id === 'provide-dak-feedback') {
      processedContent = processedContent.replace(
        /onclick="this\.openDakIssue\('([^']+)'\)"/g,
        `onclick="window.helpModalInstance?.openDakIssue('$1')"`
      );
    }

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
          dangerouslySetInnerHTML={{ __html: processedContent }}
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
          
          {showMenu && (() => {
            // Calculate the number of menu items
            const menuItems = [
              'Documentation',
              'File Bug Report',
              ...(contextData.repository ? ['Provide DAK Feedback'] : []),
              'GitHub Source',
              'Email Support'
            ];
            
            // Determine multi-column class based on number of items
            let columnClass = '';
            if (menuItems.length >= 9) {
              columnClass = 'multi-column-3';
            } else if (menuItems.length >= 5) {
              columnClass = 'multi-column-2';
            }
            
            return (
              <div className={`help-menu-dropdown ${columnClass}`}>
                <button onClick={handleDocumentation} className="menu-item">
                  <span className="menu-icon">📖</span>
                  Documentation
                </button>
                
                <button onClick={handleBugReport} className="menu-item">
                  <img src="/sgex/bug-report-icon.svg" alt={getAltText(t, ALT_TEXT_KEYS.ICON_BUG_REPORT, 'Bug Report')} className="menu-icon" />
                  File Bug Report
                </button>
                
                {contextData.repository && (
                  <button onClick={handleDAKFeedback} className="menu-item">
                    <span className="menu-icon">📝</span>
                    Provide DAK Feedback
                  </button>
                )}
                
                <button onClick={handleGitHubSource} className="menu-item">
                  <span className="menu-icon">🐙</span>
                  GitHub Source
                </button>
                
                <button onClick={handleEmailSupport} className="menu-item">
                  <span className="menu-icon">📧</span>
                  Email Support
                </button>
              </div>
            );
          })()}
        </div>
        
        <div className="help-modal-content">
          {content}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
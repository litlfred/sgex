import React, { useState } from 'react';
import { usePage } from './PageProvider';
import ContextualHelpMascot from '../ContextualHelpMascot';
import useThemeImage from '../../hooks/useThemeImage';
import './ErrorHandler.css';

/**
 * Error handler component with automatic bug reporting functionality
 */
const ErrorHandler = ({ error, onRetry }) => {
  const pageContext = usePage();
  const pageName = pageContext.pageName;
  const [bugReportSent, setBugReportSent] = useState(false);

  // Theme-aware mascot image
  const mascotImage = useThemeImage('sgex-mascot.png');
  const [userExplanation, setUserExplanation] = useState('');

  const generateBugReportUrl = () => {
    const title = encodeURIComponent('User should not have reached this page');
    const body = encodeURIComponent(`
**Error Information:**
- Page: ${pageName}
- URL: ${window.location.href}
- Error: ${error}
- Timestamp: ${new Date().toISOString()}
- User Agent: ${navigator.userAgent}

**Context:**
- Browser: ${navigator.userAgent}
- Viewport: ${window.innerWidth}x${window.innerHeight}
- Referrer: ${document.referrer || 'Direct access'}

**User Explanation:**
${userExplanation || 'No additional details provided'}

**Steps to Reproduce:**
1. Navigate to: ${window.location.href}
2. [Please add any additional steps]

**Expected Behavior:**
The page should load without errors.

**Actual Behavior:**
${error}
    `);

    return `https://github.com/litlfred/sgex/issues/new?title=${title}&body=${body}&labels=bug,user-error`;
  };

  const handleSendBugReport = () => {
    const bugReportUrl = generateBugReportUrl();
    window.open(bugReportUrl, '_blank');
    setBugReportSent(true);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/sgex/';
  };

  // Enhanced error message generation for DAK-specific errors
  const getErrorDisplayInfo = () => {
    const lowercaseError = error.toLowerCase();
    
    // Extract user/repo from URL or page context
    const user = pageContext?.user;
    const repo = pageContext?.repository?.name;
    const urlPath = window.location.pathname;
    
    if (lowercaseError.includes('not found') || lowercaseError.includes('not accessible')) {
      if (lowercaseError.includes('user')) {
        return {
          title: 'User Not Found',
          message: `The user ${user ? `'${user}'` : 'in the URL'} could not be found on GitHub.`,
          suggestions: [
            'Check the spelling of the username',
            'Verify the user account exists on GitHub',
            'Try searching for the user on GitHub.com'
          ],
          icon: '👤'
        };
      } else if (lowercaseError.includes('repository')) {
        return {
          title: 'Repository Not Found',
          message: `The repository ${user && repo ? `'${user}/${repo}'` : 'in the URL'} could not be accessed.`,
          suggestions: [
            'Check the spelling of the repository name',
            'Verify the repository exists and is public',
            'If it\'s a private repository, make sure you have access',
            'Try visiting the repository directly on GitHub.com'
          ],
          icon: '📁'
        };
      }
    }
    
    if (lowercaseError.includes('not a valid dak') || lowercaseError.includes('invalid dak')) {
      return {
        title: 'Not a DAK Repository',
        message: `The repository ${user && repo ? `'${user}/${repo}'` : 'in the URL'} doesn't appear to contain WHO SMART Guidelines content.`,
        suggestions: [
          'Verify this is a WHO SMART Guidelines Digital Adaptation Kit',
          'Check if the repository has a sushi-config.yaml file',
          'Look for smart.who.int.base dependencies in the configuration',
          'Try browsing other DAK repositories for examples'
        ],
        icon: '📋'
      };
    }
    
    if (lowercaseError.includes('asset') && lowercaseError.includes('not found')) {
      return {
        title: 'File Not Found',
        message: `The requested file could not be found in the repository.`,
        suggestions: [
          'Check if the file path is correct',
          'Verify the file exists in the current branch',
          'The file may have been moved or deleted',
          'Try browsing the repository to find the correct path'
        ],
        icon: '📄'
      };
    }
    
    // Default error info
    return {
      title: 'Something Went Wrong',
      message: error,
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'The service may be temporarily unavailable'
      ],
      icon: '⚠️'
    };
  };

  const errorInfo = getErrorDisplayInfo();

  return (
    <div className="error-handler">
      <div className="error-content">
        <div className="error-mascot-container">
          <ContextualHelpMascot
            helpContent={
              <div className="error-help-content">
                <div className="error-mascot-large">
                  <img 
                    src={mascotImage} 
                    alt="SGEX Helper" 
                    className="large-mascot-icon"
                  />
                  <div className="mascot-speech-bubble">
                    <div className="speech-content">
                      I'm sorry! Something went wrong.
                    </div>
                    <div className="speech-tail"></div>
                  </div>
                </div>
              </div>
            }
            position="center"
          />
        </div>
        
        <div className="error-details">
          <h2>{errorInfo.icon} {errorInfo.title}</h2>
          <p className="error-message">{errorInfo.message}</p>
          
          {errorInfo.suggestions && (
            <div className="error-suggestions">
              <h3>💡 Suggestions:</h3>
              <ul>
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="error-actions">
            <button className="error-btn primary" onClick={handleRetry}>
              🔄 Try Again
            </button>
            <button className="error-btn secondary" onClick={handleGoHome}>
              🏠 Go Home
            </button>
          </div>
          
          <div className="bug-report-section">
            <h3>Help us improve SGEX</h3>
            <p>If this error persists, please let us know what happened:</p>
            
            <div className="user-explanation">
              <label htmlFor="user-explanation">
                What were you trying to do when this error occurred?
              </label>
              <textarea
                id="user-explanation"
                value={userExplanation}
                onChange={(e) => setUserExplanation(e.target.value)}
                placeholder="Please describe what you were doing when the error occurred..."
                rows={4}
              />
            </div>
            
            {!bugReportSent ? (
              <button className="bug-report-btn" onClick={handleSendBugReport}>
                📧 Send Bug Report
              </button>
            ) : (
              <div className="bug-report-sent">
                <span className="success-icon">✅</span>
                Thank you! A bug report has been opened. We'll investigate this issue.
              </div>
            )}
          </div>
          
          <div className="error-context">
            <details>
              <summary>Technical Details</summary>
              <div className="technical-details">
                <p><strong>Page:</strong> {pageName}</p>
                <p><strong>URL:</strong> {window.location.href}</p>
                <p><strong>Error:</strong> {error}</p>
                <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandler;
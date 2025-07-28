import React, { useState } from 'react';
import { usePage } from './PageProvider';
import ContextualHelpMascot from '../ContextualHelpMascot';
import './ErrorHandler.css';

/**
 * Error handler component with automatic bug reporting functionality
 */
const ErrorHandler = ({ error, onRetry }) => {
  const { pageName, location } = usePage();
  const [bugReportSent, setBugReportSent] = useState(false);
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

  return (
    <div className="error-handler">
      <div className="error-content">
        <div className="error-mascot-container">
          <ContextualHelpMascot
            helpContent={
              <div className="error-help-content">
                <div className="error-mascot-large">
                  <img 
                    src="/sgex/sgex-mascot.png" 
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
          <h2>Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          
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
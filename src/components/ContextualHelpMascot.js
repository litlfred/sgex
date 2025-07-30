import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import helpContentService from '../services/helpContentService';
import HelpModal from './HelpModal';
import './ContextualHelpMascot.css';

const ContextualHelpMascot = ({ pageId, helpContent, position = 'bottom-right', contextData = {}, notificationBadge = false }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [helpSticky, setHelpSticky] = useState(false);
  const [selectedHelpTopic, setSelectedHelpTopic] = useState(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  // Get help topics for the page
  const helpTopics = pageId ? helpContentService.getHelpTopicsForPage(pageId, contextData) : [];

  const handleMouseEnter = () => {
    if (!helpSticky) {
      setShowHelp(true);
    }
  };

  const handleMouseLeave = () => {
    if (!helpSticky) {
      setShowHelp(false);
    }
  };

  const handleClick = () => {
    setHelpSticky(!helpSticky);
    setShowHelp(!helpSticky || showHelp);
  };

  const handleCloseHelp = () => {
    setIsFadingOut(true);
    // After fade animation completes, hide the bubble
    setTimeout(() => {
      setShowHelp(false);
      setHelpSticky(false);
      setIsFadingOut(false);
    }, 690); // 0.69 seconds
  };

  const handleHelpTopicClick = (topic) => {
    // Handle link-type topics by navigating directly
    if (topic.type === 'link') {
      window.open(topic.url, '_blank');
      setShowHelp(false);
      setHelpSticky(false);
      return;
    }
    
    // Handle other types with the modal
    setSelectedHelpTopic(topic);
    setShowHelp(false);
    setHelpSticky(false);
  };

  const handleCloseModal = () => {
    setSelectedHelpTopic(null);
  };

  // Always render the mascot now since we have universal topics
  // if (!hasTopics) {
  //   return null;
  // }

  return (
    <>
      <div className={`contextual-help-mascot ${position}`}>
        {/* Theme toggle button positioned under mascot */}
        <div className="theme-toggle-container">
          <button 
            className={`theme-toggle-btn ${isDarkMode ? 'dark' : 'light'}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
        
        <div 
          className="mascot-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <img 
            src="/sgex/sgex-mascot.png" 
            alt="SGEX Helper" 
            className="mascot-icon"
          />
          
          {/* Notification badge for important help messages */}
          {notificationBadge && (
            <div className="notification-badge">
              !
            </div>
          )}
          
          {/* Question mark thought bubble - always show since we always have topics now */}
          {!notificationBadge && (
            <div className="question-bubble">
              ?
            </div>
          )}
        </div>
        
        {showHelp && (
          <div className={`help-thought-bubble ${isFadingOut ? 'fading-out' : ''}`}>
            <div className="bubble-content">
              {helpSticky && (
                <button 
                  className="close-bubble-btn"
                  onClick={handleCloseHelp}
                  aria-label="Close help"
                >
                  ×
                </button>
              )}
              <div className="help-text">
                {helpTopics.length > 0 ? (
                  <div className="help-topics-list">
                    <h4>Get Help</h4>
                    {helpTopics.map((topic) => (
                      <button
                        key={topic.id}
                        className="help-topic-btn"
                        onClick={() => handleHelpTopicClick(topic)}
                      >
                        {topic.badge && (
                          <img 
                            src={topic.badge} 
                            alt="" 
                            className="help-topic-badge"
                          />
                        )}
                        <span className="help-topic-title">{topic.title}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  helpContent
                )}
              </div>
            </div>
            <div className="bubble-tail"></div>
          </div>
        )}
      </div>
      
      {/* Help Modal for displaying slideshow content */}
      {selectedHelpTopic && (
        <HelpModal
          helpTopic={selectedHelpTopic}
          contextData={contextData}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ContextualHelpMascot;
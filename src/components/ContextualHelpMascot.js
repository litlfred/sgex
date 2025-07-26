import React, { useState } from 'react';
import helpContentService from '../services/helpContentService';
import HelpModal from './HelpModal';
import './ContextualHelpMascot.css';

const ContextualHelpMascot = ({ pageId, helpContent, position = 'bottom-right', contextData = {} }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [helpSticky, setHelpSticky] = useState(false);
  const [selectedHelpTopic, setSelectedHelpTopic] = useState(null);

  // Get help topics for the page
  const helpTopics = pageId ? helpContentService.getHelpTopicsForPage(pageId) : [];
  const hasTopics = helpTopics.length > 0 || helpContent;

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
    setShowHelp(false);
    setHelpSticky(false);
  };

  const handleHelpTopicClick = (topic) => {
    setSelectedHelpTopic(topic);
    setShowHelp(false);
    setHelpSticky(false);
  };

  const handleCloseModal = () => {
    setSelectedHelpTopic(null);
  };

  // Don't render if there are no help topics
  if (!hasTopics) {
    return null;
  }

  return (
    <>
      <div className={`contextual-help-mascot ${position}`}>
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
          
          {/* Question mark thought bubble */}
          {hasTopics && (
            <div className="question-bubble">
              ?
            </div>
          )}
        </div>
        
        {showHelp && (
          <div className="help-thought-bubble">
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
                        {topic.title}
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
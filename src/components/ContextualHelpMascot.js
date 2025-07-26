import React, { useState } from 'react';
import './ContextualHelpMascot.css';

const ContextualHelpMascot = ({ helpContent, position = 'bottom-right' }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [helpSticky, setHelpSticky] = useState(false);

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

  return (
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
              {helpContent}
            </div>
          </div>
          <div className="bubble-tail"></div>
        </div>
      )}
    </div>
  );
};

export default ContextualHelpMascot;
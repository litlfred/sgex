import React, { useState } from 'react';
import HelpModal from './HelpModal';
import './HelpButton.css';

const HelpButton = ({ helpTopic, contextData = {} }) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  return (
    <>
      <button 
        className="help-button"
        onClick={handleHelpClick}
        title="Get Help"
        aria-label="Get Help"
      >
        <img 
          src="/sgex/mascot-help-icon.svg" 
          alt="SGEX Helper" 
          className="help-mascot-icon"
        />
      </button>
      
      {showHelp && (
        <HelpModal
          topic={helpTopic}
          contextData={contextData}
          onClose={handleCloseHelp}
        />
      )}
    </>
  );
};

export default HelpButton;
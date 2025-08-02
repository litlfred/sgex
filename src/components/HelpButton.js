import React, { useState } from 'react';
import HelpModal from './HelpModal';
import useThemeImage from '../hooks/useThemeImage';
import './HelpButton.css';

const HelpButton = ({ helpTopic, contextData = {} }) => {
  const [showHelp, setShowHelp] = useState(false);

  // Theme-aware mascot image
  const mascotImage = useThemeImage('sgex-mascot.png');

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
          src={mascotImage} 
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
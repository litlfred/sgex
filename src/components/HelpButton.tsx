import React, { useState } from 'react';
import HelpModal from './HelpModal';
import useThemeImage from '../hooks/useThemeImage';

/**
 * Props for HelpButton component
 */
interface HelpButtonProps {
  /** Topic identifier for help content */
  helpTopic?: string;
  /** Additional context data to pass to help modal */
  contextData?: Record<string, any>;
}

/**
 * Help button that displays SGEX mascot and opens help modal
 * 
 * @example
 * <HelpButton helpTopic="dak-editor" contextData={{ componentType: 'bpmn' }} />
 */
const HelpButton: React.FC<HelpButtonProps> = ({ helpTopic, contextData = {} }) => {
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Theme-aware mascot image
  const mascotImage = useThemeImage('sgex-mascot.png');

  const handleHelpClick = (): void => {
    setShowHelp(true);
  };

  const handleCloseHelp = (): void => {
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

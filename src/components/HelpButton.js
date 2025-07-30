import React from 'react';

const HelpButton = ({ onClick, tooltip = "Get Help" }) => {
  return (
    <button 
      className="help-button"
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
    >
      <span className="help-icon">?</span>
    </button>
  );
};

export default HelpButton;
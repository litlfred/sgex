import React from 'react';

const HelpButton = ({ onClick, children, ...props }) => {
  return (
    <button 
      className="help-button"
      onClick={onClick}
      {...props}
    >
      {children || '?'}
    </button>
  );
};

export default HelpButton;
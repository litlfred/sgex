import React from 'react';

const HelpModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={e => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>Help</h2>
          <button className="help-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="help-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
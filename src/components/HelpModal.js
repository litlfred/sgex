import React from 'react';

const HelpModal = ({ topic, onClose }) => {
  if (!topic) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h3>{topic.title}</h3>
          <button className="help-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="help-modal-body">
          <p>{topic.content || 'Help content is being developed.'}</p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
import React from 'react';

const WHODigitalLibrary = ({ onClose }) => {
  return (
    <div className="who-digital-library">
      <div className="library-header">
        <h2>WHO Digital Library</h2>
        <button onClick={onClose}>×</button>
      </div>
      <div className="library-content">
        <p>WHO Digital Library integration is under development.</p>
      </div>
    </div>
  );
};

export default WHODigitalLibrary;
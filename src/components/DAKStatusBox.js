import React from 'react';

const DAKStatusBox = ({ status = 'ready', message = 'DAK is ready' }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'loading': return 'status-loading';
      case 'error': return 'status-error';
      case 'warning': return 'status-warning';
      default: return 'status-ready';
    }
  };

  return (
    <div className={`dak-status-box ${getStatusClass()}`}>
      <div className="status-indicator"></div>
      <span className="status-message">{message}</span>
    </div>
  );
};

export default DAKStatusBox;
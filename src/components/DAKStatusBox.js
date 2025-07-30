import React from 'react';

const DAKStatusBox = ({ status = 'unknown', title, children }) => {
  return (
    <div className={`dak-status-box status-${status}`}>
      {title && <h3>{title}</h3>}
      <div className="status-content">
        {children}
      </div>
    </div>
  );
};

export default DAKStatusBox;
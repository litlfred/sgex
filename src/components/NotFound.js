import React from 'react';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <button onClick={() => window.history.back()}>Go Back</button>
          <button onClick={() => window.location.href = '/'}>Go Home</button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
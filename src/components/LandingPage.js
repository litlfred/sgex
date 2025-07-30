import React from 'react';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <h1>Welcome to SGEX Workbench</h1>
      <p>Select an option to get started with your Digital Adaptation Kit (DAK)</p>
      <div className="landing-options">
        <button className="landing-button">Create New DAK</button>
        <button className="landing-button">Browse Existing DAKs</button>
        <button className="landing-button">Import DAK</button>
      </div>
    </div>
  );
};

export default LandingPage;
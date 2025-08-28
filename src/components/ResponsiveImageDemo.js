import React from 'react';
import ResponsiveImage from './ResponsiveImage';
import './ResponsiveImageDemo.css';

const ResponsiveImageDemo = () => {
  return (
    <div className="responsive-image-demo">
      <h1>Responsive Image Loading Demo</h1>
      <p>This demo shows how images automatically adapt based on screen size and theme.</p>
      
      <div className="demo-section">
        <h2>Main Mascot</h2>
        <div className="image-showcase">
          <ResponsiveImage 
            src="sgex-mascot.png"
            alt="SGEX Mascot"
            className="demo-image mascot"
          />
        </div>
        <div className="image-info">
          <p>Desktop: 3.7MB → Mobile: 609KB (84% smaller)</p>
        </div>
      </div>

      <div className="demo-section">
        <h2>Feature Images</h2>
        <div className="image-grid">
          <div className="image-item">
            <ResponsiveImage 
              src="authoring.png"
              alt="Authoring Feature"
              className="demo-image"
            />
            <p>Authoring</p>
          </div>
          <div className="image-item">
            <ResponsiveImage 
              src="collaboration.png"
              alt="Collaboration Feature"
              className="demo-image"
            />
            <p>Collaboration</p>
          </div>
          <div className="image-item">
            <ResponsiveImage 
              src="editing.png"
              alt="Editing Feature"
              className="demo-image"
            />
            <p>Editing</p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2>Dashboard Component Images</h2>
        <div className="image-grid">
          <div className="image-item">
            <ResponsiveImage 
              src="dashboard/dak_core_data_elements.png"
              alt="Core Data Elements"
              className="demo-image"
            />
            <p>Core Data Elements</p>
          </div>
          <div className="image-item">
            <ResponsiveImage 
              src="dashboard/dak_business_processes.png"
              alt="Business Processes"
              className="demo-image"
            />
            <p>Business Processes</p>
          </div>
          <div className="image-item">
            <ResponsiveImage 
              src="dashboard/dak_decision_support_logic.png"
              alt="Decision Support Logic"
              className="demo-image"
            />
            <p>Decision Support Logic</p>
          </div>
        </div>
      </div>

      <div className="demo-instructions">
        <h3>How to Test:</h3>
        <ol>
          <li><strong>Screen Size:</strong> Resize your browser window. Images under 768px width will load mobile versions.</li>
          <li><strong>Theme:</strong> Toggle dark/light theme to see theme-aware images load.</li>
          <li><strong>Network:</strong> Check browser dev tools Network tab to see actual image files being loaded.</li>
          <li><strong>File Sizes:</strong> Mobile images are 80%+ smaller than desktop versions.</li>
        </ol>
      </div>

      <div className="demo-stats">
        <h3>Optimization Results:</h3>
        <ul>
          <li>35+ PNG files optimized</li>
          <li>78-84% file size reduction for mobile</li>
          <li>Automatic theme detection (light/dark)</li>
          <li>Graceful fallback when mobile images don't exist</li>
          <li>Dynamic switching on window resize</li>
        </ul>
      </div>
    </div>
  );
};

export default ResponsiveImageDemo;
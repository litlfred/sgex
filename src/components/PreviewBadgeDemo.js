import React from 'react';
import PreviewBadge from '../components/PreviewBadge';

// Mock the environment to simulate a preview branch
const originalEnv = process.env;
process.env.REACT_APP_GITHUB_REF_NAME = 'feature/preview-badge-demo';

const PreviewBadgeDemo = () => {
  return (
    <div className="preview-badge-demo">
      <div className="demo-header">
        <h1>SGEX Workbench</h1>
        <p>WHO SMART Guidelines Exchange</p>
        
        {/* This is where the PreviewBadge appears in the actual app */}
        <PreviewBadge />
      </div>
      
      <div className="demo-content">
        <h2>Preview Badge Enhanced Demo</h2>
        <p>This demonstrates the enhanced preview badge functionality with hover and click behavior.</p>
        
        <div className="demo-instructions">
          <h3>Demo Instructions</h3>
          <ul>
            <li><strong>Hover</strong> over the orange preview badge to see PR details</li>
            <li><strong>Click</strong> the badge to pin the expanded view (makes it sticky)</li>
            <li><strong>Click</strong> again on a pinned badge to navigate to GitHub</li>
            <li><strong>Click outside</strong> or the × button to close</li>
            <li>Notice the PR title is truncated to ~50 characters</li>
          </ul>
          
          <h3>Features Demonstrated</h3>
          <ul>
            <li>✅ Hover to preview PR details</li>
            <li>✅ Click to stick/pin the expanded view</li>
            <li>✅ Mobile touch support</li>
            <li>✅ PR title truncation (~50 chars)</li>
            <li>✅ Visual feedback (hover effects, sticky styling)</li>
            <li>✅ Comments display and interaction</li>
            <li>✅ Click outside to close</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PreviewBadgeDemo;
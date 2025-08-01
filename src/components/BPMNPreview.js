import React, { useState, useEffect } from 'react';
import './BPMNPreview.css';

const BPMNPreview = ({ file, repository, selectedBranch, profile }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple timer to simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [file]);

  if (loading) {
    return (
      <div className="bpmn-preview">
        <div className="preview-loading">
          <div className="preview-spinner"></div>
          <span>Loading preview...</span>
        </div>
      </div>
    );
  }

  // Create a simple SVG representation of a BPMN workflow
  const processName = file.name.replace('.bpmn', '').replace(/[-_]/g, ' ');
  const isDemo = file.path?.includes('demo/') || file.sha?.startsWith('demo-');
  
  return (
    <div className="bpmn-preview">
      <div className="preview-container">
        <svg width="100%" height="120" viewBox="0 0 500 120" className="bpmn-preview-svg">
          {/* Background */}
          <rect width="500" height="120" fill="var(--bpmn-preview-bg)" stroke="none"/>
          
          {/* Start Event */}
          <circle cx="50" cy="60" r="18" fill="none" stroke="var(--who-blue)" strokeWidth="2"/>
          <text x="50" y="90" textAnchor="middle" fontSize="10" fill="var(--who-text-secondary)">Start</text>
          
          {/* Process Task */}
          <rect x="120" y="35" width="120" height="50" rx="5" fill="none" stroke="var(--who-blue)" strokeWidth="2"/>
          <text x="180" y="58" textAnchor="middle" fontSize="10" fill="var(--who-text-primary)" className="process-name">
            {processName.length > 15 ? processName.substring(0, 15) + '...' : processName}
          </text>
          <text x="180" y="72" textAnchor="middle" fontSize="8" fill="var(--who-text-secondary)">Process</text>
          
          {/* End Event */}
          <circle cx="320" cy="60" r="18" fill="none" stroke="var(--who-blue)" strokeWidth="3"/>
          <text x="320" y="90" textAnchor="middle" fontSize="10" fill="var(--who-text-secondary)">End</text>
          
          {/* Flow arrows */}
          <line x1="68" y1="60" x2="120" y2="60" stroke="var(--who-blue)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
          <line x1="240" y1="60" x2="302" y2="60" stroke="var(--who-blue)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
          
          {/* Arrow marker definition */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                    refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--who-blue)" />
            </marker>
          </defs>
          
          {/* BPMN indicator */}
          <text x="450" y="110" textAnchor="middle" fontSize="8" fill="var(--who-text-muted)">
            {isDemo ? 'BPMN Preview' : 'BPMN'}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default BPMNPreview;
import React from 'react';

const HelpModal = ({ isOpen, onClose, pageName, helpId }) => {
  if (!isOpen) return null;

  const handleContributionModalClose = () => {
    onClose();
  };

  return (
    <div className="help-modal-overlay" onClick={handleContributionModalClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>How to Contribute</h2>
          <button className="help-modal-close" onClick={handleContributionModalClose}>
            ×
          </button>
        </div>
        <div className="help-modal-body">
          <p>
            SGEX is an experimental collaborative project developing a workbench of tools 
            to make it easier and faster to develop high-fidelity SMART Guidelines Digital 
            Adaptation Kits (DAKs).
          </p>
          <p>
            Through community-driven development, bug reports become feature requests, 
            coding agents facilitate collaborative discussions, and the workbench evolves 
            in real time to support global digital health transformation.
          </p>
          <div className="contribution-steps">
            <h3>Ways to Contribute:</h3>
            <ul>
              <li>🐛 <strong>Report Issues:</strong> Use bug reports to request features or report problems</li>
              <li>🤝 <strong>Join Discussions:</strong> Participate in collaborative community discussions</li>
              <li>🚀 <strong>Test & Feedback:</strong> Help test new features and provide feedback</li>
              <li>📝 <strong>Documentation:</strong> Contribute to documentation and guides</li>
            </ul>
          </div>
          <div className="contribution-links">
            <a 
              href="https://github.com/litlfred/sgex/issues/new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contribution-link"
            >
              Report an Issue
            </a>
            <a 
              href="https://github.com/litlfred/sgex" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contribution-link"
            >
              View Source Code
            </a>
          </div>
        </div>
      </div>
      <style jsx>{`
        .help-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .help-modal-content {
          background: var(--who-card-bg, rgba(255, 255, 255, 0.95));
          border: 1px solid var(--who-border-color, rgba(0, 0, 0, 0.1));
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          backdrop-filter: blur(10px);
        }
        
        .help-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--who-border-color, rgba(0, 0, 0, 0.1));
        }
        
        .help-modal-header h2 {
          margin: 0;
          color: var(--who-text-primary, #333);
        }
        
        .help-modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--who-text-secondary, #666);
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }
        
        .help-modal-close:hover {
          background: var(--who-hover-bg, rgba(0, 0, 0, 0.1));
        }
        
        .help-modal-body {
          padding: 2rem;
        }
        
        .help-modal-body p {
          color: var(--who-text-secondary, #666);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .contribution-steps {
          margin: 2rem 0;
        }
        
        .contribution-steps h3 {
          color: var(--who-text-primary, #333);
          margin-bottom: 1rem;
        }
        
        .contribution-steps ul {
          list-style: none;
          padding: 0;
        }
        
        .contribution-steps li {
          margin: 0.5rem 0;
          color: var(--who-text-secondary, #666);
        }
        
        .contribution-links {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .contribution-link {
          background: var(--who-blue, #006cbe);
          color: white;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }
        
        .contribution-link:hover {
          background: var(--who-blue-dark, #005a9e);
          text-decoration: none;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default HelpModal;
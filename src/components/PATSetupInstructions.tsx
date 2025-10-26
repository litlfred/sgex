import React from 'react';
import ContextualHelpMascot from './ContextualHelpMascot';

/**
 * Component displaying instructions for creating GitHub Personal Access Tokens
 * 
 * Provides step-by-step guidance for creating both fine-grained and classic PATs,
 * including required permissions and security best practices.
 * 
 * @example
 * <PATSetupInstructions />
 */
const PATSetupInstructions: React.FC = () => {
  return (
    <div className="pat-setup-instructions">
      <div className="setup-content">
        <h3>🔑 How to Create a GitHub Personal Access Token</h3>
        <p>Personal Access Tokens (PATs) provide secure authentication without requiring OAuth setup.</p>
        
        <div className="setup-steps">
          <div className="step">
            <h4>1. Go to GitHub Settings</h4>
            <p>Navigate to <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer">GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens</a></p>
            <p><em>Or use <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">classic tokens</a> if you prefer.</em></p>
          </div>
          
          <div className="step">
            <h4>2. Generate New Token</h4>
            <p>Click <strong>"Generate new token"</strong> and configure:</p>
            <ul>
              <li><strong>Name:</strong> SGEX Workbench</li>
              <li><strong>Expiration:</strong> Choose your preferred duration (90 days recommended)</li>
              <li><strong>Repository access:</strong> Select repositories you want to edit</li>
            </ul>
          </div>
          
          <div className="step">
            <h4>3. Select Required Permissions</h4>
            <p>For <strong>fine-grained tokens</strong>, enable these permissions:</p>
            <ul>
              <li><strong>Contents:</strong> Read and Write</li>
              <li><strong>Metadata:</strong> Read</li>
              <li><strong>Pull requests:</strong> Read and Write</li>
            </ul>
            <p>For <strong>classic tokens</strong>, select these scopes:</p>
            <ul>
              <li><strong>repo</strong> - Full control of private repositories</li>
              <li><strong>read:org</strong> - Read org and team membership</li>
            </ul>
          </div>
          
          <div className="step">
            <h4>4. Copy Your Token</h4>
            <p>After generating, <strong>copy the token immediately</strong> - you won't be able to see it again!</p>
            <div className="warning-note">
              <strong>⚠️ Important:</strong> Treat your token like a password. Don't share it or commit it to repositories.
            </div>
          </div>
          
          <div className="step">
            <h4>5. Paste Token Above</h4>
            <p>Enter your token in the input field above and click "Sign in with Personal Access Token".</p>
          </div>
        </div>
        
        <div className="benefits-section">
          <h4>✅ Benefits of Personal Access Tokens</h4>
          <ul>
            <li>No backend server required - works entirely in your browser</li>
            <li>Fine-grained permissions - only access what you need</li>
            <li>Easy to rotate and revoke when needed</li>
            <li>Works with GitHub Pages and static hosting</li>
          </ul>
        </div>
        
        <div className="security-note">
          <h4>🔒 Security Best Practices</h4>
          <ul>
            <li>Use fine-grained tokens with minimal repository access</li>
            <li>Set reasonable expiration dates</li>
            <li>Regularly review and rotate your tokens</li>
            <li>Never share tokens or store them in code repositories</li>
          </ul>
        </div>
        
        <div className="help-links">
          <p>Need more help? Check out:</p>
          <ul>
            <li><a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" target="_blank" rel="noopener noreferrer">GitHub Personal Access Token Documentation</a></li>
            <li><a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" target="_blank" rel="noopener noreferrer">Fine-grained Personal Access Tokens</a></li>
          </ul>
        </div>
      </div>
      
      <ContextualHelpMascot 
        pageId="pat-setup-instructions"
        helpContent={null}
        position="bottom-right"
      />
    </div>
  );
};

export default PATSetupInstructions;

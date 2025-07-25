import React from 'react';
import './OAuthSetupInstructions.css';

const OAuthSetupInstructions = () => {
  return (
    <div className="oauth-setup-instructions">
      <div className="setup-content">
        <h3>⚙️ GitHub OAuth Setup Required</h3>
        <p>To use SGEX Workbench, you need to configure GitHub OAuth authentication.</p>
        
        <div className="setup-steps">
          <div className="step">
            <h4>1. Register a GitHub OAuth App</h4>
            <p>Go to <a href="https://github.com/settings/applications/new" target="_blank" rel="noopener noreferrer">GitHub Developer Settings</a> and create a new OAuth App:</p>
            <ul>
              <li><strong>Application name:</strong> SGEX Workbench</li>
              <li><strong>Homepage URL:</strong> {window.location.origin}{window.location.pathname}</li>
              <li><strong>Authorization callback URL:</strong> {window.location.origin}{window.location.pathname} (required but not used in device flow)</li>
            </ul>
          </div>
          
          <div className="step">
            <h4>2. Configure Your Client ID</h4>
            <p>After creating the OAuth App, copy the Client ID and set it as an environment variable:</p>
            <div className="code-block">
              <code>REACT_APP_GITHUB_CLIENT_ID=your_client_id_here</code>
            </div>
            <p>For development, create a <code>.env.local</code> file in your project root with this variable.</p>
          </div>
          
          <div className="step">
            <h4>3. Restart the Application</h4>
            <p>After setting the environment variable, restart your development server or rebuild the application.</p>
          </div>
        </div>
        
        <div className="note">
          <p><strong>Note:</strong> The Client ID is safe to include in client-side code as it's designed to be public. Client secrets are NOT needed for device flow authentication.</p>
        </div>
        
        <div className="help-links">
          <p>Need help? Check out:</p>
          <ul>
            <li><a href="https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app" target="_blank" rel="noopener noreferrer">GitHub OAuth App Documentation</a></li>
            <li><a href="https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow" target="_blank" rel="noopener noreferrer">GitHub Device Flow Authentication</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OAuthSetupInstructions;
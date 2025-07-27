import React from 'react';
import ContextualHelpMascot from './ContextualHelpMascot';
import './PATSetupInstructions.css';

const PATSetupInstructions = ({ repository = null, dak = null, requiredAccess = 'read' }) => {
  const getContextualTitle = () => {
    if (repository) {
      return `🔑 Create Token for ${repository.owner}/${repository.name}`;
    }
    if (dak) {
      return `🔑 Create Token for DAK: ${dak.name}`;
    }
    return '🔑 How to Create a GitHub Personal Access Token';
  };

  const getContextualDescription = () => {
    if (repository && requiredAccess === 'write') {
      return `You need write access to ${repository.owner}/${repository.name} to edit this DAK. Create a token with write permissions for this repository.`;
    }
    if (repository && requiredAccess === 'read') {
      return `Create a token with read access to ${repository.owner}/${repository.name} to view and analyze this DAK.`;
    }
    if (dak && requiredAccess === 'write') {
      return `You need write access to edit DAK components. Create a token with write permissions for the DAK repositories.`;
    }
    return 'Personal Access Tokens (PATs) provide secure authentication without requiring OAuth setup.';
  };

  const getRepositorySpecificGuidance = () => {
    if (!repository) return null;

    const isOrg = repository.owner_type === 'Organization';
    const orgName = repository.owner;

    return (
      <div className="repository-specific">
        <h4>📍 Repository-Specific Setup</h4>
        <div className="repo-info">
          <strong>Target Repository:</strong> {repository.owner}/{repository.name}
          {isOrg && <div className="org-note">📢 This is an organization repository ({orgName})</div>}
        </div>
        <p>When creating your token, make sure to:</p>
        <ul>
          <li>Select <strong>"{repository.owner}/{repository.name}"</strong> in repository access</li>
          {isOrg && (
            <li>If you don't see the repository, you may need organization approval for fine-grained tokens</li>
          )}
          <li>Choose <strong>"{requiredAccess === 'write' ? 'Read and Write' : 'Read-only'}"</strong> access level</li>
        </ul>
        {isOrg && (
          <div className="org-warning">
            <strong>🏢 Organization Note:</strong> Some organizations restrict fine-grained tokens. 
            If you encounter issues, try using a classic token with appropriate scopes instead.
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="pat-setup-instructions">
      <div className="setup-content">
        <h3>{getContextualTitle()}</h3>
        <p>{getContextualDescription()}</p>
        
        {getRepositorySpecificGuidance()}
        
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
              <li><strong>Name:</strong> SGEX Workbench{repository ? ` - ${repository.owner}/${repository.name}` : ''}</li>
              <li><strong>Expiration:</strong> Choose your preferred duration (90 days recommended)</li>
              <li><strong>Repository access:</strong> {repository ? `Select "${repository.owner}/${repository.name}"` : 'Select repositories you want to edit'}</li>
            </ul>
          </div>
          
          <div className="step">
            <h4>3. Select Required Permissions</h4>
            <p>For <strong>fine-grained tokens</strong>, enable these permissions:</p>
            <ul>
              <li><strong>Contents:</strong> {requiredAccess === 'write' ? 'Read and Write' : 'Read'}</li>
              <li><strong>Metadata:</strong> Read</li>
              {requiredAccess === 'write' && <li><strong>Pull requests:</strong> Read and Write</li>}
            </ul>
            <p>For <strong>classic tokens</strong>, select these scopes:</p>
            <ul>
              <li><strong>{requiredAccess === 'write' ? 'repo' : 'public_repo'}</strong> - {requiredAccess === 'write' ? 'Full control of private repositories' : 'Access to public repositories'}</li>
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
        position="bottom-right"
      />
    </div>
  );
};

export default PATSetupInstructions;
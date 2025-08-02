import React, { useState } from 'react';
import githubService from '../services/githubService';
import OAuthDeviceFlow from './OAuthDeviceFlow';
import logger from '../utils/logger';
import './RepositoryAccessBadge.css';

const RepositoryAccessBadge = ({ owner, repo, onAccessChanged }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [requestedAction, setRequestedAction] = useState(null);
  const componentLogger = logger.getLogger('RepositoryAccessBadge');

  React.useEffect(() => {
    componentLogger.componentMount({ owner, repo });
    return () => componentLogger.componentUnmount();
  }, [componentLogger, owner, repo]);

  // Get current access level for the repository
  const getAccessLevel = () => {
    if (!owner || !repo) {
      return { level: 'read-only', canComment: false, canManageWorkflows: false, authenticated: false };
    }
    
    return githubService.getRepositoryAccessLevel(owner, repo);
  };

  const accessLevel = getAccessLevel();

  const handleRequestAccess = (action) => {
    componentLogger.userAction('Requesting repository access', { action, owner, repo });
    setRequestedAction(action);
    setShowUpgradeModal(true);
  };

  const handleAccessUpgrade = async (token, user, scopes) => {
    componentLogger.auth('Upgrading repository access', { owner, repo, scopes });
    
    try {
      // Set the token for this specific repository
      const success = githubService.setRepositoryToken(owner, repo, token, scopes);
      
      if (success) {
        // Switch to this repository context
        githubService.switchToRepository(owner, repo);
        
        setShowUpgradeModal(false);
        setRequestedAction(null);
        
        // Notify parent component of access change
        if (onAccessChanged) {
          onAccessChanged(githubService.getRepositoryAccessLevel(owner, repo));
        }
        
        componentLogger.auth('Repository access upgraded successfully', { owner, repo, scopes });
      } else {
        throw new Error('Failed to set repository token');
      }
    } catch (error) {
      componentLogger.auth('Repository access upgrade failed', { owner, repo, error: error.message });
      console.error('Failed to upgrade repository access:', error);
    }
  };

  const handleRevokeAccess = () => {
    componentLogger.userAction('Revoking repository access', { owner, repo });
    githubService.removeRepositoryToken(owner, repo);
    
    if (onAccessChanged) {
      onAccessChanged(githubService.getRepositoryAccessLevel(owner, repo));
    }
  };

  const getActionRequirements = (action) => {
    const requirements = githubService.checkRequiredScopes(owner, repo, action);
    return requirements;
  };

  const getRequiredScopesForAction = (action) => {
    const actionScopes = {
      'comment': ['public_repo', 'workflow'],
      'workflow': ['workflow', 'public_repo'],
      'write': ['public_repo', 'workflow']
    };
    
    return actionScopes[action] || ['public_repo', 'workflow'];
  };

  const getBadgeClass = () => {
    if (!accessLevel.authenticated) {
      return 'access-badge read-only';
    }
    
    if (accessLevel.level === 'read-write') {
      return 'access-badge read-write';
    }
    
    return 'access-badge read-only';
  };

  const getBadgeText = () => {
    if (!accessLevel.authenticated) {
      return 'Read-Only (Guest)';
    }
    
    if (accessLevel.level === 'read-write') {
      return 'Read/Write Enabled';
    }
    
    return 'Read-Only';
  };

  const canPerformAction = (action) => {
    const requirements = getActionRequirements(action);
    return requirements.hasPermission;
  };

  if (!owner || !repo) {
    return null;
  }

  return (
    <div className="repository-access-badge">
      <div className="access-status">
        <div className={getBadgeClass()}>
          <span className="badge-icon">
            {accessLevel.authenticated ? (accessLevel.level === 'read-write' ? '🔓' : '🔒') : '👤'}
          </span>
          <span className="badge-text">{getBadgeText()}</span>
        </div>
        
        <div className="access-details">
          <span className="repo-name">{owner}/{repo}</span>
          {accessLevel.authenticated && (
            <div className="permissions-summary">
              <span className="permission-item" data-enabled={accessLevel.canComment}>
                💬 Comment
              </span>
              <span className="permission-item" data-enabled={accessLevel.canManageWorkflows}>
                ⚙️ Workflows
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="access-actions">
        {!accessLevel.authenticated && (
          <button 
            className="request-access-btn"
            onClick={() => handleRequestAccess('write')}
          >
            🔑 Get Write Access
          </button>
        )}
        
        {accessLevel.authenticated && accessLevel.level === 'read-only' && (
          <button 
            className="request-access-btn"
            onClick={() => handleRequestAccess('write')}
          >
            🔓 Upgrade Access
          </button>
        )}
        
        {accessLevel.authenticated && (
          <button 
            className="revoke-access-btn"
            onClick={handleRevokeAccess}
            title="Revoke access for this repository"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Action-specific access request buttons (can be used by parent components) */}
      <div className="hidden-action-helpers">
        {/* These methods can be called by parent components */}
        <div style={{ display: 'none' }}>
          {!canPerformAction('comment') && (
            <button onClick={() => handleRequestAccess('comment')}>Request Comment Access</button>
          )}
          {!canPerformAction('workflow') && (
            <button onClick={() => handleRequestAccess('workflow')}>Request Workflow Access</button>
          )}
        </div>
      </div>

      {/* OAuth upgrade modal */}
      {showUpgradeModal && (
        <div className="oauth-modal-overlay">
          <div className="oauth-modal">
            <div className="oauth-modal-header">
              <h3>Request Repository Access</h3>
              <button 
                className="modal-close"
                onClick={() => setShowUpgradeModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="oauth-modal-content">
              <p>
                To perform this action on <strong>{owner}/{repo}</strong>, you need additional permissions.
              </p>
              
              {requestedAction && (
                <div className="action-explanation">
                  <h4>Requesting access for: {requestedAction}</h4>
                  <p>This will grant the minimum permissions needed for this action.</p>
                </div>
              )}
              
              <OAuthDeviceFlow
                scopes={requestedAction ? getRequiredScopesForAction(requestedAction) : ['public_repo', 'workflow']}
                onAuthSuccess={handleAccessUpgrade}
                onError={(error) => {
                  console.error('OAuth upgrade failed:', error);
                  setShowUpgradeModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export helper methods for parent components to request specific permissions
RepositoryAccessBadge.requestCommentAccess = (owner, repo, onSuccess) => {
  // This would be implemented as a method that parent components can call
  // For now, we'll handle it through the badge component
};

RepositoryAccessBadge.requestWorkflowAccess = (owner, repo, onSuccess) => {
  // This would be implemented as a method that parent components can call
  // For now, we'll handle it through the badge component
};

export default RepositoryAccessBadge;
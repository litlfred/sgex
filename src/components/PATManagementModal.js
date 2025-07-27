import React, { useState, useEffect } from 'react';
import patManagementService from '../services/patManagementService';
import PATSetupInstructions from './PATSetupInstructions';
import PATHelpSlideshow from './PATHelpSlideshow';
import './PATManagementModal.css';

const PATManagementModal = ({ onClose, repository = null, requiredAccess = 'read' }) => {
  const [pats, setPATs] = useState([]);
  const [newToken, setNewToken] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [tokenAnalysis, setTokenAnalysis] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'add'

  useEffect(() => {
    loadPATs();
  }, []);

  const loadPATs = () => {
    try {
      patManagementService.initialize();
      const allPATs = patManagementService.getAllPATs();
      setPATs(allPATs);
    } catch (error) {
      console.error('Failed to load PATs:', error);
      setError('Failed to load access tokens');
    }
  };

  const analyzeNewToken = async (tokenValue) => {
    if (!tokenValue.trim()) return;
    
    setAnalyzing(true);
    setError("");
    
    try {
      const analysis = await patManagementService.analyzeToken(tokenValue);
      setTokenAnalysis(analysis);
      setNewUsername(analysis.tokenName);
      setShowPermissions(true);
    } catch (err) {
      console.error('Token analysis failed:', err);
      setError(err.message || "Failed to analyze token");
      setTokenAnalysis(null);
      setShowPermissions(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddPAT = async (e) => {
    e.preventDefault();
    
    if (!newToken.trim()) {
      setError('Please enter a GitHub Personal Access Token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await patManagementService.addPAT(newToken.trim(), null, false);
      setNewToken('');
      setNewUsername('');
      setTokenAnalysis(null);
      setShowPermissions(false);
      loadPATs();
      setActiveTab('manage');
      // Show success message briefly
      setError('');
    } catch (error) {
      console.error('Failed to add PAT:', error);
      setError(error.message || 'Failed to add access token');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTokenChange = (e) => {
    const tokenValue = e.target.value;
    setNewToken(tokenValue);
    if (error) setError('');
    
    // Reset analysis state when token changes
    if (tokenValue !== newToken) {
      setTokenAnalysis(null);
      setShowPermissions(false);
      setNewUsername('');
    }
    
    // Analyze token after a short delay (debounced)
    clearTimeout(window.newTokenAnalysisTimeout);
    if (tokenValue.trim().length > 10) { // Only analyze if token looks valid
      window.newTokenAnalysisTimeout = setTimeout(() => {
        analyzeNewToken(tokenValue);
      }, 1000);
    }
  };

  const getPermissionDescription = (permissions) => {
    if (!permissions) return ["❓ Unable to determine permissions"];
    
    const descriptions = [];
    
    if (permissions.level === 'write') {
      descriptions.push("✅ Full repository access (read and write)");
    } else if (permissions.level === 'read-only') {
      descriptions.push("👁️ Read-only repository access");
    } else if (permissions.level === 'fine-grained') {
      descriptions.push("🔧 Fine-grained permissions (repository-specific)");
    }
    
    if (permissions.scopes && permissions.scopes.length > 0) {
      descriptions.push(`📋 Scopes: ${permissions.scopes.join(', ')}`);
    }
    
    if (permissions.type) {
      descriptions.push(`🏷️ Token type: ${permissions.type === 'classic' ? 'Classic' : 'Fine-grained'}`);
    }
    
    return descriptions;
  };

  const handleRemovePAT = (patId) => {
    if (window.confirm('Are you sure you want to remove this access token?')) {
      try {
        patManagementService.removePAT(patId);
        loadPATs();
      } catch (error) {
        console.error('Failed to remove PAT:', error);
        setError('Failed to remove access token');
      }
    }
  };

  const getPermissionLevel = (permissions) => {
    if (!permissions) return 'Unknown';
    
    switch (permissions.level) {
      case 'write':
        return 'Write Access';
      case 'fine-grained':
        return 'Fine-grained';
      case 'read-only':
        return 'Read Only';
      default:
        return permissions.level || 'Unknown';
    }
  };

  const getPermissionColor = (permissions) => {
    if (!permissions) return 'gray';
    
    switch (permissions.level) {
      case 'write':
        return 'green';
      case 'fine-grained':
        return 'blue';
      case 'read-only':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Access Tokens</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Your Tokens ({pats.length})
          </button>
          <button 
            className={`tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add New Token
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'manage' && (
            <div className="tokens-list">
              {pats.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔑</div>
                  <h3>No access tokens</h3>
                  <p>Add a GitHub Personal Access Token to get started with repository access.</p>
                  <button 
                    className="primary-btn"
                    onClick={() => setActiveTab('add')}
                  >
                    Add Your First Token
                  </button>
                </div>
              ) : (
                <>
                  <div className="tokens-header">
                    <p>Manage your GitHub Personal Access Tokens for repository access:</p>
                  </div>
                  <div className="tokens-grid">
                    {pats.map((pat) => (
                      <div key={pat.id} className="token-card">
                        <div className="token-header">
                          <div className="token-user">
                            <img 
                              src={pat.user.avatar_url} 
                              alt={pat.user.login}
                              className="token-avatar"
                            />
                            <div>
                              <div className="token-user-name">
                                {pat.user.name || pat.user.login}
                              </div>
                              <div className="token-username">@{pat.user.login}</div>
                            </div>
                          </div>
                          <button 
                            className="remove-token-btn"
                            onClick={() => handleRemovePAT(pat.id)}
                            title="Remove token"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <div className="token-details">
                          <div className="token-permission">
                            <span 
                              className={`permission-badge ${getPermissionColor(pat.permissions)}`}
                            >
                              {getPermissionLevel(pat.permissions)}
                            </span>
                          </div>
                          
                          {pat.permissions.type && (
                            <div className="token-type">
                              Type: {pat.permissions.type === 'classic' ? 'Classic' : 'Fine-grained'}
                            </div>
                          )}
                          
                          <div className="token-created">
                            Added: {formatDate(pat.createdAt)}
                          </div>
                          
                          {pat.permissions.scopes && pat.permissions.scopes.length > 0 && (
                            <div className="token-scopes">
                              <strong>Scopes:</strong> {pat.permissions.scopes.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="add-token-section">
              <div className="add-token-header">
                <h3>Add New Access Token</h3>
                <p>Add a GitHub Personal Access Token to access your repositories:</p>
              </div>

              <form onSubmit={handleAddPAT} className="add-token-form">
                <div className="form-group">
                  <label htmlFor="new-username">Username:</label>
                  <input
                    id="new-username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Will be filled automatically from token"
                    className="username-input"
                    disabled={analyzing || loading}
                    autoComplete="username"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="new-token">GitHub Personal Access Token:</label>
                  <input
                    id="new-token"
                    type="password"
                    value={newToken}
                    onChange={handleNewTokenChange}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className={`token-input ${error ? 'error' : ''}`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  {analyzing && (
                    <div className="analyzing-indicator">
                      <span className="spinner small"></span>
                      Analyzing token...
                    </div>
                  )}
                </div>

                {showPermissions && tokenAnalysis && (
                  <div className="permissions-display">
                    <h4>🔐 Token Permissions Preview</h4>
                    <div className="user-info">
                      <img 
                        src={tokenAnalysis.user.avatar_url} 
                        alt={tokenAnalysis.user.login}
                        className="token-user-avatar"
                      />
                      <div>
                        <div className="token-user-name">
                          {tokenAnalysis.user.name || tokenAnalysis.user.login}
                        </div>
                        <div className="token-username">@{tokenAnalysis.user.login}</div>
                      </div>
                    </div>
                    <div className="permissions-list">
                      <p><strong>By adding this token, you will grant SGEX Workbench:</strong></p>
                      <ul>
                        {getPermissionDescription(tokenAnalysis.permissions).map((desc, index) => (
                          <li key={index}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="primary-btn"
                    disabled={loading || !newToken.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner small"></span>
                        Adding Token...
                      </>
                    ) : (
                      'Add Token'
                    )}
                  </button>
                  
                  <button 
                    type="button"
                    className="secondary-btn"
                    onClick={() => setShowInstructions(!showInstructions)}
                  >
                    {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                  </button>

                  <button 
                    type="button"
                    className="help-btn"
                    onClick={() => setShowSlideshow(true)}
                  >
                    🎓 Step-by-Step Guide
                  </button>
                </div>
              </form>

              {showInstructions && (
                <div className="instructions-section">
                  <PATSetupInstructions 
                    repository={repository}
                    requiredAccess={requiredAccess}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="security-notice">
            <strong>🔒 Security Notice:</strong> Your tokens are stored securely in your browser and never sent to our servers.
          </div>
        </div>
      </div>

      {showSlideshow && (
        <PATHelpSlideshow
          repository={repository}
          requiredAccess={requiredAccess}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </div>
  );
};

export default PATManagementModal;
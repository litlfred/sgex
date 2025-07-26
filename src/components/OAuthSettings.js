import React, { useState, useEffect } from 'react';
import oauthService from '../services/oauthService';
import tokenManagerService, { ACCESS_LEVELS } from '../services/tokenManagerService';
import OAuthLogin from './OAuthLogin';
import './OAuthSettings.css';

const OAuthSettings = ({ isOpen, onClose }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTokens();
    }
  }, [isOpen]);

  const loadTokens = () => {
    const tokenList = oauthService.getAllTokens();
    setTokens(tokenList);
  };

  const handleAddToken = () => {
    setShowAddToken(true);
  };

  const handleTokenAdded = (tokenInfo, user) => {
    setShowAddToken(false);
    loadTokens();
  };

  const handleRemoveToken = async (tokenKey) => {
    if (window.confirm('Are you sure you want to remove this authorization?')) {
      setLoading(true);
      try {
        await oauthService.removeToken(tokenKey);
        loadTokens();
      } catch (error) {
        console.error('Failed to remove token:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearAllTokens = async () => {
    if (window.confirm('Are you sure you want to remove ALL authorizations? This cannot be undone.')) {
      setLoading(true);
      try {
        await oauthService.clearAllTokens();
        loadTokens();
      } catch (error) {
        console.error('Failed to clear tokens:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTokenKey = (key) => {
    const parts = key.split(':');
    const accessLevel = parts[0];
    const scope = parts[1];
    
    const levelInfo = ACCESS_LEVELS[accessLevel];
    const levelName = levelInfo ? levelInfo.name : accessLevel;
    
    if (scope === 'global') {
      return `${levelName} (Global)`;
    } else if (scope.endsWith('/*')) {
      return `${levelName} (${scope.replace('/*', ' Organization')})`;
    } else {
      return `${levelName} (${scope})`;
    }
  };

  const formatTokenScope = (tokenInfo) => {
    if (tokenInfo.repoOwner && tokenInfo.repoName) {
      return `${tokenInfo.repoOwner}/${tokenInfo.repoName}`;
    } else if (tokenInfo.repoOwner) {
      return `${tokenInfo.repoOwner} (Organization)`;
    } else {
      return 'Global Access';
    }
  };

  const getAccessLevelInfo = (accessLevel) => {
    return ACCESS_LEVELS[accessLevel] || {
      name: accessLevel,
      color: '#6c757d',
      icon: '🔑',
    };
  };

  if (!isOpen) return null;

  return (
    <div className="oauth-settings-overlay">
      <div className="oauth-settings-modal">
        <div className="oauth-settings-header">
          <h2>🔐 OAuth Token Management</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="oauth-settings-content">
          {showAddToken ? (
            <div className="add-token-section">
              <div className="section-header">
                <h3>Add New Authorization</h3>
                <button 
                  onClick={() => setShowAddToken(false)}
                  className="back-btn"
                >
                  ← Back to Settings
                </button>
              </div>
              
              <OAuthLogin 
                onAuthSuccess={handleTokenAdded}
              />
            </div>
          ) : (
            <>
              <div className="settings-overview">
                <div className="overview-stats">
                  <div className="stat">
                    <span className="stat-number">{tokens.length}</span>
                    <span className="stat-label">Active Tokens</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">
                      {tokens.filter(([, info]) => info.accessLevel === 'WRITE_ACCESS').length}
                    </span>
                    <span className="stat-label">Write Access</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">
                      {tokens.filter(([, info]) => info.accessLevel === 'READ_ONLY').length}
                    </span>
                    <span className="stat-label">Read Only</span>
                  </div>
                </div>

                <div className="overview-actions">
                  <button 
                    onClick={handleAddToken}
                    className="add-token-btn"
                  >
                    ➕ Add Authorization
                  </button>
                  
                  {tokens.length > 0 && (
                    <button 
                      onClick={handleClearAllTokens}
                      className="clear-all-btn"
                      disabled={loading}
                    >
                      🗑️ Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="tokens-section">
                <h3>Active Authorizations</h3>
                
                {tokens.length === 0 ? (
                  <div className="no-tokens">
                    <div className="no-tokens-icon">🔓</div>
                    <h4>No Active Authorizations</h4>
                    <p>
                      You haven't authorized any GitHub access yet. 
                      Add an authorization to start working with DAK repositories.
                    </p>
                    <button 
                      onClick={handleAddToken}
                      className="add-token-btn primary"
                    >
                      ➕ Add Your First Authorization
                    </button>
                  </div>
                ) : (
                  <div className="tokens-list">
                    {tokens.map(([key, tokenInfo]) => {
                      const accessLevel = getAccessLevelInfo(tokenInfo.accessLevel);
                      const isExpired = tokenInfo.expiresAt && new Date(tokenInfo.expiresAt) < new Date();
                      
                      return (
                        <div 
                          key={key} 
                          className={`token-card ${isExpired ? 'expired' : ''}`}
                        >
                          <div className="token-header">
                            <div className="token-info">
                              <span 
                                className="access-level-badge"
                                style={{ backgroundColor: accessLevel.color }}
                              >
                                {accessLevel.icon} {accessLevel.name}
                              </span>
                              <span className="token-scope">
                                {formatTokenScope(tokenInfo)}
                              </span>
                            </div>
                            
                            <div className="token-actions">
                              <button
                                onClick={() => setSelectedToken(selectedToken === key ? null : key)}
                                className="details-btn"
                              >
                                {selectedToken === key ? '📄 Hide' : '📋 Details'}
                              </button>
                              <button
                                onClick={() => handleRemoveToken(key)}
                                className="remove-btn"
                                disabled={loading}
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          </div>

                          {selectedToken === key && (
                            <div className="token-details">
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <strong>Created:</strong>
                                  <span>{new Date(tokenInfo.createdAt).toLocaleDateString()}</span>
                                </div>
                                
                                {tokenInfo.expiresAt && (
                                  <div className="detail-item">
                                    <strong>Expires:</strong>
                                    <span className={isExpired ? 'expired' : ''}>
                                      {new Date(tokenInfo.expiresAt).toLocaleDateString()}
                                      {isExpired && ' (Expired)'}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="detail-item">
                                  <strong>Scope:</strong>
                                  <span>{tokenInfo.scope || 'Default'}</span>
                                </div>
                                
                                <div className="detail-item">
                                  <strong>Token Type:</strong>
                                  <span>{tokenInfo.tokenType || 'Bearer'}</span>
                                </div>
                              </div>

                              <div className="capabilities-section">
                                <strong>Capabilities:</strong>
                                <ul className="capabilities-list">
                                  {accessLevel.capabilities?.map((capability, index) => (
                                    <li key={index}>{capability}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {isExpired && (
                            <div className="token-warning">
                              ⚠️ This authorization has expired and needs to be renewed.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="settings-help">
                <h4>💡 Tips for Managing Authorizations</h4>
                <div className="help-tips">
                  <div className="tip">
                    <strong>Granular Access:</strong> Create separate authorizations for different repositories or organizations to limit access scope.
                  </div>
                  <div className="tip">
                    <strong>Security:</strong> Regularly review and remove unused authorizations to maintain security.
                  </div>
                  <div className="tip">
                    <strong>Permissions:</strong> You can always revoke access through GitHub's OAuth application settings.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthSettings;
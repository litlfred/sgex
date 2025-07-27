import React, { useState } from "react";
import ContextualHelpMascot from './ContextualHelpMascot';
import patManagementService from '../services/patManagementService';
import "./PATLogin.css";

const PATLogin = ({ onAuthSuccess }) => {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [tokenAnalysis, setTokenAnalysis] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);

  const analyzeToken = async (tokenValue) => {
    if (!tokenValue.trim()) return;
    
    setAnalyzing(true);
    setError("");
    
    try {
      const analysis = await patManagementService.analyzeToken(tokenValue);
      setTokenAnalysis(analysis);
      setUsername(analysis.tokenName);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError("Please enter a GitHub Personal Access Token");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Test the token by creating an Octokit instance and making a test request
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: token.trim() });
      
      // Test the token by fetching user info
      await octokit.rest.users.getAuthenticated();
      
      // Call success callback with token and octokit instance
      onAuthSuccess(token.trim(), octokit);
    } catch (err) {
      console.error('PAT authentication failed:', err);
      
      if (err.status === 401) {
        setError("Invalid Personal Access Token. Please check your token and try again.");
      } else if (err.status === 403) {
        setError("Token doesn't have sufficient permissions. Please ensure your token has 'repo' and 'read:org' scopes.");
      } else {
        setError("Authentication failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTokenChange = (e) => {
    const newToken = e.target.value;
    setToken(newToken);
    if (error) setError(""); // Clear error when user starts typing
    
    // Reset analysis state when token changes
    if (newToken !== token) {
      setTokenAnalysis(null);
      setShowPermissions(false);
      setUsername("");
    }
    
    // Analyze token after a short delay (debounced)
    clearTimeout(window.tokenAnalysisTimeout);
    if (newToken.trim().length > 10) { // Only analyze if token looks valid
      window.tokenAnalysisTimeout = setTimeout(() => {
        analyzeToken(newToken);
      }, 1000);
    }
  };

  const getPermissionDescription = (permissions) => {
    if (!permissions) return "Unable to determine permissions";
    
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

  return (
    <div className="pat-login">
      <div className="pat-login-section">
        <form onSubmit={handleSubmit} className="pat-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Will be filled automatically from token"
              className="username-input"
              disabled={analyzing || loading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pat-token">GitHub Personal Access Token:</label>
            <input
              id="pat-token"
              type="password"
              value={token}
              onChange={handleTokenChange}
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
                <p><strong>By logging in, you will grant SGEX Workbench:</strong></p>
                <ul>
                  {getPermissionDescription(tokenAnalysis.permissions).map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            className="github-login-btn" 
            disabled={loading || !token.trim()}
          >
            {loading ? (
              <>
                <span className="spinner small"></span>
                Authenticating...
              </>
            ) : (
              <>
                <span className="github-icon">🔑</span>
                Sign in with Personal Access Token
              </>
            )}
          </button>
        </form>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <ContextualHelpMascot 
        pageId="pat-login"
        position="bottom-right"
      />
    </div>
  );
};

export default PATLogin;
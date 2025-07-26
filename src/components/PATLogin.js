import React, { useState } from "react";
import ContextualHelpMascot from './ContextualHelpMascot';
import "./PATLogin.css";

const PATLogin = ({ onAuthSuccess }) => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setToken(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="pat-login">
      <div className="pat-login-section">
        <form onSubmit={handleSubmit} className="pat-form">
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
              autoComplete="off"
            />
          </div>
          
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
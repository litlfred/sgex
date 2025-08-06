import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import './PreviewBadge.css';

/**
 * PreviewBadge component that displays when the app is deployed from a non-main branch
 * Shows branch name and links to the associated PR
 */
const PreviewBadge = () => {
  const [branchInfo, setBranchInfo] = useState(null);
  const [prInfo, setPrInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectBranchAndPR = async () => {
      try {
        setLoading(true);
        setError(null);

        // Detect current branch from environment or URL
        const currentBranch = getCurrentBranch();
        
        if (!currentBranch || currentBranch === 'main') {
          // Not a preview branch, don't show badge
          setLoading(false);
          return;
        }

        setBranchInfo({
          name: currentBranch,
          safeName: currentBranch.replace(/\//g, '-')
        });

        // Try to fetch PR information for this branch
        try {
          const prData = await fetchPRForBranch(currentBranch);
          if (prData) {
            setPrInfo(prData);
          }
        } catch (prError) {
          console.debug('Could not fetch PR info:', prError);
          // Continue without PR info - still show branch badge
        }

        setLoading(false);
      } catch (err) {
        console.error('Error detecting branch:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    detectBranchAndPR();
  }, []);

  const getCurrentBranch = () => {
    // First try environment variable (set during build)
    if (process.env.REACT_APP_GITHUB_REF_NAME) {
      return process.env.REACT_APP_GITHUB_REF_NAME;
    }
    
    // Fallback: detect from URL path
    const path = window.location.pathname;
    
    // Match pattern: /sgex/{branch-name}/
    const match = path.match(/^\/sgex\/([^/]+)\//);
    if (match && match[1] !== 'main') {
      const safeBranchName = match[1];
      
      // Convert safe branch name back to original branch name
      // This handles the common case where slashes are converted to dashes
      // Note: This is a heuristic and may not be perfect for all edge cases
      let branchName = safeBranchName;
      
      // Common patterns: feature-name -> feature/name, fix-123 -> fix/123
      if (safeBranchName.includes('-') && !safeBranchName.startsWith('v') && !safeBranchName.match(/^\d/)) {
        // Try to detect if this looks like a feature branch
        if (safeBranchName.match(/^(feature|fix|hotfix|bugfix|chore|docs|style|refactor|test)-/)) {
          branchName = safeBranchName.replace(/^([^-]+)-/, '$1/');
        }
      }
      
      return branchName;
    }

    return null;
  };

  const fetchPRForBranch = async (branchName) => {
    try {
      // Get current repository context if available
      // For now, we'll use the main repository
      const owner = 'litlfred';
      const repo = 'sgex';

      // Get PR for this specific branch
      const pr = await githubService.getPullRequestForBranch(owner, repo, branchName);
      
      return pr;
    } catch (error) {
      console.debug('Failed to fetch PR info:', error);
      return null;
    }
  };

  const handleBadgeClick = () => {
    if (prInfo && prInfo.html_url) {
      window.open(prInfo.html_url, '_blank');
    }
  };

  // Don't render anything if loading, error, or not a preview branch
  if (loading || error || !branchInfo) {
    return null;
  }

  return (
    <div className="preview-badge-container">
      <div 
        className={`preview-badge ${prInfo ? 'clickable' : ''}`}
        onClick={prInfo ? handleBadgeClick : undefined}
        title={prInfo ? `Click to view PR: ${prInfo.title}` : `Preview branch: ${branchInfo.name}`}
      >
        <div className="badge-content">
          <span className="badge-label">Preview:</span>
          <span className="badge-branch">{branchInfo.name}</span>
          {prInfo && (
            <>
              <span className="badge-separator">|</span>
              <span className="badge-pr-title">{prInfo.title}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewBadge;
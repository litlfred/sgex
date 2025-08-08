import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import './PreviewBadge.css';

/**
 * PreviewBadge component that displays when the app is deployed from a non-main branch
 * Shows branch name and links to the associated PR(s)
 */
const PreviewBadge = () => {
  const [branchInfo, setBranchInfo] = useState(null);
  const [prInfo, setPrInfo] = useState([]); // Changed to array to support multiple PRs
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
          const prData = await fetchPRsForBranch(currentBranch);
          if (prData && prData.length > 0) {
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

  const fetchPRsForBranch = async (branchName) => {
    try {
      // Get current repository context if available
      // For now, we'll use the main repository
      const owner = 'litlfred';
      const repo = 'sgex';

      // Get all PRs for this specific branch
      const prs = await githubService.getPullRequestsForBranch(owner, repo, branchName);
      
      return prs;
    } catch (error) {
      console.debug('Failed to fetch PR info:', error);
      return [];
    }
  };

  const handleBadgeClick = (pr) => {
    if (pr && pr.html_url) {
      window.open(pr.html_url, '_blank');
    }
  };

  // Don't render anything if loading, error, or not a preview branch
  if (loading || error || !branchInfo) {
    return null;
  }

  // Render multiple badges if there are multiple PRs
  return (
    <div className="preview-badge-container">
      {prInfo && prInfo.length > 0 ? (
        prInfo.map((pr, index) => (
          <div 
            key={pr.id}
            className="preview-badge clickable"
            onClick={() => handleBadgeClick(pr)}
            title={`Click to view PR: ${pr.title}`}
          >
            <div className="badge-content">
              <span className="badge-label">PR:</span>
              <span className="badge-branch">#{pr.number}</span>
              <span className="badge-separator">|</span>
              <span className="badge-pr-title">{pr.title}</span>
            </div>
          </div>
        ))
      ) : (
        // Show branch badge if no PRs found
        <div 
          className="preview-badge"
          title={`Preview branch: ${branchInfo.name}`}
        >
          <div className="badge-content">
            <span className="badge-label">Preview:</span>
            <span className="badge-branch">{branchInfo.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewBadge;
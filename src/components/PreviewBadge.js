import React, { useState, useEffect, useRef } from 'react';
import githubService from '../services/githubService';

/**
 * PreviewBadge component that displays when the app is deployed from a non-main branch
 * Shows branch name and links to the associated PR
 * Can expand to show detailed PR information, comments, and add new comments
 */
const PreviewBadge = () => {
  const [branchInfo, setBranchInfo] = useState(null);
  const [prInfo, setPrInfo] = useState([]); // Changed to array to support multiple PRs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const expandedRef = useRef(null);

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

  // Handle clicks outside the expanded panel to close it (only if not sticky)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target)) {
        if (isSticky) {
          setIsSticky(false);
        }
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      // Listen for both mouse and touch events to support mobile devices
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isExpanded, isSticky]);

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

      const prs = await githubService.getPullRequestsForBranch(owner, repo, branchName);
      
      return prs;

    } catch (error) {
      console.debug('Failed to fetch PR info:', error);
      return [];
    }
  };

  const fetchCommentsForPR = async (owner, repo, prNumber) => {
    try {
      setCommentsLoading(true);
      
      // Fetch both review comments and issue comments
      const [reviewComments, issueComments] = await Promise.all([
        githubService.getPullRequestComments(owner, repo, prNumber).catch(() => []),
        githubService.getPullRequestIssueComments(owner, repo, prNumber).catch(() => [])
      ]);

      // Combine and sort comments by date, mark the type
      const allComments = [
        ...reviewComments.map(comment => ({ ...comment, type: 'review' })),
        ...issueComments.map(comment => ({ ...comment, type: 'issue' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Return last 5 comments as required
      return allComments.slice(0, 5);
    } catch (error) {
      console.debug('Failed to fetch comments:', error);
      return [];
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentToggle = (commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !githubService.isAuth() || submittingComment) return;
    
    try {
      setSubmittingComment(true);
      const owner = 'litlfred';
      const repo = 'sgex';
      
      if (prInfo && prInfo.length > 0) {
        const pr = prInfo[0]; // Use first PR for comment submission
        await githubService.createPullRequestComment(owner, repo, pr.number, newComment.trim());
        
        // Refresh comments after successful submission
        const updatedComments = await fetchCommentsForPR(owner, repo, pr.number);
        setComments(updatedComments);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      // Could add user-visible error handling here
    } finally {
      setSubmittingComment(false);
    }
  };

  const truncateComment = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBadgeClick = async (pr, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (pr && pr.html_url && !isExpanded) {
      // If not expanded, expand to show comments instead of immediately opening URL
      setIsExpanded(true);
      setIsSticky(true);
      
      // Fetch comments for this PR
      const owner = 'litlfred';
      const repo = 'sgex';
      const prComments = await fetchCommentsForPR(owner, repo, pr.number);
      setComments(prComments);
    } else if (pr && pr.html_url && isExpanded) {
      // If already expanded, open the PR URL
      window.open(pr.html_url, '_blank');
    }
  };

  const handleMouseEnter = () => {
    if (!isSticky && (!prInfo || prInfo.length === 0)) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isSticky && (!prInfo || prInfo.length === 0)) {
      setIsExpanded(false);
    }
  };

  const handleBadgeToggle = (event) => {
    // Only allow toggle for branch-only badges (no PRs)
    if (prInfo && prInfo.length > 0) return;
    
    // Prevent event from bubbling up
    event.stopPropagation();
    event.preventDefault();
    
    if (isSticky) {
      // If already sticky, collapse and remove sticky state
      setIsSticky(false);
      setIsExpanded(false);
    } else {
      // Make it sticky and ensure it's expanded
      setIsSticky(true);
      setIsExpanded(true);
    }
  };

  const truncateTitle = (title, maxLength = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // Don't render anything if loading, error, or not a preview branch
  if (loading || error || !branchInfo) {
    return null;
  }

  // Render multiple badges if there are multiple PRs
  return (
    <div className="preview-badge-container" ref={expandedRef}>
      {prInfo && prInfo.length > 0 ? (
        // Multiple PR badges - each one can be expanded to show comments
        <>
          {prInfo.map((pr, index) => (
            <div 
              key={pr.id}
              className={`preview-badge clickable ${isExpanded ? 'expanded' : ''} ${isSticky ? 'sticky' : ''}`}
              onClick={(event) => handleBadgeClick(pr, event)}
              title={isExpanded ? `Click to view PR: ${pr.title}` : `Click to expand for comments: ${pr.title}`}
            >
              <div className="badge-content">
                <span className="badge-label">PR:</span>
                <span className="badge-branch">#{pr.number}</span>
                <span className="badge-separator">|</span>
                <span className="badge-pr-title">{truncateTitle(pr.title)}</span>
                <span className="badge-expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </div>
            </div>
          ))}
          
          {/* Show expanded panel for PR comments */}
          {isExpanded && (
            <div className="preview-badge-expanded">
              <div className="expanded-header">
                <div className="pr-info">
                  <h3>
                    <a href={prInfo[0].html_url} target="_blank" rel="noopener noreferrer">
                      #{prInfo[0].number}: {prInfo[0].title}
                    </a>
                  </h3>
                  <div className="pr-meta">
                    <span className="pr-state" data-state={prInfo[0].state}>{prInfo[0].state}</span>
                    <span className="pr-author">by {prInfo[0].user.login}</span>
                  </div>
                </div>
                <button 
                  className="close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    setIsSticky(false);
                  }}
                  title="Close expanded view"
                >
                  ×
                </button>
              </div>

              {prInfo[0].body && (
                <div className="pr-description">
                  <h4>Description</h4>
                  <div className="pr-body">{prInfo[0].body}</div>
                </div>
              )}

              <div className="comments-section">
                <h4>Recent Comments ({comments.length}/5)</h4>
                {commentsLoading ? (
                  <div className="loading">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="no-comments">No comments yet</div>
                ) : (
                  <div className="comments-list">
                    {comments.map((comment) => {
                      const isExpanded = expandedComments.has(comment.id);
                      const shouldTruncate = comment.body && comment.body.length > 200;
                      
                      return (
                        <div key={comment.id} className="comment">
                          <div className="comment-header">
                            <img 
                              src={comment.user.avatar_url} 
                              alt={comment.user.login} 
                              className="comment-avatar"
                            />
                            <span className="comment-author">{comment.user.login}</span>
                            <span className="comment-date">{formatDate(comment.created_at)}</span>
                            <span className="comment-type">{comment.type}</span>
                          </div>
                          <div className="comment-body">
                            {shouldTruncate && !isExpanded ? (
                              <>
                                <div className="comment-preview">
                                  {truncateComment(comment.body)}
                                </div>
                                <button 
                                  className="comment-toggle"
                                  onClick={() => handleCommentToggle(comment.id)}
                                >
                                  Show more
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="comment-full">
                                  {comment.body}
                                </div>
                                {shouldTruncate && (
                                  <button 
                                    className="comment-toggle"
                                    onClick={() => handleCommentToggle(comment.id)}
                                  >
                                    Show less
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Comment form for authenticated users */}
                {githubService.isAuth() && (
                  <div className="comment-form">
                    <h4>Add Comment</h4>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                      disabled={submittingComment}
                    />
                    <div className="comment-form-actions">
                      <button
                        className="submit-comment"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim() || submittingComment}
                      >
                        {submittingComment ? 'Submitting...' : 'Comment'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="expanded-footer">
                <a href={prInfo[0].html_url} target="_blank" rel="noopener noreferrer" className="github-link">
                  View PR on GitHub →
                </a>
              </div>
            </div>
          )}
        </>
      ) : (
        // Single expandable badge for branch with no PRs
        <div 
          className={`preview-badge clickable ${isExpanded ? 'expanded' : ''} ${isSticky ? 'sticky' : ''}`}
          onClick={handleBadgeToggle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title={isSticky ? "Click to collapse" : isExpanded ? "Click to keep expanded" : `🔍 Hover for branch details, click to pin: ${branchInfo.name}`}
        >
          <div className="badge-content">
            <span className="badge-label">Preview:</span>
            <span className="badge-branch">{branchInfo.name}</span>
            <span className="badge-expand-icon">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>
      )}

      {isExpanded && (!prInfo || prInfo.length === 0) && (
        <div className="preview-badge-expanded">
          <div className="expanded-header">
            <div className="pr-info">
              <h3>Preview Branch: {branchInfo.name}</h3>
              <div className="pr-meta">
                <span className="pr-state" data-state="unknown">No PR found</span>
                <span className="pr-author">Branch preview</span>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
                setIsSticky(false);
              }}
              title="Close expanded view"
            >
              ×
            </button>
          </div>

          <div className="pr-description">
            <h4>Branch Information</h4>
            <div className="pr-body">
              This is a preview deployment from the <code>{branchInfo.name}</code> branch.
              <div style={{marginTop: '0.5rem'}}>
                <strong>Preview URL:</strong> <code>{window.location.origin}{window.location.pathname}</code>
              </div>
              {!githubService.isAuth() ? (
                <div style={{marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f0f8ff', border: '1px solid #bee5eb', borderRadius: '4px'}}>
                  <strong>💡 Tip:</strong> Sign in to GitHub to view pull request details, comments, and contribute to this branch.
                </div>
              ) : (
                <div style={{marginTop: '0.5rem', color: '#28a745'}}>
                  ✅ Authenticated - You can view full PR details when available.
                </div>
              )}
            </div>
          </div>

          <div className="expanded-footer">
            <a href={`https://github.com/litlfred/sgex/tree/${branchInfo.name}`} target="_blank" rel="noopener noreferrer" className="github-link">
              View Branch on GitHub →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewBadge;
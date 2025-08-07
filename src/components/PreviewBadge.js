import React, { useState, useEffect, useRef } from 'react';
import githubService from '../services/githubService';
import './PreviewBadge.css';

/**
 * PreviewBadge component that displays when the app is deployed from a non-main branch
 * Shows branch name and links to the associated PR
 * Can expand to show detailed PR information, comments, and add new comments
 */
const PreviewBadge = () => {
  const [branchInfo, setBranchInfo] = useState(null);
  const [prInfo, setPrInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [canComment, setCanComment] = useState(false);
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
          const prData = await fetchPRForBranch(currentBranch);
          if (prData) {
            setPrInfo(prData);
            // Check if user can comment (they need to be authenticated)
            setCanComment(githubService.isAuth());
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

  // Handle clicks outside the expanded panel to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isExpanded]);

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

  const fetchComments = async () => {
    if (!prInfo) return;
    
    setLoadingComments(true);
    try {
      // Fetch both review comments and issue comments
      const [reviewComments, issueComments] = await Promise.all([
        githubService.getPullRequestComments('litlfred', 'sgex', prInfo.number).catch(() => []),
        githubService.getPullRequestIssueComments('litlfred', 'sgex', prInfo.number).catch(() => [])
      ]);

      // Combine and sort comments by creation date
      const allComments = [
        ...reviewComments.map(c => ({ ...c, type: 'review' })),
        ...issueComments.map(c => ({ ...c, type: 'issue' }))
      ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      setComments(allComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleBadgeClick = (event) => {
    event.stopPropagation();
    
    if (!prInfo) {
      // No PR info, just open GitHub repo
      window.open(`https://github.com/litlfred/sgex/tree/${branchInfo.name}`, '_blank');
      return;
    }

    if (!isExpanded) {
      // Expand and fetch comments
      setIsExpanded(true);
      if (comments.length === 0) {
        fetchComments();
      }
    } else {
      // Already expanded, navigate to PR
      window.open(prInfo.html_url, '_blank');
    }
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    if (!newComment.trim() || !prInfo || !canComment) return;

    setSubmittingComment(true);
    try {
      const comment = await githubService.createPullRequestComment(
        'litlfred', 
        'sgex', 
        prInfo.number, 
        newComment.trim()
      );
      
      // Add the new comment to the list
      setComments(prev => [...prev, { ...comment, type: 'issue' }]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Don't render anything if loading, error, or not a preview branch
  if (loading || error || !branchInfo) {
    return null;
  }

  return (
    <div className="preview-badge-container" ref={expandedRef}>
      <div 
        className={`preview-badge ${prInfo ? 'clickable' : ''} ${isExpanded ? 'expanded' : ''}`}
        onClick={handleBadgeClick}
        title={isExpanded ? "Click to open PR in GitHub" : prInfo ? `Click to expand PR details: ${prInfo.title}` : `Preview branch: ${branchInfo.name}`}
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
          {prInfo && (
            <span className="badge-expand-icon">{isExpanded ? '▼' : '▶'}</span>
          )}
        </div>
      </div>

      {isExpanded && prInfo && (
        <div className="preview-badge-expanded">
          <div className="expanded-header">
            <div className="pr-info">
              <h3>
                <a href={prInfo.html_url} target="_blank" rel="noopener noreferrer">
                  #{prInfo.number}: {prInfo.title}
                </a>
              </h3>
              <div className="pr-meta">
                <span className="pr-state" data-state={prInfo.state}>{prInfo.state}</span>
                <span className="pr-author">by {prInfo.user.login}</span>
                <span className="pr-date">{formatDate(prInfo.created_at)}</span>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              title="Close expanded view"
            >
              ×
            </button>
          </div>

          {prInfo.body && (
            <div className="pr-description">
              <h4>Description</h4>
              <div className="pr-body">{prInfo.body}</div>
            </div>
          )}

          <div className="comments-section">
            <h4>Comments ({comments.length})</h4>
            
            {loadingComments ? (
              <div className="loading">Loading comments...</div>
            ) : comments.length > 0 ? (
              <div className="comments-list">
                {comments.map((comment) => (
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
                      {expandedComments.has(comment.id) ? (
                        <div className="comment-full">
                          {comment.body}
                          <button 
                            className="comment-toggle"
                            onClick={() => toggleCommentExpansion(comment.id)}
                          >
                            Show less
                          </button>
                        </div>
                      ) : (
                        <div className="comment-preview">
                          {truncateText(comment.body)}
                          {comment.body.length > 100 && (
                            <button 
                              className="comment-toggle"
                              onClick={() => toggleCommentExpansion(comment.id)}
                            >
                              Show more
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-comments">No comments yet</div>
            )}

            {canComment && (
              <form className="comment-form" onSubmit={handleSubmitComment}>
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
                    type="submit" 
                    disabled={!newComment.trim() || submittingComment}
                    className="submit-comment"
                  >
                    {submittingComment ? 'Submitting...' : 'Comment'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="expanded-footer">
            <a href={prInfo.html_url} target="_blank" rel="noopener noreferrer" className="github-link">
              View on GitHub →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewBadge;
import React, { useState, useEffect, useRef } from 'react';
import githubService from '../services/githubService';
import githubActionsService from '../services/githubActionsService';
import WorkflowStatus from './WorkflowStatus';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';
import './WorkflowStatus.css';
import './PreviewBadge.css';

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
  const [commentSubmissionStatus, setCommentSubmissionStatus] = useState(null); // 'submitting', 'success', 'error'
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [newlyAddedCommentId, setNewlyAddedCommentId] = useState(null);
  const [copilotSessionInfo, setCopilotSessionInfo] = useState(null);
  const [showCopilotSession, setShowCopilotSession] = useState(false);
  const [canComment, setCanComment] = useState(true);
  const [canTriggerWorkflows, setCanTriggerWorkflows] = useState(false);
  const [canApproveWorkflows, setCanApproveWorkflows] = useState(false);
  const [canMergePR, setCanMergePR] = useState(false);
  const [isMergingPR, setIsMergingPR] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [allComments, setAllComments] = useState([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const expandedRef = useRef(null);
  const commentRefreshIntervalRef = useRef(null);
  const workflowRefreshIntervalRef = useRef(null);

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

  // Cleanup auto-refresh interval when component unmounts or expanded state changes
  useEffect(() => {
    return () => {
      if (commentRefreshIntervalRef.current) {
        clearInterval(commentRefreshIntervalRef.current);
        commentRefreshIntervalRef.current = null;
      }
      if (workflowRefreshIntervalRef.current) {
        clearInterval(workflowRefreshIntervalRef.current);
        workflowRefreshIntervalRef.current = null;
      }
    };
  }, []);

  // Clear auto-refresh when not expanded
  useEffect(() => {
    if (!isExpanded) {
      if (commentRefreshIntervalRef.current) {
        clearInterval(commentRefreshIntervalRef.current);
        commentRefreshIntervalRef.current = null;
      }
      if (workflowRefreshIntervalRef.current) {
        clearInterval(workflowRefreshIntervalRef.current);
        workflowRefreshIntervalRef.current = null;
      }
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

  const fetchCommentsForPR = async (owner, repo, prNumber, page = 1, append = false) => {
    try {
      setCommentsLoading(true);
      
      const perPage = 30; // GitHub default per page
      
      // Fetch both review comments and issue comments with pagination
      const [reviewComments, issueComments] = await Promise.all([
        githubService.getPullRequestComments(owner, repo, prNumber, page, perPage).catch(() => []),
        githubService.getPullRequestIssueComments(owner, repo, prNumber, page, perPage).catch(() => [])
      ]);

      // Combine and sort comments by date, mark the type
      const newComments = [
        ...reviewComments.map(comment => ({ ...comment, type: 'review' })),
        ...issueComments.map(comment => ({ ...comment, type: 'issue' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (append) {
        // Append to existing comments (for load more)
        const existingIds = new Set(allComments.map(c => c.id));
        const uniqueNewComments = newComments.filter(c => !existingIds.has(c.id));
        const updatedAllComments = [...allComments, ...uniqueNewComments];
        setAllComments(updatedAllComments);
        setComments(updatedAllComments.slice(0, Math.min(5, updatedAllComments.length)));
      } else {
        // Replace comments (for initial load or refresh)
        setAllComments(newComments);
        setComments(newComments.slice(0, Math.min(5, newComments.length)));
      }
      
      // Check if there are more comments to load
      setHasMoreComments(newComments.length === perPage);
      
      return newComments;
    } catch (error) {
      console.debug('Failed to fetch comments:', error);
      return [];
    } finally {
      setCommentsLoading(false);
    }
  };

  const getCommentViewers = (comment, allComments) => {
    const viewers = new Set();
    
    // Extract mentions from the comment body
    const mentionMatches = comment.body.match(/@(\w+)/g);
    if (mentionMatches) {
      mentionMatches.forEach(mention => {
        const username = mention.substring(1); // Remove @
        viewers.add(username);
      });
    }
    
    // Check if any subsequent comments reference this comment or author
    const laterComments = allComments.filter(c => 
      new Date(c.created_at) > new Date(comment.created_at)
    );
    
    laterComments.forEach(laterComment => {
      // Check if later comment mentions this comment's author
      if (laterComment.body.toLowerCase().includes(`@${comment.user.login.toLowerCase()}`)) {
        viewers.add(laterComment.user.login);
      }
      
      // Check if later comment references this comment content (partial match)
      const commentWords = comment.body.toLowerCase().split(' ').filter(word => word.length > 3);
      if (commentWords.length > 0) {
        const hasReferenceWords = commentWords.some(word => 
          laterComment.body.toLowerCase().includes(word) && 
          laterComment.user.login !== comment.user.login
        );
        if (hasReferenceWords) {
          viewers.add(laterComment.user.login);
        }
      }
    });
    
    // Add copilot if mentioned anywhere in the thread related to this comment
    if (comment.body.toLowerCase().includes('copilot') || 
        comment.user.login.toLowerCase().includes('copilot')) {
      viewers.add('copilot');
    }
    
    // Check if copilot has engaged in later comments
    const copilotEngaged = laterComments.some(c => 
      c.user.login.toLowerCase().includes('copilot') ||
      c.body.toLowerCase().includes(`@${comment.user.login.toLowerCase()}`)
    );
    if (copilotEngaged) {
      viewers.add('copilot');
    }
    
    // Remove the comment author from viewers (don't show badge for self)
    viewers.delete(comment.user.login);
    
    return Array.from(viewers);
  };

  const fetchWorkflowStatus = async (branchName) => {
    try {
      setWorkflowLoading(true);
      
      // Initialize GitHub Actions service with current token if available
      if (githubService.isAuth() && githubService.token) {
        githubActionsService.setToken(githubService.token);
      }
      
      const status = await githubActionsService.getLatestWorkflowRun(branchName);
      const parsedStatus = githubActionsService.parseWorkflowStatus(status);
      setWorkflowStatus(parsedStatus);
    } catch (error) {
      console.debug('Failed to fetch workflow status:', error);
      setWorkflowStatus(null);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const fetchCopilotSessionInfo = async (owner, repo, prNumber) => {
    try {
      if (!githubService.isAuth()) {
        return null;
      }

      // Check for recent GitHub Copilot activity in PR comments
      const comments = await githubService.getPullRequestIssueComments(owner, repo, prNumber);
      
      // Look for comments from GitHub Copilot or containing copilot session indicators
      const copilotComments = comments.filter(comment => 
        comment.user.login === 'copilot' || 
        comment.user.login.includes('copilot') ||
        comment.body.includes('@copilot') ||
        comment.body.includes('copilot session') ||
        comment.body.includes('GitHub Copilot')
      );

      if (copilotComments.length > 0) {
        // Get the most recent copilot activity
        const latestCopilotComment = copilotComments[0];
        
        // Try to find an agent session URL in the comments or generate one
        let agentSessionUrl = null;
        
        // Look for agent session URLs in comments
        const sessionUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+\/agent-sessions\/[a-f0-9-]+/gi;
        for (const comment of copilotComments) {
          const match = comment.body.match(sessionUrlPattern);
          if (match) {
            agentSessionUrl = match[0];
            break;
          }
        }
        
        // If no explicit agent session URL found, construct the likely URL
        if (!agentSessionUrl) {
          // Generate a plausible agent session URL based on the PR structure
          // This is a best-effort approach since we don't have direct access to session IDs
          agentSessionUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}/agent-sessions`;
        }
        
        return {
          hasActiveCopilot: true,
          latestActivity: latestCopilotComment.created_at,
          sessionUrl: agentSessionUrl,
          commentUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}#issuecomment-${latestCopilotComment.id}`,
          commentsCount: copilotComments.length,
          latestComment: latestCopilotComment
        };
      }

      return {
        hasActiveCopilot: false,
        commentsCount: 0
      };
    } catch (error) {
      console.debug('Failed to fetch copilot session info:', error);
      return null;
    }
  };

  const handleTriggerWorkflow = async (branchName) => {
    try {
      if (!githubService.isAuth()) {
        console.warn('Authentication required to trigger workflows');
        return false;
      }

      // Ensure GitHub Actions service has the current token
      githubActionsService.setToken(githubService.token);
      
      const success = await githubActionsService.triggerWorkflow(branchName);
      if (success) {
        // Refresh workflow status after triggering
        setTimeout(() => {
          fetchWorkflowStatus(branchName);
        }, 2000); // Wait 2 seconds before fetching status
      }
      return success;
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      return false;
    }
  };

  const handleApproveWorkflow = async (runId) => {
    try {
      if (!githubService.isAuth()) {
        console.warn('Authentication required to approve workflows');
        return false;
      }

      // Ensure GitHub Actions service has the current token
      githubActionsService.setToken(githubService.token);
      
      const success = await githubActionsService.approveWorkflowRun(runId);
      if (success) {
        // Refresh workflow status after approval
        setTimeout(() => {
          if (branchInfo?.name) {
            fetchWorkflowStatus(branchInfo.name);
          }
        }, 2000); // Wait 2 seconds before fetching status
      }
      return success;
    } catch (error) {
      console.error('Failed to approve workflow:', error);
      return false;
    }
  };

  const handleMergePR = async (owner, repo, prNumber) => {
    if (!githubService.isAuth() || isMergingPR || !canMergePR) {
      return false;
    }

    setIsMergingPR(true);
    try {
      // Get the PR details to create a meaningful merge commit message
      const prData = prInfo.find(pr => pr.number === prNumber);
      const commitTitle = `Merge PR #${prNumber}: ${prData?.title || 'Pull Request'}`;
      const commitMessage = `Merges pull request #${prNumber}\n\n${prData?.body || ''}`.trim();

      const result = await githubService.mergePullRequest(owner, repo, prNumber, {
        commit_title: commitTitle,
        commit_message: commitMessage,
        merge_method: 'merge' // Use merge commit method
      });

      console.debug('PR merged successfully:', result);
      
      // Refresh the PR info to reflect the merged status
      setTimeout(async () => {
        try {
          const refreshedPRs = await fetchPRsForBranch(branchInfo?.name);
          if (refreshedPRs && refreshedPRs.length > 0) {
            setPrInfo(refreshedPRs);
          }
        } catch (error) {
          console.debug('Could not refresh PR status after merge:', error);
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to merge PR:', error);
      return false;
    } finally {
      setIsMergingPR(false);
    }
  };

  const checkPermissions = async (owner, repo) => {
    if (!githubService.isAuth()) {
      setCanComment(false);
      setCanTriggerWorkflows(false);
      setCanApproveWorkflows(false);
      setCanMergePR(false);
      return;
    }

    try {
      // Check comment permissions
      const commentPermissions = await githubService.checkCommentPermissions(owner, repo);
      setCanComment(commentPermissions);

      // Set up GitHub Actions service token
      githubActionsService.setToken(githubService.token);

      // Check workflow permissions
      const [triggerPermissions, approvalPermissions] = await Promise.all([
        githubActionsService.checkWorkflowTriggerPermissions(),
        githubActionsService.checkWorkflowApprovalPermissions()
      ]);

      setCanTriggerWorkflows(triggerPermissions);
      setCanApproveWorkflows(approvalPermissions);

      // Check merge permissions for the first PR if available
      if (prInfo && prInfo.length > 0) {
        const mergePermissions = await githubService.checkPullRequestMergePermissions(owner, repo, prInfo[0].number);
        setCanMergePR(mergePermissions);
      } else {
        setCanMergePR(false);
      }
    } catch (error) {
      console.debug('Error checking permissions:', error);
      setCanComment(false);
      setCanTriggerWorkflows(false);
      setCanApproveWorkflows(false);
      setCanMergePR(false);
    }
  };

  const setupCommentAutoRefresh = (owner, repo, prNumber) => {
    // Clear any existing interval
    if (commentRefreshIntervalRef.current) {
      clearInterval(commentRefreshIntervalRef.current);
    }

    // Set up new interval to refresh comments every minute
    commentRefreshIntervalRef.current = setInterval(async () => {
      try {
        const latestComments = await fetchCommentsForPR(owner, repo, prNumber, 1, false);
        
        // Check if there are new comments compared to what we have
        if (latestComments.length > 0 && comments.length > 0) {
          const latestId = latestComments[0].id;
          const currentLatestId = comments[0].id;
          
          if (latestId !== currentLatestId) {
            console.debug('New comments detected, refreshing...');
            // Don't reset the page, just refresh the current view
          }
        }
      } catch (error) {
        console.debug('Failed to auto-refresh comments:', error);
      }
    }, 60000); // 60 seconds
  };

  const setupWorkflowAutoRefresh = (branchName) => {
    // Clear any existing interval
    if (workflowRefreshIntervalRef.current) {
      clearInterval(workflowRefreshIntervalRef.current);
    }

    // Set up new interval to refresh workflow status every 30 seconds
    workflowRefreshIntervalRef.current = setInterval(async () => {
      try {
        const previousStatus = workflowStatus?.status;
        await fetchWorkflowStatus(branchName);
        
        // Log status changes for debugging
        if (workflowStatus?.status && workflowStatus.status !== previousStatus) {
          console.debug(`Workflow status changed from ${previousStatus} to ${workflowStatus.status}`);
        }
      } catch (error) {
        console.debug('Failed to auto-refresh workflow status:', error);
      }
    }, 30000); // 30 seconds for more dynamic updates
  };

  const loadMoreComments = async () => {
    if (!prInfo || prInfo.length === 0 || commentsLoading || !hasMoreComments) return;
    
    const owner = 'litlfred';
    const repo = 'sgex';
    const pr = prInfo[0];
    
    const nextPage = commentsPage + 1;
    setCommentsPage(nextPage);
    
    await fetchCommentsForPR(owner, repo, pr.number, nextPage, true);
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
    if (!newComment.trim() || !githubService.isAuth() || submittingComment || !canComment) return;
    
    try {
      setSubmittingComment(true);
      setCommentSubmissionStatus('submitting');
      const owner = 'litlfred';
      const repo = 'sgex';
      
      // Add detailed logging for debugging
      console.debug('Submitting comment:', {
        authenticated: githubService.isAuth(),
        hasToken: !!githubService.token,
        commentLength: newComment.trim().length,
        prInfo: prInfo?.length || 0,
        canComment
      });
      
      if (prInfo && prInfo.length > 0) {
        const pr = prInfo[0]; // Use first PR for comment submission
        console.debug('Submitting to PR:', pr.number);
        
        try {
          const submittedComment = await githubService.createPullRequestComment(owner, repo, pr.number, newComment.trim());
          console.debug('Comment submitted successfully:', submittedComment);
          
          // Set success status
          setCommentSubmissionStatus('success');
          
          // Refresh comments after successful submission
          await fetchCommentsForPR(owner, repo, pr.number, 1, false);
          
          // Mark the newly added comment for glow effect
          if (submittedComment && submittedComment.id) {
            setNewlyAddedCommentId(submittedComment.id);
            // Remove glow effect after 3 seconds
            setTimeout(() => setNewlyAddedCommentId(null), 3000);
          }
          
          setNewComment('');
          setShowMarkdownEditor(false); // Close markdown editor after successful submission
          
          // Clear success status after 3 seconds
          setTimeout(() => setCommentSubmissionStatus(null), 3000);
        } catch (submitError) {
          console.error('GitHub API comment submission error:', {
            error: submitError,
            message: submitError.message,
            status: submitError.status,
            response: submitError.response
          });
          
          // More specific error messages based on the error type
          let errorMessage = 'Failed to submit comment. ';
          if (submitError.message.includes('401')) {
            errorMessage += 'Authentication failed - please check your token.';
          } else if (submitError.message.includes('403') || submitError.message.includes('Resource not accessible by personal access token')) {
            errorMessage += 'Your personal access token does not have permission to create comments. Please use a token with "repo" or "public_repo" scope.';
            // Disable comment form for this session since we know the token doesn't have permissions
            setCanComment(false);
          } else if (submitError.message.includes('404')) {
            errorMessage += 'Pull request not found.';
          } else if (submitError.message.includes('422')) {
            errorMessage += 'Invalid comment format.';
          } else {
            errorMessage += 'Please try again.';
          }
          
          setCommentSubmissionStatus({ type: 'error', message: errorMessage });
          // Clear error status after 7 seconds for longer messages
          setTimeout(() => setCommentSubmissionStatus(null), 7000);
        }
      } else {
        console.warn('No PR info available for comment submission');
        setCommentSubmissionStatus({ type: 'error', message: 'No pull request found to comment on.' });
        setTimeout(() => setCommentSubmissionStatus(null), 5000);
      }
    } catch (error) {
      console.error('Unexpected error during comment submission:', error);
      setCommentSubmissionStatus({ type: 'error', message: 'Unexpected error occurred. Please try again.' });
      setTimeout(() => setCommentSubmissionStatus(null), 5000);
    } finally {
      setSubmittingComment(false);
    }
  };

  const truncateDescription = (text, maxLines = 6) => {
    if (!text) return '';
    const lines = text.split('\n');
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  const handleDescriptionToggle = () => {
    setExpandedDescription(!expandedDescription);
  };

  const sanitizeAndRenderMarkdown = (content) => {
    if (!content) return '';
    
    // Configure DOMPurify to allow HTML table elements while maintaining security
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        // Standard markdown elements
        'p', 'br', 'strong', 'b', 'em', 'i', 'code', 'pre', 'blockquote',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img',
        'hr', 'del', 'ins', 'mark', 'small', 'sub', 'sup',
        // HTML table elements
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        // Divs and spans for table styling
        'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'style',
        'align', 'colspan', 'rowspan', 'width', 'height',
        'target', 'rel'
      ],
      KEEP_CONTENT: true,
      ALLOW_DATA_ATTR: false
    });
    
    return sanitizedContent;
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
      await fetchCommentsForPR(owner, repo, pr.number, 1, false);
      
      // Check permissions
      await checkPermissions(owner, repo);
      
      // Check if user is collaborator and auto-add @copilot
      if (githubService.isAuth() && canComment) {
        try {
          const hasWriteAccess = await githubService.checkRepositoryWritePermissions(owner, repo);
          if (hasWriteAccess && !newComment.includes('@copilot')) {
            setNewComment('@copilot ');
          }
        } catch (error) {
          console.debug('Could not check collaborator status:', error);
        }
      }

      // Check for copilot session activity
      if (githubService.isAuth()) {
        try {
          const copilotInfo = await fetchCopilotSessionInfo(owner, repo, pr.number);
          setCopilotSessionInfo(copilotInfo);
        } catch (error) {
          console.debug('Could not fetch copilot session info:', error);
        }
      }
      
      // Fetch workflow status for the current branch
      if (branchInfo?.name) {
        await fetchWorkflowStatus(branchInfo.name);
        // Set up auto-refresh for workflow status
        setupWorkflowAutoRefresh(branchInfo.name);
      }

      // Set up auto-refresh for comments
      setupCommentAutoRefresh(owner, repo, pr.number);
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

  const handleBadgeToggle = async (event) => {
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
      
      // Fetch workflow status for the current branch
      if (branchInfo?.name) {
        await fetchWorkflowStatus(branchInfo.name);
        // Set up auto-refresh for workflow status
        setupWorkflowAutoRefresh(branchInfo.name);
      }
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
                    <span className="pr-author">
                      by <a 
                        href={prInfo[0].user.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="pr-author-link"
                      >
                        {prInfo[0].user.login}
                      </a>
                    </span>
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

              {/* Comment form for authenticated users - MOVED TO TOP */}
              {githubService.isAuth() && (
                <div className="comment-form">
                  <h4>Add Comment</h4>
                  {!canComment && (
                    <div className="comment-disabled-notice">
                      <strong>💡 Comments disabled:</strong> Your personal access token does not have permission to create comments. 
                      Please use a token with "repo" or "public_repo" scope to enable commenting.
                    </div>
                  )}
                  {commentSubmissionStatus && (
                    <div className={`comment-status comment-status-${typeof commentSubmissionStatus === 'string' ? commentSubmissionStatus : commentSubmissionStatus.type}`}>
                      {typeof commentSubmissionStatus === 'string' ? (
                        <>
                          {commentSubmissionStatus === 'submitting' && '⏳ Submitting comment...'}
                          {commentSubmissionStatus === 'success' && '✅ Comment submitted successfully!'}
                        </>
                      ) : (
                        <>
                          {commentSubmissionStatus.type === 'error' && `❌ ${commentSubmissionStatus.message}`}
                        </>
                      )}
                    </div>
                  )}
                  {!showMarkdownEditor ? (
                    <div className="comment-form-simple">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={canComment ? "Write a comment... (Click 'Advanced Editor' for markdown preview)" : "Comment form disabled - token permissions required"}
                        rows={3}
                        disabled={submittingComment || !canComment}
                      />
                      <div className="comment-form-actions">
                        <button
                          className="advanced-editor-btn"
                          onClick={() => setShowMarkdownEditor(true)}
                          disabled={submittingComment || !canComment}
                        >
                          📝 Advanced Editor
                        </button>
                        <button
                          className="submit-comment"
                          onClick={handleCommentSubmit}
                          disabled={!newComment.trim() || submittingComment || !canComment}
                        >
                          {submittingComment ? 'Submitting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="comment-form-advanced">
                      <div className="markdown-editor-container">
                        <MDEditor
                          value={newComment}
                          onChange={(val) => setNewComment(val || '')}
                          preview="edit"
                          height={300}
                          visibleDragBar={false}
                          data-color-mode="light"
                          hideToolbar={submittingComment || !canComment}
                        />
                      </div>
                      <div className="comment-form-actions">
                        <button
                          className="btn-secondary"
                          onClick={() => setShowMarkdownEditor(false)}
                          disabled={submittingComment || !canComment}
                        >
                          Simple Editor
                        </button>
                        <button
                          className="submit-comment"
                          onClick={handleCommentSubmit}
                          disabled={!newComment.trim() || submittingComment || !canComment}
                        >
                          {submittingComment ? 'Submitting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {prInfo[0].body && (
                <div className="pr-description">
                  <h4>Description</h4>
                  <div className="pr-body">
                    <div className="markdown-content">
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {sanitizeAndRenderMarkdown(expandedDescription ? prInfo[0].body : truncateDescription(prInfo[0].body))}
                      </ReactMarkdown>
                    </div>
                    {prInfo[0].body.split('\n').length > 6 && (
                      <button 
                        className="description-toggle"
                        onClick={handleDescriptionToggle}
                      >
                        {expandedDescription ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Workflow Status Section */}
              {branchInfo?.name && (
                <div className="workflow-status-wrapper">
                  <WorkflowStatus
                    workflowStatus={workflowStatus}
                    branchName={branchInfo.name}
                    onTriggerWorkflow={handleTriggerWorkflow}
                    onApproveWorkflow={handleApproveWorkflow}
                    isAuthenticated={githubService.isAuth()}
                    canTriggerWorkflows={canTriggerWorkflows}
                    canApproveWorkflows={canApproveWorkflows}
                    isLoading={workflowLoading}
                  />
                </div>
              )}

              {/* PR Actions Section */}
              {prInfo && prInfo.length > 0 && prInfo[0].state === 'open' && (
                <div className="pr-actions-wrapper">
                  <h4>🔀 Pull Request Actions</h4>
                  <div className="pr-actions-container">
                    <div className="pr-actions-info">
                      <span className="pr-actions-status">
                        PR #{prInfo[0].number} is ready for actions
                      </span>
                    </div>
                    <div className="pr-actions-buttons">
                      {githubService.isAuth() && canMergePR && (
                        <button
                          onClick={() => handleMergePR('litlfred', 'sgex', prInfo[0].number)}
                          disabled={isMergingPR}
                          className="pr-merge-btn"
                          title={`Merge PR #${prInfo[0].number}`}
                        >
                          {isMergingPR ? (
                            <>⏳ Merging...</>
                          ) : (
                            <>🔀 Merge PR</>
                          )}
                        </button>
                      )}
                      {!githubService.isAuth() && (
                        <span className="pr-actions-note">
                          🔒 Sign in to access PR actions
                        </span>
                      )}
                      {githubService.isAuth() && !canMergePR && (
                        <span className="pr-actions-note">
                          ⚠️ You don't have permission to merge this PR
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* GitHub Copilot Session Section */}
              {copilotSessionInfo && (
                <div className="copilot-session-wrapper">
                  <h4>🤖 GitHub Copilot Activity</h4>
                  {copilotSessionInfo.hasActiveCopilot ? (
                    <div className="copilot-session-active">
                      <div className="copilot-session-info">
                        <span className="copilot-status">✅ Active Copilot session detected</span>
                        <span className="copilot-activity">
                          Last activity: {formatDate(copilotSessionInfo.latestActivity)}
                        </span>
                        <span className="copilot-comments-count">
                          {copilotSessionInfo.commentsCount} copilot comment(s) found
                        </span>
                      </div>
                      <div className="copilot-session-actions">
                        <a 
                          href={copilotSessionInfo.sessionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="copilot-session-link"
                        >
                          🔗 View Agent Session
                        </a>
                        {copilotSessionInfo.commentUrl && (
                          <a 
                            href={copilotSessionInfo.commentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="copilot-comment-link"
                          >
                            💬 Latest Comment
                          </a>
                        )}
                        <button
                          className="copilot-session-toggle"
                          onClick={() => setShowCopilotSession(!showCopilotSession)}
                        >
                          {showCopilotSession ? '📝 Hide Session' : '👁️ Watch Session'}
                        </button>
                      </div>
                      {showCopilotSession && copilotSessionInfo.latestComment && (
                        <div className="copilot-session-modal">
                          <div className="copilot-session-header">
                            <strong>Latest Copilot Activity</strong>
                            <span className="copilot-comment-date">
                              {formatDate(copilotSessionInfo.latestComment.created_at)}
                            </span>
                          </div>
                          <div className="copilot-session-content">
                            <div className="copilot-comment-author">
                              <img 
                                src={copilotSessionInfo.latestComment.user.avatar_url} 
                                alt={copilotSessionInfo.latestComment.user.login}
                                className="copilot-avatar"
                              />
                              <a 
                                href={copilotSessionInfo.latestComment.user.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="copilot-username"
                              >
                                {copilotSessionInfo.latestComment.user.login}
                              </a>
                            </div>
                            <div className="copilot-comment-body">
                              <div className="markdown-content">
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{sanitizeAndRenderMarkdown(copilotSessionInfo.latestComment.body)}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="copilot-session-inactive">
                      <span className="copilot-status">⚪ No active Copilot session detected</span>
                      <span className="copilot-hint">
                        Start a conversation with @copilot to begin a session
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="comments-section">
                <h4>Recent Comments ({allComments.length > 0 ? `${comments.length}/${allComments.length}` : '0'})</h4>
                {commentsLoading ? (
                  <div className="loading">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="no-comments">No comments yet</div>
                ) : (
                  <>
                    <div className="comments-list">
                      {comments.map((comment) => {
                        const isExpanded = expandedComments.has(comment.id);
                        const shouldTruncate = comment.body && comment.body.length > 200;
                        const isNewComment = newlyAddedCommentId === comment.id;
                        const viewers = getCommentViewers(comment, comments);
                        
                        return (
                          <div key={comment.id} className={`comment ${isNewComment ? 'comment-new-glow' : ''}`}>
                            <div className="comment-header">
                              <img 
                                src={comment.user.avatar_url} 
                                alt={comment.user.login} 
                                className="comment-avatar"
                              />
                              <a 
                                href={comment.user.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="comment-author"
                              >
                                {comment.user.login}
                              </a>
                              <span className="comment-date">{formatDate(comment.created_at)}</span>
                              <span className="comment-type">{comment.type}</span>
                              
                              {/* Comment Viewer Badges */}
                              {viewers.length > 0 && (
                                <div className="comment-viewers">
                                  {viewers.map((viewer, index) => (
                                    <span 
                                      key={index}
                                      className={`viewer-badge ${viewer.toLowerCase().includes('copilot') ? 'viewer-badge-copilot' : 'viewer-badge-user'}`}
                                      title={`${viewer} is looking at this comment`}
                                    >
                                      {viewer.toLowerCase().includes('copilot') ? '👁️' : '👀'} {viewer}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="comment-body">
                              {shouldTruncate && !isExpanded ? (
                                <>
                                  <div className="comment-preview">
                                    <div className="markdown-content">
                                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{sanitizeAndRenderMarkdown(truncateComment(comment.body))}</ReactMarkdown>
                                    </div>
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
                                    <div className="markdown-content">
                                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{sanitizeAndRenderMarkdown(comment.body)}</ReactMarkdown>
                                    </div>
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
                    
                    {/* Load More Comments Button */}
                    {allComments.length > comments.length && (
                      <div className="comments-load-more">
                        <button
                          className="load-more-btn"
                          onClick={loadMoreComments}
                          disabled={commentsLoading}
                        >
                          {commentsLoading ? 'Loading...' : `Load More Comments (${allComments.length - comments.length} remaining)`}
                        </button>
                      </div>
                    )}
                  </>
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

          {/* Workflow Status Section for branch-only badges */}
          <div className="workflow-status-wrapper">
            <WorkflowStatus
              workflowStatus={workflowStatus}
              branchName={branchInfo.name}
              onTriggerWorkflow={handleTriggerWorkflow}
              onApproveWorkflow={handleApproveWorkflow}
              isAuthenticated={githubService.isAuth()}
              canTriggerWorkflows={canTriggerWorkflows}
              canApproveWorkflows={canApproveWorkflows}
              isLoading={workflowLoading}
            />
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
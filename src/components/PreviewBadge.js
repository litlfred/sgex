import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import githubService from '../services/githubService';
import githubActionsService from '../services/githubActionsService';
import WorkflowStatus from './WorkflowStatus';
import WorkflowDashboard from './WorkflowDashboard';
import { lazyLoadReactMarkdown, lazyLoadDOMPurify, lazyLoadRehypeRaw } from '../services/libraryLoaderService';
import repositoryConfig from '../config/repositoryConfig';
import './WorkflowStatus.css';
import './PreviewBadge.css';

// Lazy load MDEditor to improve initial page responsiveness
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

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
  // Always use WorkflowDashboard - removed simple view toggle
  const [showWorkflowView, setShowWorkflowView] = useState(false); // Default to discussion view
  const [newlyAddedCommentId, setNewlyAddedCommentId] = useState(null);
  const [copilotSessionInfo, setCopilotSessionInfo] = useState(null);
  const [showCopilotSession, setShowCopilotSession] = useState(false);
  const [isWatchingSession, setIsWatchingSession] = useState(false);
  const [watchSessionInterval, setWatchSessionInterval] = useState(null);
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);
  const [lastSessionCheck, setLastSessionCheck] = useState(null);
  const [sessionRefreshCount, setSessionRefreshCount] = useState(0);
  const [isRefreshingComments, setIsRefreshingComments] = useState(false);
  const [ReactMarkdown, setReactMarkdown] = useState(null);
  const [DOMPurify, setDOMPurify] = useState(null);
  const [rehypeRaw, setRehypeRaw] = useState(null);

  // Lazy load markdown and sanitization components
  useEffect(() => {
    const loadMarkdownComponents = async () => {
      try {
        const [markdown, domPurify, rehypeRawPlugin] = await Promise.all([
          lazyLoadReactMarkdown(),
          lazyLoadDOMPurify(),
          lazyLoadRehypeRaw()
        ]);
        setReactMarkdown(() => markdown);
        setDOMPurify(domPurify);
        setRehypeRaw(() => rehypeRawPlugin);
      } catch (error) {
        console.error('Failed to load markdown components:', error);
      }
    };

    loadMarkdownComponents();
  }, []);
  const [canComment, setCanComment] = useState(true);
  const [canTriggerWorkflows, setCanTriggerWorkflows] = useState(false);
  const [canApproveWorkflows, setCanApproveWorkflows] = useState(false);
  const [canMergePR, setCanMergePR] = useState(false);
  const [canManagePR, setCanManagePR] = useState(false); // For draft/ready status changes
  const [isMergingPR, setIsMergingPR] = useState(false);
  const [canReviewPR, setCanReviewPR] = useState(false);
  const [isApprovingPR, setIsApprovingPR] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [isMarkingReadyForReview, setIsMarkingReadyForReview] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null); // 'success', 'error'
  const [approvalMessage, setApprovalMessage] = useState('');
  const [commentsPage, setCommentsPage] = useState(1);
  const [allComments, setAllComments] = useState([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [displayedCommentsCount, setDisplayedCommentsCount] = useState(5);
  const [showStatusUpdates, setShowStatusUpdates] = useState(true);
  const expandedRef = useRef(null);
  const commentRefreshIntervalRef = useRef(null);
  const workflowRefreshIntervalRef = useRef(null);

  // Custom markdown components to make links open in new tabs
  const markdownComponents = {
    a: ({ href, children, ...props }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  };

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
      // Reset comment pagination when collapsed
      setCommentsPage(1);
      setDisplayedCommentsCount(5);
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
      const owner = repositoryConfig.getOwner();
      const repo = 'sgex';

      const prs = await githubService.getPullRequestsForBranch(owner, repo, branchName);
      
      return prs;

    } catch (error) {
      console.debug('Failed to fetch PR info:', error);
      return [];
    }
  };

  const fetchCommentsForPR = async (owner, repo, prNumber, page = 1, append = false, showLoading = true) => {
    try {
      if (showLoading) {
        setCommentsLoading(true);
      }
      
      const perPage = 30; // GitHub default per page
      
      // Fetch both review comments and issue comments with pagination
      const [reviewComments, issueComments, timelineEvents] = await Promise.all([
        githubService.getPullRequestComments(owner, repo, prNumber, page, perPage).catch(() => []),
        githubService.getPullRequestIssueComments(owner, repo, prNumber, page, perPage).catch(() => []),
        showStatusUpdates ? githubService.getPullRequestTimeline(owner, repo, prNumber, page, perPage).catch(() => []) : Promise.resolve([])
      ]);

      // Combine and sort comments by date, mark the type
      const newComments = [
        ...reviewComments.map(comment => ({ ...comment, type: 'review' })),
        ...issueComments.map(comment => ({ ...comment, type: 'issue' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Debug: Log comment details to understand what's being fetched
      console.debug('Comments fetched for PR discussion:', {
        refreshType: append ? 'append' : 'replace',
        showLoading,
        reviewCommentsCount: reviewComments.length,
        issueCommentsCount: issueComments.length,
        totalComments: newComments.length,
        commentDetails: newComments.map(c => ({
          id: c.id,
          author: c.user?.login || 'unknown',
          type: c.type,
          created: c.created_at,
          bodyPreview: c.body?.substring(0, 50) + '...' || 'no body'
        })),
        copilotComments: newComments.filter(c => 
          c.user?.login === 'copilot' || 
          c.user?.login?.includes('copilot') ||
          c.user?.login === 'github-actions[bot]' ||
          c.user?.login === 'copilot[bot]' ||
          (c.user?.type === 'Bot' && c.user?.login?.toLowerCase().includes('copilot')) ||
          c.body?.toLowerCase().includes('copilot')
        ).map(c => ({
          id: c.id,
          author: c.user?.login,
          type: c.type,
          bodyPreview: c.body?.substring(0, 100) + '...'
        })),
        allUsernames: [...new Set(newComments.map(c => c.user?.login).filter(Boolean))]
      });

      // Process timeline events for status updates
      const relevantTimelineEvents = timelineEvents
        .filter(event => ['committed', 'reviewed', 'merged', 'closed', 'reopened', 'labeled', 'unlabeled', 'head_ref_force_pushed', 'ready_for_review', 'convert_to_draft'].includes(event.event))
        .map(event => {
          const user = event.actor || event.author || { login: 'github', avatar_url: 'https://github.com/github.png' };
          
          // Ensure user object has the required properties
          const safeUser = {
            login: user.login || 'github',
            avatar_url: user.avatar_url || 'https://github.com/github.png',
            ...user
          };
          
          return {
            ...event,
            type: 'timeline',
            created_at: event.created_at || event.submitted_at,
            user: safeUser,
            body: formatTimelineEvent(event)
          };
        });

      if (append) {
        // Append to existing comments (for load more)
        const existingIds = new Set(allComments.map(c => c.id));
        const uniqueNewComments = newComments.filter(c => !existingIds.has(c.id));
        const uniqueNewEvents = relevantTimelineEvents.filter(e => !existingIds.has(e.id));
        
        const allNewItems = [...uniqueNewComments, ...uniqueNewEvents]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        const updatedAllComments = [...allComments, ...allNewItems];
        setAllComments(updatedAllComments);
        
        // When loading more, increase the displayed count to show the new comments
        const newDisplayCount = Math.min(updatedAllComments.length, displayedCommentsCount + perPage);
        setDisplayedCommentsCount(newDisplayCount);
        setComments(updatedAllComments.slice(0, newDisplayCount));
      } else {
        // Replace comments (for initial load or refresh)
        const allItems = [...newComments, ...relevantTimelineEvents]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setAllComments(allItems);
        const initialDisplayCount = Math.min(5, allItems.length);
        setDisplayedCommentsCount(initialDisplayCount);
        setComments(allItems.slice(0, initialDisplayCount));
      }
      
      // Check if there are more comments to load
      setHasMoreComments(newComments.length === perPage);
      
      return newComments;
    } catch (error) {
      console.debug('Failed to fetch comments:', error);
      return [];
    } finally {
      if (showLoading) {
        setCommentsLoading(false);
      }
    }
  };

  // Format timeline events into readable status updates
  const formatTimelineEvent = (event) => {
    switch (event.event) {
      case 'committed':
        return `📦 Pushed ${event.sha ? event.sha.substring(0, 7) : 'commit'}: ${event.message || 'No commit message'}`;
      case 'reviewed':
        const reviewState = event.state && typeof event.state === 'string' ? event.state.toLowerCase() : 'reviewed';
        const reviewIcon = reviewState === 'approved' ? '✅' : reviewState === 'changes_requested' ? '❌' : '💬';
        return `${reviewIcon} ${reviewState === 'approved' ? 'Approved' : reviewState === 'changes_requested' ? 'Requested changes' : 'Reviewed'} this pull request`;
      case 'merged':
        return `🔀 Merged this pull request`;
      case 'closed':
        return `❌ Closed this pull request`;
      case 'reopened':
        return `🔄 Reopened this pull request`;
      case 'labeled':
        return `🏷️ Added label: ${event.label?.name || 'unknown'}`;
      case 'unlabeled':
        return `🏷️ Removed label: ${event.label?.name || 'unknown'}`;
      case 'head_ref_force_pushed':
        return `🔄 Force-pushed to ${event.ref || 'branch'}`;
      case 'ready_for_review':
        return `✅ Marked as ready for review`;
      case 'convert_to_draft':
        return `📝 Converted to draft`;
      default:
        return `📋 ${event.event?.replace(/_/g, ' ') || 'unknown event'}`;
    }
  };

  const getCommentViewers = (comment, allComments) => {
    const viewers = new Set();
    
    // Extract mentions from the comment body
    if (comment.body && typeof comment.body === 'string') {
      const mentionMatches = comment.body.match(/@(\w+)/g);
      if (mentionMatches) {
        mentionMatches.forEach(mention => {
          const username = mention.substring(1); // Remove @
          if (username && typeof username === 'string') {
            viewers.add(username);
          }
        });
      }
    }
    
    // Check if any subsequent comments reference this comment or author
    const laterComments = allComments.filter(c => 
      c && c.created_at && comment && comment.created_at &&
      new Date(c.created_at) > new Date(comment.created_at)
    );
    
    laterComments.forEach(laterComment => {
      // Check if later comment mentions this comment's author
      if (laterComment.body && typeof laterComment.body === 'string' && 
          comment.user && comment.user.login && typeof comment.user.login === 'string' &&
          laterComment.user && laterComment.user.login && typeof laterComment.user.login === 'string') {
        if (laterComment.body.toLowerCase().includes(`@${comment.user.login.toLowerCase()}`)) {
          viewers.add(laterComment.user.login);
        }
      }
      
      // Check if later comment references this comment content (partial match)
      if (comment.body && typeof comment.body === 'string' &&
          laterComment.body && typeof laterComment.body === 'string' && 
          laterComment.user && laterComment.user.login && typeof laterComment.user.login === 'string') {
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
      }
    });
    
    // Add copilot if mentioned anywhere in the thread related to this comment
    // Enhanced detection for various copilot username formats
    if ((comment.body && typeof comment.body === 'string' && comment.body.toLowerCase().includes('copilot')) || 
        (comment.user && comment.user.login && typeof comment.user.login === 'string' && 
         (comment.user.login.toLowerCase().includes('copilot') || 
          comment.user.login === 'github-actions[bot]' ||
          comment.user.login === 'copilot[bot]'))) {
      viewers.add('copilot');
    }
    
    // Check if copilot has engaged in later comments
    const copilotEngaged = laterComments.some(c => 
      (c.user && c.user.login && typeof c.user.login === 'string' && 
       (c.user.login.toLowerCase().includes('copilot') ||
        c.user.login === 'github-actions[bot]' ||
        c.user.login === 'copilot[bot]')) ||
      (c.body && typeof c.body === 'string' && comment.user && comment.user.login && typeof comment.user.login === 'string' && 
       c.body.toLowerCase().includes(`@${comment.user.login.toLowerCase()}`))
    );
    if (copilotEngaged) {
      viewers.add('copilot');
    }
    
    // Remove the comment author from viewers (don't show badge for self)
    if (comment.user && comment.user.login && typeof comment.user.login === 'string') {
      viewers.delete(comment.user.login);
    }
    
    return Array.from(viewers);
  };

  // Handle workflow dashboard actions
  const handleWorkflowDashboardAction = (actionData) => {
    console.debug('Workflow dashboard action:', actionData);
    
    if (actionData.type === 'workflow_triggered' || actionData.type === 'workflow_approved') {
      // Show success message for workflow actions
      setApprovalStatus('success');
      if (actionData.type === 'workflow_triggered') {
        setApprovalMessage('Workflow triggered successfully! Check the dashboard for real-time updates.');
      } else {
        setApprovalMessage('Workflow approved successfully! It should start running now.');
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setApprovalStatus(null);
        setApprovalMessage('');
      }, 5000);
    }
  };

  // Handle watch session toggle with auto-refresh
  const handleWatchSessionToggle = () => {
    if (isWatchingSession) {
      // Stop watching - clear interval and hide session
      if (watchSessionInterval) {
        clearInterval(watchSessionInterval);
        setWatchSessionInterval(null);
      }
      setIsWatchingSession(false);
      setShowCopilotSession(false);
      setIsRefreshingSession(false);
      setSessionRefreshCount(0);
    } else {
      // Start watching - show session and set up auto-refresh
      setIsWatchingSession(true);
      setShowCopilotSession(true);
      setSessionRefreshCount(0);
      
      // Perform initial refresh
      if (prInfo && prInfo.length > 0) {
        performSessionRefresh(repositoryConfig.getOwner(), repositoryConfig.getName(), prInfo[0].number);
      }
      
      // Set up auto-refresh every 10 seconds
      const interval = setInterval(async () => {
        if (prInfo && prInfo.length > 0) {
          await performSessionRefresh(repositoryConfig.getOwner(), repositoryConfig.getName(), prInfo[0].number);
        }
      }, 10000); // 10 seconds
      
      setWatchSessionInterval(interval);
    }
  };

  // Helper function to perform session refresh with visual feedback
  const performSessionRefresh = async (owner, repo, prNumber) => {
    try {
      setIsRefreshingSession(true);
      setSessionRefreshCount(prev => prev + 1);
      
      // Refresh copilot session info
      const sessionInfo = await fetchCopilotSessionInfo(owner, repo, prNumber);
      setCopilotSessionInfo(sessionInfo);
      setLastSessionCheck(new Date());
      
      // Brief visual feedback that refresh completed
      setTimeout(() => {
        setIsRefreshingSession(false);
      }, 1000); // Show "refreshing" state for 1 second
      
    } catch (error) {
      console.debug('Failed to refresh copilot session info:', error);
      setIsRefreshingSession(false);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (watchSessionInterval) {
        clearInterval(watchSessionInterval);
      }
    };
  }, [watchSessionInterval]);

  const fetchWorkflowStatus = async (branchName) => {
    try {
      setWorkflowLoading(true);
      
      // Initialize GitHub Actions service with current token if available
      if (githubService.isAuth() && githubService.token) {
        githubActionsService.setToken(githubService.token);
      }
      
      // Always use WorkflowDashboard which handles its own state
      setWorkflowLoading(false);
      return;
      
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
      // Enhanced detection for various copilot username formats
      const copilotComments = comments.filter(comment => 
        comment.user.login === 'copilot' || 
        comment.user.login.includes('copilot') ||
        comment.user.login === 'github-actions[bot]' ||
        comment.user.login === 'copilot[bot]' ||
        comment.user.type === 'Bot' && comment.user.login.toLowerCase().includes('copilot') ||
        comment.body.includes('@copilot') ||
        comment.body.includes('copilot session') ||
        comment.body.includes('GitHub Copilot') ||
        comment.body.includes('I\'ve') && comment.body.includes('commit') // Common copilot response pattern
      );

      console.debug('Copilot session detection:', {
        totalComments: comments.length,
        copilotComments: copilotComments.length,
        copilotCommentsInfo: copilotComments.map(c => ({
          id: c.id,
          author: c.user.login,
          created: c.created_at,
          bodyPreview: c.body.substring(0, 100) + '...'
        }))
      });

      if (copilotComments.length > 0) {
        // Sort copilot comments by date (newest first) to ensure we get the latest activity
        const sortedCopilotComments = copilotComments.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        // Try to find the newest agent session URL by checking ALL comments, not just copilot ones
        let agentSessionUrl = null;
        let latestSessionDate = null;
        let sessionComment = null;
        
        // Enhanced session URL pattern to capture session IDs
        const sessionUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+\/agent-sessions\/([a-f0-9-]+)/gi;
        
        // Check ALL comments for session URLs, sorted by date (newest first)
        const allCommentsSorted = comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        console.debug('Searching for session URLs in all comments:', allCommentsSorted.length);
        
        for (const comment of allCommentsSorted) {
          const matches = [...comment.body.matchAll(sessionUrlPattern)];
          if (matches.length > 0) {
            console.debug('Found session URLs in comment:', {
              commentId: comment.id,
              author: comment.user.login,
              created: comment.created_at,
              urls: matches.map(m => m[0])
            });
            
            // Take the last (most recent) session URL from the most recent comment
            const sessionUrl = matches[matches.length - 1][0];
            const commentDate = new Date(comment.created_at);
            
            // Use the session URL from the newest comment with session URLs
            if (!agentSessionUrl || commentDate > latestSessionDate) {
              agentSessionUrl = sessionUrl;
              latestSessionDate = commentDate;
              sessionComment = comment;
              console.debug('Updated session URL to newest:', {
                url: agentSessionUrl,
                commentDate: commentDate.toISOString(),
                commentId: comment.id
              });
            }
          }
        }
        
        // If no explicit agent session URL found, construct the likely URL
        if (!agentSessionUrl) {
          agentSessionUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}/agent-sessions`;
          console.debug('No session URL found, using default:', agentSessionUrl);
        } else {
          console.debug('Final session URL selected:', agentSessionUrl);
        }
        
        // Get the most recent copilot activity for display
        const latestCopilotComment = sortedCopilotComments[0];
        
        // Filter to get only copilot's actual responses (not mentions)
        // Enhanced detection for various copilot username formats
        const copilotResponses = sortedCopilotComments.filter(comment => 
          comment.user.login === 'copilot' || 
          comment.user.login.includes('copilot') ||
          comment.user.login === 'github-actions[bot]' ||
          comment.user.login === 'copilot[bot]' ||
          (comment.user.type === 'Bot' && comment.user.login.toLowerCase().includes('copilot'))
        );
        
        return {
          hasActiveCopilot: true,
          latestActivity: latestCopilotComment.created_at,
          sessionUrl: agentSessionUrl,
          commentUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}#issuecomment-${latestCopilotComment.id}`,
          commentsCount: copilotComments.length,
          latestComment: latestCopilotComment,
          copilotResponses: copilotResponses, // Add filtered copilot responses
          sessionComment: sessionComment // Add the comment that contained the session URL
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
        // Refresh workflow status after triggering and set up intensive monitoring
        setTimeout(() => {
          fetchWorkflowStatus(branchName);
          setupIntensiveWorkflowRefresh(branchName);
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
        // Immediately refresh workflow status after approval
        setTimeout(() => {
          if (branchInfo?.name) {
            fetchWorkflowStatus(branchInfo.name);
          }
        }, 1000); // Reduced delay to 1 second for faster response
        
        // Set up intensive monitoring for faster updates after approval
        if (branchInfo?.name) {
          setupIntensiveWorkflowRefresh(branchInfo.name);
        }
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
      
      // Provide user-friendly error messages based on common failure reasons
      let userMessage = 'Failed to merge PR';
      if (error.status === 403) {
        userMessage = 'Permission denied: Your Personal Access Token may not have sufficient permissions to merge PRs';
      } else if (error.status === 404) {
        userMessage = 'PR not found or repository access denied';
      } else if (error.status === 405) {
        userMessage = 'Merge not allowed: Check branch protection rules or PR requirements';
      } else if (error.status === 409) {
        userMessage = 'Merge conflict: PR cannot be automatically merged';
      }
      
      // You could show this message to the user in a toast/notification
      console.warn('User guidance:', userMessage);
      
      return false;
    } finally {
      setIsMergingPR(false);
    }
  };

  const handleApprovePR = async (owner, repo, prNumber) => {
    if (!githubService.isAuth() || isApprovingPR || !canReviewPR) {
      return false;
    }

    setIsApprovingPR(true);
    setApprovalStatus(null); // Clear previous status
    setApprovalMessage('');
    
    try {
      // Add debugging info
      console.log('Attempting to approve PR:', { owner, repo, prNumber, comment: newComment.trim() });
      
      // Use the main comment from the top comment form for the review
      const result = await githubService.approvePullRequest(owner, repo, prNumber, newComment.trim());
      
      console.log('PR approval result:', result);
      
      // Show success message
      setApprovalStatus('success');
      setApprovalMessage('PR approved successfully! This should trigger any pending workflows.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setApprovalStatus(null);
        setApprovalMessage('');
      }, 5000);
      
      // Clear the comment after successful approval if it was used for the review
      if (newComment.trim()) {
        setNewComment('');
      }
      
      // Refresh the PR info to reflect the new review status
      setTimeout(async () => {
        try {
          const refreshedPRs = await fetchPRsForBranch(branchInfo?.name);
          if (refreshedPRs && refreshedPRs.length > 0) {
            setPrInfo(refreshedPRs);
          }
        } catch (error) {
          console.debug('Could not refresh PR status after approval:', error);
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to approve PR:', error);
      console.log('Error details:', {
        status: error.status,
        response: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to approve PR';
      if (error.status === 403) {
        userMessage = 'Permission denied: You may not have permission to review this PR';
      } else if (error.status === 404) {
        userMessage = 'PR not found or repository access denied';
      } else if (error.status === 422) {
        userMessage = 'Cannot review this PR - it may be from the same user or have other restrictions';
      } else if (error.message) {
        userMessage = `Failed to approve PR: ${error.message}`;
      }
      
      // Show error message to user
      setApprovalStatus('error');
      setApprovalMessage(userMessage);
      
      // Clear error message after 8 seconds
      setTimeout(() => {
        setApprovalStatus(null);
        setApprovalMessage('');
      }, 8000);
      
      console.warn('User guidance:', userMessage);
      return false;
    } finally {
      setIsApprovingPR(false);
    }
  };

  const handleRequestChanges = async (owner, repo, prNumber) => {
    if (!githubService.isAuth() || isRequestingChanges || !canReviewPR) {
      return false;
    }

    if (!newComment || !newComment.trim()) {
      alert('Please enter a comment explaining what changes are needed.');
      return false;
    }

    setIsRequestingChanges(true);
    try {
      const result = await githubService.requestPullRequestChanges(owner, repo, prNumber, newComment.trim());
      
      console.debug('Changes requested successfully:', result);
      
      // Clear the comment after successful review
      setNewComment('');
      
      // Refresh the PR info to reflect the new review status
      setTimeout(async () => {
        try {
          const refreshedPRs = await fetchPRsForBranch(branchInfo?.name);
          if (refreshedPRs && refreshedPRs.length > 0) {
            setPrInfo(refreshedPRs);
          }
        } catch (error) {
          console.debug('Could not refresh PR status after requesting changes:', error);
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to request changes:', error);
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to request changes';
      if (error.status === 403) {
        userMessage = 'Permission denied: You may not have permission to review this PR';
      } else if (error.status === 404) {
        userMessage = 'PR not found or repository access denied';
      } else if (error.status === 422) {
        userMessage = 'Cannot review this PR - it may be from the same user or have other restrictions';
      }
      
      console.warn('User guidance:', userMessage);
      return false;
    } finally {
      setIsRequestingChanges(false);
    }
  };

  const handleMarkReadyForReview = async (owner, repo, prNumber) => {
    if (!githubService.isAuth() || isMarkingReadyForReview || !canMergePR) {
      return false;
    }

    setIsMarkingReadyForReview(true);
    setApprovalStatus(null); // Clear previous status
    setApprovalMessage('');
    
    try {
      const result = await githubService.markPullRequestReadyForReview(owner, repo, prNumber);
      
      console.debug('PR marked as ready for review successfully:', result);
      
      // Show success message
      setApprovalStatus('success');
      setApprovalMessage(`PR #${prNumber} is now ready for review!`);
      
      // Refresh the PR info to reflect the new draft status
      setTimeout(async () => {
        try {
          const refreshedPRs = await fetchPRsForBranch(branchInfo?.name);
          if (refreshedPRs && refreshedPRs.length > 0) {
            setPrInfo(refreshedPRs);
          }
        } catch (error) {
          console.debug('Could not refresh PR status after marking ready for review:', error);
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to mark PR as ready for review:', error);
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to mark PR as ready for review';
      if (error.status === 403) {
        userMessage = 'Permission denied: You may not have permission to update this PR';
      } else if (error.status === 404) {
        userMessage = 'PR not found or repository access denied';
      } else if (error.status === 422) {
        userMessage = 'PR cannot be marked as ready for review - it may already be ready or have other restrictions';
      } else if (error.message) {
        userMessage = error.message;
      }
      
      setApprovalStatus('error');
      setApprovalMessage(userMessage);
      
      return false;
    } finally {
      setIsMarkingReadyForReview(false);
    }
  };

  const checkPermissions = async (owner, repo) => {
    if (!githubService.isAuth()) {
      setCanComment(false);
      setCanTriggerWorkflows(false);
      setCanApproveWorkflows(false);
      setCanMergePR(false);
      setCanReviewPR(false);
      setCanManagePR(false);
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

      // Check merge and review permissions for the first PR if available
      if (prInfo && prInfo.length > 0) {
        const [mergePermissions, reviewPermissions, writePermissions] = await Promise.all([
          githubService.checkPullRequestMergePermissions(owner, repo, prInfo[0].number),
          githubService.checkPullRequestReviewPermissions(owner, repo, prInfo[0].number),
          githubService.checkRepositoryWritePermissions(owner, repo) // For managing PR draft status
        ]);
        setCanMergePR(mergePermissions);
        setCanReviewPR(reviewPermissions);
        setCanManagePR(writePermissions); // Repository write access for draft/ready status changes
      } else {
        setCanMergePR(false);
        setCanReviewPR(false);
        setCanManagePR(false);
      }
    } catch (error) {
      console.debug('Error checking permissions:', error);
      setCanComment(false);
      setCanTriggerWorkflows(false);
      setCanApproveWorkflows(false);
      setCanMergePR(false);
      setCanReviewPR(false);
      setCanManagePR(false);
    }
  };

  const setupCommentAutoRefresh = (owner, repo, prNumber) => {
    // Clear any existing interval
    if (commentRefreshIntervalRef.current) {
      clearInterval(commentRefreshIntervalRef.current);
    }

    // Set up new interval to refresh comments every 5 seconds
    commentRefreshIntervalRef.current = setInterval(async () => {
      try {
        const latestComments = await fetchCommentsForPR(owner, repo, prNumber, 1, false, false);
        
        // Check if there are new comments compared to what we have
        if (latestComments.length > 0 && comments.length > 0) {
          const latestId = latestComments[0].id;
          const currentLatestId = comments[0].id;
          
          if (latestId !== currentLatestId) {
            console.debug('New comments detected during auto-refresh');
            // Don't reset the page, just refresh the current view
          }
        }
      } catch (error) {
        console.debug('Failed to auto-refresh comments:', error);
      }
    }, 5000); // 5 seconds
  };

  const handleManualRefreshComments = async () => {
    if (!prInfo || prInfo.length === 0 || isRefreshingComments) return;
    
    setIsRefreshingComments(true);
    try {
      const owner = repositoryConfig.getOwner();
      const repo = 'sgex';
      const pr = prInfo[0];
      
      console.debug('Manual refresh of comments requested');
      await fetchCommentsForPR(owner, repo, pr.number, 1, false, true);
      
      // Brief success feedback
      setTimeout(() => setIsRefreshingComments(false), 1000);
    } catch (error) {
      console.error('Failed to manually refresh comments:', error);
      setIsRefreshingComments(false);
    }
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

  const setupIntensiveWorkflowRefresh = (branchName) => {
    // Clear any existing interval
    if (workflowRefreshIntervalRef.current) {
      clearInterval(workflowRefreshIntervalRef.current);
    }

    let refreshCount = 0;
    const maxIntensiveRefreshes = 6; // 6 refreshes × 5 seconds = 30 seconds of intensive monitoring

    // Set up intensive refresh for 30 seconds after workflow actions
    workflowRefreshIntervalRef.current = setInterval(async () => {
      try {
        const previousStatus = workflowStatus?.status;
        await fetchWorkflowStatus(branchName);
        
        refreshCount++;
        
        // Log status changes for debugging
        if (workflowStatus?.status && workflowStatus.status !== previousStatus) {
          console.debug(`Workflow status changed from ${previousStatus} to ${workflowStatus.status}`);
        }
        
        // After intensive monitoring period, switch back to normal refresh rate
        if (refreshCount >= maxIntensiveRefreshes) {
          setupWorkflowAutoRefresh(branchName);
        }
      } catch (error) {
        console.debug('Failed to auto-refresh workflow status:', error);
      }
    }, 5000); // 5 seconds for intensive monitoring
  };

  const loadMoreComments = async () => {
    if (!prInfo || prInfo.length === 0 || commentsLoading) return;
    
    const owner = repositoryConfig.getOwner();
    const repo = 'sgex';
    const pr = prInfo[0];
    
    // If we have more comments already loaded, just show more of them
    if (displayedCommentsCount < allComments.length) {
      const newDisplayCount = Math.min(allComments.length, displayedCommentsCount + 5);
      setDisplayedCommentsCount(newDisplayCount);
      setComments(allComments.slice(0, newDisplayCount));
      return;
    }
    
    // If we've shown all loaded comments and there might be more on the server, fetch more
    if (hasMoreComments) {
      const nextPage = commentsPage + 1;
      setCommentsPage(nextPage);
      await fetchCommentsForPR(owner, repo, pr.number, nextPage, true);
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
    if (!newComment.trim() || !githubService.isAuth() || submittingComment || !canComment) return;
    
    try {
      setSubmittingComment(true);
      setCommentSubmissionStatus('submitting');
      const owner = repositoryConfig.getOwner();
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
          
          // Refresh comments after successful submission - multiple attempts for reliability
          await fetchCommentsForPR(owner, repo, pr.number, 1, false, true);
          
          // Mark the newly added comment for glow effect
          if (submittedComment && submittedComment.id) {
            setNewlyAddedCommentId(submittedComment.id);
            // Remove glow effect after 3 seconds
            setTimeout(() => setNewlyAddedCommentId(null), 3000);
          }
          
          setNewComment('');
          setShowMarkdownEditor(false); // Close markdown editor after successful submission
          
          // Additional refresh after a short delay to ensure GitHub API consistency
          setTimeout(async () => {
            try {
              await fetchCommentsForPR(owner, repo, pr.number, 1, false, false);
              console.debug('Secondary comment refresh completed after comment submission');
            } catch (error) {
              console.debug('Secondary comment refresh failed:', error);
            }
          }, 2000); // 2 second delay
          
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

  const convertGitHubNotationToLinks = (content) => {
    if (!content || typeof content !== 'string') return content || '';
    
    // Get current repository context
    const owner = repositoryConfig.getOwner();
    const repo = 'sgex';
    const baseUrl = `https://github.com/${owner}/${repo}`;
    
    let processedContent = content;
    
    // Convert cross-repository references first (org/repo#123)
    processedContent = processedContent.replace(
      /\b([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)#(\d+)\b/g,
      (match, org, repository, number) => `[${org}/${repository}#${number}](https://github.com/${org}/${repository}/issues/${number})`
    );
    
    // Convert issue/PR references with action words (Fixes #123, Closes #456, etc.)
    processedContent = processedContent.replace(
      /\b(Fixes?|Closes?|Resolves?)\s+#(\d+)\b/gi,
      (match, action, number) => `${action} [#${number}](${baseUrl}/issues/${number})`
    );
    
    // Convert standalone issue/PR references (#123)
    // Avoid converting if already part of a markdown link or cross-repo reference
    processedContent = processedContent.replace(
      /#(\d+)\b/g,
      (match, number, offset, string) => {
        // Don't convert if it's already part of a markdown link
        const beforeMatch = string.substring(Math.max(0, offset - 20), offset);
        const afterMatch = string.substring(offset, offset + match.length + 10);
        
        // Skip if inside a markdown link
        if (beforeMatch.includes('[') && !beforeMatch.includes(']')) {
          return match;
        }
        
        // Skip if it's part of a cross-repo reference or already a link
        if (beforeMatch.includes('/') || afterMatch.includes('](')) {
          return match;
        }
        
        return `[#${number}](${baseUrl}/issues/${number})`;
      }
    );
    
    // Convert user mentions (@username)
    processedContent = processedContent.replace(
      /@([a-zA-Z0-9_-]+)/g,
      (match, username, offset, string) => {
        // Don't convert if it's already part of a markdown link
        const beforeMatch = string.substring(Math.max(0, offset - 10), offset);
        if (beforeMatch.includes('[') && !beforeMatch.includes(']')) {
          return match; // Skip if inside a markdown link
        }
        return `[@${username}](https://github.com/${username})`;
      }
    );
    
    // Convert commit SHAs (7+ hex characters)
    processedContent = processedContent.replace(
      /\b([a-f0-9]{7,40})\b/gi,
      (match, sha) => {
        // Only convert if it looks like a commit SHA (all lowercase hex)
        if (/^[a-f0-9]+$/i.test(sha) && sha.length >= 7) {
          return `[\`${sha.substring(0, 7)}\`](${baseUrl}/commit/${sha})`;
        }
        return match;
      }
    );
    
    return processedContent;
  };

  const processMarkdownContent = (content) => {
    if (!content || typeof content !== 'string') return content || '';
    
    // Convert GitHub notation to markdown links
    // ReactMarkdown will handle the safe conversion from markdown to HTML
    return convertGitHubNotationToLinks(content);
  };

  const convertGitHubNotationToHtml = (content) => {
    if (!content || typeof content !== 'string') return content || '';
    
    // Get current repository context
    const owner = repositoryConfig.getOwner();
    const repo = 'sgex';
    const baseUrl = `https://github.com/${owner}/${repo}`;
    
    let processedContent = content;
    
    // Convert cross-repository references first (org/repo#123)
    processedContent = processedContent.replace(
      /\b([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)#(\d+)\b/g,
      (match, org, repository, number) => `<a href="https://github.com/${org}/${repository}/issues/${number}" target="_blank" rel="noopener noreferrer">${org}/${repository}#${number}</a>`
    );
    
    // Convert issue/PR references with action words (Fixes #123, Closes #456, etc.)
    processedContent = processedContent.replace(
      /\b(Fixes?|Closes?|Resolves?)\s+#(\d+)\b/gi,
      (match, action, number) => `${action} <a href="${baseUrl}/issues/${number}" target="_blank" rel="noopener noreferrer">#${number}</a>`
    );
    
    // Convert standalone issue/PR references (#123)
    // Avoid converting if already part of an HTML link or cross-repo reference
    processedContent = processedContent.replace(
      /#(\d+)\b/g,
      (match, number, offset, string) => {
        // Don't convert if it's already part of an HTML link
        const beforeMatch = string.substring(Math.max(0, offset - 20), offset);
        const afterMatch = string.substring(offset, offset + match.length + 10);
        
        // Skip if inside an HTML link
        if (beforeMatch.includes('<a ') && !beforeMatch.includes('</a>')) {
          return match;
        }
        
        // Skip if it's part of a cross-repo reference or already a link
        if (beforeMatch.includes('/') || afterMatch.includes('</a>')) {
          return match;
        }
        
        return `<a href="${baseUrl}/issues/${number}" target="_blank" rel="noopener noreferrer">#${number}</a>`;
      }
    );
    
    // Convert user mentions (@username)
    processedContent = processedContent.replace(
      /@([a-zA-Z0-9_-]+)/g,
      (match, username, offset, string) => {
        // Don't convert if it's already part of an HTML link
        const beforeMatch = string.substring(Math.max(0, offset - 10), offset);
        if (beforeMatch.includes('<a ') && !beforeMatch.includes('</a>')) {
          return match; // Skip if inside an HTML link
        }
        return `<a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer">@${username}</a>`;
      }
    );
    
    // Convert commit SHAs (7+ hex characters)
    processedContent = processedContent.replace(
      /\b([a-f0-9]{7,40})\b/gi,
      (match, sha) => {
        // Only convert if it looks like a commit SHA (all lowercase hex)
        if (/^[a-f0-9]+$/i.test(sha) && sha.length >= 7) {
          return `<a href="${baseUrl}/commit/${sha}" target="_blank" rel="noopener noreferrer"><code>${sha.substring(0, 7)}</code></a>`;
        }
        return match;
      }
    );
    
    return processedContent;
  };

  const sanitizeHtmlContent = (content) => {
    if (!content || !DOMPurify || typeof content !== 'string') return content || '';
    
    // Check if DOMPurify has the sanitize method
    if (typeof DOMPurify.sanitize !== 'function') {
      console.warn('DOMPurify.sanitize is not available, returning unsanitized content');
      return content;
    }
    
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
      const owner = repositoryConfig.getOwner();
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
          setIsRefreshingSession(true);
          const copilotInfo = await fetchCopilotSessionInfo(owner, repo, pr.number);
          setCopilotSessionInfo(copilotInfo);
          setLastSessionCheck(new Date());
          setTimeout(() => setIsRefreshingSession(false), 500); // Brief feedback
        } catch (error) {
          console.debug('Could not fetch copilot session info:', error);
          setIsRefreshingSession(false);
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
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleBadgeClick(pr, event);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={isExpanded ? `View PR: ${pr.title}` : `Expand for comments: ${pr.title}`}
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

              {/* Status notification for closed/merged PRs */}
              {prInfo[0].state !== 'open' && (
                <div className={`pr-status-notification pr-status-${prInfo[0].state}`}>
                  <div className="status-icon">
                    {prInfo[0].state === 'closed' && '❌'}
                    {prInfo[0].state === 'merged' && '🔀'}
                  </div>
                  <div className="status-message">
                    <strong>
                      {prInfo[0].state === 'closed' && 'This pull request is closed'}
                      {prInfo[0].state === 'merged' && 'This pull request was merged'}
                    </strong>
                    <div className="status-details">
                      {prInfo[0].state === 'closed' && 'The pull request has been closed without merging.'}
                      {prInfo[0].state === 'merged' && 'The changes have been successfully merged into the target branch.'}
                    </div>
                  </div>
                </div>
              )}

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
                        <Suspense fallback={<div className="loading-spinner">Loading editor...</div>}>
                          <MDEditor
                            value={newComment}
                            onChange={(val) => setNewComment(val || '')}
                            preview="edit"
                            height={300}
                            visibleDragBar={false}
                            data-color-mode="light"
                            hideToolbar={submittingComment || !canComment}
                          />
                        </Suspense>
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
                      {ReactMarkdown && rehypeRaw ? (
                        <ReactMarkdown 
                          rehypePlugins={[rehypeRaw]}
                          components={markdownComponents}
                        >
                          {processMarkdownContent(expandedDescription ? prInfo[0].body : truncateDescription(prInfo[0].body))}
                        </ReactMarkdown>
                      ) : (
                        <div 
                          style={{ whiteSpace: 'pre-wrap' }}
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlContent(convertGitHubNotationToHtml(expandedDescription ? prInfo[0].body : truncateDescription(prInfo[0].body)))
                          }}
                        />
                      )}
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

              {/* View Toggle Switch */}
              <div className="pr-view-toggle">
                <div className="toggle-switch">
                  <button
                    className={`toggle-option ${!showWorkflowView ? 'active' : ''}`}
                    onClick={() => setShowWorkflowView(false)}
                  >
                    💬 Discussion
                  </button>
                  <button
                    className={`toggle-option ${showWorkflowView ? 'active' : ''}`}
                    onClick={() => setShowWorkflowView(true)}
                  >
                    ⚙️ Workflow Dashboard
                  </button>
                </div>
              </div>

              {/* Conditional Content Based on Toggle */}
              {showWorkflowView ? (
                /* Workflow Dashboard View */
                branchInfo?.name && (
                  <div className="workflow-status-wrapper">
                    <WorkflowDashboard
                      branchName={branchInfo.name}
                      githubActionsService={githubActionsService}
                      isAuthenticated={githubService.isAuth()}
                      canTriggerWorkflows={canTriggerWorkflows}
                      canApproveWorkflows={canApproveWorkflows}
                      onWorkflowAction={handleWorkflowDashboardAction}
                      // Pass PR actions data
                      prInfo={prInfo}
                      canMergePR={canMergePR}
                      canManagePR={canManagePR}
                      canReviewPR={canReviewPR}
                      isMergingPR={isMergingPR}
                      isApprovingPR={isApprovingPR}
                      isRequestingChanges={isRequestingChanges}
                      isMarkingReadyForReview={isMarkingReadyForReview}
                      approvalStatus={approvalStatus}
                      approvalMessage={approvalMessage}
                      newComment={newComment}
                      onMergePR={handleMergePR}
                      onApprovePR={handleApprovePR}
                      onRequestChanges={handleRequestChanges}
                      onMarkReadyForReview={handleMarkReadyForReview}
                    />
                  </div>
                )
              ) : (
                /* Discussion View */
                <>
                  {/* GitHub Copilot Session Section */}
                  {copilotSessionInfo && (
                    <div className="copilot-session-wrapper">
                      <h4>🤖 GitHub Copilot Activity</h4>
                      {copilotSessionInfo.hasActiveCopilot ? (
                        <div className="copilot-session-active">
                          <div className="copilot-session-info">
                            <span className="copilot-status">✅ Active Copilot session detected</span>
                            {isWatchingSession && (
                              <div className="copilot-watching-wrapper">
                                <span className="copilot-watching-status">
                                  {isRefreshingSession ? (
                                    <>🔄 Refreshing session... (#{sessionRefreshCount})</>
                                  ) : (
                                    <>🔄 Watching for updates (every 10s)</>
                                  )}
                                </span>
                                {lastSessionCheck && (
                                  <span className="copilot-last-check">
                                    Last checked: {formatDate(lastSessionCheck)}
                                  </span>
                                )}
                                {sessionRefreshCount > 0 && (
                                  <span className="copilot-refresh-count">
                                    Refreshes: {sessionRefreshCount}
                                  </span>
                                )}
                              </div>
                            )}
                            <span className="copilot-activity">
                              Last activity: {formatDate(copilotSessionInfo.latestActivity)}
                            </span>
                            <span className="copilot-comments-count">
                              {copilotSessionInfo.commentsCount} copilot comment(s) found
                            </span>
                          </div>
                          <div className="copilot-session-actions">
                            <button
                              className="copilot-session-toggle"
                              onClick={handleWatchSessionToggle}
                            >
                              {isWatchingSession ? '⏹️ Stop Watching' : '👁️ Watch Session'}
                            </button>
                            <a 
                              href={copilotSessionInfo.sessionUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="copilot-session-link"
                            >
                              🔗 Open Session
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
                          </div>
                          {showCopilotSession && copilotSessionInfo && (
                            <div className="copilot-session-modal">
                              <div className="copilot-session-header">
                                <strong>🤖 Copilot Session Activity</strong>
                                <span className="copilot-comment-date">
                                  {copilotSessionInfo.sessionUrl && (
                                    <a 
                                      href={copilotSessionInfo.sessionUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="session-url-link"
                                    >
                                      🔗 View Full Session
                                    </a>
                                  )}
                                </span>
                              </div>
                              <div className="copilot-session-content">
                                {copilotSessionInfo.copilotResponses && copilotSessionInfo.copilotResponses.length > 0 ? (
                                  <div className="copilot-responses">
                                    <div className="copilot-responses-header">
                                      <strong>Recent Copilot Responses ({copilotSessionInfo.copilotResponses.length})</strong>
                                    </div>
                                    {copilotSessionInfo.copilotResponses.slice(0, 3).map((response, index) => (
                                      <div key={response.id} className="copilot-response-item">
                                        <div className="copilot-response-meta">
                                          <img 
                                            src={response.user.avatar_url} 
                                            alt={response.user.login}
                                            className="copilot-response-avatar"
                                          />
                                          <a 
                                            href={response.user.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="copilot-response-username"
                                          >
                                            {response.user.login}
                                          </a>
                                          <span className="copilot-response-date">
                                            {formatDate(response.created_at)}
                                          </span>
                                          {index === 0 && <span className="copilot-latest-badge">Latest</span>}
                                        </div>
                                        <div className="copilot-response-body">
                                          <div className="markdown-content">
                                            {ReactMarkdown && rehypeRaw ? (
                                              <ReactMarkdown 
                                                rehypePlugins={[rehypeRaw]}
                                                components={markdownComponents}
                                              >{processMarkdownContent(response.body.length > 300 ? response.body.substring(0, 300) + '...' : response.body)}</ReactMarkdown>
                                            ) : (
                                              <div 
                                                style={{ whiteSpace: 'pre-wrap' }}
                                                dangerouslySetInnerHTML={{
                                                  __html: sanitizeHtmlContent(convertGitHubNotationToHtml(response.body.length > 300 ? response.body.substring(0, 300) + '...' : response.body))
                                                }}
                                              />
                                            )}
                                          </div>
                                          {response.body.length > 300 && (
                                            <a 
                                              href={`${repositoryConfig.getGitHubUrl()}/pull/${prInfo[0].number}#issuecomment-${response.id}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="read-full-response"
                                            >
                                              Read full response →
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    {copilotSessionInfo.copilotResponses.length > 3 && (
                                      <div className="copilot-more-responses">
                                        <a 
                                          href={copilotSessionInfo.sessionUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="view-more-responses"
                                        >
                                          View {copilotSessionInfo.copilotResponses.length - 3} more responses in session →
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ) : copilotSessionInfo.latestComment ? (
                                  <div className="copilot-fallback-content">
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
                                      <span className="copilot-activity-date">
                                        {formatDate(copilotSessionInfo.latestComment.created_at)}
                                      </span>
                                    </div>
                                    <div className="copilot-comment-body">
                                      <div className="markdown-content">
                                        {ReactMarkdown && rehypeRaw ? (
                                          <ReactMarkdown 
                                            rehypePlugins={[rehypeRaw]}
                                            components={markdownComponents}
                                          >{processMarkdownContent(copilotSessionInfo.latestComment.body)}</ReactMarkdown>
                                        ) : (
                                          <div 
                                            style={{ whiteSpace: 'pre-wrap' }}
                                            dangerouslySetInnerHTML={{
                                              __html: sanitizeHtmlContent(convertGitHubNotationToHtml(copilotSessionInfo.latestComment.body))
                                            }}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="no-copilot-activity">
                                    <p>No copilot responses found in recent activity.</p>
                                    <p>Session URL: <a href={copilotSessionInfo.sessionUrl} target="_blank" rel="noopener noreferrer">{copilotSessionInfo.sessionUrl}</a></p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="copilot-session-inactive">
                          <span className="copilot-status">
                            {isRefreshingSession ? (
                              <>🔄 Checking for active Copilot session...</>
                            ) : (
                              <>⚪ No active Copilot session detected</>
                            )}
                          </span>
                          {lastSessionCheck && (
                            <span className="copilot-last-check">
                              Last checked: {formatDate(lastSessionCheck)}
                            </span>
                          )}
                          <span className="copilot-hint">
                            Start a conversation with @copilot to begin a session
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="comments-section">
                    <div className="comments-header">
                      <h4>Recent Comments & Updates ({allComments.length > 0 ? `${displayedCommentsCount}/${allComments.length}` : '0'})</h4>
                      <div className="comments-controls">
                        <button
                          className="manual-refresh-btn"
                          onClick={handleManualRefreshComments}
                          disabled={isRefreshingComments}
                          title="Manually refresh comments"
                        >
                          {isRefreshingComments ? '🔄 Refreshing...' : '🔄 Refresh'}
                        </button>
                        <label className="status-updates-toggle">
                          <input 
                            type="checkbox" 
                            checked={showStatusUpdates}
                            onChange={(e) => {
                              setShowStatusUpdates(e.target.checked);
                              // Refresh comments when toggling status updates
                              if (prInfo && prInfo.length > 0) {
                                fetchCommentsForPR(repositoryConfig.getOwner(), repositoryConfig.getName(), prInfo[0].number, 1, false);
                              }
                            }}
                          />
                          <span className="checkbox-label">📋 Show status updates</span>
                        </label>
                      </div>
                    </div>
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
                            
                            // Debug: Log each comment being displayed
                            if (comment.user?.login?.toLowerCase().includes('copilot') || 
                                comment.user?.login === 'github-actions[bot]' ||
                                comment.user?.login === 'copilot[bot]' ||
                                (comment.user?.type === 'Bot' && comment.user?.login?.toLowerCase().includes('copilot'))) {
                              console.debug('Displaying copilot comment in main discussion:', {
                                id: comment.id,
                                author: comment.user.login,
                                type: comment.type,
                                userType: comment.user.type,
                                created: comment.created_at,
                                bodyPreview: comment.body?.substring(0, 100) + '...'
                              });
                            }
                            
                            return (
                              <div key={comment.id} className={`comment ${comment.type === 'timeline' ? 'comment-timeline' : ''} ${isNewComment ? 'comment-new-glow' : ''}`}>
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
                                  <span className={`comment-type ${comment.type === 'timeline' ? 'comment-type-timeline' : ''}`}>
                                    {comment.type === 'timeline' ? 'status' : comment.type}
                                  </span>
                                  
                                  {/* Comment Viewer Badges - only for regular comments */}
                                  {comment.type !== 'timeline' && viewers.length > 0 && (
                                    <div className="comment-viewers">
                                      {viewers.map((viewer, index) => {
                                        // Ensure viewer is a string before calling toLowerCase
                                        const safeViewer = typeof viewer === 'string' ? viewer : String(viewer || '');
                                        const isCopilot = safeViewer && safeViewer.toLowerCase().includes('copilot');
                                        return (
                                          <span 
                                            key={index}
                                            className={`viewer-badge ${isCopilot ? 'viewer-badge-copilot' : 'viewer-badge-user'}`}
                                            title={`${safeViewer} is looking at this comment`}
                                          >
                                            {isCopilot ? '👁️' : '👀'} {safeViewer}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                <div className="comment-body">
                                  {comment.type === 'timeline' ? (
                                    // Timeline events are always short, don't truncate
                                    <div className="comment-timeline-body">
                                      <div className="timeline-content">
                                        {comment.body}
                                      </div>
                                    </div>
                                  ) : shouldTruncate && !isExpanded ? (
                                    <>
                                      <div className="comment-preview">
                                        <div className="markdown-content">
                                          {ReactMarkdown && rehypeRaw ? (
                                            <ReactMarkdown 
                                              rehypePlugins={[rehypeRaw]}
                                              components={markdownComponents}
                                            >{processMarkdownContent(truncateComment(comment.body))}</ReactMarkdown>
                                          ) : (
                                            <div 
                                              style={{ whiteSpace: 'pre-wrap' }}
                                              dangerouslySetInnerHTML={{
                                                __html: sanitizeHtmlContent(convertGitHubNotationToHtml(truncateComment(comment.body)))
                                              }}
                                            />
                                          )}
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
                                          {ReactMarkdown && rehypeRaw ? (
                                            <ReactMarkdown 
                                              rehypePlugins={[rehypeRaw]}
                                              components={markdownComponents}
                                            >{processMarkdownContent(comment.body)}</ReactMarkdown>
                                          ) : (
                                            <div 
                                              style={{ whiteSpace: 'pre-wrap' }}
                                              dangerouslySetInnerHTML={{
                                                __html: sanitizeHtmlContent(convertGitHubNotationToHtml(comment.body))
                                              }}
                                            />
                                          )}
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
                        {(allComments.length > displayedCommentsCount || hasMoreComments) && (
                          <div className="comments-load-more">
                            <button
                              className="load-more-btn"
                              onClick={loadMoreComments}
                              disabled={commentsLoading}
                            >
                              {commentsLoading ? 'Loading...' : 
                                allComments.length > displayedCommentsCount ? 
                                  `Show More Comments (${allComments.length - displayedCommentsCount} more to load)` :
                                  'Load More Comments...'
                              }
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}

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
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleBadgeToggle(event);
            }
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          tabIndex={0}
          role="button"
          aria-label={isSticky ? "Collapse branch details" : isExpanded ? "Keep branch details expanded" : `Show branch details for ${branchInfo.name}`}
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
            <WorkflowDashboard
              branchName={branchInfo.name}
              githubActionsService={githubActionsService}
              isAuthenticated={githubService.isAuth()}
              canTriggerWorkflows={canTriggerWorkflows}
              canApproveWorkflows={canApproveWorkflows}
              onWorkflowAction={handleWorkflowDashboardAction}
            />
          </div>

          <div className="expanded-footer">
            <a href={`${repositoryConfig.getGitHubUrl()}/tree/${branchInfo.name}`} target="_blank" rel="noopener noreferrer" className="github-link">
              View Branch on GitHub →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewBadge;
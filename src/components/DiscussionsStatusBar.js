import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import githubService from '../services/githubService';
import IssueCreationModal from './IssueCreationModal';
import './DiscussionsStatusBar.css';

// Lazy load MDEditor for advanced markdown editing
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

/**
 * Discussions Status Bar component for DAK Dashboard
 * Provides filtering and display of repository issues tagged as discussions
 * Includes polling mechanism when expanded and modal-based issue creation
 */
const DiscussionsStatusBar = ({ repository, selectedBranch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Filter for open/closed issues
  const [selectedLabels, setSelectedLabels] = useState([]); // No preselected filters
  const [availableLabels, setAvailableLabels] = useState([]);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authoringIssueCount, setAuthoringIssueCount] = useState(0);
  const [labelsCache, setLabelsCache] = useState({});
  const [lastCacheUpdate, setLastCacheUpdate] = useState(null);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState(new Set()); // Track which issues are expanded
  const [issueComments, setIssueComments] = useState({}); // Store comments for each issue
  const [loadingComments, setLoadingComments] = useState(new Set()); // Track which issues are loading comments
  const [newComments, setNewComments] = useState({}); // Store new comment text for each issue
  const [submittingComments, setSubmittingComments] = useState(new Set()); // Track comment submission
  const [showAdvancedEditor, setShowAdvancedEditor] = useState({}); // Track advanced editor state per issue
  const pollingIntervalRef = useRef(null);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Fetch issues and labels from repository
  const fetchIssuesAndLabels = useCallback(async () => {
    if (!repository) {
      return;
    }

    const owner = repository.owner?.login || repository.full_name?.split('/')[0];
    const repoName = repository.name;

    if (!owner || !repoName) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if we're in demo mode
      const isDemo = repository.isDemo || owner === 'demo-user';
      
      if (isDemo) {
        // Use mock data for demo mode
        const mockLabels = ['authoring', 'bug reports', 'feature request', 'enhancement', 'documentation', 'question'];
        setAvailableLabels(mockLabels);
        
        // Mock issues for demo
        const mockIssues = [
          {
            id: 1,
            number: 42,
            title: 'Review ANC clinical decision logic for gestational age calculation',
            body: 'The current decision logic for determining gestational age in the ANC workflow may need refinement based on recent WHO guidance updates. Please review the DMN tables in the decision-support module.',
            state: 'open',
            labels: [{ name: 'authoring', color: '0e8a16' }, { name: 'clinical-review', color: 'fbca04' }],
            user: { login: 'clinical-expert' },
            created_at: '2024-07-15T10:30:00Z',
            html_url: `https://github.com/${owner}/${repoName}/issues/42`,
            comments: 3
          },
          {
            id: 2,
            number: 38,
            title: 'Update maternal health indicators based on new WHO recommendations',
            body: 'Recent WHO updates to maternal health indicators need to be incorporated into the program indicators component. This includes new definitions for high-risk pregnancy classifications.',
            state: 'open',
            labels: [{ name: 'authoring', color: '0e8a16' }, { name: 'indicators', color: 'd4c5f9' }],
            user: { login: 'who-expert' },
            created_at: '2024-07-10T14:20:00Z',
            html_url: `https://github.com/${owner}/${repoName}/issues/38`,
            comments: 1
          },
          {
            id: 3,
            number: 35,
            title: 'Clarification needed on FHIR profile for antenatal care encounters',
            body: 'The current FHIR profile definitions for antenatal care encounters seem to conflict with some of the business process requirements. Need clinical input on the correct mapping.',
            state: 'closed',
            labels: [{ name: 'authoring', color: '0e8a16' }, { name: 'fhir', color: 'c2e0c6' }],
            user: { login: 'implementer' },
            created_at: '2024-07-05T09:15:00Z',
            html_url: `https://github.com/${owner}/${repoName}/issues/35`,
            comments: 5
          }
        ];
        
        setIssues(mockIssues);
        
        // Count open authoring issues
        const openAuthoringCount = mockIssues.filter(issue => 
          issue.state === 'open' && 
          issue.labels.some(label => label.name === 'authoring')
        ).length;
        
        setAuthoringIssueCount(openAuthoringCount);
        setLoading(false);
        return;
      }

      // Real GitHub API calls for authenticated mode
      if (!githubService.isAuth()) {
        return;
      }

      // Check cache first for labels
      const cacheKey = `${owner}/${repoName}`;
      const now = Date.now();
      let labels = [];

      if (labelsCache[cacheKey] && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_DURATION) {
        labels = labelsCache[cacheKey];
      } else {
        // Fetch all issues to extract labels
        const allIssues = await githubService.getIssues(owner, repoName, {
          state: 'all',
          per_page: 100
        });

        // Extract unique labels from issues
        const labelSet = new Set();
        allIssues.forEach(issue => {
          if (issue.labels && Array.isArray(issue.labels)) {
            issue.labels.forEach(label => {
              if (typeof label === 'string') {
                labelSet.add(label);
              } else if (label && label.name) {
                labelSet.add(label.name);
              }
            });
          }
        });

        labels = Array.from(labelSet).sort();
        
        // Update cache
        setLabelsCache(prev => ({
          ...prev,
          [cacheKey]: labels
        }));
        setLastCacheUpdate(now);
      }

      // Always include 'authoring' in available labels if not present
      if (!labels.includes('authoring')) {
        labels.unshift('authoring');
      }
      
      setAvailableLabels(labels);

      // Fetch current issues
      const currentIssues = await githubService.getIssues(owner, repoName, {
        state: 'all',
        per_page: 100
      });

      // Filter out pull requests to get actual issues
      const actualIssues = currentIssues.filter(issue => !issue.pull_request);
      setIssues(actualIssues);

      // Count open authoring issues
      const openAuthoringCount = actualIssues.filter(issue => 
        issue.state === 'open' && 
        issue.labels &&
        issue.labels.some(label => 
          (typeof label === 'string' ? label : label.name) === 'authoring'
        )
      ).length;
      
      setAuthoringIssueCount(openAuthoringCount);

    } catch (err) {
      console.error('Error fetching issues and labels:', err);
      setError('Failed to load discussion data');
    } finally {
      setLoading(false);
    }
  }, [repository, labelsCache, lastCacheUpdate]);

  // Filter issues based on current filters
  const filterIssues = useCallback(() => {
    if (!issues.length) {
      setFilteredIssues([]);
      return;
    }

    const filtered = issues.filter(issue => {
      // Filter by open/closed state
      if (isOpen && issue.state !== 'open') return false;
      if (!isOpen && issue.state !== 'closed') return false;

      // Filter by selected labels
      if (selectedLabels.length === 0) return true;

      return selectedLabels.some(selectedLabel =>
        issue.labels &&
        issue.labels.some(issueLabel => 
          (typeof issueLabel === 'string' ? issueLabel : issueLabel.name) === selectedLabel
        )
      );
    });

    setFilteredIssues(filtered);
  }, [issues, isOpen, selectedLabels]);

  // Fetch data when component mounts or repository changes
  useEffect(() => {
    fetchIssuesAndLabels();
  }, [fetchIssuesAndLabels]);

  // Filter issues when filters change
  useEffect(() => {
    filterIssues();
  }, [filterIssues]);

  // Setup polling when expanded
  useEffect(() => {
    if (isExpanded && repository && githubService.isAuth()) {
      // Start polling every 5 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchIssuesAndLabels();
      }, 5000);
    } else {
      // Clear polling when collapsed or no repository
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Cleanup interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isExpanded, repository, fetchIssuesAndLabels]);

  const handleLabelToggle = (label) => {
    setSelectedLabels(prev => {
      if (prev.includes(label)) {
        return prev.filter(l => l !== label);
      } else {
        return [...prev, label];
      }
    });
  };

  const handleCreateNewIssue = () => {
    if (!repository) return;

    const owner = repository.owner?.login || repository.full_name?.split('/')[0];
    const repoName = repository.name;
    
    // Check if we're in demo mode
    const isDemo = repository.isDemo || owner === 'demo-user';
    
    if (isDemo) {
      // In demo mode, show a mock dialog instead of opening GitHub
      alert('Demo Mode: In a real implementation, this would open a new discussion creation modal.');
      return;
    }
    
    // Check if user is authenticated and can potentially create issues
    if (githubService.isAuth()) {
      // Show the discussion creation modal
      setShowDiscussionModal(true);
    } else {
      // For non-authenticated users, fall back to GitHub URL
      const url = `https://github.com/${owner}/${repoName}/issues/new?template=dak_content_error.yml&labels=authoring`;
      window.open(url, '_blank');
    }
  };

  const handleIssueClick = (issue) => {
    // Check if we're in demo mode
    const owner = repository?.owner?.login || repository?.full_name?.split('/')[0];
    const isDemo = repository?.isDemo || owner === 'demo-user';
    
    if (isDemo) {
      // In demo mode, show a mock dialog instead of opening GitHub
      alert(`Demo Mode: In a real implementation, this would open issue #${issue.number} "${issue.title}" in GitHub.`);
      return;
    }
    
    // Open GitHub issue in new tab
    window.open(issue.html_url, '_blank');
  };

  const handleDiscussionSuccess = (createdIssue) => {
    console.log('Discussion created successfully:', createdIssue);
    // Refresh the issues list
    fetchIssuesAndLabels();
  };

  const handleDiscussionError = (error) => {
    console.error('Failed to create discussion:', error);
    // Error is already handled by the modal
  };

  // Load comments for a specific issue
  const loadIssueComments = async (issue) => {
    if (!repository || !githubService.isAuth()) return;

    const owner = repository.owner?.login || repository.full_name?.split('/')[0];
    const repoName = repository.name;
    const issueNumber = issue.number;

    if (loadingComments.has(issueNumber)) return; // Already loading

    setLoadingComments(prev => new Set(prev).add(issueNumber));

    try {
      const comments = await githubService.getPullRequestIssueComments(owner, repoName, issueNumber);
      setIssueComments(prev => ({
        ...prev,
        [issueNumber]: comments
      }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(issueNumber);
        return newSet;
      });
    }
  };

  // Toggle issue expansion
  const toggleIssueExpansion = (issue) => {
    const issueNumber = issue.number;
    setExpandedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueNumber)) {
        newSet.delete(issueNumber);
      } else {
        newSet.add(issueNumber);
        // Load comments when expanding
        if (!issueComments[issueNumber]) {
          loadIssueComments(issue);
        }
      }
      return newSet;
    });
  };

  // Handle comment submission
  const submitComment = async (issue) => {
    if (!repository || !githubService.isAuth()) return;

    const owner = repository.owner?.login || repository.full_name?.split('/')[0];
    const repoName = repository.name;
    const issueNumber = issue.number;
    const commentText = newComments[issueNumber];

    if (!commentText?.trim()) return;

    setSubmittingComments(prev => new Set(prev).add(issueNumber));

    try {
      const newComment = await githubService.createPullRequestComment(owner, repoName, issueNumber, commentText);
      
      // Add the new comment to the existing comments
      setIssueComments(prev => ({
        ...prev,
        [issueNumber]: [...(prev[issueNumber] || []), newComment]
      }));

      // Clear the comment input
      setNewComments(prev => ({
        ...prev,
        [issueNumber]: ''
      }));

      // Close advanced editor
      setShowAdvancedEditor(prev => ({
        ...prev,
        [issueNumber]: false
      }));

    } catch (error) {
      console.error('Failed to submit comment:', error);
      // Could show an error message to user here
    } finally {
      setSubmittingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(issueNumber);
        return newSet;
      });
    }
  };

  // Toggle advanced editor for specific issue
  const toggleAdvancedEditor = (issueNumber) => {
    setShowAdvancedEditor(prev => ({
      ...prev,
      [issueNumber]: !prev[issueNumber]
    }));
  };

  // Update comment text for specific issue
  const updateCommentText = (issueNumber, text) => {
    setNewComments(prev => ({
      ...prev,
      [issueNumber]: text
    }));
  };

  const formatIssueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getIssueLabelBadges = (issue) => {
    if (!issue.labels || !Array.isArray(issue.labels)) return [];
    
    return issue.labels.map(label => {
      const labelName = typeof label === 'string' ? label : label.name;
      const labelColor = typeof label === 'string' ? '#666' : (label.color || '666');
      
      return (
        <span 
          key={labelName}
          className="issue-label-badge"
          style={{ backgroundColor: `#${labelColor}` }}
        >
          {labelName}
        </span>
      );
    });
  };

  if (!repository) {
    return null;
  }

  return (
    <div className="discussions-status-bar">
      <div 
        className="status-bar-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="status-bar-title">
          <span className="status-icon">💬</span>
          <span className="status-text">Discussions</span>
          {authoringIssueCount > 0 && (
            <span className="notification-badge">{authoringIssueCount}</span>
          )}
        </div>
        <div className="status-bar-controls">
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="status-bar-content">
          {/* Filter Controls */}
          <div className="filter-controls">
            <div className="state-filter">
              <button 
                className={`filter-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(true)}
              >
                Open
              </button>
              <button 
                className={`filter-toggle ${!isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Closed
              </button>
            </div>

            <div className="label-filters">
              {availableLabels.map(label => (
                <button
                  key={label}
                  className={`label-badge ${selectedLabels.includes(label) ? 'selected' : 'disabled'}`}
                  onClick={() => handleLabelToggle(label)}
                >
                  {label}
                </button>
              ))}
            </div>

            <button 
              className="new-issue-btn"
              onClick={handleCreateNewIssue}
            >
              + New Discussion
            </button>
          </div>

          {/* Issues List */}
          <div className="issues-list">
            {loading && (
              <div className="loading-state">
                <span>Loading discussions...</span>
              </div>
            )}

            {error && (
              <div className="error-state">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
                <button onClick={fetchIssuesAndLabels} className="retry-btn">
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && filteredIssues.length === 0 && (
              <div className="empty-state">
                <span>No discussions found with current filters</span>
              </div>
            )}

            {!loading && !error && filteredIssues.map(issue => {
              const issueNumber = issue.number;
              const isExpanded = expandedIssues.has(issueNumber);
              const comments = issueComments[issueNumber] || [];
              const isLoadingComments = loadingComments.has(issueNumber);
              const isSubmittingComment = submittingComments.has(issueNumber);
              const showAdvanced = showAdvancedEditor[issueNumber];
              const commentText = newComments[issueNumber] || '';

              return (
                <div key={issue.id} className="issue-card">
                  <div className="issue-header">
                    <div className="issue-title">
                      <span className={`issue-state ${issue.state}`}>
                        {issue.state === 'open' ? '🟢' : '🔴'}
                      </span>
                      <span 
                        className="issue-title-text"
                        onClick={() => handleIssueClick(issue)}
                        style={{ cursor: 'pointer' }}
                      >
                        {issue.title}
                      </span>
                    </div>
                    <div className="issue-controls">
                      <div className="issue-number">#{issue.number}</div>
                      {issue.comments > 0 && (
                        <button
                          className="expand-comments-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIssueExpansion(issue);
                          }}
                          title={isExpanded ? 'Collapse comments' : 'Show comments'}
                        >
                          💬 {issue.comments} {isExpanded ? '▼' : '▶'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="issue-summary">
                    {issue.body ? 
                      issue.body.substring(0, 200) + (issue.body.length > 200 ? '...' : '') :
                      'No description provided'
                    }
                  </div>

                  <div className="issue-meta">
                    <div className="issue-labels">
                      {getIssueLabelBadges(issue)}
                    </div>
                    <div className="issue-info">
                      <span className="issue-author">by {issue.user?.login}</span>
                      <span className="issue-date">{formatIssueDate(issue.created_at)}</span>
                      {issue.comments === 0 && githubService.isAuth() && (
                        <button
                          className="add-comment-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIssueExpansion(issue);
                          }}
                          title="Add a comment"
                        >
                          💬 Add comment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Comments Section */}
                  {isExpanded && (
                    <div className="issue-comments-section">
                      {isLoadingComments && (
                        <div className="loading-comments">
                          <span>Loading comments...</span>
                        </div>
                      )}

                      {comments.length > 0 && (
                        <div className="comments-list">
                          {comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                              <div className="comment-header">
                                <span className="comment-author">{comment.user.login}</span>
                                <span className="comment-date">{formatIssueDate(comment.created_at)}</span>
                              </div>
                              <div className="comment-body">
                                {comment.body}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Form */}
                      {githubService.isAuth() && (
                        <div className="add-comment-form">
                          {!showAdvanced ? (
                            <div className="comment-form-simple">
                              <textarea
                                value={commentText}
                                onChange={(e) => updateCommentText(issueNumber, e.target.value)}
                                placeholder="Write a comment... (Click 'Advanced Editor' for markdown preview)"
                                rows={3}
                                disabled={isSubmittingComment}
                              />
                              <div className="comment-form-actions">
                                <button
                                  className="advanced-editor-btn"
                                  onClick={() => toggleAdvancedEditor(issueNumber)}
                                  disabled={isSubmittingComment}
                                >
                                  📝 Advanced Editor
                                </button>
                                <button
                                  className="submit-comment-btn"
                                  onClick={() => submitComment(issue)}
                                  disabled={!commentText.trim() || isSubmittingComment}
                                >
                                  {isSubmittingComment ? 'Submitting...' : 'Comment'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="comment-form-advanced">
                              <div className="markdown-editor-container">
                                <Suspense fallback={<div className="loading-spinner">Loading editor...</div>}>
                                  <MDEditor
                                    value={commentText}
                                    onChange={(val) => updateCommentText(issueNumber, val || '')}
                                    preview="edit"
                                    height={200}
                                    visibleDragBar={false}
                                    data-color-mode="light"
                                    hideToolbar={isSubmittingComment}
                                  />
                                </Suspense>
                              </div>
                              <div className="comment-form-actions">
                                <button
                                  className="btn-secondary"
                                  onClick={() => toggleAdvancedEditor(issueNumber)}
                                  disabled={isSubmittingComment}
                                >
                                  Simple Editor
                                </button>
                                <button
                                  className="submit-comment-btn"
                                  onClick={() => submitComment(issue)}
                                  disabled={!commentText.trim() || isSubmittingComment}
                                >
                                  {isSubmittingComment ? 'Submitting...' : 'Comment'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Discussion Creation Modal */}
      <IssueCreationModal
        isOpen={showDiscussionModal}
        onClose={() => setShowDiscussionModal(false)}
        issueType="discussion"
        repository={repository}
        contextData={{
          pageId: 'discussions-status-bar',
          selectedDak: repository,
          selectedBranch: selectedBranch
        }}
        onSuccess={handleDiscussionSuccess}
        onError={handleDiscussionError}
      />
    </div>
  );
};

export default DiscussionsStatusBar;
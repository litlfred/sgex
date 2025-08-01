import React, { useState, useEffect, useCallback } from 'react';
import githubService from '../services/githubService';
import './DiscussionsStatusBar.css';

/**
 * Discussions Status Bar component for DAK Dashboard
 * Provides filtering and display of repository issues tagged as discussions
 */
const DiscussionsStatusBar = ({ repository, selectedBranch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Filter for open/closed issues
  const [selectedLabels, setSelectedLabels] = useState(['authoring']); // Default to 'authoring'
  const [availableLabels, setAvailableLabels] = useState([]);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authoringIssueCount, setAuthoringIssueCount] = useState(0);
  const [showNewIssueForm, setShowNewIssueForm] = useState(false);
  const [labelsCache, setLabelsCache] = useState({});
  const [lastCacheUpdate, setLastCacheUpdate] = useState(null);

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
      alert('Demo Mode: In a real implementation, this would open a new DAK Content Feedback issue in the repository.');
      return;
    }
    
    // Open GitHub new issue page with DAK Content Feedback template
    const url = `https://github.com/${owner}/${repoName}/issues/new?template=dak_content_error.yml&labels=authoring`;
    window.open(url, '_blank');
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

            {!loading && !error && filteredIssues.map(issue => (
              <div 
                key={issue.id}
                className="issue-card"
                onClick={() => handleIssueClick(issue)}
              >
                <div className="issue-header">
                  <div className="issue-title">
                    <span className={`issue-state ${issue.state}`}>
                      {issue.state === 'open' ? '🟢' : '🔴'}
                    </span>
                    <span className="issue-title-text">{issue.title}</span>
                  </div>
                  <div className="issue-number">#{issue.number}</div>
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
                    {issue.comments > 0 && (
                      <span className="issue-comments">💬 {issue.comments}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsStatusBar;
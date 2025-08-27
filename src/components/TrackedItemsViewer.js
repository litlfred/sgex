import React, { useState, useEffect } from 'react';
import issueTrackingService from '../services/issueTrackingService';
import githubService from '../services/githubService';
import './TrackedItemsViewer.css';

const TrackedItemsViewer = ({ onClose }) => {
  const [trackedItems, setTrackedItems] = useState({ issues: [], pullRequests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('issues');
  const [syncing, setSyncing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [repositoryFilters, setRepositoryFilters] = useState({});
  const [trackedRepositories, setTrackedRepositories] = useState([]);

  useEffect(() => {
    loadTrackedItems();
  }, []);

  const loadTrackedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await issueTrackingService.getFilteredTrackedItems();
      const filters = await issueTrackingService.getRepositoryFilters();
      const repositories = await issueTrackingService.getTrackedRepositories();
      
      setTrackedItems(items);
      setRepositoryFilters(filters);
      setTrackedRepositories(repositories);
    } catch (err) {
      console.error('Failed to load tracked items:', err);
      setError('Failed to load tracked items');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!githubService.isAuth()) {
      setError('Authentication required to sync items');
      return;
    }

    try {
      setSyncing(true);
      await issueTrackingService.syncTrackedItems();
      await loadTrackedItems(); // Reload after sync
    } catch (err) {
      console.error('Failed to sync tracked items:', err);
      setError('Failed to sync tracked items');
    } finally {
      setSyncing(false);
    }
  };

  const handleRemoveIssue = async (issueNumber) => {
    try {
      await issueTrackingService.removeTrackedIssue(issueNumber);
      await loadTrackedItems(); // Reload after removal
    } catch (err) {
      console.error('Failed to remove tracked issue:', err);
      setError('Failed to remove tracked issue');
    }
  };

  const handleRemovePR = async (prNumber) => {
    try {
      await issueTrackingService.removeTrackedPR(prNumber);
      await loadTrackedItems(); // Reload after removal
    } catch (err) {
      console.error('Failed to remove tracked PR:', err);
      setError('Failed to remove tracked PR');
    }
  };

  const handleRepositoryFilterChange = async (repository, hidden) => {
    try {
      await issueTrackingService.setRepositoryVisibility(repository, hidden);
      await loadTrackedItems(); // Reload to apply filters
    } catch (err) {
      console.error('Failed to update repository filter:', err);
      setError('Failed to update repository filter');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'open':
        return '#28a745';
      case 'closed':
        return '#cb2431';
      case 'merged':
        return '#6f42c1';
      default:
        return '#6a737d';
    }
  };

  const renderIssueItem = (issue) => (
    <div key={issue.id} className="tracked-item">
      <div className="tracked-item-header">
        <div className="tracked-item-title">
          <a 
            href={issue.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="tracked-item-link"
          >
            #{issue.number} {issue.title}
          </a>
        </div>
        <div className="tracked-item-actions">
          <span 
            className="tracked-item-state"
            style={{ backgroundColor: getStateColor(issue.state) }}
          >
            {issue.state}
          </span>
          <button
            onClick={() => handleRemoveIssue(issue.number)}
            className="tracked-item-remove"
            title="Stop tracking this issue"
          >
            ×
          </button>
        </div>
      </div>
      <div className="tracked-item-meta">
        <span className="tracked-item-repo">{issue.repository}</span>
        <span className="tracked-item-date">Created {formatDate(issue.created_at)}</span>
      </div>
      {issue.labels && issue.labels.length > 0 && (
        <div className="tracked-item-labels">
          {issue.labels.map((label, index) => (
            <span
              key={index}
              className="tracked-item-label"
              style={{ backgroundColor: `#${label.color}` }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderPRItem = (pr) => (
    <div key={pr.id} className="tracked-item">
      <div className="tracked-item-header">
        <div className="tracked-item-title">
          <a 
            href={pr.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="tracked-item-link"
          >
            #{pr.number} {pr.title}
          </a>
        </div>
        <div className="tracked-item-actions">
          <span 
            className="tracked-item-state"
            style={{ backgroundColor: getStateColor(pr.state) }}
          >
            {pr.state}
          </span>
          <button
            onClick={() => handleRemovePR(pr.number)}
            className="tracked-item-remove"
            title="Stop tracking this PR"
          >
            ×
          </button>
        </div>
      </div>
      <div className="tracked-item-meta">
        <span className="tracked-item-repo">{pr.repository}</span>
        <span className="tracked-item-date">Created {formatDate(pr.created_at)}</span>
      </div>
      {pr.linkedIssues && pr.linkedIssues.length > 0 && (
        <div className="tracked-item-linked">
          Linked to issues: {pr.linkedIssues.map(issue => `#${issue}`).join(', ')}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="tracked-items-modal-overlay">
        <div className="tracked-items-modal">
          <div className="tracked-items-header">
            <h2>Tracked Items</h2>
            <button onClick={onClose} className="tracked-items-close">×</button>
          </div>
          <div className="tracked-items-loading">
            <div className="loading-spinner"></div>
            <p>Loading tracked items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tracked-items-modal-overlay">
      <div className="tracked-items-modal">
        <div className="tracked-items-header">
          <h2>Tracked Items</h2>
          <div className="tracked-items-header-actions">
            {trackedRepositories.length > 1 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="tracked-items-filter-toggle"
                title="Filter repositories"
              >
                🔽 Filters
              </button>
            )}
            {githubService.isAuth() && (
              <button
                onClick={handleSync}
                className="tracked-items-sync"
                disabled={syncing}
                title="Sync with GitHub to update status"
              >
                {syncing ? '🔄' : '↻'} {syncing ? 'Syncing...' : 'Sync'}
              </button>
            )}
            <button onClick={onClose} className="tracked-items-close">×</button>
          </div>
        </div>

        {error && (
          <div className="tracked-items-error">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {showFilters && trackedRepositories.length > 1 && (
          <div className="tracked-items-filters">
            <h3>Repository Filters</h3>
            <div className="repository-filters-list">
              {trackedRepositories.map(repository => (
                <div key={repository} className="repository-filter-item">
                  <label className="repository-filter-label">
                    <input
                      type="checkbox"
                      checked={!repositoryFilters[repository]?.hidden}
                      onChange={(e) => handleRepositoryFilterChange(repository, !e.target.checked)}
                      className="repository-filter-checkbox"
                    />
                    <span className="repository-filter-name">{repository}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tracked-items-tabs">
          <button
            className={`tracked-items-tab ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            Issues ({trackedItems.issues.length})
          </button>
          <button
            className={`tracked-items-tab ${activeTab === 'pullRequests' ? 'active' : ''}`}
            onClick={() => setActiveTab('pullRequests')}
          >
            Pull Requests ({trackedItems.pullRequests.length})
          </button>
        </div>

        <div className="tracked-items-content">
          {activeTab === 'issues' && (
            <div className="tracked-items-list">
              {trackedItems.issues.length === 0 ? (
                <div className="tracked-items-empty">
                  <p>No tracked issues yet.</p>
                  <p>Issues you create while authenticated will appear here.</p>
                </div>
              ) : (
                trackedItems.issues.map(renderIssueItem)
              )}
            </div>
          )}

          {activeTab === 'pullRequests' && (
            <div className="tracked-items-list">
              {trackedItems.pullRequests.length === 0 ? (
                <div className="tracked-items-empty">
                  <p>No tracked pull requests yet.</p>
                  <p>PRs related to your tracked issues will appear here automatically.</p>
                </div>
              ) : (
                trackedItems.pullRequests.map(renderPRItem)
              )}
            </div>
          )}
        </div>

        <div className="tracked-items-footer">
          <p className="tracked-items-help">
            Items are tracked locally in your browser. 
            {githubService.isAuth() ? ' Use sync to update status from GitHub.' : ' Login to sync status with GitHub.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackedItemsViewer;
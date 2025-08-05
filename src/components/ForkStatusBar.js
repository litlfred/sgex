import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import { handleNavigationClick } from '../utils/navigationUtils';
import './ForkStatusBar.css';

const ForkStatusBar = ({ profile, repository, selectedBranch }) => {
  const navigate = useNavigate();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [forks, setForks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get session storage key for this repository
  const getStorageKey = React.useCallback(() => {
    if (!repository) return null;
    return `sgex_fork_status_${repository.full_name}`;
  }, [repository]);

  // Load expansion state from session storage
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      const savedState = sessionStorage.getItem(storageKey);
      if (savedState !== null) {
        setIsExpanded(JSON.parse(savedState));
      }
    }
  }, [getStorageKey]);

  // Save expansion state to session storage
  const toggleExpansion = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    const storageKey = getStorageKey();
    if (storageKey) {
      sessionStorage.setItem(storageKey, JSON.stringify(newState));
    }
  };

  // Fetch forks when component mounts
  useEffect(() => {
    const fetchForks = async () => {
      if (!repository) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // For sgex repository, fetch from litlfred/sgex
        const forks = await githubService.getRepositoryForks('litlfred', 'sgex');
        setForks(forks);
      } catch (err) {
        console.error('Error fetching repository forks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForks();
  }, [repository]);

  // Generate DAK dashboard URL for a fork
  const getForkDashboardUrl = (fork) => {
    const owner = fork.owner.login;
    const repoName = fork.name;
    const branch = fork.default_branch || 'main';
    return `/dashboard/${owner}/${repoName}/${branch}`;
  };

  // Handle fork navigation
  const handleForkClick = (event, fork) => {
    const dashboardUrl = getForkDashboardUrl(fork);
    const navigationState = {
      profile: {
        login: fork.owner.login,
        name: fork.owner.login,
        avatar_url: fork.owner.avatar_url,
        type: fork.owner.type
      },
      repository: fork,
      selectedBranch: fork.default_branch || 'main'
    };
    
    handleNavigationClick(event, dashboardUrl, navigate, navigationState);
  };

  if (!repository || loading) {
    return (
      <div className="fork-status-bar loading">
        <div className="fork-status-header">
          <div className="fork-badge-placeholder">
            <span className="fork-icon">🍴</span>
            <span className="fork-count">...</span>
          </div>
          <span className="fork-status-title">Loading forks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fork-status-bar error">
        <div className="fork-status-header">
          <div className="fork-badge">
            <span className="fork-icon">🍴</span>
            <span className="fork-count">?</span>
          </div>
          <span className="fork-status-title">Unable to load forks</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fork-status-bar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="fork-status-header" onClick={toggleExpansion}>
        <div className="fork-badge">
          <span className="fork-icon">🍴</span>
          <span className="fork-count">{forks.length}</span>
        </div>
        <span className="fork-status-title">
          {forks.length} fork{forks.length !== 1 ? 's' : ''} of sgex repository
        </span>
        <button className="fork-toggle-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
      </div>
      
      {isExpanded && (
        <div className="fork-list">
          {forks.length === 0 ? (
            <div className="no-forks">
              <p>No forks found for this repository.</p>
            </div>
          ) : (
            <div className="fork-items">
              {forks.map((fork) => (
                <div 
                  key={fork.id} 
                  className="fork-item"
                  onClick={(event) => handleForkClick(event, fork)}
                >
                  <div className="fork-avatar">
                    <img 
                      src={fork.owner.avatar_url} 
                      alt={fork.owner.login}
                      className="fork-owner-avatar"
                    />
                  </div>
                  <div className="fork-info">
                    <div className="fork-name">
                      <strong>{fork.owner.login}/{fork.name}</strong>
                    </div>
                    <div className="fork-description">
                      {fork.description || 'No description available'}
                    </div>
                    <div className="fork-stats">
                      <span className="fork-stat">
                        ⭐ {fork.stargazers_count}
                      </span>
                      <span className="fork-stat">
                        📝 {fork.open_issues_count} issues
                      </span>
                      <span className="fork-stat">
                        📅 Updated {new Date(fork.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="fork-actions">
                    <span className="fork-link-hint">Click to view DAK →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForkStatusBar;
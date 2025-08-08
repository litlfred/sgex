import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import { handleNavigationClick } from '../utils/navigationUtils';

const ForkStatusBar = ({ profile, repository, selectedBranch }) => {
  const navigate = useNavigate();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [forks, setForks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parentRepository, setParentRepository] = useState(null);

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

  // Fetch forks and parent repository info when component mounts
  useEffect(() => {
    const fetchRepositoryInfo = async () => {
      if (!repository) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Check if we need to fetch full repository details to get parent info
        let fullRepository = repository;
        if (!repository.parent && (repository.fork === true || repository.fork === undefined)) {
          // Fetch full repository details to get parent information
          try {
            fullRepository = await githubService.getRepository(repository.owner.login, repository.name);
          } catch (repoErr) {
            console.warn('Could not fetch full repository details:', repoErr);
            // Continue with existing repository data
          }
        }
        
        // Set parent repository if this is a fork
        if (fullRepository.fork && fullRepository.parent) {
          setParentRepository(fullRepository.parent);
        }
        
        // Fetch forks for the current repository being viewed
        const forks = await githubService.getRepositoryForks(repository.owner.login, repository.name);
        setForks(forks);
      } catch (err) {
        console.error('Error fetching repository information:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositoryInfo();
  }, [repository]);

  // Generate DAK dashboard URL for a fork
  const getForkDashboardUrl = (fork) => {
    const owner = fork.owner.login;
    const repoName = fork.name;
    const branch = fork.default_branch || 'main';
    return `/dashboard/${owner}/${repoName}/${branch}`;
  };

  // Handle parent repository navigation
  const handleParentClick = (event) => {
    if (!parentRepository) return;
    
    const dashboardUrl = getForkDashboardUrl(parentRepository);
    const navigationState = {
      profile: {
        login: parentRepository.owner.login,
        name: parentRepository.owner.login,
        avatar_url: parentRepository.owner.avatar_url,
        type: parentRepository.owner.type
      },
      repository: parentRepository,
      selectedBranch: parentRepository.default_branch || 'main'
    };
    
    handleNavigationClick(event, dashboardUrl, navigate, navigationState);
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
          <span className="fork-status-title">Loading repository info...</span>
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
          <span className="fork-status-title">Unable to load repository info</span>
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
          {parentRepository ? (
            <>
              Fork of{' '}
              <span 
                className="parent-repo-link" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleParentClick(e);
                }}
              >
                {parentRepository.owner.login}/{parentRepository.name}
              </span>
              {forks.length > 0 && (
                <> • {forks.length} fork{forks.length !== 1 ? 's' : ''}</>
              )}
            </>
          ) : (
            <>
              {forks.length} fork{forks.length !== 1 ? 's' : ''} of {repository?.name || 'repository'}
            </>
          )}
        </span>
        <button className="fork-toggle-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
      </div>
      
      {isExpanded && (
        <div className="fork-list">
          {parentRepository && (
            <div className="parent-section">
              <h4 className="section-title">Parent Repository</h4>
              <div 
                className="fork-item parent-item"
                onClick={(event) => handleParentClick(event)}
              >
                <div className="fork-avatar">
                  <img 
                    src={parentRepository.owner.avatar_url} 
                    alt={parentRepository.owner.login}
                    className="fork-owner-avatar"
                  />
                </div>
                <div className="fork-info">
                  <div className="fork-name">
                    <strong>{parentRepository.owner.login}/{parentRepository.name}</strong>
                    <span className="parent-badge">Parent</span>
                  </div>
                  <div className="fork-description">
                    {parentRepository.description || 'No description available'}
                  </div>
                  <div className="fork-stats">
                    <span className="fork-stat">
                      ⭐ {parentRepository.stargazers_count}
                    </span>
                    <span className="fork-stat">
                      📝 {parentRepository.open_issues_count} issues
                    </span>
                    <span className="fork-stat">
                      📅 Updated {new Date(parentRepository.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="fork-actions">
                  <span className="fork-link-hint">Click to view DAK →</span>
                </div>
              </div>
            </div>
          )}
          
          {forks.length === 0 ? (
            !parentRepository && (
              <div className="no-forks">
                <p>No forks found for this repository.</p>
              </div>
            )
          ) : (
            <div className="forks-section">
              {parentRepository && <h4 className="section-title">Forks ({forks.length})</h4>}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForkStatusBar;
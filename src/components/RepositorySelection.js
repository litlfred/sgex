import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';
import './RepositorySelection.css';

const RepositorySelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const profile = location.state?.profile;

  const fetchRepositories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we have cached repositories that are still fresh (< 24 hours)
      let cachedRepos = null;
      try {
        cachedRepos = repositoryCacheService.getCachedRepositories(profile.login, profile.type);
      } catch (cacheError) {
        console.warn('Error accessing repository cache:', cacheError);
        // Continue to fetch fresh data if cache fails
      }
      
      if (cachedRepos) {
        // Use cached repositories
        console.log(`Using cached repositories for ${profile.login} (${profile.type})`);
        setRepositories(cachedRepos.repositories);
        setLoading(false);
        return;
      }
      
      // No cached data or stale data - fetch from GitHub
      console.log(`Fetching fresh repositories for ${profile.login} (${profile.type})`);
      
      // Use GitHub service to fetch real repositories
      const repos = await githubService.getRepositories(profile.login, profile.type);
      
      // Cache the fetched repositories
      try {
        repositoryCacheService.setCachedRepositories(profile.login, profile.type, repos);
      } catch (cacheError) {
        console.warn('Error caching repositories:', cacheError);
        // Continue even if caching fails
      }
      
      setRepositories(repos);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) {
      navigate('/');
      return;
    }
    
    fetchRepositories();
  }, [profile, navigate, fetchRepositories]);

  const handleRepositorySelect = (repo) => {
    navigate('/dashboard', { 
      state: { 
        profile, 
        repository: repo 
      } 
    });
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!profile) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="repository-selection">
      <div className="repo-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="profile-info">
          <img src={profile.avatar_url || `https://github.com/${profile.login}.png`} alt="Profile" className="profile-avatar" />
          <span>{profile.name || profile.login}</span>
        </div>
      </div>

      <div className="repo-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Select Repository</span>
        </div>

        <div className="repo-selection">
          <h2>Select DAK Repository</h2>
          <p>Choose a repository containing WHO SMART Guidelines Digital Adaptation Kit content:</p>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading repositories...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>Error loading repositories</h3>
              <p>{error}</p>
              <button onClick={() => fetchRepositories()} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : repositories.length === 0 ? (
            <div className="empty-state">
              <h3>No DAK repositories found</h3>
              <p>
                No repositories found with DAK-related topics or keywords. 
                Create a new repository or add topics like 'who', 'smart-guidelines', 
                'dak', or 'health' to existing repositories.
              </p>
            </div>
          ) : (
            <div className="repo-grid">
              {repositories.map((repo) => (
                <div 
                  key={repo.id}
                  className="repo-card"
                  onClick={() => handleRepositorySelect(repo)}
                >
                  <div className="repo-header-info">
                    <h3>{repo.name}</h3>
                    <div className="repo-meta">
                      {repo.private && <span className="private-badge">Private</span>}
                      {repo.language && <span className="language-badge">{repo.language}</span>}
                    </div>
                  </div>
                  
                  <p className="repo-description">{repo.description || 'No description available'}</p>
                  
                  <div className="repo-topics">
                    {(repo.topics || []).slice(0, 3).map((topic) => (
                      <span key={topic} className="topic-tag">{topic}</span>
                    ))}
                    {(repo.topics || []).length > 3 && (
                      <span className="topic-more">+{(repo.topics || []).length - 3} more</span>
                    )}
                  </div>
                  
                  <div className="repo-stats">
                    <div className="stat">
                      <span className="stat-icon">⭐</span>
                      <span>{repo.stargazers_count || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">🍴</span>
                      <span>{repo.forks_count || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">📅</span>
                      <span>Updated {formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepositorySelection;
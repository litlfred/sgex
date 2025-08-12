import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';
import { PageLayout } from './framework';

const RepositorySelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useParams();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get profile from location state or fetch from GitHub using user param
  const [profile, setProfile] = useState(location.state?.profile);

  // Fetch profile if we have user param but no profile in state
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && !profile) {
        try {
          if (githubService.isAuth()) {
            const fetchedProfile = await githubService.getUser(user);
            setProfile(fetchedProfile);
          } else {
            // Create a demo profile for unauthenticated users
            setProfile({
              login: user,
              name: user.charAt(0).toUpperCase() + user.slice(1),
              avatar_url: `https://github.com/${user}.png`,
              type: 'User',
              isDemo: true
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          navigate('/', {
            state: {
              warningMessage: `User '${user}' not found or not accessible.`
            }
          });
        }
      }
    };

    fetchProfile();
  }, [user, profile, navigate]);

  const fetchRepositories = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const profileType = profile.type;
      
      // First, check cache unless we're forcing a refresh
      if (!forceRefresh) {
        let cachedRepos = null;
        try {
          cachedRepos = repositoryCacheService.getCachedRepositories(profile.login, profileType);
        } catch (cacheError) {
          console.warn('Error accessing repository cache:', cacheError);
        }
        
        if (cachedRepos) {
          // Use cached repositories
          console.log(`Using cached repositories for ${profile.login} (${profileType})`);
          setRepositories(cachedRepos.repositories);
          setLoading(false);
          return;
        }
      }
      
      // No cached data or forced refresh - fetch from GitHub
      console.log(`Fetching fresh repositories for ${profile.login} (${profileType})`);
      const repos = await githubService.getRepositories(profile.login, profileType, profile.isDemo);
      
      // Cache the fetched repositories
      try {
        repositoryCacheService.setCachedRepositories(profile.login, profileType, repos);
      } catch (cacheError) {
        console.warn('Error caching repositories:', cacheError);
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
    // Don't redirect if we're waiting for profile to be loaded from user param
    if (!profile && !user) {
      navigate('/');
      return;
    }
    
    // Only fetch repositories if we have a profile
    if (profile) {
      fetchRepositories();
    }
  }, [profile, user, navigate, fetchRepositories]);

  const handleRepositorySelect = (repo) => {
    navigate(`/dashboard/${repo.owner.login}/${repo.name}`, { 
      state: { 
        profile, 
        repository: repo 
      } 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <PageLayout pageName="repository-selection">
      {!profile ? (
        <div>Redirecting...</div>
      ) : (
        <div className="repo-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Select Repository</span>
        </div>

        <div className="repo-main">
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
              <button onClick={() => fetchRepositories(true)} className="retry-btn">
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
      )}
    </PageLayout>
  );
};

export default RepositorySelection;
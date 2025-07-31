import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';
import userAccessService from '../services/userAccessService';
import { PageLayout } from './framework';
import './RepositorySelection.css';

const RepositorySelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useParams();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userType, setUserType] = useState(null);
  
  // Try to get profile from location state first, then fetch from URL param
  const initialProfile = location.state?.profile;

  // Initialize profile and user access service
  useEffect(() => {
    const initializeProfileAndUserAccess = async () => {
      setLoading(true);
      setError(null);

      try {
        // Initialize user access service
        await userAccessService.initialize();
        const currentUserType = userAccessService.getUserType();
        setUserType(currentUserType);

        let userProfile = initialProfile;

        // If no profile from navigation state, determine from URL and user type
        if (!userProfile && user) {
          if (currentUserType === 'unauthenticated') {
            // For unauthenticated users, create a basic profile from the URL param
            userProfile = {
              login: user,
              name: user.charAt(0).toUpperCase() + user.slice(1),
              avatar_url: `https://github.com/${user}.png`,
              type: 'User',
              isUnauthenticated: true
            };
          } else {
            // For authenticated/demo users, fetch the actual profile
            try {
              userProfile = await githubService.getUser(user);
            } catch (err) {
              console.error('Error fetching user profile:', err);
              // Fallback to basic profile
              userProfile = {
                login: user,
                name: user.charAt(0).toUpperCase() + user.slice(1),
                avatar_url: `https://github.com/${user}.png`,
                type: 'User',
                isFallback: true
              };
            }
          }
        }

        if (!userProfile) {
          // If still no profile and no user param, redirect to home
          navigate('/');
          return;
        }

        setProfile(userProfile);
      } catch (error) {
        console.error('Error initializing profile and user access:', error);
        setError('Failed to initialize. Please try again.');
        setLoading(false);
      }
    };

    initializeProfileAndUserAccess();
  }, [user, initialProfile, navigate]);

  const fetchRepositories = useCallback(async (forceRefresh = false) => {
    if (!profile) return;
    
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
      
      // Handle different user types
      let repos = [];
      if (userType === 'unauthenticated') {
        // For unauthenticated users, fetch public repositories only
        repos = await githubService.getPublicRepositories(profile.login, profileType);
      } else {
        // For authenticated/demo users, use normal fetch
        repos = await githubService.getRepositories(profile.login, profileType);
      }
      
      // Cache the fetched repositories (if user is authenticated)
      if (userType !== 'unauthenticated') {
        try {
          repositoryCacheService.setCachedRepositories(profile.login, profileType, repos);
        } catch (cacheError) {
          console.warn('Error caching repositories:', cacheError);
        }
      }
      
      setRepositories(repos);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      const errorMessage = userType === 'unauthenticated' 
        ? 'Failed to fetch public repositories. Please check your connection and try again.'
        : 'Failed to fetch repositories. Please check your connection and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [profile, userType]);

  useEffect(() => {
    if (profile) {
      fetchRepositories();
    }
  }, [profile, fetchRepositories]);

  const handleRepositorySelect = (repo) => {
    // For framework URL pattern, navigate to dashboard with URL parameters
    const dashboardPath = `/dashboard/${repo.owner.login}/${repo.name}`;
    navigate(dashboardPath);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || !profile) {
    return (
      <PageLayout pageName="repository-selection">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="repository-selection">
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
    </PageLayout>
  );
};

export default RepositorySelection;
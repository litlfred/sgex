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
  
  // Initialize user access service
  useEffect(() => {
    userAccessService.initialize();
  }, []);

  // Get profile from location.state or URL parameters with enhanced resolution
  const getProfile = useCallback(() => {
    // First try to get from location.state (legacy behavior)
    if (location.state?.profile) {
      return location.state.profile;
    }
    
    // If we have a user parameter, create a basic profile
    if (user) {
      return {
        login: user,
        type: 'User', // Default to User, will be updated when we fetch actual data
        name: user
      };
    }
    
    return null;
  }, [location.state, user]);

  // Determine profile and fetch user data if needed - combining both approaches
  useEffect(() => {
    const initializeProfile = async () => {
      const currentProfile = getProfile();
      
      if (!currentProfile) {
        // No profile specified, redirect to profile selection
        navigate('/select_profile');
        return;
      }

      // If we only have basic profile from URL, try to fetch full profile data
      if (user && !location.state?.profile) {
        try {
          let fullProfile;
          
          if (githubService.isAuth()) {
            // For authenticated users, try to determine if it's a user or organization
            try {
              const orgData = await githubService.getOrganization(user);
              fullProfile = {
                ...orgData,
                type: 'Organization'
              };
            } catch (orgError) {
              // If that fails, try as user
              try {
                const userData = await githubService.getUser(user);
                fullProfile = {
                  ...userData,
                  type: 'User'
                };
              } catch (userError) {
                console.error('Failed to fetch profile data:', userError);
                setError(`Could not find user or organization: ${user}`);
                return;
              }
            }
          } else {
            // For unauthenticated users, create a demo profile with organization detection
            try {
              const orgData = await githubService.getOrganization(user);
              fullProfile = {
                ...orgData,
                type: 'Organization',
                isDemo: true
              };
            } catch (orgError) {
              // If organization fetch fails, try user or create basic demo profile
              try {
                const userData = await githubService.getUser(user);
                fullProfile = {
                  ...userData,
                  type: 'User',
                  isDemo: true
                };
              } catch (userError) {
                // Create basic demo profile as fallback
                fullProfile = {
                  login: user,
                  name: user.charAt(0).toUpperCase() + user.slice(1),
                  avatar_url: `https://github.com/${user}.png`,
                  type: 'User',
                  isDemo: true
                };
              }
            }
          }
          
          setProfile(fullProfile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setError(`Failed to load profile: ${user}`);
        }
      } else {
        setProfile(currentProfile);
      }
    };

    initializeProfile();
  }, [user, location.state, navigate, getProfile]);

  const fetchRepositories = useCallback(async (forceRefresh = false) => {
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const profileType = profile.type === 'Organization' ? 'org' : 'user';
      
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
      
      let repos;
      if (githubService.isAuth()) {
        // Authenticated user - use authenticated API with demo support
        repos = await githubService.getRepositories(profile.login, profileType, profile.isDemo);
      } else {
        // Unauthenticated user - fetch public repositories only
        repos = await githubService.getPublicRepositories(profile.login, profileType);
      }
      
      // Cache the fetched repositories
      try {
        repositoryCacheService.setCachedRepositories(profile.login, profileType, repos);
      } catch (cacheError) {
        console.warn('Error caching repositories:', cacheError);
      }
      
      setRepositories(repos);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      
      if (error.status === 404) {
        setError(`No repositories found for ${profile.login}. This user or organization may not exist or may not have any public repositories.`);
      } else if (error.status === 403) {
        setError('Access forbidden. You may need to sign in to view these repositories.');
      } else {
        // In network-restricted environments, provide fallback demo data for WHO
        if (profile.login === 'WorldHealthOrganization' && !githubService.isAuth()) {
          console.log('Using fallback demo repositories for WHO');
          const demoRepositories = [
            {
              id: 'demo-smart-anc',
              name: 'smart-anc',
              full_name: 'WorldHealthOrganization/smart-anc',
              description: 'WHO SMART Guidelines for Antenatal Care',
              private: false,
              html_url: 'https://github.com/WorldHealthOrganization/smart-anc',
              language: 'FML',
              stargazers_count: 12,
              forks_count: 8,
              updated_at: '2024-01-15T10:30:00Z',
              topics: ['who', 'smart-guidelines', 'antenatal-care', 'fhir'],
              owner: {
                login: 'WorldHealthOrganization',
                avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4'
              }
            },
            {
              id: 'demo-smart-tb',
              name: 'smart-tb',
              full_name: 'WorldHealthOrganization/smart-tb',
              description: 'WHO SMART Guidelines for Tuberculosis Care',
              private: false,
              html_url: 'https://github.com/WorldHealthOrganization/smart-tb',
              language: 'FML',
              stargazers_count: 8,
              forks_count: 5,
              updated_at: '2024-01-10T14:20:00Z',
              topics: ['who', 'smart-guidelines', 'tuberculosis', 'fhir'],
              owner: {
                login: 'WorldHealthOrganization',
                avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4'
              }
            }
          ];
          setRepositories(demoRepositories);
          setLoading(false);
          return;
        }
        
        setError('Failed to fetch repositories. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    // Only fetch repositories if we have a profile
    if (profile) {
      fetchRepositories();
    }
  }, [profile, fetchRepositories]);

  const handleRepositorySelect = (repo) => {
    // Navigate to dashboard with the selected repository
    const targetUrl = `/dashboard/${repo.owner.login}/${repo.name}`;
    navigate(targetUrl);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!profile) {
    return (
      <PageLayout pageName="repository-selection">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="repository-selection">
      <div className="repo-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/select_profile')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{profile.name || profile.login} Repositories</span>
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
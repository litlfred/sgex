import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RepositorySelection.css';

const RepositorySelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const profile = location.state?.profile;

  useEffect(() => {
    if (!profile) {
      navigate('/');
      return;
    }
    
    const fetchRepositories = async () => {
      try {
        // Mock GitHub repositories - replace with actual Octokit implementation
        const mockRepos = [
          {
            id: 1,
            name: 'smart-guidelines-dak-example',
            full_name: `${profile.login}/smart-guidelines-dak-example`,
            description: 'WHO SMART Guidelines Digital Adaptation Kit for Example Disease',
            private: false,
            updated_at: '2024-01-15T10:30:00Z',
            language: 'JavaScript',
            stargazers_count: 42,
            forks_count: 8,
            topics: ['who', 'smart-guidelines', 'dak', 'health']
          },
          {
            id: 2,
            name: 'dak-maternal-health',
            full_name: `${profile.login}/dak-maternal-health`,
            description: 'Digital Adaptation Kit for Maternal Health Guidelines',
            private: false,
            updated_at: '2024-01-10T14:20:00Z',
            language: 'TypeScript',
            stargazers_count: 28,
            forks_count: 12,
            topics: ['who', 'maternal-health', 'dak']
          },
          {
            id: 3,
            name: 'smart-base-template',
            full_name: `${profile.login}/smart-base-template`,
            description: 'Template repository for WHO SMART Guidelines projects',
            private: false,
            updated_at: '2024-01-08T09:15:00Z',
            language: 'HTML',
            stargazers_count: 156,
            forks_count: 45,
            topics: ['template', 'who', 'smart-guidelines']
          }
        ];
        
        setRepositories(mockRepos);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [profile, navigate]);

  const handleRepositorySelect = (repo) => {
    navigate('/dashboard', { 
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

  if (!profile) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="repository-selection">
      <div className="repo-header">
        <div className="who-branding">
          <h1>SGEX Workbench</h1>
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
          ) : (
            <div className="repo-grid">
              {repositories.length === 0 ? (
                <div className="empty-state">
                  <h3>No DAK repositories found</h3>
                  <p>Create a new repository or check your permissions.</p>
                </div>
              ) : (
                repositories.map((repo) => (
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
                    
                    <p className="repo-description">{repo.description}</p>
                    
                    <div className="repo-topics">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span key={topic} className="topic-tag">{topic}</span>
                      ))}
                      {repo.topics.length > 3 && (
                        <span className="topic-more">+{repo.topics.length - 3} more</span>
                      )}
                    </div>
                    
                    <div className="repo-stats">
                      <div className="stat">
                        <span className="stat-icon">⭐</span>
                        <span>{repo.stargazers_count}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon">🍴</span>
                        <span>{repo.forks_count}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon">📅</span>
                        <span>Updated {formatDate(repo.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepositorySelection;
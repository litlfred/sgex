import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import dakTemplates from '../config/dak-templates.json';
import './DAKSelection.css';

const DAKSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { profile, action } = location.state || {};

  const getActionConfig = () => {
    switch (action) {
      case 'edit':
        return {
          title: 'Select DAK to Edit',
          description: 'Choose an existing DAK repository that you have permission to modify.',
          buttonText: 'Continue to Edit Components',
          nextRoute: '/dashboard'
        };
      case 'fork':
        return {
          title: 'Select DAK to Fork',
          description: 'Choose the source DAK repository that you want to fork.',
          buttonText: 'Continue to Organization Selection',
          nextRoute: '/organization-selection'
        };
      case 'create':
        return {
          title: 'Select Template DAK',
          description: 'Choose a template repository to use as the base for your new DAK.',
          buttonText: 'Continue to Organization Selection',
          nextRoute: '/organization-selection',
          showTemplate: true
        };
      default:
        return {
          title: 'Select DAK Repository',
          description: 'Choose a DAK repository to work with.',
          buttonText: 'Continue',
          nextRoute: '/dashboard'
        };
    }
  };

  const getMockRepositories = useCallback(() => {
    const mockRepos = [
      {
        id: 1,
        name: 'maternal-health-dak',
        full_name: `${profile.login}/maternal-health-dak`,
        description: 'WHO SMART Guidelines for Maternal Health - Digital Adaptation Kit',
        html_url: `https://github.com/${profile.login}/maternal-health-dak`,
        topics: ['who', 'smart-guidelines', 'maternal-health', 'dak'],
        language: 'FML',
        stargazers_count: 12,
        forks_count: 3,
        updated_at: '2024-01-15T10:30:00Z',
        smart_guidelines_compatible: true
      },
      {
        id: 2,
        name: 'immunization-dak',
        full_name: `${profile.login}/immunization-dak`,
        description: 'Digital Adaptation Kit for Immunization Guidelines',
        html_url: `https://github.com/${profile.login}/immunization-dak`,
        topics: ['who', 'smart-guidelines', 'immunization', 'vaccines'],
        language: 'FML',
        stargazers_count: 8,
        forks_count: 2,
        updated_at: '2024-01-10T14:20:00Z',
        smart_guidelines_compatible: true
      },
      {
        id: 3,
        name: 'anc-dak',
        full_name: `${profile.login}/anc-dak`,
        description: 'Antenatal Care Digital Adaptation Kit based on WHO guidelines',
        html_url: `https://github.com/${profile.login}/anc-dak`,
        topics: ['who', 'anc', 'antenatal-care', 'smart-guidelines'],
        language: 'FML',
        stargazers_count: 15,
        forks_count: 5,
        updated_at: '2024-01-12T09:15:00Z',
        smart_guidelines_compatible: true
      }
    ];

    return mockRepos;
  }, [profile.login]);

  const fetchRepositories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let repos = [];
      
      if (action === 'create') {
        // For create action, load templates from configuration
        repos = dakTemplates.dakTemplates.map((template, index) => ({
          id: -(index + 1),
          name: template.repo,
          full_name: `${template.owner}/${template.repo}`,
          description: template.description,
          html_url: template.repository,
          clone_url: `${template.repository}.git`,
          topics: template.tags.map(tag => tag.toLowerCase().replace(/\s+/g, '-')),
          language: 'FML',
          stargazers_count: 15,
          forks_count: 8,
          updated_at: new Date().toISOString(),
          smart_guidelines_compatible: true,
          is_template: true,
          template_config: template,
          owner: {
            login: template.owner,
            avatar_url: template.owner === 'WorldHealthOrganization' 
              ? 'https://avatars.githubusercontent.com/u/9166906?s=200&v=4'
              : 'https://github.com/favicon.ico'
          }
        }));
      } else {
        // For edit/fork, fetch user repositories with SMART Guidelines filtering
        if (githubService.isAuth()) {
          repos = await githubService.getRepositories(profile.login, profile.type === 'org' ? 'org' : 'user');
        } else {
          // Fallback to mock repositories for demonstration
          repos = getMockRepositories();
        }
      }
      
      setRepositories(repos);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please check your connection and try again.');
      // Fallback to mock data for demonstration
      setRepositories(getMockRepositories());
    } finally {
      setLoading(false);
    }
  }, [profile, action, getMockRepositories]);

  useEffect(() => {
    if (!profile || !action) {
      navigate('/');
      return;
    }
    
    fetchRepositories();
  }, [profile, action, navigate, fetchRepositories]);

  const handleRepositorySelect = (repo) => {
    setSelectedRepository(repo);
  };

  const handleContinue = () => {
    if (!selectedRepository) {
      alert('Please select a repository to continue');
      return;
    }

    const config = getActionConfig();
    
    if (action === 'edit') {
      // Go directly to dashboard for editing
      navigate(config.nextRoute, {
        state: {
          profile,
          repository: selectedRepository,
          action
        }
      });
    } else {
      // Go to organization selection for fork/create
      navigate(config.nextRoute, {
        state: {
          profile,
          sourceRepository: selectedRepository,
          action
        }
      });
    }
  };

  const handleBack = () => {
    navigate('/dak-action', { state: { profile } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!profile || !action) {
    return <div>Redirecting...</div>;
  }

  const config = getActionConfig();

  return (
    <div className="dak-selection">
      <div className="selection-header">
        <div className="who-branding">
          <h1>SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="profile-info">
          <img 
            src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
            alt="Profile" 
            className="profile-avatar" 
          />
          <span>{profile.name || profile.login}</span>
        </div>
      </div>

      <div className="selection-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBack} className="breadcrumb-link">
            Choose DAK Action
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Select DAK</span>
        </div>

        <div className="selection-main">
          <div className="selection-intro">
            <h2>{config.title}</h2>
            <p>{config.description}</p>
            {action === 'create' && (
              <div className="template-notice">
                <span className="notice-icon">ℹ️</span>
                <span>You'll create a new repository based on the WHO SMART Guidelines template.</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading repositories...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>Error loading repositories</h3>
              <p>{error}</p>
              <button onClick={fetchRepositories} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : repositories.length === 0 ? (
            <div className="empty-state">
              <h3>No repositories found</h3>
              <p>
                {action === 'create' 
                  ? 'Unable to load the WHO template repository.'
                  : 'No DAK repositories found with SMART Guidelines compatibility.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="repo-grid">
                {repositories.map((repo) => (
                  <div 
                    key={repo.id}
                    className={`repo-card ${selectedRepository?.id === repo.id ? 'selected' : ''}`}
                    onClick={() => handleRepositorySelect(repo)}
                  >
                    <div className="repo-header-info">
                      <h3>{repo.name}</h3>
                      <div className="repo-meta">
                        {repo.is_template && (
                          <span className="template-badge">
                            {repo.template_config?.name || 'Template'}
                          </span>
                        )}
                        {repo.private && <span className="private-badge">Private</span>}
                        {repo.language && <span className="language-badge">{repo.language}</span>}
                        {repo.smart_guidelines_compatible && (
                          <span className="compatible-badge">SMART Guidelines</span>
                        )}
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

                    {selectedRepository?.id === repo.id && (
                      <div className="selection-indicator">
                        <span>✓ Selected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="selection-footer">
                <button 
                  className="continue-btn"
                  onClick={handleContinue}
                  disabled={!selectedRepository}
                >
                  {config.buttonText}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DAKSelection;
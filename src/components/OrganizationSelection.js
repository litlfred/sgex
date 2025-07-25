import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import './OrganizationSelection.css';

const OrganizationSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includePersonal, setIncludePersonal] = useState(true);
  
  const { profile, sourceRepository, action } = location.state || {};
  
  // Use profile or fallback for testing
  const currentProfile = profile || { login: 'testuser', name: 'Test User', avatar_url: 'https://github.com/testuser.png' };

  const getActionConfig = () => {
    const currentAction = action || 'fork'; // fallback
    switch (currentAction) {
      case 'fork':
        return {
          title: 'Select Destination for Fork',
          description: `Choose where to create a fork of "${sourceRepository?.name || 'test-dak'}".`,
          buttonText: 'Fork Repository',
          nextRoute: '/dashboard'
        };
      case 'create':
        return {
          title: 'Select Destination for New DAK',
          description: `Choose where to create your new DAK based on "${sourceRepository?.name || 'test-dak'}".`,
          buttonText: 'Continue to Configuration',
          nextRoute: '/dak-configuration'
        };
      default:
        return {
          title: 'Select Organization',
          description: 'Choose an organization for your DAK.',
          buttonText: 'Continue',
          nextRoute: '/dashboard'
        };
    }
  };

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let orgsData = [];
      
      if (githubService.isAuth()) {
        orgsData = await githubService.getUserOrganizations();
      } else {
        // Fallback to mock organizations for demonstration
        orgsData = getMockOrganizations();
      }
      
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to fetch organizations. Please check your connection and try again.');
      // Fallback to mock data for demonstration
      setOrganizations(getMockOrganizations());
    } finally {
      setLoading(false);
    }
  }, []);

  const getMockOrganizations = () => {
    return [
      {
        id: 1,
        login: 'my-health-org',
        display_name: 'My Health Organization',
        description: 'Healthcare technology organization focused on digital health solutions',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?s=200&v=4',
        html_url: 'https://github.com/my-health-org',
        type: 'Organization',
        permissions: {
          can_create_repositories: true,
          can_create_private_repositories: true
        },
        plan: {
          name: 'Team',
          private_repos: 10
        }
      },
      {
        id: 2,
        login: 'global-health-initiative',
        display_name: 'Global Health Initiative',
        description: 'International organization working on global health standards',
        avatar_url: 'https://avatars.githubusercontent.com/u/2?s=200&v=4',
        html_url: 'https://github.com/global-health-initiative',
        type: 'Organization',
        permissions: {
          can_create_repositories: true,
          can_create_private_repositories: false
        },
        plan: {
          name: 'Free',
          private_repos: 0
        }
      }
    ];
  };

  useEffect(() => {
    // Temporarily bypass state check for testing UI
    if (!profile || !sourceRepository || !action) {
      // Use mock data for testing
      const mockProfile = { login: 'testuser', name: 'Test User', avatar_url: 'https://github.com/testuser.png' };
      const mockRepo = { name: 'test-dak', full_name: 'testuser/test-dak' };
      // Don't navigate away, just use mock data
    }
    
    fetchOrganizations();
  }, [profile, sourceRepository, action, navigate, fetchOrganizations]);

  const handleOrganizationSelect = (org) => {
    setSelectedOrganization(org);
  };

  const handleContinue = () => {
    if (!selectedOrganization) {
      alert('Please select an organization to continue');
      return;
    }

    const config = getActionConfig();
    
    if (action === 'fork') {
      // For fork, go directly to dashboard after forking
      navigate(config.nextRoute, {
        state: {
          profile,
          repository: {
            ...sourceRepository,
            // Update repository info to reflect the fork destination
            full_name: `${selectedOrganization.login}/${sourceRepository.name}`,
            html_url: `https://github.com/${selectedOrganization.login}/${sourceRepository.name}`,
            owner: selectedOrganization
          },
          sourceRepository,
          destinationOrganization: selectedOrganization,
          action
        }
      });
    } else if (action === 'create') {
      // For create, go to DAK configuration
      navigate(config.nextRoute, {
        state: {
          profile,
          templateRepository: sourceRepository,
          destinationOrganization: selectedOrganization,
          action
        }
      });
    }
  };

  const handleBack = () => {
    navigate('/dak-selection', { 
      state: { profile, action } 
    });
  };

  if (!profile || !sourceRepository || !action) {
    // Use mock data for testing UI
    const mockProfile = { login: 'testuser', name: 'Test User', avatar_url: 'https://github.com/testuser.png' };
    const mockRepo = { name: 'test-dak', full_name: 'testuser/test-dak' };
    const mockAction = 'fork';
    // Don't return early, continue with mock data
  }

  const config = getActionConfig();
  
  // Create combined list of options
  const allOptions = [];
  
  if (includePersonal) {
    allOptions.push({
      ...currentProfile,
      type: 'User',
      display_name: currentProfile.name || currentProfile.login,
      description: 'Your personal GitHub account',
      permissions: {
        can_create_repositories: true,
        can_create_private_repositories: true
      },
      isPersonal: true
    });
  }
  
  allOptions.push(...organizations);

  return (
    <div className="organization-selection">
      <div className="org-header">
        <div className="who-branding">
          <h1>SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="profile-info">
          <img 
            src={(currentProfile?.avatar_url) || `https://github.com/${currentProfile?.login || 'testuser'}.png`} 
            alt="Profile" 
            className="profile-avatar" 
          />
          <span>{currentProfile?.name || currentProfile?.login || 'Test User'}</span>
        </div>
      </div>

      <div className="org-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/dak-action', { state: { profile: currentProfile } })} className="breadcrumb-link">
            Choose DAK Action
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBack} className="breadcrumb-link">
            Select DAK
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Select Organization</span>
        </div>

        <div className="org-main">
          <div className="org-intro">
            <h2>{config.title}</h2>
            <p>{config.description}</p>
            
            {sourceRepository && (
              <div className="source-repo-info">
                <span className="repo-label">Source Repository:</span>
                <div className="repo-badge">
                  <span className="repo-name">{sourceRepository.name}</span>
                  <span className="repo-owner">@{sourceRepository.full_name?.split('/')[0]}</span>
                </div>
              </div>
            )}
            {!sourceRepository && (
              <div className="source-repo-info">
                <span className="repo-label">Source Repository:</span>
                <div className="repo-badge">
                  <span className="repo-name">test-dak</span>
                  <span className="repo-owner">@testuser</span>
                </div>
              </div>
            )}
          </div>

          <div className="options-section">
            <div className="include-personal">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includePersonal}
                  onChange={(e) => setIncludePersonal(e.target.checked)}
                />
                <span>Include my personal account as an option</span>
              </label>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading organizations...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <h3>Error loading organizations</h3>
                <p>{error}</p>
                <button onClick={fetchOrganizations} className="retry-btn">
                  Try Again
                </button>
              </div>
            ) : allOptions.length === 0 ? (
              <div className="empty-state">
                <h3>No organizations available</h3>
                <p>Enable personal account option or join organizations to see options here.</p>
              </div>
            ) : (
              <>
                <div className="org-grid">
                  {allOptions.map((org) => (
                    <div 
                      key={`${org.type}-${org.id}`}
                      className={`org-card ${selectedOrganization?.id === org.id && selectedOrganization?.type === org.type ? 'selected' : ''} ${org.isPersonal ? 'personal' : ''}`}
                      onClick={() => handleOrganizationSelect(org)}
                    >
                      <div className="org-header-info">
                        <img 
                          src={org.avatar_url || `https://github.com/${org.login}.png`} 
                          alt={`${org.display_name || org.login} avatar`}
                          className="org-avatar"
                        />
                        <div className="org-details">
                          <h3>{org.display_name || org.login}</h3>
                          <p className="org-login">@{org.login}</p>
                          {org.isPersonal && <span className="personal-badge">Personal</span>}
                        </div>
                      </div>
                      
                      <p className="org-description">{org.description || 'No description available'}</p>
                      
                      <div className="org-permissions">
                        <div className="permission-item">
                          <span className={`permission-icon ${org.permissions?.can_create_repositories ? 'allowed' : 'denied'}`}>
                            {org.permissions?.can_create_repositories ? '✓' : '✗'}
                          </span>
                          <span>Create repositories</span>
                        </div>
                        <div className="permission-item">
                          <span className={`permission-icon ${org.permissions?.can_create_private_repositories ? 'allowed' : 'denied'}`}>
                            {org.permissions?.can_create_private_repositories ? '✓' : '✗'}
                          </span>
                          <span>Create private repositories</span>
                        </div>
                      </div>

                      {org.plan && (
                        <div className="org-plan">
                          <span className="plan-name">{org.plan.name} Plan</span>
                          {org.plan.private_repos !== undefined && (
                            <span className="plan-repos">{org.plan.private_repos} private repos</span>
                          )}
                        </div>
                      )}

                      {selectedOrganization?.id === org.id && selectedOrganization?.type === org.type && (
                        <div className="selection-indicator">
                          <span>✓ Selected</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="org-footer">
                  <button 
                    className="continue-btn"
                    onClick={handleContinue}
                    disabled={!selectedOrganization}
                  >
                    {config.buttonText}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSelection;
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import samlAuthService from '../services/samlAuthService';
import SAMLAuthModal from './SAMLAuthModal';
import { PageLayout } from './framework';

const OrganizationSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includePersonal, setIncludePersonal] = useState(true);
  const [samlModalOpen, setSamlModalOpen] = useState(false);
  const [samlModalInfo, setSamlModalInfo] = useState(null);
  
  const { profile, sourceRepository, action } = location.state || {};

  const getActionConfig = () => {
    switch (action) {
      case 'fork':
        return {
          title: 'Select Destination for Fork',
          description: `Choose where to create a fork of "${sourceRepository?.name}".`,
          buttonText: 'Fork Repository',
          nextRoute: '/dashboard'
        };
      case 'create':
        return {
          title: 'Select Destination for New DAK',
          description: `Choose where to create your new DAK based on "${sourceRepository?.name}".`,
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
        orgsData = await getMockOrganizations();
      }
      
      // Always ensure WHO organization is included with fresh data
      try {
        const whoOrganization = await githubService.getWHOOrganization();
        
        // Check if WHO organization is already in the list
        const whoIndex = orgsData.findIndex(org => org.login === 'WorldHealthOrganization');
        
        if (whoIndex >= 0) {
          // Replace existing WHO org with fresh data
          orgsData[whoIndex] = { ...orgsData[whoIndex], ...whoOrganization };
        } else {
          // Add WHO organization at the beginning of the list
          orgsData.unshift(whoOrganization);
        }
      } catch (whoError) {
        console.warn('Could not fetch WHO organization data, using fallback:', whoError);
        
        // Fallback to hardcoded WHO organization
        const whoOrganization = {
          id: 'who-organization',
          login: 'WorldHealthOrganization',
          display_name: 'World Health Organization',
          description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
          avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
          html_url: 'https://github.com/WorldHealthOrganization',
          type: 'Organization',
          permissions: {
            can_create_repositories: true,
            can_create_private_repositories: true
          },
          plan: {
            name: 'Organization',
            private_repos: 'unlimited'
          },
          isWHO: true
        };
        
        // Check if WHO organization is already in the list
        const hasWHO = orgsData.some(org => org.login === 'WorldHealthOrganization');
        
        if (!hasWHO) {
          // Add WHO organization at the beginning of the list
          orgsData.unshift(whoOrganization);
        }
      }
      
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to fetch organizations. Please check your connection and try again.');
      // Fallback to mock data for demonstration (which includes WHO)
      try {
        const mockOrgs = await getMockOrganizations();
        setOrganizations(mockOrgs);
      } catch (mockError) {
        // Ultimate fallback with hardcoded data
        setOrganizations([{
          id: 'who-organization',
          login: 'WorldHealthOrganization',
          display_name: 'World Health Organization',
          description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
          avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
          html_url: 'https://github.com/WorldHealthOrganization',
          type: 'Organization',
          permissions: {
            can_create_repositories: true,
            can_create_private_repositories: true
          },
          plan: {
            name: 'Organization',
            private_repos: 'unlimited'
          },
          isWHO: true
        }]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getMockOrganizations = async () => {
    try {
      // Try to get fresh WHO data even in mock mode
      const whoOrganization = await githubService.getWHOOrganization();
      
      return [
        whoOrganization,
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
    } catch (error) {
      console.warn('Could not fetch WHO data for mock organizations, using fallback:', error);
      // Return original hardcoded mock data
      return [
        {
          id: 'who-organization',
          login: 'WorldHealthOrganization',
          display_name: 'World Health Organization',
          description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
          avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
          html_url: 'https://github.com/WorldHealthOrganization',
          type: 'Organization',
          permissions: {
            can_create_repositories: true,
            can_create_private_repositories: true
          },
          plan: {
            name: 'Organization',
            private_repos: 'unlimited'
          },
          isWHO: true
        },
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
    }
  };

  useEffect(() => {
    if (!profile || !sourceRepository || !action) {
      navigate('/');
      return;
    }
    
    // Register SAML modal callback
    samlAuthService.registerModalCallback((samlInfo) => {
      setSamlModalInfo(samlInfo);
      setSamlModalOpen(true);
    });
    
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
    navigate(`/dak-selection/${profile.login}`, { 
      state: { profile, action } 
    });
  };

  const config = getActionConfig();
  
  // Create combined list of options
  const allOptions = [];
  
  if (includePersonal) {
    allOptions.push({
      ...profile,
      type: 'User',
      display_name: profile.name || profile.login,
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
    <PageLayout pageName="organization-selection">
      {!profile || !sourceRepository || !action ? (
        <div>Redirecting...</div>
      ) : (
        <div className="org-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/dak-action', { state: { profile } })} className="breadcrumb-link">
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
                      className={`org-card ${selectedOrganization?.id === org.id && selectedOrganization?.type === org.type ? 'selected' : ''} ${org.isPersonal ? 'personal' : ''} ${org.isWHO ? 'who-org' : ''}`}
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
                          {org.isWHO && <span className="who-badge">WHO Official</span>}
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
      )}
      
      {/* SAML Authorization Modal */}
      <SAMLAuthModal
        isOpen={samlModalOpen}
        onClose={() => {
          setSamlModalOpen(false);
          setSamlModalInfo(null);
        }}
        samlInfo={samlModalInfo}
      />
    </PageLayout>
  );
};

export default OrganizationSelection;
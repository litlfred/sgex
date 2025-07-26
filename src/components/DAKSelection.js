import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';
import dakTemplates from '../config/dak-templates.json';
import './DAKSelection.css';

const DAKSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [currentlyScanningRepos, setCurrentlyScanningRepos] = useState(new Set());
  const [usingCachedData, setUsingCachedData] = useState(false);
  
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
    // Mock repositories - only some have SMART guidelines compatibility
    const allMockRepos = [
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
      },
      {
        id: 4,
        name: 'regular-health-app',
        full_name: `${profile.login}/regular-health-app`,
        description: 'A regular health application without SMART Guidelines',
        html_url: `https://github.com/${profile.login}/regular-health-app`,
        topics: ['health', 'app', 'javascript'],
        language: 'JavaScript',
        stargazers_count: 5,
        forks_count: 1,
        updated_at: '2024-01-08T16:45:00Z',
        smart_guidelines_compatible: false // This one doesn't have sushi-config.yaml with smart.who.int.base
      },
      {
        id: 5,
        name: 'medical-database',
        full_name: `${profile.login}/medical-database`,
        description: 'Medical database with FHIR but not SMART Guidelines',
        html_url: `https://github.com/${profile.login}/medical-database`,
        topics: ['fhir', 'database', 'medical'],
        language: 'SQL',
        stargazers_count: 7,
        forks_count: 2,
        updated_at: '2024-01-05T11:20:00Z',
        smart_guidelines_compatible: false // This one also doesn't have the required sushi-config.yaml
      }
    ];

    // Filter to only return SMART guidelines compatible repositories
    return allMockRepos.filter(repo => repo.smart_guidelines_compatible);
  }, [profile.login]);

  const simulateEnhancedScanning = useCallback(async () => {
    setIsScanning(true);
    setRepositories([]); // Clear current repositories for progressive updates
    
    const mockRepos = getMockRepositories();
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      // Simulate concurrent scanning with enhanced display
      for (let i = 0; i < mockRepos.length; i++) {
        const repo = mockRepos[i];
        
        // Simulate starting to scan this repository
        setScanProgress({
          current: i + 1,
          total: mockRepos.length,
          currentRepo: repo.name,
          progress: Math.round(((i + 1) / mockRepos.length) * 100),
          completed: false,
          started: true
        });
        
        // Add to currently scanning repos
        setCurrentlyScanningRepos(prev => new Set([...prev, repo.name]));
        
        // Simulate scanning time (1-2 seconds per repository)
        await delay(1000 + Math.random() * 1000);
        
        // Add found repository to results
        setRepositories(prevRepos => [...prevRepos, repo]);
        
        // Simulate completion
        setScanProgress({
          current: i + 1,
          total: mockRepos.length,
          currentRepo: repo.name,
          progress: Math.round(((i + 1) / mockRepos.length) * 100),
          completed: true
        });
        
        // Remove from currently scanning repos
        setCurrentlyScanningRepos(prev => {
          const newSet = new Set(prev);
          newSet.delete(repo.name);
          return newSet;
        });
        
        // Small delay before next repository
        await delay(300);
      }
    } catch (error) {
      console.error('Error in simulated scanning:', error);
    }
  }, [getMockRepositories]);

  const fetchRepositories = useCallback(async (forceRescan = false, useCachedData = false) => {
    setLoading(true);
    setError(null);
    setIsScanning(false);
    setScanProgress(null);
    setCurrentlyScanningRepos(new Set());
    setUsingCachedData(false);
    
    try {
      let repos = [];
      let cachedData = null;
      
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
        setRepositories(repos);
      } else {
        // For edit/fork actions, implement cache-first approach
        
        // Always check cache first unless explicitly forcing a rescan
        if (githubService.isAuth() && !forceRescan) {
          try {
            cachedData = repositoryCacheService.getCachedRepositories(profile.login, profile.type === 'org' ? 'org' : 'user');
          } catch (cacheError) {
            console.warn('Error accessing repository cache:', cacheError);
          }
        }

        if (cachedData && !forceRescan) {
          // Use cached data - show immediately
          console.log('Using cached repository data', repositoryCacheService.getCacheInfo(profile.login, profile.type === 'org' ? 'org' : 'user'));
          repos = cachedData.repositories;
          setUsingCachedData(true);
          setRepositories(repos);
        } else {
          // No cached data or forcing rescan - initiate progressive scanning
          if (githubService.isAuth()) {
            console.log(forceRescan ? 'Force rescanning repositories...' : 'No cached data, initiating scan...');
            setIsScanning(true);
            
            // Important: Don't clear existing repositories when scanning
            // This preserves any cached repos that were already displayed
            
            repos = await githubService.getSmartGuidelinesRepositoriesProgressive(
              profile.login, 
              profile.type === 'org' ? 'org' : 'user',
              // onRepositoryFound callback - add repo to list immediately
              (foundRepo) => {
                setRepositories(prevRepos => {
                  // Avoid duplicates
                  const exists = prevRepos.some(repo => repo.id === foundRepo.id);
                  if (!exists) {
                    return [...prevRepos, foundRepo];
                  }
                  return prevRepos;
                });
              },
              // onProgress callback - update progress indicator
              (progress) => {
                setScanProgress(progress);
                
                // Track repositories currently being scanned
                if (progress.started && !progress.completed) {
                  // Repository is being started
                  setCurrentlyScanningRepos(prev => new Set([...prev, progress.currentRepo]));
                } else if (progress.completed) {
                  // Repository is completed
                  setCurrentlyScanningRepos(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(progress.currentRepo);
                    return newSet;
                  });
                }
              }
            );
            
            // Cache the results for future quick access
            repositoryCacheService.setCachedRepositories(
              profile.login, 
              profile.type === 'org' ? 'org' : 'user', 
              repos
            );
            
            // Update repositories with final results (in case callback missed any)
            setRepositories(repos);
          } else {
            // Fallback to mock repositories with enhanced scanning demonstration
            await simulateEnhancedScanning();
            repos = getMockRepositories();
            setRepositories(repos);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please check your connection and try again.');
      // Fallback to mock data for demonstration
      setRepositories(getMockRepositories());
    } finally {
      setLoading(false);
      setIsScanning(false);
      setScanProgress(null);
      setCurrentlyScanningRepos(new Set());
    }
  }, [profile, action, getMockRepositories, simulateEnhancedScanning]);

  useEffect(() => {
    if (!profile || !action) {
      navigate('/');
      return;
    }
    
    // Always check cache first on initial load
    fetchRepositories(false, false); // forceRescan=false, useCachedData=false (but still check cache first)
  }, [profile, action, navigate, fetchRepositories]);

  const handleRepositorySelect = (repo) => {
    setSelectedRepository(repo);
    
    // For 'edit' action, automatically navigate after selection
    if (action === 'edit') {
      // Add a small delay for visual feedback before navigation
      setTimeout(() => {
        const config = getActionConfig();
        navigate(config.nextRoute, {
          state: {
            profile,
            repository: repo,
            action
          }
        });
      }, 300); // 300ms delay for visual feedback
    }
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
          profile: profile,
          repository: selectedRepository,
          action: action
        }
      });
    } else {
      // Go to organization selection for fork/create
      navigate(config.nextRoute, {
        state: {
          profile: profile,
          sourceRepository: selectedRepository,
          action: action
        }
      });
    }
  };

  const handleRescan = () => {
    fetchRepositories(true, false); // Force rescan, don't use cache
  };

  const handleUseCachedData = () => {
    fetchRepositories(false, false); // Don't force rescan, check cache first (this should use cache if available)
  };

  const handleDemoScanning = async () => {
    // Simulate the enhanced scanning display for demonstration purposes
    await simulateEnhancedScanning();
  };

  const handleBack = () => {
    navigate('/dak-action', { state: { profile: profile } });
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

  if (!profile || !action) {
    return <div>Redirecting...</div>;
  }

  const config = getActionConfig();

  return (
    <div className="dak-selection">
      <div className="selection-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="profile-info">
          <img 
            src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
            alt="Profile" 
            className="profile-avatar" 
          />
          <span>{profile.name || profile.login}</span>
          <a href="/sgex/docs/overview" className="nav-link">📖 Documentation</a>
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
            
            {action !== 'create' && githubService.isAuth() && (
              <div className="cache-controls">
                {usingCachedData ? (
                  <div className="cache-info">
                    <span className="cache-icon">💾</span>
                    <span>Using cached data. </span>
                    <button 
                      onClick={handleRescan} 
                      className="rescan-link"
                      disabled={isScanning}
                    >
                      {isScanning ? 'Scanning...' : 'Rescan Repositories'}
                    </button>
                  </div>
                ) : (
                  <div className="scan-controls">
                    {!isScanning && !loading && (
                      <>
                        <button 
                          onClick={handleRescan} 
                          className="rescan-btn"
                          disabled={isScanning}
                        >
                          🔄 Rescan Repositories
                        </button>
                        {repositoryCacheService.getCachedRepositories(profile.login, profile.type === 'org' ? 'org' : 'user') && (
                          <button 
                            onClick={handleUseCachedData} 
                            className="cache-btn"
                            disabled={isScanning}
                          >
                            💾 Use Cached Data
                          </button>
                        )}
                      </>
                    )}
                    {isScanning && (
                      <div className="scanning-indicator">
                        <span className="scanning-icon">🔍</span>
                        <span>Scanning in progress...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {action !== 'create' && !githubService.isAuth() && !isScanning && !loading && (
              <div className="demo-controls">
                <div className="demo-info">
                  <span className="demo-icon">🎭</span>
                  <span>Not authenticated. </span>
                  <button 
                    onClick={handleDemoScanning} 
                    className="demo-scan-btn"
                    disabled={isScanning}
                  >
                    ✨ Demo Enhanced Scanning Display
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading repositories...</p>
            </div>
          ) : isScanning ? (
            <div className="scanning-status">
              <div className="scanning-header">
                <div className="spinner"></div>
                <h3>Scanning repositories for SMART Guidelines compatibility...</h3>
              </div>
              {scanProgress && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${scanProgress.progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-info">
                    {/* Show currently scanning repositories */}
                    {currentlyScanningRepos.size > 0 && (
                      <div className="currently-scanning-section">
                        <div className="scanning-section-title">
                          <span className="scanning-icon">🔍</span>
                          <span>Currently Testing:</span>
                        </div>
                        <div className="currently-scanning-repos">
                          {Array.from(currentlyScanningRepos).map((repoName) => (
                            <div key={repoName} className="scanning-repo-item">
                              <span className="repo-status-indicator">⚡</span>
                              <span className="scanning-repo-name">{repoName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Show most recent progress update */}
                    <div className="current-repo-status">
                      <span className="status-icon">
                        {scanProgress.completed ? '✅' : '🔍'}
                      </span>
                      <span className="current-repo-name">
                        {scanProgress.completed ? 'Completed' : 'Testing'}: <strong>{scanProgress.currentRepo}</strong>
                      </span>
                    </div>
                    
                    <div className="progress-stats">
                      <span className="progress-text">
                        {scanProgress.current}/{scanProgress.total} repositories
                      </span>
                      <span className="progress-percentage">{scanProgress.progress}%</span>
                    </div>
                  </div>
                  <div className="scanning-note">
                    <span className="note-icon">⚡</span>
                    <span>Scanning up to 5 repositories concurrently to improve speed</span>
                  </div>
                </div>
              )}
              <div className="scanning-results">
                <p>Found repositories will appear below as they are discovered:</p>
                <div className="repo-grid">
                  {repositories.map((repo) => (
                    <div 
                      key={repo.id}
                      className={`repo-card ${selectedRepository?.id === repo.id ? 'selected' : ''} scanning-found`}
                      onClick={() => handleRepositorySelect(repo)}
                    >
                      <div className="repo-header-info">
                        <h3>{repo.name} <span className="new-badge">✨ Found</span></h3>
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
              </div>
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
                {action !== 'edit' && (
                  <button 
                    className="continue-btn"
                    onClick={handleContinue}
                    disabled={!selectedRepository}
                  >
                    {config.buttonText}
                  </button>
                )}
                {action === 'edit' && (
                  <div className="direct-selection-note">
                    <span className="note-icon">💡</span>
                    <span>Click on a repository above to start editing its components</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DAKSelection;
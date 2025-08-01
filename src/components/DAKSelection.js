import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';
import dakTemplates from '../config/dak-templates.json';
import { PageLayout, usePageParams } from './framework';
import './DAKSelection.css';

const DAKSelection = () => {
  return (
    <PageLayout pageName="dak-selection" showHeader={true}>
      <DAKSelectionContent />
    </PageLayout>
  );
};

const DAKSelectionContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { params, profile } = usePageParams();
  const userParam = params?.user;
  
  // Store effectiveProfile in a ref to prevent cascade recreation of helper functions
  // This prevents fetchRepositories from being recreated on every profile change,
  // which was causing unnecessary API calls and bypassing cache policies
  const effectiveProfileRef = useRef();
  effectiveProfileRef.current = effectiveProfile;
  const { action } = location.state || {};
  
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [currentlyScanningRepos, setCurrentlyScanningRepos] = useState(new Set());
  const [usingCachedData, setUsingCachedData] = useState(false);

  // Validate user parameter and profile consistency
  useEffect(() => {
    // If no user parameter in URL and no profile in state, redirect to landing
    if (!userParam && !effectiveProfile) {
      navigate('/');
      return;
    }
    
    // If user parameter exists but no action - redirect to action selection
    if (userParam && !action) {
      navigate(`/dak-action/${userParam}`, { replace: true });
      return;
    }
    
    // If user parameter exists but no profile - redirect to landing
    if (userParam && !effectiveProfile) {
      navigate('/');
      return;
    }
    
    // If user parameter exists and profile exists but they don't match - redirect to landing
    if (userParam && effectiveProfile && effectiveProfile.login !== userParam) {
      navigate('/');
      return;
    }
    
    // If profile exists but no user parameter, redirect to include user in URL
    if (effectiveProfile && !userParam) {
      navigate(`/dak-selection/${effectiveProfile.login}`, { 
        state: { profile: effectiveProfile, action },
        replace: true 
      });
      return;
    }
  }, [userParam, effectiveProfile, action, navigate]);

  // Helper function to extract user and repo from repository object
  const getRepositoryPath = (repository) => {
    if (!repository) return null;
    
    // Get user from owner.login or fallback to parsing full_name
    const user = repository.owner?.login || repository.full_name?.split('/')[0];
    const repo = repository.name;
    
    if (!user || !repo) {
      console.error('Unable to extract user/repo from repository object:', repository);
      return null;
    }
    
    return { user, repo };
  };

  const getActionConfig = () => {
    switch (action) {
      case 'edit':
        return {
          title: 'Select DAK to Edit',
          description: 'Choose an existing DAK repository that you have permission to modify.',
          buttonText: 'Continue to Edit Components',
          nextRoute: '/dashboard'  // This will be constructed dynamically with user/repo
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
          nextRoute: '/dashboard'  // This will be constructed dynamically with user/repo
        };
    }
  };

  // Helper function that creates mock repositories for demo/testing
  // Uses ref to access current profile, preventing cascade recreation
  const getMockRepositories = useCallback(() => {
    const profile = effectiveProfileRef.current;
    if (!profile || !profile.login) {
      return [];
    }
    
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
  }, []);

  // Simulate enhanced scanning for demo purposes  
  // Uses ref to access current profile, preventing cascade recreation
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
        
        // Add found repository to results in alphabetical order
        setRepositories(prevRepos => {
          const newRepos = [...prevRepos, repo];
          return newRepos.sort((a, b) => a.name.localeCompare(b.name));
        });
        
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
      
      // After all repositories are scanned, stop the scanning state
      console.log('🎉 Demo scanning completed, stopping scanning state');
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(null);
        setCurrentlyScanningRepos(new Set());
      }, 500); // Small delay to show completion
    } catch (error) {
      console.error('Error in simulated scanning:', error);
      // Make sure to stop scanning on error
      setIsScanning(false);
      setScanProgress(null);
      setCurrentlyScanningRepos(new Set());
    }
  }, [getMockRepositories]);

  // Main function to fetch repositories with proper cache-first approach
  // Fixed: Removed getMockRepositories and simulateEnhancedScanning from dependencies
  // to prevent cascade recreation when profile changes, ensuring cache policies are respected
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
        // Sort templates alphabetically by name
        repos.sort((a, b) => a.name.localeCompare(b.name));
        setRepositories(repos);
      } else {
        // For edit/fork actions, implement cache-first approach
        
        // Always check cache first unless explicitly forcing a rescan
        if (githubService.isAuth() && !forceRescan) {
          try {
            cachedData = repositoryCacheService.getCachedRepositories(effectiveProfile.login, effectiveProfile.type === 'org' ? 'org' : 'user');
          } catch (cacheError) {
            console.warn('Error accessing repository cache:', cacheError);
          }
        }

        if (cachedData && !forceRescan) {
          // Use cached data - show immediately
          console.log('Using cached repository data', repositoryCacheService.getCacheInfo(effectiveProfile.login, effectiveProfile.type === 'org' ? 'org' : 'user'));
          repos = cachedData.repositories;
          setUsingCachedData(true);
          // Sort cached repositories alphabetically
          repos.sort((a, b) => a.name.localeCompare(b.name));
          setRepositories(repos);
        } else {
          // No cached data or forcing rescan - initiate progressive scanning
          if (githubService.isAuth()) {
            console.log(forceRescan ? '🔄 Force rescanning repositories...' : '🔍 No cached data, initiating scan...');
            setIsScanning(true);
            setLoading(false); // Stop loading state to show scanning progress
            
            // Important: Don't clear existing repositories when scanning
            // This preserves any cached repos that were already displayed
            console.log('📊 Starting enhanced scanning display for authenticated user');
            
            // Add timeout wrapper to prevent infinite scanning
            const SCAN_TIMEOUT = 60000; // 60 seconds timeout
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Scanning timeout - operation took longer than 60 seconds')), SCAN_TIMEOUT);
            });
            
            const scanPromise = githubService.getSmartGuidelinesRepositoriesProgressive(
              effectiveProfile.login, 
              effectiveProfile.type === 'org' ? 'org' : 'user',
              // onRepositoryFound callback - add repo to list immediately in alphabetical order
              (foundRepo) => {
                setRepositories(prevRepos => {
                  // Avoid duplicates
                  const exists = prevRepos.some(repo => repo.id === foundRepo.id);
                  if (!exists) {
                    // Add the new repository and sort alphabetically by name
                    const newRepos = [...prevRepos, foundRepo];
                    return newRepos.sort((a, b) => a.name.localeCompare(b.name));
                  }
                  return prevRepos;
                });
              },
              // onProgress callback - update progress indicator with enhanced display
              (progress) => {
                console.log('📊 Real scanning progress:', progress);
                setScanProgress(progress);
                
                // Track repositories currently being scanned with enhanced display timing
                if (progress.started && !progress.completed) {
                  // Repository is being started - add to currently scanning set
                  console.log('🔍 Started scanning:', progress.currentRepo);
                  setCurrentlyScanningRepos(prev => new Set([...prev, progress.currentRepo]));
                  
                  // Ensure the scanning state is properly set
                  setScanProgress({
                    ...progress,
                    started: true,
                    completed: false
                  });
                } else if (progress.completed) {
                  // Repository is completed - show completion state
                  console.log('✅ Completed scanning:', progress.currentRepo);
                  setScanProgress({
                    ...progress,
                    completed: true
                  });
                  
                  // Remove from currently scanning set after a brief moment
                  setTimeout(() => {
                    setCurrentlyScanningRepos(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(progress.currentRepo);
                      return newSet;
                    });
                  }, 200);
                  
                  // Check if this is the last repository being scanned
                  if (progress.current === progress.total) {
                    // All repositories have been scanned, stop the scanning state
                    console.log('🎉 All repositories scanned, stopping scanning state');
                    setTimeout(() => {
                      setIsScanning(false);
                      setScanProgress(null);
                      setCurrentlyScanningRepos(new Set());
                    }, 500); // Small delay to show completion
                  }
                } else if (progress.total === 0 && progress.completed) {
                  // Special case: no repositories to scan
                  console.log('🎉 No repositories to scan, stopping scanning state');
                  setTimeout(() => {
                    setIsScanning(false);
                    setScanProgress(null);
                    setCurrentlyScanningRepos(new Set());
                  }, 500);
                }
              }
            );
            
            try {
              // Race between the scanning promise and timeout
              repos = await Promise.race([scanPromise, timeoutPromise]);
            } catch (timeoutError) {
              console.error('⏰ Scanning timed out:', timeoutError.message);
              // Stop scanning on timeout
              setIsScanning(false);
              setScanProgress(null);
              setCurrentlyScanningRepos(new Set());
              throw new Error('Repository scanning timed out. Please try again or use cached data if available.');
            }
            
            // Cache the results for future quick access
            repositoryCacheService.setCachedRepositories(
              effectiveProfile.login, 
              effectiveProfile.type === 'org' ? 'org' : 'user', 
              repos
            );
            
            // Update repositories with final results (in case callback missed any)
            // Sort alphabetically to ensure consistent ordering
            const sortedRepos = repos.sort((a, b) => a.name.localeCompare(b.name));
            setRepositories(sortedRepos);
          } else {
            // Fallback to mock repositories with enhanced scanning demonstration
            await simulateEnhancedScanning();
            repos = getMockRepositories();
            // Sort mock repositories alphabetically
            repos.sort((a, b) => a.name.localeCompare(b.name));
            setRepositories(repos);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please check your connection and try again.');
      // Fallback to mock data for demonstration
      const mockRepos = getMockRepositories();
      mockRepos.sort((a, b) => a.name.localeCompare(b.name));
      setRepositories(mockRepos);
      // Make sure to stop scanning on error
      setIsScanning(false);
      setScanProgress(null);
      setCurrentlyScanningRepos(new Set());
    } finally {
      setLoading(false);
      // Don't automatically stop scanning here for authenticated progressive scans
      // or for demo scanning - let them manage their own scanning state
      if (!githubService.isAuth() && action === 'create') {
        // Only auto-stop for create action when not authenticated
        setIsScanning(false);
        setScanProgress(null);
        setCurrentlyScanningRepos(new Set());
      }
    }
  // Note: getMockRepositories and simulateEnhancedScanning are intentionally NOT included
  // in dependencies to prevent cascade recreation. They access profile via ref.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveProfile, action]);

  useEffect(() => {
    // Only proceed if we have valid profile, action and userParam consistency
    if (!effectiveProfile || !action || !userParam || effectiveProfile.login !== userParam) {
      return;
    }
    
    // Always check cache first on initial load
    fetchRepositories(false, false); // forceRescan=false, useCachedData=false (but still check cache first)
  }, [effectiveProfile, action, userParam, fetchRepositories]);

  const handleRepositorySelect = (repo) => {
    setSelectedRepository(repo);
    
    // For 'edit' action, automatically navigate after selection
    if (action === 'edit') {
      // Add a small delay for visual feedback before navigation
      setTimeout(() => {
        const repoPath = getRepositoryPath(repo);
        if (repoPath) {
          const dashboardUrl = `/dashboard/${repoPath.user}/${repoPath.repo}`;
          navigate(dashboardUrl, {
            state: {
              profile: effectiveProfile,
              repository: repo,
              action
            }
          });
        } else {
          // Fallback to original behavior if unable to extract path
          const config = getActionConfig();
          navigate(config.nextRoute, {
            state: {
              profile: effectiveProfile,
              repository: repo,
              action
            }
          });
        }
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
      // Go directly to dashboard for editing with user/repo parameters
      const repoPath = getRepositoryPath(selectedRepository);
      if (repoPath) {
        const dashboardUrl = `/dashboard/${repoPath.user}/${repoPath.repo}`;
        navigate(dashboardUrl, {
          state: {
            profile: effectiveProfile,
            repository: selectedRepository,
            action: action
          }
        });
      } else {
        // Fallback to original behavior if unable to extract path
        navigate(config.nextRoute, {
          state: {
            profile: effectiveProfile,
            repository: selectedRepository,
            action: action
          }
        });
      }
    } else {
      // Go to organization selection for fork/create
      navigate(config.nextRoute, {
        state: {
          profile: effectiveProfile,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!effectiveProfile || !action || !userParam || effectiveProfile.login !== userParam) {
    return <div className="dak-selection"><div style={{color: 'white', textAlign: 'center', padding: '2rem'}}>Redirecting...</div></div>;
  }

  const config = getActionConfig();

  return (
    <div className="dak-selection">
      <div className="selection-content">
        <div className="selection-main">
          <div className="selection-header">
            <div className="selection-title">
              <h1>{config.title}</h1>
              <p className="selection-subtitle">{config.description}</p>
            </div>
          </div>
          <div className="selection-intro">
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
                      {isScanning ? 'Scanning...' : 'Refresh'}
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
                        {repositoryCacheService.getCachedRepositories(effectiveProfile.login, effectiveProfile.type === 'org' ? 'org' : 'user') && (
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
                    {/* Unified scanning status showing percentage and currently testing repos */}
                    <div className="unified-scanning-status">
                      <div className="scanning-header-unified">
                        <div className="progress-stats">
                          <span className="progress-text">
                            {scanProgress.current}/{scanProgress.total} repositories
                          </span>
                          <span className="progress-percentage">{scanProgress.progress}%</span>
                        </div>
                        {/* Always show Currently Testing section to maintain consistent height */}
                        <div className="currently-testing-unified">
                          <span className="scanning-icon">🔍</span>
                          <span>Currently Testing:</span>
                          <div className="currently-scanning-repos">
                            {currentlyScanningRepos.size > 0 ? (
                              Array.from(currentlyScanningRepos).map((repoName) => (
                                <div key={repoName} className="scanning-repo-item">
                                  <span className="repo-status-indicator">⚡</span>
                                  <span className="scanning-repo-name">{repoName}</span>
                                </div>
                              ))
                            ) : (
                              <div className="scanning-repo-item">
                                <span className="repo-status-indicator">⏳</span>
                                <span className="scanning-repo-name">Preparing scan...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
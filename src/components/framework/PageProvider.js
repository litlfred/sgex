import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import githubService from '../../services/githubService';
import dakValidationService from '../../services/dakValidationService';
import profileSubscriptionService from '../../services/profileSubscriptionService';

/**
 * Page types supported by the framework
 */
export const PAGE_TYPES = {
  TOP_LEVEL: 'top-level',
  USER: 'user', 
  DAK: 'dak',
  ASSET: 'asset'
};

/**
 * Context for page framework
 */
const PageContext = createContext(null);

/**
 * Hook to use page context
 */
export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};

/**
 * Determine page type from URL parameters
 */
const determinePageType = (params) => {
  const { user, repo, asset } = params;
  
  if (asset) return PAGE_TYPES.ASSET;
  if (user && repo) return PAGE_TYPES.DAK;
  if (user) return PAGE_TYPES.USER;
  return PAGE_TYPES.TOP_LEVEL;
};

/**
 * Provider component for page framework
 */
export const PageProvider = ({ children, pageName }) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [pageState, setPageState] = useState({
    type: determinePageType(params),
    pageName,
    loading: false,
    error: null,
    user: null,
    profile: null,
    repository: null,
    branch: null,
    asset: null,
    isAuthenticated: githubService.isAuth()
  });

  // Extract URL parameters
  const { user, repo, asset } = params;

  // Load data based on page type
  useEffect(() => {
    const loadPageData = async () => {
      try {
        setPageState(prev => ({ ...prev, loading: true, error: null }));

        // Use location state if available, otherwise fetch from URL params
        let profile = location.state?.profile;
        let repository = location.state?.repository;
        let selectedBranch = location.state?.selectedBranch || params.branch;

        // For DAK and Asset pages, validate and fetch data
        if (pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
          if (!profile && user) {
            if (githubService.isAuth()) {
              try {
                profile = await githubService.getUser(user);
              } catch (err) {
                // For dashboard pages, redirect instead of throwing error
                if (pageName === 'dashboard' || pageName.includes('editor') || pageName.includes('viewer') || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
                  navigate('/', { 
                    state: { 
                      warningMessage: `Could not access the requested DAK. User '${user}' not found or not accessible.` 
                    }, 
                    replace: true 
                  });
                  return;
                }
                throw new Error(`User '${user}' not found or not accessible.`);
              }
            } else {
              // Demo mode for DAK validation
              const isValidDAK = dakValidationService.validateDemoDAKRepository(user, repo);
              if (!isValidDAK) {
                // For dashboard pages, redirect instead of throwing error
                if (pageName === 'dashboard' || pageName.includes('editor') || pageName.includes('viewer') || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
                  navigate('/', { 
                    state: { 
                      warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
                    }, 
                    replace: true 
                  });
                  return;
                }
                throw new Error(`Repository '${user}/${repo}' not found or not accessible.`);
              }
              profile = {
                login: user,
                name: user.charAt(0).toUpperCase() + user.slice(1),
                avatar_url: `https://github.com/${user}.png`,
                type: 'User',
                isDemo: true
              };
            }
          }

          if (!repository && user && repo) {
            if (githubService.isAuth()) {
              try {
                repository = await githubService.getRepository(user, repo);
                // Validate it's a DAK repository
                const isValidDAK = await dakValidationService.validateDAKRepository(user, repo, selectedBranch || repository.default_branch);
                if (!isValidDAK) {
                  // For dashboard pages, redirect instead of throwing error
                  if (pageName === 'dashboard' || pageName.includes('editor') || pageName.includes('viewer') || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
                    navigate('/', { 
                      state: { 
                        warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' is not a valid DAK repository.` 
                      }, 
                      replace: true 
                    });
                    return;
                  }
                  throw new Error(`Repository '${user}/${repo}' is not a valid DAK repository.`);
                }
              } catch (err) {
                // For dashboard pages, redirect instead of throwing error
                if (pageName === 'dashboard' || pageName.includes('editor') || pageName.includes('viewer') || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
                  navigate('/', { 
                    state: { 
                      warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
                    }, 
                    replace: true 
                  });
                  return;
                }
                throw new Error(`Repository '${user}/${repo}' not found or not accessible.`);
              }
            } else {
              // For demo mode, validate the demo repository exists
              const isValidDAK = dakValidationService.validateDemoDAKRepository(user, repo);
              if (!isValidDAK) {
                // For dashboard pages, redirect instead of throwing error
                if (pageName === 'dashboard' || pageName.includes('editor') || pageName.includes('viewer') || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
                  navigate('/', { 
                    state: { 
                      warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
                    }, 
                    replace: true 
                  });
                  return;
                }
                throw new Error(`Repository '${user}/${repo}' not found or not accessible.`);
              }
              
              repository = {
                name: repo,
                full_name: `${user}/${repo}`,
                owner: { login: user },
                default_branch: selectedBranch || 'main',
                html_url: `https://github.com/${user}/${repo}`,
                isDemo: true
              };
            }
          }

          selectedBranch = selectedBranch || repository?.default_branch || 'main';

          // For asset pages, validate the asset exists (when authenticated or public repo)
          if (pageState.type === PAGE_TYPES.ASSET && asset) {
            try {
              await githubService.getFileContent(user, repo, asset, selectedBranch);
            } catch (err) {
              // For asset pages, redirect instead of throwing error  
              if (pageName === 'asset' || pageName.includes('editor') || pageName.includes('viewer')) {
                navigate('/', { 
                  state: { 
                    warningMessage: `Could not access the requested asset. Asset '${asset}' not found in repository.` 
                  }, 
                  replace: true 
                });
                return;
              }
              throw new Error(`Asset '${asset}' not found in repository.`);
            }
          }
        }

        // For User pages, just need profile
        if (pageState.type === PAGE_TYPES.USER && !profile && user) {
          if (githubService.isAuth()) {
            try {
              profile = await githubService.getUser(user);
            } catch (err) {
              // For user pages, redirect instead of throwing error
              navigate('/', { 
                state: { 
                  warningMessage: `Could not access the requested user. User '${user}' not found or not accessible.` 
                }, 
                replace: true 
              });
              return;
            }
          } else {
            profile = {
              login: user,
              name: user.charAt(0).toUpperCase() + user.slice(1),
              avatar_url: `https://github.com/${user}.png`,
              type: 'User',
              isDemo: true
            };
          }
        }

        setPageState(prev => ({
          ...prev,
          loading: false,
          user,
          profile,
          repository,
          branch: selectedBranch,
          asset,
          isAuthenticated: githubService.isAuth()
        }));

        // Handle profile subscriptions asynchronously
        const handleSubscriptions = async () => {
          try {
            const currentUser = await githubService.getCurrentUser();
            if (currentUser) {
              profileSubscriptionService.ensureCurrentUserSubscribed(currentUser);
            }
          } catch (error) {
            // Current user fetch failed, but continue with visited profile logic
            console.debug('Could not fetch current user for subscriptions:', error);
          }

          // Auto-add visited profiles (if not demo and not already subscribed)
          if (profile && !profile.isDemo && (pageState.type === PAGE_TYPES.USER || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET)) {
            profileSubscriptionService.autoAddVisitedProfile(profile);
          }
        };

        // Run subscription logic without blocking the main page load
        if (githubService.isAuth()) {
          handleSubscriptions();
        }

      } catch (error) {
        console.error('Page data loading error:', error);
        setPageState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    // Only load data if we have URL parameters that require it
    if ((pageState.type !== PAGE_TYPES.TOP_LEVEL && user) || pageState.type === PAGE_TYPES.TOP_LEVEL) {
      loadPageData();
    }
  }, [user, repo, params.branch, asset, pageState.type, location.state, navigate, pageName]);

  // Monitor authentication state changes
  useEffect(() => {
    const checkAuthState = () => {
      const currentAuthState = githubService.isAuth();
      if (currentAuthState !== pageState.isAuthenticated) {
        setPageState(prev => ({
          ...prev,
          isAuthenticated: currentAuthState
        }));
      }
    };

    // Check periodically for auth state changes (for logout detection)
    const interval = setInterval(checkAuthState, 1000);
    
    return () => clearInterval(interval);
  }, [pageState.isAuthenticated]);

  const value = {
    ...pageState,
    navigate,
    params,
    location
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
};
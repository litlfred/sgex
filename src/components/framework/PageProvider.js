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
    console.error('usePage: PageContext is null - component not wrapped in PageProvider');
    // Return a default context instead of throwing to make ErrorHandler more resilient
    return {
      pageName: 'unknown',
      user: null,
      profile: null,
      repository: null,
      branch: null,
      asset: null,
      type: 'top-level',
      loading: false,
      error: null,
      isAuthenticated: false,
      navigate: () => {},
      params: {},
      location: { pathname: '/' }
    };
  }
  return context;
};

/**
 * Determine page type from URL parameters
 */
const determinePageType = (params) => {
  const { user, repo, branch } = params;
  const asset = params['*']; // Wildcard parameter for asset path
  
  // Debug logging to help diagnose route detection issues
  console.debug('PageProvider: Determining page type from params:', { user, repo, branch, asset, params });
  
  // Check current URL path to help with detection
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/').filter(part => part);
  
  // Extract user/repo from URL if params not available yet (during initial route parsing)
  let detectedUser = user;
  let detectedRepo = repo;
  
  if (!detectedUser && pathParts.length >= 3) {
    // Pattern: [component, user, repo, branch?, asset?]
    detectedUser = pathParts[1];
    detectedRepo = pathParts[2];
  }
  
  // Enhanced DAK route detection - works even before React Router finishes parsing
  const isDAKRoute = pathParts.length >= 3 && detectedUser && detectedRepo;
  
  console.debug('PageProvider: URL analysis:', { 
    currentPath, 
    pathParts, 
    detectedUser, 
    detectedRepo,
    isDAKRoute,
    routerUser: user,
    routerRepo: repo
  });
  
  if (asset) return PAGE_TYPES.ASSET;
  if (isDAKRoute) return PAGE_TYPES.DAK; // Enhanced detection for DAK routes
  if (detectedUser && detectedRepo) return PAGE_TYPES.DAK;
  if (detectedUser || user) return PAGE_TYPES.USER;
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

  // Extract URL parameters - use both router params and URL parsing for robustness
  const { user: routerUser, repo: routerRepo, branch: routerBranch } = params;
  const asset = params['*']; // Wildcard parameter for asset path
  
  // Fallback URL parsing for when React Router params aren't ready yet
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/').filter(part => part);
  const urlUser = pathParts.length >= 2 ? pathParts[1] : null;
  const urlRepo = pathParts.length >= 3 ? pathParts[2] : null;
  const urlBranch = pathParts.length >= 4 ? pathParts[3] : null;
  
  // Use router params if available, otherwise fall back to URL parsing
  const user = routerUser || urlUser;
  const repo = routerRepo || urlRepo;
  const branch = routerBranch || urlBranch;

  console.debug('PageProvider: URL params extracted:', { 
    routerUser, routerRepo, routerBranch,
    urlUser, urlRepo, urlBranch,
    finalUser: user, finalRepo: repo, finalBranch: branch,
    asset, allParams: params 
  });

  // Load data based on page type
  useEffect(() => {
    const loadPageData = async () => {
      try {
        setPageState(prev => ({ ...prev, loading: true, error: null }));

        // Use location state if available, otherwise fetch from URL params
        let profile = location.state?.profile;
        let repository = location.state?.repository;
        let selectedBranch = location.state?.selectedBranch || branch;

        // For DAK and Asset pages, validate and fetch data
        if (pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
          if (!profile && user) {
            if (githubService.isAuth()) {
              try {
                profile = await githubService.getUser(user);
              } catch (err) {
                // For dashboard pages, set error state instead of redirecting
                if (pageName === 'dashboard' || pageName.includes('editor') || pageName.includes('viewer') || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
                  setPageState(prev => ({
                    ...prev,
                    loading: false,
                    error: `User '${user}' not found or not accessible. Please check the username and try again.`,
                    user,
                    // Still set available URL parameters for context
                    repository: repo ? { name: repo, owner: { login: user }, html_url: `https://github.com/${user}/${repo}`, isNotFound: true } : null,
                    branch: params.branch || 'main'
                  }));
                  return;
                }
                throw new Error(`User '${user}' not found or not accessible.`);
              }
            } else {
              // Unauthenticated users accessing public repositories
              // Create profile for public repository access (no isDemo flag)
              profile = {
                login: user,
                name: user.charAt(0).toUpperCase() + user.slice(1),
                avatar_url: `https://github.com/${user}.png`,
                type: 'User'
                // Note: isDemo is NOT set - unauthenticated users should access real public repos
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
                  // For dashboard pages, set error state instead of redirecting
                  if (pageName === 'dashboard' || pageName.includes('editor') || pageName.includes('viewer') || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
                    setPageState(prev => ({
                      ...prev,
                      loading: false,
                      error: `Repository '${user}/${repo}' is not a valid DAK repository. This repository may not contain WHO SMART Guidelines content.`,
                      user,
                      profile,
                      repository: { ...repository, isInvalidDAK: true },
                      branch: selectedBranch || repository.default_branch
                    }));
                    return;
                  }
                  throw new Error(`Repository '${user}/${repo}' is not a valid DAK repository.`);
                }
              } catch (err) {
                // For dashboard pages, set error state instead of redirecting
                if (pageName === 'dashboard' || pageName.includes('editor') || pageName.includes('viewer') || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET) {
                  setPageState(prev => ({
                    ...prev,
                    loading: false,
                    error: `Repository '${user}/${repo}' not found or not accessible. Please check the repository name and your access permissions.`,
                    user,
                    profile,
                    repository: { name: repo, owner: { login: user }, html_url: `https://github.com/${user}/${repo}`, isNotFound: true },
                    branch: selectedBranch || 'main'
                  }));
                  return;
                }
                throw new Error(`Repository '${user}/${repo}' not found or not accessible.`);
              }
            } else {
              // Unauthenticated users accessing public repositories
              // Create repository object for public repository access (no isDemo flag)
              repository = {
                name: repo,
                full_name: `${user}/${repo}`,
                owner: { login: user },
                default_branch: selectedBranch || 'main',
                html_url: `https://github.com/${user}/${repo}`
                // Note: isDemo is NOT set - unauthenticated users should access real public repos
              };
            }
          }

          selectedBranch = selectedBranch || repository?.default_branch || 'main';

          // For asset pages, validate the asset exists (when authenticated or public repo)
          if (pageState.type === PAGE_TYPES.ASSET && asset) {
            try {
              await githubService.getFileContent(user, repo, asset, selectedBranch);
            } catch (err) {
              // For asset pages, set error state instead of redirecting  
              if (pageName === 'asset' || pageName.includes('editor') || pageName.includes('viewer')) {
                setPageState(prev => ({
                  ...prev,
                  loading: false,
                  error: `Asset '${asset}' not found in repository '${user}/${repo}'. The file may have been moved or deleted.`,
                  user,
                  profile,
                  repository,
                  branch: selectedBranch,
                  asset
                }));
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
              // For user pages, set error state instead of redirecting
              setPageState(prev => ({
                ...prev,
                loading: false,
                error: `User '${user}' not found or not accessible. Please check the username and try again.`,
                user
              }));
              return;
            }
          } else {
            // Unauthenticated users accessing public user profiles
            // Create profile for public access (no isDemo flag)
            profile = {
              login: user,
              name: user.charAt(0).toUpperCase() + user.slice(1),
              avatar_url: `https://github.com/${user}.png`,
              type: 'User'
              // Note: isDemo is NOT set - unauthenticated users should access real public data
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

          // Auto-add visited profiles (if authenticated)
          if (profile && githubService.isAuth() && (pageState.type === PAGE_TYPES.USER || pageState.type === PAGE_TYPES.DAK || pageState.type === PAGE_TYPES.ASSET)) {
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
  }, [user, repo, branch, asset, pageState.type, location.state, navigate, pageName]);

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
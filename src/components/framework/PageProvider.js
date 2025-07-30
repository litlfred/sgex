import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import githubService from '../../services/githubService';
import dakValidationService from '../../services/dakValidationService';

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

  // Add effect to monitor authentication state changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const currentAuthStatus = githubService.isAuth();
      setPageState(prev => {
        if (prev.isAuthenticated !== currentAuthStatus) {
          console.log('Authentication state changed:', prev.isAuthenticated, '->', currentAuthStatus);
          return { ...prev, isAuthenticated: currentAuthStatus };
        }
        return prev;
      });
    };

    // Check immediately
    checkAuthStatus();

    // Set up interval to check auth status periodically
    const authCheckInterval = setInterval(checkAuthStatus, 1000);

    return () => clearInterval(authCheckInterval);
  }, []);

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
                throw new Error(`User '${user}' not found or not accessible.`);
              }
            } else {
              // Demo mode for DAK validation
              const isValidDAK = dakValidationService.validateDemoDAKRepository(user, repo);
              if (!isValidDAK) {
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
                  throw new Error(`Repository '${user}/${repo}' is not a valid DAK repository.`);
                }
              } catch (err) {
                throw new Error(`Repository '${user}/${repo}' not found or not accessible.`);
              }
            } else {
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
              throw new Error(`User '${user}' not found or not accessible.`);
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
  }, [user, repo, params.branch, asset, pageState.type, location.state]);

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
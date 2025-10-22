/**
 * SGEX URL Context Hook
 * 
 * React hook that provides access to URL context and routing information
 * extracted by the routing context service and 404.html routing logic.
 */

import { useState, useEffect } from 'react';
import { getRoutingContext, RoutingContext } from '../services/routingContextService';
import useDAKUrlParams from './useDAKUrlParams';

/**
 * URL context hook return type
 */
interface URLContextReturn {
  urlContext: Partial<RoutingContext>;
  isReady: boolean;
  getUser: () => string | undefined;
  getRepo: () => string | undefined;
  getBranch: () => string | undefined;
  getAsset: () => string | undefined;
  getComponent: () => string | undefined;
  getDeploymentBranch: () => string | undefined;
  hasContext: () => boolean;
  clearContext: () => void;
}

/**
 * Router parameters interface
 */
interface RouterParams {
  user?: string;
  repo?: string;
  branch?: string;
  '*'?: string;
  [key: string]: string | undefined;
}

/**
 * Route context return type
 */
interface RouteContextReturn {
  user?: string;
  repo?: string;
  branch?: string;
  asset?: string;
  component?: string;
  deploymentBranch?: string;
  isReady: boolean;
  hasContext: boolean;
  source: {
    fromRouter: boolean;
    fromURL: boolean;
  };
}

/**
 * DAK context options
 */
interface DAKContextOptions {
  fetchData?: boolean;
  includeAuthentication?: boolean;
  includeValidation?: boolean;
}

/**
 * Hook to access URL context extracted from direct URL entry
 * This supplements React Router params with context from 404.html routing
 * 
 * @returns URL context with helper methods
 * 
 * @example
 * const { urlContext, isReady, getUser, getRepo } = useURLContext();
 * if (isReady) {
 *   console.log('User:', getUser());
 *   console.log('Repo:', getRepo());
 * }
 */
export const useURLContext = (): URLContextReturn => {
  const [urlContext, setUrlContext] = useState<Partial<RoutingContext>>({});
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Get context from the new routing context service
    const context = getRoutingContext();
    setUrlContext(context);
    setIsReady(true);

    // Listen for context changes (e.g., navigation)
    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key && e.key.startsWith('sgex_')) {
        const updatedContext = getRoutingContext();
        setUrlContext(updatedContext);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    urlContext,
    isReady,
    // Helper methods
    getUser: () => urlContext.user,
    getRepo: () => urlContext.repo,
    getBranch: () => urlContext.branch,
    getAsset: () => urlContext.asset,
    getComponent: () => urlContext.component,
    getDeploymentBranch: () => urlContext.deploymentBranch,
    hasContext: () => !!(urlContext.user && urlContext.repo),
    clearContext: () => {
      // Clear individual sessionStorage items for backward compatibility
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('sgex_url_context');
        sessionStorage.removeItem('sgex_current_component');
        sessionStorage.removeItem('sgex_selected_user');
        sessionStorage.removeItem('sgex_selected_repo');
        sessionStorage.removeItem('sgex_selected_branch');
        sessionStorage.removeItem('sgex_selected_asset');
        sessionStorage.removeItem('sgex_deployment_branch');
        sessionStorage.removeItem('sgex_intended_branch');
      }
      setUrlContext({});
    }
  };
};

/**
 * Hook for components that need routing context but might not have React Router params
 * Combines React Router params with URL context as fallback
 * 
 * @param routerParams - Router parameters from useParams()
 * @returns Merged route context
 * 
 * @example
 * const { user, repo, branch, isReady, hasContext } = useRouteContext(useParams());
 * if (hasContext) {
 *   console.log(`DAK: ${user}/${repo}/${branch}`);
 * }
 */
export const useRouteContext = (routerParams: RouterParams = {}): RouteContextReturn => {
  const { urlContext, isReady } = useURLContext();
  
  // Merge router params with URL context, preferring router params
  const mergedContext = {
    user: routerParams.user || urlContext.user,
    repo: routerParams.repo || urlContext.repo,
    branch: routerParams.branch || urlContext.branch,
    asset: routerParams['*'] || urlContext.asset,
    component: urlContext.component,
    deploymentBranch: urlContext.deploymentBranch
  };

  return {
    ...mergedContext,
    isReady,
    hasContext: !!(mergedContext.user && mergedContext.repo),
    source: {
      fromRouter: !!(routerParams.user || routerParams.repo),
      fromURL: !!(urlContext.user || urlContext.repo)
    }
  };
};

/**
 * Hook specifically for DAK components that need user/repo context
 * Enhanced version that can optionally fetch GitHub data when needed
 * 
 * @param routerParams - Router parameters from useParams()
 * @param options - Configuration options
 * @returns DAK context with optional GitHub data
 * 
 * @example
 * // Basic usage without data fetching
 * const { user, repo, isValidDAK } = useDAKContext(useParams());
 * 
 * @example
 * // With GitHub data fetching
 * const { profile, repository, loading } = useDAKContext(useParams(), { fetchData: true });
 */
export const useDAKContext = (routerParams: RouterParams = {}, options: DAKContextOptions = {}): any => {
  const routeContext = useRouteContext(routerParams);
  const { 
    fetchData = false, 
    includeAuthentication = false,
    includeValidation = false 
  } = options;
  
  if (!routeContext.isReady) {
    return {
      ...routeContext,
      isValidDAK: false,
      missingParams: [],
      profile: null,
      repository: null,
      loading: false,
      error: null
    };
  }

  const missingParams: string[] = [];
  if (!routeContext.user) missingParams.push('user');
  if (!routeContext.repo) missingParams.push('repo');

  const baseContext = {
    ...routeContext,
    isValidDAK: missingParams.length === 0,
    missingParams,
    // Default branch if none specified
    effectiveBranch: routeContext.branch || 'main'
  };

  // If data fetching is not requested, return basic context
  if (!fetchData) {
    return {
      ...baseContext,
      profile: null,
      repository: null,
      loading: false,
      error: null
    };
  }

  // For data fetching, delegate to useDAKUrlParams for full GitHub integration
  // This maintains the separation of concerns while providing a unified interface
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dakUrlParams = useDAKUrlParams();
  
  return {
    ...baseContext,
    // Merge with GitHub data when available
    profile: dakUrlParams.profile,
    repository: dakUrlParams.repository,
    selectedBranch: dakUrlParams.selectedBranch,
    loading: dakUrlParams.loading,
    error: dakUrlParams.error,
    navigate: dakUrlParams.navigate
  };
};

/**
 * Simplified hook for DAK components that only need parameter validation
 * Use this instead of useDAKUrlParams when you don't need GitHub data fetching
 * 
 * @param routerParams - Router parameters from useParams()
 * @returns DAK context without GitHub data
 * 
 * @example
 * const { user, repo, branch, isValidDAK } = useDAKParams(useParams());
 */
export const useDAKParams = (routerParams: RouterParams = {}): any => {
  return useDAKContext(routerParams, { fetchData: false });
};

/**
 * Enhanced hook for DAK components that need full GitHub integration
 * Use this as a direct replacement for useDAKUrlParams
 * 
 * @param routerParams - Router parameters from useParams()
 * @returns DAK context with GitHub data
 * 
 * @example
 * const { profile, repository, loading, error } = useDAKData(useParams());
 * if (!loading && profile) {
 *   console.log('Profile:', profile.login);
 * }
 */
export const useDAKData = (routerParams: RouterParams = {}): any => {
  return useDAKContext(routerParams, { 
    fetchData: true, 
    includeAuthentication: true, 
    includeValidation: true 
  });
};

export default useURLContext;

/**
 * SGEX URL Context Hook
 * 
 * React hook that provides access to URL context and routing information
 * extracted by the URL processor service and 404.html routing logic.
 */

import { useState, useEffect } from 'react';
import urlProcessor from '../services/urlProcessorService';

/**
 * Hook to access URL context extracted from direct URL entry
 * This supplements React Router params with context from 404.html routing
 */
export const useURLContext = () => {
  const [urlContext, setUrlContext] = useState({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize and get context
    urlProcessor.initialize();
    const context = urlProcessor.getContext();
    setUrlContext(context);
    setIsReady(true);

    // Listen for context changes (e.g., navigation)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('sgex_')) {
        const updatedContext = urlProcessor.getContext();
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
      urlProcessor.clearContext();
      setUrlContext({});
    }
  };
};

/**
 * Hook for components that need routing context but might not have React Router params
 * Combines React Router params with URL context as fallback
 */
export const useRouteContext = (routerParams = {}) => {
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
 */
export const useDAKContext = (routerParams = {}) => {
  const routeContext = useRouteContext(routerParams);
  
  if (!routeContext.isReady) {
    return {
      ...routeContext,
      isValidDAK: false,
      missingParams: []
    };
  }

  const missingParams = [];
  if (!routeContext.user) missingParams.push('user');
  if (!routeContext.repo) missingParams.push('repo');

  return {
    ...routeContext,
    isValidDAK: missingParams.length === 0,
    missingParams,
    // Default branch if none specified
    effectiveBranch: routeContext.branch || 'main'
  };
};

export default useURLContext;
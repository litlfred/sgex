/**
 * Page Parameters Hook
 * 
 * Custom hooks for accessing URL parameters and page context in a type-safe way
 * Provides utility functions for navigation within different page types
 * 
 * @module usePageParams
 */

import { usePage, PAGE_TYPES } from './PageProvider';

/**
 * Page parameters return type for usePageParams hook
 * @example { type: "dak", user: "who", profile: {...}, repository: {...}, branch: "main" }
 */
export interface PageParams {
  /** Page type (top-level, user, dak, asset) */
  type: string;
  /** GitHub username from URL */
  user: string | null;
  /** GitHub user profile object */
  profile: any;
  /** GitHub repository object */
  repository: any;
  /** Git branch name */
  branch: string | null;
  /** Asset path for asset pages */
  asset: string | null;
  /** Additional URL parameters */
  params: Record<string, string>;
  /** Update branch in current URL */
  updateBranch: (newBranch: string) => void;
  /** Navigate to user page */
  navigateToUser: (userLogin: string) => void;
  /** Navigate to DAK page */
  navigateToDAK: (userLogin: string, repoName: string, branchName?: string) => void;
  /** Navigate to asset page */
  navigateToAsset: (userLogin: string, repoName: string, branchName: string, assetPath: string) => void;
  /** General navigation function */
  navigate: (path: string, options?: any) => void;
}

/**
 * DAK parameters return type for useDAKParams hook
 * @example { user: "who", repository: {...}, branch: "main", loading: false }
 */
export interface DAKParams {
  /** GitHub username */
  user: string | null;
  /** GitHub user profile object */
  profile: any;
  /** GitHub repository object */
  repository: any;
  /** Git branch name */
  branch: string | null;
  /** Asset path (for asset pages) */
  asset: string | null;
  /** Update branch in current URL */
  updateBranch: (newBranch: string) => void;
  /** Navigation function */
  navigate: (path: string, options?: any) => void;
  /** Loading state */
  loading: boolean;
  /** Error message if context not available */
  error: string | null;
}

/**
 * User parameters return type for useUserParams hook
 * @example { user: "who", profile: {...}, navigateToDAK: Function }
 */
export interface UserParams {
  /** GitHub username */
  user: string | null;
  /** GitHub user profile object */
  profile: any;
  /** Navigate to DAK page */
  navigateToDAK: (userLogin: string, repoName: string, branchName?: string) => void;
  /** Navigation function */
  navigate: (path: string, options?: any) => void;
}

/**
 * Hook for accessing URL parameters in a type-safe way
 * Provides access to page context including user, repository, branch, and navigation utilities
 * 
 * @returns Page parameters and navigation utilities
 * 
 * @example
 * const { type, user, repository, branch, updateBranch } = usePageParams();
 * if (type === PAGE_TYPES.DAK) {
 *   console.log(`Viewing ${repository.name} on branch ${branch}`);
 * }
 */
export const usePageParams = (): PageParams => {
  const { type, user, profile, repository, branch, asset, params, navigate } = usePage();

  const updateBranch = (newBranch: string): void => {
    if (type === PAGE_TYPES.DAK || type === PAGE_TYPES.ASSET) {
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/');
      
      // Update branch in URL path
      if (pathParts.length >= 5) {
        if (pathParts.length === 5) {
          // No branch in URL, append it
          pathParts.push(newBranch);
        } else {
          // Branch exists, replace it
          pathParts[5] = newBranch;
        }
        (navigate as (path: string) => void)(pathParts.join('/'));
      }
    }
  };

  const navigateToUser = (userLogin: string): void => {
    (navigate as (path: string) => void)(`/${(params as any).page || 'dak-action'}/${userLogin}`);
  };

  const navigateToDAK = (userLogin: string, repoName: string, branchName: string = 'main'): void => {
    (navigate as (path: string) => void)(`/${(params as any).page || 'dashboard'}/${userLogin}/${repoName}/${branchName}`);
  };

  const navigateToAsset = (userLogin: string, repoName: string, branchName: string, assetPath: string): void => {
    (navigate as (path: string) => void)(`/${(params as any).page || 'editor'}/${userLogin}/${repoName}/${branchName}/${assetPath}`);
  };

  return {
    type,
    user,
    profile,
    repository,
    branch,
    asset,
    params,
    updateBranch,
    navigateToUser,
    navigateToDAK,
    navigateToAsset,
    navigate
  };
};

/**
 * Hook specifically for DAK pages (DAK and Asset page types)
 * Returns null values with graceful degradation if context not available
 * 
 * @returns DAK-specific parameters with loading and error states
 * 
 * @example
 * const { repository, branch, updateBranch, loading, error } = useDAKParams();
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * return <div>{repository.name} @ {branch}</div>;
 */
export const useDAKParams = (): DAKParams => {
  try {
    const pageParams = usePageParams();
    
    // Handle case where PageProvider context is null or not properly initialized
    if (!pageParams || !pageParams.type) {
      console.warn('useDAKParams: PageProvider context not available, returning empty data');
      return {
        user: null,
        profile: null,
        repository: null,
        branch: null,
        asset: null,
        updateBranch: () => {},
        navigate: () => {},
        loading: true,
        error: null
      };
    }
    
    // Only throw error if page is fully loaded and type is not DAK/ASSET
    // But allow loading state to pass through
    if (!(pageParams as any).loading && 
        pageParams.type !== PAGE_TYPES.DAK && 
        pageParams.type !== PAGE_TYPES.ASSET) {
      
      // Instead of throwing, return null data with error flag for graceful degradation
      console.warn(`useDAKParams: Component loaded on ${pageParams.type} page instead of DAK/Asset page. Returning empty data for graceful degradation.`);
      return {
        user: null,
        profile: null,
        repository: null,
        branch: null,
        asset: null,
        updateBranch: () => {},
        navigate: pageParams.navigate || (() => {}),
        loading: false,
        error: `This component requires a DAK or Asset page context but was loaded on a ${pageParams.type} page.`
      };
    }

    return {
      user: pageParams.user,
      profile: pageParams.profile,
      repository: pageParams.repository,
      branch: pageParams.branch,
      asset: pageParams.asset,
      updateBranch: pageParams.updateBranch,
      navigate: pageParams.navigate,
      loading: (pageParams as any).loading || false,
      error: null
    };
  } catch (error) {
    // If PageProvider is not ready yet, return empty object with loading state
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('useDAKParams: PageProvider error, returning empty data:', errorMessage);
    return {
      user: null,
      profile: null,
      repository: null,
      branch: null,
      asset: null,
      updateBranch: () => {},
      navigate: () => {},
      loading: true,
      error: null
    };
  }
};

/**
 * Hook specifically for User pages
 * Throws error if used on non-user pages
 * 
 * @returns User-specific parameters
 * @throws {Error} If used on non-User page types
 * 
 * @example
 * const { user, profile, navigateToDAK } = useUserParams();
 * console.log(`User: ${user}`);
 */
export const useUserParams = (): UserParams => {
  const pageParams = usePageParams();
  
  if (pageParams.type !== PAGE_TYPES.USER) {
    throw new Error('useUserParams can only be used on User pages');
  }

  return {
    user: pageParams.user,
    profile: pageParams.profile,
    navigateToDAK: pageParams.navigateToDAK,
    navigate: pageParams.navigate
  };
};

import { usePage, PAGE_TYPES } from './PageProvider';

/**
 * Hook for accessing URL parameters in a type-safe way
 */
export const usePageParams = () => {
  const { type, user, profile, repository, branch, asset, params, navigate } = usePage();

  const updateBranch = (newBranch) => {
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
        navigate(pathParts.join('/'));
      }
    }
  };

  const navigateToUser = (userLogin) => {
    navigate(`/${params.page || 'dak-action'}/${userLogin}`);
  };

  const navigateToDAK = (userLogin, repoName, branchName = 'main') => {
    navigate(`/${params.page || 'dashboard'}/${userLogin}/${repoName}/${branchName}`);
  };

  const navigateToAsset = (userLogin, repoName, branchName, assetPath) => {
    navigate(`/${params.page || 'editor'}/${userLogin}/${repoName}/${branchName}/${assetPath}`);
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
 */
export const useDAKParams = () => {
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
    if (!pageParams.loading && 
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
      loading: pageParams.loading || false,
      error: null
    };
  } catch (error) {
    // If PageProvider is not ready yet, return empty object with loading state
    console.warn('useDAKParams: PageProvider error, returning empty data:', error.message);
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
 */
export const useUserParams = () => {
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
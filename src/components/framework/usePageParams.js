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
    
    // Only throw error if page is fully loaded and type is not DAK/ASSET
    // This prevents errors during initial loading or page type determination
    if (!pageParams.loading && 
        pageParams.type !== PAGE_TYPES.DAK && 
        pageParams.type !== PAGE_TYPES.ASSET) {
      throw new Error(`useDAKParams can only be used on DAK or Asset pages. Current page type: ${pageParams.type}`);
    }

    return {
      user: pageParams.user,
      profile: pageParams.profile,
      repository: pageParams.repository,
      branch: pageParams.branch,
      asset: pageParams.asset,
      updateBranch: pageParams.updateBranch,
      navigate: pageParams.navigate
    };
  } catch (error) {
    // If PageProvider is not ready yet, return empty object
    if (error.message.includes('usePage must be used within a PageProvider')) {
      console.log('useDAKParams: PageProvider not ready yet, returning empty data');
      return {
        user: null,
        profile: null,
        repository: null,
        branch: null,
        asset: null,
        updateBranch: () => {},
        navigate: () => {}
      };
    }
    throw error;
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
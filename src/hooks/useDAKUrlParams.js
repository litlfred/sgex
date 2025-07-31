import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import githubService from '../services/githubService';
import dakValidationService from '../services/dakValidationService';

/**
 * Custom hook to handle DAK URL parameters (user, repo, branch) for DAK component pages.
 * This extracts and validates DAK parameters from the URL, similar to how DAKDashboard works.
 * 
 * @returns {Object} Contains loading state, error, profile, repository, selectedBranch, and navigate function
 */
const useDAKUrlParams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, repo, branch } = useParams();
  
  // Try to get data from location.state first, then from URL params
  const [profile, setProfile] = useState(location.state?.profile || null);
  const [repository, setRepository] = useState(location.state?.repository || null);
  const [selectedBranch, setSelectedBranch] = useState(location.state?.selectedBranch || branch || null);
  const [loading, setLoading] = useState(!profile || !repository);
  const [error, setError] = useState(null);

  // Fetch data from URL parameters if not available in location.state
  useEffect(() => {
    const fetchDataFromUrlParams = async () => {
      console.log('🔍 useDAKUrlParams: Starting data fetch analysis:', {
        urlParams: { user, repo, branch },
        currentState: {
          hasProfile: !!profile,
          hasRepository: !!repository,
          profileLogin: profile?.login,
          repositoryFullName: repository?.full_name,
          repositoryOwner: repository?.owner?.login
        },
        hasLocationState: !!location.state,
        locationStateSummary: location.state ? {
          hasProfile: !!location.state.profile,
          hasRepository: !!location.state.repository,
          profileLogin: location.state.profile?.login,
          repositoryFullName: location.state.repository?.full_name,
          repositoryOwner: location.state.repository?.owner?.login
        } : null,
        isAuthenticated: githubService.isAuth(),
        needsFetch: (!profile || !repository) && user && repo
      });

      if ((!profile || !repository) && user && repo) {
        console.log('useDAKUrlParams: Fetching data from URL parameters:', {
          user, 
          repo, 
          branch,
          hasProfile: !!profile,
          hasRepository: !!repository,
          hasLocationState: !!location.state,
          isAuthenticated: githubService.isAuth()
        });
        
        try {
          setLoading(true);
          setError(null);

          // Check if githubService is authenticated (allow demo mode to proceed without auth)
          if (!githubService.isAuth()) {
            console.log('🚫 useDAKUrlParams: Not authenticated, attempting validation for public repository');
            
            // First try to validate as a real DAK repository using public API
            const isValidDAK = await dakValidationService.validateDAKRepository(user, repo, branch);
            
            if (isValidDAK) {
              console.log('✅ useDAKUrlParams: Public DAK validation passed, creating demo-style data');
              const demoProfile = {
                login: user,
                name: user.charAt(0).toUpperCase() + user.slice(1),
                avatar_url: `https://github.com/${user}.png`,
                type: 'User',
                isDemo: true
              };

              const demoRepository = {
                name: repo,
                full_name: `${user}/${repo}`,
                owner: { login: user },
                default_branch: branch || 'main',
                html_url: `https://github.com/${user}/${repo}`,
                isDemo: true
              };

              setProfile(demoProfile);
              setRepository(demoRepository);
              setSelectedBranch(branch || 'main');
              setLoading(false);
              return;
            }
            
            // If real validation failed, try demo validation as fallback
            console.log('🚫 useDAKUrlParams: Public DAK validation failed, trying demo mode');
            const isDemoValidDAK = dakValidationService.validateDemoDAKRepository(user, repo);
            
            if (!isDemoValidDAK) {
              console.log('❌ useDAKUrlParams: Demo DAK validation also failed, redirecting home');
              navigate('/', { 
                state: { 
                  warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
                } 
              });
              return;
            }

            console.log('✅ useDAKUrlParams: Demo DAK validation passed, creating demo data');
            const demoProfile = {
              login: user,
              name: user.charAt(0).toUpperCase() + user.slice(1),
              avatar_url: `https://github.com/${user}.png`,
              type: 'User',
              isDemo: true
            };

            const demoRepository = {
              name: repo,
              full_name: `${user}/${repo}`,
              owner: { login: user },
              default_branch: branch || 'main',
              html_url: `https://github.com/${user}/${repo}`,
              isDemo: true
            };

            console.log('📋 useDAKUrlParams: Setting demo state:', {
              profile: demoProfile,
              repository: demoRepository,
              selectedBranch: branch || 'main'
            });

            setProfile(demoProfile);
            setRepository(demoRepository);
            setSelectedBranch(branch || 'main');
            setLoading(false);
            return;
          }

          console.log('🔐 useDAKUrlParams: Authenticated, fetching real repository data');

          // Fetch user profile
          let userProfile = null;
          try {
            console.log(`🔍 useDAKUrlParams: Fetching user profile for: ${user}`);
            const userResponse = await githubService.getUser(user);
            userProfile = userResponse;
            console.log('✅ useDAKUrlParams: User profile fetched:', {
              login: userProfile.login,
              name: userProfile.name,
              type: userProfile.type
            });
          } catch (err) {
            console.error('❌ useDAKUrlParams: Error fetching user:', err);
            navigate('/', { 
              state: { 
                warningMessage: `Could not access the requested DAK. User '${user}' not found or not accessible.` 
              } 
            });
            return;
          }

          // Fetch repository
          let repoData = null;
          try {
            console.log(`useDAKUrlParams: Fetching repository data for ${user}/${repo}`);
            const repoResponse = await githubService.getRepository(user, repo);
            repoData = repoResponse;
            console.log('useDAKUrlParams: Repository data fetched successfully:', {
              name: repoData.name,
              full_name: repoData.full_name,
              owner: repoData.owner,
              default_branch: repoData.default_branch
            });
          } catch (err) {
            console.error('useDAKUrlParams: Error fetching repository:', err);
            navigate('/', { 
              state: { 
                warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
              } 
            });
            return;
          }

          // Validate that this is actually a DAK repository
          const isValidDAK = await dakValidationService.validateDAKRepository(user, repo, branch || repoData.default_branch);
          
          if (!isValidDAK) {
            console.log(`Repository ${user}/${repo} is not a valid DAK repository`);
            navigate('/', { 
              state: { 
                warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
              } 
            });
            return;
          }

          // Validate branch if specified
          if (branch) {
            try {
              await githubService.getBranch(user, repo, branch);
              setSelectedBranch(branch);
            } catch (err) {
              console.warn(`Branch '${branch}' not found, falling back to default branch`);
              setSelectedBranch(repoData.default_branch);
            }
          } else {
            setSelectedBranch(repoData.default_branch);
          }

          console.log('useDAKUrlParams: Setting final state:', {
            profile: {
              login: userProfile.login,
              name: userProfile.name,
              type: userProfile.type
            },
            repository: {
              name: repoData.name,
              full_name: repoData.full_name,
              owner: repoData.owner,
              default_branch: repoData.default_branch
            },
            selectedBranch: branch || repoData.default_branch
          });

          setProfile(userProfile);
          setRepository(repoData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching data from URL params:', err);
          setError('Failed to load DAK data. Please check the URL or try again.');
          setLoading(false);
        }
      } else {
        console.log('📋 useDAKUrlParams: Not fetching from URL params, using existing state:', {
          hasProfile: !!profile,
          hasRepository: !!repository,
          hasUserParam: !!user,
          hasRepoParam: !!repo,
          reason: !profile || !repository ? 'missing URL params' : 'state already populated'
        });
        setLoading(false);
      }
    };

    fetchDataFromUrlParams();
  }, [user, repo, branch, profile, repository, navigate, location.state]);

  return {
    profile,
    repository,
    selectedBranch,
    loading,
    error,
    user,
    repo,
    branch: branch || selectedBranch,
    navigate
  };
};

export default useDAKUrlParams;
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
      if ((!profile || !repository) && user && repo) {
        try {
          setLoading(true);
          setError(null);

          // Check if githubService is authenticated (allow demo mode to proceed without auth)
          if (!githubService.isAuth()) {
            // In demo mode, use the DAK validation service for demo repositories
            const isValidDAK = dakValidationService.validateDemoDAKRepository(user, repo);
            
            if (!isValidDAK) {
              navigate('/', { 
                state: { 
                  warningMessage: `Could not access the requested DAK. Repository '${user}/${repo}' not found or not accessible.` 
                } 
              });
              return;
            }

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

          // Fetch user profile
          let userProfile = null;
          try {
            const userResponse = await githubService.getUser(user);
            userProfile = userResponse;
          } catch (err) {
            console.error('Error fetching user:', err);
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
            const repoResponse = await githubService.getRepository(user, repo);
            repoData = repoResponse;
          } catch (err) {
            console.error('Error fetching repository:', err);
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

          setProfile(userProfile);
          setRepository(repoData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching data from URL params:', err);
          setError('Failed to load DAK data. Please check the URL or try again.');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchDataFromUrlParams();
  }, [user, repo, branch, profile, repository, navigate]);

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
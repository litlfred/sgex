import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from './framework';
import githubService from '../services/githubService';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const tryParseDAKUrl = () => {
      const pathname = location.pathname;
      const pathSegments = pathname.split('/').filter(Boolean);
      
      // Valid DAK component routes have at least 3 segments: [component, user, repo]
      if (pathSegments.length >= 3) {
        const [component, user, repo, branch, ...assetPath] = pathSegments;
        
        // List of known DAK components
        const validComponents = [
          'dashboard',
          'testing-viewer',
          'core-data-dictionary-viewer', 
          'health-interventions',
          'actor-editor',
          'business-process-selection',
          'bpmn-editor',
          'bpmn-viewer',
          'bpmn-source',
          'decision-support-logic'
        ];
        
        // Check if this looks like a valid DAK component URL
        if (validComponents.includes(component) && user && repo) {
          console.log('NotFound: Attempting to parse potential DAK URL:', {
            component, user, repo, branch, assetPath
          });
          
          // Try to navigate to the parsed route
          let targetPath = `/${component}/${user}/${repo}`;
          if (branch) {
            targetPath += `/${branch}`;
            if (assetPath.length > 0) {
              targetPath += `/${assetPath.join('/')}`;
            }
          }
          
          console.log('NotFound: Redirecting to parsed DAK route:', targetPath);
          navigate(targetPath, { replace: true });
          return true; // Successfully parsed and redirected
        }
      }
      
      return false; // Could not parse as DAK URL
    };

    // First try to parse as a DAK URL
    if (!tryParseDAKUrl()) {
      // Fall back to original behavior if URL doesn't match DAK patterns
      const isAuthenticated = githubService.isAuth();
      
      // Create appropriate warning message
      const warningMessage = isAuthenticated
        ? `The page "${location.pathname}" could not be found. You've been redirected to the home page.`
        : `The page "${location.pathname}" could not be found. Please sign in or try the demo mode to get started.`;

      console.log('NotFound: Could not parse as DAK URL, redirecting to home with warning');
      // Redirect to landing page with warning message
      navigate('/', {
        replace: true,
        state: { warningMessage }
      });
    }
  }, [navigate, location.pathname]);

  // Show temporary message while redirecting
  return (
    <PageLayout pageName="not-found">
      <div className="not-found-page">
        <h1>Page Not Found</h1>
        <p>Redirecting to home page...</p>
      </div>
    </PageLayout>
  );
};

export default NotFound;
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from './framework';
import githubService from '../services/githubService';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = githubService.isAuth();
    
    // Create appropriate warning message
    const warningMessage = isAuthenticated
      ? `The page "${location.pathname}" could not be found. You've been redirected to the home page.`
      : `The page "${location.pathname}" could not be found. Please sign in or try the demo mode to get started.`;

    // Redirect to landing page with warning message
    navigate('/', {
      replace: true,
      state: { warningMessage }
    });
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
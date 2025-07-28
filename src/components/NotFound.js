import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  // This component doesn't render anything visible
  // as it immediately redirects to the landing page
  return null;
};

export default NotFound;
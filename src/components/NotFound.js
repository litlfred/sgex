import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import githubService from '../services/githubService';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = githubService.isAuth();
    
    // Create appropriate warning message
    const warningMessage = isAuthenticated
      ? t('notFound.authenticatedMessage', { path: location.pathname })
      : t('notFound.unauthenticatedMessage', { path: location.pathname });

    // Redirect to landing page with warning message
    navigate('/', {
      replace: true,
      state: { warningMessage }
    });
  }, [navigate, location.pathname, t]);

  // This component doesn't render anything visible
  // as it immediately redirects to the landing page
  return null;
};

export default NotFound;
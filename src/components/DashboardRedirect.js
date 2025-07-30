import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component that redirects users from /dashboard to /dak-action
 * since dashboard requires user and repository parameters
 */
const DashboardRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to DAK action selection since dashboard needs user/repo context
    navigate('/dak-action', { replace: true });
  }, [navigate]);

  return null;
};

export default DashboardRedirect;
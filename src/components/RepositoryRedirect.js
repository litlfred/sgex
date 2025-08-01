import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const RepositoryRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useParams();

  useEffect(() => {
    // Redirect to DAK selection instead of repositories
    const profile = location.state?.profile;
    const action = location.state?.action;
    
    if (user) {
      // If we have a user parameter from the route, redirect to user-specific DAK selection
      navigate(`/dak-selection/${user}`, { 
        state: { profile, action },
        replace: true 
      });
    } else if (profile) {
      // If we have a profile in state, redirect to user-specific DAK selection
      navigate(`/dak-selection/${profile.login}`, { 
        state: { profile, action },
        replace: true 
      });
    } else {
      // If no user or profile, redirect to general DAK selection
      navigate('/dak-selection', { 
        state: { action },
        replace: true 
      });
    }
  }, [location, navigate, user]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: '#666'
    }}>
      Redirecting to DAK selection...
    </div>
  );
};

export default RepositoryRedirect;
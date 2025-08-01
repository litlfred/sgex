import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RepositoryRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to DAK selection instead of repositories
    const profile = location.state?.profile;
    const action = location.state?.action;
    
    if (profile) {
      // If we have a profile, redirect to user-specific DAK selection
      navigate(`/dak-selection/${profile.login}`, { 
        state: { profile, action },
        replace: true 
      });
    } else {
      // If no profile, redirect to general DAK selection
      navigate('/dak-selection', { 
        state: { action },
        replace: true 
      });
    }
  }, [location, navigate]);

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
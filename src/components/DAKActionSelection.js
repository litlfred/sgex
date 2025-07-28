import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ContextualHelpMascot from './ContextualHelpMascot';
import './DAKActionSelection.css';

const DAKActionSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: userParam } = useParams();
  
  const { profile } = location.state || {};

  // Validate user parameter and profile consistency
  useEffect(() => {
    // If no user parameter in URL and no profile in state, redirect to landing
    if (!userParam && !profile) {
      navigate('/');
      return;
    }
    
    // If user parameter exists but no profile - redirect to landing
    if (userParam && !profile) {
      navigate('/');
      return;
    }
    
    // If user parameter exists and profile exists but they don't match - redirect to landing
    if (userParam && profile && profile.login !== userParam) {
      navigate('/');
      return;
    }
    
    // If profile exists but no user parameter, redirect to include user in URL
    if (profile && !userParam) {
      navigate(`/dak-action/${profile.login}`, { 
        state: { profile },
        replace: true 
      });
      return;
    }
  }, [userParam, profile, navigate]);

  const dakActions = [
    {
      id: 'edit',
      title: 'Edit Existing DAK',
      description: 'Select and modify an existing DAK that you have permission to edit. Changes will be made directly to the repository.',
      icon: '✏️',
      color: '#0078d4'
    },
    {
      id: 'fork', 
      title: 'Fork Existing DAK',
      description: 'Create a copy of an existing DAK in your own organization or account. You will be able to modify the forked version independently.',
      icon: '🍴',
      color: '#107c10'
    },
    {
      id: 'create',
      title: 'Create New DAK',
      description: 'Create a new DAK from the WHO SMART Guidelines template (smart-ig-empty). You\'ll configure basic parameters and start with a clean template.',
      icon: '✨',
      color: '#881798'
    }
  ];

  const handleActionSelect = (actionId) => {
    // Navigate directly to the DAK selection with the chosen action and user parameter
    navigate(`/dak-selection/${profile.login}`, { 
      state: { 
        profile, 
        action: actionId 
      } 
    });
  };

  const handleHomeNavigation = () => {
    navigate('/', { state: { profile } });
  };

  const handleBackToProfile = () => {
    navigate('/', { state: { profile } });
  };

  if (!profile) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="dak-action-selection">
      <div className="action-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="profile-info">
          <img 
            src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
            alt="Profile" 
            className="profile-avatar" 
          />
          <span>{profile.name || profile.login}</span>
          <a href="/sgex/docs/overview" className="nav-link">📖 Documentation</a>
        </div>
      </div>

      <div className="action-content">
        <div className="breadcrumb">
          <button onClick={handleBackToProfile} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Choose DAK Action</span>
        </div>

        <div className="action-selection">
          <div className="action-intro">
            <h2>Manage a DAK</h2>
            <p>
              Choose how you would like to work with a WHO SMART Guidelines Digital Adaptation Kit (DAK). 
              Each option provides different workflows for DAK management and editing.
            </p>
          </div>

          <div className="actions-grid">
            {dakActions.map((action) => (
              <div 
                key={action.id}
                className={`action-card`}
                onClick={() => handleActionSelect(action.id)}
                style={{ '--action-color': action.color }}
              >
                <div className="action-header-content">
                  <div className="action-icon" style={{ color: action.color }}>
                    {action.icon}
                  </div>
                  <h3>{action.title}</h3>
                </div>
                
                <div className="action-description">
                  <p>{action.description}</p>
                </div>

                <div className="action-workflow">
                  {action.id === 'edit' && (
                    <div className="workflow-steps">
                      <span className="step">1. Select DAK</span>
                      <span className="step">2. Edit Components</span>
                    </div>
                  )}
                  {action.id === 'fork' && (
                    <div className="workflow-steps">
                      <span className="step">1. Select Source DAK</span>
                      <span className="step">2. Select Destination</span>
                      <span className="step">3. Edit Components</span>
                    </div>
                  )}
                  {action.id === 'create' && (
                    <div className="workflow-steps">
                      <span className="step">1. Select Template</span>
                      <span className="step">2. Select Destination</span>
                      <span className="step">3. Configure DAK</span>
                      <span className="step">4. Edit Components</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <ContextualHelpMascot 
        pageId="dak-action-selection"
        position="bottom-right"
        contextData={{ profile }}
      />
    </div>
  );
};

export default DAKActionSelection;
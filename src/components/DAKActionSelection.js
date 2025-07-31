import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageLayout, useUserParams } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';
import './DAKActionSelection.css';

const DAKActionSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Generate custom breadcrumbs that represent the actual DAK action navigation flow
  const generateDAKActionBreadcrumbs = () => {
    const breadcrumbs = [
      {
        label: 'Select Profile',
        path: '/',
        onClick: () => navigate('/')
      },
      {
        label: 'Choose DAK Action',
        current: true
      }
    ];

    return breadcrumbs;
  };

  return (
    <PageLayout 
      pageName="dak-action" 
      showHeader={false}
      customBreadcrumbs={generateDAKActionBreadcrumbs()}
    >
      <DAKActionSelectionContent />
    </PageLayout>
  );
};

const DAKActionSelectionContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useUserParams();
  
  // If using location state profile, use that; otherwise use framework profile
  const effectiveProfile = location.state?.profile || profile;

  // Validate user parameter and profile consistency
  useEffect(() => {
    // If user parameter exists and profile exists but they don't match - redirect to landing
    if (user && effectiveProfile && effectiveProfile.login !== user) {
      navigate('/');
      return;
    }
    
    // If profile exists but no user parameter, redirect to include user in URL
    if (effectiveProfile && !user) {
      navigate(`/dak-action/${effectiveProfile.login}`, { 
        state: { profile: effectiveProfile },
        replace: true 
      });
      return;
    }
  }, [user, effectiveProfile, navigate]);

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

  const handleActionSelect = (event, actionId) => {
    // Navigate directly to the DAK selection with the chosen action and user parameter
    const navigationState = { 
      profile: effectiveProfile, 
      action: actionId 
    };
    
    handleNavigationClick(event, `/dak-selection/${effectiveProfile.login}`, navigate, navigationState);
  };

  if (!effectiveProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="action-content">
      <div className="action-main">
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
              onClick={(event) => handleActionSelect(event, action.id)}
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
  );
};

export default DAKActionSelection;
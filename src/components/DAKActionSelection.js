import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageLayout, usePageParams } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';
import './DAKActionSelection.css';

const DAKActionSelection = () => {
  return (
    <PageLayout pageName="dak-action-selection">
      <DAKActionSelectionContent />
    </PageLayout>
  );
};

const DAKActionSelectionContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = usePageParams();
  
  // Use profile from framework (PageProvider) or location state
  const effectiveProfile = profile || location.state?.profile;

  // For unauthenticated users without a profile, create a default one
  // This allows them to see the page and understand the options available
  const fallbackProfile = !effectiveProfile ? {
    login: 'demo-user',
    name: 'Demo User', 
    avatar_url: '/sgex-mascot.png',
    type: 'User',
    isUnauthenticated: true
  } : null;

  const displayProfile = effectiveProfile || fallbackProfile;

  // Note: Profile validation is handled by PageLayout framework
  // When accessing directly via URL, the framework will load the profile based on URL params

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
    // For unauthenticated users, show info message about signing in
    if (!effectiveProfile || displayProfile.isUnauthenticated) {
      alert('Please sign in to GitHub to manage DAKs. You can browse public repositories and view their content without signing in.');
      return;
    }

    // Navigate directly to the DAK selection with the chosen action and user parameter
    const navigationState = { 
      profile: effectiveProfile, 
      action: actionId 
    };
    
    handleNavigationClick(event, `/dak-selection/${effectiveProfile.login}`, navigate, navigationState);
  };

  // Always show the page content - displayProfile will have either the real profile or fallback
  return (
    <div className="action-content">
      <div className="action-main">
        <div className="action-header">
          <div className="action-title">
            <h1>Manage a DAK</h1>
            <p className="action-subtitle">Choose how you would like to work with a WHO SMART Guidelines Digital Adaptation Kit (DAK). Each option provides different workflows for DAK management and editing.</p>
            {displayProfile.isUnauthenticated && (
              <div className="auth-notice" style={{ background: '#e3f2fd', padding: '12px', borderRadius: '4px', marginTop: '12px' }}>
                <strong>Note:</strong> You are viewing as an unauthenticated user. Sign in to GitHub to create, edit, or fork DAKs.
                You can browse public repositories without signing in.
              </div>
            )}
          </div>
        </div>
        <div className="action-intro">
        </div>

        <div className="actions-grid">
          {dakActions.map((action) => (
            <div 
              key={action.id}
              className={`action-card ${displayProfile.isUnauthenticated ? 'disabled' : ''}`}
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
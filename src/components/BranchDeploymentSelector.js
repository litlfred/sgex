import React, { useState, useEffect } from 'react';
import { PageLayout } from './framework';
import useThemeImage from '../hooks/useThemeImage';
import './BranchDeploymentSelector.css';

const BranchDeploymentSelector = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme-aware image paths
  const mascotImage = useThemeImage('sgex-mascot.png');

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        setLoading(true);
        
        // For now, we'll use a mock list of deployments
        // In the future, this could be fetched from GitHub Pages API or a deployment manifest
        const mockDeployments = [
          {
            id: 'main',
            name: 'Main Application',
            branch: 'main',
            url: '/sgex/',
            description: 'Primary SGEX Workbench application with all features',
            status: 'active',
            lastUpdated: new Date().toISOString(),
            type: 'main'
          },
          {
            id: 'feature-branch-1',
            name: 'Feature: Enhanced Editor',
            branch: 'feature/enhanced-editor',
            url: '/sgex/feature-enhanced-editor/',
            description: 'Testing new enhanced component editor features',
            status: 'active',
            lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            type: 'feature'
          },
          {
            id: 'feature-branch-2',
            name: 'Feature: Improved UI',
            branch: 'feature/improved-ui',
            url: '/sgex/feature-improved-ui/',
            description: 'Updated user interface with improved accessibility',
            status: 'active',
            lastUpdated: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            type: 'feature'
          }
        ];

        setDeployments(mockDeployments);
      } catch (err) {
        console.error('Error fetching deployments:', err);
        setError('Failed to load deployment information');
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, []);

  const handleDeploymentSelect = (deployment) => {
    // Navigate to the deployment URL
    window.location.href = deployment.url;
  };

  const formatLastUpdated = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Updated less than an hour ago';
    } else if (diffInHours < 24) {
      return `Updated ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Updated ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <PageLayout pageName="deployment-selector-loading">
        <div className="deployment-selector-content">
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Loading deployments...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout pageName="deployment-selector-error">
        <div className="deployment-selector-content">
          <div className="error-section">
            <h2>Error Loading Deployments</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="deployment-selector" showBreadcrumbs={false}>
      <div className="deployment-selector-content">
        <div className="deployment-hero">
          <div className="deployment-intro">
            <div className="deployment-mascot">
              <img src={mascotImage} alt="SGEX Workbench Helper" />
            </div>
            <div className="deployment-text">
              <h1>SGEX Deployments</h1>
              <h2>Branch Deployment Selector</h2>
              <p className="deployment-description">
                Select a deployment to explore different versions and features of SGEX Workbench. 
                Each deployment represents a different branch or feature in development.
              </p>
            </div>
          </div>
        </div>

        <div className="deployments-grid">
          {deployments.map((deployment) => (
            <div 
              key={deployment.id}
              className={`deployment-card ${deployment.type}`}
              onClick={() => handleDeploymentSelect(deployment)}
            >
              <div className="deployment-card-header">
                <div className="deployment-status">
                  <span className={`status-indicator ${deployment.status}`}></span>
                  <span className="status-text">{deployment.status}</span>
                </div>
                <div className="deployment-type-badge">
                  {deployment.type === 'main' ? '🏠 Main' : '🔬 Feature'}
                </div>
              </div>
              
              <div className="deployment-card-content">
                <h3>{deployment.name}</h3>
                <p className="deployment-branch">Branch: {deployment.branch}</p>
                <p className="deployment-description">{deployment.description}</p>
                
                <div className="deployment-meta">
                  <p className="deployment-last-updated">
                    {formatLastUpdated(deployment.lastUpdated)}
                  </p>
                  <p className="deployment-url">
                    {deployment.url}
                  </p>
                </div>
              </div>
              
              <div className="deployment-card-footer">
                <button className="deployment-launch-btn">
                  Launch Deployment →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="deployment-info">
          <div className="info-card">
            <h3>About SGEX Deployments</h3>
            <p>
              Each deployment represents a different version of SGEX Workbench. The main deployment 
              contains the stable, production-ready version. Feature deployments contain experimental 
              features and improvements that are being tested before they are merged into the main application.
            </p>
            <p>
              Feature deployments may contain incomplete features or bugs. Use them to preview upcoming 
              functionality and provide feedback to the development team.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BranchDeploymentSelector;
import React, { useState, useEffect } from 'react';
import { PageLayout } from './framework';
import useThemeImage from '../hooks/useThemeImage';
import BranchListingPage from './BranchListingPage';

/**
 * Deployment information interface
 */
interface Deployment {
  id: string;
  name: string;
  branch: string;
  url: string;
  description: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
  type: 'main' | 'feature';
}

/**
 * Props for BranchDeploymentSelector component
 */
interface BranchDeploymentSelectorProps {
  /** Mode of operation - either deployment selector or full branch listing */
  mode?: 'deployment-selector' | 'branch-listing';
}

/**
 * BranchDeploymentSelector - Component for selecting between different branch deployments
 * 
 * Displays available deployments (main and feature branches) and allows users to navigate between them.
 * Can also show a full branch listing page.
 * 
 * @param props - Component props
 * @returns React component
 */
const BranchDeploymentSelector: React.FC<BranchDeploymentSelectorProps> = ({ mode = 'deployment-selector' }) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Theme-aware image paths
  const mascotImage = useThemeImage('sgex-mascot.png');

  useEffect(() => {
    // Only fetch deployments if we're in deployment selector mode
    if (mode !== 'deployment-selector') return;
    
    const fetchDeployments = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // For now, we'll use a mock list of deployments
        // In the future, this could be fetched from GitHub Pages API or a deployment manifest
        const mockDeployments: Deployment[] = [
          {
            id: 'main',
            name: 'Main Application',
            branch: 'main',
            url: './main/',
            description: 'Primary SGEX Workbench application with all features',
            status: 'active',
            lastUpdated: new Date().toISOString(),
            type: 'main'
          },
          {
            id: 'feature-branch-1',
            name: 'Feature: Enhanced Editor',
            branch: 'feature/enhanced-editor',
            url: './feature-enhanced-editor/',
            description: 'Testing new enhanced component editor features',
            status: 'active',
            lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            type: 'feature'
          },
          {
            id: 'feature-branch-2',
            name: 'Feature: Improved UI',
            branch: 'feature/improved-ui',
            url: './feature-improved-ui/',
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
  }, [mode]);

  const handleDeploymentSelect = (deployment: Deployment): void => {
    // Navigate to the deployment URL
    window.location.href = deployment.url;
  };

  const formatLastUpdated = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Updated less than an hour ago';
    } else if (diffInHours < 24) {
      return `Updated ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Updated ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  // If mode is 'branch-listing', use the full branch listing page
  if (mode === 'branch-listing') {
    return <BranchListingPage />;
  }

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
            <button 
              key={deployment.id}
              className={`deployment-card ${deployment.type}`}
              onClick={() => handleDeploymentSelect(deployment)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDeploymentSelect(deployment)}
              style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}
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
            </button>
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

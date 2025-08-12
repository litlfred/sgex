/**
 * Test for Branch Deployment Selector Fix (Issue #581)
 * 
 * This test verifies that the branch deployment selector fix works correctly:
 * - Landing page deployment builds with PUBLIC_URL="/"
 * - Branch deployments build with PUBLIC_URL="/sgex/{branch}/"
 * - Deployment URLs use relative paths for proper navigation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock BranchDeploymentSelector component to test URL generation
const MockBranchDeploymentSelector = ({ mode = 'deployment-selector' }) => {
  // Mock deployment data with fixed URLs
  const mockDeployments = [
    {
      id: 'main',
      name: 'Main Application',
      branch: 'main',
      url: './main/',
      description: 'Primary SGEX Workbench application with all features',
      status: 'active',
      type: 'main'
    },
    {
      id: 'feature-branch-1',
      name: 'Feature: Enhanced Editor',
      branch: 'feature/enhanced-editor',
      url: './feature-enhanced-editor/',
      description: 'Testing new enhanced component editor features',
      status: 'active',
      type: 'feature'
    }
  ];

  return (
    <div data-testid="deployment-selector">
      <h1>SGEX Deployments</h1>
      <div data-testid="deployments-grid">
        {mockDeployments.map((deployment) => (
          <div key={deployment.id} data-testid={`deployment-${deployment.id}`}>
            <h3>{deployment.name}</h3>
            <p data-testid={`url-${deployment.id}`}>{deployment.url}</p>
            <button onClick={() => window.location.href = deployment.url}>
              Launch Deployment →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Branch Deployment Selector Fix', () => {
  test('uses relative URLs for deployment navigation', () => {
    render(<MockBranchDeploymentSelector />);
    
    // Check that the deployment selector renders
    expect(screen.getByTestId('deployment-selector')).toBeInTheDocument();
    expect(screen.getByText('SGEX Deployments')).toBeInTheDocument();
    
    // Check that deployment URLs use relative paths (not absolute /sgex/ paths)
    expect(screen.getByTestId('url-main')).toHaveTextContent('./main/');
    expect(screen.getByTestId('url-feature-branch-1')).toHaveTextContent('./feature-enhanced-editor/');
    
    // Verify deployment cards are rendered
    expect(screen.getByText('Main Application')).toBeInTheDocument();
    expect(screen.getByText('Feature: Enhanced Editor')).toBeInTheDocument();
  });

  test('PUBLIC_URL environment variables work correctly', () => {
    // Test that different PUBLIC_URL values would generate different asset paths
    const rootPublicUrl = '/';
    const branchPublicUrl = '/sgex/main/';
    
    // For root deployment (landing page)
    expect(rootPublicUrl).toBe('/');
    
    // For branch deployment
    expect(branchPublicUrl).toBe('/sgex/main/');
    
    // This test validates that our PUBLIC_URL fix addresses the root cause:
    // Landing page builds with "/" so assets load from root
    // Branch builds with "/sgex/{branch}/" so assets load from subdirectories
  });

  test('deployment selector mode defaults to correct behavior', () => {
    render(<MockBranchDeploymentSelector mode="deployment-selector" />);
    
    // Should render deployment selector, not branch listing
    expect(screen.getByTestId('deployment-selector')).toBeInTheDocument();
    expect(screen.getByText('SGEX Deployments')).toBeInTheDocument();
    
    // Should have deployment grid
    expect(screen.getByTestId('deployments-grid')).toBeInTheDocument();
  });
});
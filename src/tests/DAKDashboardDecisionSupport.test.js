import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DAKDashboard from '../components/DAKDashboard';
import githubService from '../services/githubService';
import dakValidationService from '../services/dakValidationService';

// Mock services
jest.mock('../services/githubService');
jest.mock('../services/dakValidationService');
jest.mock('../services/branchContextService');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({
    user: 'testuser',
    repo: 'test-dak',
    branch: 'main'
  }),
  useLocation: () => ({
    state: null,
    pathname: '/dashboard/testuser/test-dak/main'
  })
}));

describe('DAKDashboard Decision Support Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authentication and repository data
    githubService.isAuth.mockReturnValue(false);
    dakValidationService.validateDemoDAKRepository.mockReturnValue(true);
    githubService.checkRepositoryWritePermissions.mockResolvedValue(false);
  });

  it('allows navigation to decision support logic view without authentication', async () => {
    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Digital Adaptation Kit Components')).toBeInTheDocument();
    });

    // Find and click the decision support card
    const decisionSupportCard = screen.getByText('Decision-Support Logic').closest('.component-card');
    expect(decisionSupportCard).toBeInTheDocument();
    
    fireEvent.click(decisionSupportCard);

    // Should navigate to decision support logic view
    expect(mockNavigate).toHaveBeenCalledWith(
      '/decision-support-logic/testuser/test-dak/main',
      expect.objectContaining({
        state: expect.objectContaining({
          profile: expect.any(Object),
          repository: expect.any(Object),
          selectedBranch: 'main'
        })
      })
    );
  });

  it('decision support card is always clickable regardless of authentication', async () => {
    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Decision-Support Logic')).toBeInTheDocument();
    });

    // Decision support card should be clickable even without write access
    const decisionSupportCard = screen.getByText('Decision-Support Logic').closest('.component-card');
    expect(decisionSupportCard).toBeInTheDocument();
    expect(decisionSupportCard).not.toHaveClass('disabled');

    // Click should work
    fireEvent.click(decisionSupportCard);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('other components show permission dialog when clicked without write access', async () => {
    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Generic Personas')).toBeInTheDocument();
    });

    // Click on a component that requires permissions
    const personasCard = screen.getByText('Generic Personas').closest('.component-card');
    fireEvent.click(personasCard);

    // Should show permission dialog instead of navigating
    await waitFor(() => {
      expect(screen.getByText('Edit Access Required')).toBeInTheDocument();
    });

    // Should not have navigated
    expect(mockNavigate).not.toHaveBeenCalledWith(
      expect.stringContaining('/editor/generic-personas'),
      expect.any(Object)
    );
  });

  it('business processes navigation works without permission check', async () => {
    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Generic Business Processes and Workflows')).toBeInTheDocument();
    });

    // Click on business processes card
    const businessProcessCard = screen.getByText('Generic Business Processes and Workflows').closest('.component-card');
    fireEvent.click(businessProcessCard);

    // Should navigate to business process selection
    expect(mockNavigate).toHaveBeenCalledWith(
      '/business-process-selection/testuser/test-dak/main',
      expect.objectContaining({
        state: expect.objectContaining({
          profile: expect.any(Object),
          repository: expect.any(Object),
          selectedBranch: 'main'
        })
      })
    );
  });

  it('decision support card has correct metadata and styling', async () => {
    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Decision-Support Logic')).toBeInTheDocument();
    });

    // Check card content
    const decisionSupportCard = screen.getByText('Decision-Support Logic').closest('.component-card');
    
    // Should have the correct icon
    expect(screen.getByText('🎯')).toBeInTheDocument();
    
    // Should have description
    expect(screen.getByText(/DMN decision tables and clinical decision support rules/)).toBeInTheDocument();
    
    // Should have file types
    expect(screen.getByText('DMN')).toBeInTheDocument();
    expect(screen.getByText('XML')).toBeInTheDocument();
    
    // Should have file count
    expect(screen.getByText('24 files')).toBeInTheDocument();
    
    // Should have the correct CSS custom property for color
    const cardStyle = window.getComputedStyle(decisionSupportCard);
    expect(decisionSupportCard).toHaveStyle('--component-color: #00bcf2');
  });

  it('handles URL navigation to decision support logic directly', async () => {
    // Test that the dashboard properly handles being accessed via URL params
    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-dak')).toBeInTheDocument();
    });

    // Should show the repository name and branch from URL params
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('works in demo mode without GitHub authentication', async () => {
    // Ensure we're testing demo mode
    githubService.isAuth.mockReturnValue(false);
    
    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Decision-Support Logic')).toBeInTheDocument();
    });

    // Should work in demo mode
    const decisionSupportCard = screen.getByText('Decision-Support Logic').closest('.component-card');
    fireEvent.click(decisionSupportCard);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/decision-support-logic/testuser/test-dak/main',
      expect.objectContaining({
        state: expect.objectContaining({
          profile: expect.objectContaining({
            isDemo: true
          }),
          repository: expect.objectContaining({
            isDemo: true
          })
        })
      })
    );
  });
});

describe('DAK Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    githubService.isAuth.mockReturnValue(false);
    dakValidationService.validateDemoDAKRepository.mockReturnValue(true);
    githubService.checkRepositoryWritePermissions.mockResolvedValue(false);
  });

  it('ensures all public access components work without authentication', async () => {
    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Digital Adaptation Kit Components')).toBeInTheDocument();
    });

    // These components should be accessible without authentication
    const publicComponents = [
      'Decision-Support Logic',
      'Generic Business Processes and Workflows',
      'Health Interventions and Recommendations',
      'Pages'
    ];

    for (const componentName of publicComponents) {
      const componentCard = screen.getByText(componentName).closest('.component-card');
      expect(componentCard).toBeInTheDocument();
      
      // Click should not be disabled
      fireEvent.click(componentCard);
      expect(mockNavigate).toHaveBeenCalled();
      
      // Reset mock for next iteration
      mockNavigate.mockClear();
    }
  });

  it('shows appropriate access indicators', async () => {
    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('👁️ Read-Only Access')).toBeInTheDocument();
    });

    // Should show read-only access indicator when not authenticated or without write permissions
    expect(screen.queryByText('✏️ Edit Access')).not.toBeInTheDocument();
  });
});
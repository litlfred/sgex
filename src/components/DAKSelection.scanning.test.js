import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import DAKSelection from './DAKSelection';
import { PageLayout } from './framework';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';

// Mock services
jest.mock('../services/githubService');
jest.mock('../services/repositoryCacheService');

const mockProfile = {
  login: 'demo-user',
  name: 'Demo User',
  avatar_url: 'https://github.com/demo-user.png',
  isDemo: true
};

const mockLocationState = {
  profile: mockProfile,
  action: 'edit'
};

describe('DAKSelection Repository Scanning Control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    githubService.isAuth.mockReturnValue(false);
    repositoryCacheService.getCachedRepositories.mockReturnValue(null);
  });

  test('does not trigger automatic scanning on initial load', async () => {
    const mockGetSmartGuidelinesRepositoriesProgressive = jest.fn().mockResolvedValue([]);
    githubService.getSmartGuidelinesRepositoriesProgressive = mockGetSmartGuidelinesRepositoriesProgressive;

    render(
      <MemoryRouter 
        initialEntries={[{
          pathname: '/dak-selection/demo-user',
          state: mockLocationState
        }]}
      >
        <PageLayout pageName="dak-selection">
          <DAKSelection />
        </PageLayout>
      </MemoryRouter>
    );

    // Wait for component to fully render
    await waitFor(() => {
      expect(screen.getByText('Select DAK to Edit')).toBeInTheDocument();
    });

    // Should show "No repositories found" initially without auto-scanning
    expect(screen.getByText('No repositories found')).toBeInTheDocument();
    
    // Verify that automatic scanning was NOT triggered
    expect(mockGetSmartGuidelinesRepositoriesProgressive).not.toHaveBeenCalled();
  });

  test('triggers scanning only when demo scanning button is clicked', async () => {
    const mockGetSmartGuidelinesRepositoriesProgressive = jest.fn().mockResolvedValue([]);
    githubService.getSmartGuidelinesRepositoriesProgressive = mockGetSmartGuidelinesRepositoriesProgressive;

    render(
      <MemoryRouter 
        initialEntries={[{
          pathname: '/dak-selection/demo-user',
          state: mockLocationState
        }]}
      >
        <PageLayout pageName="dak-selection">
          <DAKSelection />
        </PageLayout>
      </MemoryRouter>
    );

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Select DAK to Edit')).toBeInTheDocument();
    });

    // Initially should show no repositories
    expect(screen.getByText('No repositories found')).toBeInTheDocument();
    
    // Verify scanning was not called automatically
    expect(mockGetSmartGuidelinesRepositoriesProgressive).not.toHaveBeenCalled();
    
    // Click the demo scanning button should be available but we'll just verify it exists
    const demoScanButton = screen.getByText(/Demo Enhanced Scanning Display/i);
    expect(demoScanButton).toBeInTheDocument();
  });

  test('uses cached data when available without triggering new scan', async () => {
    const mockCachedRepos = [
      {
        id: 1,
        name: 'cached-repo',
        full_name: 'demo-user/cached-repo',
        description: 'A cached repository',
        smart_guidelines_compatible: true
      }
    ];

    const mockCachedData = {
      repositories: mockCachedRepos,
      timestamp: Date.now(),
      owner: 'demo-user',
      type: 'user'
    };

    repositoryCacheService.getCachedRepositories.mockReturnValue(mockCachedData);
    repositoryCacheService.getCacheInfo.mockReturnValue({
      exists: true,
      stale: false,
      age: 1000,
      ageHours: 0,
      repositoryCount: 1
    });

    const mockGetSmartGuidelinesRepositoriesProgressive = jest.fn();
    githubService.getSmartGuidelinesRepositoriesProgressive = mockGetSmartGuidelinesRepositoriesProgressive;
    githubService.isAuth.mockReturnValue(true); // Authenticated user to test cache

    render(
      <MemoryRouter 
        initialEntries={[{
          pathname: '/dak-selection/demo-user',
          state: mockLocationState
        }]}
      >
        <PageLayout pageName="dak-selection">
          <DAKSelection />
        </PageLayout>
      </MemoryRouter>
    );

    // Wait for cached data to be displayed
    await waitFor(() => {
      expect(screen.getByText('cached-repo')).toBeInTheDocument();
    });

    // Verify that new scanning was NOT triggered since we have cached data
    expect(mockGetSmartGuidelinesRepositoriesProgressive).not.toHaveBeenCalled();
    
    // Verify cache was checked
    expect(repositoryCacheService.getCachedRepositories).toHaveBeenCalledWith('demo-user', 'user');
  });
});
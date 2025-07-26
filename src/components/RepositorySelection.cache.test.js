/**
 * Test for RepositorySelection caching behavior
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RepositorySelection from './RepositorySelection';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';

// Mock the services
jest.mock('../services/githubService');
jest.mock('../services/repositoryCacheService');

// Mock console.log to capture logging output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

const mockProfile = {
  login: 'testuser',
  type: 'user',
  name: 'Test User',
  avatar_url: 'https://github.com/testuser.png'
};

const mockRepositories = [
  {
    id: 1,
    name: 'smart-repo',
    description: 'A SMART guidelines repository',
    smart_guidelines_compatible: true,
    stargazers_count: 5,
    forks_count: 2,
    updated_at: '2023-01-01T00:00:00Z',
    topics: ['smart-guidelines', 'who']
  }
];

// Wrapper component with router
const RepositorySelectionWrapper = ({ profile }) => (
  <BrowserRouter>
    <RepositorySelection />
  </BrowserRouter>
);

// Mock useLocation and useNavigate
const mockNavigate = jest.fn();
const mockLocation = {
  state: { profile: mockProfile }
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
}));

describe('RepositorySelection Caching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    githubService.getRepositories.mockClear();
    repositoryCacheService.getCachedRepositories.mockClear();
    repositoryCacheService.setCachedRepositories.mockClear();
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('should use cached repositories when available and fresh', async () => {
    // Mock cache service to return cached data
    repositoryCacheService.getCachedRepositories.mockReturnValue({
      repositories: mockRepositories,
      timestamp: Date.now(),
      owner: 'testuser',
      type: 'user'
    });

    render(<RepositorySelectionWrapper profile={mockProfile} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('smart-repo')).toBeInTheDocument();
    });

    // Should have checked cache
    expect(repositoryCacheService.getCachedRepositories).toHaveBeenCalledWith('testuser', 'user');
    
    // Should NOT have called GitHub service since cache was used
    expect(githubService.getRepositories).not.toHaveBeenCalled();
    
    // Should NOT have tried to cache (since we used cache)
    expect(repositoryCacheService.setCachedRepositories).not.toHaveBeenCalled();

    // Should log that cached repositories were used
    expect(mockConsoleLog).toHaveBeenCalledWith('Using cached repositories for testuser (user)');
  });

  it('should fetch fresh repositories when cache is empty or stale', async () => {
    // Mock cache service to return null (no cache or stale)
    repositoryCacheService.getCachedRepositories.mockReturnValue(null);
    
    // Mock GitHub service to return repositories
    githubService.getRepositories.mockResolvedValue(mockRepositories);
    
    // Mock successful caching
    repositoryCacheService.setCachedRepositories.mockReturnValue(true);

    render(<RepositorySelectionWrapper profile={mockProfile} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('smart-repo')).toBeInTheDocument();
    });

    // Should have checked cache first
    expect(repositoryCacheService.getCachedRepositories).toHaveBeenCalledWith('testuser', 'user');
    
    // Should have called GitHub service since no cache was available
    expect(githubService.getRepositories).toHaveBeenCalledWith('testuser', 'user');
    
    // Should have cached the fresh results
    expect(repositoryCacheService.setCachedRepositories).toHaveBeenCalledWith('testuser', 'user', mockRepositories);

    // Should log that fresh repositories were fetched
    expect(mockConsoleLog).toHaveBeenCalledWith('Fetching fresh repositories for testuser (user)');
  });

  it('should handle organization profiles correctly', async () => {
    const orgProfile = {
      login: 'testorg',
      type: 'org',
      name: 'Test Organization',
      avatar_url: 'https://github.com/testorg.png'
    };

    // Update mock location for org profile
    mockLocation.state = { profile: orgProfile };

    // Mock cache service to return null
    repositoryCacheService.getCachedRepositories.mockReturnValue(null);
    
    // Mock GitHub service
    githubService.getRepositories.mockResolvedValue(mockRepositories);
    repositoryCacheService.setCachedRepositories.mockReturnValue(true);

    render(<RepositorySelectionWrapper profile={orgProfile} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('smart-repo')).toBeInTheDocument();
    });

    // Should have checked cache with org type
    expect(repositoryCacheService.getCachedRepositories).toHaveBeenCalledWith('testorg', 'org');
    
    // Should have called GitHub service with org type
    expect(githubService.getRepositories).toHaveBeenCalledWith('testorg', 'org');
    
    // Should have cached with org type
    expect(repositoryCacheService.setCachedRepositories).toHaveBeenCalledWith('testorg', 'org', mockRepositories);
  });

  it('should handle cache errors gracefully and fetch fresh data', async () => {
    // Reset mock location to use original profile
    mockLocation.state = { profile: mockProfile };
    
    // Mock cache service to throw an error
    repositoryCacheService.getCachedRepositories.mockImplementation(() => {
      throw new Error('Cache error');
    });
    
    // Mock GitHub service to succeed
    githubService.getRepositories.mockResolvedValue(mockRepositories);
    repositoryCacheService.setCachedRepositories.mockReturnValue(true);

    render(<RepositorySelectionWrapper profile={mockProfile} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('smart-repo')).toBeInTheDocument();
    });

    // Should have still tried to fetch fresh data
    expect(githubService.getRepositories).toHaveBeenCalledWith('testuser', 'user');
    
    // Should have still tried to cache the results
    expect(repositoryCacheService.setCachedRepositories).toHaveBeenCalledWith('testuser', 'user', mockRepositories);
  });
});
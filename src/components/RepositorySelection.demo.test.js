import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import RepositorySelection from './RepositorySelection';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';

// Mock the services
jest.mock('../services/githubService');
jest.mock('../services/repositoryCacheService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ user: 'demo-user' }),
  useLocation: () => ({ state: null }),
  useNavigate: () => jest.fn()
}));

describe('RepositorySelection Demo Mode', () => {
  const mockDemoRepositories = [
    {
      id: 'demo-smart-anc',
      name: 'smart-anc',
      full_name: 'demo-user/smart-anc',
      description: 'Demo SMART Guidelines Digital Adaptation Kit for Antenatal Care',
      private: false,
      owner: {
        login: 'demo-user',
        id: 'demo-owner',
        avatar_url: 'https://github.com/demo-user.png',
        type: 'User'
      },
      html_url: 'https://github.com/demo-user/smart-anc',
      language: 'FSH',
      stargazers_count: 15,
      forks_count: 3,
      topics: ['who', 'smart-guidelines', 'dak', 'antenatal-care', 'health'],
      updated_at: '2024-12-15T14:30:00Z',
      smart_guidelines_compatible: true,
      isDemo: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock GitHub service to not be authenticated
    githubService.isAuth.mockReturnValue(false);
    githubService.getRepositories.mockResolvedValue(mockDemoRepositories);
    
    // Mock repository cache service
    repositoryCacheService.getCachedRepositories.mockReturnValue(null);
    repositoryCacheService.setCachedRepositories.mockImplementation(() => {});
  });

  it('should load demo repositories for demo user without authentication', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <RepositorySelection />
        </BrowserRouter>
      );
    });

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('smart-anc')).toBeInTheDocument();
    });

    // Should display demo repository
    expect(screen.getByText('Demo SMART Guidelines Digital Adaptation Kit for Antenatal Care')).toBeInTheDocument();
    
    // Should have called GitHub service with demo flag
    expect(githubService.getRepositories).toHaveBeenCalledWith('demo-user', 'User', true);
    
    // Should have cached the demo repositories
    expect(repositoryCacheService.setCachedRepositories).toHaveBeenCalledWith('demo-user', 'User', mockDemoRepositories);
  });

  it('should display correct demo repository information', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <RepositorySelection />
        </BrowserRouter>
      );
    });

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('smart-anc')).toBeInTheDocument();
    });

    // Check repository details
    expect(screen.getByText('FSH')).toBeInTheDocument(); // Language badge
    expect(screen.getByText('15')).toBeInTheDocument(); // Stars
    expect(screen.getByText('3')).toBeInTheDocument(); // Forks
    expect(screen.getByText('who')).toBeInTheDocument(); // Topic
    expect(screen.getByText('smart-guidelines')).toBeInTheDocument(); // Topic
    expect(screen.getByText('dak')).toBeInTheDocument(); // Topic
  });
});
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DAKSelection from '../components/DAKSelection';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';

// Mock the services
jest.mock('../services/githubService');
jest.mock('../services/repositoryCacheService');

describe('DAKSelection Progressive Scanning', () => {
  let mockProfile;
  let mockOnProgress;
  let mockOnRepositoryFound;

  beforeEach(() => {
    mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.png',
      type: 'user'
    };

    // Clear all mocks
    jest.clearAllMocks();

    // Mock githubService
    githubService.isAuth.mockReturnValue(true);
    githubService.getSmartGuidelinesRepositoriesProgressive.mockImplementation(
      (login, type, onRepositoryFound, onProgress) => {
        // Store callbacks for testing
        mockOnRepositoryFound = onRepositoryFound;
        mockOnProgress = onProgress;
        
        // Return a promise that resolves after callbacks are called
        return new Promise((resolve) => {
          setTimeout(() => {
            // Simulate finding repositories
            const mockRepo = {
              id: 1,
              name: 'test-repo',
              full_name: 'testuser/test-repo',
              description: 'Test repository',
              smart_guidelines_compatible: true
            };
            
            // Simulate start callback
            onProgress({
              current: 1,
              total: 1,
              currentRepo: 'test-repo',
              progress: 100,
              completed: false,
              started: true
            });
            
            // Simulate found repository
            onRepositoryFound(mockRepo);
            
            // Simulate completion callback
            setTimeout(() => {
              onProgress({
                current: 1,
                total: 1,
                currentRepo: 'test-repo',
                progress: 100,
                completed: true
              });
              
              resolve([mockRepo]);
            }, 100);
          }, 50);
        });
      }
    );

    // Mock cache service
    repositoryCacheService.getCachedRepositories.mockReturnValue(null);
    repositoryCacheService.setCachedRepositories.mockImplementation(() => {});
  });

  test('shows scanning progress UI in authenticated mode', async () => {
    const mockLocationState = {
      profile: mockProfile,
      action: 'edit'
    };

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: '/dak-selection/testuser', state: mockLocationState }]}>
          <Routes>
            <Route path="/dak-selection/:user" element={<DAKSelection />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Wait for scanning to start
    await waitFor(() => {
      expect(screen.getByText(/scanning repositories for smart guidelines compatibility/i)).toBeInTheDocument();
    });

    // Check that currently scanning section appears
    await waitFor(() => {
      expect(screen.getByText(/currently testing/i)).toBeInTheDocument();
    });

    // Check that the specific repo being scanned is shown
    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument();
    });

    // Wait for scanning to complete
    await waitFor(() => {
      expect(screen.queryByText(/scanning repositories for smart guidelines compatibility/i)).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('calls progress callbacks correctly during scanning', async () => {
    const mockLocationState = {
      profile: mockProfile,
      action: 'edit'
    };

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: '/dak-selection/testuser', state: mockLocationState }]}>
          <Routes>
            <Route path="/dak-selection/:user" element={<DAKSelection />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Wait for the progressive scan to be called
    await waitFor(() => {
      expect(githubService.getSmartGuidelinesRepositoriesProgressive).toHaveBeenCalledWith(
        'testuser',
        'user',
        expect.any(Function), // onRepositoryFound
        expect.any(Function)  // onProgress
      );
    });

    expect(mockOnProgress).toBeDefined();
    expect(mockOnRepositoryFound).toBeDefined();
  });
});
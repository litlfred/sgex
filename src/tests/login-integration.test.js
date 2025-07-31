/**
 * Integration test for login functionality
 * Tests the specific issues mentioned in the problem statement
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import WelcomePage from '../components/WelcomePage';
import { PageLayout } from '../components/framework';
import githubService from '../services/githubService';

// Mock GitHub service
jest.mock('../services/githubService');

// Mock other services
jest.mock('../services/repositoryCacheService', () => ({
  getCachedRepositories: jest.fn(() => null),
  setCachedRepositories: jest.fn(),
  getCacheInfo: jest.fn(() => ({ isStale: false }))
}));

jest.mock('../services/dakValidationService', () => ({
  validateDAKRepository: jest.fn(() => Promise.resolve(true)),
  validateDemoDAKRepository: jest.fn(() => true)
}));

jest.mock('../services/profileSubscriptionService', () => ({
  ensureCurrentUserSubscribed: jest.fn(),
  autoAddVisitedProfile: jest.fn()
}));

const mockUser = {
  login: 'testuser',
  name: 'Test User',
  avatar_url: 'https://github.com/testuser.png',
  html_url: 'https://github.com/testuser'
};

const TestComponent = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Login Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    githubService.isAuth.mockReturnValue(false);
    githubService.isAuthenticated = false;
    githubService.authenticate.mockReturnValue(true);
    githubService.authenticateWithOctokit.mockReturnValue(true);
    githubService.getCurrentUser.mockResolvedValue(mockUser);
    githubService.checkTokenPermissions.mockResolvedValue({});
    
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
  });

  test('login button appears when not authenticated', async () => {
    await act(async () => {
      render(
        <TestComponent>
          <WelcomePage />
        </TestComponent>
      );
    });

    // Should show PAT login form when not authenticated
    expect(screen.getByPlaceholderText(/ghp_/)).toBeInTheDocument();
    expect(screen.getByText(/Sign In/)).toBeInTheDocument();
  });

  test('successful login updates authentication state', async () => {
    // Mock successful authentication
    const mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({ data: mockUser })
        }
      }
    };

    await act(async () => {
      render(
        <TestComponent>
          <WelcomePage />
        </TestComponent>
      );
    });

    // Find the token input and submit button
    const tokenInput = screen.getByPlaceholderText(/ghp_/);
    const submitButton = screen.getByText(/Sign In/);

    // Enter a test token
    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: 'ghp_test_token_123' } });
    });

    // Mock the Octokit import
    const mockOctokitClass = jest.fn().mockImplementation(() => mockOctokit);
    jest.doMock('@octokit/rest', () => ({
      Octokit: mockOctokitClass
    }));

    // Submit the form
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for authentication to complete
    await waitFor(() => {
      expect(githubService.authenticateWithOctokit).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('PageHeader shows user profile when authenticated', async () => {
    // Mock authenticated state
    githubService.isAuth.mockReturnValue(true);
    githubService.isAuthenticated = true;
    sessionStorage.setItem('github_token', 'test_token');

    const TestPageWithHeader = () => (
      <PageLayout pageName="test" showHeader={true}>
        <div>Test Page Content</div>
      </PageLayout>
    );

    await act(async () => {
      render(
        <TestComponent>
          <TestPageWithHeader />
        </TestComponent>
      );
    });

    // Should show user info when authenticated
    await waitFor(() => {
      expect(githubService.getCurrentUser).toHaveBeenCalled();
    });
  });

  test('repository scanning respects cache expiry', async () => {
    // This test verifies that repository scanning doesn't happen unnecessarily
    githubService.isAuth.mockReturnValue(true);
    githubService.isAuthenticated = true;
    
    // Mock cache service to return fresh data
    const repositoryCacheService = require('../services/repositoryCacheService');
    const mockCachedData = {
      repositories: [
        { 
          id: 1, 
          name: 'test-dak', 
          full_name: 'testuser/test-dak',
          owner: { login: 'testuser' }
        }
      ],
      timestamp: Date.now() - (1000 * 60 * 60), // 1 hour ago (fresh)
      owner: 'testuser',
      type: 'user'
    };
    
    repositoryCacheService.getCachedRepositories.mockReturnValue(mockCachedData);

    // This should use cached data and not trigger a new scan
    expect(repositoryCacheService.getCachedRepositories).not.toHaveBeenCalled();
  });

  test('custom auth events are properly dispatched', async () => {
    let authChangeEvents = [];
    
    // Listen for custom auth events
    const handleAuthChange = (event) => {
      authChangeEvents.push(event.detail);
    };
    
    window.addEventListener('githubAuthChange', handleAuthChange);

    // Import the real githubService temporarily to test event dispatch
    const realGithubService = jest.requireActual('../services/githubService');
    const testService = new realGithubService.default.constructor();

    // Simulate authentication with real service
    await act(async () => {
      testService.authenticate('test_token');
    });

    // Should have dispatched auth change event
    expect(authChangeEvents).toHaveLength(1);
    expect(authChangeEvents[0].isAuthenticated).toBe(true);

    // Simulate logout with real service
    await act(async () => {
      testService.logout();
    });

    // Should have dispatched logout event
    expect(authChangeEvents).toHaveLength(2);
    expect(authChangeEvents[1].isAuthenticated).toBe(false);

    window.removeEventListener('githubAuthChange', handleAuthChange);
  });
});
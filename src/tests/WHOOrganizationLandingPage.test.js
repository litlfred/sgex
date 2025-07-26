// Test to verify WHO organization appears in LandingPage profile selection
// Addresses issue: "WHO orgnaization is not shown"

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import githubService from '../services/githubService';

// Mock the GitHub service
jest.mock('../services/githubService', () => ({
  authenticate: jest.fn(),
  authenticateWithOctokit: jest.fn(),
  isAuth: jest.fn(),
  getCurrentUser: jest.fn(),
  getUserOrganizations: jest.fn(),
  logout: jest.fn(),
  checkTokenPermissions: jest.fn()
}));

// Mock PAT login component
jest.mock('../components/PATLogin', () => {
  return function MockPATLogin({ onAuthSuccess }) {
    return (
      <button 
        onClick={() => onAuthSuccess('mock-token', { mockOctokit: true })}
        data-testid="mock-signin-button"
      >
        Mock Sign In
      </button>
    );
  };
});

// Mock session storage
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value }),
    removeItem: jest.fn((key) => { delete store[key] }),
    clear: jest.fn(() => { store = {} })
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock localStorage similarly
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value }),
    removeItem: jest.fn((key) => { delete store[key] }),
    clear: jest.fn(() => { store = {} })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('WHO Organization in LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    mockLocalStorage.clear();
    
    // Reset GitHub service mocks
    githubService.authenticate.mockReturnValue(false);
    githubService.authenticateWithOctokit.mockReturnValue(true);
    githubService.isAuth.mockReturnValue(false);
  });

  it('should show WHO organization in profile selection after authentication', async () => {
    // Mock successful authentication flow
    githubService.isAuth.mockReturnValue(true);
    githubService.checkTokenPermissions.mockResolvedValue({
      type: 'pat',
      user: { login: 'testuser' }
    });
    
    const mockUser = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };
    
    const mockOrganizations = [
      {
        id: 12345,
        login: 'my-org',
        name: 'My Organization',
        avatar_url: 'https://github.com/my-org.png',
        type: 'Organization'
      }
    ];
    
    githubService.getCurrentUser.mockResolvedValue(mockUser);
    githubService.getUserOrganizations.mockResolvedValue(mockOrganizations);

    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Simulate authentication
    const signInButton = screen.getByTestId('mock-signin-button');
    fireEvent.click(signInButton);

    // Wait for profile selection to appear
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    });

    // Verify WHO organization is present
    expect(screen.getByText('World Health Organization')).toBeInTheDocument();
    expect(screen.getByText('@WorldHealthOrganization')).toBeInTheDocument();
    
    // Verify WHO badge is present
    expect(screen.getByText('WHO Official')).toBeInTheDocument();
    
    // Verify personal profile is also present
    expect(screen.getAllByText('Test User')[0]).toBeInTheDocument();
    
    // Verify regular organization is also present
    expect(screen.getByText('My Organization')).toBeInTheDocument();

    // Check that WHO organization has special styling
    const whoCard = container.querySelector('.profile-card.who-org');
    expect(whoCard).toBeInTheDocument();
  });

  it('should show WHO organization when getUserOrganizations fails', async () => {
    // Mock authentication but organizations fetch fails
    githubService.isAuth.mockReturnValue(true);
    githubService.checkTokenPermissions.mockResolvedValue({
      type: 'pat',
      user: { login: 'testuser' }
    });
    
    const mockUser = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };
    
    githubService.getCurrentUser.mockResolvedValue(mockUser);
    // Mock organizations fetch failure
    githubService.getUserOrganizations.mockRejectedValue(new Error('API error'));

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Simulate authentication
    const signInButton = screen.getByTestId('mock-signin-button');
    fireEvent.click(signInButton);

    // Wait for profile selection to appear
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    });

    // Even with API failure, WHO organization should still be present
    expect(screen.getByText('World Health Organization')).toBeInTheDocument();
    expect(screen.getByText('@WorldHealthOrganization')).toBeInTheDocument();
    expect(screen.getByText('WHO Official')).toBeInTheDocument();
  });

  it('should include WHO organization when user already has WHO in their organizations', async () => {
    // Test case where user is actually a member of WHO organization
    githubService.isAuth.mockReturnValue(true);
    githubService.checkTokenPermissions.mockResolvedValue({
      type: 'pat',
      user: { login: 'whouser' }
    });
    
    const mockUser = {
      login: 'whouser',
      name: 'WHO User',
      avatar_url: 'https://github.com/whouser.png'
    };
    
    const mockOrganizations = [
      {
        id: 12261302,
        login: 'WorldHealthOrganization',
        name: 'World Health Organization',
        avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
        type: 'Organization'
      },
      {
        id: 54321,
        login: 'other-org',
        name: 'Other Organization',
        avatar_url: 'https://github.com/other-org.png',
        type: 'Organization'
      }
    ];
    
    githubService.getCurrentUser.mockResolvedValue(mockUser);
    githubService.getUserOrganizations.mockResolvedValue(mockOrganizations);

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Simulate authentication
    const signInButton = screen.getByTestId('mock-signin-button');
    fireEvent.click(signInButton);

    // Wait for profile selection to appear
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    });

    // WHO organization should be present (only once, not duplicated)
    const whoElements = screen.getAllByText('World Health Organization');
    expect(whoElements).toHaveLength(1);
    
    // WHO should have the special badge and styling
    expect(screen.getByText('WHO Official')).toBeInTheDocument();
    
    // Other organization should also be present
    expect(screen.getByText('Other Organization')).toBeInTheDocument();
  });

  it('should maintain WHO organization at the top of the list', async () => {
    githubService.isAuth.mockReturnValue(true);
    githubService.checkTokenPermissions.mockResolvedValue({
      type: 'pat',
      user: { login: 'testuser' }
    });
    
    const mockUser = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };
    
    // Multiple organizations, WHO should appear first
    const mockOrganizations = [
      {
        id: 2,
        login: 'beta-org',
        name: 'Beta Organization',
        avatar_url: 'https://github.com/beta-org.png',
        type: 'Organization'
      },
      {
        id: 1,
        login: 'alpha-org', 
        name: 'Alpha Organization',
        avatar_url: 'https://github.com/alpha-org.png',
        type: 'Organization'
      }
    ];
    
    githubService.getCurrentUser.mockResolvedValue(mockUser);
    githubService.getUserOrganizations.mockResolvedValue(mockOrganizations);

    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Simulate authentication
    const signInButton = screen.getByTestId('mock-signin-button');
    fireEvent.click(signInButton);

    // Wait for profile selection to appear
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    });

    // Get all organization profile cards
    const orgCards = container.querySelectorAll('.profile-card');
    
    // First card should be personal, then WHO should be first organization
    const organizationCards = Array.from(orgCards).slice(1); // Skip personal profile card
    expect(organizationCards[0]).toHaveTextContent('World Health Organization');
    expect(organizationCards[0]).toHaveClass('who-org');
  });
});
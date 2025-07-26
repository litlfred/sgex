import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import githubService from '../services/githubService';

// Mock the GitHub service
jest.mock('../services/githubService');

const mockUser = {
  login: 'testuser',
  name: 'Test User',
  avatar_url: 'https://github.com/testuser.png',
};

const mockOrganizations = [
  {
    id: 'who-organization',
    login: 'WorldHealthOrganization',
    name: 'World Health Organization',
    description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
    avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
    html_url: 'https://github.com/WorldHealthOrganization',
    type: 'Organization',
    isWHO: true
  },
  {
    id: 'test-org',
    login: 'testorg',
    name: 'Test Organization',
    avatar_url: 'https://github.com/testorg.png',
    type: 'Organization'
  }
];

const mockSmartRepos = [
  { name: 'smart-test-repo', smart_guidelines_compatible: true },
  { name: 'another-smart-repo', smart_guidelines_compatible: true }
];

describe('LandingPage DAK Count Features', () => {
  beforeEach(() => {
    // Mock localStorage and sessionStorage
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();

    // Mock github service methods
    githubService.isAuth.mockReturnValue(true);
    githubService.authenticate.mockReturnValue(true);
    githubService.checkTokenPermissions.mockResolvedValue({ type: 'classic', user: mockUser });
    githubService.getCurrentUser.mockResolvedValue(mockUser);
    githubService.getUserOrganizations.mockResolvedValue(mockOrganizations.slice(1)); // Exclude WHO as it's added automatically
    githubService.getSmartGuidelinesRepositories.mockResolvedValue(mockSmartRepos);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders authenticated landing page with DAK count badges', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for authentication and data loading
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check if user profile is rendered
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Personal repositories')).toBeInTheDocument();

    // Check if WHO organization is rendered
    expect(screen.getByText('World Health Organization')).toBeInTheDocument();
    expect(screen.getByText('WHO Official')).toBeInTheDocument();

    // Check if test organization is rendered
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  test('displays DAK repository count badges when repositories are found', async () => {
    // Mock different counts for different profiles
    githubService.getSmartGuidelinesRepositories
      .mockResolvedValueOnce([mockSmartRepos[0]]) // 1 repo for user
      .mockResolvedValueOnce(mockSmartRepos) // 2 repos for WHO
      .mockResolvedValueOnce([]); // 0 repos for test org

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for authentication and data loading
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Wait for DAK counting to complete
    await waitFor(() => {
      // Check if DAK count badges are displayed
      const badges = screen.getAllByText('1');
      expect(badges.length).toBeGreaterThan(0);
    }, { timeout: 10000 });
  });

  test('shows scanning indicator while counting DAK repositories', async () => {
    // Mock a delayed response to test the scanning indicator
    githubService.getSmartGuidelinesRepositories.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockSmartRepos), 1000))
    );

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for authentication and data loading
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check if scanning indicators are shown
    await waitFor(() => {
      const scanningElements = screen.getAllByText('Scanning...');
      expect(scanningElements.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  test('handles DAK repository counting errors gracefully', async () => {
    // Mock error in repository fetching
    githubService.getSmartGuidelinesRepositories.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for authentication and data loading
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    }, { timeout: 5000 });

    // The component should still render without crashing
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('World Health Organization')).toBeInTheDocument();
  });

  test('displays proper avatar images for organizations', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for authentication and data loading
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check if WHO official avatar is displayed
    const whoAvatar = screen.getByAltText('World Health Organization organization');
    expect(whoAvatar).toBeInTheDocument();
    expect(whoAvatar.src).toBe('https://avatars.githubusercontent.com/u/12261302?s=200&v=4');

    // Check if test organization avatar is displayed
    const testOrgAvatar = screen.getByAltText('Test Organization organization');
    expect(testOrgAvatar).toBeInTheDocument();
    expect(testOrgAvatar.src).toBe('https://github.com/testorg.png');
  });
});
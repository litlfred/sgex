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

describe('LandingPage without DAK Count Features', () => {
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
    expect(screen.getByText('Personal repositories')).toBeInTheDocument();

    // Check if WHO organization is rendered
    expect(screen.getByText('World Health Organization')).toBeInTheDocument();
    expect(screen.getByText('WHO Official')).toBeInTheDocument();

    // Check if test organization is rendered
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  test('does not display DAK repository count badges (no automatic scanning)', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for authentication and data loading
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify that DAK count badges are NOT displayed (since we removed automatic scanning)
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    
    // Verify that getSmartGuidelinesRepositories is NOT called automatically
    expect(githubService.getSmartGuidelinesRepositories).not.toHaveBeenCalled();
  });

  test('does not show scanning indicator (no automatic scanning)', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for authentication and data loading
    await waitFor(() => {
      expect(screen.getByText('Select Profile or Organization')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check that scanning indicators are NOT shown (since we removed automatic scanning)
    expect(screen.queryByText('Scanning...')).not.toBeInTheDocument();
  });

  test('renders without DAK repository scanning errors', async () => {
    // Mock error in repository fetching (but this should not be called)
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

    // The component should still render without issues (and no scanning should occur)
    expect(screen.getByText('Personal repositories')).toBeInTheDocument();
    expect(screen.getByText('World Health Organization')).toBeInTheDocument();
    
    // Verify that getSmartGuidelinesRepositories is NOT called
    expect(githubService.getSmartGuidelinesRepositories).not.toHaveBeenCalled();
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
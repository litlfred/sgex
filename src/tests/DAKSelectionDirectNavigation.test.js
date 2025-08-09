import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import DAKSelection from '../components/DAKSelection';

// Mock the services
jest.mock('../services/githubService', () => ({
  __esModule: true,
  default: {
    isAuth: () => false, // Not authenticated, will use mock data
    getSmartGuidelinesRepositoriesProgressive: jest.fn(),
  }
}));

jest.mock('../services/repositoryCacheService', () => ({
  __esModule: true,
  default: {
    getCachedRepositories: () => null,
    setCachedRepositories: () => {},
    getCacheInfo: () => ({ exists: false, stale: false })
  }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('DAKSelection Direct Navigation', () => {
  const mockProfile = {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://github.com/testuser.png',
    type: 'user'
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('should navigate directly when clicking repository for edit action', async () => {
    const mockLocationState = {
      profile: mockProfile,
      action: 'edit'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/dak-selection/testuser', state: mockLocationState }]}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Wait for component to load and render repositories
    await waitFor(() => {
      expect(screen.getByText('Select DAK to Edit')).toBeInTheDocument();
    });

    // Wait for repositories to load - in unauthenticated mode, this will use mock data
    // The simulateEnhancedScanning takes time to complete
    await waitFor(() => {
      return screen.queryByText('maternal-health-dak') !== null;
    }, { timeout: 10000 });

    // Find and click on a repository card
    const repoCard = await screen.findByText('maternal-health-dak');
    
    // Click on the repository card
    fireEvent.click(repoCard.closest('.repo-card'));

    // Verify navigation was called with correct parameters after delay
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        state: {
          profile: mockProfile,
          repository: expect.objectContaining({
            name: 'maternal-health-dak'
          }),
          action: 'edit'
        }
      });
    }, { timeout: 1000 });
  });

  test('should NOT navigate directly for fork action', async () => {
    const mockLocationState = {
      profile: mockProfile,
      action: 'fork'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/dak-selection/testuser', state: mockLocationState }]}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Select DAK to Fork')).toBeInTheDocument();
    });

    // Wait for repositories to load - in unauthenticated mode, this will use mock data
    await waitFor(() => {
      return screen.queryByText('maternal-health-dak') !== null;
    }, { timeout: 10000 });

    // Find and click on a repository card
    const repoCard = await screen.findByText('maternal-health-dak');
    
    // Click on the repository card
    fireEvent.click(repoCard.closest('.repo-card'));

    // Wait a bit to ensure no navigation happens
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify navigation was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();

    // Verify continue button is still available
    expect(screen.getByText('Continue to Organization Selection')).toBeInTheDocument();
  });

  test('should show direct selection note for edit action', async () => {
    const mockLocationState = {
      profile: mockProfile,
      action: 'edit'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/dak-selection/testuser', state: mockLocationState }]}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Select DAK to Edit')).toBeInTheDocument();
    });

    // Wait for repositories to load - in unauthenticated mode, this will use mock data
    await waitFor(() => {
      return screen.queryByText('maternal-health-dak') !== null;
    }, { timeout: 10000 });

    // Verify the direct selection note is shown
    expect(screen.getByText('Click on a repository above to start editing its components')).toBeInTheDocument();
    
    // Verify the continue button is NOT shown for edit action
    expect(screen.queryByText('Continue to Edit Components')).not.toBeInTheDocument();
  });

  test('should show continue button for non-edit actions', async () => {
    const mockLocationState = {
      profile: mockProfile,
      action: 'fork'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/dak-selection/testuser', state: mockLocationState }]}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Select DAK to Fork')).toBeInTheDocument();
    });

    // Wait for repositories to load - in unauthenticated mode, this will use mock data
    await waitFor(() => {
      return screen.queryByText('maternal-health-dak') !== null;
    }, { timeout: 10000 });

    // Verify the continue button IS shown for non-edit actions (once repos are loaded)
    await waitFor(() => {
      expect(screen.getByText('Continue to Organization Selection')).toBeInTheDocument();
    });
    
    // Verify the direct selection note is NOT shown
    expect(screen.queryByText('Click on a repository above to start editing its components')).not.toBeInTheDocument();
  });
});
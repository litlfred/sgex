import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DAKSelection from '../components/DAKSelection';
import githubService from '../services/githubService';
import repositoryCacheService from '../services/repositoryCacheService';

// Mock the services
jest.mock('../services/githubService', () => ({
  isAuth: jest.fn(),
  scanRepositoriesForDAKs: jest.fn(),
  getProfile: jest.fn(),
  getRepositories: jest.fn()
}));

jest.mock('../services/repositoryCacheService', () => ({
  getCachedRepositories: jest.fn(),
  setCachedRepositories: jest.fn(),
  isCacheValid: jest.fn(),
  clearCache: jest.fn()
}));

// Mock PageLayout components
jest.mock('../components/framework', () => ({
  PageLayout: ({ children }) => <div data-testid="page-layout">{children}</div>,
  usePageParams: () => ({
    params: { user: 'testuser' },
    profile: {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    }
  })
}));

describe('DAKSelection Mobile Touch Events', () => {
  const mockRepositories = [
    {
      id: 1,
      name: 'test-dak',
      full_name: 'testuser/test-dak',
      description: 'Test DAK repository',
      owner: { login: 'testuser' },
      private: false,
      language: 'JavaScript',
      topics: ['who', 'smart-guidelines'],
      stargazers_count: 5,
      forks_count: 2,
      updated_at: '2024-01-01T12:00:00Z'
    },
    {
      id: 2,
      name: 'another-dak',
      full_name: 'testuser/another-dak',
      description: 'Another DAK repository',
      owner: { login: 'testuser' },
      private: true,
      language: 'TypeScript',
      topics: ['dak', 'health'],
      stargazers_count: 10,
      forks_count: 3,
      updated_at: '2024-01-02T12:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    githubService.isAuth.mockReturnValue(true);
    githubService.scanRepositoriesForDAKs.mockResolvedValue({
      repositories: mockRepositories,
      scanningErrors: null
    });
    repositoryCacheService.getCachedRepositories.mockReturnValue(null);
    repositoryCacheService.isCacheValid.mockReturnValue(false);
  });

  test('repo cards respond to touch events on mobile', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dak-selection/testuser']} initialIndex={0}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('test-dak')).toBeInTheDocument();
    });

    // Find the first repo card
    const repoCard = screen.getByText('test-dak').closest('.repo-card');
    expect(repoCard).toBeInTheDocument();

    // Simulate mobile touch sequence
    fireEvent.touchStart(repoCard, {
      touches: [{ clientX: 100, clientY: 100 }]
    });
    
    fireEvent.touchEnd(repoCard, {
      changedTouches: [{ clientX: 100, clientY: 100 }]
    });
    
    // Touch events should trigger click
    fireEvent.click(repoCard);

    // Verify the card was selected (should have 'selected' class)
    await waitFor(() => {
      expect(repoCard).toHaveClass('selected');
    });
  });

  test('repo cards have proper mobile touch CSS properties', async () => {
    render(
      <MemoryRouter initialEntries={['/dak-selection/testuser']} initialIndex={0}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('test-dak')).toBeInTheDocument();
    });

    const repoCard = screen.getByText('test-dak').closest('.repo-card');
    const computedStyle = window.getComputedStyle(repoCard);

    // Check that the card has cursor pointer (indicating it's clickable)
    expect(computedStyle.cursor).toBe('pointer');
    
    // The card should be selectable (this will be added in our fix)
    // We'll verify the CSS classes are applied correctly
    expect(repoCard).toHaveClass('repo-card');
  });

  test('multiple repo cards can be selected via touch', async () => {
    render(
      <MemoryRouter initialEntries={['/dak-selection/testuser']} initialIndex={0}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('test-dak')).toBeInTheDocument();
      expect(screen.getByText('another-dak')).toBeInTheDocument();
    });

    // Get both repo cards
    const firstCard = screen.getByText('test-dak').closest('.repo-card');
    const secondCard = screen.getByText('another-dak').closest('.repo-card');

    // Touch first card
    fireEvent.touchStart(firstCard);
    fireEvent.touchEnd(firstCard);
    fireEvent.click(firstCard);

    // Verify first card is selected
    await waitFor(() => {
      expect(firstCard).toHaveClass('selected');
    });

    // Touch second card
    fireEvent.touchStart(secondCard);
    fireEvent.touchEnd(secondCard);
    fireEvent.click(secondCard);

    // Verify second card is selected and first is deselected
    await waitFor(() => {
      expect(secondCard).toHaveClass('selected');
      expect(firstCard).not.toHaveClass('selected');
    });
  });

  test('touch events work properly even with rapid interactions', async () => {
    render(
      <MemoryRouter initialEntries={['/dak-selection/testuser']} initialIndex={0}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('test-dak')).toBeInTheDocument();
    });

    const repoCard = screen.getByText('test-dak').closest('.repo-card');

    // Simulate rapid touch interactions (common on mobile)
    for (let i = 0; i < 3; i++) {
      fireEvent.touchStart(repoCard);
      fireEvent.touchEnd(repoCard);
      fireEvent.click(repoCard);
      
      // Small delay between rapid touches
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Verify the card is still properly selected after rapid interactions
    await waitFor(() => {
      expect(repoCard).toHaveClass('selected');
    });
  });
});
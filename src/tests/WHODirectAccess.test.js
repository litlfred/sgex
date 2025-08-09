/**
 * Test script to verify WHO direct access functionality
 * This tests the fixes for allowing direct access to /dak-selection/WorldHealthOrganization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the framework dependencies
jest.mock('../services/githubService');
jest.mock('../services/repositoryCacheService');
jest.mock('../components/framework');

// Mock the route config
global.getSGEXRouteConfig = () => ({
  deployType: 'main',
  dakComponents: {},
  standardComponents: {}
});

// Mock PageProvider to provide WHO profile
const MockPageProvider = ({ children }) => {
  const mockPageContext = {
    pageName: 'dak-selection',
    user: 'WorldHealthOrganization',
    profile: {
      login: 'WorldHealthOrganization',
      name: 'World Health Organization',
      type: 'Organization',
      avatar_url: 'https://avatars.githubusercontent.com/u/9166906?s=200&v=4'
    },
    repository: null,
    branch: null,
    asset: null,
    type: 'user',
    loading: false,
    error: null,
    isAuthenticated: false,
    navigate: jest.fn(),
    params: { user: 'WorldHealthOrganization' },
    location: { pathname: '/dak-selection/WorldHealthOrganization' }
  };

  return React.createElement('div', {}, children);
};

jest.mock('../components/framework', () => ({
  PageLayout: ({ children }) => React.createElement('div', { className: 'page-layout' }, children),
  usePageParams: () => ({
    params: { user: 'WorldHealthOrganization' },
    profile: {
      login: 'WorldHealthOrganization',
      name: 'World Health Organization',
      type: 'Organization',
      avatar_url: 'https://avatars.githubusercontent.com/u/9166906?s=200&v=4'
    }
  })
}));

import DAKSelection from '../components/DAKSelection';

describe('WHO Direct Access Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock GitHub service as unauthenticated
    const githubService = require('../services/githubService').default;
    githubService.isAuth.mockReturnValue(false);
    githubService.getSmartGuidelinesRepositoriesProgressive.mockResolvedValue({
      repositories: [],
      scanningErrors: {
        totalErrors: 50,
        totalScanned: 50,
        rateLimitedCount: 45,
        networkErrorCount: 5,
        hasRetryableErrors: true
      }
    });
  });

  test('should allow direct access to WHO organization page', async () => {
    render(
      <MemoryRouter initialEntries={['/dak-selection/WorldHealthOrganization']}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Should not immediately redirect away
    expect(screen.queryByText('Redirecting...')).not.toBeInTheDocument();
  });

  test('should show WHO authentication notice when not authenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/dak-selection/WorldHealthOrganization']}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Should show the WHO authentication notice
    expect(screen.getByText(/Authentication Required for WHO Organization/)).toBeInTheDocument();
    expect(screen.getByText(/smart-immunizations/)).toBeInTheDocument();
    expect(screen.getByText(/smart-trust/)).toBeInTheDocument();
  });

  test('should default to edit action for WHO organization', async () => {
    render(
      <MemoryRouter initialEntries={['/dak-selection/WorldHealthOrganization']}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Should show edit action configuration
    expect(screen.getByText(/Select DAK to Edit/)).toBeInTheDocument();
  });
});
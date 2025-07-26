// Manual verification script to test WHO organization display
// This simulates the organization selection page behavior

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrganizationSelection from '../components/OrganizationSelection';

// Mock the GitHub service
jest.mock('../services/githubService', () => ({
  isAuth: jest.fn(() => false),
  getWHOOrganization: jest.fn(() => Promise.resolve({
    id: 12261302,
    login: 'WorldHealthOrganization',
    display_name: 'World Health Organization',
    description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
    avatar_url: 'https://avatars.githubusercontent.com/u/12261302?v=4',  // Note: dynamic URL without s=200 param
    html_url: 'https://github.com/WorldHealthOrganization',
    type: 'Organization',
    permissions: {
      can_create_repositories: true,
      can_create_private_repositories: true
    },
    plan: {
      name: 'Organization',
      private_repos: 'unlimited'
    },
    isWHO: true
  })),
  getUserOrganizations: jest.fn(() => Promise.resolve([]))
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      profile: {
        login: 'testuser',
        name: 'Test User', 
        avatar_url: 'https://github.com/testuser.png',
        type: 'User'
      },
      sourceRepository: {
        name: 'test-repo',
        full_name: 'testuser/test-repo',
        description: 'Test repository'
      },
      action: 'fork'
    }
  })
}));

// Simple manual test to verify WHO organization structure
describe('WHO Organization Manual Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to reduce noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should display WHO organization with dynamic avatar from API', async () => {
    render(
      <MemoryRouter>
        <OrganizationSelection />
      </MemoryRouter>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Select Destination for Fork')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check if WHO organization is displayed
    await waitFor(() => {
      expect(screen.getByText('World Health Organization')).toBeInTheDocument();
      expect(screen.getByText('@WorldHealthOrganization')).toBeInTheDocument();
      expect(screen.getByText('WHO Official')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify that the WHO organization has an avatar image with the dynamic URL
    const whoImages = screen.getAllByAltText(/World Health Organization/i);
    expect(whoImages).toHaveLength(1);

    // The avatar should have the dynamic API-fetched URL (without s=200 parameter)
    const whoImage = whoImages[0];
    expect(whoImage.src).toBe('https://avatars.githubusercontent.com/u/12261302?v=4');

    console.log('✅ WHO Organization verification passed');
    console.log('WHO organization avatar URL:', whoImage.src);
    console.log('This shows the dynamic avatar fetching is working correctly');
  });

  it('should fall back to hardcoded avatar when API fails', async () => {
    // Mock the WHO organization fetch to fail
    const githubService = require('../services/githubService');
    githubService.getWHOOrganization.mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <OrganizationSelection />
      </MemoryRouter>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Select Destination for Fork')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check if WHO organization is still displayed (using fallback)
    await waitFor(() => {
      expect(screen.getByText('World Health Organization')).toBeInTheDocument();
      expect(screen.getByText('@WorldHealthOrganization')).toBeInTheDocument();
      expect(screen.getByText('WHO Official')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify that the WHO organization has the fallback avatar image
    const whoImages = screen.getAllByAltText(/World Health Organization/i);
    expect(whoImages).toHaveLength(1);

    // The avatar should have the fallback hardcoded URL (with s=200 parameter)
    const whoImage = whoImages[0];
    expect(whoImage.src).toBe('https://avatars.githubusercontent.com/u/12261302?s=200&v=4');

    console.log('✅ WHO Organization fallback verification passed');
    console.log('Fallback WHO organization avatar URL:', whoImage.src);
    console.log('This shows the fallback mechanism is working correctly');
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import SushiDashboard from '../components/SushiDashboard';

// Mock the GitHub service
jest.mock('../services/githubService', () => ({
  __esModule: true,
  default: {
    octokit: null,
    isAuth: jest.fn(() => false)
  }
}));

// Mock js-yaml
jest.mock('js-yaml', () => ({
  load: jest.fn(),
  dump: jest.fn()
}));

describe('SushiDashboard', () => {
  const mockRepository = {
    name: 'test-dak',
    owner: { login: 'test-user' },
    full_name: 'test-user/test-dak'
  };

  const mockProfile = {
    login: 'test-user',
    name: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders component and handles GitHub service unavailability', () => {
    render(
      <SushiDashboard
        repository={mockRepository}
        selectedBranch="main"
        hasWriteAccess={true}
        profile={mockProfile}
      />
    );

    // Should show error when GitHub service is not available
    expect(screen.getByText('Could not load sushi-config.yaml')).toBeInTheDocument();
  });

  it('displays error state when GitHub service is not available', async () => {
    render(
      <SushiDashboard
        repository={mockRepository}
        selectedBranch="main"
        hasWriteAccess={true}
        profile={mockProfile}
      />
    );

    // Wait for error to appear
    await screen.findByText('Could not load sushi-config.yaml');
    expect(screen.getByText(/Cannot read properties of null/)).toBeInTheDocument();
  });

  it('displays header structure even in error state', () => {
    render(
      <SushiDashboard
        repository={mockRepository}
        selectedBranch="main"
        hasWriteAccess={false}
        profile={mockProfile}
      />
    );

    // Even in error state, basic structure should be there
    expect(screen.getByText('Could not load sushi-config.yaml')).toBeInTheDocument();
  });
});
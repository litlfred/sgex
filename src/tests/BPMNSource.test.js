import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BPMNSource from '../components/BPMNSource';
import githubService from '../services/githubService';

// Mock the githubService
jest.mock('../services/githubService');

// Mock ContextualHelpMascot to avoid complex dependencies
jest.mock('../components/ContextualHelpMascot', () => {
  return function MockContextualHelpMascot() {
    return <div data-testid="contextual-help-mascot">Mock Mascot</div>;
  };
});

describe('BPMNSource GitHub URL Generation', () => {
  const mockProfile = {
    login: 'testuser',
    avatar_url: 'https://github.com/testuser.png',
    name: 'Test User'
  };

  const mockRepository = {
    name: 'smart-immunizations',
    full_name: 'WorldHealthOrganization/smart-immunizations',
    owner: { login: 'WorldHealthOrganization' }
  };

  const mockSelectedFile = {
    name: 'IMMZ.D.Administer Vaccine.bpmn',
    path: 'input/business-processes/IMMZ.D.Administer%20Vaccine.bpmn',
    size: 5120
  };

  beforeEach(() => {
    // Mock githubService methods
    githubService.getFileContent.mockResolvedValue('<xml>mock bpmn content</xml>');
    githubService.isAuth.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('generates GitHub URLs with main branch when no selectedBranch', async () => {
    const locationState = {
      profile: mockProfile,
      repository: mockRepository,
      selectedFile: mockSelectedFile,
      selectedBranch: null // No branch selected, should default to main
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/bpmn-source', state: locationState }]}>
        <BPMNSource />
      </MemoryRouter>
    );

    // Wait for the component to load
    await screen.findByText('BPMN Source Code');

    // Find the "View on GitHub" link
    const viewOnGitHubLink = screen.getByText('👁️ View on GitHub').closest('a');
    expect(viewOnGitHubLink).toHaveAttribute(
      'href',
      'https://github.com/WorldHealthOrganization/smart-immunizations/blob/main/input/business-processes/IMMZ.D.Administer%20Vaccine.bpmn'
    );
  });

  test('generates GitHub URLs with selected branch when selectedBranch is provided', async () => {
    const locationState = {
      profile: mockProfile,
      repository: mockRepository,
      selectedFile: mockSelectedFile,
      selectedBranch: 'dak-extract' // Custom branch selected
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/bpmn-source', state: locationState }]}>
        <BPMNSource />
      </MemoryRouter>
    );

    // Wait for the component to load
    await screen.findByText('BPMN Source Code');

    // Find the "View on GitHub" link
    const viewOnGitHubLink = screen.getByText('👁️ View on GitHub').closest('a');
    expect(viewOnGitHubLink).toHaveAttribute(
      'href',
      'https://github.com/WorldHealthOrganization/smart-immunizations/blob/dak-extract/input/business-processes/IMMZ.D.Administer%20Vaccine.bpmn'
    );
  });

  test('generates GitHub edit URLs with selected branch when user has write access', async () => {
    const locationState = {
      profile: { ...mockProfile, token: 'fake-token' },
      repository: { ...mockRepository, permissions: { push: true } },
      selectedFile: mockSelectedFile,
      selectedBranch: 'dak-extract'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/bpmn-source', state: locationState }]}>
        <BPMNSource />
      </MemoryRouter>
    );

    // Wait for the component to load
    await screen.findByText('BPMN Source Code');

    // Find the "Edit on GitHub" link (should appear when user has write access)
    const editOnGitHubLink = screen.getByText('✏️ Edit on GitHub').closest('a');
    expect(editOnGitHubLink).toHaveAttribute(
      'href',
      'https://github.com/WorldHealthOrganization/smart-immunizations/edit/dak-extract/input/business-processes/IMMZ.D.Administer%20Vaccine.bpmn'
    );
  });

  test('handles repository with different owner format', async () => {
    const repositoryWithDifferentFormat = {
      name: 'smart-immunizations',
      full_name: 'WorldHealthOrganization/smart-immunizations',
      // owner property missing, should fall back to parsing full_name
    };

    const locationState = {
      profile: mockProfile,
      repository: repositoryWithDifferentFormat,
      selectedFile: mockSelectedFile,
      selectedBranch: 'feature-branch'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/bpmn-source', state: locationState }]}>
        <BPMNSource />
      </MemoryRouter>
    );

    // Wait for the component to load
    await screen.findByText('BPMN Source Code');

    // Find the "View on GitHub" link
    const viewOnGitHubLink = screen.getByText('👁️ View on GitHub').closest('a');
    expect(viewOnGitHubLink).toHaveAttribute(
      'href',
      'https://github.com/WorldHealthOrganization/smart-immunizations/blob/feature-branch/input/business-processes/IMMZ.D.Administer%20Vaccine.bpmn'
    );
  });

  test('handles branches with special characters by URL encoding them', async () => {
    const locationState = {
      profile: {
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
        name: 'Test User',
        token: 'mock-token' // Add token to simulate authentication
      },
      repository: {
        name: 'smart-immunizations',
        full_name: 'WorldHealthOrganization/smart-immunizations',
        owner: { login: 'WorldHealthOrganization' },
        permissions: { push: true } // Add write permissions
      },
      selectedFile: {
        name: 'IMMZ.D.Administer Vaccine.bpmn',
        path: 'input/business-processes/IMMZ.D.Administer%20Vaccine.bpmn',
        size: 5120
      },
      selectedBranch: 'feature/new-dak-component'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/bpmn-source', state: locationState }]}>
        <BPMNSource />
      </MemoryRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('IMMZ.D.Administer Vaccine.bpmn')).toBeInTheDocument();
    });

    // Find the "View on GitHub" link and check it uses URL-encoded branch name
    const viewOnGitHubLink = screen.getByText('👁️ View on GitHub').closest('a');
    expect(viewOnGitHubLink).toHaveAttribute(
      'href',
      'https://github.com/WorldHealthOrganization/smart-immunizations/blob/feature%2Fnew-dak-component/input/business-processes/IMMZ.D.Administer%20Vaccine.bpmn'
    );

    // Find the "Edit on GitHub" link and check it also uses URL-encoded branch name
    const editOnGitHubLink = screen.getByText('✏️ Edit on GitHub').closest('a');
    expect(editOnGitHubLink).toHaveAttribute(
      'href',
      'https://github.com/WorldHealthOrganization/smart-immunizations/edit/feature%2Fnew-dak-component/input/business-processes/IMMZ.D.Administer%20Vaccine.bpmn'
    );
  });
});
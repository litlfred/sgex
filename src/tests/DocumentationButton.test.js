import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import DAKSelection from '../components/DAKSelection';
import DAKActionSelection from '../components/DAKActionSelection';
import OrganizationSelection from '../components/OrganizationSelection';
import DAKDashboard from '../components/DAKDashboard';
import BPMNViewerEnhanced from '../components/BPMNViewerEnhanced';
import BusinessProcessSelection from '../components/BusinessProcessSelection';

// Mock the GitHub service to avoid authentication issues in tests
jest.mock('../services/githubService', () => ({
  isAuth: () => false,
  authenticate: () => false,
  getCurrentUser: () => Promise.resolve(null),
  getUserOrganizations: () => Promise.resolve([]),
  checkTokenPermissions: () => Promise.resolve(true),
  checkRepositoryWritePermissions: () => Promise.resolve(false),
}));

// Mock BPMN-js to avoid import issues in tests
jest.mock('bpmn-js/lib/NavigatedViewer', () => {
  return jest.fn().mockImplementation(() => ({
    importXML: jest.fn().mockResolvedValue(),
    get: jest.fn().mockReturnValue({
      zoom: jest.fn().mockReturnValue(1),
      on: jest.fn()
    }),
    destroy: jest.fn()
  }));
});

describe('Documentation Button Consistency', () => {
  test('LandingPage has documentation button when not authenticated', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    const docButton = screen.getByText('📖 Documentation');
    expect(docButton).toBeInTheDocument();
    expect(docButton.closest('a')).toHaveAttribute('href', '/sgex/docs/overview');
  });

  test('DAKActionSelection has documentation button', () => {
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/dak-action', state: { profile: mockProfile } }]}>
        <DAKActionSelection />
      </MemoryRouter>
    );
    
    const docButton = screen.getByText('📖 Documentation');
    expect(docButton).toBeInTheDocument();
    expect(docButton.closest('a')).toHaveAttribute('href', '/sgex/docs/overview');
  });

  test('DAKSelection has documentation button', () => {
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/dak-selection/testuser', state: { profile: mockProfile, action: 'edit' } }]}>
        <DAKSelection />
      </MemoryRouter>
    );
    
    const docButton = screen.getByText('📖 Documentation');
    expect(docButton).toBeInTheDocument();
    expect(docButton.closest('a')).toHaveAttribute('href', '/sgex/docs/overview');
  });

  test('DAKSelection does not have "Learn more about" message', () => {
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/dak-selection/testuser', state: { profile: mockProfile, action: 'edit' } }]}>
        <DAKSelection />
      </MemoryRouter>
    );
    
    // Verify the "Learn more about" text is not present
    expect(screen.queryByText(/Learn more about/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DAK Components/)).not.toBeInTheDocument();
  });

  test('OrganizationSelection has documentation button', () => {
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };
    const mockRepository = {
      name: 'test-repo',
      full_name: 'testuser/test-repo'
    };

    render(
      <MemoryRouter initialEntries={[{ 
        pathname: '/organization-selection', 
        state: { profile: mockProfile, sourceRepository: mockRepository, action: 'fork' } 
      }]}>
        <OrganizationSelection />
      </MemoryRouter>
    );
    
    const docButton = screen.getByText('📖 Documentation');
    expect(docButton).toBeInTheDocument();
    expect(docButton.closest('a')).toHaveAttribute('href', '/sgex/docs/overview');
  });

  test('DAKDashboard has documentation button', () => {
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };
    const mockRepository = {
      name: 'test-repo',
      full_name: 'testuser/test-repo',
      owner: { login: 'testuser' }
    };

    render(
      <MemoryRouter initialEntries={[{ 
        pathname: '/dashboard', 
        state: { profile: mockProfile, repository: mockRepository } 
      }]}>
        <DAKDashboard />
      </MemoryRouter>
    );
    
    const docButton = screen.getByText('📖 Documentation');
    expect(docButton).toBeInTheDocument();
    expect(docButton.closest('a')).toHaveAttribute('href', '/sgex/docs/overview');
  });

  test('BPMNViewerEnhanced has documentation button', () => {
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };
    const mockRepository = {
      name: 'test-repo',
      full_name: 'testuser/test-repo',
      owner: { login: 'testuser' }
    };
    const mockSelectedFile = {
      name: 'test-process.bpmn',
      path: 'input/business-processes/test-process.bpmn',
      size: 2048,
      download_url: 'https://github.com/testuser/test-repo/raw/main/input/business-processes/test-process.bpmn'
    };

    render(
      <MemoryRouter initialEntries={[{ 
        pathname: '/bpmn-viewer', 
        state: { 
          profile: mockProfile, 
          repository: mockRepository,
          selectedFile: mockSelectedFile,
          selectedBranch: 'main',
          mode: 'view'
        } 
      }]}>
        <BPMNViewerEnhanced />
      </MemoryRouter>
    );
    
    const docButton = screen.getByText('📖 Documentation');
    expect(docButton).toBeInTheDocument();
    expect(docButton.closest('a')).toHaveAttribute('href', '/sgex/docs/overview');
  });

  test('BusinessProcessSelection has documentation button', () => {
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };
    const mockRepository = {
      name: 'test-repo',
      full_name: 'testuser/test-repo',
      owner: { login: 'testuser' }
    };

    render(
      <MemoryRouter initialEntries={[{ 
        pathname: '/business-process-selection', 
        state: { 
          profile: mockProfile, 
          repository: mockRepository,
          selectedBranch: 'main'
        } 
      }]}>
        <BusinessProcessSelection />
      </MemoryRouter>
    );
    
    const docButton = screen.getByText('📖 Documentation');
    expect(docButton).toBeInTheDocument();
    expect(docButton.closest('a')).toHaveAttribute('href', '/sgex/docs/overview');
  });
});
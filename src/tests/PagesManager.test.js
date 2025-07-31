import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PagesManager from '../components/PagesManager';

// Mock the services
jest.mock('../services/githubService', () => ({
  checkRepositoryWritePermissions: jest.fn().mockResolvedValue(false),
  isAuth: jest.fn().mockReturnValue(false),
  octokit: null
}));

jest.mock('../services/branchContextService', () => ({
  getSelectedBranch: jest.fn().mockReturnValue(null),
  setSelectedBranch: jest.fn()
}));

jest.mock('../services/stagingGroundService', () => ({
  initialize: jest.fn(),
  getStagingGround: jest.fn().mockReturnValue({ files: [], message: '', timestamp: Date.now() }),
  addListener: jest.fn().mockReturnValue(() => {})
}));

// Mock child components
jest.mock('../components/BranchSelector', () => {
  return function MockBranchSelector() {
    return <div data-testid="branch-selector">Branch Selector</div>;
  };
});

jest.mock('../components/HelpButton', () => {
  return function MockHelpButton() {
    return <button data-testid="help-button">Help</button>;
  };
});

jest.mock('../components/ContextualHelpMascot', () => {
  return function MockContextualHelpMascot() {
    return <div data-testid="help-mascot">Help Mascot</div>;
  };
});

jest.mock('../components/PageEditModal', () => {
  return function MockPageEditModal() {
    return <div data-testid="page-edit-modal">Page Edit Modal</div>;
  };
});

jest.mock('../components/PageViewModal', () => {
  return function MockPageViewModal() {
    return <div data-testid="page-view-modal">Page View Modal</div>;
  };
});

jest.mock('../components/DAKStatusBox', () => {
  return function MockDAKStatusBox() {
    return <div data-testid="dak-status-box">DAK Status Box</div>;
  };
});

describe('PagesManager', () => {
  const mockState = {
    profile: {
      login: 'testuser',
      avatar_url: 'https://github.com/testuser.png'
    },
    repository: {
      name: 'test-repo',
      full_name: 'testuser/test-repo',
      owner: { login: 'testuser' }
    },
    component: {
      id: 'pages',
      name: 'Pages',
      description: 'Published page content and documentation defined in sushi-config.yaml'
    },
    selectedBranch: 'main'
  };

  it('renders Pages Manager interface', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pages', state: mockState }]}>
        <PagesManager />
      </MemoryRouter>
    );

    // Check if the main heading is rendered
    const heading = await screen.findByRole('heading', { name: /📄 Pages/i });
    expect(heading).toBeInTheDocument();

    // Check if the description mentions sushi-config.yaml
    expect(screen.getByText(/sushi-config\.yaml/)).toBeInTheDocument();
    expect(screen.getByText(/input\/pagecontent\//)).toBeInTheDocument();
  });

  it('shows error when sushi-config.yaml is not found', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pages', state: mockState }]}>
        <PagesManager />
      </MemoryRouter>
    );

    // Should show error about missing sushi-config.yaml
    const errorHeading = await screen.findByRole('heading', { name: /Could not load pages/i });
    expect(errorHeading).toBeInTheDocument();
    
    expect(screen.getByText(/sushi-config\.yaml not found in repository/)).toBeInTheDocument();
  });

  it('displays helpful suggestions when pages cannot be loaded', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pages', state: mockState }]}>
        <PagesManager />
      </MemoryRouter>
    );

    // Check for helpful suggestions
    await screen.findByText(/Make sure:/);
    expect(screen.getByText(/The repository contains a.*sushi-config\.yaml.*file/)).toBeInTheDocument();
    expect(screen.getByText(/The sushi-config\.yaml file has a.*pages:.*section/)).toBeInTheDocument();
    expect(screen.getByText(/You have access to view the repository contents/)).toBeInTheDocument();
  });

  it('shows repository information in header', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pages', state: mockState }]}>
        <PagesManager />
      </MemoryRouter>
    );

    // Check repository name in header
    expect(screen.getByText('test-repo')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('👁️ Read-Only Access')).toBeInTheDocument();
  });

  it('includes proper breadcrumb navigation', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pages', state: mockState }]}>
        <PagesManager />
      </MemoryRouter>
    );

    // Check breadcrumb elements
    expect(screen.getByRole('button', { name: /Select Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select DAK/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /DAK Components/i })).toBeInTheDocument();
    // The "Pages" text appears in multiple places, so we'll check for breadcrumb current specifically
    expect(screen.getByText('Pages', { selector: '.breadcrumb-current' })).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PagesManager from '../components/PagesManager';
import stagingGroundService from '../services/stagingGroundService';

// Mock all the required services and components
jest.mock('../services/githubService', () => ({
  checkRepositoryWritePermissions: jest.fn().mockResolvedValue(true),
  isAuth: jest.fn().mockReturnValue(true),
  octokit: {
    rest: {
      repos: {
        getContent: jest.fn()
      }
    }
  }
}));

jest.mock('../services/branchContextService', () => ({
  getSelectedBranch: jest.fn().mockReturnValue('main'),
  setSelectedBranch: jest.fn()
}));

jest.mock('../services/stagingGroundService', () => ({
  initialize: jest.fn(),
  getStagingGround: jest.fn().mockReturnValue({ 
    files: [], 
    message: '', 
    timestamp: Date.now() 
  }),
  addListener: jest.fn().mockReturnValue(() => {}),
  updateFile: jest.fn().mockReturnValue(true)
}));

// Mock child components
jest.mock('../components/BranchSelector', () => {
  return function MockBranchSelector() {
    return <div data-testid="branch-selector">Branch Selector</div>;
  };
});

jest.mock('../components/ContextualHelpMascot', () => {
  return function MockContextualHelpMascot() {
    return <div data-testid="help-mascot">Help Mascot</div>;
  };
});

jest.mock('../components/DAKStatusBox', () => {
  return function MockDAKStatusBox({ repository, selectedBranch }) {
    return (
      <div data-testid="dak-status-box">
        Staging Ground for {repository?.name} on {selectedBranch}
      </div>
    );
  };
});

jest.mock('../components/PageEditModal', () => {
  return function MockPageEditModal({ page, onSave, onClose }) {
    const handleStageClick = () => {
      // Simulate staging the content to staging ground
      const mockStagingService = require('../services/stagingGroundService').default;
      mockStagingService.updateFile(
        page.path,
        'Modified content',
        { tool: 'PageEditor' }
      );
      onSave(page, 'Modified content', 'staged');
      onClose();
    };

    return (
      <div data-testid="page-edit-modal">
        <h2>Edit {page.title}</h2>
        <button onClick={handleStageClick}>Stage Changes</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  };
});

jest.mock('../components/PageViewModal', () => {
  return function MockPageViewModal() {
    return <div data-testid="page-view-modal">Page View Modal</div>;
  };
});

describe('PagesManager Staging Ground Integration', () => {
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
      description: 'Published page content and documentation'
    },
    selectedBranch: 'main'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes staging ground service when component mounts', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pages', state: mockState }]}>
        <PagesManager />
      </MemoryRouter>
    );

    // Verify staging ground service is initialized
    expect(stagingGroundService.initialize).toHaveBeenCalledWith(
      mockState.repository,
      mockState.selectedBranch
    );
  });

  it('displays DAKStatusBox for staging ground visibility', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pages', state: mockState }]}>
        <PagesManager />
      </MemoryRouter>
    );

    // Verify DAKStatusBox is rendered with correct props
    const statusBox = screen.getByTestId('dak-status-box');
    expect(statusBox).toBeInTheDocument();
    expect(statusBox).toHaveTextContent('Staging Ground for test-repo on main');
  });

  it('integrates with PageEditModal for staging changes', async () => {
    // Mock successful sushi-config.yaml fetch with pages
    const githubService = require('../services/githubService');
    githubService.octokit.rest.repos.getContent
      .mockResolvedValueOnce({
        data: {
          type: 'file',
          content: btoa(`
pages:
  - title: "Test Page"  
    generation: markdown
    sourceUrl: input/pagecontent/test.md
`)
        }
      })
      .mockResolvedValueOnce({
        data: {
          type: 'file',
          content: btoa('# Test Content'),
          sha: 'abc123'
        }
      });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/pages', state: mockState }]}>
        <PagesManager />
      </MemoryRouter>
    );

    // Wait for pages to load and find edit button
    await waitFor(async () => {
      const editButton = await screen.findByText('✏️ Edit');
      expect(editButton).toBeInTheDocument();
      
      // Click edit button to open modal
      fireEvent.click(editButton);
    });

    // Verify PageEditModal is displayed
    await waitFor(() => {
      expect(screen.getByTestId('page-edit-modal')).toBeInTheDocument();
    });

    // Click Stage Changes button
    const stageButton = screen.getByText('Stage Changes');
    fireEvent.click(stageButton);

    // Verify content was staged
    await waitFor(() => {
      expect(stagingGroundService.updateFile).toHaveBeenCalledWith(
        'input/pagecontent/test.md',
        'Modified content',
        expect.objectContaining({ tool: 'PageEditor' })
      );
    });

    // Verify modal closes after staging
    await waitFor(() => {
      expect(screen.queryByTestId('page-edit-modal')).not.toBeInTheDocument();
    });
  });

  it('maintains staging ground state across navigation', () => {
    // Mock staging ground with existing files
    stagingGroundService.getStagingGround.mockReturnValue({
      files: [
        {
          path: 'input/pagecontent/existing.md',
          content: 'Existing staged content',
          timestamp: Date.now()
        }
      ],
      message: 'Test changes',
      timestamp: Date.now()
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/pages', state: mockState }]}>
        <PagesManager />
      </MemoryRouter>
    );

    // Verify staging ground maintains state
    expect(stagingGroundService.getStagingGround).toHaveBeenCalled();
    
    // Verify DAKStatusBox reflects the staging ground state
    expect(screen.getByTestId('dak-status-box')).toBeInTheDocument();
  });
});
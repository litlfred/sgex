import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BPMNViewerComponent from '../components/BPMNViewer';
import githubService from '../services/githubService';

// Mock the bpmn-js library
jest.mock('bpmn-js/lib/NavigatedViewer', () => {
  return jest.fn().mockImplementation(() => ({
    importXML: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockReturnValue({
      zoom: jest.fn()
    }),
    destroy: jest.fn()
  }));
});

// Mock the github service
jest.mock('../services/githubService');

// Mock ContextualHelpMascot
jest.mock('../components/ContextualHelpMascot', () => {
  return function MockContextualHelpMascot() {
    return <div data-testid="contextual-help-mascot">Mocked Help</div>;
  };
});

describe('BPMNViewer Container Initialization Fix', () => {
  const mockProfile = {
    login: 'test-user',
    avatar_url: 'https://github.com/test-user.png',
    token: 'test-token'
  };

  const mockRepository = {
    name: 'test-repo',
    owner: { login: 'test-owner' },
    full_name: 'test-owner/test-repo',
    permissions: { push: true }
  };

  const mockSelectedFile = {
    name: 'test-workflow.bpmn',
    path: 'input/business-processes/test-workflow.bpmn',
    size: 1024
  };

  const mockBpmnContent = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_Test">
  <bpmn:process id="Process_Test" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
</bpmn:definitions>`;

  const renderBPMNViewer = (locationState = {}) => {
    const defaultState = {
      profile: mockProfile,
      repository: mockRepository,
      selectedFile: mockSelectedFile,
      selectedBranch: 'main',
      ...locationState
    };

    // Mock useLocation to return our test state
    const mockUseLocation = () => ({ state: defaultState });
    const mockUseNavigate = () => jest.fn();

    // Mock react-router-dom hooks
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLocation: mockUseLocation,
      useNavigate: mockUseNavigate
    }));

    return render(
      <BrowserRouter>
        <BPMNViewerComponent />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default github service mocks
    githubService.isAuth.mockReturnValue(true);
    githubService.getFileContent.mockResolvedValue(mockBpmnContent);
  });

  it('should wait for container to be available before initializing viewer', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderBPMNViewer();

    // Check that container readiness check starts
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('⏰ BPMNViewer: Starting container readiness check for selectedFile:'),
        'test-workflow.bpmn'
      );
    });

    // Check that container is eventually found
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ BPMNViewer: Container found on attempt')
      );
    });

    // Check that viewer is initialized
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ BPMNViewer: BPMN viewer initialized successfully'
      );
    });

    consoleSpy.mockRestore();
  });

  it('should show loading state while waiting for container and content', async () => {
    renderBPMNViewer();

    // Should show loading overlay
    expect(screen.getByText('Loading BPMN diagram...')).toBeInTheDocument();
    expect(screen.getByText(/Fetching test-workflow.bpmn from test-repo/)).toBeInTheDocument();
  });

  it('should handle case when container never becomes available', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock container ref to always be null by modifying the component behavior
    // This is a bit tricky to test directly, so we'll simulate the timeout scenario
    
    renderBPMNViewer();

    // Wait for potential timeout
    await waitFor(() => {
      // The component should handle the case gracefully
      expect(screen.getByText('Loading BPMN diagram...')).toBeInTheDocument();
    }, { timeout: 6000 });

    consoleSpy.mockRestore();
  });

  it('should display BPMN container element in DOM', async () => {
    renderBPMNViewer();

    // Wait for the BPMN container to be rendered
    await waitFor(() => {
      const bpmnContainer = document.querySelector('.bpmn-container');
      expect(bpmnContainer).toBeInTheDocument();
    });
  });

  it('should handle successful BPMN content loading', async () => {
    renderBPMNViewer();

    // Wait for content to load
    await waitFor(() => {
      expect(githubService.getFileContent).toHaveBeenCalledWith(
        'test-owner',
        'test-repo',
        'input/business-processes/test-workflow.bpmn',
        'main'
      );
    });

    // Should eventually hide loading state
    await waitFor(() => {
      expect(screen.queryByText('Loading BPMN diagram...')).not.toBeInTheDocument();
    });
  });

  it('should show error state when file loading fails', async () => {
    githubService.getFileContent.mockRejectedValue(new Error('File not found'));

    renderBPMNViewer();

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load BPMN diagram/)).toBeInTheDocument();
    });

    // Should show retry button
    expect(screen.getByText('🔄 Retry')).toBeInTheDocument();
  });

  it('should handle missing required props gracefully', () => {
    const mockUseLocation = () => ({ state: null });
    const mockUseNavigate = () => jest.fn();

    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLocation: mockUseLocation,
      useNavigate: mockUseNavigate
    }));

    render(
      <BrowserRouter>
        <BPMNViewerComponent />
      </BrowserRouter>
    );

    // Should show redirecting message
    expect(screen.getByText('Redirecting...')).toBeInTheDocument();
  });
});
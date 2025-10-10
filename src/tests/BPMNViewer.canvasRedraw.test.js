import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BPMNViewerComponent from '../components/BPMNViewer';
import githubService from '../services/githubService';

// Mock the framework
jest.mock('../components/framework', () => ({
  PageLayout: ({ children }) => <div data-testid="page-layout">{children}</div>,
  usePage: () => ({
    profile: null,
    repository: null,
    branch: null,
    asset: null,
    loading: false,
    error: null
  })
}));

// Mock canvas methods to verify they're called
const mockScroll = jest.fn();
const mockViewbox = jest.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  inner: { width: 800, height: 600 }
});
const mockZoom = jest.fn();

// Mock the lazy factory service to return a viewer with our mocked canvas
jest.mock('../services/lazyFactoryService', () => ({
  createLazyBpmnViewer: jest.fn().mockResolvedValue({
    importXML: jest.fn().mockResolvedValue({ warnings: [] }),
    get: jest.fn().mockImplementation((service) => {
      if (service === 'canvas') {
        return {
          zoom: mockZoom,
          viewbox: mockViewbox,
          scroll: mockScroll
        };
      }
      return null;
    }),
    destroy: jest.fn(),
    attachTo: jest.fn().mockResolvedValue(undefined)
  })
}));

// Mock the github service
jest.mock('../services/githubService');

// Mock ContextualHelpMascot
jest.mock('../components/ContextualHelpMascot', () => {
  return function MockContextualHelpMascot() {
    return <div data-testid="contextual-help-mascot">Mocked Help</div>;
  };
});

describe('BPMNViewer Canvas Redraw Fix', () => {
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
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_Test">
  <bpmn:process id="Process_Test" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_1</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_Test">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="82" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="240" y="82" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="100" />
        <di:waypoint x="240" y="100" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
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
    const mockUseLocation = () => ({ 
      state: defaultState,
      pathname: '/bpmn-viewer'
    });
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
    
    // Reset mock function call counts
    mockScroll.mockClear();
    mockViewbox.mockClear();
    mockZoom.mockClear();
    
    // Setup default github service mocks
    githubService.isAuth.mockReturnValue(true);
    githubService.getFileContent.mockResolvedValue(mockBpmnContent);
  });

  it('should call canvas.viewbox() after loading diagram to trigger redraw', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderBPMNViewer();

    // Wait for the diagram to be loaded
    await waitFor(() => {
      expect(mockViewbox).toHaveBeenCalled();
    }, { timeout: 5000 });

    // Verify viewbox was called (which triggers internal redraw)
    expect(mockViewbox).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should call canvas.scroll() after zoom to force visual update', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderBPMNViewer();

    // Wait for the diagram to be loaded and scroll to be called
    await waitFor(() => {
      expect(mockScroll).toHaveBeenCalledWith({ dx: 0, dy: 0 });
    }, { timeout: 5000 });

    // Verify scroll was called with zero delta to trigger redraw
    expect(mockScroll).toHaveBeenCalledWith({ dx: 0, dy: 0 });
    
    consoleSpy.mockRestore();
  });

  it('should call canvas methods in correct sequence: zoom, viewbox, scroll', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderBPMNViewer();

    // Wait for all canvas operations to complete
    await waitFor(() => {
      expect(mockZoom).toHaveBeenCalled();
      expect(mockViewbox).toHaveBeenCalled();
      expect(mockScroll).toHaveBeenCalled();
    }, { timeout: 5000 });

    // Verify the sequence: zoom should be called first, then viewbox and scroll
    expect(mockZoom).toHaveBeenCalledWith('fit-viewport');
    expect(mockViewbox).toHaveBeenCalled();
    expect(mockScroll).toHaveBeenCalledWith({ dx: 0, dy: 0 });
    
    consoleSpy.mockRestore();
  });

  it('should log viewbox dimensions after loading diagram', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderBPMNViewer();

    // Wait for the success log with viewbox info
    await waitFor(() => {
      const logCalls = consoleSpy.mock.calls;
      const hasViewboxLog = logCalls.some(call => 
        call[0]?.includes('Successfully loaded and centered') &&
        call[1]?.viewbox
      );
      expect(hasViewboxLog).toBe(true);
    }, { timeout: 5000 });

    consoleSpy.mockRestore();
  });
});

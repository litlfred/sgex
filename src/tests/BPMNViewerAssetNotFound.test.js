import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BPMNViewerComponent from '../components/BPMNViewer';
import { PageProvider, PAGE_TYPES } from '../components/framework';

// Mock the page framework to simulate asset not found error
jest.mock('../components/framework/PageProvider', () => {
  const actual = jest.requireActual('../components/framework/PageProvider');
  return {
    ...actual,
    usePage: jest.fn()
  };
});

// Mock BPMN-related services
jest.mock('../services/lazyFactoryService', () => ({
  createLazyBpmnViewer: jest.fn()
}));

jest.mock('../services/githubService', () => ({
  isAuth: jest.fn(() => true)
}));

// Mock ContextualHelpMascot
jest.mock('../components/ContextualHelpMascot', () => {
  return function MockContextualHelpMascot() {
    return <div data-testid="contextual-help-mascot">Mocked Help</div>;
  };
});

const { usePage } = require('../components/framework/PageProvider');

describe('BPMNViewer Asset Not Found Error Handling', () => {
  const mockRepository = {
    name: 'smart-ips-pilgrimage',
    owner: { login: 'litlfred' },
    full_name: 'litlfred/smart-ips-pilgrimage',
    html_url: 'https://github.com/litlfred/smart-ips-pilgrimage'
  };

  const mockProfile = {
    login: 'litlfred',
    avatar_url: 'https://github.com/litlfred.png'
  };

  const assetPath = 'input/business-processes/Clinical Encounter for Unplanned Care (brief).bpmn';
  const expectedErrorMessage = `Asset '${assetPath}' not found in repository 'litlfred/smart-ips-pilgrimage'. The file may have been moved or deleted.`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderBPMNViewerWithPageError = (pageError) => {
    // Mock usePage to return asset not found error
    usePage.mockReturnValue({
      pageName: 'bpmn-viewer',
      user: 'litlfred',
      profile: mockProfile,
      repository: mockRepository,
      branch: 'main',
      asset: assetPath,
      type: PAGE_TYPES.ASSET,
      loading: false,
      error: pageError,
      isAuthenticated: true,
      navigate: jest.fn(),
      params: {
        user: 'litlfred',
        repo: 'smart-ips-pilgrimage',
        branch: 'main'
      },
      location: { 
        pathname: `/bpmn-viewer/litlfred/smart-ips-pilgrimage/main/${assetPath}` 
      }
    });

    return render(
      <BrowserRouter>
        <BPMNViewerComponent />
      </BrowserRouter>
    );
  };

  it('displays asset not found error when pageError is provided', async () => {
    renderBPMNViewerWithPageError(expectedErrorMessage);

    // Should show the asset not found error
    await waitFor(() => {
      expect(screen.getByText('❌ Asset Not Found')).toBeInTheDocument();
    });

    // Should show the error message
    expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
  });

  it('provides helpful navigation options when asset is not found', async () => {
    renderBPMNViewerWithPageError(expectedErrorMessage);

    await waitFor(() => {
      expect(screen.getByText('❌ Asset Not Found')).toBeInTheDocument();
    });

    // Should have navigation buttons
    expect(screen.getByText('← Browse Available Files')).toBeInTheDocument();
    expect(screen.getByText('🏠 Home')).toBeInTheDocument();
    expect(screen.getByText('📂 View Repository')).toBeInTheDocument();
  });

  it('provides helpful error guidance when asset is not found', async () => {
    renderBPMNViewerWithPageError(expectedErrorMessage);

    await waitFor(() => {
      expect(screen.getByText('❌ Asset Not Found')).toBeInTheDocument();
    });

    // Should have help section
    expect(screen.getByText('🤔 What can I do?')).toBeInTheDocument();
    
    // Check for helpful suggestions
    expect(screen.getByText(/file may have been moved, renamed, or deleted/)).toBeInTheDocument();
    expect(screen.getByText(/Check if the file exists in a different branch/)).toBeInTheDocument();
    expect(screen.getByText(/Browse Available Files.*BPMN files/)).toBeInTheDocument();
    expect(screen.getByText(/Contact the repository maintainer/)).toBeInTheDocument();
  });

  it('does not show asset not found error when no pageError is provided', () => {
    // Mock usePage with no error
    usePage.mockReturnValue({
      pageName: 'bpmn-viewer',
      user: null,
      profile: null,
      repository: null,
      branch: null,
      asset: null,
      type: PAGE_TYPES.TOP_LEVEL,
      loading: false,
      error: null,
      isAuthenticated: false,
      navigate: jest.fn(),
      params: {},
      location: { pathname: '/bpmn-viewer' }
    });

    render(
      <BrowserRouter>
        <BPMNViewerComponent />
      </BrowserRouter>
    );

    // Should not show asset not found error
    expect(screen.queryByText('❌ Asset Not Found')).not.toBeInTheDocument();
    
    // Should show loading or redirect message instead
    expect(screen.getByText('Loading or redirecting...')).toBeInTheDocument();
  });

  it('handles different types of asset errors gracefully', async () => {
    const customErrorMessage = 'Custom asset error message';
    renderBPMNViewerWithPageError(customErrorMessage);

    await waitFor(() => {
      expect(screen.getByText('❌ Asset Not Found')).toBeInTheDocument();
    });

    // Should show the custom error message
    expect(screen.getByText(customErrorMessage)).toBeInTheDocument();
  });

  it('handles URL-encoded asset paths correctly', async () => {
    // Test with URL-encoded path that should decode properly
    const urlEncodedPath = 'Clinical%20Encounter%20for%20Unplanned%20Care%20(brief).bpmn';
    const decodedPath = 'Clinical Encounter for Unplanned Care (brief).bpmn';
    const errorMessage = `Asset '${decodedPath}' not found in repository 'litlfred/smart-ips-pilgrimage'. The file may have been moved or deleted.`;
    
    // Mock usePage to return URL-encoded asset path with error
    usePage.mockReturnValue({
      pageName: 'bpmn-viewer',
      user: 'litlfred',
      profile: mockProfile,
      repository: mockRepository,
      branch: 'main',
      asset: decodedPath, // PageProvider should have decoded this already
      type: PAGE_TYPES.ASSET,
      loading: false,
      error: errorMessage, // Error message should use decoded path
      isAuthenticated: true,
      navigate: jest.fn(),
      params: {
        user: 'litlfred',
        repo: 'smart-ips-pilgrimage',
        branch: 'main'
      },
      location: { 
        pathname: `/bpmn-viewer/litlfred/smart-ips-pilgrimage/main/${urlEncodedPath}` // URL still has encoded path
      }
    });

    render(
      <BrowserRouter>
        <BPMNViewerComponent />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('❌ Asset Not Found')).toBeInTheDocument();
    });

    // Should show the error message with decoded path
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
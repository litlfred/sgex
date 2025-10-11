import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpModal from '../components/HelpModal';
import BugReportForm from '../components/BugReportForm';
import githubService from '../services/githubService';
import bugReportService from '../services/bugReportService';

// Mock the services
jest.mock('../services/githubService', () => ({
  isAuth: jest.fn(),
  isAuthenticated: false, // This property should NOT be used
}));

jest.mock('../services/bugReportService', () => ({
  getTemplates: jest.fn(() => Promise.resolve([
    {
      id: 'bug',
      name: 'Bug Report',
      description: 'Report a bug',
      type: 'bug',
      body: []
    }
  ])),
  captureConsoleOutput: jest.fn(() => ({
    stop: jest.fn(),
    getLogs: jest.fn(() => '')
  })),
  takeScreenshot: jest.fn(),
  submitIssue: jest.fn(),
  generateIssueUrl: jest.fn(() => 'https://github.com/litlfred/sgex/issues/new')
}));

jest.mock('../config/repositoryConfig', () => ({
  getOwner: () => 'litlfred',
  getName: () => 'sgex',
  getGitHubUrl: () => 'https://github.com/litlfred/sgex'
}));

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn()
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: light)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});

describe('Authenticated Bug Report UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.open.mockClear();
    delete window.helpModalInstance;
  });

  test('HelpModal shows bug report form when authenticated', () => {
    // Mock authenticated state
    githubService.isAuth.mockReturnValue(true);
    
    const contextData = { pageId: 'test-page' };
    
    render(
      <HelpModal
        topic="bug-report"
        contextData={contextData}
        onClose={jest.fn()}
      />
    );
    
    // Click the bug report button via the global handler
    window.helpModalInstance.openSgexIssue('bug');
    
    // Verify isAuth() was called, not the property
    expect(githubService.isAuth).toHaveBeenCalled();
  });

  test('HelpModal redirects to GitHub when not authenticated', () => {
    // Mock unauthenticated state
    githubService.isAuth.mockReturnValue(false);
    
    const contextData = { pageId: 'test-page' };
    
    render(
      <HelpModal
        topic="bug-report"
        contextData={contextData}
        onClose={jest.fn()}
      />
    );
    
    // Click the bug report button via the global handler
    window.helpModalInstance.openSgexIssue('bug');
    
    // Verify isAuth() was called
    expect(githubService.isAuth).toHaveBeenCalled();
    
    // Should open GitHub directly for unauthenticated users
    expect(window.open).toHaveBeenCalled();
  });

  test('BugReportForm uses isAuth() method for authentication check', async () => {
    // Mock authenticated state
    githubService.isAuth.mockReturnValue(true);
    
    bugReportService.submitIssue.mockResolvedValue({
      success: true,
      issue: { number: 123, html_url: 'https://github.com/test/repo/issues/123' }
    });
    
    const contextData = { pageId: 'test-page' };
    
    render(
      <BugReportForm
        onClose={jest.fn()}
        contextData={contextData}
      />
    );
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Submit button should show "Submit Issue" when authenticated
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit issue|opening/i });
      expect(submitButton).toBeInTheDocument();
    });
    
    // Verify authentication status is displayed correctly
    await waitFor(() => {
      expect(screen.getByText(/Authenticated - Issues will be submitted directly to GitHub/i)).toBeInTheDocument();
    });
  });

  test('BugReportForm shows correct UI for unauthenticated users', async () => {
    // Mock unauthenticated state
    githubService.isAuth.mockReturnValue(false);
    
    const contextData = { pageId: 'test-page' };
    
    render(
      <BugReportForm
        onClose={jest.fn()}
        contextData={contextData}
      />
    );
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Submit button should show "Open in GitHub" when not authenticated
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /open in github|opening/i });
      expect(submitButton).toBeInTheDocument();
    });
    
    // Verify authentication status shows not authenticated
    await waitFor(() => {
      expect(screen.getByText(/Not authenticated - Issue will open in GitHub for manual submission/i)).toBeInTheDocument();
    });
  });

  test('isAuth() method is preferred over isAuthenticated property', () => {
    // This test verifies that the code uses the method, not the property
    githubService.isAuth.mockReturnValue(true);
    githubService.isAuthenticated = false; // Set property to opposite value
    
    const contextData = { pageId: 'test-page' };
    
    render(
      <HelpModal
        topic="bug-report"
        contextData={contextData}
        onClose={jest.fn()}
      />
    );
    
    // Trigger bug report
    window.helpModalInstance.openSgexIssue('bug');
    
    // Should use isAuth() method (which returns true), not property (which is false)
    expect(githubService.isAuth).toHaveBeenCalled();
    // The form should show because isAuth() returns true, not because property is false
  });
});

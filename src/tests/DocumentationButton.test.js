import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import helpContentService from '../services/helpContentService';

// Mock the GitHub service to avoid authentication issues in tests
jest.mock('../services/githubService', () => ({
  isAuth: () => false,
  authenticate: () => false,
  getCurrentUser: () => Promise.resolve(null),
  getUserOrganizations: () => Promise.resolve([]),
  checkTokenPermissions: () => Promise.resolve(true),
  checkRepositoryWritePermissions: () => Promise.resolve(false),
}));

// Mock the framework components to focus on testing routing logic
jest.mock('../components/framework', () => ({
  PageLayout: ({ children }) => <div data-testid="page-layout">{children}</div>,
  usePageParams: () => ({ params: {} })
}));

describe('Documentation Routing Logic', () => {
  beforeEach(() => {
    // Reset the window location for each test
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        href: 'http://localhost:3000/'
      },
      writable: true
    });
  });

  test('LandingPage refers users to help mascot for documentation', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    // Should mention using the help mascot instead of hardcoded links
    expect(screen.getByText(/help mascot.*bottom-right corner/i)).toBeInTheDocument();
  });

  test('helpContentService determines correct documentation path for main deployment', () => {
    // Mock being on main deployment
    window.location.pathname = '/sgex/dashboard';
    
    const documentationTopic = helpContentService.getHelpTopic('sgex-documentation');
    expect(documentationTopic).toBeTruthy();
    expect(documentationTopic.type).toBe('action');
    
    // Mock the action to capture the URL it would navigate to
    let navigatedUrl = '';
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: ''
      },
      writable: true
    });
    
    // Execute the action and capture the URL
    const originalWindowLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: {
        ...originalWindowLocation,
        href: navigatedUrl
      },
      set: (url) => { navigatedUrl = url; }
    });
    
    documentationTopic.action();
    expect(navigatedUrl).toBe('/sgex/main/docs/overview');
  });

  test('helpContentService determines correct documentation path for branch deployment', () => {
    // Mock being on feature branch deployment
    window.location.pathname = '/sgex/feature-branch/dashboard';
    
    const documentationTopic = helpContentService.getHelpTopic('sgex-documentation');
    expect(documentationTopic).toBeTruthy();
    
    // Mock the action to capture the URL it would navigate to
    let navigatedUrl = '';
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: navigatedUrl
      },
      set: (url) => { navigatedUrl = url; }
    });
    
    documentationTopic.action();
    expect(navigatedUrl).toBe('/sgex/feature-branch/docs/overview');
  });

  test('helpContentService handles edge cases correctly', () => {
    // Test with non-sgex path
    window.location.pathname = '/some-other-path';
    
    const documentationTopic = helpContentService.getHelpTopic('sgex-documentation');
    expect(documentationTopic).toBeTruthy();
    
    let navigatedUrl = '';
    Object.defineProperty(window, 'location', {
      value: { href: navigatedUrl },
      set: (url) => { navigatedUrl = url; }
    });
    
    documentationTopic.action();
    expect(navigatedUrl).toBe('/sgex/main/docs/overview');
  });
});
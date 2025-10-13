import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage';

// Mock the GitHub service
jest.mock('../services/githubService', () => ({
  __esModule: true,
  default: {
    isAuth: jest.fn(() => false),
    authenticate: jest.fn(() => true),
    authenticateWithOctokit: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(() => Promise.resolve({ login: 'testuser', name: 'Test User', avatar_url: 'https://example.com/avatar.png' })),
    getUserOrganizations: jest.fn(() => Promise.resolve([])),
    checkTokenPermissions: jest.fn(() => Promise.resolve()),
    getWHOOrganization: jest.fn(() => Promise.resolve({
      id: 'who-organization',
      login: 'WorldHealthOrganization',
      name: 'World Health Organization',
      avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
      isWHO: true
    }))
  }
}));

// Mock repository cache service
jest.mock('../services/repositoryCacheService', () => ({
  __esModule: true,
  default: {
    getCachedRepositories: jest.fn(() => null)
  }
}));

// Mock help content service
jest.mock('../services/helpContentService', () => ({
  __esModule: true,
  default: {
    getHelpTopicsForPage: jest.fn(() => [
      { id: 'pat-token', title: 'How to Create a GitHub Personal Access Token' },
      { id: 'bug-report', title: 'Report an issue' }
    ])
  }
}));

describe('LandingPage Help System', () => {
  test('renders only one help mascot in unauthenticated state', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    // Should find exactly one help mascot image
    const helpMascots = screen.getAllByAltText('SGEX Helper');
    expect(helpMascots).toHaveLength(1);
    
    // Should find exactly one question mark bubble  
    const questionBubbles = screen.getAllByText('?');
    expect(questionBubbles).toHaveLength(1);
  });
});
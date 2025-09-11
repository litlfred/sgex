import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DAKDashboard from '../components/DAKDashboard';

// Mock the services to avoid external dependencies in tests
jest.mock('../services/githubService', () => ({
  isAuth: () => false,
  checkRepositoryWritePermissions: () => Promise.resolve(false),
  getIssues: () => Promise.resolve([])
}));

jest.mock('../services/dakValidationService', () => ({
  validateDAKRepository: () => Promise.resolve(true)
}));

jest.mock('../services/branchContextService', () => ({
  getSelectedBranch: () => null,
  setSelectedBranch: () => {}
}));

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockLocation = { state: null };
const mockParams = { user: 'testuser', repo: 'testrepo', branch: 'main' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useParams: () => mockParams
}));

// Mock translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

// Mock theme hook
jest.mock('../hooks/useThemeImage', () => ({
  __esModule: true,
  default: (imagePath) => `/mock/${imagePath}`
}));

describe('DAK Dashboard URL Fragments', () => {
  let originalHash;
  
  beforeEach(() => {
    // Store original hash
    originalHash = window.location.hash;
    // Clear hash before each test
    window.location.hash = '';
    // Clear mocks
    mockNavigate.mockClear();
  });
  
  afterEach(() => {
    // Restore original hash
    window.location.hash = originalHash;
  });

  test('defaults to components tab when no fragment is present', () => {
    // Mock profile and repository data
    mockLocation.state = {
      profile: { login: 'testuser', name: 'Test User' },
      repository: { name: 'testrepo', owner: { login: 'testuser' } }
    };

    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    // Should default to components fragment
    expect(window.location.hash).toBe('#components');
  });

  test('reads initial tab from URL fragment', () => {
    // Set initial hash
    window.location.hash = '#publishing';
    
    // Mock profile and repository data
    mockLocation.state = {
      profile: { login: 'testuser', name: 'Test User' },
      repository: { name: 'testrepo', owner: { login: 'testuser' } }
    };

    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    // Should maintain the publishing fragment
    expect(window.location.hash).toBe('#publishing');
  });

  test('recognizes valid fragments', () => {
    const validFragments = ['components', 'publishing', 'dak-faq'];
    
    validFragments.forEach(fragment => {
      window.location.hash = `#${fragment}`;
      
      mockLocation.state = {
        profile: { login: 'testuser', name: 'Test User' },
        repository: { name: 'testrepo', owner: { login: 'testuser' } }
      };

      const { unmount } = render(
        <BrowserRouter>
          <DAKDashboard />
        </BrowserRouter>
      );

      expect(window.location.hash).toBe(`#${fragment}`);
      unmount();
    });
  });

  test('defaults to components for invalid fragments', () => {
    // Set invalid hash
    window.location.hash = '#invalid-fragment';
    
    mockLocation.state = {
      profile: { login: 'testuser', name: 'Test User' },
      repository: { name: 'testrepo', owner: { login: 'testuser' } }
    };

    render(
      <BrowserRouter>
        <DAKDashboard />
      </BrowserRouter>
    );

    // Should default to components for invalid fragment
    expect(window.location.hash).toBe('#components');
  });
});
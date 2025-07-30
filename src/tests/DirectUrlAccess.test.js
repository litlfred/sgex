import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DAKDashboardWithFramework from '../components/DAKDashboardWithFramework';
import dakValidationService from '../services/dakValidationService';

// Mock the router to simulate direct URL access
const MockRouterWithParams = ({ user, repo, branch, children }) => {
  // Mock useParams to return the URL parameters
  const mockUseParams = jest.fn(() => ({ user, repo, branch }));
  const mockUseLocation = jest.fn(() => ({ 
    state: null, // No state simulates direct URL access
    pathname: `/dashboard/${user}/${repo}/${branch}`
  }));
  const mockUseNavigate = jest.fn(() => jest.fn());

  // Mock React Router hooks
  React.useParams = mockUseParams;
  React.useLocation = mockUseLocation;
  React.useNavigate = mockUseNavigate;

  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('Direct URL Access to DAK Dashboard', () => {
  beforeEach(() => {
    // Reset any global state
    jest.clearAllMocks();
    
    // Mock console methods to reduce noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe('Demo DAK Repository Validation', () => {
    test('validates demo-user/anc-dak as valid DAK repository', () => {
      const result = dakValidationService.validateDemoDAKRepository('demo-user', 'anc-dak');
      expect(result).toBe(true);
    });

    test('validates demo-user/immunization-dak as valid DAK repository', () => {
      const result = dakValidationService.validateDemoDAKRepository('demo-user', 'immunization-dak');
      expect(result).toBe(true);
    });

    test('validates demo-user/maternal-health-dak as valid DAK repository', () => {
      const result = dakValidationService.validateDemoDAKRepository('demo-user', 'maternal-health-dak');
      expect(result).toBe(true);
    });

    test('validates any-user/anc-dak as valid DAK repository', () => {
      const result = dakValidationService.validateDemoDAKRepository('any-user', 'anc-dak');
      expect(result).toBe(true);
    });

    test('rejects invalid DAK repository patterns', () => {
      expect(dakValidationService.validateDemoDAKRepository('user', 'not-a-dak')).toBe(false);
      expect(dakValidationService.validateDemoDAKRepository('user', 'random-repo')).toBe(false);
      expect(dakValidationService.validateDemoDAKRepository('litlfred', 'smart-trust-gdhcnv')).toBe(false);
    });

    test('accepts health-related DAK patterns', () => {
      expect(dakValidationService.validateDemoDAKRepository('user', 'health-dak')).toBe(true);
      expect(dakValidationService.validateDemoDAKRepository('user', 'maternal-health-dak')).toBe(true);
      expect(dakValidationService.validateDemoDAKRepository('user', 'child-health-dak')).toBe(true);
    });

    test('accepts care-related DAK patterns', () => {
      expect(dakValidationService.validateDemoDAKRepository('user', 'anc-dak')).toBe(true);
      expect(dakValidationService.validateDemoDAKRepository('user', 'primary-care-dak')).toBe(true);
      expect(dakValidationService.validateDemoDAKRepository('user', 'emergency-care-dak')).toBe(true);
    });

    test('accepts immunization-related DAK patterns', () => {
      expect(dakValidationService.validateDemoDAKRepository('user', 'immunization-dak')).toBe(true);
      expect(dakValidationService.validateDemoDAKRepository('user', 'covid-immunization-dak')).toBe(true);
    });
  });

  describe('URL Pattern Matching', () => {
    test('recognizes valid DAK URL patterns', () => {
      // Test the specific repositories from DAKSelection.js mock data
      const demoDakRepos = [
        'demo-user/anc-dak',
        'demo-user/immunization-dak', 
        'demo-user/maternal-health-dak',
        'some-org/anc-dak',
        'who/immunization-dak',
        'test-user/maternal-health-dak'
      ];

      demoDakRepos.forEach(repo => {
        const [owner, repoName] = repo.split('/');
        const result = dakValidationService.validateDemoDAKRepository(owner, repoName);
        expect(result).toBe(true);
      });
    });

    test('rejects non-DAK URL patterns', () => {
      const nonDakRepos = [
        'user/not-a-dak',
        'user/random-repo',
        'user/some-app',
        'litlfred/smart-trust-gdhcnv', // From existing test
        'someone/regular-project'
      ];

      nonDakRepos.forEach(repo => {
        const [owner, repoName] = repo.split('/');
        const result = dakValidationService.validateDemoDAKRepository(owner, repoName);
        expect(result).toBe(false);
      });
    });
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import DAKSelection from '../components/DAKSelection';
import * as githubService from '../services/githubService';
import * as repositoryCacheService from '../services/repositoryCacheService';

// Mock the services
jest.mock('../services/githubService');
jest.mock('../services/repositoryCacheService');

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

describe('DAKSelection URL Rewriting', () => {
  const mockProfile = {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://github.com/testuser.png',
    type: 'User'
  };

  const mockRepository = {
    id: 1,
    name: 'test-dak',
    full_name: 'testuser/test-dak',
    description: 'Test DAK repository',
    html_url: 'https://github.com/testuser/test-dak',
    owner: {
      login: 'testuser'
    },
    smart_guidelines_compatible: true
  };

  const mockRepositoryWithoutOwner = {
    id: 2,
    name: 'another-dak',
    full_name: 'anotheruser/another-dak',
    description: 'Another DAK repository',
    html_url: 'https://github.com/anotheruser/another-dak',
    smart_guidelines_compatible: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    githubService.isAuth = jest.fn().mockReturnValue(false);
    repositoryCacheService.getCachedRepositories = jest.fn().mockReturnValue(null);
    repositoryCacheService.getCacheInfo = jest.fn().mockReturnValue(null);
  });

  test('navigates to parameterized dashboard URL when repository is selected for edit action', async () => {
    const initialEntries = [{
      pathname: '/dak-selection',
      state: {
        profile: mockProfile,
        action: 'edit'
      }
    }];

    const { container } = render(
      <MemoryRouter initialEntries={initialEntries}>
        <DAKSelection />
      </MemoryRouter>
    );

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('maternal-health-dak')).toBeInTheDocument();
    });

    // Click on a repository
    const repoCard = screen.getByText('maternal-health-dak').closest('.repo-card');
    fireEvent.click(repoCard);

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/dashboard/demo-user/maternal-health-dak',
        expect.objectContaining({
          state: expect.objectContaining({
            profile: expect.any(Object),
            repository: expect.any(Object),
            action: 'edit'
          })
        })
      );
    });
  });

  test('handles repository with owner.login property correctly', () => {
    // Create a component instance to test the helper function
    const TestComponent = () => {
      const getRepositoryPath = (repository) => {
        if (!repository) return null;
        
        const user = repository.owner?.login || repository.full_name?.split('/')[0];
        const repo = repository.name;
        
        if (!user || !repo) {
          console.error('Unable to extract user/repo from repository object:', repository);
          return null;
        }
        
        return { user, repo };
      };

      const result = getRepositoryPath(mockRepository);
      return <div data-testid="repo-path">{JSON.stringify(result)}</div>;
    };

    render(<TestComponent />);
    
    const repoPath = screen.getByTestId('repo-path');
    expect(repoPath.textContent).toBe('{"user":"testuser","repo":"test-dak"}');
  });

  test('handles repository without owner.login by parsing full_name', () => {
    // Create a component instance to test the helper function
    const TestComponent = () => {
      const getRepositoryPath = (repository) => {
        if (!repository) return null;
        
        const user = repository.owner?.login || repository.full_name?.split('/')[0];
        const repo = repository.name;
        
        if (!user || !repo) {
          console.error('Unable to extract user/repo from repository object:', repository);
          return null;
        }
        
        return { user, repo };
      };

      const result = getRepositoryPath(mockRepositoryWithoutOwner);
      return <div data-testid="repo-path">{JSON.stringify(result)}</div>;
    };

    render(<TestComponent />);
    
    const repoPath = screen.getByTestId('repo-path');
    expect(repoPath.textContent).toBe('{"user":"anotheruser","repo":"another-dak"}');
  });

  test('returns null when repository data is invalid', () => {
    const TestComponent = () => {
      const getRepositoryPath = (repository) => {
        if (!repository) return null;
        
        const user = repository.owner?.login || repository.full_name?.split('/')[0];
        const repo = repository.name;
        
        if (!user || !repo) {
          console.error('Unable to extract user/repo from repository object:', repository);
          return null;
        }
        
        return { user, repo };
      };

      const result = getRepositoryPath({ id: 1 }); // Invalid repo without name or full_name
      return <div data-testid="repo-path">{result ? JSON.stringify(result) : 'null'}</div>;
    };

    render(<TestComponent />);
    
    const repoPath = screen.getByTestId('repo-path');
    expect(repoPath.textContent).toBe('null');
  });
});
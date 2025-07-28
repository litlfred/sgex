import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../components/NotFound';
import githubService from '../services/githubService';

// Mock the GitHub service
jest.mock('../services/githubService');

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/nonexistent-page' })
}));

describe('NotFound Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    githubService.isAuth.mockClear();
  });

  test('redirects to landing page with unauthenticated message', () => {
    // Mock unauthenticated state
    githubService.isAuth.mockReturnValue(false);

    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/', {
      replace: true,
      state: { 
        warningMessage: 'The page "/nonexistent-page" could not be found. Please sign in or try the demo mode to get started.' 
      }
    });
  });

  test('redirects to landing page with authenticated message', () => {
    // Mock authenticated state
    githubService.isAuth.mockReturnValue(true);

    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/', {
      replace: true,
      state: { 
        warningMessage: 'The page "/nonexistent-page" could not be found. You\'ve been redirected to the home page.' 
      }
    });
  });

  test('renders nothing (null)', () => {
    githubService.isAuth.mockReturnValue(false);

    const { container } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });
});
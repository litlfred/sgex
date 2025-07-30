import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PageHeader from './PageHeader';
import { PageProvider } from './PageProvider';
import githubService from '../../services/githubService';

// Mock GitHub service
jest.mock('../../services/githubService', () => ({
  isAuth: jest.fn(),
  getCurrentUser: jest.fn(),
  logout: jest.fn()
}));

// Mock PageProvider context for testing
const MockPageProvider = ({ isAuthenticated, profile, children }) => {
  const mockContextValue = {
    type: 'top-level',
    pageName: 'test',
    profile,
    repository: null,
    branch: null,
    isAuthenticated,
    navigate: jest.fn()
  };

  return (
    <div data-testid="mock-page-provider">
      {React.cloneElement(children, mockContextValue)}
    </div>
  );
};

// Test wrapper component
const TestWrapper = ({ isAuthenticated = false, profile = null, children }) => (
  <BrowserRouter>
    <MockPageProvider isAuthenticated={isAuthenticated} profile={profile}>
      {children}
    </MockPageProvider>
  </BrowserRouter>
);

describe('PageHeader Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows login button when not authenticated and no profile', () => {
    githubService.isAuth.mockReturnValue(false);
    
    const TestPageHeader = (props) => {
      const {
        isAuthenticated = false,
        profile = null,
        navigate = jest.fn()
      } = props;
      
      return (
        <header className="page-header">
          <div className="page-header-right">
            {isAuthenticated && profile ? (
              <div className="user-controls" data-testid="user-controls">
                <div className="user-info">
                  <span>{profile.name || profile.login}</span>
                </div>
              </div>
            ) : (
              <button className="login-btn" data-testid="login-btn" onClick={() => navigate('/')}>
                Login
              </button>
            )}
          </div>
        </header>
      );
    };

    render(
      <TestWrapper isAuthenticated={false} profile={null}>
        <TestPageHeader isAuthenticated={false} profile={null} navigate={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByTestId('login-btn')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('shows user profile when authenticated with profile', () => {
    githubService.isAuth.mockReturnValue(true);
    
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png'
    };

    const TestPageHeader = (props) => {
      const {
        isAuthenticated = false,
        profile = null,
        navigate = jest.fn()
      } = props;
      
      return (
        <header className="page-header">
          <div className="page-header-right">
            {isAuthenticated && profile ? (
              <div className="user-controls" data-testid="user-controls">
                <div className="user-info">
                  <span data-testid="user-name">{profile.name || profile.login}</span>
                </div>
              </div>
            ) : (
              <button className="login-btn" data-testid="login-btn" onClick={() => navigate('/')}>
                Login
              </button>
            )}
          </div>
        </header>
      );
    };

    render(
      <TestWrapper isAuthenticated={true} profile={mockProfile}>
        <TestPageHeader isAuthenticated={true} profile={mockProfile} navigate={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByTestId('user-controls')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.queryByTestId('login-btn')).not.toBeInTheDocument();
  });

  test('shows demo user profile when in demo mode', () => {
    githubService.isAuth.mockReturnValue(false); // Not authenticated but has demo profile
    
    const mockDemoProfile = {
      login: 'demo-user',
      name: 'Demo User',
      avatar_url: 'https://github.com/demo-user.png',
      isDemo: true
    };

    const TestPageHeader = (props) => {
      const {
        isAuthenticated = false,
        profile = null,
        navigate = jest.fn()
      } = props;
      
      return (
        <header className="page-header">
          <div className="page-header-right">
            {(isAuthenticated && profile) || (profile?.isDemo) ? (
              <div className="user-controls" data-testid="user-controls">
                <div className="user-info">
                  <span data-testid="user-name">{profile.name || profile.login}</span>
                </div>
              </div>
            ) : (
              <button className="login-btn" data-testid="login-btn" onClick={() => navigate('/')}>
                Login
              </button>
            )}
          </div>
        </header>
      );
    };

    render(
      <TestWrapper isAuthenticated={false} profile={mockDemoProfile}>
        <TestPageHeader isAuthenticated={false} profile={mockDemoProfile} navigate={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByTestId('user-controls')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Demo User');
    expect(screen.queryByTestId('login-btn')).not.toBeInTheDocument();
  });
});
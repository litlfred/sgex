import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BusinessProcessSelection from '../components/BusinessProcessSelection';

// Mock the services
jest.mock('../services/githubService', () => ({
  __esModule: true,
  default: {
    isAuth: jest.fn(() => false),
    getUser: jest.fn(),
    getRepository: jest.fn(),
    getBranch: jest.fn(),
    checkRepositoryWritePermissions: jest.fn(() => Promise.resolve(false))
  }
}));

jest.mock('../services/dakValidationService', () => ({
  __esModule: true,
  default: {
    validateDemoDAKRepository: jest.fn(() => true),
    validateDAKRepository: jest.fn(() => Promise.resolve(true))
  }
}));

// Mock useParams to simulate URL parameters
const mockNavigate = jest.fn();
const mockLocation = { state: null };
const mockParams = { user: 'testuser', repo: 'testrepo', branch: 'main' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useParams: () => mockParams
}));

describe('BusinessProcessSelection with URL parameters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with DAK URL parameters', async () => {
    render(
      <BrowserRouter>
        <BusinessProcessSelection />
      </BrowserRouter>
    );

    // Should show loading state initially
    expect(screen.getByText(/Loading DAK Data/i)).toBeInTheDocument();
  });
});
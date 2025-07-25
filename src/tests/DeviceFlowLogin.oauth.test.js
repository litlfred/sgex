import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeviceFlowLogin from '../components/DeviceFlowLogin';
import * as oauthConfig from '../config/oauth';

// Mock the device flow auth service
jest.mock('../services/deviceFlowAuthService', () => ({
  startDeviceFlow: jest.fn()
}));

// Mock the oauth config
jest.mock('../config/oauth', () => ({
  DEFAULT_SCOPES: ['repo', 'read:org'],
  isUsingPlaceholderClientId: jest.fn()
}));

describe('DeviceFlowLogin OAuth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows setup instructions when using placeholder client ID', () => {
    // Mock that we're using the placeholder client ID
    oauthConfig.isUsingPlaceholderClientId.mockReturnValue(true);

    const mockOnAuthSuccess = jest.fn();
    render(<DeviceFlowLogin onAuthSuccess={mockOnAuthSuccess} />);

    // Should show the setup instructions immediately
    expect(screen.getByText('⚙️ GitHub OAuth Setup Required')).toBeInTheDocument();
    expect(screen.getByText('To use SGEX Workbench, you need to configure GitHub OAuth authentication.')).toBeInTheDocument();
    expect(screen.getByText('1. Register a GitHub OAuth App')).toBeInTheDocument();
  });

  test('shows error message when clicking login with placeholder client ID', () => {
    // Mock that we're using the placeholder client ID
    oauthConfig.isUsingPlaceholderClientId.mockReturnValue(true);

    const mockOnAuthSuccess = jest.fn();
    render(<DeviceFlowLogin onAuthSuccess={mockOnAuthSuccess} />);

    // Click the login button
    const loginButton = screen.getByRole('button', { name: /sign in with github/i });
    fireEvent.click(loginButton);

    // Should show error message
    expect(screen.getByText('GitHub OAuth is not configured. Please follow the setup instructions below.')).toBeInTheDocument();
  });

  test('does not show setup instructions when using valid client ID', () => {
    // Mock that we're not using the placeholder client ID
    oauthConfig.isUsingPlaceholderClientId.mockReturnValue(false);

    const mockOnAuthSuccess = jest.fn();
    render(<DeviceFlowLogin onAuthSuccess={mockOnAuthSuccess} />);

    // Should not show the setup instructions by default
    expect(screen.queryByText('⚙️ GitHub OAuth Setup Required')).not.toBeInTheDocument();
    
    // Should show the login button
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
  });
});
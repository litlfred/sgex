import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeviceFlowLogin from './DeviceFlowLogin';

// Mock the device flow auth service
jest.mock('../services/deviceFlowAuthService');

describe('DeviceFlowLogin Component', () => {
  const mockOnAuthSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sign in button initially', () => {
    render(<DeviceFlowLogin onAuthSuccess={mockOnAuthSuccess} />);
    
    const signInButton = screen.getByRole('button', { name: /sign in with github/i });
    expect(signInButton).toBeInTheDocument();
  });

  test('shows verification step when device flow starts', async () => {
    const user = userEvent.setup();
    render(<DeviceFlowLogin onAuthSuccess={mockOnAuthSuccess} />);
    
    const signInButton = screen.getByRole('button', { name: /sign in with github/i });
    await user.click(signInButton);
    
    // Should show requesting step briefly
    expect(screen.getByText(/starting authentication with github/i)).toBeInTheDocument();
    
    // Should then show verification step
    await waitFor(() => {
      expect(screen.getByText(/complete authentication/i)).toBeInTheDocument();
      expect(screen.getByText(/ABCD-1234/)).toBeInTheDocument(); // Mock user code
    });
  });

  test('calls onAuthSuccess when authentication completes', async () => {
    const user = userEvent.setup();
    render(<DeviceFlowLogin onAuthSuccess={mockOnAuthSuccess} />);
    
    const signInButton = screen.getByRole('button', { name: /sign in with github/i });
    await user.click(signInButton);
    
    // Wait for the mock authentication to complete
    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalledWith('mock_oauth_token', expect.any(Object));
    }, { timeout: 3000 });
  });
});
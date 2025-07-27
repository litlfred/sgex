import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage';

// Mock the GitHub service - we don't need to test DAKDashboard redirect behavior
// in isolation as it's complex to test with React Router mocking
jest.mock('../services/githubService');
jest.mock('../services/repositoryCacheService');

describe('Invalid DAK URL Redirection', () => {
  test('LandingPage displays warning message when provided in navigation state', () => {
    const warningMessage = "Could not access the requested DAK. Repository 'user/repo' not found or not accessible.";
    
    render(
      <MemoryRouter 
        initialEntries={[{ 
          pathname: '/', 
          state: { warningMessage } 
        }]}
      >
        <LandingPage />
      </MemoryRouter>
    );

    // Check that the warning message is displayed
    expect(screen.getByText(warningMessage)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByLabelText('Dismiss warning')).toBeInTheDocument();
  });

  test('warning message can be dismissed', async () => {
    const user = userEvent.setup();
    const warningMessage = "Test warning message";
    
    render(
      <MemoryRouter 
        initialEntries={[{ 
          pathname: '/', 
          state: { warningMessage } 
        }]}
      >
        <LandingPage />
      </MemoryRouter>
    );

    // Verify warning is initially shown
    expect(screen.getByText(warningMessage)).toBeInTheDocument();
    
    // Click dismiss button
    const dismissButton = screen.getByLabelText('Dismiss warning');
    await act(async () => {
      await user.click(dismissButton);
    });

    // Warning should be removed
    await waitFor(() => {
      expect(screen.queryByText(warningMessage)).not.toBeInTheDocument();
    });
  });

  test('warning message for user not found', () => {
    const warningMessage = "Could not access the requested DAK. User 'nonexistent-user' not found or not accessible.";
    
    render(
      <MemoryRouter 
        initialEntries={[{ 
          pathname: '/', 
          state: { warningMessage } 
        }]}
      >
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(warningMessage)).toBeInTheDocument();
  });

  test('warning message for repository not found', () => {
    const warningMessage = "Could not access the requested DAK. Repository 'user/invalid-repo' not found or not accessible.";
    
    render(
      <MemoryRouter 
        initialEntries={[{ 
          pathname: '/', 
          state: { warningMessage } 
        }]}
      >
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(warningMessage)).toBeInTheDocument();
  });
});
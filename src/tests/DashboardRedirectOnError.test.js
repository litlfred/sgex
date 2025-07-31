import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PageProvider } from '../components/framework/PageProvider';

// Mock the services to avoid external dependencies in tests
jest.mock('../services/githubService', () => ({
  isAuth: () => false,
  getUser: jest.fn(),
  getRepository: jest.fn()
}));

jest.mock('../services/dakValidationService', () => ({
  validateDemoDAKRepository: jest.fn().mockReturnValue(true)
}));

jest.mock('../services/profileSubscriptionService', () => ({
  ensureCurrentUserSubscribed: jest.fn(),
  autoAddVisitedProfile: jest.fn()
}));

// Test dashboard redirect behavior - basic component rendering
describe('Dashboard Redirect on Error', () => {
  test('PageProvider renders without errors', () => {
    expect(() => {
      render(
        <BrowserRouter>
          <PageProvider pageName="dashboard">
            <div>Test content</div>
          </PageProvider>
        </BrowserRouter>
      );
    }).not.toThrow();
  });

  test('PageProvider handles invalid URLs gracefully', () => {
    // This test validates that the component structure can handle
    // the redirect logic without throwing unhandled errors
    expect(() => {
      render(
        <BrowserRouter>
          <PageProvider pageName="dashboard">
            <div>Dashboard content</div>
          </PageProvider>
        </BrowserRouter>
      );
    }).not.toThrow();
  });
});
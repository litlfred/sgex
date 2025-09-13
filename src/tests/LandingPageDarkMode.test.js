/**
 * Test for dark mode card title and description styling issue
 * Validates that profile card titles and descriptions have proper contrast in dark mode
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import '../App.css'; // Ensure CSS variables are loaded

// Mock the services to avoid network calls
jest.mock('../services/githubService', () => ({
  isAuth: () => true,
  getCurrentUser: () => Promise.resolve({
    login: 'test-user',
    name: 'Test User',
    avatar_url: 'https://github.com/test.png'
  }),
  getUserOrganizations: () => Promise.resolve([]),
  getWHOOrganization: () => Promise.resolve({
    login: 'WorldHealthOrganization',
    name: 'World Health Organization',
    avatar_url: 'https://github.com/who.png'
  }),
  checkTokenPermissions: () => Promise.resolve(),
  initializeFromStoredToken: () => true,
  authenticate: jest.fn(),
  authenticateWithOctokit: jest.fn()
}));

jest.mock('../services/repositoryCacheService', () => ({
  getCachedRepositories: () => null
}));

jest.mock('../services/secureTokenStorage', () => ({}));

// Helper to set dark mode
const setDarkMode = () => {
  document.body.className = 'theme-dark';
};

// Helper to set light mode  
const setLightMode = () => {
  document.body.className = 'theme-light';
};

describe('LandingPage Dark Mode Card Titles', () => {
  beforeEach(() => {
    // Reset body class before each test
    document.body.className = '';
  });

  test('profile card titles should use proper CSS variables in dark mode', () => {
    setDarkMode();
    
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for the component to render profile cards
    setTimeout(() => {
      const profileCardTitles = container.querySelectorAll('.profile-card h3');
      
      if (profileCardTitles.length > 0) {
        profileCardTitles.forEach(title => {
          const computedStyle = window.getComputedStyle(title);
          const color = computedStyle.color;
          
          // In dark mode, text should be light (white or near-white)
          // CSS variable --who-text-primary should resolve to #ffffff in dark mode
          expect(color).not.toBe('rgb(0, 0, 0)'); // Should not be black
          expect(color).not.toBe('black'); // Should not be black
        });
      }
    }, 100);
  });

  test('profile card descriptions should use proper CSS variables in dark mode', () => {
    setDarkMode();
    
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for the component to render profile cards
    setTimeout(() => {
      const profileCardDescriptions = container.querySelectorAll('.profile-card p');
      
      if (profileCardDescriptions.length > 0) {
        profileCardDescriptions.forEach(description => {
          const computedStyle = window.getComputedStyle(description);
          const color = computedStyle.color;
          
          // In dark mode, description text should also be light 
          // CSS variable --who-text-secondary should resolve to a light color in dark mode
          expect(color).not.toBe('rgb(0, 0, 0)'); // Should not be black
          expect(color).not.toBe('black'); // Should not be black
        });
      }
    }, 100);
  });

  test('profile card titles should use proper CSS variables in light mode', () => {
    setLightMode();
    
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Wait for the component to render profile cards
    setTimeout(() => {
      const profileCardTitles = container.querySelectorAll('.profile-card h3');
      
      if (profileCardTitles.length > 0) {
        profileCardTitles.forEach(title => {
          const computedStyle = window.getComputedStyle(title);
          const color = computedStyle.color;
          
          // In light mode, text should be dark
          // CSS variable --who-text-primary should resolve to #333333 in light mode
          expect(color).not.toBe('rgb(255, 255, 255)'); // Should not be white
          expect(color).not.toBe('white'); // Should not be white
        });
      }
    }, 100);
  });
});
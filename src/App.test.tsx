/**
 * Main Application Component Tests
 * 
 * Tests for the LandingPage component rendering
 * 
 * @module App.test
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './components/LandingPage';

// Mock the GitHub service
jest.mock('./services/githubService');

test('renders SGEX Workbench heading', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  const headingElement = screen.getByRole('heading', { name: /SGEX Workbench/i, level: 1 });
  expect(headingElement).toBeInTheDocument();
});

test('renders WHO SMART Guidelines Exchange subtitle', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  const subtitleElement = screen.getByText(/WHO SMART Guidelines Exchange/i);
  expect(subtitleElement).toBeInTheDocument();
});

test('landing page renders without crashing', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  // Just check that the landing page renders without crashing
  expect(document.body).toBeTruthy();
});

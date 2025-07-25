import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './components/LandingPage';

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
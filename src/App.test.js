import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SGEX Workbench heading', () => {
  render(<App />);
  const linkElement = screen.getByText(/SGEX Workbench/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders WHO SMART Guidelines Exchange subtitle', () => {
  render(<App />);
  const subtitleElement = screen.getByText(/WHO SMART Guidelines Exchange/i);
  expect(subtitleElement).toBeInTheDocument();
});

test('renders documentation links', () => {
  render(<App />);
  const projectPlanLink = screen.getByText(/Project Plan/i);
  const requirementsLink = screen.getByText(/Requirements/i);
  const architectureLink = screen.getByText(/Solution Architecture/i);
  
  expect(projectPlanLink).toBeInTheDocument();
  expect(requirementsLink).toBeInTheDocument();
  expect(architectureLink).toBeInTheDocument();
});
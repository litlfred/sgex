import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProgramIndicators from '../components/ProgramIndicators';

// Mock the Page framework
jest.mock('../components/framework', () => ({
  PageLayout: ({ children }) => <div data-testid="page-layout">{children}</div>,
  usePage: () => ({
    profile: { login: 'WorldHealthOrganization' },
    repository: { name: 'smart-hiv', owner: { login: 'WorldHealthOrganization' } },
    branch: 'main'
  })
}));

// Mock GitHub service
jest.mock('../services/githubService', () => ({
  getDirectoryContents: jest.fn(),
  getFileContent: jest.fn(),
  listBranches: jest.fn()
}));

// Mock ContextualHelpMascot
jest.mock('../components/ContextualHelpMascot', () => {
  return function MockContextualHelpMascot() {
    return <div data-testid="help-mascot">Help Mascot</div>;
  };
});

describe('ProgramIndicators Component', () => {
  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <ProgramIndicators />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading Program Indicators...')).toBeInTheDocument();
  });

  test('renders page layout with correct page name', () => {
    render(
      <BrowserRouter>
        <ProgramIndicators />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });
});
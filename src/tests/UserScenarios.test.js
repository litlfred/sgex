import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserScenarios from '../components/UserScenarios';
import { PageProvider } from '../components/framework/PageProvider';

// Mock the services to avoid external dependencies in tests
jest.mock('../services/githubService', () => ({
  getDirectoryContents: jest.fn(),
  getFileContent: jest.fn(),
  updateFile: jest.fn(),
  createFile: jest.fn()
}));

jest.mock('../services/helpContentService', () => ({
  getHelpTopicsForPage: jest.fn(() => []),
  hasHelpTopics: jest.fn(() => true)
}));

// Mock the lazy-loaded markdown editor
jest.mock('@uiw/react-md-editor', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ value, onChange }) => (
      <textarea 
        data-testid="md-editor"
        value={value} 
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    ),
    Markdown: ({ source }) => <div data-testid="md-preview">{source}</div>
  };
});

describe('UserScenarios Component', () => {
  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <PageProvider>
          <UserScenarios />
        </PageProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading user scenarios...')).toBeInTheDocument();
  });

  test('displays component structure correctly', () => {
    render(
      <MemoryRouter>
        <PageProvider>
          <UserScenarios />
        </PageProvider>
      </MemoryRouter>
    );
    
    // The component should be loading initially (since no auth context)
    expect(screen.getByText('Loading user scenarios...')).toBeInTheDocument();
  });
});
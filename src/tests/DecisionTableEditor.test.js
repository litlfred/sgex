import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import DecisionTableEditor from '../components/DecisionTableEditor';

// Mock the githubService
jest.mock('../services/githubService', () => ({
  getFileContent: jest.fn(),
  updateFile: jest.fn(),
  getDirectoryContents: jest.fn()
}));

const MockedDecisionTableEditor = ({ location = {} }) => (
  <ThemeProvider>
    <BrowserRouter>
      <DecisionTableEditor location={{ state: { ...location } }} />
    </BrowserRouter>
  </ThemeProvider>
);

describe('DecisionTableEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<MockedDecisionTableEditor />);
    expect(screen.getByText('Loading Decision Table Editor...')).toBeInTheDocument();
  });

  test('renders new table editor for "new" tableId', async () => {
    // Mock URL params for new table
    const mockLocation = {
      state: {
        profile: { login: 'testuser', avatar_url: 'test.png' },
        repository: { name: 'testrepo', owner: { login: 'testuser' }, full_name: 'testuser/testrepo' },
        selectedBranch: 'main'
      }
    };

    // Mock useParams to return new table
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({
        user: 'testuser',
        repo: 'testrepo', 
        branch: 'main',
        tableId: 'new'
      })
    }));

    render(<MockedDecisionTableEditor location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText('Decision Table Editor')).toBeInTheDocument();
    });

    expect(screen.getByText('New Decision Table')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Decision Table')).toBeInTheDocument();
  });

  test('handles table metadata input changes', async () => {
    const mockLocation = {
      state: {
        profile: { login: 'testuser', avatar_url: 'test.png' },
        repository: { name: 'testrepo', owner: { login: 'testuser' }, full_name: 'testuser/testrepo' },
        selectedBranch: 'main'
      }
    };

    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({
        user: 'testuser',
        repo: 'testrepo',
        branch: 'main', 
        tableId: 'new'
      })
    }));

    render(<MockedDecisionTableEditor location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText('Decision Table Editor')).toBeInTheDocument();
    });

    // Test table name input
    const nameInput = screen.getByDisplayValue('New Decision Table');
    fireEvent.change(nameInput, { target: { value: 'Test Decision Table' } });
    expect(nameInput.value).toBe('Test Decision Table');

    // Test description textarea
    const descriptionTextarea = screen.getByPlaceholderText('What decision does this table make?');
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });
    expect(descriptionTextarea.value).toBe('Test description');
  });

  test('allows adding new inputs and outputs', async () => {
    const mockLocation = {
      state: {
        profile: { login: 'testuser', avatar_url: 'test.png' },
        repository: { name: 'testrepo', owner: { login: 'testuser' }, full_name: 'testuser/testrepo' },
        selectedBranch: 'main'
      }
    };

    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({
        user: 'testuser',
        repo: 'testrepo',
        branch: 'main',
        tableId: 'new'
      })
    }));

    render(<MockedDecisionTableEditor location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText('Decision Table Editor')).toBeInTheDocument();
    });

    // Initially should have 1 input and 1 output
    expect(screen.getByText('Input 1')).toBeInTheDocument();
    expect(screen.getByText('Output 1')).toBeInTheDocument();

    // Add new input
    const addInputBtn = screen.getByText('+ Add Input');
    fireEvent.click(addInputBtn);
    expect(screen.getByText('Input 2')).toBeInTheDocument();

    // Add new output  
    const addOutputBtn = screen.getByText('+ Add Output');
    fireEvent.click(addOutputBtn);
    expect(screen.getByText('Output 2')).toBeInTheDocument();
  });

  test('allows adding new rules', async () => {
    const mockLocation = {
      state: {
        profile: { login: 'testuser', avatar_url: 'test.png' },
        repository: { name: 'testrepo', owner: { login: 'testuser' }, full_name: 'testuser/testrepo' },
        selectedBranch: 'main'
      }
    };

    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({
        user: 'testuser',
        repo: 'testrepo',
        branch: 'main',
        tableId: 'new'
      })
    }));

    render(<MockedDecisionTableEditor location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText('Decision Table Editor')).toBeInTheDocument();
    });

    // Initially should have 1 rule
    expect(screen.getByText('#')).toBeInTheDocument(); // Rule number header
    
    // Add new rule
    const addRuleBtn = screen.getByText('+ Add Rule');
    fireEvent.click(addRuleBtn);

    // Should now have 2 rows (excluding header)
    const ruleRows = screen.getAllByText(/^[0-9]+$/);
    expect(ruleRows).toHaveLength(2);
  });

  test('shows validation errors for incomplete table', async () => {
    const mockLocation = {
      state: {
        profile: { login: 'testuser', avatar_url: 'test.png' },
        repository: { name: 'testrepo', owner: { login: 'testuser' }, full_name: 'testuser/testrepo' },
        selectedBranch: 'main'
      }
    };

    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({
        user: 'testuser',
        repo: 'testrepo',
        branch: 'main',
        tableId: 'new'
      })
    }));

    render(<MockedDecisionTableEditor location={mockLocation} />);

    await waitFor(() => {
      expect(screen.getByText('Decision Table Editor')).toBeInTheDocument();
    });

    // Clear the table name to trigger validation error
    const nameInput = screen.getByDisplayValue('New Decision Table');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Try to save
    const saveBtn = screen.getByText('Save Table');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Please fix the following errors:')).toBeInTheDocument();
      expect(screen.getByText('Table name is required')).toBeInTheDocument();
    });
  });
});
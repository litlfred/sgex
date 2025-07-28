import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DecisionSupportLogicView from '../components/DecisionSupportLogicView';
import githubService from '../services/githubService';

// Mock the GitHub service
jest.mock('../services/githubService', () => ({
  getFileContent: jest.fn(),
  getDirectoryContents: jest.fn(),
  isAuth: jest.fn().mockReturnValue(false)
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({
    user: 'testuser',
    repo: 'test-dak',
    branch: 'main'
  }),
  useLocation: () => ({
    state: null
  })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DecisionSupportLogicView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful responses
    githubService.getFileContent.mockImplementation((owner, repo, path) => {
      if (path === 'input/fsh/codesystems/DAK.fsh') {
        return Promise.resolve(`
CodeSystem: DAK_DT
Title: "Decision Table"
Description: "Variables and logic for DAK decision tables"

* #VAR001 "Patient Age" 
  * definition = "The age of the patient in years"
  * #table = "Demographics"
  * #tab = "Basic Info"
  * #CQL = "define \\"Patient Age\\":\\n  AgeInYears()"

* #VAR002 "BMI Category"
  * definition = "Body Mass Index categorization"
  * #table = "Clinical"
  * #tab = "Vitals"
  * #CQL = "define \\"BMI Category\\":\\n  case when BMI < 18.5 then 'Underweight' else 'Normal' end"
        `);
      }
      return Promise.reject(new Error('File not found'));
    });

    githubService.getDirectoryContents.mockResolvedValue([
      {
        name: 'test-decision.dmn',
        type: 'file',
        path: 'input/dmn/test-decision.dmn',
        download_url: 'https://raw.githubusercontent.com/testuser/test-dak/main/input/dmn/test-decision.dmn',
        html_url: 'https://github.com/testuser/test-dak/blob/main/input/dmn/test-decision.dmn',
        size: 2048
      }
    ]);
  });

  it('renders loading state initially', async () => {
    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    expect(screen.getByText('Loading Decision Support Logic...')).toBeInTheDocument();
  });

  it('renders decision support logic view with variables and decision tables', async () => {
    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('🎯 Decision Support Logic')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check variables section
    expect(screen.getByText('📊 Variables')).toBeInTheDocument();
    expect(screen.getByText('Patient Age')).toBeInTheDocument();
    expect(screen.getByText('BMI Category')).toBeInTheDocument();

    // Check decision tables section
    expect(screen.getByText('📋 Decision Tables')).toBeInTheDocument();
    expect(screen.getByText('test-decision')).toBeInTheDocument();
  });

  it('supports searching variables', async () => {
    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    await waitFor(() => {
      expect(screen.getByText('Patient Age')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Find search input and search for "BMI"
    const searchInput = screen.getByPlaceholderText('Search variables...');
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'BMI' } });
    });

    // Should show only BMI variable
    await waitFor(() => {
      expect(screen.getByText('BMI Category')).toBeInTheDocument();
      expect(screen.queryByText('Patient Age')).not.toBeInTheDocument();
    });
  });

  it('supports sorting variables by different columns', async () => {
    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    await waitFor(() => {
      expect(screen.getByText('Patient Age')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Click on Display column header to sort
    const displayHeader = screen.getByText('Display');
    
    await act(async () => {
      fireEvent.click(displayHeader);
    });

    // Should show sort indicator
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('displays CQL code in formatted blocks', async () => {
    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    await waitFor(() => {
      expect(screen.getByText('Patient Age')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check for CQL code blocks
    const cqlBlocks = screen.getAllByRole('cell');
    const cqlBlock = cqlBlocks.find(cell => cell.textContent.includes('AgeInYears()'));
    expect(cqlBlock).toBeInTheDocument();
  });

  it('shows fallback data when DAK.DT.fsh is not found', async () => {
    githubService.getFileContent.mockRejectedValue(new Error('File not found'));

    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    await waitFor(() => {
      expect(screen.getByText('🎯 Decision Support Logic')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Should show fallback variables
    expect(screen.getByText('VAR001')).toBeInTheDocument();
    expect(screen.getByText('VAR002')).toBeInTheDocument();
    expect(screen.getByText('VAR003')).toBeInTheDocument();
  });

  it('handles decision table actions correctly', async () => {
    // Mock fetch for DMN source dialog
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('<?xml version="1.0" encoding="UTF-8"?>\n<definitions>Test DMN</definitions>')
      })
    );

    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    await waitFor(() => {
      expect(screen.getByText('test-decision')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Click "View Source" button
    const viewSourceButton = screen.getByText('📄 View Source');
    
    await act(async () => {
      fireEvent.click(viewSourceButton);
    });

    // Should open dialog
    await waitFor(() => {
      expect(screen.getByText('test-decision.dmn Source')).toBeInTheDocument();
      expect(screen.getByText('Test DMN')).toBeInTheDocument();
    });

    // Close dialog
    const closeButton = screen.getByText('Close');
    
    await act(async () => {
      fireEvent.click(closeButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('test-decision.dmn Source')).not.toBeInTheDocument();
    });
  });

  it('displays proper breadcrumb navigation', async () => {
    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    await waitFor(() => {
      expect(screen.getByText('🎯 Decision Support Logic')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check breadcrumb elements
    expect(screen.getByText('Select Profile')).toBeInTheDocument();
    expect(screen.getByText('DAK Components')).toBeInTheDocument();
    expect(screen.getByText('Decision Support Logic')).toBeInTheDocument();
  });

  it('handles navigation correctly', async () => {
    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    await waitFor(() => {
      expect(screen.getByText('🎯 Decision Support Logic')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Click on breadcrumb link
    const profileLink = screen.getByText('Select Profile');
    
    await act(async () => {
      fireEvent.click(profileLink);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows empty state when no decision tables are found', async () => {
    githubService.getDirectoryContents.mockRejectedValue(new Error('Directory not found'));

    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    await waitFor(() => {
      expect(screen.getByText('🎯 Decision Support Logic')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Should show no tables message
    expect(screen.getByText('No decision tables found in the input/dmn directory.')).toBeInTheDocument();
  });

  it('displays results count correctly', async () => {
    await act(async () => {
      renderWithRouter(<DecisionSupportLogicView />);
    });

    await waitFor(() => {
      expect(screen.getByText('Patient Age')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Should show count of variables
    expect(screen.getByText('2 variables found')).toBeInTheDocument();

    // Search to reduce count
    const searchInput = screen.getByPlaceholderText('Search variables...');
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Patient' } });
    });

    await waitFor(() => {
      expect(screen.getByText('1 variable found')).toBeInTheDocument();
    });
  });

  afterEach(() => {
    if (global.fetch && global.fetch.mockRestore) {
      global.fetch.mockRestore();
    }
  });
});
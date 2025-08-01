import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompactBranchSelector from './CompactBranchSelector';
import githubService from '../services/githubService';

// Mock the githubService
jest.mock('../services/githubService');

const mockRepository = {
  name: 'test-repo',
  owner: { login: 'test-user' },
  default_branch: 'main'
};

const mockBranches = [
  { name: 'main' },
  { name: 'feature-branch' },
  { name: 'bugfix-branch' },
  { name: 'develop' }
];

describe('CompactBranchSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading state initially', () => {
    githubService.getBranches.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <CompactBranchSelector
        repository={mockRepository}
        selectedBranch="main"
        onBranchChange={jest.fn()}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays branches in alphabetical order', async () => {
    githubService.getBranches.mockResolvedValue(mockBranches);
    
    render(
      <CompactBranchSelector
        repository={mockRepository}
        selectedBranch="main"
        onBranchChange={jest.fn()}
      />
    );

    // Wait for branches to load
    await waitFor(() => {
      expect(screen.getByText('main')).toBeInTheDocument();
    });

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Check that branches are displayed in alphabetical order
    const branchItems = screen.getAllByRole('option');
    const branchNames = branchItems.map(item => item.textContent.split('default')[0].trim());
    
    expect(branchNames).toEqual(['bugfix-branch', 'develop', 'feature-branch', 'main']);
  });

  test('filters branches based on search term', async () => {
    githubService.getBranches.mockResolvedValue(mockBranches);
    
    render(
      <CompactBranchSelector
        repository={mockRepository}
        selectedBranch="main"
        onBranchChange={jest.fn()}
      />
    );

    // Wait for branches to load
    await waitFor(() => {
      expect(screen.getByText('main')).toBeInTheDocument();
    });

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search branches...');
    fireEvent.change(searchInput, { target: { value: 'feature' } });

    // Check that only feature-branch is shown
    await waitFor(() => {
      expect(screen.getByText('feature-branch')).toBeInTheDocument();
      expect(screen.queryByText('develop')).not.toBeInTheDocument();
      expect(screen.queryByText('bugfix-branch')).not.toBeInTheDocument();
    });
  });

  test('calls onBranchChange when a branch is selected', async () => {
    const mockOnBranchChange = jest.fn();
    githubService.getBranches.mockResolvedValue(mockBranches);
    
    render(
      <CompactBranchSelector
        repository={mockRepository}
        selectedBranch="main"
        onBranchChange={mockOnBranchChange}
      />
    );

    // Wait for branches to load
    await waitFor(() => {
      expect(screen.getByText('main')).toBeInTheDocument();
    });

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click on a different branch
    fireEvent.click(screen.getByText('develop'));

    expect(mockOnBranchChange).toHaveBeenCalledWith('develop');
  });

  test('displays error state when branch loading fails', async () => {
    githubService.getBranches.mockRejectedValue(new Error('API Error'));
    
    render(
      <CompactBranchSelector
        repository={mockRepository}
        selectedBranch="main"
        onBranchChange={jest.fn()}
      />
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  test('highlights the default branch', async () => {
    githubService.getBranches.mockResolvedValue(mockBranches);
    
    render(
      <CompactBranchSelector
        repository={mockRepository}
        selectedBranch="main"
        onBranchChange={jest.fn()}
      />
    );

    // Wait for branches to load
    await waitFor(() => {
      expect(screen.getByText('main')).toBeInTheDocument();
    });

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Check that the default branch has a "default" badge
    expect(screen.getByText('default')).toBeInTheDocument();
  });

  test('closes dropdown when clicking outside', async () => {
    githubService.getBranches.mockResolvedValue(mockBranches);
    
    render(
      <div>
        <CompactBranchSelector
          repository={mockRepository}
          selectedBranch="main"
          onBranchChange={jest.fn()}
        />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    // Wait for branches to load
    await waitFor(() => {
      expect(screen.getByText('main')).toBeInTheDocument();
    });

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByPlaceholderText('Search branches...')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search branches...')).not.toBeInTheDocument();
    });
  });
});
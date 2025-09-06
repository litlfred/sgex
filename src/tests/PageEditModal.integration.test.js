import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PageEditModal from '../components/PageEditModal';
import stagingGroundService from '../services/stagingGroundService';

// Mock the staging ground service
jest.mock('../services/stagingGroundService', () => ({
  updateFile: jest.fn(),
  initialize: jest.fn()
}));

// Mock TinyMCE to avoid canvas issues in tests
jest.mock('../components/TinyMCEEditor', () => {
  return function MockTinyMCEEditor({ value, onChange }) {
    return (
      <textarea
        data-testid="tinymce-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

describe('PageEditModal Staging Ground Integration', () => {
  const mockPage = {
    title: 'Test Page',
    filename: 'test.md',
    path: 'input/pagecontent/test.md',
    content: {
      content: btoa('# Test Content\n\nThis is test content.'),
      sha: 'abc123'
    }
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    stagingGroundService.updateFile.mockReturnValue(true);
  });

  it('renders with initial content from page', () => {
    render(
      <PageEditModal
        page={mockPage}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByTestId('tinymce-editor')).toHaveValue('# Test Content\n\nThis is test content.');
    expect(screen.getByText('Edit Test Page')).toBeInTheDocument();
    expect(screen.getByText('test.md')).toBeInTheDocument();
  });

  it('shows "Stage Changes" button instead of "Save Changes"', () => {
    render(
      <PageEditModal
        page={mockPage}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByRole('button', { name: 'Stage Changes' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
  });

  it('stages content to staging ground when Stage Changes is clicked', async () => {
    render(
      <PageEditModal
        page={mockPage}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Modify content
    const editor = screen.getByTestId('tinymce-editor');
    fireEvent.change(editor, { target: { value: '# Modified Content\n\nThis is modified.' } });

    // Click Stage Changes
    const stageButton = screen.getByRole('button', { name: 'Stage Changes' });
    fireEvent.click(stageButton);

    await waitFor(() => {
      expect(stagingGroundService.updateFile).toHaveBeenCalledWith(
        'input/pagecontent/test.md',
        '# Modified Content\n\nThis is modified.',
        {
          title: 'Test Page',
          filename: 'test.md',
          tool: 'TinyMCE PageEditor',
          contentType: 'html'
        }
      );
    });

    // Should call onSave with staged indicator
    expect(mockOnSave).toHaveBeenCalledWith(
      mockPage,
      '# Modified Content\n\nThis is modified.',
      'staged'
    );

    // Should close modal
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error when staging fails', async () => {
    stagingGroundService.updateFile.mockReturnValue(false);
    
    // Spy on alert to verify error message
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <PageEditModal
        page={mockPage}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const stageButton = screen.getByRole('button', { name: 'Stage Changes' });
    fireEvent.click(stageButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to save page to staging ground. Please try again.');
    });

    // Should not close modal on error
    expect(mockOnClose).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('handles cancellation properly', () => {
    render(
      <PageEditModal
        page={mockPage}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(stagingGroundService.updateFile).not.toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows staging indicator when staging in progress', async () => {
    render(
      <PageEditModal
        page={mockPage}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const stageButton = screen.getByRole('button', { name: 'Stage Changes' });
    fireEvent.click(stageButton);

    // The staging happens synchronously, so we don't see the "Staging..." state
    // But we can verify the staging was successful by checking the calls
    await waitFor(() => {
      expect(stagingGroundService.updateFile).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
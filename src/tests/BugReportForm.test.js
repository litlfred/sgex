import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BugReportForm from '../components/BugReportForm';
import bugReportService from '../services/bugReportService';
import githubService from '../services/githubService';

// Mock the services
jest.mock('../services/bugReportService');
jest.mock('../services/githubService');

const mockTemplates = [
  {
    id: 'bug_report',
    name: 'Bug Report',
    description: 'File a bug report to help us improve',
    title: '[Bug]: ',
    labels: ['bug'],
    type: 'bug',
    body: [
      {
        type: 'textarea',
        id: 'what-happened',
        attributes: {
          label: 'What happened?',
          description: 'A clear description of what the bug is.'
        },
        validations: {
          required: true
        }
      },
      {
        type: 'textarea',
        id: 'expected',
        attributes: {
          label: 'Expected behavior',
          description: 'What did you expect to happen?'
        },
        validations: {
          required: true
        }
      }
    ]
  },
  {
    id: 'feature_request',
    name: 'Feature Request',
    description: 'Suggest an idea for this project',
    title: '[Feature]: ',
    labels: ['enhancement'],
    type: 'feature',
    body: [
      {
        type: 'textarea',
        id: 'description',
        attributes: {
          label: 'Feature Description',
          description: 'A clear description of what you want to happen.'
        },
        validations: {
          required: true
        }
      }
    ]
  }
];

describe('BugReportForm', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock bugReportService methods
    bugReportService.getTemplates.mockResolvedValue(mockTemplates);
    bugReportService.captureConsoleOutput.mockReturnValue({
      getLogs: jest.fn().mockReturnValue(''),
      stop: jest.fn()
    });
    bugReportService.submitIssue.mockResolvedValue({
      success: true,
      issue: {
        id: 123,
        number: 456,
        title: 'Test Issue',
        html_url: 'https://github.com/litlfred/sgex/issues/456'
      }
    });
    bugReportService.generateIssueUrl.mockReturnValue('https://github.com/litlfred/sgex/issues/new?template=bug_report.yml');
    
    // Mock githubService
    githubService.isAuthenticated = false;
  });

  test('renders loading state initially', () => {
    bugReportService.getTemplates.mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(<BugReportForm onClose={jest.fn()} />);
    
    expect(screen.getByText('Loading Bug Report Templates...')).toBeInTheDocument();
  });

  test('loads and displays templates', async () => {
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Check that template selection is available
    expect(screen.getByLabelText(/Issue Type/)).toBeInTheDocument();
    
    // Check that Bug Report template is auto-selected
    await waitFor(() => {
      const select = screen.getByLabelText(/Issue Type/);
      expect(select.value).toBe('bug_report');
    });
  });

  test('auto-enables console output for bug reports', async () => {
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Wait for template auto-selection
    await waitFor(() => {
      const select = screen.getByLabelText(/Issue Type/);
      expect(select.value).toBe('bug_report');
    });
    
    // Console checkbox should be checked for bug reports
    const consoleCheckbox = screen.getByLabelText(/Include JavaScript console output/);
    expect(consoleCheckbox).toBeChecked();
  });

  test('disables console output for feature requests', async () => {
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Change to feature request
    const select = screen.getByLabelText(/Issue Type/);
    fireEvent.change(select, { target: { value: 'feature_request' } });
    
    // Console checkbox should not be checked
    const consoleCheckbox = screen.getByLabelText(/Include JavaScript console output/);
    expect(consoleCheckbox).not.toBeChecked();
  });

  test('renders form fields based on selected template', async () => {
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Wait for template auto-selection
    await waitFor(() => {
      const select = screen.getByLabelText(/Issue Type/);
      expect(select.value).toBe('bug_report');
    });
    
    // Should show bug report fields
    await waitFor(() => {
      expect(screen.getByLabelText(/What happened?/)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Expected behavior/)).toBeInTheDocument();
  });

  test('updates form fields when template changes', async () => {
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Change to feature request
    const select = screen.getByLabelText(/Issue Type/);
    fireEvent.change(select, { target: { value: 'feature_request' } });
    
    // Should show feature request fields
    expect(screen.getByLabelText(/Feature Description/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/What happened?/)).not.toBeInTheDocument();
  });

  test('shows authentication status for unauthenticated users', async () => {
    githubService.isAuthenticated = false;
    
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Not authenticated - Issue will open in GitHub/)).toBeInTheDocument();
    expect(screen.getByText('Open in GitHub')).toBeInTheDocument();
  });

  test('shows authentication status for authenticated users', async () => {
    githubService.isAuthenticated = true;
    
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Authenticated - Issues will be submitted directly/)).toBeInTheDocument();
    expect(screen.getByText('Submit Issue')).toBeInTheDocument();
  });

  test('submits issue via API when authenticated', async () => {
    githubService.isAuthenticated = true;
    
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Wait for template auto-selection and fields to render
    await waitFor(() => {
      expect(screen.getByLabelText(/What happened?/)).toBeInTheDocument();
    });
    
    // Fill out form
    const whatHappenedField = screen.getByLabelText(/What happened?/);
    fireEvent.change(whatHappenedField, { target: { value: 'Something went wrong' } });
    
    const expectedField = screen.getByLabelText(/Expected behavior/);
    fireEvent.change(expectedField, { target: { value: 'It should work' } });
    
    // Submit form
    const submitButton = screen.getByText('Submit Issue');
    fireEvent.click(submitButton);
    
    // Should call submit service
    await waitFor(() => {
      expect(bugReportService.submitIssue).toHaveBeenCalled();
    });
  });

  test('handles form validation for required fields', async () => {
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText('Open in GitHub');
    fireEvent.click(submitButton);
    
    // Form should not submit (HTML5 validation will handle this)
    expect(bugReportService.submitIssue).not.toHaveBeenCalled();
  });

  test('closes form when close button is clicked', async () => {
    const onClose = jest.fn();
    render(<BugReportForm onClose={onClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByLabelText('Close bug report form');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  test('shows success message after successful submission', async () => {
    githubService.isAuthenticated = true;
    
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Wait for template auto-selection and fields to render
    await waitFor(() => {
      expect(screen.getByLabelText(/What happened?/)).toBeInTheDocument();
    });
    
    // Fill out form
    const whatHappenedField = screen.getByLabelText(/What happened?/);
    fireEvent.change(whatHappenedField, { target: { value: 'Something went wrong' } });
    
    const expectedField = screen.getByLabelText(/Expected behavior/);
    fireEvent.change(expectedField, { target: { value: 'It should work' } });
    
    // Submit form
    const submitButton = screen.getByText('Submit Issue');
    fireEvent.click(submitButton);
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Issue Submitted Successfully!')).toBeInTheDocument();
      expect(screen.getByText(/Issue #456 has been created successfully!/)).toBeInTheDocument();
    });
  });

  test('handles API submission errors gracefully', async () => {
    githubService.isAuthenticated = true;
    bugReportService.submitIssue.mockResolvedValue({
      success: false,
      error: {
        message: 'Permission denied',
        type: 'permission_denied'
      }
    });
    
    render(<BugReportForm onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    });
    
    // Wait for template auto-selection and fields to render
    await waitFor(() => {
      expect(screen.getByLabelText(/What happened?/)).toBeInTheDocument();
    });
    
    // Fill out form
    const whatHappenedField = screen.getByLabelText(/What happened?/);
    fireEvent.change(whatHappenedField, { target: { value: 'Something went wrong' } });
    
    // Submit form
    const submitButton = screen.getByText('Submit Issue');
    fireEvent.click(submitButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Permission denied/)).toBeInTheDocument();
    });
  });
});
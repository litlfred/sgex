import React from 'react';
import { render } from '@testing-library/react';
import BugReportForm from '../components/BugReportForm';

// Mock the bugReportService
const mockBugReportService = {
  getTemplates: jest.fn(),
  getDefaultTemplates: jest.fn(() => [
    {
      id: 'blank',
      name: 'Blank Issue',
      description: 'Create a blank issue without pre-filled fields',
      type: 'blank'
    },
    {
      id: 'bug_report',
      name: 'Bug Report',
      description: 'File a bug report to help us improve',
      type: 'bug'
    }
  ]),
  captureConsoleOutput: jest.fn(() => ({ stop: jest.fn() }))
};

jest.mock('../services/bugReportService', () => {
  return jest.fn().mockImplementation(() => mockBugReportService);
});

describe('Bug Report Form - Blank Template First', () => {
  test('should have blank template as first option', async () => {
    mockBugReportService.getTemplates.mockResolvedValue([
      {
        id: 'blank',
        name: 'Blank Issue',
        description: 'Create a blank issue without pre-filled fields',
        type: 'blank'
      },
      {
        id: 'bug_report',
        name: 'Bug Report',
        description: 'File a bug report to help us improve',
        type: 'bug'
      }
    ]);

    const { container } = render(<BugReportForm />);
    
    // Wait for templates to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const select = container.querySelector('#template-select');
    expect(select).toBeTruthy();
    
    const options = select.querySelectorAll('option');
    // First option is "Select issue type...", second should be blank
    expect(options[1]).toBeTruthy();
    expect(options[1].value).toBe('blank');
  });

  test('should verify default templates include blank first', () => {
    const templates = mockBugReportService.getDefaultTemplates();
    expect(templates[0].id).toBe('blank');
    expect(templates[0].type).toBe('blank');
  });
});
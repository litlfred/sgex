import React from 'react';
import { render, screen } from '@testing-library/react';
import HelpModal from '../components/HelpModal';

// Mock window.open
const mockOpen = jest.fn();
global.window.open = mockOpen;

describe('HelpModal - Blank Bug Report Integration', () => {
  beforeEach(() => {
    mockOpen.mockClear();
  });

  test('should handle blank SGEX issue creation correctly', () => {
    const contextData = {
      pageId: 'test-page',
      selectedDak: { name: 'test-dak' }
    };

    render(
      <HelpModal
        topic="test"
        contextData={contextData}
        onClose={() => {}}
      />
    );

    // Check if helpModalInstance is set up correctly
    expect(window.helpModalInstance).toBeDefined();
    expect(window.helpModalInstance.openSgexIssue).toBeDefined();

    // Test blank issue creation
    window.helpModalInstance.openSgexIssue('blank');

    // Verify correct URL is generated for blank issues
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('https://github.com/litlfred/sgex/issues/new'),
      '_blank'
    );
    
    const callUrl = mockOpen.mock.calls[0][0];
    expect(callUrl).toContain('labels=blank-issue');
    expect(callUrl).toContain('template=blank.yml'); // Blank template should be specified
  });

  test('should handle blank DAK issue creation correctly', () => {
    const contextData = {
      pageId: 'test-page',
      repository: {
        owner: 'test-owner',
        name: 'test-repo'
      }
    };

    render(
      <HelpModal
        topic="test"
        contextData={contextData}
        onClose={() => {}}
      />
    );

    // Test blank DAK issue creation
    window.helpModalInstance.openDakIssue('blank');

    // Verify correct URL is generated for blank DAK issues
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('https://github.com/test-owner/test-repo/issues/new'),
      '_blank'
    );
    
    const callUrl = mockOpen.mock.calls[0][0];
    expect(callUrl).toContain('labels=blank-issue%2Cdak-feedback');
    expect(callUrl).toContain('template=blank.yml'); // Blank template should be specified
  });
});
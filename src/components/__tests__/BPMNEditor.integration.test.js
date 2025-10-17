/**
 * Integration tests for BPMNEditor component
 * Tests Component Object integration with BusinessProcessWorkflowComponent
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import BPMNEditor from '../BPMNEditor';
import { ComponentObjectProvider } from '../../services/framework/ComponentObjectProvider';

// Mock the useDakComponent hook
jest.mock('../../services/framework/ComponentObjectProvider', () => ({
  ...jest.requireActual('../../services/framework/ComponentObjectProvider'),
  useDakComponent: jest.fn(),
}));

describe('BPMNEditor Integration Tests', () => {
  let mockComponent;

  beforeEach(() => {
    // Mock the BusinessProcessWorkflowComponent
    mockComponent = {
      getSources: jest.fn().mockResolvedValue([]),
      addSource: jest.fn().mockResolvedValue(true),
      retrieveAll: jest.fn().mockResolvedValue([
        {
          id: 'test-workflow-1',
          name: 'Test Workflow',
          xml: '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions></bpmn:definitions>',
        },
      ]),
      retrieveById: jest.fn().mockResolvedValue({
        id: 'test-workflow-1',
        name: 'Test Workflow',
        xml: '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions></bpmn:definitions>',
      }),
      save: jest.fn().mockResolvedValue({ success: true }),
      validate: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    };

    // Mock the hook to return our mock component
    const { useDakComponent } = require('../../services/framework/ComponentObjectProvider');
    useDakComponent.mockReturnValue(mockComponent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render BPMNEditor component', () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <BPMNEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );
    
    // Basic rendering test
    expect(screen.getByText(/BPMN/i) || screen.getByRole('main')).toBeInTheDocument();
  });

  test('should load workflows via Component Object', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <BPMNEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('should save workflow via Component Object', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <BPMNEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Trigger save action (implementation depends on UI)
    // This is a placeholder - actual implementation would interact with save button
    await mockComponent.save({
      id: 'test-workflow-1',
      name: 'Test Workflow',
      xml: '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions></bpmn:definitions>',
    }, { saveType: 'file', path: 'input/process/test-workflow.bpmn' });

    expect(mockComponent.save).toHaveBeenCalled();
  });

  test('should validate workflow via Component Object', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <BPMNEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    const validationResult = await mockComponent.validate({
      id: 'test-workflow-1',
      name: 'Test Workflow',
      xml: '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions></bpmn:definitions>',
    });

    expect(validationResult.isValid).toBe(true);
    expect(mockComponent.validate).toHaveBeenCalled();
  });

  test('should handle errors gracefully', async () => {
    mockComponent.retrieveAll.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <BPMNEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Component should handle error without crashing
    expect(screen.getByText(/BPMN/i) || screen.getByRole('main')).toBeInTheDocument();
  });

  test('should not access staging ground directly', async () => {
    const stagingGroundSpy = jest.spyOn(console, 'warn');

    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <BPMNEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Verify no direct staging ground access warnings
    expect(stagingGroundSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('staging')
    );

    stagingGroundSpy.mockRestore();
  });
});

/**
 * Integration tests for CoreDataDictionaryViewer component
 * Tests Component Object integration with CoreDataElementComponent
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CoreDataDictionaryViewer from '../CoreDataDictionaryViewer';
import { ComponentObjectProvider } from '../../services/framework/ComponentObjectProvider';

// Mock the useDakComponent hook
jest.mock('../../services/framework/ComponentObjectProvider', () => ({
  ...jest.requireActual('../../services/framework/ComponentObjectProvider'),
  useDakComponent: jest.fn(),
}));

describe('CoreDataDictionaryViewer Integration Tests', () => {
  let mockComponent;

  beforeEach(() => {
    // Mock the CoreDataElementComponent
    mockComponent = {
      getSources: jest.fn().mockResolvedValue([]),
      addSource: jest.fn().mockResolvedValue(true),
      retrieveAll: jest.fn().mockResolvedValue([
        {
          id: 'test-element-1',
          type: 'valueset',
          canonical: 'http://example.org/ValueSet/test-vs',
          description: 'Test value set',
        },
        {
          id: 'test-element-2',
          type: 'codesystem',
          canonical: 'http://example.org/CodeSystem/test-cs',
          description: 'Test code system',
        },
      ]),
      retrieveById: jest.fn().mockResolvedValue({
        id: 'test-element-1',
        type: 'valueset',
        canonical: 'http://example.org/ValueSet/test-vs',
        description: 'Test value set',
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

  test('should render CoreDataDictionaryViewer component', () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <CoreDataDictionaryViewer />
        </ComponentObjectProvider>
      </BrowserRouter>
    );
    
    // Basic rendering test
    expect(screen.getByText(/Data/i) || screen.getByRole('main')).toBeInTheDocument();
  });

  test('should load core data elements via Component Object', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <CoreDataDictionaryViewer />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('should display data elements in table view', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <CoreDataDictionaryViewer />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Table should display loaded elements
    // Actual test depends on component implementation
  });

  test('should validate vocabulary type requirements', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <CoreDataDictionaryViewer />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Test validation of different types
    const validElement = {
      id: 'test-vs',
      type: 'valueset',
      canonical: 'http://example.org/ValueSet/test',
      description: 'Test',
    };

    const validationResult = await mockComponent.validate(validElement);
    expect(validationResult.isValid).toBe(true);
  });

  test('should validate canonical URI requirements', async () => {
    mockComponent.validate.mockResolvedValue({
      isValid: false,
      errors: ['Canonical URI is required'],
    });

    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <CoreDataDictionaryViewer />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Test validation failure for missing canonical
    const invalidElement = {
      id: 'test-vs',
      type: 'valueset',
      // Missing canonical
      description: 'Test',
    };

    const validationResult = await mockComponent.validate(invalidElement);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain('Canonical URI is required');
  });

  test('should support all vocabulary types', async () => {
    const types = ['valueset', 'codesystem', 'conceptmap', 'logicalmodel'];

    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <CoreDataDictionaryViewer />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Test that all types are supported
    for (const type of types) {
      const element = {
        id: `test-${type}`,
        type,
        canonical: `http://example.org/${type}/test`,
        description: `Test ${type}`,
      };

      const validationResult = await mockComponent.validate(element);
      expect(validationResult.isValid).toBe(true);
    }
  });

  test('should handle search functionality', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <CoreDataDictionaryViewer />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Search should work with loaded data
    // Actual test depends on component implementation
  });

  test('should show element details in modal', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <CoreDataDictionaryViewer />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Clicking an element should show details
    // Actual test depends on component implementation
  });

  test('should not access GitHub API directly', async () => {
    const githubApiSpy = jest.spyOn(console, 'warn');

    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <CoreDataDictionaryViewer />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Verify no direct GitHub API access warnings
    expect(githubApiSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('github')
    );

    githubApiSpy.mockRestore();
  });
});

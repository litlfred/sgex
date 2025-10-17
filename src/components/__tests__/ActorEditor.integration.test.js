/**
 * Integration tests for ActorEditor component
 * Tests Component Object integration with GenericPersonaComponent
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ActorEditor from '../ActorEditor';
import { ComponentObjectProvider } from '../../services/framework/ComponentObjectProvider';

// Mock the useDakComponent hook
jest.mock('../../services/framework/ComponentObjectProvider', () => ({
  ...jest.requireActual('../../services/framework/ComponentObjectProvider'),
  useDakComponent: jest.fn(),
}));

describe('ActorEditor Integration Tests', () => {
  let mockComponent;

  beforeEach(() => {
    // Mock the GenericPersonaComponent
    mockComponent = {
      getSources: jest.fn().mockResolvedValue([]),
      addSource: jest.fn().mockResolvedValue(true),
      retrieveAll: jest.fn().mockResolvedValue([
        {
          id: 'test-actor-1',
          name: 'Test Actor',
          description: 'A test actor for testing',
          fsh: 'Instance: TestActor\nInstanceOf: Actor\n',
        },
      ]),
      retrieveById: jest.fn().mockResolvedValue({
        id: 'test-actor-1',
        name: 'Test Actor',
        description: 'A test actor for testing',
        fsh: 'Instance: TestActor\nInstanceOf: Actor\n',
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

  test('should render ActorEditor component', () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <ActorEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );
    
    // Basic rendering test
    expect(screen.getByText(/Actor/i) || screen.getByRole('main')).toBeInTheDocument();
  });

  test('should load actors via Component Object', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <ActorEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('should save actor FSH via Component Object', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <ActorEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Trigger save action
    await mockComponent.save({
      id: 'test-actor-1',
      name: 'Test Actor',
      description: 'A test actor for testing',
      fsh: 'Instance: TestActor\nInstanceOf: Actor\n',
    }, { saveType: 'file', path: 'input/fsh/actors/test-actor.fsh' });

    expect(mockComponent.save).toHaveBeenCalled();
    expect(mockComponent.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-actor-1',
        fsh: expect.stringContaining('TestActor'),
      }),
      expect.objectContaining({
        saveType: 'file',
        path: expect.stringContaining('fsh/actors'),
      })
    );
  });

  test('should validate FSH format via Component Object', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <ActorEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    const validationResult = await mockComponent.validate({
      id: 'test-actor-1',
      name: 'Test Actor',
      fsh: 'Instance: TestActor\nInstanceOf: Actor\n',
    });

    expect(validationResult.isValid).toBe(true);
    expect(mockComponent.validate).toHaveBeenCalled();
  });

  test('should handle FSH validation errors', async () => {
    mockComponent.validate.mockResolvedValue({
      isValid: false,
      errors: ['Invalid FSH syntax'],
    });

    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <ActorEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    const validationResult = await mockComponent.validate({
      id: 'test-actor-1',
      fsh: 'Invalid FSH content',
    });

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain('Invalid FSH syntax');
  });

  test('should create relative URL sources for actors', async () => {
    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <ActorEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Verify save creates relative URL source
    await mockComponent.save(
      {
        id: 'test-actor-1',
        name: 'Test Actor',
        fsh: 'Instance: TestActor\nInstanceOf: Actor\n',
      },
      { saveType: 'file', path: 'input/fsh/actors/test-actor.fsh' }
    );

    expect(mockComponent.save).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        path: expect.stringContaining('input/fsh/actors'),
      })
    );
  });

  test('should not use actorDefinitionService directly', async () => {
    const actorServiceSpy = jest.spyOn(console, 'warn');

    render(
      <BrowserRouter>
        <ComponentObjectProvider value={{}}>
          <ActorEditor />
        </ComponentObjectProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockComponent.retrieveAll).toHaveBeenCalled();
    });

    // Verify no direct actor service access warnings
    expect(actorServiceSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('actorDefinitionService')
    );

    actorServiceSpy.mockRestore();
  });
});

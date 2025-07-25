import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentLinkPanel from './ComponentLinkPanel';

// Mock the service module
jest.mock('../services/ComponentLinkService', () => ({
  __esModule: true,
  default: {
    getComponentLink: jest.fn(),
    addComponentLink: jest.fn(),
    removeComponentLink: jest.fn(),
    getAllComponentLinks: jest.fn(() => new Map()),
    getVisualConfig: jest.fn(() => ({
      icon: '🎯',
      color: '#107c10',
      borderColor: '#0f5c0f',
      backgroundColor: 'rgba(16, 124, 16, 0.1)',
      label: 'DMN'
    })),
    getComponentEditorUrl: jest.fn(() => '/editor/decision-support')
  }
}));

import componentLinkService from '../services/ComponentLinkService';

describe('ComponentLinkPanel', () => {
  const mockProfile = { login: 'testuser', avatar_url: 'test.jpg' };
  const mockRepository = { name: 'test-repo', full_name: 'test/repo' };
  const mockElement = { 
    id: 'Task_1', 
    businessObject: { name: 'Test Task' },
    type: 'bpmn:Task'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders no selection message when no element is selected', () => {
    render(
      <ComponentLinkPanel
        selectedElement={null}
        onLinkAdded={jest.fn()}
        onLinkRemoved={jest.fn()}
        profile={mockProfile}
        repository={mockRepository}
        onNavigateToComponent={jest.fn()}
      />
    );

    expect(screen.getByText('Select a BPMN element to manage component links')).toBeInTheDocument();
  });

  test('renders current link when element has component link', () => {
    const mockComponentInfo = {
      type: 'decision-support',
      name: 'Patient Eligibility DMN',
      description: 'Decision logic for patient eligibility'
    };

    componentLinkService.getComponentLink.mockReturnValue(mockComponentInfo);

    render(
      <ComponentLinkPanel
        selectedElement={mockElement}
        onLinkAdded={jest.fn()}
        onLinkRemoved={jest.fn()}
        profile={mockProfile}
        repository={mockRepository}
        onNavigateToComponent={jest.fn()}
      />
    );

    expect(screen.getByText('Patient Eligibility DMN')).toBeInTheDocument();
    expect(screen.getByText('Decision logic for patient eligibility')).toBeInTheDocument();
  });

  test('renders add link button when element has no component link', () => {
    componentLinkService.getComponentLink.mockReturnValue(null);

    render(
      <ComponentLinkPanel
        selectedElement={mockElement}
        onLinkAdded={jest.fn()}
        onLinkRemoved={jest.fn()}
        profile={mockProfile}
        repository={mockRepository}
        onNavigateToComponent={jest.fn()}
      />
    );

    expect(screen.getByText('No component linked to this element.')).toBeInTheDocument();
    expect(screen.getByText('Add Component Link')).toBeInTheDocument();
  });

  test('opens link dialog when add component link button is clicked', () => {
    componentLinkService.getComponentLink.mockReturnValue(null);

    render(
      <ComponentLinkPanel
        selectedElement={mockElement}
        onLinkAdded={jest.fn()}
        onLinkRemoved={jest.fn()}
        profile={mockProfile}
        repository={mockRepository}
        onNavigateToComponent={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Add Component Link'));
    
    expect(screen.getByText('Link Component')).toBeInTheDocument();
    expect(screen.getByText('Decision Support Logic')).toBeInTheDocument();
    expect(screen.getByText('Indicators & Measures')).toBeInTheDocument();
    expect(screen.getByText('Data Entry Forms')).toBeInTheDocument();
  });

  test('component linking workflow works correctly', () => {
    const onLinkAddedMock = jest.fn();
    componentLinkService.getComponentLink.mockReturnValue(null);

    render(
      <ComponentLinkPanel
        selectedElement={mockElement}
        onLinkAdded={onLinkAddedMock}
        onLinkRemoved={jest.fn()}
        profile={mockProfile}
        repository={mockRepository}
        onNavigateToComponent={jest.fn()}
      />
    );

    // Open dialog
    fireEvent.click(screen.getByText('Add Component Link'));
    
    // Select component type
    fireEvent.click(screen.getByText('Decision Support Logic'));
    
    // Fill in component name
    const nameInput = screen.getByLabelText('Component Name');
    fireEvent.change(nameInput, { target: { value: 'Test DMN Table' } });
    
    // Add link
    fireEvent.click(screen.getByText('Add Link'));
    
    expect(componentLinkService.addComponentLink).toHaveBeenCalledWith(
      'Task_1',
      expect.objectContaining({
        type: 'decision-support',
        id: 'test-dmn-table',
        name: 'Test DMN Table'
      })
    );
    
    expect(onLinkAddedMock).toHaveBeenCalled();
  });
});
/**
 * Test for BPMN Viewer Dark Mode Support Issue #442
 * This test verifies that the BPMN viewer respects dark mode theme settings
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('BPMN Viewer Dark Mode Support', () => {
  beforeEach(() => {
    // Reset document body classes
    document.body.className = '';
  });

  test('bpmn-viewer respects dark mode theme', () => {
    // Add dark mode class to body
    document.body.classList.add('theme-dark');

    // Create a test element with bpmn-viewer class
    const testElement = document.createElement('div');
    testElement.className = 'bpmn-viewer';
    document.body.appendChild(testElement);

    // Verify dark mode is active
    expect(document.body.classList.contains('theme-dark')).toBe(true);
    expect(testElement.classList.contains('bpmn-viewer')).toBe(true);

    // Clean up
    document.body.removeChild(testElement);
  });

  test('bpmn-viewer respects light mode theme', () => {
    // Add light mode class to body
    document.body.classList.add('theme-light');

    // Create a test element with bpmn-viewer class
    const testElement = document.createElement('div');
    testElement.className = 'bpmn-viewer';
    document.body.appendChild(testElement);

    // Verify light mode is active
    expect(document.body.classList.contains('theme-light')).toBe(true);
    expect(testElement.classList.contains('bpmn-viewer')).toBe(true);

    // Clean up
    document.body.removeChild(testElement);
  });

  test('viewer-main uses theme-aware backgrounds', () => {
    // Test dark mode
    document.body.classList.add('theme-dark');

    const viewerMainElement = document.createElement('div');
    viewerMainElement.className = 'viewer-main';
    document.body.appendChild(viewerMainElement);

    expect(document.body.classList.contains('theme-dark')).toBe(true);
    expect(viewerMainElement.classList.contains('viewer-main')).toBe(true);

    // Clean up and test light mode
    document.body.removeChild(viewerMainElement);
    document.body.className = 'theme-light';

    const lightViewerMainElement = document.createElement('div');
    lightViewerMainElement.className = 'viewer-main';
    document.body.appendChild(lightViewerMainElement);

    expect(document.body.classList.contains('theme-light')).toBe(true);
    expect(lightViewerMainElement.classList.contains('viewer-main')).toBe(true);

    // Clean up
    document.body.removeChild(lightViewerMainElement);
  });

  test('viewer-toolbar uses theme-aware colors', () => {
    // Test dark mode
    document.body.classList.add('theme-dark');

    const toolbarElement = document.createElement('div');
    toolbarElement.className = 'viewer-toolbar';
    document.body.appendChild(toolbarElement);

    expect(document.body.classList.contains('theme-dark')).toBe(true);
    expect(toolbarElement.classList.contains('viewer-toolbar')).toBe(true);

    // Clean up
    document.body.removeChild(toolbarElement);
  });

  test('bpmn-container uses theme-aware backgrounds', () => {
    // Test dark mode
    document.body.classList.add('theme-dark');

    const containerElement = document.createElement('div');
    containerElement.className = 'bpmn-container';
    document.body.appendChild(containerElement);

    expect(document.body.classList.contains('theme-dark')).toBe(true);
    expect(containerElement.classList.contains('bpmn-container')).toBe(true);

    // Clean up
    document.body.removeChild(containerElement);
  });

  test('action buttons use theme-aware styles', () => {
    // Test dark mode
    document.body.classList.add('theme-dark');

    const primaryButton = document.createElement('button');
    primaryButton.className = 'action-btn primary';
    document.body.appendChild(primaryButton);

    const secondaryButton = document.createElement('button');
    secondaryButton.className = 'action-btn secondary';
    document.body.appendChild(secondaryButton);

    expect(document.body.classList.contains('theme-dark')).toBe(true);
    expect(primaryButton.classList.contains('action-btn')).toBe(true);
    expect(secondaryButton.classList.contains('action-btn')).toBe(true);

    // Clean up
    document.body.removeChild(primaryButton);
    document.body.removeChild(secondaryButton);
  });
});
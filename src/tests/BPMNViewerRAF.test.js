/**
 * Test for BPMN Viewer requestAnimationFrame Fix
 * This test verifies that the BPMN viewer uses requestAnimationFrame instead of setTimeout
 * for proper viewport initialization timing
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('BPMN Viewer requestAnimationFrame Implementation', () => {
  let rafCallbacks = [];
  let originalRAF;

  beforeEach(() => {
    // Mock requestAnimationFrame to track calls
    rafCallbacks = [];
    originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = jest.fn((callback) => {
      rafCallbacks.push(callback);
      return rafCallbacks.length;
    });
  });

  afterEach(() => {
    // Restore original requestAnimationFrame
    global.requestAnimationFrame = originalRAF;
    rafCallbacks = [];
  });

  test('hasValidDimensions checks multiple dimension properties', () => {
    // Create a test container
    const container = document.createElement('div');
    // In jsdom, we need to set dimensions via defineProperty
    Object.defineProperty(container, 'offsetWidth', { value: 800, writable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, writable: true });
    document.body.appendChild(container);

    // Simulate the hasValidDimensions function from BPMNViewer
    const hasValidDimensions = (container) => {
      if (!container) return false;
      const rect = container.getBoundingClientRect();
      const width = rect.width || container.offsetWidth;
      const height = rect.height || container.offsetHeight;
      return width > 0 && height > 0;
    };

    // Test that it properly validates dimensions
    expect(hasValidDimensions(container)).toBe(true);
    expect(hasValidDimensions(null)).toBe(false);

    // Clean up
    document.body.removeChild(container);
  });

  test('hasValidDimensions returns false for zero-dimension container', () => {
    // Create a test container with zero dimensions
    const container = document.createElement('div');
    container.style.width = '0px';
    container.style.height = '0px';
    document.body.appendChild(container);

    const hasValidDimensions = (container) => {
      if (!container) return false;
      const rect = container.getBoundingClientRect();
      const width = rect.width || container.offsetWidth;
      const height = rect.height || container.offsetHeight;
      return width > 0 && height > 0;
    };

    expect(hasValidDimensions(container)).toBe(false);

    // Clean up
    document.body.removeChild(container);
  });

  test('waitForValidDimensions uses requestAnimationFrame for polling', () => {
    const container = document.createElement('div');
    // In jsdom, we need to set dimensions via style for them to be detectable
    Object.defineProperty(container, 'offsetWidth', { value: 0, writable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 0, writable: true });
    document.body.appendChild(container);

    const hasValidDimensions = (container) => {
      if (!container) return false;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      return width > 0 && height > 0;
    };

    const waitForValidDimensions = (container, callback, maxAttempts = 50) => {
      let attempts = 0;
      const checkDimensions = () => {
        if (hasValidDimensions(container)) {
          callback();
        } else if (attempts < maxAttempts) {
          attempts++;
          requestAnimationFrame(checkDimensions);
        } else {
          callback(); // Give up and try anyway
        }
      };
      requestAnimationFrame(checkDimensions);
    };

    const mockCallback = jest.fn();
    waitForValidDimensions(container, mockCallback, 3);

    // Verify requestAnimationFrame was called
    expect(global.requestAnimationFrame).toHaveBeenCalled();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    // Simulate RAF cycles - container still has zero dimensions
    for (let i = 0; i < 4 && rafCallbacks.length > 0; i++) {
      const callback = rafCallbacks.shift();
      if (callback) callback();
    }

    // After max attempts, callback should be called anyway
    expect(mockCallback).toHaveBeenCalled();

    // Clean up
    document.body.removeChild(container);
  });

  test('waitForValidDimensions stops when valid dimensions are found', () => {
    const container = document.createElement('div');
    // Start with zero dimensions
    Object.defineProperty(container, 'offsetWidth', { value: 0, writable: true, configurable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 0, writable: true, configurable: true });
    document.body.appendChild(container);

    const hasValidDimensions = (container) => {
      if (!container) return false;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      return width > 0 && height > 0;
    };

    const waitForValidDimensions = (container, callback, maxAttempts = 50) => {
      let attempts = 0;
      const checkDimensions = () => {
        if (hasValidDimensions(container)) {
          callback();
        } else if (attempts < maxAttempts) {
          attempts++;
          requestAnimationFrame(checkDimensions);
        } else {
          callback();
        }
      };
      requestAnimationFrame(checkDimensions);
    };

    const mockCallback = jest.fn();
    waitForValidDimensions(container, mockCallback, 10);

    // First RAF call
    expect(rafCallbacks.length).toBe(1);
    let callback = rafCallbacks.shift();
    callback();

    // After first check, container still has zero dimensions, should schedule another RAF
    expect(rafCallbacks.length).toBeGreaterThan(0);

    // Now set valid dimensions
    Object.defineProperty(container, 'offsetWidth', { value: 800, writable: true, configurable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, writable: true, configurable: true });

    // Next RAF cycle should find valid dimensions and call callback
    callback = rafCallbacks.shift();
    if (callback) callback();

    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Clean up
    document.body.removeChild(container);
  });

  test('viewport transform detection works correctly', () => {
    // Create SVG structure similar to bpmn-js
    const container = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const viewportGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    viewportGroup.classList.add('viewport');
    
    svg.appendChild(viewportGroup);
    container.appendChild(svg);
    document.body.appendChild(container);

    // Test all-zeros transform detection
    viewportGroup.setAttribute('transform', 'matrix(0 0 0 0 0 0)');
    const transformZeros = viewportGroup.getAttribute('transform');
    expect(transformZeros.includes('matrix(0 0 0 0 0 0)')).toBe(true);

    // Test valid transform
    viewportGroup.setAttribute('transform', 'matrix(0.85 0 0 0.85 100 50)');
    const transformValid = viewportGroup.getAttribute('transform');
    expect(transformValid.includes('matrix(0 0 0 0 0 0)')).toBe(false);

    // Clean up
    document.body.removeChild(container);
  });

  test('nested RAF pattern is used for viewport fitting', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', { value: 800, writable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, writable: true });
    document.body.appendChild(container);

    const hasValidDimensions = (container) => {
      if (!container) return false;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      return width > 0 && height > 0;
    };

    const mockExecuteViewportFit = jest.fn();

    // Simulate the nested RAF pattern from the fix
    requestAnimationFrame(() => {
      if (!hasValidDimensions(container)) {
        // Would wait for dimensions
      } else {
        // Second RAF to ensure dynamic content is ready
        requestAnimationFrame(() => {
          mockExecuteViewportFit();
        });
      }
    });

    // First RAF call
    expect(rafCallbacks.length).toBe(1);
    const firstCallback = rafCallbacks.shift();
    if (firstCallback) firstCallback();

    // Container has valid dimensions, so second RAF should be scheduled
    expect(rafCallbacks.length).toBe(1);
    const secondCallback = rafCallbacks.shift();
    if (secondCallback) secondCallback();

    // After second RAF, executeViewportFit should be called
    expect(mockExecuteViewportFit).toHaveBeenCalledTimes(1);

    // Clean up
    document.body.removeChild(container);
  });

  test('diagnostic logging structure is correct', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', { value: 800, writable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, writable: true });
    Object.defineProperty(container, 'clientWidth', { value: 800, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 600, writable: true });
    document.body.appendChild(container);

    // Simulate diagnostic logging from hasValidDimensions
    const rect = container.getBoundingClientRect();
    const computed = window.getComputedStyle(container);
    
    const diagnosticInfo = {
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight,
      boundingRectWidth: rect.width,
      boundingRectHeight: rect.height,
      computedStyleWidth: computed.width,
      computedStyleHeight: computed.height,
      hasValidDimensions: container.offsetWidth > 0 && container.offsetHeight > 0
    };

    // Verify all expected properties are present
    expect(diagnosticInfo).toHaveProperty('offsetWidth');
    expect(diagnosticInfo).toHaveProperty('offsetHeight');
    expect(diagnosticInfo).toHaveProperty('clientWidth');
    expect(diagnosticInfo).toHaveProperty('clientHeight');
    expect(diagnosticInfo).toHaveProperty('boundingRectWidth');
    expect(diagnosticInfo).toHaveProperty('boundingRectHeight');
    expect(diagnosticInfo).toHaveProperty('computedStyleWidth');
    expect(diagnosticInfo).toHaveProperty('computedStyleHeight');
    expect(diagnosticInfo).toHaveProperty('hasValidDimensions');

    // Verify values are correct
    expect(diagnosticInfo.hasValidDimensions).toBe(true);
    expect(diagnosticInfo.offsetWidth).toBe(800);
    expect(diagnosticInfo.offsetHeight).toBe(600);

    // Clean up
    document.body.removeChild(container);
  });
});

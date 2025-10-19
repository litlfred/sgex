/**
 * Jest Test Setup Configuration
 * 
 * Configures the Jest testing environment with:
 * - jest-dom custom matchers for DOM assertions
 * - window.matchMedia mock for testing
 * - BPMN Editor component mock
 * 
 * @module setupTests
 */

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

/**
 * MediaQueryList interface for matchMedia mock
 */
interface MediaQueryListMock {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  dispatchEvent: jest.Mock;
}

// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string): MediaQueryListMock => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock BPMN Editor component for testing
jest.mock('./components/BPMNEditor', () => {
  const React = require('react');
  return function BPMNEditor() {
    return React.createElement('div', { 'data-testid': 'bpmn-editor' }, 'BPMN Editor Mock');
  };
});

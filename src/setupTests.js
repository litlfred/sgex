// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock BPMN Editor component for testing
jest.mock('./components/BPMNEditor', () => {
  const React = require('react');
  return function BPMNEditor() {
    return React.createElement('div', { 'data-testid': 'bpmn-editor' }, 'BPMN Editor Mock');
  };
});
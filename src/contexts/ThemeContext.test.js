import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from './ThemeContext';

// Test component to access theme context
const TestComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme-mode">{isDarkMode ? 'dark' : 'light'}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
const createMatchMediaMock = (matches) => ({
  matches,
  addListener: jest.fn(),
  removeListener: jest.fn(),
});

beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
});

test('defaults to dark mode when no saved theme and no system preference', () => {
  // Mock no saved theme
  localStorageMock.getItem.mockReturnValue(null);
  
  // Mock no system preference (neither light nor dark matches)
  window.matchMedia = jest.fn().mockImplementation((query) => {
    if (query === '(prefers-color-scheme: light)') {
      return createMatchMediaMock(false);
    }
    return createMatchMediaMock(false);
  });

  const { getByTestId } = render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  expect(getByTestId('theme-mode')).toHaveTextContent('dark');
});

test('respects saved dark theme preference', () => {
  // Mock saved dark theme
  localStorageMock.getItem.mockReturnValue('dark');
  
  const { getByTestId } = render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  expect(getByTestId('theme-mode')).toHaveTextContent('dark');
});

test('respects saved light theme preference', () => {
  // Mock saved light theme
  localStorageMock.getItem.mockReturnValue('light');
  
  const { getByTestId } = render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  expect(getByTestId('theme-mode')).toHaveTextContent('light');
});

test('respects system preference for light mode when no saved theme', () => {
  // Mock no saved theme
  localStorageMock.getItem.mockReturnValue(null);
  
  // Mock system preference for light mode
  window.matchMedia = jest.fn().mockImplementation((query) => {
    if (query === '(prefers-color-scheme: light)') {
      return createMatchMediaMock(true);
    }
    return createMatchMediaMock(false);
  });

  const { getByTestId } = render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  expect(getByTestId('theme-mode')).toHaveTextContent('light');
});

test('defaults to dark mode when no saved theme and system prefers dark', () => {
  // Mock no saved theme
  localStorageMock.getItem.mockReturnValue(null);
  
  // Mock system preference for dark mode
  window.matchMedia = jest.fn().mockImplementation((query) => {
    if (query === '(prefers-color-scheme: light)') {
      return createMatchMediaMock(false);
    }
    if (query === '(prefers-color-scheme: dark)') {
      return createMatchMediaMock(true);
    }
    return createMatchMediaMock(false);
  });

  const { getByTestId } = render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  expect(getByTestId('theme-mode')).toHaveTextContent('dark');
});
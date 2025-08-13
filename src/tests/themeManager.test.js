/**
 * Test to verify theme persistence across page navigation
 */

import { getSavedTheme, applyTheme, initializeTheme, toggleTheme } from '../utils/themeManager';

// Mock localStorage for testing
const mockLocalStorage = {
  storage: {},
  getItem: jest.fn((key) => mockLocalStorage.storage[key] || null),
  setItem: jest.fn((key, value) => {
    mockLocalStorage.storage[key] = value;
  }),
  clear: jest.fn(() => {
    mockLocalStorage.storage = {};
  })
};

// Mock document.body for testing
const mockDocument = {
  body: {
    className: ''
  }
};

// Mock window.matchMedia for testing
const mockMatchMedia = jest.fn(() => ({
  matches: false,
  addListener: jest.fn(),
  removeListener: jest.fn()
}));

describe('Theme Manager', () => {
  beforeEach(() => {
    // Reset mocks
    mockLocalStorage.clear();
    mockDocument.body.className = '';
    
    // Setup global mocks
    global.localStorage = mockLocalStorage;
    global.document = mockDocument;
    global.window.matchMedia = mockMatchMedia;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getSavedTheme returns dark as default when no saved theme', () => {
    const theme = getSavedTheme();
    expect(theme).toBe('dark');
  });

  test('getSavedTheme returns saved theme from localStorage', () => {
    mockLocalStorage.setItem('sgex-theme', 'light');
    const theme = getSavedTheme();
    expect(theme).toBe('light');
  });

  test('applyTheme sets correct body class and saves to localStorage', () => {
    applyTheme('light');
    expect(mockDocument.body.className).toBe('theme-light');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sgex-theme', 'light');

    applyTheme('dark');
    expect(mockDocument.body.className).toBe('theme-dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sgex-theme', 'dark');
  });

  test('initializeTheme applies default theme and returns it', () => {
    const theme = initializeTheme();
    expect(theme).toBe('dark');
    expect(mockDocument.body.className).toBe('theme-dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sgex-theme', 'dark');
  });

  test('initializeTheme applies saved theme when available', () => {
    mockLocalStorage.setItem('sgex-theme', 'light');
    const theme = initializeTheme();
    expect(theme).toBe('light');
    expect(mockDocument.body.className).toBe('theme-light');
  });

  test('toggleTheme switches between themes correctly', () => {
    // Start with dark theme
    applyTheme('dark');
    
    // Toggle to light
    let newTheme = toggleTheme();
    expect(newTheme).toBe('light');
    expect(mockDocument.body.className).toBe('theme-light');
    
    // Toggle back to dark
    newTheme = toggleTheme();
    expect(newTheme).toBe('dark');
    expect(mockDocument.body.className).toBe('theme-dark');
  });

  test('theme persistence scenario - simulate page navigation', () => {
    // User selects light mode
    applyTheme('light');
    expect(mockDocument.body.className).toBe('theme-light');
    
    // Simulate page navigation - body class gets reset
    mockDocument.body.className = '';
    
    // Initialize theme on new page (simulates App.js useEffect)
    const restoredTheme = initializeTheme();
    
    // Verify light mode is restored
    expect(restoredTheme).toBe('light');
    expect(mockDocument.body.className).toBe('theme-light');
  });
});
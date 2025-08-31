import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import ContextualHelpMascot from '../components/ContextualHelpMascot';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Route: ({ children }) => children,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/test' }),
}));

// Mock services to avoid dependencies
jest.mock('../services/githubService', () => ({
  isAuth: jest.fn(() => false),
}));

jest.mock('../services/issueTrackingService', () => ({
  startBackgroundSync: jest.fn(),
  stopBackgroundSync: jest.fn(),
  getTrackedCounts: jest.fn(() => Promise.resolve({ total: 0 })),
}));

jest.mock('../services/helpContentService', () => ({
  getHelpTopicsForPage: jest.fn(() => []),
}));

jest.mock('../services/tutorialService', () => ({}));

jest.mock('../services/cacheManagementService', () => ({
  clearAllCache: jest.fn(() => true),
}));

jest.mock('../utils/themeManager', () => ({
  getSavedTheme: jest.fn(() => 'light'),
  toggleTheme: jest.fn(() => 'dark'),
}));

jest.mock('../hooks/useThemeImage', () => ({
  __esModule: true,
  default: jest.fn(() => '/test-mascot.png'),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Setup i18n for testing
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: {
        'help.title': 'Help',
        'theme.toggle': 'Toggle theme'
      }
    }
  }
});

describe('ContextualHelpMascot Pulsing Animation', () => {
  const renderWithI18n = (component) => {
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    );
  };

  test('question bubble has default classes', () => {
    const { container } = renderWithI18n(
      <ContextualHelpMascot pageId="test-page" />
    );
    
    const questionBubble = container.querySelector('.question-bubble');
    expect(questionBubble).toBeInTheDocument();
    expect(questionBubble).not.toHaveClass('help-open');
  });

  test('question bubble gets help-open class when help menu is opened', () => {
    const { container } = renderWithI18n(
      <ContextualHelpMascot pageId="test-page" />
    );
    
    const mascotContainer = container.querySelector('.mascot-container');
    const questionBubble = container.querySelector('.question-bubble');
    
    expect(questionBubble).not.toHaveClass('help-open');
    
    // Click to open help menu
    fireEvent.click(mascotContainer);
    
    // Check that help-open class is added when help is shown
    expect(questionBubble).toHaveClass('help-open');
  });

  test('question bubble behavior on multiple clicks', () => {
    const { container } = renderWithI18n(
      <ContextualHelpMascot pageId="test-page" />
    );
    
    const mascotContainer = container.querySelector('.mascot-container');
    const questionBubble = container.querySelector('.question-bubble');
    
    // Initially help is not open (state 0: hidden)
    expect(questionBubble).not.toHaveClass('help-open');
    
    // First click: state 1 (non-sticky, shown)
    fireEvent.click(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
    
    // Second click: state 2 (sticky, shown)
    fireEvent.click(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
    
    // Mouse leave should not close sticky help
    fireEvent.mouseLeave(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
    
    // Third click: state 0 (hidden)
    fireEvent.click(mascotContainer);
    expect(questionBubble).not.toHaveClass('help-open');
  });

  test('question bubble is not shown when notification badge is present', () => {
    const { container } = renderWithI18n(
      <ContextualHelpMascot pageId="test-page" notificationBadge={true} />
    );
    
    const questionBubble = container.querySelector('.question-bubble');
    const notificationBadge = container.querySelector('.notification-badge');
    
    expect(questionBubble).not.toBeInTheDocument();
    expect(notificationBadge).toBeInTheDocument();
  });

  test('three-state cycling behavior', async () => {
    const { container } = renderWithI18n(
      <ContextualHelpMascot pageId="test-page" />
    );
    
    const mascotContainer = container.querySelector('.mascot-container');
    const questionBubble = container.querySelector('.question-bubble');
    
    // Initially help is not open (state 0: hidden)
    expect(questionBubble).not.toHaveClass('help-open');
    
    // First click: state 1 (non-sticky, shown)
    fireEvent.click(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
    
    // Second click: state 2 (sticky, shown)
    fireEvent.click(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
    
    // Third click: state 0 (hidden)
    fireEvent.click(mascotContainer);
    expect(questionBubble).not.toHaveClass('help-open');
    
    // Verify help bubble is not visible
    const helpBubble = container.querySelector('.help-thought-bubble');
    expect(helpBubble).not.toBeInTheDocument();
    
    // Fourth click: back to state 1 (cycle repeats)
    fireEvent.click(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
  });

  test('non-sticky state responds to mouse hover', () => {
    const { container } = renderWithI18n(
      <ContextualHelpMascot pageId="test-page" />
    );
    
    const mascotContainer = container.querySelector('.mascot-container');
    const questionBubble = container.querySelector('.question-bubble');
    
    // Click once to get to non-sticky state (state 1)
    fireEvent.click(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
    
    // Mouse leave should hide in non-sticky state
    fireEvent.mouseLeave(mascotContainer);
    expect(questionBubble).not.toHaveClass('help-open');
    
    // Mouse enter should show again in non-sticky state
    fireEvent.mouseEnter(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
  });
});
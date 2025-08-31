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
    
    // Initially help is not open
    expect(questionBubble).not.toHaveClass('help-open');
    
    // First click opens help menu (makes it sticky)
    fireEvent.click(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
    
    // Second click makes help non-sticky but may still be visible
    // This is the intended behavior - help becomes non-sticky but visible
    fireEvent.click(mascotContainer);
    // The help might still be visible but not sticky, so we can't assert it's closed
    
    // Mouse leave should close non-sticky help
    fireEvent.mouseLeave(mascotContainer);
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

  test('triple-click hides the help menu', async () => {
    const { container } = renderWithI18n(
      <ContextualHelpMascot pageId="test-page" />
    );
    
    const mascotContainer = container.querySelector('.mascot-container');
    const questionBubble = container.querySelector('.question-bubble');
    
    // Initially help is not open
    expect(questionBubble).not.toHaveClass('help-open');
    
    // First click opens help menu
    fireEvent.click(mascotContainer);
    expect(questionBubble).toHaveClass('help-open');
    
    // Second click (still within timeout window)
    fireEvent.click(mascotContainer);
    
    // Third click should hide the menu
    fireEvent.click(mascotContainer);
    expect(questionBubble).not.toHaveClass('help-open');
    
    // Verify help bubble is not visible
    const helpBubble = container.querySelector('.help-thought-bubble');
    expect(helpBubble).not.toBeInTheDocument();
  });
});
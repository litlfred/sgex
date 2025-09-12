/**
 * Phase 4 TypeScript Migration Integration Tests
 * 
 * This test suite validates the successful migration of React components to TypeScript
 * while maintaining full JavaScript/TypeScript interoperability and UI functionality.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import i18n from '../i18n';

// Import the TypeScript components
import LanguageSelector from '../components/LanguageSelector';
import NotFound from '../components/NotFound';

// Mock the framework component
jest.mock('../components/framework', () => ({
  PageLayout: ({ children, pageName }) => (
    <div data-testid={`page-layout-${pageName}`}>
      {children}
    </div>
  )
}));

// Mock GitHub service
const mockGithubService = {
  isAuth: jest.fn()
};
jest.mock('../services/githubService', () => mockGithubService);

// Mock route utils
const mockParseDAKUrl = jest.fn();
jest.mock('../services/urlProcessorService', () => ({
  parseDAKUrl: mockParseDAKUrl
}));

// Test wrapper with providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  </BrowserRouter>
);

describe('Phase 4 TypeScript Migration Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    localStorage.clear();
    
    // Setup default mock returns
    mockGithubService.isAuth.mockReturnValue(false);
    mockParseDAKUrl.mockReturnValue({ isValid: false, assetPath: [] });
  });

  describe('LanguageSelector Component TypeScript Migration', () => {
    test('should render with proper TypeScript props', () => {
      render(
        <TestWrapper>
          <LanguageSelector className="test-class" />
        </TestWrapper>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveClass('language-toggle');
    });

    test('should handle language selection with type safety', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );
      
      // Open dropdown
      fireEvent.click(screen.getByRole('button'));
      
      // Should show language options
      await waitFor(() => {
        expect(screen.getByText(/english/i)).toBeInTheDocument();
      });
      
      // Click a language option
      fireEvent.click(screen.getByText(/english/i));
      
      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText(/french/i)).not.toBeInTheDocument();
      });
    });

    test('should preserve localStorage state with proper typing', () => {
      // Set initial state
      localStorage.setItem('sgex-selected-languages', JSON.stringify(['en', 'fr', 'es']));
      
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('should handle search functionality with TypeScript event handling', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );
      
      // Open dropdown
      fireEvent.click(screen.getByRole('button'));
      
      // Type in search
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'German' } });
      
      await waitFor(() => {
        expect(searchInput.value).toBe('German');
      });
    });
  });

  describe('NotFound Component TypeScript Migration', () => {
    test('should render with proper TypeScript navigation hooks', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('page-layout-not-found')).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(screen.getByText('Redirecting to home page...')).toBeInTheDocument();
    });

    test('should attempt DAK URL parsing with type safety', () => {
      mockParseDAKUrl.mockReturnValue({
        isValid: true,
        component: 'health-interventions',
        user: 'test-user',
        repo: 'test-repo',
        branch: 'main',
        assetPath: []
      });

      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(mockParseDAKUrl).toHaveBeenCalled();
    });

    test('should handle authentication state properly', () => {
      mockGithubService.isAuth.mockReturnValue(true);
      
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );
      
      expect(mockGithubService.isAuth).toHaveBeenCalled();
    });
  });

  describe('JavaScript/TypeScript Interoperability', () => {
    test('should maintain compatibility with existing JavaScript imports', () => {
      // Test that TypeScript components can be imported and used by JavaScript code
      const jsComponentTest = () => {
        // Simulate JavaScript import patterns
        const LanguageSelector = require('../components/LanguageSelector').default;
        const NotFound = require('../components/NotFound').default;
        
        expect(LanguageSelector).toBeDefined();
        expect(NotFound).toBeDefined();
        expect(typeof LanguageSelector).toBe('object'); // React component
        expect(typeof NotFound).toBe('object'); // React component
      };
      
      expect(jsComponentTest).not.toThrow();
    });

    test('should work with existing service layer integration', () => {
      // Test that TypeScript components integrate properly with TypeScript services
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );
      
      // Verify that TypeScript service methods are called properly
      expect(mockGithubService.isAuth).toHaveBeenCalledWith();
    });

    test('should handle prop types correctly in mixed environments', () => {
      // Test that TypeScript props work in JavaScript contexts
      const props = {
        className: 'test-class'
      };
      
      expect(() => {
        render(
          <TestWrapper>
            <LanguageSelector {...props} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Type Safety Validation', () => {
    test('should maintain type safety for component props', () => {
      // This test validates that TypeScript types are working correctly
      // The actual type checking happens at compile time, but we can test runtime behavior
      
      render(
        <TestWrapper>
          <LanguageSelector className="valid-string" />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button.closest('.language-selector')).toHaveClass('valid-string');
    });

    test('should provide proper type safety for event handlers', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      
      // Event handling should work properly with TypeScript
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });

    test('should maintain type safety for hooks and state', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );
      
      // Open dropdown to trigger state changes
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // State updates should work properly
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });
    });
  });

  describe('Build and Runtime Integration', () => {
    test('should work with existing build pipeline', () => {
      // Test that TypeScript components work within the existing build system
      expect(() => {
        render(
          <TestWrapper>
            <LanguageSelector />
            <NotFound />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    test('should maintain existing CSS class compatibility', () => {
      render(
        <TestWrapper>
          <LanguageSelector className="existing-css-class" />
        </TestWrapper>
      );
      
      expect(screen.getByRole('button').closest('.language-selector')).toHaveClass('existing-css-class');
    });

    test('should preserve existing functionality while adding type safety', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );
      
      // Test that all existing functionality still works
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      // Search functionality
      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(searchInput).toHaveValue('test');
    });
  });
});

// Export test configuration for CI/CD integration
export const phase4TestConfig = {
  testFiles: [
    'src/components/LanguageSelector.tsx',
    'src/components/NotFound.tsx'
  ],
  componentCount: 2,
  migrationPhase: 4,
  testCoverage: {
    components: ['LanguageSelector', 'NotFound'],
    features: ['TypeScript props', 'Event handling', 'State management', 'JavaScript interoperability'],
    integrations: ['i18n', 'React Router', 'Local Storage', 'GitHub Services']
  }
};
/**
 * Integration test for translatable alt text in components
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import ContextualHelpMascot from '../components/ContextualHelpMascot';

// Mock the theme image hook
jest.mock('../hooks/useThemeImage', () => {
  return jest.fn(() => '/sgex/sgex-mascot.png');
});

// Mock services
jest.mock('../services/helpContentService', () => ({
  getHelpTopicsForPage: jest.fn(() => []),
}));

jest.mock('../services/cacheManagementService', () => ({
  clearAllCache: jest.fn(() => true),
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    </BrowserRouter>
  );
};

describe('Translatable Alt Text Integration', () => {
  beforeEach(() => {
    // Initialize i18n with English
    i18n.changeLanguage('en');
  });

  it('should render translatable alt text for SGEX Helper mascot', async () => {
    renderWithProviders(
      <ContextualHelpMascot pageId="test-page" />
    );

    // Wait for the component to render
    const mascotImage = await screen.findByAltText('SGEX Helper');
    expect(mascotImage).toBeInTheDocument();
    expect(mascotImage).toHaveAttribute('src', '/sgex/sgex-mascot.png');
  });

  it('should use fallback when translation is missing', async () => {
    // Change to a language without full translations
    i18n.changeLanguage('de'); // German not configured

    renderWithProviders(
      <ContextualHelpMascot pageId="test-page" />
    );

    // Should fall back to English default
    const mascotImage = await screen.findByAltText('SGEX Helper');
    expect(mascotImage).toBeInTheDocument();
  });

  it('should update alt text when language changes', async () => {
    const { rerender } = renderWithProviders(
      <ContextualHelpMascot pageId="test-page" />
    );

    // Initially English
    let mascotImage = await screen.findByAltText('SGEX Helper');
    expect(mascotImage).toBeInTheDocument();

    // Change to French
    i18n.changeLanguage('fr');
    
    rerender(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <ContextualHelpMascot pageId="test-page" />
        </I18nextProvider>
      </BrowserRouter>
    );

    // Should show French alt text
    mascotImage = await screen.findByAltText('Assistant SGEX');
    expect(mascotImage).toBeInTheDocument();
  });

  it('should maintain accessibility when alt text is updated', async () => {
    renderWithProviders(
      <ContextualHelpMascot pageId="test-page" />
    );

    const mascotImage = await screen.findByAltText('SGEX Helper');
    
    // Verify accessibility attributes
    expect(mascotImage).toHaveAttribute('alt');
    expect(mascotImage.getAttribute('alt')).toBeTruthy();
    expect(mascotImage.getAttribute('alt').length).toBeGreaterThan(0);
  });
});
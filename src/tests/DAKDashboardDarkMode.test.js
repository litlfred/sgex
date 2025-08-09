import React from 'react';
import { render } from '@testing-library/react';

// Mock react-router-dom to avoid dependency issues
jest.mock('react-router-dom', () => ({
  useParams: () => ({ user: 'test', repo: 'test-repo', branch: 'main' }),
  useLocation: () => ({ state: null }),
  useNavigate: () => jest.fn(),
}));

// Mock other dependencies
jest.mock('../services/githubService', () => ({
  isAuth: () => false,
}));

jest.mock('../services/dakValidationService', () => ({
  validateDemoDAKRepository: () => true,
}));

jest.mock('../services/branchContextService', () => ({
  getSelectedBranch: () => null,
  setSelectedBranch: () => {},
}));

jest.mock('../components/HelpButton', () => {
  return function HelpButton() {
    return React.createElement('div', null, 'Help');
  };
});

jest.mock('../components/DAKStatusBox', () => {
  return function DAKStatusBox() {
    return React.createElement('div', null, 'Status');
  };
});

jest.mock('../components/Publications', () => {
  return function Publications() {
    return React.createElement('div', null, 'Publications');
  };
});

jest.mock('../components/ForkStatusBar', () => {
  return function ForkStatusBar() {
    return React.createElement('div', null, 'Fork Status');
  };
});

jest.mock('../components/framework', () => ({
  PageLayout: ({ children }) => React.createElement('div', null, children),
}));

jest.mock('../hooks/useThemeImage', () => {
  return () => '/sgex/sgex-mascot.png';
});

jest.mock('../utils/navigationUtils', () => ({
  handleNavigationClick: jest.fn(),
}));

// Import the component after mocking
import DAKDashboard from '../components/DAKDashboard';

describe('DAK Dashboard Dark Mode Support', () => {
  beforeEach(() => {
    // Reset body classes
    document.body.className = '';
  });

  test('getMascotCardPath generates correct light mode paths', () => {
    // Simulate light mode
    document.body.classList.remove('theme-dark');
    
    render(<DAKDashboard />);
    
    // Check that we can find mascot images in the rendered output
    const images = document.querySelectorAll('img.mascot-card-image');
    
    // We should have mascot card images rendered
    expect(images.length).toBeGreaterThan(0);
    
    // Check that at least one image has a light mode path (no _grey_tabby)
    const lightModeImages = Array.from(images).filter(img => 
      img.src.includes('dashboard/dak_') && !img.src.includes('_grey_tabby')
    );
    expect(lightModeImages.length).toBeGreaterThan(0);
  });

  test('getMascotCardPath generates correct dark mode paths', () => {
    // Simulate dark mode
    document.body.classList.add('theme-dark');
    
    render(<DAKDashboard />);
    
    // Check that we can find mascot images in the rendered output
    const images = document.querySelectorAll('img.mascot-card-image');
    
    // We should have mascot card images rendered
    expect(images.length).toBeGreaterThan(0);
    
    // Check that at least one image has a dark mode path (_grey_tabby)
    const darkModeImages = Array.from(images).filter(img => 
      img.src.includes('dashboard/dak_') && img.src.includes('_grey_tabby')
    );
    expect(darkModeImages.length).toBeGreaterThan(0);
  });

  test('component updates when theme class changes', () => {
    // Start in light mode
    document.body.classList.remove('theme-dark');
    
    const { rerender } = render(<DAKDashboard />);
    
    // Switch to dark mode
    document.body.classList.add('theme-dark');
    
    // Trigger a re-render by changing the body class
    // This simulates what happens when the theme switcher is used
    const event = new Event('DOMNodeInserted');
    document.body.dispatchEvent(event);
    
    // Re-render the component
    rerender(<DAKDashboard />);
    
    // The component should have updated to use dark mode images
    const images = document.querySelectorAll('img.mascot-card-image');
    expect(images.length).toBeGreaterThan(0);
  });
});
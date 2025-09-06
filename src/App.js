import React from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import './i18n'; // Initialize i18n
import { generateLazyRoutes } from './utils/lazyRouteUtils';
import { initializeTheme } from './utils/themeManager';
import logger from './utils/logger';
import './styles/TinyMCEEditor.css'; // TinyMCE styles

function App() {
  const appLogger = logger.getLogger('App');
  
  // Get basename from PUBLIC_URL or default to /sgex
  const basename = process.env.PUBLIC_URL || '/sgex';
  
  React.useEffect(() => {
    appLogger.componentMount();
    appLogger.info('SGEX Branch Listing application started', { 
      environment: process.env.NODE_ENV,
      basename: basename
    });
    
    // Initialize theme before any components render
    const appliedTheme = initializeTheme();
    appLogger.info('Theme initialized', { theme: appliedTheme });
    
    return () => {
      appLogger.componentUnmount();
    };
  }, [appLogger, basename]);

  // Generate all routes dynamically using lazy loading
  const routes = generateLazyRoutes();

  return (
    <Router basename={basename}>
      <div className="App">
        <Routes>
          {routes}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

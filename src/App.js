import React from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import './i18n'; // Initialize i18n
import { generateLazyRoutes } from './services/componentRouteService';
import { initializeTheme } from './utils/themeManager';
import logger from './utils/logger';
import { initializeRoutingContext } from './services/routingContextService';
import { initializeGlobalNavigationSync } from './services/globalNavigationSync';
import './services/routingLogger'; // Initialize routing logger early

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
    
    // Initialize routing context to handle URL processing
    const urlContext = initializeRoutingContext();
    appLogger.info('Routing context initialized', urlContext);
    
    // Initialize global navigation synchronization
    // This ensures all URL changes automatically update session storage
    initializeGlobalNavigationSync();
    appLogger.info('Global navigation synchronization initialized');
    
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

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n'; // Initialize i18n
import BranchListing from './components/BranchListing';
import NotFound from './components/NotFound';
import logger from './utils/logger';
import './App.css';

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
    
    return () => {
      appLogger.componentUnmount();
    };
  }, [appLogger, basename]);

  return (
    <Router basename={basename}>
      <div className="App">
          <Routes>
            <Route path="/" element={<BranchListing />} />
            <Route path="/branch-listing" element={<BranchListing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;

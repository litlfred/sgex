import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DAKActionSelection from './components/DAKActionSelection';
import DAKSelection from './components/DAKSelection';
import OrganizationSelection from './components/OrganizationSelection';
import DAKConfiguration from './components/DAKConfiguration';
import RepositorySelection from './components/RepositorySelection';
import DAKDashboard from './components/DAKDashboard';
import ComponentEditor from './components/ComponentEditor';
import CoreDataDictionaryViewer from './components/CoreDataDictionaryViewer';
import ActorEditor from './components/ActorEditor';
import BPMNEditor from './components/BPMNEditor';
import BusinessProcessSelection from './components/BusinessProcessSelection';
import BPMNViewer from './components/BPMNViewerEnhanced';
import BPMNSource from './components/BPMNSource';
import DocumentationViewer from './components/DocumentationViewer';
import TestDashboard from './components/TestDashboard';
import PagesManager from './components/PagesManager';
import logger from './utils/logger';
import './App.css';

function App() {
  const appLogger = logger.getLogger('App');
  
  React.useEffect(() => {
    appLogger.componentMount();
    appLogger.info('SGEX Workbench application started', { 
      environment: process.env.NODE_ENV,
      basename: '/sgex'
    });
    
    return () => {
      appLogger.componentUnmount();
    };
  }, [appLogger]);

  return (
    <Router basename="/sgex">
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dak-action" element={<DAKActionSelection />} />
          <Route path="/dak-selection" element={<DAKSelection />} />
          <Route path="/organization-selection" element={<OrganizationSelection />} />
          <Route path="/dak-configuration" element={<DAKConfiguration />} />
          <Route path="/repositories" element={<RepositorySelection />} />
          <Route path="/dashboard" element={<DAKDashboard />} />
          <Route path="/dashboard/:user/:repo" element={<DAKDashboard />} />
          <Route path="/dashboard/:user/:repo/:branch" element={<DAKDashboard />} />
          <Route path="/test-dashboard" element={<TestDashboard />} />
          <Route path="/core-data-dictionary-viewer" element={<CoreDataDictionaryViewer />} />
          <Route path="/core-data-dictionary-viewer/:user/:repo" element={<CoreDataDictionaryViewer />} />
          <Route path="/core-data-dictionary-viewer/:user/:repo/:branch" element={<CoreDataDictionaryViewer />} />
          <Route path="/editor/:componentId" element={<ComponentEditor />} />
          <Route path="/actor-editor" element={<ActorEditor />} />
          <Route path="/business-process-selection" element={<BusinessProcessSelection />} />
          <Route path="/business-process-selection/:user/:repo" element={<BusinessProcessSelection />} />
          <Route path="/business-process-selection/:user/:repo/:branch" element={<BusinessProcessSelection />} />
          <Route path="/bpmn-editor" element={<BPMNEditor />} />
          <Route path="/bpmn-viewer" element={<BPMNViewer />} />
          <Route path="/bpmn-source" element={<BPMNSource />} />
          <Route path="/docs/:docId" element={<DocumentationViewer />} />
          <Route path="/pages" element={<PagesManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
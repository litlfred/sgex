import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n'; // Initialize i18n
import WelcomePage from './components/WelcomePage';
import SelectProfilePage from './components/SelectProfilePage';
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
import BPMNViewer from './components/BPMNViewer';
import BPMNSource from './components/BPMNSource';
import BPMNViewerTestComponent from './components/BPMNViewerTestComponent';
import DocumentationViewer from './components/DocumentationViewer';
import DecisionSupportLogicView from './components/DecisionSupportLogicView';
import TestDashboard from './components/TestDashboard';
import TestingViewer from './components/TestingViewer';
import PagesManager from './components/PagesManager';
import NotFound from './components/NotFound';
import LandingPageWithFramework from './components/LandingPageWithFramework';
import DAKDashboardWithFramework from './components/DAKDashboardWithFramework';
import TestDocumentationPage from './components/TestDocumentationPage';
import logger from './utils/logger';
import './App.css';

function App() {
  const appLogger = logger.getLogger('App');
  
  React.useEffect(() => {
    appLogger.componentMount();
    appLogger.info('SGEX Workbench application started', { 
      environment: process.env.NODE_ENV,
      routing: 'Updated for new URL structure'
    });
    
    return () => {
      appLogger.componentUnmount();
    };
  }, [appLogger]);

  return (
    <Router>
      <div className="App">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/sgex" element={<WelcomePage />} />
            <Route path="/sgex/select_profile" element={<SelectProfilePage />} />
            <Route path="/sgex/dak-action/:user" element={<DAKActionSelection />} />
            <Route path="/sgex/dak-action" element={<DAKActionSelection />} />
            <Route path="/sgex/dak-selection/:user" element={<DAKSelection />} />
            <Route path="/sgex/dak-selection" element={<DAKSelection />} />
            <Route path="/sgex/organization-selection" element={<OrganizationSelection />} />
            <Route path="/sgex/dak-configuration" element={<DAKConfiguration />} />
            <Route path="/sgex/repositories" element={<RepositorySelection />} />
            <Route path="/sgex/dashboard" element={<DAKDashboard />} />
            <Route path="/sgex/dashboard/:user/:repo" element={<DAKDashboard />} />
            <Route path="/sgex/dashboard/:user/:repo/:branch" element={<DAKDashboard />} />
            <Route path="/sgex/test-dashboard" element={<TestDashboard />} />
            <Route path="/sgex/testing-viewer" element={<TestingViewer />} />
            <Route path="/sgex/core-data-dictionary-viewer" element={<CoreDataDictionaryViewer />} />
            <Route path="/sgex/core-data-dictionary-viewer/:user/:repo" element={<CoreDataDictionaryViewer />} />
            <Route path="/sgex/core-data-dictionary-viewer/:user/:repo/:branch" element={<CoreDataDictionaryViewer />} />
            <Route path="/sgex/editor/:componentId" element={<ComponentEditor />} />
            <Route path="/sgex/editor-health-interventions" element={<ComponentEditor />} />
            <Route path="/sgex/actor-editor" element={<ActorEditor />} />
            <Route path="/sgex/business-process-selection" element={<BusinessProcessSelection />} />
            <Route path="/sgex/business-process-selection/:user/:repo" element={<BusinessProcessSelection />} />
            <Route path="/sgex/business-process-selection/:user/:repo/:branch" element={<BusinessProcessSelection />} />
            <Route path="/sgex/bpmn-editor" element={<BPMNEditor />} />
            <Route path="/sgex/bpmn-viewer" element={<BPMNViewer />} />
            <Route path="/sgex/test-bpmn-viewer" element={<BPMNViewerTestComponent />} />
            <Route path="/sgex/bpmn-source" element={<BPMNSource />} />
            <Route path="/sgex/decision-support-logic" element={<DecisionSupportLogicView />} />
            <Route path="/sgex/decision-support-logic/:user/:repo" element={<DecisionSupportLogicView />} />
            <Route path="/sgex/decision-support-logic/:user/:repo/:branch" element={<DecisionSupportLogicView />} />
            <Route path="/sgex/docs/:docId" element={<DocumentationViewer />} />
            <Route path="/sgex/pages" element={<PagesManager />} />
            
            {/* Framework test routes */}
            <Route path="/sgex/test-framework" element={<LandingPageWithFramework />} />
            <Route path="/sgex/test-framework-dashboard/:user/:repo" element={<DAKDashboardWithFramework />} />
            <Route path="/sgex/test-framework-dashboard/:user/:repo/:branch" element={<DAKDashboardWithFramework />} />
            <Route path="/sgex/test-documentation" element={<TestDocumentationPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
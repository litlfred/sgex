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
import DashboardRedirect from './components/DashboardRedirect';
import TestDocumentationPage from './components/TestDocumentationPage';
import AssetEditorTest from './components/AssetEditorTest';
import logger from './utils/logger';
import { generateDAKRoutes } from './utils/routeUtils';
import './App.css';

function App() {
  const appLogger = logger.getLogger('App');
  
  // Get basename from PUBLIC_URL or default to /sgex
  const basename = process.env.PUBLIC_URL || '/sgex';
  
  // Component mapping for dynamic route generation
  const componentMap = {
    'DAKDashboardWithFramework': <DAKDashboardWithFramework />,
    'TestingViewer': <TestingViewer />,
    'CoreDataDictionaryViewer': <CoreDataDictionaryViewer />,
    'ComponentEditor': <ComponentEditor />,
    'ActorEditor': <ActorEditor />,
    'BusinessProcessSelection': <BusinessProcessSelection />,
    'BPMNEditor': <BPMNEditor />,
    'BPMNViewer': <BPMNViewer />,
    'BPMNSource': <BPMNSource />,
    'DecisionSupportLogicView': <DecisionSupportLogicView />
  };
  
  // Generate DAK component routes dynamically
  const dakRoutes = generateDAKRoutes(componentMap);
  
  React.useEffect(() => {
    appLogger.componentMount();
    appLogger.info('SGEX Workbench application started', { 
      environment: process.env.NODE_ENV,
      basename: basename,
      dakRoutesGenerated: dakRoutes.length
    });
    
    return () => {
      appLogger.componentUnmount();
    };
  }, [appLogger, basename, dakRoutes.length]);

  return (
    <Router basename={basename}>
      <div className="App">
          <Routes>
            {/* Navigation and selection routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/select_profile" element={<SelectProfilePage />} />
            <Route path="/dak-action/:user" element={<DAKActionSelection />} />
            <Route path="/dak-action" element={<DAKActionSelection />} />
            <Route path="/dak-selection/:user" element={<DAKSelection />} />
            <Route path="/dak-selection" element={<DAKSelection />} />
            <Route path="/organization-selection" element={<OrganizationSelection />} />
            <Route path="/dak-configuration" element={<DAKConfiguration />} />
            <Route path="/repositories" element={<RepositorySelection />} />
            <Route path="/repositories/:user" element={<RepositorySelection />} />
            
            {/* Special dashboard routes */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/test-dashboard" element={<TestDashboard />} />
            
            {/* Legacy routes */}
            <Route path="/editor/:componentId" element={<ComponentEditor />} />
            <Route path="/editor-health-interventions" element={<ComponentEditor />} />
            
            {/* Documentation and utilities */}
            <Route path="/docs/:docId" element={<DocumentationViewer />} />
            <Route path="/pages" element={<PagesManager />} />
            
            {/* Test routes */}
            <Route path="/test-bpmn-viewer" element={<BPMNViewerTestComponent />} />
            <Route path="/test-framework" element={<LandingPageWithFramework />} />
            <Route path="/test-framework-dashboard/:user/:repo" element={<DAKDashboardWithFramework />} />
            <Route path="/test-framework-dashboard/:user/:repo/:branch" element={<DAKDashboardWithFramework />} />
            <Route path="/test-documentation" element={<TestDocumentationPage />} />
            <Route path="/test-asset-editor" element={<AssetEditorTest />} />
            
            {/* Dynamically generated DAK component routes */}
            {dakRoutes.map((route) => (
              <Route 
                key={route.key} 
                path={route.path} 
                element={route.element} 
              />
            ))}
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
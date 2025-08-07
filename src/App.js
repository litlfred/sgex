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
import QuestionnaireEditor from './components/QuestionnaireEditor';
import logger from './utils/logger';
import './App.css';

function App() {
  const appLogger = logger.getLogger('App');
  
  // Get basename from PUBLIC_URL or default to /sgex
  const basename = process.env.PUBLIC_URL || '/sgex';
  
  React.useEffect(() => {
    appLogger.componentMount();
    appLogger.info('SGEX Workbench application started', { 
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
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard/:user/:repo" element={<DAKDashboardWithFramework />} />
            <Route path="/dashboard/:user/:repo/:branch" element={<DAKDashboardWithFramework />} />
            <Route path="/test-dashboard" element={<TestDashboard />} />
            <Route path="/testing-viewer" element={<TestingViewer />} />
            <Route path="/testing-viewer/:user/:repo" element={<TestingViewer />} />
            <Route path="/testing-viewer/:user/:repo/:branch" element={<TestingViewer />} />
            <Route path="/testing-viewer/:user/:repo/:branch/*" element={<TestingViewer />} />
            <Route path="/core-data-dictionary-viewer" element={<CoreDataDictionaryViewer />} />
            <Route path="/core-data-dictionary-viewer/:user/:repo" element={<CoreDataDictionaryViewer />} />
            <Route path="/core-data-dictionary-viewer/:user/:repo/:branch" element={<CoreDataDictionaryViewer />} />
            <Route path="/core-data-dictionary-viewer/:user/:repo/:branch/*" element={<CoreDataDictionaryViewer />} />
            <Route path="/editor/:componentId" element={<ComponentEditor />} />
            <Route path="/editor-health-interventions" element={<ComponentEditor />} />
            <Route path="/health-interventions/:user/:repo" element={<ComponentEditor />} />
            <Route path="/health-interventions/:user/:repo/:branch" element={<ComponentEditor />} />
            <Route path="/health-interventions/:user/:repo/:branch/*" element={<ComponentEditor />} />
            <Route path="/actor-editor" element={<ActorEditor />} />
            <Route path="/actor-editor/:user/:repo" element={<ActorEditor />} />
            <Route path="/actor-editor/:user/:repo/:branch" element={<ActorEditor />} />
            <Route path="/actor-editor/:user/:repo/:branch/*" element={<ActorEditor />} />
            <Route path="/business-process-selection" element={<BusinessProcessSelection />} />
            <Route path="/business-process-selection/:user/:repo" element={<BusinessProcessSelection />} />
            <Route path="/business-process-selection/:user/:repo/:branch" element={<BusinessProcessSelection />} />
            <Route path="/bpmn-editor" element={<BPMNEditor />} />
            <Route path="/bpmn-editor/:user/:repo" element={<BPMNEditor />} />
            <Route path="/bpmn-editor/:user/:repo/:branch" element={<BPMNEditor />} />
            <Route path="/bpmn-editor/:user/:repo/:branch/*" element={<BPMNEditor />} />
            <Route path="/bpmn-viewer" element={<BPMNViewer />} />
            <Route path="/bpmn-viewer/:user/:repo" element={<BPMNViewer />} />
            <Route path="/bpmn-viewer/:user/:repo/:branch" element={<BPMNViewer />} />
            <Route path="/bpmn-viewer/:user/:repo/:branch/*" element={<BPMNViewer />} />
            <Route path="/test-bpmn-viewer" element={<BPMNViewerTestComponent />} />
            <Route path="/bpmn-source" element={<BPMNSource />} />
            <Route path="/bpmn-source/:user/:repo" element={<BPMNSource />} />
            <Route path="/bpmn-source/:user/:repo/:branch" element={<BPMNSource />} />
            <Route path="/bpmn-source/:user/:repo/:branch/*" element={<BPMNSource />} />
            <Route path="/decision-support-logic" element={<DecisionSupportLogicView />} />
            <Route path="/decision-support-logic/:user/:repo" element={<DecisionSupportLogicView />} />
            <Route path="/decision-support-logic/:user/:repo/:branch" element={<DecisionSupportLogicView />} />
            <Route path="/decision-support-logic/:user/:repo/:branch/*" element={<DecisionSupportLogicView />} />
            <Route path="/questionnaire-editor" element={<QuestionnaireEditor />} />
            <Route path="/questionnaire-editor/:user/:repo" element={<QuestionnaireEditor />} />
            <Route path="/questionnaire-editor/:user/:repo/:branch" element={<QuestionnaireEditor />} />
            <Route path="/docs/:docId" element={<DocumentationViewer />} />
            <Route path="/pages" element={<PagesManager />} />
            
            {/* Framework test routes */}
            <Route path="/test-framework" element={<LandingPageWithFramework />} />
            <Route path="/test-framework-dashboard/:user/:repo" element={<DAKDashboardWithFramework />} />
            <Route path="/test-framework-dashboard/:user/:repo/:branch" element={<DAKDashboardWithFramework />} />
            <Route path="/test-documentation" element={<TestDocumentationPage />} />
            <Route path="/test-asset-editor" element={<AssetEditorTest />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
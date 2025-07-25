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
import BPMNEditor from './components/BPMNEditor';
import BusinessProcessSelection from './components/BusinessProcessSelection';
import BPMNViewer from './components/BPMNViewerEnhanced';
import BPMNSource from './components/BPMNSource';
import DocumentationViewer from './components/DocumentationViewer';
import TestDashboard from './components/TestDashboard';
import './App.css';

function App() {
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
          <Route path="/test-dashboard" element={<TestDashboard />} />
          <Route path="/editor/:componentId" element={<ComponentEditor />} />
          <Route path="/business-process-selection" element={<BusinessProcessSelection />} />
          <Route path="/bpmn-editor" element={<BPMNEditor />} />
          <Route path="/bpmn-viewer" element={<BPMNViewer />} />
          <Route path="/bpmn-source" element={<BPMNSource />} />
          <Route path="/docs/:docId" element={<DocumentationViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DocumentationViewer from './components/DocumentationViewer';

function App() {
  return (
    <Router basename="/sgex">
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs/:docId" element={<DocumentationViewer />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
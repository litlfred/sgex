import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RepositorySelection from './components/RepositorySelection';
import DAKDashboard from './components/DAKDashboard';
import ComponentEditor from './components/ComponentEditor';
import './App.css';

function App() {
  return (
    <Router basename="/sgex">
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/repositories" element={<RepositorySelection />} />
          <Route path="/dashboard" element={<DAKDashboard />} />
          <Route path="/editor/:componentId" element={<ComponentEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
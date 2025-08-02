import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import BranchListing from './components/BranchListing';
import './App.css';

function App() {
  return (
    <div className="App">
      <BranchListing />
    </div>
  );
}

export default App;
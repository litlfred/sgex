import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SGEX Workbench</h1>
        <p>WHO SMART Guidelines Exchange</p>
        <p>
          A browser-based, standards-compliant collaborative editor for WHO SMART Guidelines 
          Digital Adaptation Kits (DAKs).
        </p>
        <div className="App-links">
          <h2>Documentation</h2>
          <ul>
            <li><a href="docs/project-plan.html">Project Plan</a></li>
            <li><a href="docs/requirements.html">Requirements</a></li>
            <li><a href="docs/solution-architecture.html">Solution Architecture</a></li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
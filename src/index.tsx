/**
 * React Application Entry Point
 * 
 * Initializes the React application with:
 * - React 19 strict mode
 * - Root DOM rendering
 * - Web vitals performance monitoring
 * - Central CSS loading
 * 
 * @module index
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles';  // Central CSS loader
import App from './App';
import reportWebVitals from './reportWebVitals';

/**
 * Get root element or throw error
 * @returns Root HTML element
 */
const getRootElement = (): HTMLElement => {
  const element = document.getElementById('root');
  if (!element) {
    throw new Error('Root element not found. Expected element with id="root" in HTML.');
  }
  return element;
};

// Create React root and render application
const root = ReactDOM.createRoot(getRootElement());
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

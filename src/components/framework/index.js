import React from 'react';

// Framework component exports
export const PageLayout = ({ children, title }) => (
  <div className="page-layout">
    <h1>{title}</h1>
    {children}
  </div>
);

export const Section = ({ children, title }) => (
  <section className="framework-section">
    {title && <h2>{title}</h2>}
    {children}
  </section>
);

export const Button = ({ children, onClick, variant = 'primary' }) => (
  <button 
    className={`framework-button framework-button--${variant}`}
    onClick={onClick}
  >
    {children}
  </button>
);
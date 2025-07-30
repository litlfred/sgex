import React from 'react';

const TestDocumentationPage = () => {
  const documentationSections = [
    { id: 1, title: 'Getting Started', content: 'Introduction to testing framework' },
    { id: 2, title: 'Writing Tests', content: 'How to write effective tests' },
    { id: 3, title: 'Test Patterns', content: 'Common testing patterns and best practices' },
    { id: 4, title: 'Debugging Tests', content: 'Tips for debugging failing tests' }
  ];

  return (
    <div className="test-documentation-page">
      <h1>Test Documentation</h1>
      <nav className="documentation-nav">
        {documentationSections.map(section => (
          <a key={section.id} href={`#section-${section.id}`} className="nav-link">
            {section.title}
          </a>
        ))}
      </nav>
      <div className="documentation-content">
        {documentationSections.map(section => (
          <section key={section.id} id={`section-${section.id}`} className="doc-section">
            <h2>{section.title}</h2>
            <p>{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default TestDocumentationPage;
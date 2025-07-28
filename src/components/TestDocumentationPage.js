import React from 'react';
import { PageLayout } from './framework';

const TestDocumentationPage = () => {
  return (
    <PageLayout pageName="documentation">
      <div className="documentation-page">
        <div className="documentation-content">
          <h1>Test Documentation Page</h1>
          <p>This is a test documentation page using the new page framework.</p>
          
          <h2>Framework Features Demonstrated</h2>
          <ul>
            <li>✅ Consistent header with SGEX logo</li>
            <li>✅ No documentation button (since this is the documentation page)</li>
            <li>✅ Help mascot in bottom right</li>
            <li>✅ Error handling with bug reporting</li>
            <li>✅ Top-level page type (no URL parameters)</li>
          </ul>

          <h2>URL Pattern</h2>
          <p>This page follows the Top-Level page pattern: <code>/sgex/&#123;page_name&#125;</code></p>
          
          <h2>Page Context</h2>
          <p>As a top-level page, no additional context is inferred from the URL path.</p>
          
          <h2>Header Components</h2>
          <p>This page should show:</p>
          <ul>
            <li>SGEX logo (clickable to go home)</li>
            <li>Login/user controls (based on authentication state)</li>
            <li>No documentation button (since this is the documentation page)</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
};

export default TestDocumentationPage;
import React, { useState } from 'react';
import { AssetEditorLayout } from './framework';

/**
 * Simple test component to demonstrate the asset editor framework
 */
const AssetEditorTest = () => {
  const [content, setContent] = useState('# Example Feature File\n\nFeature: Test Feature\n  In order to test the asset editor framework\n  As a developer\n  I want to edit and save content\n\n  Scenario: Edit content\n    Given I have content to edit\n    When I make changes\n    Then I can save locally or to GitHub');
  
  const [originalContent] = useState('# Example Feature File\n\nFeature: Test Feature\n  In order to test the asset editor framework\n  As a developer\n  I want to edit and save content\n\n  Scenario: Edit content\n    Given I have content to edit\n    When I make changes\n    Then I can save locally or to GitHub');

  // Mock file object
  const file = {
    name: 'test-feature.feature',
    path: 'input/features/test-feature.feature'
  };

  // Mock repository object
  const repository = {
    name: 'test-dak',
    owner: { login: 'demo-user' },
    full_name: 'demo-user/test-dak'
  };

  const handleSave = (savedContent, saveType) => {
    console.log(`Saved to ${saveType}:`, savedContent);
    alert(`Content saved to ${saveType}!`);
  };

  const hasChanges = content !== originalContent;

  return (
    <AssetEditorLayout
      pageName="asset-editor-test"
      file={file}
      repository={repository}
      branch="main"
      content={content}
      originalContent={originalContent}
      hasChanges={hasChanges}
      onSave={handleSave}
      saveButtonsPosition="top"
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        minHeight: '400px'
      }}>
        <h3>Asset Editor Framework Test</h3>
        <p>This demonstrates the new asset editor framework with independent save buttons.</p>
        
        <label htmlFor="content-editor">
          <strong>Edit Content:</strong>
        </label>
        <textarea
          id="content-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            flex: 1,
            minHeight: '300px',
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <span>File: {file.name}</span>
          <span>Repository: {repository.full_name}</span>
          <span>Branch: main</span>
          <span>Demo Mode: true</span>
          {hasChanges && <span style={{ color: '#007bff' }}>• Unsaved changes</span>}
        </div>
      </div>
    </AssetEditorLayout>
  );
};

export default AssetEditorTest;
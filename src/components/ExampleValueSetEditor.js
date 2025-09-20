/**
 * Example Tool - Demo Value Set Editor
 * 
 * This demonstrates how to create a simple tool using the new framework
 */

import React, { useState } from 'react';
import { createAssetEditor } from '../framework';

// The actual editor component
const ValueSetEditorComponent = ({ 
  toolState,
  onAssetSave,
  onGitHubSave 
}) => {
  const [content, setContent] = useState(toolState.content || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [parseError, setParseError] = useState(null);

  // Handle content changes
  const handleContentChange = (newContent) => {
    setContent(newContent);
    setHasChanges(newContent !== toolState.assets[0]?.content);
    
    // Validate JSON
    try {
      JSON.parse(newContent);
      setParseError(null);
    } catch (error) {
      setParseError(error.message);
    }
  };

  // Handle local save
  const handleSaveLocal = async () => {
    try {
      const result = await onAssetSave(content, 'local');
      if (result.result === 'success') {
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // Handle GitHub save
  const handleSaveGitHub = async () => {
    const commitMessage = prompt('Enter commit message:');
    if (commitMessage) {
      try {
        const result = await onGitHubSave(content, commitMessage);
        if (result.result === 'success') {
          setHasChanges(false);
        }
      } catch (error) {
        console.error('GitHub save error:', error);
      }
    }
  };

  const asset = toolState.assets[0];

  return (
    <div className="value-set-editor">
      <div className="editor-header">
        <h2>Value Set Editor</h2>
        <p>Editing: {asset?.path}</p>
        {hasChanges && <span className="changes-indicator">● Unsaved changes</span>}
      </div>

      {parseError && (
        <div className="error-message">
          <strong>JSON Parse Error:</strong> {parseError}
        </div>
      )}

      <div className="editor-toolbar">
        <button 
          onClick={handleSaveLocal}
          disabled={!hasChanges || parseError}
          className="save-local-btn"
        >
          Save Locally
        </button>
        <button 
          onClick={handleSaveGitHub}
          disabled={!hasChanges || parseError}
          className="save-github-btn"
        >
          Save to GitHub
        </button>
      </div>

      <div className="editor-content">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="json-editor"
          rows={25}
          cols={80}
          placeholder="Enter JSON content for the ValueSet..."
        />
      </div>

      <div className="editor-help">
        <h3>About Value Sets</h3>
        <p>
          Value sets define collections of coded values for use in SMART Guidelines.
          They must be valid JSON conforming to the FHIR ValueSet resource structure.
        </p>
        
        <h4>User Type Information:</h4>
        <ul>
          <li><strong>Authenticated users:</strong> Can save locally and to GitHub (if permissions allow)</li>
          <li><strong>Demo users:</strong> Can save locally only, GitHub saves are blocked</li>
          <li><strong>Unauthenticated users:</strong> Read-only access</li>
        </ul>
      </div>

      <style jsx>{`
        .value-set-editor {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .editor-header {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #ddd;
        }

        .editor-header h2 {
          margin: 0 0 0.5rem 0;
        }

        .changes-indicator {
          color: #ff6b35;
          font-weight: bold;
        }

        .error-message {
          background: #ffe6e6;
          border: 1px solid #ff9999;
          border-radius: 4px;
          padding: 0.75rem;
          margin-bottom: 1rem;
          color: #d32f2f;
        }

        .editor-toolbar {
          margin-bottom: 1rem;
          display: flex;
          gap: 1rem;
        }

        .save-local-btn, .save-github-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .save-local-btn {
          background: #4caf50;
          color: white;
        }

        .save-github-btn {
          background: #2196f3;
          color: white;
        }

        .save-local-btn:disabled, .save-github-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .json-editor {
          width: 100%;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 1rem;
          resize: vertical;
        }

        .editor-help {
          margin-top: 2rem;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .editor-help h3 {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
};

// Create the tool using the framework
const ValueSetEditor = createAssetEditor({
  id: 'value-set-editor',
  name: 'Value Set Editor',
  title: 'Value Set Editor',
  description: 'Edit FHIR ValueSet resources with validation and user access controls',
  assetTypes: ['json'],
  assetPattern: 'input/vocabulary/ValueSet-.*\\.json$',
  editorComponent: ValueSetEditorComponent,
  category: 'terminology',
  
  // Hooks
  onInit: async (context) => {
    console.log('Value Set Editor initialized', context);
  },
  
  onAssetSave: async (context) => {
    console.log('Asset saved', context);
    
    // You could add additional logic here, like:
    // - Validating the ValueSet structure
    // - Updating related files
    // - Notifying other services
  },
  
  onError: (error, context) => {
    console.error('Value Set Editor error:', error, context);
  }
});

export default ValueSetEditor;
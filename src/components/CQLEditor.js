/**
 * CQL Editor Component
 * 
 * Provides an editor for Clinical Quality Language (CQL) files with syntax highlighting,
 * execution capabilities, validation, and introspection features.
 */

import React, { useState, useEffect } from 'react';
import cqlExecutionService from '../services/cqlExecutionService';
import cqlIntrospectionService from '../services/cqlIntrospectionService';
import cqlValidationService from '../services/cqlValidationService';
import { lazyLoadSyntaxHighlighter, lazyLoadSyntaxHighlighterStyles } from '../utils/lazyRouteUtils';
import './CQLEditor.css';

const CQLEditor = ({
  file,
  content: initialContent = '',
  repository,
  branch = 'main',
  isDemo = false,
  onSave,
  onLibraryClick,
  dataDictionary,
  testData = []
}) => {
  // Editor state
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [syntaxHighlighter, setSyntaxHighlighter] = useState(null);
  const [syntaxStyle, setSyntaxStyle] = useState(null);

  // CQL-specific state
  const [executionResults, setExecutionResults] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [introspectionResults, setIntrospectionResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedTestData, setSelectedTestData] = useState([]);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'execution', 'validation', 'introspection'

  // Load syntax highlighter
  useEffect(() => {
    const loadSyntaxHighlighter = async () => {
      try {
        const [highlighter, style] = await Promise.all([
          lazyLoadSyntaxHighlighter(),
          lazyLoadSyntaxHighlighterStyles()
        ]);
        setSyntaxHighlighter(() => highlighter);
        setSyntaxStyle(style);
      } catch (error) {
        console.error('Failed to load syntax highlighter:', error);
      }
    };

    loadSyntaxHighlighter();
  }, []);

  // Initialize content
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Auto-introspect when content changes
  useEffect(() => {
    if (content) {
      const introspection = cqlIntrospectionService.parseCQLText(content);
      setIntrospectionResults(introspection);
    }
  }, [content]);

  // Load data dictionary for validation
  useEffect(() => {
    if (dataDictionary) {
      cqlValidationService.loadDataDictionary(dataDictionary);
    }
  }, [dataDictionary]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content, 'staging');
    }
  };

  const handleExecute = async () => {
    if (!content.trim()) {
      alert('Please enter CQL content to execute');
      return;
    }

    setIsExecuting(true);
    setActiveTab('execution');

    try {
      // For now, we'll create a simple demo execution since we need ELM JSON
      // In a real implementation, this would translate CQL to ELM first
      const demoElm = cqlExecutionService.translateCQL(content);
      const libraryName = `Demo_${Date.now()}`;
      
      cqlExecutionService.loadLibrary(libraryName, demoElm);
      const results = await cqlExecutionService.executeLibrary(libraryName, selectedTestData);
      
      setExecutionResults(results);
    } catch (error) {
      setExecutionResults({
        success: false,
        error: error.message,
        results: {}
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLibraryClick = (libraryName) => {
    if (onLibraryClick) {
      onLibraryClick(libraryName);
    } else {
      // Default behavior - show alert if no handler provided
      alert(`Navigate to library: ${libraryName}`);
    }
  };

  const handleValidate = () => {
    if (!content.trim()) {
      alert('Please enter CQL content to validate');
      return;
    }

    setActiveTab('validation');
    const validation = cqlValidationService.validateCQL(content);
    setValidationResults(validation);
  };

  const getFileInfo = () => {
    if (!file) return { name: 'New CQL File', path: 'untitled.cql' };
    return {
      name: file.name || 'CQL File',
      path: file.path || 'untitled.cql'
    };
  };

  const renderEditor = () => (
    <div className="cql-editor-container">
      <div className="editor-header">
        <div className="editor-title">
          <h3>{getFileInfo().name}</h3>
          <div className="file-path">{getFileInfo().path}</div>
        </div>
        <div className="editor-actions">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="edit-btn"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          {isEditing && (
            <button onClick={handleSave} className="save-btn">
              Save to Staging
            </button>
          )}
        </div>
      </div>

      <div className="editor-content">
        {isEditing ? (
          <div className="editor-split">
            <textarea
              value={content}
              onChange={handleContentChange}
              className="cql-editor-textarea"
              placeholder="Enter your CQL content here..."
              spellCheck={false}
            />
            <div className="editor-preview">
              <h4>Preview:</h4>
              {syntaxHighlighter && syntaxStyle ? (
                <syntaxHighlighter
                  language="sql" // Use SQL as fallback for CQL
                  style={syntaxStyle}
                  customStyle={{
                    margin: 0,
                    borderRadius: '4px',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                >
                  {content || '// CQL content will appear here...'}
                </syntaxHighlighter>
              ) : (
                <pre className="cql-preview">{content || '// CQL content will appear here...'}</pre>
              )}
            </div>
          </div>
        ) : (
          <div className="cql-viewer">
            {syntaxHighlighter && syntaxStyle ? (
              <syntaxHighlighter
                language="sql" // Use SQL as fallback for CQL
                style={syntaxStyle}
                customStyle={{
                  margin: 0,
                  borderRadius: '4px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  minHeight: '400px'
                }}
              >
                {content}
              </syntaxHighlighter>
            ) : (
              <pre className="cql-content">{content}</pre>
            )}
          </div>
        )}
      </div>

      <div className="editor-footer">
        <div className="editor-info">
          <span>CQL File • {content.split('\n').length} lines</span>
          {repository && <span>Repository: {repository.full_name}</span>}
          {branch && <span>Branch: {branch}</span>}
        </div>
        <div className="cql-actions">
          <button onClick={handleExecute} disabled={isExecuting} className="execute-btn">
            {isExecuting ? 'Executing...' : 'Execute CQL'}
          </button>
          <button onClick={handleValidate} className="validate-btn">
            Validate
          </button>
        </div>
      </div>
    </div>
  );

  const renderExecution = () => (
    <div className="cql-execution-panel">
      <h4>Execution Results</h4>
      
      <div className="test-data-selector">
        <label>Test Data:</label>
        <select 
          value={selectedTestData.length}
          onChange={(e) => {
            // For demo purposes, create simple test data
            const count = parseInt(e.target.value);
            const demoData = Array(count).fill(null).map((_, i) => ({
              resourceType: 'Patient',
              id: `patient-${i + 1}`,
              name: [{ given: ['Test'], family: `Patient${i + 1}` }]
            }));
            setSelectedTestData(demoData);
          }}
        >
          <option value="0">No test data</option>
          <option value="1">1 test patient</option>
          <option value="3">3 test patients</option>
          <option value="5">5 test patients</option>
        </select>
      </div>

      {executionResults && (
        <div className="execution-results">
          {executionResults.success ? (
            <div className="results-success">
              <h5>✅ Execution Successful</h5>
              <div className="results-data">
                <strong>Library:</strong> {executionResults.libraryName}<br/>
                <strong>Results:</strong>
                <pre>{JSON.stringify(executionResults.results, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="results-error">
              <h5>❌ Execution Failed</h5>
              <div className="error-message">{executionResults.error}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderValidation = () => (
    <div className="cql-validation-panel">
      <h4>Validation Results</h4>
      
      {validationResults && (
        <div className="validation-results">
          <div className={`validation-summary ${validationResults.isValid ? 'valid' : 'invalid'}`}>
            <h5>{validationResults.isValid ? '✅ Valid' : '❌ Invalid'}</h5>
            <div className="validation-stats">
              <span>Total Elements: {validationResults.summary.totalElements}</span>
              <span>Valid: {validationResults.summary.validElements}</span>
              <span>Invalid: {validationResults.summary.invalidElements}</span>
              <span>Missing: {validationResults.summary.missingElements}</span>
            </div>
          </div>

          {validationResults.errors.length > 0 && (
            <div className="validation-errors">
              <h6>Errors:</h6>
              <ul>
                {validationResults.errors.map((error, index) => (
                  <li key={index} className="error-item">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResults.dataElementValidation.length > 0 && (
            <div className="data-element-validation">
              <h6>Data Elements:</h6>
              {validationResults.dataElementValidation.map((validation, index) => (
                <div key={index} className={`element-validation ${validation.isValid ? 'valid' : 'invalid'}`}>
                  <span className="element-name">{validation.element}</span>
                  <span className="element-status">
                    {validation.isValid ? '✅' : '❌'}
                    {validation.source && ` (${validation.source})`}
                  </span>
                  {validation.issues.length > 0 && (
                    <div className="element-issues">
                      {validation.issues.map((issue, i) => (
                        <div key={i} className="issue">{issue.message}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderIntrospection = () => (
    <div className="cql-introspection-panel">
      <h4>Introspection Results</h4>
      
      {introspectionResults && (
        <div className="introspection-results">
          <div className="introspection-summary">
            <div className="summary-item">
              <strong>Context:</strong> {introspectionResults.context || 'Not specified'}
            </div>
            <div className="summary-item">
              <strong>Data Elements:</strong> {introspectionResults.dataElements.length}
            </div>
            <div className="summary-item">
              <strong>Libraries:</strong> {introspectionResults.libraries.length}
            </div>
            <div className="summary-item">
              <strong>Value Sets:</strong> {introspectionResults.valueSets.length}
            </div>
          </div>

          {introspectionResults.dataElements.length > 0 && (
            <div className="introspection-section">
              <h6>Data Elements Referenced:</h6>
              <ul className="element-list">
                {introspectionResults.dataElements.map((element, index) => (
                  <li key={index} className="element-item">{element}</li>
                ))}
              </ul>
            </div>
          )}

          {introspectionResults.libraries.length > 0 && (
            <div className="introspection-section">
              <h6>Library Dependencies:</h6>
              <ul className="library-list">
                {introspectionResults.libraries.map((library, index) => (
                  <li key={index} className="library-item">
                    <span className="library-name">{library}</span>
                    <button 
                      className="library-link"
                      onClick={() => handleLibraryClick(library)}
                      title={`Navigate to library: ${library}`}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {introspectionResults.valueSets.length > 0 && (
            <div className="introspection-section">
              <h6>Value Sets:</h6>
              <ul className="valueset-list">
                {introspectionResults.valueSets.map((valueSet, index) => (
                  <li key={index} className="valueset-item">{valueSet}</li>
                ))}
              </ul>
            </div>
          )}

          {introspectionResults.definitions.length > 0 && (
            <div className="introspection-section">
              <h6>Definitions:</h6>
              <ul className="definition-list">
                {introspectionResults.definitions.map((definition, index) => (
                  <li key={index} className="definition-item">{definition}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="cql-editor">
      <div className="cql-tabs">
        <button 
          className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Editor
        </button>
        <button 
          className={`tab ${activeTab === 'execution' ? 'active' : ''}`}
          onClick={() => setActiveTab('execution')}
        >
          Execution
        </button>
        <button 
          className={`tab ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Validation
        </button>
        <button 
          className={`tab ${activeTab === 'introspection' ? 'active' : ''}`}
          onClick={() => setActiveTab('introspection')}
        >
          Introspection
        </button>
      </div>

      <div className="cql-tab-content">
        {activeTab === 'editor' && renderEditor()}
        {activeTab === 'execution' && renderExecution()}
        {activeTab === 'validation' && renderValidation()}
        {activeTab === 'introspection' && renderIntrospection()}
      </div>
    </div>
  );
};

export default CQLEditor;
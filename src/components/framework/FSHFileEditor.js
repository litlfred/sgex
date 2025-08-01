import React, { useState, useCallback, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { registerEnhancedFSH, enhancedFSHStyles } from '../../utils/fshSyntax';
import './FSHFileEditor.css';

/**
 * Reusable FSH (FHIR Shorthand) file editor component with syntax highlighting and minimal validation
 * Can be used across the application for editing FSH files
 */
const FSHFileEditor = ({ 
  content = '', 
  fileName, 
  onChange,
  onSave,
  showFileName = true, 
  className = '', 
  style = {},
  customStyle = {},
  readonly = false,
  placeholder = 'Enter FSH content...'
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  // Update internal state when content prop changes
  useEffect(() => {
    setEditorContent(content);
    setHasChanges(false);
  }, [content]);

  // Register enhanced FSH syntax on component mount
  useEffect(() => {
    registerEnhancedFSH();
  }, []);

  // Basic FSH validation (minimal implementation)
  const validateContent = useCallback((fshContent) => {
    setIsValidating(true);
    const errors = [];

    // Basic syntax validation
    const lines = fshContent.split('\n');
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        return;
      }

      // Check for basic FSH structure violations
      if (trimmedLine.includes('Profile:') || trimmedLine.includes('Instance:') || 
          trimmedLine.includes('ValueSet:') || trimmedLine.includes('CodeSystem:')) {
        // Check if it's properly formatted (should start with these keywords)
        if (!trimmedLine.startsWith('Profile:') && !trimmedLine.startsWith('Instance:') &&
            !trimmedLine.startsWith('ValueSet:') && !trimmedLine.startsWith('CodeSystem:')) {
          errors.push({
            line: index + 1,
            message: 'FSH resource definitions should start with the resource type keyword',
            severity: 'warning'
          });
        }
      }

      // Check for missing quotes in string values
      if (trimmedLine.includes('Title:') || trimmedLine.includes('Description:')) {
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0) {
          const value = trimmedLine.substring(colonIndex + 1).trim();
          if (value && !value.startsWith('"') && !value.endsWith('"')) {
            errors.push({
              line: index + 1,
              message: 'Title and Description values should be quoted strings',
              severity: 'warning'
            });
          }
        }
      }

      // Check for malformed cardinality
      const cardinalityRegex = /\d+\.\.\*|\d+\.\.\d+|\d+/;
      if (trimmedLine.includes('..') && !cardinalityRegex.test(trimmedLine)) {
        errors.push({
          line: index + 1,
          message: 'Invalid cardinality format. Use patterns like 0..1, 1..*, 0..*, etc.',
          severity: 'error'
        });
      }
    });

    setValidationErrors(errors);
    setIsValidating(false);
  }, []);

  // Handle content changes
  const handleContentChange = useCallback((event) => {
    const newContent = event.target.value;
    setEditorContent(newContent);
    setHasChanges(newContent !== content);
    
    // Trigger onChange callback if provided
    if (onChange) {
      onChange(newContent);
    }

    // Debounced validation
    if (!readonly) {
      validateContent(newContent);
    }
  }, [content, onChange, readonly, validateContent]);

  // Handle save action
  const handleSave = useCallback(() => {
    if (onSave && hasChanges) {
      onSave(editorContent);
      setHasChanges(false);
    }
  }, [onSave, hasChanges, editorContent]);

  // Handle key shortcuts
  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    }
  }, [handleSave]);

  // Enhanced FSH syntax highlighting style
  const fshStyle = {
    ...prism,
    ...enhancedFSHStyles,
    'pre[class*="language-"]': {
      ...prism['pre[class*="language-"]'],
      ...enhancedFSHStyles['pre[class*="language-"]'],
      background: '#fff',
      border: 'none',
      borderRadius: '0',
      overflow: 'visible',
      padding: '0',
      margin: '0',
      ...customStyle
    }
  };

  const hasErrors = validationErrors.filter(e => e.severity === 'error').length > 0;

  return (
    <div className={`fsh-file-editor ${className} ${readonly ? 'readonly' : ''}`} style={style}>
      {showFileName && fileName && (
        <div className="fsh-editor-header">
          <div className="fsh-editor-info">
            <span className="fsh-file-name">{fileName}</span>
            <span className="fsh-file-type">FSH</span>
            {hasChanges && <span className="fsh-changes-indicator">• Unsaved changes</span>}
          </div>
          {!readonly && (
            <div className="fsh-editor-actions">
              {validationErrors.length > 0 && (
                <span className={`validation-status ${hasErrors ? 'has-errors' : 'has-warnings'}`}>
                  {hasErrors ? `${validationErrors.filter(e => e.severity === 'error').length} errors` :
                   `${validationErrors.filter(e => e.severity === 'warning').length} warnings`}
                </span>
              )}
              {hasChanges && (
                <button 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={hasErrors}
                  title={hasErrors ? 'Fix errors before saving' : 'Save changes (Ctrl+S)'}
                >
                  Save
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="fsh-editor-content">
        {readonly ? (
          <SyntaxHighlighter
            language="fsh"
            style={fshStyle}
            showLineNumbers={true}
            wrapLines={true}
          >
            {editorContent}
          </SyntaxHighlighter>
        ) : (
          <div className="fsh-editor-wrapper">
            <textarea
              className="fsh-editor-textarea"
              value={editorContent}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
            <div className="fsh-editor-overlay">
              <SyntaxHighlighter
                language="fsh"
                style={fshStyle}
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{
                  background: 'transparent',
                  pointerEvents: 'none'
                }}
              >
                {editorContent || ' '}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="fsh-validation-panel">
          <div className="validation-header">
            <span className="validation-title">
              {isValidating ? 'Validating...' : `${validationErrors.length} validation ${validationErrors.length === 1 ? 'issue' : 'issues'}`}
            </span>
          </div>
          <div className="validation-list">
            {validationErrors.map((error, index) => (
              <div key={index} className={`validation-item ${error.severity}`}>
                <span className="validation-line">Line {error.line}:</span>
                <span className="validation-message">{error.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Note: Enhanced FSH language registration is handled by the registerEnhancedFSH() utility

export default FSHFileEditor;
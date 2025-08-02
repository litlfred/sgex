import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './FSHFileEditor.css';

/**
 * FSHFileEditor - A reusable component for editing FHIR Shorthand (FSH) files with syntax highlighting
 * 
 * @param {Object} props
 * @param {string} props.content - The initial FSH file content
 * @param {string} props.filename - The name of the FSH file
 * @param {Function} props.onChange - Callback when content changes (content) => void
 * @param {Function} props.onSave - Callback when save is triggered (content) => void
 * @param {boolean} props.readOnly - Whether the editor is read-only (default: false)
 * @param {boolean} props.showLineNumbers - Whether to show line numbers (default: true)
 * @param {string} props.theme - Theme for syntax highlighting ('dark' or 'light', default: 'light')
 * @param {Object} props.style - Additional CSS styles for the container
 */
const FSHFileEditor = ({ 
  content = '', 
  filename, 
  onChange,
  onSave,
  readOnly = false,
  showLineNumbers = true, 
  theme = 'light',
  style = {} 
}) => {
  
  const [editorContent, setEditorContent] = useState(content);
  const [isModified, setIsModified] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Basic FSH validation
  const validateFSH = useCallback((fshContent) => {
    const errors = [];
    const lines = fshContent.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        return;
      }
      
      // Check for unclosed strings
      const stringMatches = trimmedLine.match(/"/g);
      if (stringMatches && stringMatches.length % 2 !== 0) {
        errors.push({
          line: lineNumber,
          message: 'Unclosed string literal',
          severity: 'error'
        });
      }
      
      // Check for missing colons after keywords that require them
      if (/^(Id|Title|Description|Usage|Parent|Source|Target)\s*[^:]/.test(trimmedLine)) {
        errors.push({
          line: lineNumber,
          message: 'Missing colon after keyword',
          severity: 'warning'
        });
      }
      
      // Check for invalid cardinality syntax
      if (/\d+\.\.[^*\d]/.test(trimmedLine)) {
        errors.push({
          line: lineNumber,
          message: 'Invalid cardinality syntax',
          severity: 'error'
        });
      }
    });
    
    return errors;
  }, []);

  const handleContentChange = useCallback((event) => {
    const newContent = event.target.value;
    setEditorContent(newContent);
    setIsModified(newContent !== content);
    
    // Validate content
    const errors = validateFSH(newContent);
    setValidationErrors(errors);
    
    if (onChange) {
      onChange(newContent);
    }
  }, [content, onChange, validateFSH]);

  const handleSave = useCallback(() => {
    if (onSave && !readOnly) {
      onSave(editorContent);
      setIsModified(false);
    }
  }, [editorContent, onSave, readOnly]);

  const handleKeyDown = useCallback((event) => {
    // Save on Ctrl+S (or Cmd+S on Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      handleSave();
    }
    
    // Tab support for indentation
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab character
      const newContent = editorContent.substring(0, start) + '  ' + editorContent.substring(end);
      setEditorContent(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
      
      if (onChange) {
        onChange(newContent);
      }
    }
  }, [editorContent, onChange, handleSave]);

  return (
    <div className="fsh-file-editor" style={style}>
      {filename && (
        <div className="fsh-editor-header">
          <h4 className="fsh-filename">
            <span className="fsh-file-icon">✏️</span>
            {filename}
            {isModified && <span className="modified-indicator">*</span>}
          </h4>
          <div className="fsh-editor-actions">
            {validationErrors.length > 0 && (
              <span className="validation-status error">
                ⚠️ {validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''}
              </span>
            )}
            {!readOnly && (
              <button 
                className="save-btn"
                onClick={handleSave}
                disabled={!isModified}
                title="Save changes (Ctrl+S)"
              >
                💾 Save
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="fsh-editor-content">
        {readOnly ? (
          // Read-only view with syntax highlighting
          <SyntaxHighlighter
            language="javascript" // Using JavaScript for basic highlighting
            style={theme === 'dark' ? vscDarkPlus : prism}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '0.9rem',
              lineHeight: '1.5',
              background: theme === 'dark' ? '#1e1e1e' : '#f8f9fa'
            }}
          >
            {editorContent}
          </SyntaxHighlighter>
        ) : (
          // Editable textarea
          <textarea
            className={`fsh-editor-textarea ${theme}`}
            value={editorContent}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter FSH content here..."
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            wrap="off"
          />
        )}
      </div>
      
      {validationErrors.length > 0 && (
        <div className="fsh-validation-panel">
          <h5>Validation Issues:</h5>
          <ul className="validation-errors">
            {validationErrors.map((error, index) => (
              <li key={index} className={`validation-error ${error.severity}`}>
                <span className="line-number">Line {error.line}:</span>
                <span className="error-message">{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FSHFileEditor;
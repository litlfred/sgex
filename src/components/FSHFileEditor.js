import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './FSHFileEditor.css';

/**
 * General-purpose FHIR FSH file editor component with syntax highlighting
 * 
 * @param {Object} props
 * @param {string} props.content - The initial FSH file content
 * @param {string} props.fileName - The name of the FSH file (optional)
 * @param {Function} props.onChange - Callback when content changes
 * @param {Function} props.onSave - Callback when save is triggered
 * @param {boolean} props.readOnly - Whether the editor is read-only (default: false)
 * @param {boolean} props.showPreview - Whether to show live preview (default: true)
 * @param {Object} props.customStyle - Custom styles for the editor (optional)
 * @param {string} props.placeholder - Placeholder text for empty editor
 * @param {string} props.className - Additional CSS class names
 */
const FSHFileEditor = ({ 
  content = '', 
  fileName = '', 
  onChange = () => {},
  onSave = () => {},
  readOnly = false,
  showPreview = true,
  customStyle = {},
  placeholder = 'Enter your FSH content here...',
  className = ''
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const textareaRef = useRef(null);

  // Check if dark mode is active
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.body.classList.contains('theme-dark'));
    };

    // Initial check
    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  // Update content when prop changes
  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
      setHasChanges(false);
    }
  }, [content, editorContent]);

  // Handle content changes
  const handleContentChange = (event) => {
    const newContent = event.target.value;
    setEditorContent(newContent);
    setHasChanges(newContent !== content);
    onChange(newContent);
  };

  // Handle save action
  const handleSave = () => {
    onSave(editorContent);
    setHasChanges(false);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (event) => {
    // Ctrl+S or Cmd+S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      if (hasChanges && !readOnly) {
        handleSave();
      }
    }
    
    // Tab to insert spaces instead of changing focus
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '  '; // 2 spaces for FSH indentation
      
      // Insert spaces at cursor position
      const newContent = editorContent.substring(0, start) + spaces + editorContent.substring(end);
      setEditorContent(newContent);
      setHasChanges(newContent !== content);
      onChange(newContent);
      
      // Move cursor after inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  // Auto-resize textarea
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    autoResize();
  }, [editorContent]);

  // Choose syntax highlighting theme based on dark mode
  const syntaxTheme = isDarkMode ? oneDark : oneLight;

  // Syntax highlighting styles
  const previewStyle = {
    margin: 0,
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    background: 'transparent', // Let CSS handle background
    border: 'none',
    maxHeight: '400px',
    overflow: 'auto',
    ...customStyle
  };

  return (
    <div className={`fsh-file-editor ${className} ${isEditing ? 'editing' : 'viewing'}`}>
      {fileName && (
        <div className="fsh-editor-header">
          <div className="file-info">
            <div className="file-icon">📝</div>
            <div className="file-name">{fileName}</div>
            <div className="file-type">FSH</div>
          </div>
          
          <div className="editor-controls">
            {hasChanges && (
              <span className="changes-indicator">• Unsaved changes</span>
            )}
            
            {!readOnly && (
              <>
                <button 
                  className={`mode-toggle ${isEditing ? 'active' : ''}`}
                  onClick={() => setIsEditing(!isEditing)}
                  title={isEditing ? 'Switch to view mode' : 'Switch to edit mode'}
                >
                  {isEditing ? '👁️ View' : '✏️ Edit'}
                </button>
                
                {hasChanges && (
                  <button 
                    className="save-btn"
                    onClick={handleSave}
                    title="Save changes (Ctrl+S)"
                  >
                    💾 Save
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="fsh-editor-content">
        {isEditing && !readOnly ? (
          <div className="editor-layout">
            <div className="editor-pane">
              <textarea
                ref={textareaRef}
                value={editorContent}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onInput={autoResize}
                placeholder={placeholder}
                className="fsh-textarea"
                spellCheck={false}
                rows={10}
              />
            </div>
            
            {showPreview && (
              <div className="preview-pane">
                <div className="preview-header">
                  <span>Preview</span>
                </div>
                <div className="preview-content">
                  <SyntaxHighlighter
                    language="javascript"
                    style={syntaxTheme}
                    customStyle={previewStyle}
                  >
                    {editorContent || '// FSH content preview will appear here...'}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="viewer-pane">
            <SyntaxHighlighter
              language="javascript"
              style={syntaxTheme}
              customStyle={{
                ...previewStyle,
                minHeight: '200px',
                maxHeight: 'none'
              }}
              showLineNumbers={true}
              wrapLines={true}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#6c757d',
                textAlign: 'right'
              }}
            >
              {editorContent || '// FSH content will appear here...'}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
      
      {(editorContent || isEditing) && (
        <div className="fsh-editor-footer">
          <div className="content-stats">
            <span>{editorContent.split('\n').length} lines</span>
            <span>•</span>
            <span>{editorContent.length} characters</span>
          </div>
          
          <div className="editor-help">
            {isEditing && !readOnly && (
              <span className="keyboard-hint">Press Tab for indentation • Ctrl+S to save</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FSHFileEditor;
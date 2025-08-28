import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './FSHFileViewer.css';

/**
 * General-purpose FHIR FSH file viewer component with syntax highlighting
 * 
 * @param {Object} props
 * @param {string} props.content - The FSH file content to display
 * @param {string} props.fileName - The name of the FSH file (optional)
 * @param {Object} props.customStyle - Custom styles for the syntax highlighter (optional)
 * @param {boolean} props.showLineNumbers - Whether to show line numbers (default: false)
 * @param {string} props.className - Additional CSS class names
 */
const FSHFileViewer = ({ 
  content = '', 
  fileName = '', 
  customStyle = {}, 
  showLineNumbers = false,
  className = ''
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Choose syntax highlighting theme based on dark mode
  const syntaxTheme = isDarkMode ? oneDark : oneLight;

  // Default styles for FSH syntax highlighting
  const defaultStyle = {
    margin: 0,
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    background: 'transparent', // Let CSS handle background
    border: 'none',
    ...customStyle
  };

  return (
    <div className={`fsh-file-viewer ${className}`}>
      {fileName && (
        <div className="fsh-file-header">
          <div className="file-icon">📄</div>
          <div className="file-name">{fileName}</div>
          <div className="file-type">FSH</div>
        </div>
      )}
      
      <div className="fsh-syntax-container">
        <SyntaxHighlighter
          language="javascript" // Using javascript as closest match for FSH syntax
          style={syntaxTheme}
          customStyle={defaultStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#6c757d',
            textAlign: 'right'
          }}
        >
          {content || '// FSH content will appear here...'}
        </SyntaxHighlighter>
      </div>
      
      {content && (
        <div className="fsh-file-footer">
          <span className="content-info">
            {content.split('\n').length} lines • {content.length} characters
          </span>
        </div>
      )}
    </div>
  );
};

export default FSHFileViewer;
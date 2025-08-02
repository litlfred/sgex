import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
  // Default styles for FSH syntax highlighting
  const defaultStyle = {
    margin: 0,
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
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
          style={oneLight}
          customStyle={defaultStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#6c757d',
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
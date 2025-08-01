import React, { useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { registerEnhancedFSH, enhancedFSHStyles } from '../../utils/fshSyntax';
import './FSHFileViewer.css';

/**
 * Reusable FSH (FHIR Shorthand) file viewer component with syntax highlighting
 * Can be used across the application for displaying FSH files
 */
const FSHFileViewer = ({ 
  content, 
  fileName, 
  showFileName = true, 
  className = '', 
  style = {},
  customStyle = {}
}) => {
  // Register enhanced FSH syntax on component mount
  useEffect(() => {
    registerEnhancedFSH();
  }, []);

  // Enhanced FSH syntax highlighting style
  const fshStyle = {
    ...prism,
    ...enhancedFSHStyles,
    'pre[class*="language-"]': {
      ...prism['pre[class*="language-"]'],
      ...enhancedFSHStyles['pre[class*="language-"]'],
      ...customStyle
    }
  };

  // FSH-specific language definition for syntax highlighting
  // Note: Enhanced definition is registered by registerEnhancedFSH() above

  return (
    <div className={`fsh-file-viewer ${className}`} style={style}>
      {showFileName && fileName && (
        <div className="fsh-file-header">
          <span className="fsh-file-name">{fileName}</span>
          <span className="fsh-file-type">FSH</span>
        </div>
      )}
      <div className="fsh-content">
        <SyntaxHighlighter
          language="fsh"
          style={fshStyle}
          customStyle={{
            margin: 0,
            background: 'transparent'
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#666',
            borderRight: '1px solid #e9ecef',
            marginRight: '1em'
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {content || ''}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Note: Enhanced FSH language registration is handled by the registerEnhancedFSH() utility

export default FSHFileViewer;
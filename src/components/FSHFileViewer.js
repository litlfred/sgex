import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './FSHFileViewer.css';

/**
 * FSHFileViewer - A reusable component for viewing FHIR Shorthand (FSH) files with syntax highlighting
 * 
 * @param {Object} props
 * @param {string} props.content - The FSH file content to display
 * @param {string} props.filename - The name of the FSH file
 * @param {boolean} props.showLineNumbers - Whether to show line numbers (default: true)
 * @param {string} props.theme - Theme for syntax highlighting (default: 'dark')
 * @param {Object} props.style - Additional CSS styles for the container
 */
const FSHFileViewer = ({ 
  content, 
  filename, 
  showLineNumbers = true, 
  theme = 'dark',
  style = {} 
}) => {
  
  // Register custom language if not already registered
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.Prism) {
      // Custom FSH language definition for syntax highlighting
      const fshLanguageDef = {
        'comment': [
          {
            pattern: /\/\/.*$/m,
            greedy: true
          },
          {
            pattern: /\/\*[\s\S]*?\*\//,
            greedy: true
          }
        ],
        'string': {
          pattern: /"(?:[^"\\]|\\.)*"/,
          greedy: true
        },
        'keyword': /\b(?:Profile|Extension|Instance|ValueSet|CodeSystem|Invariant|Mapping|Logical|Resource|RuleSet|Alias|contains|named|from|only|or|and|obeys|insert|include|exclude)\b/,
        'fsh-keyword': /\b(?:Id|Title|Description|Usage|Parent|Mixins|Severity|Expression|XPath|Source|Target)\b/,
        'cardinality': /\b\d+\.\.\*?\b|\b\d+\.\.\d+\b|\b\d+\b/,
        'operator': /\*|=|\||->|<-|\^|\+/,
        'url': /https?:\/\/[^\s"]+/,
        'code': /#[a-zA-Z0-9\-_.]+/,
        'number': /\b\d+(?:\.\d+)?\b/,
        'punctuation': /[{}[\];(),.:]/
      };
      
      window.Prism.languages.fsh = fshLanguageDef;
    }
  }, []);

  const getThemeStyle = () => {
    switch (theme) {
      case 'light':
        return {
          ...vscDarkPlus,
          'pre[class*="language-"]': {
            ...vscDarkPlus['pre[class*="language-"]'],
            background: '#f8f9fa',
            color: '#2c3e50'
          },
          'code[class*="language-"]': {
            ...vscDarkPlus['code[class*="language-"]'],
            background: '#f8f9fa',
            color: '#2c3e50'
          }
        };
      case 'dark':
      default:
        return vscDarkPlus;
    }
  };

  if (!content) {
    return (
      <div className="fsh-file-viewer" style={style}>
        <div className="fsh-viewer-header">
          {filename && <h4 className="fsh-filename">{filename}</h4>}
        </div>
        <div className="fsh-content-empty">
          <p>No content to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fsh-file-viewer" style={style}>
      {filename && (
        <div className="fsh-viewer-header">
          <h4 className="fsh-filename">
            <span className="fsh-file-icon">📄</span>
            {filename}
          </h4>
        </div>
      )}
      <div className="fsh-content">
        <SyntaxHighlighter
          language="fsh"
          style={getThemeStyle()}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            borderRadius: filename ? '0 0 8px 8px' : '8px',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}
          codeTagProps={{
            style: {
              fontFamily: 'Consolas, Monaco, "Courier New", monospace'
            }
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default FSHFileViewer;
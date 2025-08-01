import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
  // Custom FSH syntax highlighting style based on the existing theme
  const fshStyle = {
    ...prism,
    'pre[class*="language-"]': {
      ...prism['pre[class*="language-"]'],
      background: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '4px',
      fontSize: '14px',
      lineHeight: '1.5',
      overflow: 'auto',
      padding: '1rem',
      margin: '0',
      ...customStyle
    },
    'code[class*="language-"]': {
      ...prism['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '14px',
      lineHeight: '1.5'
    }
  };

  // FSH-specific language definition for syntax highlighting
  // This covers basic FSH syntax patterns
  // Note: Currently handled by window.Prism setup below
  // const fshLanguageDefinition = { ... };

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

// Register FSH language with react-syntax-highlighter if not already registered
if (typeof window !== 'undefined' && window.Prism) {
  window.Prism.languages.fsh = {
    'comment': /\/\/.*|\/\*[\s\S]*?\*\//,
    'string': /"(?:[^"\\]|\\.)*"/,
    'keyword': /\b(?:Profile|Extension|Instance|ValueSet|CodeSystem|ConceptMap|StructureDefinition|Logical|Resource|Mapping|RuleSet|Invariant|Alias)\b/,
    'fsh-keyword': /\b(?:Parent|Id|Title|Description|Usage|Severity|Expression|Source|Target|Equivalence|Comment|XPath)\b/,
    'fsh-constraint': /\b(?:only|or|and|from|exactly|contains|named|insert|include|exclude)\b/,
    'fsh-cardinality': /\d+\.\.\*|\d+\.\.\d+|\d+/,
    'fsh-datatype': /\b(?:string|boolean|integer|decimal|date|dateTime|time|code|uri|url|canonical|base64Binary|instant|oid|id|markdown|unsignedInt|positiveInt|uuid|Address|Age|Annotation|Attachment|CodeableConcept|Coding|ContactPoint|Count|Distance|Duration|HumanName|Identifier|Money|Period|Quantity|Range|Ratio|Reference|SampledData|Signature|Timing|ContactDetail|Contributor|DataRequirement|Expression|ParameterDefinition|RelatedArtifact|TriggerDefinition|UsageContext|Dosage|Meta)\b/,
    'fsh-profile': /\*\s+\w+/,
    'punctuation': /[{}[\];(),.:]/,
    'operator': /=|\^/,
    'number': /\b\d+(?:\.\d+)?\b/
  };
}

export default FSHFileViewer;
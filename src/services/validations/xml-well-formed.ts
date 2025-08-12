/**
 * XML-WELL-FORMED Validation (TypeScript)
 * 
 * XML files must be well-formed according to XML 1.0 specification
 */

import { ValidationDefinition, ValidationContext, DAKValidationResult } from '../../types/core';

// Helper function for checking XML content
function isXMLContent(content: string): boolean {
  const trimmedContent = content.trim();
  return trimmedContent.startsWith('<?xml') || 
         trimmedContent.startsWith('<') && 
         (trimmedContent.includes('xmlns') || trimmedContent.includes('<?xml'));
}

const xmlWellFormed: ValidationDefinition = {
  id: 'xml-well-formed',
  component: 'file-structure',
  level: 'error',
  fileTypes: ['xml', 'bpmn', 'dmn'],
  descriptionKey: 'validation.xml.wellFormed.description',
  description: 'XML files must be well-formed according to XML 1.0 specification',
  
  async validate(filePath: string, content: string, context: ValidationContext): Promise<DAKValidationResult | null> {
    // Only validate XML-based files
    if (!filePath.endsWith('.xml') && !filePath.endsWith('.bpmn') && 
        !filePath.endsWith('.dmn') && !isXMLContent(content)) {
      return null;
    }
    
    try {
      // Use DOMParser to check if XML is well-formed
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        const errorText = parserError.textContent || 'Unknown parsing error';
        
        // Try to extract line and column information from error message
        const lineMatch = errorText.match(/line (\d+)/i);
        const columnMatch = errorText.match(/column (\d+)/i);
        
        let line = 1;
        let column = 1;
        
        if (lineMatch) {
          line = parseInt(lineMatch[1], 10);
        }
        
        if (columnMatch) {
          column = parseInt(columnMatch[1], 10);
        }
        
        return {
          validationId: 'xml-well-formed',
          component: 'file-structure',
          level: 'error',
          description: 'XML files must be well-formed according to XML 1.0 specification',
          filePath,
          message: `XML parsing error: ${errorText}`,
          line: line,
          column: column,
          suggestion: 'Fix XML syntax errors such as unclosed tags, invalid characters, or malformed attributes'
        };
      }
      
      return null; // Valid XML
      
    } catch (error: any) {
      // Fallback error handling for environments where DOMParser isn't available
      return {
        validationId: 'xml-well-formed',
        component: 'file-structure',
        level: 'error',
        description: 'XML files must be well-formed according to XML 1.0 specification',
        filePath,
        message: `XML validation error: ${error.message}`,
        line: 1,
        column: 1,
        suggestion: 'Ensure the XML file follows valid XML 1.0 syntax'
      };
    }
  }
};

// Add metadata for reference
export const metadata = {
  standard: 'XML 1.0',
  reference: 'https://www.w3.org/TR/xml/',
  severity: 'critical'
};

export default xmlWellFormed;
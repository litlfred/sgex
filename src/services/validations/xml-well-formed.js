/**
 * XML-WELL-FORMED Validation
 * 
 * XML files must be well-formed
 */
export default {
  id: 'xml-well-formed',
  component: 'file-structure',
  level: 'error',
  fileTypes: ['xml', 'bpmn', 'dmn'],
  descriptionKey: 'validation.xml.wellFormed.description',
  description: 'XML files must be well-formed',
  
  async validate(filePath, content, context) {
    // Only validate XML-based files
    if (!this.isXMLFile(filePath, content)) {
      return null;
    }
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        const errorText = parserError.textContent || parserError.innerText || '';
        const lineMatch = errorText.match(/line (\d+)/i);
        const columnMatch = errorText.match(/column (\d+)/i);
        
        return {
          message: `XML parsing error: ${errorText}`,
          line: lineMatch ? parseInt(lineMatch[1]) : 1,
          column: columnMatch ? parseInt(columnMatch[1]) : 1,
          suggestion: 'Fix XML syntax errors such as unclosed tags, invalid characters, or malformed attributes'
        };
      }
      
      return null; // Valid XML
      
    } catch (error) {
      return {
        message: `XML validation error: ${error.message}`,
        line: 1,
        column: 1,
        suggestion: 'Ensure the file contains valid XML syntax'
      };
    }
  },
  
  isXMLFile(filePath, content) {
    // Check file extension
    if (filePath.endsWith('.xml') || filePath.endsWith('.bpmn') || filePath.endsWith('.dmn')) {
      return true;
    }
    
    // Check content for XML declaration or typical XML structure
    const trimmedContent = content.trim();
    return trimmedContent.startsWith('<?xml') || 
           trimmedContent.startsWith('<') && trimmedContent.includes('xmlns');
  },
  
  metadata: {
    standard: 'XML 1.0',
    reference: 'https://www.w3.org/TR/xml/',
    severity: 'critical'
  }
};
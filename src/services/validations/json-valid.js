/**
 * JSON-VALID Validation
 * 
 * JSON files must be valid JSON
 */
export default {
  id: 'json-valid',
  component: 'file-structure',
  level: 'error',
  fileTypes: ['json'],
  descriptionKey: 'validation.json.valid.description',
  description: 'JSON files must be valid JSON',
  
  async validate(filePath, content, context) {
    // Only validate JSON files
    if (!filePath.endsWith('.json') && !this.isJSONContent(content)) {
      return null;
    }
    
    try {
      JSON.parse(content);
      return null; // Valid JSON
      
    } catch (error) {
      // Extract line and column information from error message
      const lineMatch = error.message.match(/line (\d+)/i);
      const columnMatch = error.message.match(/column (\d+)/i);
      const positionMatch = error.message.match(/position (\d+)/i);
      
      let line = 1;
      let column = 1;
      
      if (lineMatch) {
        line = parseInt(lineMatch[1]);
      } else if (positionMatch) {
        // Calculate line and column from position
        const position = parseInt(positionMatch[1]);
        const lines = content.substring(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
      
      if (columnMatch) {
        column = parseInt(columnMatch[1]);
      }
      
      return {
        message: `JSON syntax error: ${error.message}`,
        line: line,
        column: column,
        suggestion: 'Fix JSON syntax errors such as missing commas, quotes, or brackets'
      };
    }
  },
  
  isJSONContent(content) {
    const trimmedContent = content.trim();
    return (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
           (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'));
  },
  
  metadata: {
    standard: 'JSON',
    reference: 'https://www.json.org/',
    severity: 'critical'
  }
};
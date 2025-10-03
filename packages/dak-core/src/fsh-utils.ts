/**
 * FSH (FHIR Shorthand) Utility Functions
 * Shared FSH parsing and generation utilities for all DAK components
 * Extracted from duplicated code across actorDefinitionService, QuestionnaireEditor, and DecisionSupportLogicView
 * 
 * REFACTORED: Now uses fsh-sushi module's tokenizer and parser when available (Node.js),
 * with regex fallback for browser environments
 */

// Conditional import of fsh-sushi - only available in Node.js
let importText: any = null;
let sushiAvailable = false;

try {
  // This will only work in Node.js environment
  // @ts-ignore - dynamic require for conditional loading
  // webpack magic comment to ignore this module in browser builds
  if (typeof window === 'undefined' && typeof process !== 'undefined') {
    /* webpackIgnore: true */
    const { sushiImport } = eval('require')('fsh-sushi');
    importText = sushiImport.importText;
    sushiAvailable = true;
  }
} catch (error) {
  // SUSHI not available or in browser environment - will use regex fallback
  sushiAvailable = false;
}

/**
 * FSH Field Patterns - Common regex patterns for parsing FSH content
 */
export const FSH_PATTERNS = {
  // Profile/Resource Definition patterns
  PROFILE: /^Profile:\s*(.+)$/m,
  INSTANCE: /^Instance:\s*(\w+)/m,
  PARENT: /^Parent:\s*(.+)$/m,
  
  // Basic field patterns
  ID: /^Id:\s*(.+)$/m,
  TITLE: [
    /^\s*Title:\s*"([^"]+)"/m,                    // Title: "Title"
    /\*\s*title\s*=\s*"([^"]+)"/,                 // * title = "Title"
    /^Instance:\s*\w+\s*"([^"]+)"/m               // Instance: Name "Title"
  ],
  NAME: [
    /\*\s*name\s*=\s*"([^"]+)"/,                  // * name = "Name"
    /^\s*Name:\s*"?([^"\n]+)"?/m                  // Name: "Name" or Name: Name
  ],
  DESCRIPTION: [
    /^\s*Description:\s*"([^"]+)"/m,              // Description: "Description"
    /\*\s*description\s*=\s*"([^"]+)"/,           // * description = "Description"
    /\/\/\s*(.+)/                                  // // Comment line
  ],
  STATUS: [
    /\*\s*status\s*=\s*#(\w+)/,                   // * status = #draft
    /^\s*Status:\s*#?(\w+)/m                      // Status: draft or Status: #draft
  ],
  
  // Type and value patterns
  TYPE: /type\s*=\s*#(\w+)/,
  VALUE_CODE: /valueCode\s*=\s*#(\w+)/,
  VALUE_STRING: /valueString\s*=\s*"([^"]+)"/,
  
  // Extension patterns
  EXTENSION: /\*\s*extension\[([^\]]+)\]/,
  
  // Code system concept pattern (for DAK decision tables)
  CONCEPT: /^\*\s*#(\S+)/,
};

/**
 * Parse FSH field using multiple pattern attempts
 */
export function parseFSHField(content: string, patterns: RegExp | RegExp[]): string | undefined {
  const patternArray = Array.isArray(patterns) ? patterns : [patterns];
  
  for (const pattern of patternArray) {
    const match = content.match(pattern);
    if (match) {
      return match[1]?.trim() || undefined;
    }
  }
  
  return undefined;
}

/**
 * Extract basic FSH metadata (id, title, description, status, name)
 * Now uses SUSHI's parser for proper tokenization
 */
export interface FSHMetadata {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  status?: string;
  type?: string;
}

export function extractFSHMetadata(fshContent: string): FSHMetadata {
  // Try SUSHI parser first if available (Node.js environment)
  if (sushiAvailable && importText) {
    try {
      const rawFSH: { content: string; path: string } = {
        content: fshContent,
        path: 'inline.fsh'
      };
      
      const docs = importText([rawFSH]);
      
      if (docs.length === 0) {
        throw new Error('No documents parsed');
      }
      
      const doc = docs[0];
      const metadata: FSHMetadata = {};
      
      // Try to extract metadata from any entity in the document
      const entities = [
        ...doc.profiles.values(),
        ...doc.extensions.values(),
        ...doc.instances.values(),
        ...doc.valueSets.values(),
        ...doc.codeSystems.values(),
        ...doc.logicals.values()
      ];
      
      if (entities.length === 0) {
        // No entities parsed successfully, fall back to regex
        throw new Error('No entities found in document');
      }
      
      const entity = entities[0];
      metadata.id = entity.id;
      metadata.name = entity.name;
      metadata.title = entity.title;
      metadata.description = entity.description;
      
      // Extract status if available
      if ('status' in entity) {
        metadata.status = (entity as any).status;
      }
      
      // Determine type
      if (doc.profiles.size > 0) metadata.type = 'Profile';
      else if (doc.extensions.size > 0) metadata.type = 'Extension';
      else if (doc.instances.size > 0) metadata.type = 'Instance';
      else if (doc.valueSets.size > 0) metadata.type = 'ValueSet';
      else if (doc.codeSystems.size > 0) metadata.type = 'CodeSystem';
      else if (doc.logicals.size > 0) metadata.type = 'Logical';
      
      return metadata;
    } catch (error) {
      // Fall through to regex-based parsing
    }
  }
  
  // Fallback to regex-based parsing (works in both Node.js and browser)
  return {
    id: parseFSHField(fshContent, [FSH_PATTERNS.ID, FSH_PATTERNS.PROFILE, FSH_PATTERNS.INSTANCE]),
    title: parseFSHField(fshContent, FSH_PATTERNS.TITLE),
    name: parseFSHField(fshContent, FSH_PATTERNS.NAME),
    description: parseFSHField(fshContent, FSH_PATTERNS.DESCRIPTION),
    status: parseFSHField(fshContent, FSH_PATTERNS.STATUS),
    type: parseFSHField(fshContent, FSH_PATTERNS.TYPE),
  };
}

/**
 * Escape special characters for FSH strings
 */
export function escapeFSHString(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Unescape FSH string (reverse of escapeFSHString)
 */
export function unescapeFSHString(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/**
 * Parse FSH lines into structured data
 * 
 * DEPRECATED: This function is kept for backward compatibility but is no longer recommended.
 * Use SUSHI's importText function directly for proper FSH parsing.
 */
export interface ParsedFSHLine {
  indent: number;
  content: string;
  trimmed: string;
  isComment: boolean;
  isBlank: boolean;
}

export function parseFSHLines(fshContent: string): ParsedFSHLine[] {
  console.warn('parseFSHLines is deprecated. Consider using SUSHI\'s importText for proper FSH parsing.');
  return fshContent.split('\n').map(line => {
    const trimmed = line.trim();
    const indent = line.length - line.trimStart().length;
    
    return {
      indent,
      content: line,
      trimmed,
      isComment: trimmed.startsWith('//'),
      isBlank: trimmed === ''
    };
  });
}

/**
 * Generate FSH header for a profile/instance
 */
export interface FSHHeaderOptions {
  type: 'Profile' | 'Instance' | 'Extension' | 'ValueSet' | 'CodeSystem';
  id: string;
  parent?: string;
  title?: string;
  description?: string;
  status?: string;
}

export function generateFSHHeader(options: FSHHeaderOptions): string {
  const lines: string[] = [];
  
  lines.push(`${options.type}: ${options.id}`);
  
  if (options.parent) {
    lines.push(`Parent: ${options.parent}`);
  }
  
  lines.push(`Id: ${options.id}`);
  
  if (options.title) {
    lines.push(`Title: "${escapeFSHString(options.title)}"`);
  }
  
  if (options.description) {
    lines.push(`Description: "${escapeFSHString(options.description)}"`);
  }
  
  if (options.status) {
    lines.push(`* status = #${options.status}`);
  }
  
  return lines.join('\n');
}

/**
 * Parse FSH code system concepts (for DAK decision tables)
 */
export interface FSHConcept {
  code: string;
  display?: string;
  definition?: string;
  properties?: Record<string, any>;
  [key: string]: any;
}

export function parseFSHCodeSystem(fshContent: string): FSHConcept[] {
  // Try SUSHI parser first if available (Node.js environment)
  if (sushiAvailable && importText) {
    try {
      const rawFSH: { content: string; path: string } = {
        content: fshContent,
        path: 'inline.fsh'
      };
      
      const docs = importText([rawFSH]);
      
      if (docs.length === 0) {
        throw new Error('No documents parsed');
      }
      
      const doc = docs[0];
      const concepts: FSHConcept[] = [];
      
      // Find CodeSystem in the document
      const codeSystem = doc.codeSystems.values().next().value;
      
      if (!codeSystem || !codeSystem.rules) {
        throw new Error('No code system found');
      }
      
      // Convert SUSHI ConceptRules to our format
      for (const rule of codeSystem.rules) {
        // Check if this is a ConceptRule (has code, display, definition)
        if ('code' in rule && typeof rule.code === 'string') {
          const fshConcept: FSHConcept = {
            code: rule.code,
            display: (rule as any).display,
            definition: (rule as any).definition,
            properties: {}
          };
          
          concepts.push(fshConcept);
        }
      }
      
      return concepts;
    } catch (error) {
      // Fall through to basic parsing
    }
  }
  
  // Fallback to basic parsing (works in both Node.js and browser)
  return parseFSHCodeSystemBasic(fshContent);
}

/**
 * Fallback basic FSH code system parser (for backward compatibility)
 * Only used if SUSHI parser fails
 */
function parseFSHCodeSystemBasic(fshContent: string): FSHConcept[] {
  const concepts: FSHConcept[] = [];
  let currentConcept: FSHConcept | null = null;
  
  // Simple line-by-line parsing for basic cases
  const lines = fshContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if this is a top-level concept
    const conceptMatch = trimmed.match(/^\*\s*#(\S+)\s*"([^"]*)"/);
    if (conceptMatch) {
      if (currentConcept) {
        concepts.push(currentConcept);
      }
      
      currentConcept = {
        code: conceptMatch[1],
        display: conceptMatch[2] || conceptMatch[1],
        properties: {}
      };
    }
  }
  
  if (currentConcept) {
    concepts.push(currentConcept);
  }
  
  return concepts;
}

/**
 * Generate FSH from code system concepts
 */
export function generateFSHCodeSystem(
  id: string,
  title: string,
  concepts: FSHConcept[]
): string {
  const lines: string[] = [];
  
  lines.push(`CodeSystem: ${id}`);
  lines.push(`Title: "${escapeFSHString(title)}"`);
  lines.push('');
  
  for (const concept of concepts) {
    lines.push(`* #${concept.code} "${escapeFSHString(concept.display || concept.code)}"`);
    
    if (concept.definition) {
      lines.push(`  * definition = "${escapeFSHString(concept.definition)}"`);
    }
    
    // Add other properties
    if (concept.properties) {
      for (const [key, value] of Object.entries(concept.properties)) {
        if (key !== 'display' && key !== 'definition' && value) {
          lines.push(`  * ${key} = "${escapeFSHString(String(value))}"`);
        }
      }
    }
    
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Validate FSH syntax (basic validation)
 */
export interface FSHValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFSHSyntax(fshContent: string): FSHValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for basic FSH structure
  if (!fshContent.trim()) {
    errors.push('FSH content is empty');
    return { isValid: false, errors, warnings };
  }
  
  // Check for required Profile/Instance/etc header
  const hasHeader = /^(Profile|Instance|Extension|ValueSet|CodeSystem|Logical):/m.test(fshContent);
  if (!hasHeader) {
    warnings.push('FSH content should start with Profile:, Instance:, Extension:, ValueSet:, CodeSystem:, or Logical:');
  }
  
  // Check for unescaped quotes in strings
  const lines = fshContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('"')) {
      // Count quotes
      const quotes = (line.match(/"/g) || []).length;
      const escapedQuotes = (line.match(/\\"/g) || []).length;
      
      if ((quotes - escapedQuotes) % 2 !== 0) {
        errors.push(`Line ${i + 1}: Unmatched quotes`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

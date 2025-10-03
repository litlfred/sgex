/**
 * FSH (FHIR Shorthand) Utility Functions
 * Shared FSH parsing and generation utilities for all DAK components
 * Extracted from duplicated code across actorDefinitionService, QuestionnaireEditor, and DecisionSupportLogicView
 */

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
 */
export interface ParsedFSHLine {
  indent: number;
  content: string;
  trimmed: string;
  isComment: boolean;
  isBlank: boolean;
}

export function parseFSHLines(fshContent: string): ParsedFSHLine[] {
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
  const lines = fshContent.split('\n');
  const concepts: FSHConcept[] = [];
  let currentConcept: FSHConcept | null = null;
  let multiLineState: string | null = null;
  let multiLineContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if this is a top-level concept (starts with * # and is not indented)
    const isTopLevel = line.startsWith('* #') && !line.startsWith('  ');
    
    if (isTopLevel) {
      // Finish any ongoing multi-line content
      if (multiLineState && currentConcept) {
        currentConcept[multiLineState] = multiLineContent.join('\n').trim();
        multiLineState = null;
        multiLineContent = [];
      }
      
      // Save previous concept
      if (currentConcept) {
        concepts.push(currentConcept);
      }
      
      // Parse new concept code
      const match = trimmed.match(/^\*\s*#(\S+)/);
      if (match) {
        currentConcept = {
          code: match[1],
          properties: {}
        };
        
        // Check for inline display or definition
        const displayMatch = trimmed.match(/"([^"]+)"/);
        if (displayMatch) {
          currentConcept.display = displayMatch[1];
        }
      }
    } else if (currentConcept && trimmed) {
      // Parse property lines for current concept
      if (trimmed.includes('"') && !multiLineState) {
        // Extract property name and value
        const propMatch = trimmed.match(/\s*\*\s*([^"]+)\s*"([^"]*)"/);
        if (propMatch) {
          const propName = propMatch[1].trim();
          const propValue = propMatch[2];
          
          if (propName) {
            // Check if this is a multi-line start (value is empty or incomplete)
            if (!propValue || propValue === '') {
              multiLineState = propName;
              multiLineContent = [];
            } else {
              currentConcept.properties![propName] = propValue;
              
              // Also set as top-level property for common fields
              if (propName === 'display' || propName === 'Display') {
                currentConcept.display = propValue;
              } else if (propName === 'definition' || propName === 'Definition') {
                currentConcept.definition = propValue;
              }
            }
          }
        }
      } else if (multiLineState) {
        // Collect multi-line content
        multiLineContent.push(line);
      }
    }
  }
  
  // Save last concept
  if (currentConcept) {
    if (multiLineState) {
      currentConcept[multiLineState] = multiLineContent.join('\n').trim();
    }
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

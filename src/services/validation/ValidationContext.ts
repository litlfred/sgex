/**
 * Validation Context
 * 
 * Helper utilities provided to validation rules for parsing files,
 * accessing repository content, and generating error locations.
 * 
 * @module validation/ValidationContext
 */

import { ValidationContext as IValidationContext } from './types';

/**
 * Validation Context Implementation
 * 
 * Provides utilities for validation rule implementations:
 * - XML/JSON parsing
 * - File content access
 * - Line number calculation
 * - XPath generation
 * 
 * @openapi
 * components:
 *   schemas:
 *     ValidationContext:
 *       type: object
 *       description: Helper utilities for validation rules
 */
export class ValidationContext implements IValidationContext {
  private fileContentCache: Map<string, string>;
  private repositoryContext?: {
    owner: string;
    repo: string;
    branch: string;
  };

  constructor(repositoryContext?: { owner: string; repo: string; branch: string }) {
    this.fileContentCache = new Map();
    this.repositoryContext = repositoryContext;
  }

  /**
   * Get XML parser instance
   * Uses browser DOMParser for XML parsing
   * 
   * @returns DOMParser instance
   */
  getXMLParser(): DOMParser {
    return new DOMParser();
  }

  /**
   * Get JSON parser
   * Returns the native JSON object
   * 
   * @returns JSON parser
   */
  getJSONParser(): typeof JSON {
    return JSON;
  }

  /**
   * Get file content from repository or staging ground
   * Results are cached for performance
   * 
   * @param filePath - Path to file
   * @returns File content as string
   */
  async getFileContent(filePath: string): Promise<string> {
    // Check cache first
    if (this.fileContentCache.has(filePath)) {
      return this.fileContentCache.get(filePath)!;
    }

    // In a real implementation, this would fetch from GitHub or staging ground
    // For now, return empty string as placeholder
    // TODO: Integrate with githubService and stagingGroundService
    const content = '';
    this.fileContentCache.set(filePath, content);
    return content;
  }

  /**
   * List files matching glob pattern
   * 
   * @param pattern - Glob pattern (e.g., "input/**\/*.bpmn")
   * @returns Array of file paths
   */
  async listFiles(pattern: string): Promise<string[]> {
    // TODO: Integrate with githubService and stagingGroundService
    // to list files matching the pattern
    return [];
  }

  /**
   * Get line number from character offset in content
   * 
   * @param content - File content
   * @param offset - Character offset
   * @returns Line number (1-indexed)
   */
  getLineNumber(content: string, offset: number): number {
    const lines = content.substring(0, offset).split('\n');
    return lines.length;
  }

  /**
   * Get column number from character offset in content
   * 
   * @param content - File content
   * @param offset - Character offset
   * @returns Column number (1-indexed)
   */
  getColumnNumber(content: string, offset: number): number {
    const lines = content.substring(0, offset).split('\n');
    const lastLine = lines[lines.length - 1];
    return lastLine.length + 1;
  }

  /**
   * Generate XPath expression for XML element
   * 
   * @param element - XML element
   * @returns XPath expression
   */
  getXPath(element: Element): string {
    if (!element || !element.parentNode) {
      return '/';
    }

    const parts: string[] = [];
    let current: Element | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = current.previousSibling;

      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && 
            sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = current.nodeName;
      const part = index > 1 ? `${tagName}[${index}]` : tagName;
      parts.unshift(part);

      current = current.parentElement;
    }

    return '/' + parts.join('/');
  }

  /**
   * Parse XML content and return DOM document
   * 
   * @param content - XML content as string
   * @returns Parsed XML document
   * @throws Error if XML is malformed
   */
  parseXML(content: string): Document {
    const parser = this.getXMLParser();
    const doc = parser.parseFromString(content, 'text/xml');

    // Check for parser errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`XML parsing error: ${parserError.textContent}`);
    }

    return doc;
  }

  /**
   * Parse JSON content and return object
   * 
   * @param content - JSON content as string
   * @returns Parsed JSON object
   * @throws Error if JSON is malformed
   */
  parseJSON<T = any>(content: string): T {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if content is well-formed XML
   * 
   * @param content - XML content as string
   * @returns true if well-formed, false otherwise
   */
  isWellFormedXML(content: string): boolean {
    try {
      this.parseXML(content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if content is valid JSON
   * 
   * @param content - JSON content as string
   * @returns true if valid, false otherwise
   */
  isValidJSON(content: string): boolean {
    try {
      this.parseJSON(content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear file content cache
   */
  clearCache(): void {
    this.fileContentCache.clear();
  }

  /**
   * Set repository context for file operations
   * 
   * @param context - Repository context
   */
  setRepositoryContext(context: { owner: string; repo: string; branch: string }): void {
    this.repositoryContext = context;
  }

  /**
   * Get repository context
   * 
   * @returns Repository context or undefined
   */
  getRepositoryContext(): { owner: string; repo: string; branch: string } | undefined {
    return this.repositoryContext;
  }
}

// Export singleton instance
export const validationContext = new ValidationContext();

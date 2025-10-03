/**
 * FSH (FHIR Shorthand) Utility Functions
 * Shared FSH parsing and generation utilities for all DAK components
 * Extracted from duplicated code across actorDefinitionService, QuestionnaireEditor, and DecisionSupportLogicView
 *
 * REFACTORED: Now uses fsh-sushi module's tokenizer and parser when available (Node.js),
 * with regex fallback for browser environments
 */
/**
 * FSH Field Patterns - Common regex patterns for parsing FSH content
 */
export declare const FSH_PATTERNS: {
    PROFILE: RegExp;
    INSTANCE: RegExp;
    PARENT: RegExp;
    ID: RegExp;
    TITLE: RegExp[];
    NAME: RegExp[];
    DESCRIPTION: RegExp[];
    STATUS: RegExp[];
    TYPE: RegExp;
    VALUE_CODE: RegExp;
    VALUE_STRING: RegExp;
    EXTENSION: RegExp;
    CONCEPT: RegExp;
};
/**
 * Parse FSH field using multiple pattern attempts
 */
export declare function parseFSHField(content: string, patterns: RegExp | RegExp[]): string | undefined;
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
export declare function extractFSHMetadata(fshContent: string): FSHMetadata;
/**
 * Escape special characters for FSH strings
 */
export declare function escapeFSHString(str: string | undefined | null): string;
/**
 * Unescape FSH string (reverse of escapeFSHString)
 */
export declare function unescapeFSHString(str: string | undefined | null): string;
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
export declare function parseFSHLines(fshContent: string): ParsedFSHLine[];
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
export declare function generateFSHHeader(options: FSHHeaderOptions): string;
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
export declare function parseFSHCodeSystem(fshContent: string): FSHConcept[];
/**
 * Generate FSH from code system concepts
 */
export declare function generateFSHCodeSystem(id: string, title: string, concepts: FSHConcept[]): string;
/**
 * Validate FSH syntax (basic validation)
 */
export interface FSHValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function validateFSHSyntax(fshContent: string): FSHValidationResult;

/**
 * Request validation utilities for MCP server
 */
import { ValidationResult } from '../../types.js';
/**
 * Validate execute request format
 */
export declare function validateExecuteRequest(body: any): ValidationResult;
/**
 * Validate question ID format
 */
export declare function isValidQuestionId(questionId: string): boolean;
/**
 * Validate locale format
 */
export declare function isValidLocale(locale: string): boolean;
/**
 * Validate repository path
 */
export declare function isValidRepositoryPath(path: string): boolean;
//# sourceMappingURL=validation.d.ts.map
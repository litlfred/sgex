/**
 * Decision Table Core Logic
 * Pure business logic for managing DAK Decision Tables (DMN/FSH Code Systems)
 * Refactored to use base component class and shared FSH utilities
 */
import { BaseDAKComponent, DAKComponentBase, ComponentValidationResult } from './base-component';
import { FSHConcept } from './fsh-utils';
export interface DecisionTableVariable extends FSHConcept {
    Code?: string;
    Display?: string;
    Definition?: string;
    Tables?: string;
    Tabs?: string;
    CQL?: string;
    [key: string]: any;
}
export interface DecisionTable extends DAKComponentBase {
    url?: string;
    concepts: DecisionTableVariable[];
    valueSet?: string;
    codeSystem?: string;
    [key: string]: any;
}
export declare class DecisionTableCore extends BaseDAKComponent<DecisionTable> {
    constructor(decisionTable?: DecisionTable);
    /**
     * Get JSON schema for decision tables
     */
    getSchema(): any;
    /**
     * Generate FSH representation of decision table code system
     */
    generateFSH(): string;
    /**
     * Parse FSH code system to decision table
     */
    parseFSH(fshContent: string): DecisionTable;
    /**
     * Validate decision table
     */
    validate(): ComponentValidationResult;
    /**
     * Create an empty decision table template
     */
    static createEmpty(): DecisionTable;
    /**
     * Parse FSH code system (static helper for backward compatibility)
     */
    static parseFSHCodeSystem(fshContent: string): DecisionTableVariable[];
    /**
     * Create decision table from concepts
     */
    static fromConcepts(id: string, name: string, concepts: DecisionTableVariable[]): DecisionTable;
    /**
     * Get variables/concepts from decision table
     */
    getVariables(): DecisionTableVariable[];
    /**
     * Add variable/concept to decision table
     */
    addVariable(variable: DecisionTableVariable): void;
    /**
     * Remove variable/concept from decision table
     */
    removeVariable(code: string): void;
    /**
     * Find variable by code
     */
    findVariable(code: string): DecisionTableVariable | undefined;
    /**
     * Update variable
     */
    updateVariable(code: string, updates: Partial<DecisionTableVariable>): void;
}
export declare const decisionTableCore: DecisionTableCore;

/**
 * Questionnaire Definition Core Logic
 * Pure business logic for managing FHIR Questionnaire definitions
 * Refactored to use base component class and shared FSH utilities
 */
import { BaseDAKComponent, DAKComponentBase, ComponentValidationResult } from './base-component';
export interface QuestionnaireItem {
    linkId: string;
    text: string;
    type: string;
    required?: boolean;
    repeats?: boolean;
    readOnly?: boolean;
    answerOption?: Array<{
        valueCoding?: {
            code: string;
            display: string;
        };
    }>;
    initial?: Array<{
        valueString?: string;
        valueBoolean?: boolean;
        valueInteger?: number;
    }>;
    enableWhen?: Array<any>;
    item?: QuestionnaireItem[];
}
export interface QuestionnaireDefinition extends DAKComponentBase {
    url?: string;
    version?: string;
    status: 'draft' | 'active' | 'retired' | 'unknown';
    subjectType?: string[];
    date?: string;
    publisher?: string;
    contact?: Array<any>;
    useContext?: Array<any>;
    jurisdiction?: Array<any>;
    purpose?: string;
    copyright?: string;
    item?: QuestionnaireItem[];
    resourceType?: 'Questionnaire';
    [key: string]: any;
}
export declare class QuestionnaireDefinitionCore extends BaseDAKComponent<QuestionnaireDefinition> {
    constructor(questionnaire?: QuestionnaireDefinition);
    /**
     * Get JSON schema for questionnaire definitions
     */
    getSchema(): any;
    /**
     * Generate FSH representation of questionnaire
     */
    generateFSH(): string;
    /**
     * Generate FSH for questionnaire items recursively
     */
    private generateItemsFSH;
    /**
     * Parse FSH content to questionnaire definition
     */
    parseFSH(fshContent: string): QuestionnaireDefinition;
    /**
     * Validate questionnaire definition
     */
    validate(): ComponentValidationResult;
    /**
     * Create an empty questionnaire template
     */
    static createEmpty(): QuestionnaireDefinition;
    /**
     * Extract FSH metadata from content (static helper for backward compatibility)
     */
    static extractMetadata(fshContent: string): {
        title?: string;
        name?: string;
        description?: string;
        status?: string;
    };
}
export declare const questionnaireDefinitionCore: QuestionnaireDefinitionCore;

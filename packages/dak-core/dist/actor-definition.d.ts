/**
 * Actor Definition Core Logic
 * Pure business logic for managing FHIR Persona-based actor definitions
 * Refactored to use base component class and shared FSH utilities
 */
import { BaseDAKComponent, DAKComponentBase, ComponentValidationResult } from './base-component';
export interface ActorDefinition extends DAKComponentBase {
    type: 'human' | 'system';
    responsibilities: string[];
    skills?: string[];
    systems?: string[];
    [key: string]: any;
}
export interface ActorValidationResult extends ComponentValidationResult {
}
export declare class ActorDefinitionCore extends BaseDAKComponent<ActorDefinition> {
    constructor(actor?: ActorDefinition);
    /**
     * Load JSON schema for actor definitions
     */
    loadSchema(): any;
    /**
     * Get JSON schema for actor definitions
     */
    getSchema(): any;
    /**
     * Generate FSH (FHIR Shorthand) representation of actor definition
     */
    generateFSH(): string;
    /**
     * Parse FSH content back to actor definition
     */
    parseFSH(fshContent: string): Promise<ActorDefinition>;
    /**
     * Validate actor definition against schema and business rules
     */
    validate(): ComponentValidationResult;
    /**
     * Backward compatibility wrapper
     */
    validateActorDefinition(actor: ActorDefinition): ActorValidationResult;
    /**
     * Create an empty actor definition template
     */
    static createEmpty(): ActorDefinition;
    /**
     * Get predefined actor templates
     */
    static getTemplates(): ActorDefinition[];
    /**
     * Generate actor definition from template
     */
    static fromTemplate(templateId: string, customizations?: Partial<ActorDefinition>): ActorDefinition;
}
export declare const actorDefinitionCore: ActorDefinitionCore;

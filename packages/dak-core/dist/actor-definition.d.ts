/**
 * Actor Definition Core Logic
 * Pure business logic for managing FHIR Persona-based actor definitions
 * Extracted from actorDefinitionService.js
 */
export interface ActorDefinition {
    id: string;
    name: string;
    description: string;
    type: 'human' | 'system';
    responsibilities: string[];
    skills?: string[];
    systems?: string[];
    [key: string]: any;
}
export interface ActorValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class ActorDefinitionCore {
    /**
     * Load JSON schema for actor definitions
     */
    loadSchema(): any;
    /**
     * Generate FSH (FHIR Shorthand) representation of actor definition
     */
    generateFSH(actor: ActorDefinition): string;
    /**
     * Escape special characters for FSH strings
     */
    private escapeFSHString;
    /**
     * Parse FSH content back to actor definition
     */
    parseFSH(fshContent: string): ActorDefinition;
    /**
     * Validate actor definition against schema and business rules
     */
    validateActorDefinition(actor: ActorDefinition): ActorValidationResult;
    /**
     * Create an empty actor definition template
     */
    createEmptyActorDefinition(): ActorDefinition;
    /**
     * Get predefined actor templates
     */
    getActorTemplates(): ActorDefinition[];
    /**
     * Generate actor definition from template
     */
    generateFromTemplate(templateId: string, customizations?: Partial<ActorDefinition>): ActorDefinition;
}
export declare const actorDefinitionCore: ActorDefinitionCore;
//# sourceMappingURL=actor-definition.d.ts.map
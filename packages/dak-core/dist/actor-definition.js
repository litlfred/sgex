"use strict";
/**
 * Actor Definition Core Logic
 * Pure business logic for managing FHIR Persona-based actor definitions
 * Refactored to use base component class and shared FSH utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.actorDefinitionCore = exports.ActorDefinitionCore = void 0;
const base_component_1 = require("./base-component");
const fsh_utils_1 = require("./fsh-utils");
class ActorDefinitionCore extends base_component_1.BaseDAKComponent {
    constructor(actor) {
        super(actor || (0, base_component_1.createEmptyComponent)('actor', {
            type: 'human',
            responsibilities: []
        }));
    }
    /**
     * Load JSON schema for actor definitions
     */
    loadSchema() {
        return this.getSchema();
    }
    /**
     * Get JSON schema for actor definitions
     */
    getSchema() {
        try {
            // This would typically load from a schema file
            // For now, return a basic schema structure
            return {
                type: 'object',
                required: ['id', 'name', 'description', 'type'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    type: {
                        type: 'string',
                        enum: ['human', 'system']
                    },
                    responsibilities: {
                        type: 'array',
                        items: { type: 'string' }
                    },
                    skills: {
                        type: 'array',
                        items: { type: 'string' }
                    },
                    systems: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to load actor definition schema: ${error}`);
        }
    }
    /**
     * Generate FSH (FHIR Shorthand) representation of actor definition
     */
    generateFSH() {
        const actor = this.component;
        let fsh = (0, fsh_utils_1.generateFSHHeader)({
            type: 'Profile',
            id: actor.id,
            parent: 'Person',
            title: actor.name,
            description: actor.description
        });
        fsh += '\n\n';
        // Add type-specific constraints
        if (actor.type === 'human') {
            fsh += `* active = true\n`;
            if (actor.skills && actor.skills.length > 0) {
                fsh += `* extension contains\n`;
                fsh += `    PersonSkillExtension named skills 0..*\n`;
            }
        }
        else if (actor.type === 'system') {
            fsh += `* active = true\n`;
            if (actor.systems && actor.systems.length > 0) {
                fsh += `* extension contains\n`;
                fsh += `    SystemCapabilityExtension named capabilities 0..*\n`;
            }
        }
        // Add responsibilities as extensions
        if (actor.responsibilities && actor.responsibilities.length > 0) {
            fsh += `* extension contains\n`;
            fsh += `    ResponsibilityExtension named responsibilities 0..*\n`;
        }
        return fsh;
    }
    /**
     * Parse FSH content back to actor definition
     */
    parseFSH(fshContent) {
        const metadata = (0, fsh_utils_1.extractFSHMetadata)(fshContent);
        const actor = {
            id: metadata.id || '',
            name: metadata.title || metadata.name || '',
            description: metadata.description || '',
            type: fshContent.includes('SystemCapabilityExtension') ? 'system' : 'human',
            responsibilities: [],
            skills: [],
            systems: []
        };
        return actor;
    }
    /**
     * Validate actor definition against schema and business rules
     */
    validate() {
        const actor = this.component;
        const errors = [];
        const warnings = [];
        // Use base validation for required fields and ID format
        const requiredValidation = this.validateRequiredFields(['id', 'name', 'description', 'type']);
        const idValidation = this.validateIdFormat(actor.id);
        // Custom validation for actor-specific rules
        if (actor.type && !['human', 'system'].includes(actor.type)) {
            errors.push({
                code: 'INVALID_ACTOR_TYPE',
                message: 'Actor type must be either "human" or "system"',
                component: 'actor'
            });
        }
        if (!actor.responsibilities || actor.responsibilities.length === 0) {
            warnings.push({
                code: 'MISSING_RESPONSIBILITIES',
                message: 'Actor should have at least one responsibility defined',
                component: 'actor'
            });
        }
        // Business rule validation
        if (actor.type === 'human' && actor.systems && actor.systems.length > 0) {
            warnings.push({
                code: 'HUMAN_WITH_SYSTEMS',
                message: 'Human actors typically should not have system capabilities',
                component: 'actor'
            });
        }
        if (actor.type === 'system' && actor.skills && actor.skills.length > 0) {
            warnings.push({
                code: 'SYSTEM_WITH_SKILLS',
                message: 'System actors typically should not have human skills',
                component: 'actor'
            });
        }
        return (0, base_component_1.mergeValidationResults)(requiredValidation, idValidation, { isValid: errors.length === 0, errors, warnings });
    }
    /**
     * Backward compatibility wrapper
     */
    validateActorDefinition(actor) {
        const oldComponent = this.component;
        this.component = actor;
        const result = this.validate();
        this.component = oldComponent;
        return result;
    }
    /**
     * Create an empty actor definition template
     */
    static createEmpty() {
        return (0, base_component_1.createEmptyComponent)('actor', {
            type: 'human',
            responsibilities: []
        });
    }
    /**
     * Get predefined actor templates
     */
    static getTemplates() {
        return [
            {
                id: 'healthcare-worker',
                name: 'Healthcare Worker',
                description: 'A healthcare professional providing direct patient care',
                type: 'human',
                responsibilities: [
                    'Provide patient care',
                    'Document clinical observations',
                    'Follow clinical protocols'
                ],
                skills: [
                    'Clinical assessment',
                    'Patient communication',
                    'Documentation'
                ]
            },
            {
                id: 'data-manager',
                name: 'Data Manager',
                description: 'Professional responsible for health data management',
                type: 'human',
                responsibilities: [
                    'Manage health data',
                    'Ensure data quality',
                    'Generate reports'
                ],
                skills: [
                    'Data analysis',
                    'Report generation',
                    'Quality assurance'
                ]
            },
            {
                id: 'clinical-decision-support-system',
                name: 'Clinical Decision Support System',
                description: 'Automated system providing clinical recommendations',
                type: 'system',
                responsibilities: [
                    'Analyze patient data',
                    'Provide clinical recommendations',
                    'Alert on critical conditions'
                ],
                systems: [
                    'Rule engine',
                    'Alert system',
                    'Integration interface'
                ]
            },
            {
                id: 'health-information-system',
                name: 'Health Information System',
                description: 'System for managing health information and records',
                type: 'system',
                responsibilities: [
                    'Store patient records',
                    'Manage appointments',
                    'Generate reports'
                ],
                systems: [
                    'Database management',
                    'User interface',
                    'Reporting engine'
                ]
            }
        ];
    }
    /**
     * Generate actor definition from template
     */
    static fromTemplate(templateId, customizations) {
        const templates = ActorDefinitionCore.getTemplates();
        const template = templates.find(t => t.id === templateId);
        if (!template) {
            throw new Error(`Actor template not found: ${templateId}`);
        }
        return {
            ...template,
            ...customizations
        };
    }
}
exports.ActorDefinitionCore = ActorDefinitionCore;
// Export singleton instance for backward compatibility
exports.actorDefinitionCore = new ActorDefinitionCore();
//# sourceMappingURL=actor-definition.js.map
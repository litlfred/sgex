"use strict";
/**
 * Actor Definition Core Logic
 * Pure business logic for managing FHIR Persona-based actor definitions
 * Extracted from actorDefinitionService.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.actorDefinitionCore = exports.ActorDefinitionCore = void 0;
class ActorDefinitionCore {
    /**
     * Load JSON schema for actor definitions
     */
    loadSchema() {
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
    generateFSH(actor) {
        let fsh = `Profile: ${actor.id}\n`;
        fsh += `Parent: Person\n`;
        fsh += `Id: ${actor.id}\n`;
        fsh += `Title: "${actor.name}"\n`;
        fsh += `Description: "${this.escapeFSHString(actor.description)}"\n`;
        fsh += `\n`;
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
     * Escape special characters for FSH strings
     */
    escapeFSHString(str) {
        return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    }
    /**
     * Parse FSH content back to actor definition
     */
    parseFSH(fshContent) {
        const lines = fshContent.split('\n');
        const actor = {
            responsibilities: [],
            skills: [],
            systems: []
        };
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('Profile:')) {
                actor.id = trimmed.substring(8).trim();
            }
            else if (trimmed.startsWith('Title:')) {
                actor.name = trimmed.substring(6).trim().replace(/"/g, '');
            }
            else if (trimmed.startsWith('Description:')) {
                actor.description = trimmed.substring(12).trim().replace(/"/g, '');
            }
        }
        // Infer type from extensions or default to human
        if (fshContent.includes('SystemCapabilityExtension')) {
            actor.type = 'system';
        }
        else {
            actor.type = 'human';
        }
        return actor;
    }
    /**
     * Validate actor definition against schema and business rules
     */
    validateActorDefinition(actor) {
        const errors = [];
        const warnings = [];
        // Required field validation
        if (!actor.id || actor.id.trim() === '') {
            errors.push('Actor ID is required');
        }
        if (!actor.name || actor.name.trim() === '') {
            errors.push('Actor name is required');
        }
        if (!actor.description || actor.description.trim() === '') {
            errors.push('Actor description is required');
        }
        if (!actor.type || !['human', 'system'].includes(actor.type)) {
            errors.push('Actor type must be either "human" or "system"');
        }
        if (!actor.responsibilities || actor.responsibilities.length === 0) {
            warnings.push('Actor should have at least one responsibility defined');
        }
        // Business rule validation
        if (actor.type === 'human' && actor.systems && actor.systems.length > 0) {
            warnings.push('Human actors typically should not have system capabilities');
        }
        if (actor.type === 'system' && actor.skills && actor.skills.length > 0) {
            warnings.push('System actors typically should not have human skills');
        }
        // ID format validation
        if (actor.id && !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(actor.id)) {
            errors.push('Actor ID must start with a letter and contain only letters, numbers, hyphens, and underscores');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Create an empty actor definition template
     */
    createEmptyActorDefinition() {
        return {
            id: '',
            name: '',
            description: '',
            type: 'human',
            responsibilities: []
        };
    }
    /**
     * Get predefined actor templates
     */
    getActorTemplates() {
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
    generateFromTemplate(templateId, customizations) {
        const templates = this.getActorTemplates();
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
// Export singleton instance
exports.actorDefinitionCore = new ActorDefinitionCore();
//# sourceMappingURL=actor-definition.js.map
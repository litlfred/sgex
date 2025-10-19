"use strict";
/**
 * Generic Persona Component Object
 * Handles retrieval, saving, and validation of Generic Persona instances
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericPersonaComponent = void 0;
const types_1 = require("../types");
const dakComponentObject_1 = require("../dakComponentObject");
class GenericPersonaComponent extends dakComponentObject_1.BaseDAKComponentObject {
    constructor(repository, sourceResolver, stagingGroundService, onSourcesChanged) {
        super(types_1.DAKComponentType.PERSONAS, repository, sourceResolver, stagingGroundService, onSourcesChanged);
    }
    /**
     * Determine file path for Generic Persona
     * Personas are typically stored as FSH actor definitions
     */
    async determineFilePath(data) {
        const id = data.id || 'new-persona';
        return `input/fsh/actors/${id}.fsh`;
    }
    /**
     * Serialize Generic Persona to FSH format
     */
    serializeToFile(data) {
        // Basic FSH serialization for Generic Persona
        // This is a simplified version - real implementation would use proper FSH generation
        const personaData = data;
        const id = personaData.id || 'GenericPersona';
        const title = personaData.title || personaData.name || id;
        const description = personaData.description || '';
        let fsh = `Instance: ${id}\n`;
        fsh += `InstanceOf: GenericPersona\n`;
        fsh += `Title: "${title}"\n`;
        fsh += `Description: "${description}"\n`;
        fsh += `Usage: #definition\n`;
        fsh += `* code = #generic-persona\n`;
        if (personaData.name) {
            fsh += `* name = "${personaData.name}"\n`;
        }
        return fsh;
    }
    /**
     * Parse Generic Persona from FSH content
     */
    parseFromFile(content) {
        // Basic FSH parsing for Generic Persona
        // This is a simplified version - real implementation would use proper FSH parser
        const lines = content.split('\n');
        const persona = {
            personas: []
        };
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('Instance:')) {
                persona.id = trimmed.split(':')[1]?.trim();
            }
            else if (trimmed.startsWith('Title:')) {
                persona.title = trimmed.split(':')[1]?.trim().replace(/"/g, '');
            }
            else if (trimmed.startsWith('Description:')) {
                persona.description = trimmed.split(':')[1]?.trim().replace(/"/g, '');
            }
            else if (trimmed.includes('* name =')) {
                persona.name = trimmed.split('=')[1]?.trim().replace(/"/g, '');
            }
        }
        return persona;
    }
    /**
     * Validate Generic Persona instance
     */
    async validate(data) {
        const errors = [];
        const warnings = [];
        const personaData = data;
        // Check for ID
        if (!personaData.id) {
            warnings.push({
                code: 'MISSING_ID',
                message: 'Generic Persona should have an id'
            });
        }
        // Check for name or title
        if (!personaData.name && !personaData.title) {
            errors.push({
                code: 'MISSING_NAME',
                message: 'Generic Persona must have either a name or title'
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            timestamp: new Date()
        };
    }
}
exports.GenericPersonaComponent = GenericPersonaComponent;
//# sourceMappingURL=personas.js.map
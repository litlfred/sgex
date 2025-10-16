"use strict";
/**
 * Requirements Component Object
 * Handles retrieval, saving, and validation of Requirements instances
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirementsComponent = void 0;
const types_1 = require("../types");
const dakComponentObject_1 = require("../dakComponentObject");
class RequirementsComponent extends dakComponentObject_1.BaseDAKComponentObject {
    constructor(repository, sourceResolver, stagingGroundService, onSourcesChanged) {
        super(types_1.DAKComponentType.REQUIREMENTS, repository, sourceResolver, stagingGroundService, onSourcesChanged);
    }
    /**
     * Determine file path for Requirements
     * Requirements are typically stored as markdown files
     */
    async determineFilePath(data) {
        const requirementsData = data;
        const id = requirementsData.id || 'requirements';
        return `input/requirements/${id}.md`;
    }
    /**
     * Serialize Requirements to markdown format
     */
    serializeToFile(data) {
        const requirementsData = data;
        // If markdown content already exists, return it
        if (requirementsData.markdown) {
            return requirementsData.markdown;
        }
        // Otherwise create basic markdown structure
        const title = requirementsData.title || 'Functional and Non-Functional Requirements';
        let markdown = `# ${title}\n\n`;
        // Add functional requirements
        if (requirementsData.functional && Array.isArray(requirementsData.functional)) {
            markdown += `## Functional Requirements\n\n`;
            requirementsData.functional.forEach((req, index) => {
                markdown += `### FR${index + 1}: ${req.title || req.name}\n\n`;
                if (req.description) {
                    markdown += `${req.description}\n\n`;
                }
            });
        }
        // Add non-functional requirements
        if (requirementsData.nonFunctional && Array.isArray(requirementsData.nonFunctional)) {
            markdown += `## Non-Functional Requirements\n\n`;
            requirementsData.nonFunctional.forEach((req, index) => {
                markdown += `### NFR${index + 1}: ${req.title || req.name}\n\n`;
                if (req.description) {
                    markdown += `${req.description}\n\n`;
                }
            });
        }
        return markdown;
    }
    /**
     * Parse Requirements from markdown content
     */
    parseFromFile(content) {
        const requirementsData = {
            requirements: [],
            functional: [],
            nonFunctional: []
        };
        const lines = content.split('\n');
        let currentSection = '';
        let currentRequirement = null;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('# ')) {
                requirementsData.title = trimmed.substring(2);
            }
            else if (trimmed.startsWith('## Functional Requirements')) {
                currentSection = 'functional';
            }
            else if (trimmed.startsWith('## Non-Functional Requirements')) {
                currentSection = 'nonFunctional';
            }
            else if (trimmed.startsWith('### FR') || trimmed.startsWith('### NFR')) {
                if (currentRequirement) {
                    if (currentSection === 'functional') {
                        requirementsData.functional.push(currentRequirement);
                    }
                    else if (currentSection === 'nonFunctional') {
                        requirementsData.nonFunctional.push(currentRequirement);
                    }
                }
                currentRequirement = {
                    title: trimmed.substring(trimmed.indexOf(':') + 1).trim(),
                    description: ''
                };
            }
            else if (trimmed && currentRequirement) {
                currentRequirement.description += trimmed + ' ';
            }
        }
        // Add last requirement
        if (currentRequirement) {
            if (currentSection === 'functional') {
                requirementsData.functional.push(currentRequirement);
            }
            else if (currentSection === 'nonFunctional') {
                requirementsData.nonFunctional.push(currentRequirement);
            }
        }
        // Store original markdown
        requirementsData.markdown = content;
        return requirementsData;
    }
    /**
     * Validate Requirements instance
     */
    async validate(data) {
        const errors = [];
        const warnings = [];
        const requirementsData = data;
        // Check for ID
        if (!requirementsData.id) {
            warnings.push({
                code: 'MISSING_ID',
                message: 'Requirements should have an id'
            });
        }
        // Check for requirements
        const hasFunctional = requirementsData.functional && requirementsData.functional.length > 0;
        const hasNonFunctional = requirementsData.nonFunctional && requirementsData.nonFunctional.length > 0;
        if (!hasFunctional && !hasNonFunctional) {
            warnings.push({
                code: 'NO_REQUIREMENTS',
                message: 'Requirements should contain at least one functional or non-functional requirement'
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
exports.RequirementsComponent = RequirementsComponent;
//# sourceMappingURL=requirements.js.map
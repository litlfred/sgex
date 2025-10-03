"use strict";
/**
 * Decision Table Core Logic
 * Pure business logic for managing DAK Decision Tables (DMN/FSH Code Systems)
 * Refactored to use base component class and shared FSH utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionTableCore = exports.DecisionTableCore = void 0;
const base_component_1 = require("./base-component");
const fsh_utils_1 = require("./fsh-utils");
class DecisionTableCore extends base_component_1.BaseDAKComponent {
    constructor(decisionTable) {
        super(decisionTable || (0, base_component_1.createEmptyComponent)('decision-table', {
            concepts: []
        }));
    }
    /**
     * Get JSON schema for decision tables
     */
    getSchema() {
        return {
            type: 'object',
            required: ['id', 'name', 'concepts'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                concepts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['code'],
                        properties: {
                            code: { type: 'string' },
                            display: { type: 'string' },
                            definition: { type: 'string' },
                            properties: { type: 'object' }
                        }
                    }
                }
            }
        };
    }
    /**
     * Generate FSH representation of decision table code system
     */
    generateFSH() {
        const dt = this.component;
        // Use the shared FSH code system generator
        return (0, fsh_utils_1.generateFSHCodeSystem)(dt.id, dt.name, dt.concepts);
    }
    /**
     * Parse FSH code system to decision table
     */
    parseFSH(fshContent) {
        const metadata = (0, fsh_utils_1.extractFSHMetadata)(fshContent);
        const concepts = (0, fsh_utils_1.parseFSHCodeSystem)(fshContent);
        // Convert FSHConcept to DecisionTableVariable format
        const variables = concepts.map(concept => ({
            Code: concept.code,
            Display: concept.display || concept.code,
            Definition: concept.definition || '',
            Tables: concept.properties?.Tables || '',
            Tabs: concept.properties?.Tabs || '',
            CQL: concept.properties?.CQL || '',
            ...concept
        }));
        const decisionTable = {
            id: metadata.id || '',
            name: metadata.title || metadata.name || '',
            description: metadata.description || '',
            type: 'decision-table',
            concepts: variables
        };
        return decisionTable;
    }
    /**
     * Validate decision table
     */
    validate() {
        const dt = this.component;
        const errors = [];
        const warnings = [];
        // Use base validation
        const requiredValidation = this.validateRequiredFields(['id', 'name']);
        const idValidation = this.validateIdFormat(dt.id);
        // Custom validation
        if (!dt.concepts || dt.concepts.length === 0) {
            warnings.push({
                code: 'NO_CONCEPTS',
                message: 'Decision table should have at least one concept/variable',
                component: 'decision-table'
            });
        }
        // Validate concepts
        if (dt.concepts) {
            const codeSeen = new Set();
            for (let i = 0; i < dt.concepts.length; i++) {
                const concept = dt.concepts[i];
                if (!concept.Code && !concept.code) {
                    errors.push({
                        code: 'MISSING_CODE',
                        message: `Concept ${i} is missing code`,
                        component: 'decision-table'
                    });
                }
                const code = concept.Code || concept.code;
                if (code && codeSeen.has(code)) {
                    errors.push({
                        code: 'DUPLICATE_CODE',
                        message: `Duplicate concept code: ${code}`,
                        component: 'decision-table'
                    });
                }
                codeSeen.add(code);
                if (!concept.Display && !concept.display) {
                    warnings.push({
                        code: 'MISSING_DISPLAY',
                        message: `Concept ${code} is missing display text`,
                        component: 'decision-table'
                    });
                }
            }
        }
        return (0, base_component_1.mergeValidationResults)(requiredValidation, idValidation, { isValid: errors.length === 0, errors, warnings });
    }
    /**
     * Create an empty decision table template
     */
    static createEmpty() {
        return (0, base_component_1.createEmptyComponent)('decision-table', {
            concepts: []
        });
    }
    /**
     * Parse FSH code system (static helper for backward compatibility)
     */
    static parseFSHCodeSystem(fshContent) {
        const concepts = (0, fsh_utils_1.parseFSHCodeSystem)(fshContent);
        return concepts.map(concept => ({
            Code: concept.code,
            Display: concept.display || concept.code,
            Definition: concept.definition || '',
            Tables: concept.properties?.Tables || '',
            Tabs: concept.properties?.Tabs || '',
            CQL: concept.properties?.CQL || '',
            ...concept
        }));
    }
    /**
     * Create decision table from concepts
     */
    static fromConcepts(id, name, concepts) {
        return {
            id,
            name,
            description: '',
            type: 'decision-table',
            concepts
        };
    }
    /**
     * Get variables/concepts from decision table
     */
    getVariables() {
        return this.component.concepts;
    }
    /**
     * Add variable/concept to decision table
     */
    addVariable(variable) {
        this.component.concepts.push(variable);
    }
    /**
     * Remove variable/concept from decision table
     */
    removeVariable(code) {
        this.component.concepts = this.component.concepts.filter(v => v.Code !== code && v.code !== code);
    }
    /**
     * Find variable by code
     */
    findVariable(code) {
        return this.component.concepts.find(v => v.Code === code || v.code === code);
    }
    /**
     * Update variable
     */
    updateVariable(code, updates) {
        const index = this.component.concepts.findIndex(v => v.Code === code || v.code === code);
        if (index >= 0) {
            this.component.concepts[index] = {
                ...this.component.concepts[index],
                ...updates
            };
        }
    }
}
exports.DecisionTableCore = DecisionTableCore;
// Export singleton instance for backward compatibility
exports.decisionTableCore = new DecisionTableCore();
//# sourceMappingURL=decision-table.js.map
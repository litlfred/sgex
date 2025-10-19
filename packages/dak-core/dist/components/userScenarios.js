"use strict";
/**
 * User Scenario Component Object
 * Handles retrieval, saving, and validation of User Scenario instances
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserScenarioComponent = void 0;
const types_1 = require("../types");
const dakComponentObject_1 = require("../dakComponentObject");
class UserScenarioComponent extends dakComponentObject_1.BaseDAKComponentObject {
    constructor(repository, sourceResolver, stagingGroundService, onSourcesChanged) {
        super(types_1.DAKComponentType.USER_SCENARIOS, repository, sourceResolver, stagingGroundService, onSourcesChanged);
    }
    /**
     * Determine file path for User Scenario
     * User scenarios are typically stored as markdown files
     */
    async determineFilePath(data) {
        const scenarioData = data;
        const id = scenarioData.id || 'new-scenario';
        return `input/scenarios/${id}.md`;
    }
    /**
     * Serialize User Scenario to markdown format
     */
    serializeToFile(data) {
        const scenarioData = data;
        // If markdown content already exists, return it
        if (scenarioData.markdown) {
            return scenarioData.markdown;
        }
        // Otherwise create basic markdown structure
        const title = scenarioData.title || scenarioData.name || 'User Scenario';
        const description = scenarioData.description || '';
        let markdown = `# ${title}\n\n`;
        if (description) {
            markdown += `${description}\n\n`;
        }
        // Add actors if available
        if (scenarioData.actors && Array.isArray(scenarioData.actors)) {
            markdown += `## Actors\n\n`;
            scenarioData.actors.forEach((actor) => {
                markdown += `- ${actor}\n`;
            });
            markdown += `\n`;
        }
        // Add steps if available
        if (scenarioData.steps && Array.isArray(scenarioData.steps)) {
            markdown += `## Steps\n\n`;
            scenarioData.steps.forEach((step, index) => {
                markdown += `${index + 1}. ${step}\n`;
            });
        }
        return markdown;
    }
    /**
     * Parse User Scenario from markdown content
     */
    parseFromFile(content) {
        const scenarioData = {
            scenarios: [],
            actors: [],
            steps: []
        };
        const lines = content.split('\n');
        let currentSection = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('# ')) {
                scenarioData.title = trimmed.substring(2);
            }
            else if (trimmed.startsWith('## ')) {
                currentSection = trimmed.substring(3).toLowerCase();
            }
            else if (trimmed.startsWith('- ') && currentSection === 'actors') {
                scenarioData.actors.push(trimmed.substring(2));
            }
            else if (/^\d+\.\s/.test(trimmed) && currentSection === 'steps') {
                scenarioData.steps.push(trimmed.replace(/^\d+\.\s/, ''));
            }
        }
        // Store original markdown
        scenarioData.markdown = content;
        return scenarioData;
    }
    /**
     * Validate User Scenario instance
     */
    async validate(data) {
        const errors = [];
        const warnings = [];
        const scenarioData = data;
        // Check for ID
        if (!scenarioData.id) {
            warnings.push({
                code: 'MISSING_ID',
                message: 'User Scenario should have an id'
            });
        }
        // Check for title
        if (!scenarioData.title && !scenarioData.name) {
            errors.push({
                code: 'MISSING_TITLE',
                message: 'User Scenario must have a title or name'
            });
        }
        // Check for actors
        if (!scenarioData.actors || scenarioData.actors.length === 0) {
            warnings.push({
                code: 'NO_ACTORS',
                message: 'User Scenario should define at least one actor'
            });
        }
        // Check for steps
        if (!scenarioData.steps || scenarioData.steps.length === 0) {
            warnings.push({
                code: 'NO_STEPS',
                message: 'User Scenario should define at least one step'
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
exports.UserScenarioComponent = UserScenarioComponent;
//# sourceMappingURL=userScenarios.js.map
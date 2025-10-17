"use strict";
/**
 * Test Scenario Component Object
 * Handles retrieval, saving, and validation of Test Scenario instances
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestScenarioComponent = void 0;
const types_1 = require("../types");
const dakComponentObject_1 = require("../dakComponentObject");
class TestScenarioComponent extends dakComponentObject_1.BaseDAKComponentObject {
    constructor(repository, sourceResolver, stagingGroundService, onSourcesChanged) {
        super(types_1.DAKComponentType.TEST_SCENARIOS, repository, sourceResolver, stagingGroundService, onSourcesChanged);
    }
    /**
     * Determine file path for Test Scenario
     * Test scenarios are typically stored as JSON or FSH files
     */
    async determineFilePath(data) {
        const scenarioData = data;
        const id = scenarioData.id || 'new-test-scenario';
        return `input/tests/${id}.json`;
    }
    /**
     * Serialize Test Scenario to JSON format
     */
    serializeToFile(data) {
        return JSON.stringify(data, null, 2);
    }
    /**
     * Parse Test Scenario from JSON content
     */
    parseFromFile(content) {
        return JSON.parse(content);
    }
    /**
     * Validate Test Scenario instance
     */
    async validate(data) {
        const errors = [];
        const warnings = [];
        const scenarioData = data;
        // Check for ID
        if (!scenarioData.id) {
            warnings.push({
                code: 'MISSING_ID',
                message: 'Test Scenario should have an id'
            });
        }
        // Check for title or name
        if (!scenarioData.title && !scenarioData.name) {
            errors.push({
                code: 'MISSING_TITLE',
                message: 'Test Scenario must have a title or name'
            });
        }
        // Check for test cases
        if (!scenarioData.testCases && !scenarioData.scenarios) {
            warnings.push({
                code: 'NO_TEST_CASES',
                message: 'Test Scenario should contain at least one test case'
            });
        }
        // Check for description
        if (!scenarioData.description) {
            warnings.push({
                code: 'MISSING_DESCRIPTION',
                message: 'Test Scenario should have a description'
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
exports.TestScenarioComponent = TestScenarioComponent;
//# sourceMappingURL=testScenarios.js.map
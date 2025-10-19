"use strict";
/**
 * Program Indicator Component Object
 * Handles retrieval, saving, and validation of Program Indicator instances
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramIndicatorComponent = void 0;
const types_1 = require("../types");
const dakComponentObject_1 = require("../dakComponentObject");
class ProgramIndicatorComponent extends dakComponentObject_1.BaseDAKComponentObject {
    constructor(repository, sourceResolver, stagingGroundService, onSourcesChanged) {
        super(types_1.DAKComponentType.INDICATORS, repository, sourceResolver, stagingGroundService, onSourcesChanged);
    }
    /**
     * Determine file path for Program Indicator
     * Indicators are typically stored as JSON or FSH files
     */
    async determineFilePath(data) {
        const indicatorData = data;
        const id = indicatorData.id || 'new-indicator';
        return `input/indicators/${id}.json`;
    }
    /**
     * Serialize Program Indicator to JSON format
     */
    serializeToFile(data) {
        return JSON.stringify(data, null, 2);
    }
    /**
     * Parse Program Indicator from JSON content
     */
    parseFromFile(content) {
        return JSON.parse(content);
    }
    /**
     * Validate Program Indicator instance
     */
    async validate(data) {
        const errors = [];
        const warnings = [];
        const indicatorData = data;
        // Check for ID
        if (!indicatorData.id) {
            warnings.push({
                code: 'MISSING_ID',
                message: 'Program Indicator should have an id'
            });
        }
        // Check for name or title
        if (!indicatorData.name && !indicatorData.title) {
            errors.push({
                code: 'MISSING_NAME',
                message: 'Program Indicator must have a name or title'
            });
        }
        // Check for description
        if (!indicatorData.description) {
            warnings.push({
                code: 'MISSING_DESCRIPTION',
                message: 'Program Indicator should have a description'
            });
        }
        // Check for numerator/denominator (typical for indicators)
        if (!indicatorData.numerator && !indicatorData.denominator) {
            warnings.push({
                code: 'MISSING_CALCULATION',
                message: 'Program Indicator should define numerator and denominator'
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
exports.ProgramIndicatorComponent = ProgramIndicatorComponent;
//# sourceMappingURL=indicators.js.map
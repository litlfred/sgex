"use strict";
/**
 * Decision Support Logic Component Object
 * Handles retrieval, saving, and validation of Decision Support Logic instances (DMN)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionSupportLogicComponent = void 0;
const types_1 = require("../types");
const dakComponentObject_1 = require("../dakComponentObject");
class DecisionSupportLogicComponent extends dakComponentObject_1.BaseDAKComponentObject {
    constructor(repository, sourceResolver, stagingGroundService, onSourcesChanged) {
        super(types_1.DAKComponentType.DECISION_LOGIC, repository, sourceResolver, stagingGroundService, onSourcesChanged);
    }
    /**
     * Determine file path for Decision Support Logic
     * Decision logic is typically stored as DMN XML files
     */
    async determineFilePath(data) {
        const logicData = data;
        const id = logicData.id || 'new-decision-logic';
        return `input/decision-support/${id}.dmn`;
    }
    /**
     * Serialize Decision Support Logic to DMN XML format
     */
    serializeToFile(data) {
        const logicData = data;
        // If the data already contains DMN XML, return it
        if (logicData.dmnXML) {
            return logicData.dmnXML;
        }
        // Otherwise, create a basic DMN XML structure
        const id = logicData.id || 'Decision_1';
        const name = logicData.name || logicData.title || 'Decision Logic';
        return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" 
             xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" 
             xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
             id="Definitions_${id}" 
             name="${name}" 
             namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="${id}" name="${name}">
    <decisionTable id="DecisionTable_1">
      <input id="Input_1" label="">
        <inputExpression id="InputExpression_1" typeRef="string">
          <text></text>
        </inputExpression>
      </input>
      <output id="Output_1" label="" name="" typeRef="string" />
    </decisionTable>
  </decision>
</definitions>`;
    }
    /**
     * Parse Decision Support Logic from DMN XML content
     */
    parseFromFile(content) {
        // Extract basic information from DMN XML
        const logicData = {
            logic: []
        };
        // Extract decision ID
        const decisionIdMatch = content.match(/decision id="([^"]+)"/);
        if (decisionIdMatch) {
            logicData.id = decisionIdMatch[1];
        }
        // Extract decision name
        const decisionNameMatch = content.match(/decision id="[^"]+" name="([^"]+)"/);
        if (decisionNameMatch) {
            logicData.name = decisionNameMatch[1];
        }
        // Store the complete DMN XML
        logicData.dmnXML = content;
        return logicData;
    }
    /**
     * Validate Decision Support Logic instance
     */
    async validate(data) {
        const errors = [];
        const warnings = [];
        const logicData = data;
        // Check for ID
        if (!logicData.id) {
            warnings.push({
                code: 'MISSING_ID',
                message: 'Decision Support Logic should have an id'
            });
        }
        // Check for DMN XML or name
        if (!logicData.dmnXML && !logicData.name) {
            errors.push({
                code: 'MISSING_CONTENT',
                message: 'Decision Support Logic must have either dmnXML content or a name'
            });
        }
        // If DMN XML exists, validate it's well-formed XML
        if (logicData.dmnXML) {
            try {
                // Basic XML validation - check for opening and closing tags
                if (!logicData.dmnXML.includes('<definitions') ||
                    !logicData.dmnXML.includes('</definitions>')) {
                    errors.push({
                        code: 'INVALID_DMN',
                        message: 'DMN XML appears to be malformed'
                    });
                }
            }
            catch (error) {
                errors.push({
                    code: 'DMN_PARSE_ERROR',
                    message: `Error parsing DMN XML: ${error}`
                });
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            timestamp: new Date()
        };
    }
}
exports.DecisionSupportLogicComponent = DecisionSupportLogicComponent;
//# sourceMappingURL=decisionLogic.js.map
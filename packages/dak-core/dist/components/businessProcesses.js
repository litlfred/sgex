"use strict";
/**
 * Business Process Workflow Component Object
 * Handles retrieval, saving, and validation of Business Process instances (BPMN)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessProcessWorkflowComponent = void 0;
const types_1 = require("../types");
const dakComponentObject_1 = require("../dakComponentObject");
class BusinessProcessWorkflowComponent extends dakComponentObject_1.BaseDAKComponentObject {
    constructor(repository, sourceResolver, stagingGroundService, onSourcesChanged) {
        super(types_1.DAKComponentType.BUSINESS_PROCESSES, repository, sourceResolver, stagingGroundService, onSourcesChanged);
    }
    /**
     * Determine file path for Business Process
     * Business processes are stored as BPMN XML files
     */
    async determineFilePath(data) {
        const processData = data;
        const id = processData.id || 'new-process';
        return `input/process/${id}.bpmn`;
    }
    /**
     * Serialize Business Process to BPMN XML format
     */
    serializeToFile(data) {
        const processData = data;
        // If the data already contains BPMN XML, return it
        if (processData.bpmnXML) {
            return processData.bpmnXML;
        }
        // Otherwise, create a basic BPMN XML structure
        const id = processData.id || 'Process_1';
        const name = processData.name || processData.title || 'Business Process';
        return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   id="Definitions_${id}" 
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${id}" name="${name}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${id}">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
    }
    /**
     * Parse Business Process from BPMN XML content
     */
    parseFromFile(content) {
        // Extract basic information from BPMN XML
        const processData = {
            processes: []
        };
        // Extract process ID
        const processIdMatch = content.match(/process id="([^"]+)"/);
        if (processIdMatch) {
            processData.id = processIdMatch[1];
        }
        // Extract process name
        const processNameMatch = content.match(/process id="[^"]+" name="([^"]+)"/);
        if (processNameMatch) {
            processData.name = processNameMatch[1];
        }
        // Store the complete BPMN XML
        processData.bpmnXML = content;
        return processData;
    }
    /**
     * Validate Business Process instance
     */
    async validate(data) {
        const errors = [];
        const warnings = [];
        const processData = data;
        // Check for ID
        if (!processData.id) {
            warnings.push({
                code: 'MISSING_ID',
                message: 'Business Process should have an id'
            });
        }
        // Check for BPMN XML or name
        if (!processData.bpmnXML && !processData.name) {
            errors.push({
                code: 'MISSING_CONTENT',
                message: 'Business Process must have either bpmnXML content or a name'
            });
        }
        // If BPMN XML exists, validate it's well-formed XML
        if (processData.bpmnXML) {
            try {
                // Basic XML validation - check for opening and closing tags
                if (!processData.bpmnXML.includes('<bpmn:definitions') ||
                    !processData.bpmnXML.includes('</bpmn:definitions>')) {
                    errors.push({
                        code: 'INVALID_BPMN',
                        message: 'BPMN XML appears to be malformed'
                    });
                }
            }
            catch (error) {
                errors.push({
                    code: 'BPMN_PARSE_ERROR',
                    message: `Error parsing BPMN XML: ${error}`
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
exports.BusinessProcessWorkflowComponent = BusinessProcessWorkflowComponent;
//# sourceMappingURL=businessProcesses.js.map
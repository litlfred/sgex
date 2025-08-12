/**
 * DMN-BPMN-CROSS-REFERENCE Validation
 * 
 * DMN tables @id should be associated to a bpmn:businessRuleTask with the same id 
 * in at least one BPMN diagram
 */
export default {
  id: 'dmn-bpmn-cross-reference',
  component: 'decision-support-logic',
  level: 'warning',
  fileTypes: ['dmn', 'xml'],
  descriptionKey: 'validation.dmn.bpmnCrossReference.description',
  description: 'DMN decision @id should be referenced by a BPMN businessRuleTask',
  
  async validate(filePath, content, context) {
    // Only validate DMN files
    if (!filePath.endsWith('.dmn') && !this.isDMNContent(content)) {
      return null;
    }
    
    try {
      // Parse DMN content to extract decision IDs
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return {
          message: `XML parsing error: ${parserError.textContent}`,
          line: 1,
          column: 1,
          suggestion: 'Fix XML syntax errors before validating cross-references'
        };
      }
      
      // Extract all decision IDs from DMN
      const decisions = doc.querySelectorAll('decision, *[localName="decision"]');
      const dmnDecisionIds = [];
      
      decisions.forEach((decision, index) => {
        const id = decision.getAttribute('id');
        if (id && id.trim() !== '') {
          dmnDecisionIds.push({
            id: id.trim(),
            index: index,
            lineNumber: this.findElementLineNumber(content, decision, index)
          });
        }
      });
      
      if (dmnDecisionIds.length === 0) {
        return null; // No decisions to cross-reference
      }
      
      // Get all BPMN files from the DAK context
      const bpmnFiles = this.getBPMNFiles(context);
      const businessRuleTaskIds = new Set();
      
      // Extract all businessRuleTask IDs from BPMN files
      for (const bpmnFile of bpmnFiles) {
        try {
          const bpmnDoc = parser.parseFromString(bpmnFile.content, 'text/xml');
          const businessRuleTasks = bpmnDoc.querySelectorAll('businessRuleTask, *[localName="businessRuleTask"]');
          
          businessRuleTasks.forEach(task => {
            const id = task.getAttribute('id');
            if (id && id.trim() !== '') {
              businessRuleTaskIds.add(id.trim());
            }
          });
        } catch (error) {
          // Skip invalid BPMN files
          console.warn(`Skipping invalid BPMN file ${bpmnFile.path}:`, error.message);
        }
      }
      
      // Check for missing cross-references
      const violations = [];
      
      dmnDecisionIds.forEach(decision => {
        if (!businessRuleTaskIds.has(decision.id)) {
          violations.push({
            message: `Decision "${decision.id}" is not referenced by any BPMN businessRuleTask`,
            line: decision.lineNumber,
            column: 1,
            suggestion: `Create a businessRuleTask with id="${decision.id}" in a BPMN diagram`,
            decisionId: decision.id,
            availableTaskIds: Array.from(businessRuleTaskIds)
          });
        }
      });
      
      if (violations.length > 0) {
        return {
          message: `Found ${violations.length} DMN decision(s) without corresponding BPMN references`,
          violations: violations,
          suggestion: 'Ensure each DMN decision is referenced by a businessRuleTask in at least one BPMN diagram',
          metadata: {
            bpmnFilesChecked: bpmnFiles.length,
            businessRuleTasksFound: businessRuleTaskIds.size
          }
        };
      }
      
      return null; // Valid
      
    } catch (error) {
      return {
        message: `Cross-reference validation error: ${error.message}`,
        line: 1,
        column: 1,
        suggestion: 'Ensure all files are valid XML format'
      };
    }
  },
  
  isDMNContent(content) {
    return content.includes('http://www.omg.org/spec/DMN/') || 
           content.includes('dmn:') ||
           content.includes('<decision');
  },
  
  getBPMNFiles(context) {
    if (!context || !context.dakFiles) {
      return [];
    }
    
    return context.dakFiles.filter(file => 
      file.path.endsWith('.bpmn') || 
      (file.path.endsWith('.xml') && this.isBPMNContent(file.content))
    );
  },
  
  isBPMNContent(content) {
    return content.includes('http://www.omg.org/spec/BPMN/') || 
           content.includes('businessRuleTask') ||
           content.includes('bpmn:');
  },
  
  findElementLineNumber(content, element, index) {
    // Try to find approximate line number by searching for decision elements
    const lines = content.split('\n');
    let foundCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<decision') || lines[i].includes('dmn:decision')) {
        if (foundCount === index) {
          return i + 1;
        }
        foundCount++;
      }
    }
    
    return 1; // Fallback
  },
  
  metadata: {
    standard: 'DMN 1.3 + BPMN 2.0',
    reference: 'https://smart.who.int/ig-starter-kit/authoring_conventions.html',
    severity: 'moderate'
  }
};
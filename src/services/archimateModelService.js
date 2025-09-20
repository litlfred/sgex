/**
 * SGEX ArchiMate Model Service
 * 
 * Converts FHIR Logical Models (parsed from FSH) into ArchiMate Application Layer models
 * for strategic visualization of DAK component relationships and structure.
 * 
 * This service bridges the existing FSH parsing capability from CoreDataDictionaryViewer
 * with ArchiMate visualization using archimate-js.
 */

/**
 * Convert FSH Logical Models to ArchiMate Application Layer model
 * @param {Array} fshLogicalModels - Array of logical models extracted from FSH files
 * @param {Object} dakConcepts - Concepts from DAK.fsh file  
 * @returns {Object} ArchiMate-compatible model structure
 */
export function generateArchimateModel(fshLogicalModels = [], dakConcepts = []) {
  const archimateModel = {
    type: 'ApplicationLayer',
    name: 'FHIR Logical Models Overview',
    description: 'Strategic view of DAK Component 2: Core Data Dictionary logical models and relationships',
    elements: [],
    relationships: [],
    views: []
  };

  // Convert logical models to ArchiMate Application Components
  fshLogicalModels.forEach((logicalModel, index) => {
    const elementId = `lm-${index}`;
    
    // Extract model name from FSH content or path
    const modelName = extractLogicalModelName(logicalModel) || `LogicalModel-${index + 1}`;
    
    const element = {
      id: elementId,
      name: modelName,
      type: 'ApplicationComponent',
      description: extractLogicalModelDescription(logicalModel),
      properties: {
        source: 'FHIR Logical Model',
        fshFile: logicalModel.path || logicalModel.name,
        elementCount: extractElementCount(logicalModel)
      }
    };
    
    archimateModel.elements.push(element);
  });

  // Convert DAK concepts to ArchiMate Data Objects
  dakConcepts.forEach((concept, index) => {
    const elementId = `concept-${index}`;
    
    const element = {
      id: elementId,
      name: concept.display || concept.code || `Concept-${index + 1}`,
      type: 'DataObject', 
      description: concept.definition || 'DAK concept definition',
      properties: {
        source: 'DAK CodeSystem',
        code: concept.code,
        system: 'DAK.CodeSystem'
      }
    };
    
    archimateModel.elements.push(element);
  });

  // Generate relationships between logical models and concepts
  generateModelRelationships(archimateModel);

  // Create a strategic view
  archimateModel.views.push({
    id: 'strategic-overview',
    name: 'Core Data Dictionary Strategic View',
    type: 'ApplicationLayerView',
    elements: archimateModel.elements.map(el => el.id),
    description: 'High-level overview of logical models and concept relationships in the DAK'
  });

  return archimateModel;
}

/**
 * Extract logical model name from FSH content
 * @param {Object} logicalModel - Logical model object with content or path
 * @returns {string} Extracted model name
 */
function extractLogicalModelName(logicalModel) {
  if (!logicalModel) return null;
  
  // Try to extract from content if available
  if (logicalModel.content) {
    const nameMatch = logicalModel.content.match(/Logical:\s*([^\r\n]+)/);
    if (nameMatch) return nameMatch[1].trim();
    
    const titleMatch = logicalModel.content.match(/Title:\s*"([^"]+)"/);
    if (titleMatch) return titleMatch[1];
  }
  
  // Fallback to filename without extension
  if (logicalModel.path) {
    return logicalModel.path.split('/').pop().replace(/\.(fsh|json)$/, '');
  }
  
  if (logicalModel.name) {
    return logicalModel.name.replace(/\.(fsh|json)$/, '');
  }
  
  return null;
}

/**
 * Extract description from logical model
 * @param {Object} logicalModel - Logical model object
 * @returns {string} Description text
 */
function extractLogicalModelDescription(logicalModel) {
  if (!logicalModel?.content) return 'FHIR Logical Model component';
  
  const descMatch = logicalModel.content.match(/Description:\s*"([^"]+)"/);
  if (descMatch) return descMatch[1];
  
  // Look for comments or summary
  const commentMatch = logicalModel.content.match(/\/\/\s*(.+)/);
  if (commentMatch) return commentMatch[1].trim();
  
  return 'FHIR Logical Model defining data structure and constraints';
}

/**
 * Count elements in logical model
 * @param {Object} logicalModel - Logical model object
 * @returns {number} Count of elements/fields
 */
function extractElementCount(logicalModel) {
  if (!logicalModel?.content) return 0;
  
  // Count FSH element definitions (lines starting with *)
  const elementMatches = logicalModel.content.match(/^\s*\*\s+/gm);
  return elementMatches ? elementMatches.length : 0;
}

/**
 * Generate relationships between ArchiMate elements
 * @param {Object} archimateModel - Model to add relationships to
 */
function generateModelRelationships(archimateModel) {
  const logicalModels = archimateModel.elements.filter(el => el.type === 'ApplicationComponent');
  const concepts = archimateModel.elements.filter(el => el.type === 'DataObject');
  
  // Create "uses" relationships between logical models and concepts
  logicalModels.forEach(lm => {
    concepts.forEach(concept => {
      // Simple heuristic: if concept name appears in model name or description
      const searchText = `${lm.name} ${lm.description}`.toLowerCase();
      const conceptName = concept.name.toLowerCase();
      
      if (searchText.includes(conceptName) || conceptName.includes(lm.name.toLowerCase())) {
        archimateModel.relationships.push({
          id: `rel-${lm.id}-${concept.id}`,
          source: lm.id,
          target: concept.id,
          type: 'Association',
          name: 'uses concept'
        });
      }
    });
  });
  
  // Create composition relationships between related logical models
  for (let i = 0; i < logicalModels.length; i++) {
    for (let j = i + 1; j < logicalModels.length; j++) {
      const model1 = logicalModels[i];
      const model2 = logicalModels[j];
      
      // Simple heuristic: models with similar names may be related
      if (haveSimilarNames(model1.name, model2.name)) {
        archimateModel.relationships.push({
          id: `rel-${model1.id}-${model2.id}`,
          source: model1.id,
          target: model2.id,
          type: 'Association',
          name: 'related to'
        });
      }
    }
  }
}

/**
 * Check if two model names are similar (simple heuristic)
 * @param {string} name1 - First model name
 * @param {string} name2 - Second model name  
 * @returns {boolean} True if names are similar
 */
function haveSimilarNames(name1, name2) {
  if (!name1 || !name2) return false;
  
  const normalize = (str) => str.toLowerCase().replace(/[-_\s]/g, '');
  const norm1 = normalize(name1);
  const norm2 = normalize(name2);
  
  // Check for common prefixes or shared keywords
  const words1 = name1.toLowerCase().split(/[-_\s]+/);
  const words2 = name2.toLowerCase().split(/[-_\s]+/);
  
  const commonWords = words1.filter(word => words2.includes(word) && word.length > 2);
  return commonWords.length > 0;
}

/**
 * Enhanced logical model parsing for ArchiMate integration
 * Extends the existing FSH parsing with ArchiMate-specific metadata
 * @param {string} fshContent - FSH file content
 * @returns {Object} Enhanced logical model data
 */
export function parseLogicalModelForArchimate(fshContent) {
  const model = {
    content: fshContent,
    elements: [],
    relationships: [],
    constraints: [],
    metadata: {}
  };
  
  // Extract basic metadata
  const titleMatch = fshContent.match(/Title:\s*"([^"]+)"/);
  const descMatch = fshContent.match(/Description:\s*"([^"]+)"/);
  const logicalMatch = fshContent.match(/Logical:\s*([^\r\n]+)/);
  
  model.metadata = {
    title: titleMatch?.[1],
    description: descMatch?.[1], 
    logical: logicalMatch?.[1]?.trim()
  };
  
  // Parse elements (FSH lines starting with *)
  const lines = fshContent.split('\n');
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Element definition: * elementName 0..1 Type "Description"
    const elementMatch = trimmed.match(/^\*\s+([^\s]+)\s+([^\s]+)\s+([^\s"]+)(?:\s+"([^"]+)")?/);
    if (elementMatch) {
      model.elements.push({
        name: elementMatch[1],
        cardinality: elementMatch[2],
        type: elementMatch[3],
        description: elementMatch[4] || '',
        lineNumber: index + 1
      });
    }
  });
  
  return model;
}

/**
 * ArchiMate Model Service utilities
 */
const ArchimateModelService = {
  generateArchimateModel,
  parseLogicalModelForArchimate,
  extractLogicalModelName,
  extractLogicalModelDescription,
  extractElementCount
};

export default ArchimateModelService;